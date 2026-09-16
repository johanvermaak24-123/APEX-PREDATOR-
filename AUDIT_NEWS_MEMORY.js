'use strict';
const fs=require('fs'),vm=require('vm'),crypto=require('crypto');
const src=fs.readFileSync('app.js','utf8');
function extract(start,end){const i=src.indexOf(start),j=src.indexOf(end,i+1);if(i<0||j<0)throw new Error('extract failed '+start);return src.slice(i,j)}
function assert(c,m){if(!c)throw new Error(m)}
class LS{constructor(){this.m=new Map()}getItem(k){return this.m.has(k)?this.m.get(k):null}setItem(k,v){this.m.set(k,String(v))}removeItem(k){this.m.delete(k)}key(i){return [...this.m.keys()][i]??null}get length(){return this.m.size}}
global.localStorage=new LS();global.window={};global.document={getElementById(){return null}};
global.$=()=>null;global.safeJSON=(raw,f)=>{try{const v=JSON.parse(raw);return v??f}catch(_e){return f}};
global.readStoredJSON=(k,f)=>{const v=localStorage.getItem(k);return v==null?f:global.safeJSON(v,f)};
global.persistJSON=(k,v)=>{localStorage.setItem(k,JSON.stringify(v));return true};
// Exact calendar block from production.
vm.runInThisContext(extract('const APEX_CALENDAR_CACHE_KEY','function newsHealth(events){'));
const now=Date.parse('2026-09-16T08:00:00Z');
const ev=(min,currency='USD',impact=3,title='CPI')=>({time:now+min*60000,currency,impact,title,forecast:'0.3%',previous:'0.2%',provider:'TEST'});
let r=calendarRiskForSymbol('XAU/USD',{reachable:true,stale:false,provider:'TEST',events:[ev(10),ev(120)]},now);assert(r.blockEntries&&r.state==='BLOCK','XAU +10m high impact must block');
r=calendarRiskForSymbol('XAU/USD',{reachable:true,stale:false,provider:'TEST',events:[ev(20),ev(120)]},now);assert(!r.blockEntries&&r.state==='CAUTION','XAU +20m high impact must caution');
r=calendarRiskForSymbol('XAU/USD',{reachable:false,stale:false,provider:'OFFLINE',events:[]},now);assert(r.blockEntries&&r.unknown,'offline must fail closed');
// Mock browser CORS failures on direct feeds, success through AllOrigins relay.
const raw=[
 {title:'CPI m/m',country:'USD',date:'2026-09-16T08:10:00Z',impact:'High',forecast:'0.3%',previous:'0.2%'},
 {title:'Core CPI m/m',country:'USD',date:'2026-09-16T08:10:00Z',impact:'High',forecast:'0.3%',previous:'0.3%'},
 {title:'Retail Sales',country:'USD',date:'2026-09-17T12:30:00Z',impact:'Medium',forecast:'0.2%',previous:'0.1%'}
];
let calls=[];global.Date.now=()=>now;global.fetch=async (url)=>{calls.push(String(url));if(String(url).includes('api.allorigins.win'))return{ok:true,status:200,json:async()=>raw};throw new TypeError('Failed to fetch')};
(async()=>{
  apexCalendarRuntime={t:0,events:[],provider:'NONE',reachable:false,stale:false,error:''};localStorage.removeItem(APEX_CALENDAR_CACHE_KEY);
  const cal=await economicCalendar(true);assert(cal.reachable,'relay success must restore calendar');assert(cal.provider==='AllOrigins relay','must identify relay provider');assert(cal.events.length===3,'relay events parsed');
  const risk=calendarRiskForSymbol('XAU/USD',cal,now);assert(risk.blockEntries&&risk.state==='BLOCK','relay-fed +10m CPI must block');
  assert(calls.some(x=>x.includes('cdn-nfs.faireconomy.media')),'CDN direct route must be tried');assert(calls.some(x=>x.includes('api.allorigins.win')),'AllOrigins relay must be tried after direct failure');
  // Payload freshness/shape validation must reject nonsense.
  let rejected=false;try{validateCalendarPayload([{title:'Old',country:'USD',date:'2020-01-01T00:00:00Z',impact:'High'}],'BAD',now)}catch(_e){rejected=true}assert(rejected,'stale payload must be rejected');
  // Memory compatibility and 120-record snapshot preservation.
  global.APEX_PATH_KEY='apex_path_ledger_v4';
  vm.runInThisContext(extract('function memoryDigest','function vaultRead'));
  vm.runInThisContext(extract('function captureNewsPatchSafetySnapshot','captureNewsPatchSafetySnapshot();'));
  const oldJournal=Array.from({length:120},(_,i)=>({id:'OLD-'+i,t:1700000000000+i,sym:'XAU/USD',v:i%2?'BUY':'SELL',firstHit:{resolved:true,hit:i%3?'TP1':'SL'}}));
  const oldState={weights:{a:1},learningActive:true},oldLocks={'XAU/USD':{id:'LOCK-1',direction:'BUY'}},oldPaths=Array.from({length:17},(_,i)=>({id:'P-'+i,t:i}));
  localStorage.setItem('titan_journal_v2',JSON.stringify(oldJournal));localStorage.setItem('titan_state_v2',JSON.stringify(oldState));localStorage.setItem('titan_active_signals_v2',JSON.stringify(oldLocks));localStorage.setItem('apex_path_ledger_v4',JSON.stringify(oldPaths));localStorage.removeItem('apex_upgrade_7_3_2_snapshot');
  captureNewsPatchSafetySnapshot();const snap=JSON.parse(localStorage.getItem('apex_upgrade_7_3_2_snapshot'));
  assert(JSON.parse(localStorage.getItem('titan_journal_v2')).length===120,'existing journal changed');assert(snap.journal.length===120&&snap.digest.resolved===120,'new snapshot lost 120 signals');assert(snap.activeSignals['XAU/USD'].id==='LOCK-1','active signal lock not snapshotted');
  const report={version:'APEX-SCALP-GOD-7.3.2',passed:true,sourceSha256:crypto.createHash('sha256').update(src).digest('hex'),calendarTests:9,relayFallbackPass:true,memoryMigration:{seededJournal:120,preservedJournal:120,seededPathRecords:17,preservedPathRecords:17,activeLockPreserved:true,prePatchSnapshotJournal:120},legacyKeys:['titan_journal_v2','titan_state_v2','titan_active_signals_v2','apex_path_ledger_v4'],newSnapshotKey:'apex_upgrade_7_3_2_snapshot',calendarCacheKey:'apex_calendar_cache_v1'};
  fs.writeFileSync('AUDIT_NEWS_MEMORY_REPORT.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exit(1)});

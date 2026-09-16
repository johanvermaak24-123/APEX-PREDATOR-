'use strict';
const fs=require('fs'),vm=require('vm'),crypto=require('crypto');
const src=fs.readFileSync('app.js','utf8');
function extract(start,end){const i=src.indexOf(start),j=src.indexOf(end,i+1);if(i<0||j<0)throw new Error('extract failed '+start);return src.slice(i,j)}
function assert(c,m){if(!c)throw new Error(m)}
// Exact calendar risk functions from production source.
vm.runInThisContext(extract('function calendarCurrenciesForSymbol','function renderCalendarRisk'));
const now=Date.parse('2026-09-16T08:00:00Z');
const ev=(min,currency='USD',impact=3,title='CPI')=>({time:now+min*60000,currency,impact,title,forecast:'0.3%',previous:'0.2%',provider:'TEST'});
let r=calendarRiskForSymbol('XAU/USD',{reachable:true,stale:false,provider:'TEST',events:[ev(10)]},now);assert(r.blockEntries&&r.state==='BLOCK','XAU +10m high impact must block');
r=calendarRiskForSymbol('XAU/USD',{reachable:true,stale:false,provider:'TEST',events:[ev(20)]},now);assert(!r.blockEntries&&r.state==='CAUTION','XAU +20m high impact must caution');
r=calendarRiskForSymbol('XAU/USD',{reachable:true,stale:false,provider:'TEST',events:[ev(45)]},now);assert(!r.blockEntries&&r.state==='WATCH','XAU +45m high impact must watch');
r=calendarRiskForSymbol('XAU/USD',{reachable:true,stale:false,provider:'TEST',events:[ev(-10)]},now);assert(r.blockEntries&&r.state==='COOLDOWN','XAU -10m high impact must remain blocked');
r=calendarRiskForSymbol('XAU/USD',{reachable:true,stale:false,provider:'TEST',events:[ev(90)]},now);assert(!r.blockEntries&&r.state==='UPCOMING','XAU +90m high impact must be upcoming');
r=calendarRiskForSymbol('XAU/USD',{reachable:false,stale:false,provider:'OFFLINE',events:[]},now);assert(r.blockEntries&&r.unknown&&r.state==='UNKNOWN','offline calendar must fail closed');
r=calendarRiskForSymbol('EUR/USD',{reachable:true,stale:false,provider:'TEST',events:[ev(8,'EUR',3,'ECB Decision')]},now);assert(r.blockEntries,'EUR/USD must react to EUR high impact');
r=calendarRiskForSymbol('XAU/USD',{reachable:true,stale:false,provider:'TEST',events:[ev(8,'GBP',3,'BoE Decision')]},now);assert(!r.blockEntries,'XAU should ignore unrelated GBP-only scheduled event');

// Memory compatibility/static preservation checks.
const legacyKeys=['titan_journal_v2','titan_state_v2','titan_active_signals_v2','apex_path_ledger_v4'];
for(const k of legacyKeys)assert(src.includes(k),'missing legacy key '+k);
for(const k of legacyKeys)assert(!src.includes(`removeStored("${k}")`)&&!src.includes(`localStorage.removeItem("${k}")`),'legacy key can be removed '+k);
assert(src.includes('apex_upgrade_7_3_1_snapshot'),'pre-patch snapshot key missing');
assert(src.includes('version:"PRE-7.3.1-NEWS-RADAR"'),'pre-patch snapshot version missing');
assert(src.includes('const APEX_CALENDAR_CACHE_KEY="apex_calendar_cache_v1"'),'calendar cache must be additive');

// Execute the exact pre-patch snapshot function against 120 existing records.
class LS{constructor(){this.m=new Map()}getItem(k){return this.m.has(k)?this.m.get(k):null}setItem(k,v){this.m.set(k,String(v))}removeItem(k){this.m.delete(k)}key(i){return [...this.m.keys()][i]??null}get length(){return this.m.size}}
global.localStorage=new LS();global.window={};
vm.runInThisContext(extract('function safeJSON','const APEX_TRIGGER_FRESH_MAX_MS'));
global.APEX_PATH_KEY='apex_path_ledger_v4';
vm.runInThisContext(extract('function memoryDigest','function vaultRead'));
vm.runInThisContext(extract('function captureNewsPatchSafetySnapshot','captureNewsPatchSafetySnapshot();'));
const oldJournal=Array.from({length:120},(_,i)=>({id:'OLD-'+i,t:1700000000000+i,sym:'XAU/USD',v:i%2?'BUY':'SELL',firstHit:{resolved:true,hit:i%3?'TP1':'SL'}}));
const oldState={weights:{a:1},learningActive:true};const oldLocks={'XAU/USD':{id:'LOCK-1',direction:'BUY'}};const oldPaths=Array.from({length:17},(_,i)=>({id:'P-'+i,t:i}));
localStorage.setItem('titan_journal_v2',JSON.stringify(oldJournal));localStorage.setItem('titan_state_v2',JSON.stringify(oldState));localStorage.setItem('titan_active_signals_v2',JSON.stringify(oldLocks));localStorage.setItem('apex_path_ledger_v4',JSON.stringify(oldPaths));
captureNewsPatchSafetySnapshot();
const snap=JSON.parse(localStorage.getItem('apex_upgrade_7_3_1_snapshot'));
assert(JSON.parse(localStorage.getItem('titan_journal_v2')).length===120,'existing journal changed during snapshot');
assert(JSON.parse(localStorage.getItem('titan_active_signals_v2'))['XAU/USD'].id==='LOCK-1','existing lock changed during snapshot');
assert(JSON.parse(localStorage.getItem('apex_path_ledger_v4')).length===17,'existing path ledger changed during snapshot');
assert(snap.journal.length===120&&snap.digest.resolved===120&&snap.activeSignals['XAU/USD'].id==='LOCK-1','pre-patch snapshot did not capture 120 records');
const report={version:'APEX-SCALP-GOD-7.3.1',passed:true,sourceSha256:crypto.createHash('sha256').update(src).digest('hex'),calendarTests:8,memoryMigration:{seededJournal:120,preservedJournal:120,seededPathRecords:17,preservedPathRecords:17,activeLockPreserved:true,prePatchSnapshotJournal:120},legacyKeys,newAdditiveKey:'apex_calendar_cache_v1'};
fs.writeFileSync('AUDIT_NEWS_MEMORY_REPORT.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));

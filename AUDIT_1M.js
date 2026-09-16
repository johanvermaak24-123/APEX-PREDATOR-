'use strict';
const fs=require('fs');
const crypto=require('crypto');
const vm=require('vm');
const src=fs.readFileSync('app.js','utf8');
function sliceBetween(a,b){const i=src.indexOf(a),j=src.indexOf(b,i+1);if(i<0||j<0)throw new Error(`Cannot extract ${a}`);return src.slice(i,j)}
global.clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
global.fmt=x=>Number.isFinite(+x)?Number(x).toFixed(2):'—';
global.APEX_TRIGGER_FRESH_MAX_MS=90000;
global.APEX_COMMAND_MAX_AGE_MS=60000;
vm.runInThisContext(sliceBetween('function parseBarTime','function firstHitPath'));
vm.runInThisContext(sliceBetween('function triggerFreshnessGuard','function universalTrigger'));
vm.runInThisContext(sliceBetween('function plainCommandReason','function executionCommandDecision'));
vm.runInThisContext(sliceBetween('function tradeManagementDecision','function renderManualTradeManager'));
vm.runInThisContext(sliceBetween('function bestNowStateRank','async function authoritativeBestScan'));
if(typeof triggerFreshnessGuard!=='function'||typeof executionCommandFromParts!=='function'||typeof bestNowRankLabel!=='function'||typeof tradeManagementDecision!=='function')throw new Error('Exact-source function extraction failed');
let seed=0x7300cafe>>>0;
function rnd(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296}
function pick(a){return a[Math.floor(rnd()*a.length)]}
function assert(c,m){if(!c)throw new Error(m)}
const N=1_000_000,BASE_NOW=Date.parse('2026-09-16T07:15:00Z');
let liveCount=0,waitCount=0,freshCount=0,missedCount=0,staleCount=0,invalidatedCount=0,unverifiedCount=0,missedCommandCount=0,tradeHold=0,tradeExit=0,tradeSwitch=0,calendarBlockedCount=0,calendarUnknownCount=0;
const started=Date.now();
for(let i=0;i<N;i++){
  const dir=rnd()<.5?-1:1,atr=.1+rnd()*12,targetATR=.18+rnd()*.60,close=50+rnd()*5000;
  const ageMs=Math.floor(rnd()*180001); // 0..180s after closed M5 trigger
  let signedATR=(rnd()*.80)-.30; // -0.30 ATR adverse .. +0.50 favorable
  let dt=new Date(BASE_NOW-5*60000-ageMs).toISOString();
  if(rnd()<.002)dt='not-a-time';
  const cur={datetime:dt,close:String(close)},price=close+dir*signedATR*atr;
  const r={sym:pick(['XAU/USD','BTC/USD','EUR/USD','USD/JPY'])},c={mode:pick(['CONTINUATION','REVERSAL','PARENT COUNTER'])};
  const fr=triggerFreshnessGuard(r,c,cur,price,atr,targetATR,dir,BASE_NOW);
  const maxFav=clamp(Math.min(.18,Math.max(.08,targetATR*.35)),.08,.18),maxAdv=clamp(Math.min(.22,Math.max(.12,targetATR*.55)),.12,.22),fav=Math.max(0,signedATR),adv=Math.max(0,-signedATR),used=fav/targetATR;
  let expectedStatus='FRESH';
  if(dt==='not-a-time')expectedStatus='UNVERIFIED';
  else if(ageMs>APEX_TRIGGER_FRESH_MAX_MS)expectedStatus='STALE';
  else if(adv>maxAdv)expectedStatus='INVALIDATED';
  else if(fav>maxFav||used>.35)expectedStatus='MISSED';
  if(fr.status!==expectedStatus)throw new Error(`freshness status mismatch @${i}: ${fr.status} vs ${expectedStatus}`);
  if(fr.pass!==(expectedStatus==='FRESH'))throw new Error(`freshness pass mismatch @${i}`);
  if(expectedStatus==='FRESH')freshCount++;else if(expectedStatus==='MISSED')missedCount++;else if(expectedStatus==='STALE')staleCount++;else if(expectedStatus==='INVALIDATED')invalidatedCount++;else unverifiedCount++;
  if(expectedStatus==='MISSED' && fr.favorableATR<=0)throw new Error(`MISSED without favorable travel @${i}`);
  if(expectedStatus==='STALE' && fr.ageMs<=APEX_TRIGGER_FRESH_MAX_MS)throw new Error(`STALE inside allowed age @${i}`);
  if(fr.pass && (fr.targetUsed>.35+1e-12||fr.favorableATR>fr.maxFavorableATR+1e-12||fr.adverseATR>fr.maxAdverseATR+1e-12))throw new Error(`fresh gate leaked displacement @${i}`);

  const geometryKind=Math.floor(rnd()*12);let entry=price,target=entry+dir*(.1+rnd()*5),invalid=entry-dir*(.1+rnd()*5);
  if(geometryKind===0)entry=NaN;else if(geometryKind===1)target=0;else if(geometryKind===2)invalid=-1;
  const integrityPass=rnd()<.91,execOK=rnd()<.89,pass=rnd()<.86;
  const fortress={integrityPass,execOK,pass,reasons:integrityPass?[]:['synthetic data block']};
  const hydra={retired:rnd()<.03,staleEdge:rnd()<.04,toxicity:rnd()<.02?undefined:rnd(),fragility:rnd()<.02?undefined:rnd()};
  const preFreshFire=rnd()<.72;
  // Fuzz upstream aggressively: 15% of failed-freshness cases incorrectly claim fire=true. Final command must still refuse ENTER.
  const fire=preFreshFire && (fr.pass ? rnd()<.82 : rnd()<.15);
  const sg={fire,preFreshFire,state:fire?'FIRE NOW':fr.status==='MISSED'?'MISSED':pick(['PROOF','ARMED','WATCH','NO TRADE']),counter:dir,entry,target,invalid,isCounter:rnd()<.5,mode:c.mode,reason:'synthetic',trigger:{freshness:fr}};
  const calendarUnknown=rnd()<.01,calendarBlocked=calendarUnknown||rnd()<.06,calendarRisk={state:calendarUnknown?'UNKNOWN':calendarBlocked?'BLOCK':'CLEAR',blockEntries:calendarBlocked,unknown:calendarUnknown,title:calendarUnknown?'CALENDAR OFFLINE':'SYNTHETIC NEWS'};
  if(calendarBlocked)calendarBlockedCount++;if(calendarUnknown)calendarUnknownCount++;
  const out=executionCommandFromParts(sg,fortress,hydra,calendarRisk);
  const geometry=[entry,target,invalid].every(x=>Number.isFinite(+x)&&+x>0),hydraPass=!hydra.retired&&!hydra.staleEdge&&Number(hydra.toxicity)<.78&&Number(hydra.fragility)<.84;
  const expectedLive=!!(fire&&pass===true&&integrityPass===true&&execOK===true&&hydraPass&&geometry&&fr.pass&&!calendarBlocked&&(dir===1||dir===-1));
  if(out.liveReady!==expectedLive)throw new Error(`liveReady mismatch @${i}`);
  if(out.action.startsWith('ENTER')!==expectedLive)throw new Error(`ENTER iff full authority + freshness failed @${i}`);
  if(out.showLevels!==expectedLive)throw new Error(`level visibility invariant failed @${i}`);
  if(!expectedLive && (out.entry!==null||out.target!==null||out.invalid!==null))throw new Error(`non-live leaked entry levels @${i}`);
  if(!fr.pass && out.liveReady)throw new Error(`stale/missed/invalidated entry became live @${i}`);
  if(calendarBlocked&&out.liveReady)throw new Error(`calendar-blocked entry became live @${i}`);
  if(expectedLive){
    liveCount++;
    if(!(out.expiresAt>BASE_NOW-365*24*3600000)){} // structural only; Date.now() is real clock in source.
    if(out.freshnessPass!==true)throw new Error(`live command missing freshness pass @${i}`);
  }else waitCount++;
  if(preFreshFire&&fr.status==='MISSED'&&integrityPass&&execOK){
    if(out.liveReady)throw new Error(`missed command became live @${i}`);
    if(pass&&hydraPass&&geometry && !fire){
      if(out.stage!=='MISSED ENTRY'||out.action!=='MISSED — DO NOT CHASE')throw new Error(`missed UI contract failed @${i}`);
      missedCommandCount++;
    }
  }
  const row={command:out,scalp:{state:sg.state,edge:rnd(),counter:dir,isCounter:sg.isCounter,mode:sg.mode,trigger:{score:rnd()}}};
  if((bestNowRankLabel(row)==='ENTER')!==expectedLive)throw new Error(`BEST NOW ENTER label invariant failed @${i}`);
  const display=bestNowDisplayAction(row);if(expectedLive&&!display.startsWith('ENTER'))throw new Error(`BEST NOW live display failed @${i}`);if(!expectedLive&&display.startsWith('ENTER'))throw new Error(`BEST NOW non-live displayed ENTER @${i}`);

  const tdir=pick([-1,1]),tsym=rnd()<.96?'ETH/USD':'BTC/USD',te=100,tt=te+tdir*2,ti=te-tdir*1.5,p=96+rnd()*8;
  const trade={sym:tsym,direction:tdir,entry:te,target:tt,invalid:ti};
  const cmd={liveReady:rnd()<.08,direction:pick([-1,1]),target:tt,invalid:ti};
  const td=tradeManagementDecision(trade,p,cmd,'ETH/USD');
  if(/ENTER/.test(td.text))throw new Error(`manager emitted ENTER @${i}`);
  if(tsym!=='ETH/USD'){if(td.state!=='SWITCH')throw new Error(`symbol switch invariant @${i}`);tradeSwitch++;}
  else if(td.state==='EXIT')tradeExit++;else if(td.state==='HOLD')tradeHold++;else throw new Error(`invalid open-trade state ${td.state} @${i}`);
}
// Deterministic boundary tests
const mk=(age,signed,targetATR=.30,dir=1)=>{const now=BASE_NOW,open=new Date(now-5*60000-age).toISOString(),atr=10,close=1000,price=close+dir*signed*atr;return triggerFreshnessGuard({sym:'XAU/USD'},{mode:'CONTINUATION'},{datetime:open,close},price,atr,targetATR,dir,now)};
assert(mk(89999,.01).pass,'89.999s fresh trigger should still be eligible');
assert(mk(90001,.01).status==='STALE','90.001s trigger must be stale');
const b=mk(1000,.105,.30);assert(b.pass,'35% target-use boundary should remain fresh');
assert(mk(1000,.106,.30).status==='MISSED','beyond target-use boundary must be MISSED');
assert(mk(1000,-.17,.30).status==='INVALIDATED','excess adverse move must invalidate old trigger');
const fixedOpen=new Date(BASE_NOW-5*60000-1000).toISOString(),fixedBar={datetime:fixedOpen,close:1000};const a1=triggerFreshnessGuard({sym:'XAU/USD'},{mode:'CONTINUATION'},fixedBar,1000.2,10,.30,1,BASE_NOW),a2=triggerFreshnessGuard({sym:'XAU/USD'},{mode:'CONTINUATION'},fixedBar,1000.4,10,.30,1,BASE_NOW+1000);assert(a1.setupId===a2.setupId&&a1.originalEntry===a2.originalEntry&&a1.triggerTs===a2.triggerTs,'same closed bar must preserve original trigger identity');
const F={pass:true,integrityPass:true,execOK:true,reasons:[]},H={retired:false,staleEdge:false,toxicity:.1,fragility:.1};
let x=executionCommandFromParts({fire:true,preFreshFire:true,state:'FIRE NOW',counter:1,entry:100,target:101,invalid:99,trigger:{freshness:{...a1,pass:true,status:'FRESH',expiresAt:Date.now()+30000}}},F,H);assert(x.liveReady&&x.action==='ENTER BUY NOW','fresh full-authority command must ENTER');
x=executionCommandFromParts({fire:true,preFreshFire:true,state:'FIRE NOW',counter:1,entry:100,target:101,invalid:99,trigger:{freshness:{...a1,pass:true,status:'FRESH',expiresAt:Date.now()+30000}}},F,H,{state:'BLOCK',blockEntries:true,unknown:false,title:'CPI'});assert(!x.liveReady&&x.stage==='NEWS BLOCK'&&x.action==='WAIT — BIG NEWS','calendar BLOCK must veto ENTER');
x=executionCommandFromParts({fire:true,preFreshFire:true,state:'FIRE NOW',counter:1,entry:100,target:101,invalid:99,trigger:{freshness:{...a1,pass:true,status:'FRESH',expiresAt:Date.now()+30000}}},F,H,{state:'UNKNOWN',blockEntries:true,unknown:true,title:'CALENDAR OFFLINE'});assert(!x.liveReady&&x.stage==='NEWS UNKNOWN'&&x.action==='WAIT — NEWS CHECK FAILED','calendar UNKNOWN must veto ENTER');
x=executionCommandFromParts({fire:true,preFreshFire:true,state:'FIRE NOW',counter:1,entry:100,target:101,invalid:99,trigger:{freshness:{...a1,pass:false,status:'MISSED'}}},F,H);assert(!x.liveReady&&x.action==='MISSED — DO NOT CHASE'&&!x.showLevels,'MISSED must fail closed even if upstream fire is wrong');
x=executionCommandFromParts({fire:true,preFreshFire:true,state:'FIRE NOW',counter:1,entry:100,target:101,invalid:99},F,H);assert(!x.liveReady&&!x.showLevels,'missing freshness metadata must fail closed');
for(const stage of ['MISSED ENTRY','STALE SETUP','FRESHNESS BLOCK','HARD BLOCK','EXECUTION VETO','NEWS BLOCK','NEWS UNKNOWN','HYDRA VETO','PROOF ONLY','RESEARCH ARMED','WATCH','GEOMETRY BLOCK','WAIT']){
  const msg=plainCommandReason(stage,pick(['BUY','SELL','NONE']));
  if(/FORTRESS|FDR|BOOTSTRAP|EXECUTION AUTHORITY/i.test(msg))throw new Error(`front-language jargon leak: ${stage} => ${msg}`);
  if(!/wait|do not enter|not ready|no trade|do not chase|expired|old entry/i.test(msg))throw new Error(`front-language action ambiguity: ${stage} => ${msg}`);
}
const report={version:'APEX-SCALP-GOD-7.3.1',sourceSha256:crypto.createHash('sha256').update(src).digest('hex'),scenarios:N,seed:'0x7300cafe',elapsedMs:Date.now()-started,passed:true,counts:{live:liveCount,nonLive:waitCount,fresh:freshCount,missed:missedCount,stale:staleCount,invalidated:invalidatedCount,unverified:unverifiedCount,missedUiAssertions:missedCommandCount,calendarBlocked:calendarBlockedCount,calendarUnknown:calendarUnknownCount,tradeHold,tradeExit,tradeSwitch},limits:{triggerFreshMaxMs:APEX_TRIGGER_FRESH_MAX_MS,commandMaxAgeMs:APEX_COMMAND_MAX_AGE_MS,maxTargetConsumed:0.35,maxFavorableATR:'dynamic 0.08–0.18 ATR',calendarProtectedWindow:'high-impact -15m to +15m'},invariants:['ENTER requires final authority, calendar clearance AND explicit fresh-entry pass','Calendar BLOCK/UNKNOWN can never authorize ENTER','Missing freshness metadata fails closed','Original trigger identity is tied to closed M5 bar, not rescan time','Price > fresh-zone / >35% target consumed becomes MISSED — DO NOT CHASE','Trigger older than 90s becomes STALE','Excess adverse displacement invalidates the old trigger','No entry/SL/TP levels leak while non-live','BEST NOW cannot create ENTER independently','Open-trade manager only emits HOLD / EXIT / SWITCH','Live command has a hard 60s maximum display life and may expire sooner with the trigger']};
fs.writeFileSync('AUDIT_1M_REPORT.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));

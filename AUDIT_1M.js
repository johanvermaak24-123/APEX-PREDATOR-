'use strict';
const fs=require('fs');
const crypto=require('crypto');
const vm=require('vm');
const src=fs.readFileSync('app.js','utf8');
function sliceBetween(a,b){const i=src.indexOf(a),j=src.indexOf(b,i+1);if(i<0||j<0)throw new Error(`Cannot extract ${a}`);return src.slice(i,j)}
global.fmt=x=>Number.isFinite(+x)?Number(x).toFixed(2):'—';
vm.runInThisContext(sliceBetween('function plainCommandReason','function executionCommandDecision'));
vm.runInThisContext(sliceBetween('function tradeManagementDecision','function renderManualTradeManager'));
vm.runInThisContext(sliceBetween('function bestNowStateRank','async function authoritativeBestScan'));
if(typeof executionCommandFromParts!=='function'||typeof bestNowRankLabel!=='function'||typeof tradeManagementDecision!=='function')throw new Error('Exact-source function extraction failed');
let seed=0x7200cafe>>>0;
function rnd(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296}
function pick(a){return a[Math.floor(rnd()*a.length)]}
const N=1_000_000;
let liveCount=0,waitCount=0,tradeHold=0,tradeExit=0,tradeSwitch=0;
const started=Date.now();
for(let i=0;i<N;i++){
  const fire=rnd()<.36,state=pick(['FIRE NOW','PROOF','ARMED','WATCH','NO TRADE']),counter=pick([-1,1,0]);
  const gKind=Math.floor(rnd()*6);let entry=100+rnd()*100,target=entry+(counter||1)*(0.1+rnd()*5),invalid=entry-(counter||1)*(0.1+rnd()*5);
  if(gKind===0)entry=NaN;else if(gKind===1)target=0;else if(gKind===2)invalid=-1;
  const integrityPass=rnd()<.82,execOK=rnd()<.78,pass=rnd()<.72;
  const fortress={integrityPass,execOK,pass,reasons:integrityPass?[]:['synthetic data block']};
  const hydra={retired:rnd()<.06,staleEdge:rnd()<.08,toxicity:rnd()<.04?undefined:rnd()*1.05,fragility:rnd()<.04?undefined:rnd()*1.05};
  const sg={fire,state,counter,entry,target,invalid,isCounter:rnd()<.5,mode:pick(['CONTINUATION','REVERSAL','PARENT COUNTER']),reason:'synthetic'};
  const out=executionCommandFromParts(sg,fortress,hydra);
  const geometry=[entry,target,invalid].every(x=>Number.isFinite(+x)&&+x>0),hydraPass=!hydra.retired&&!hydra.staleEdge&&Number(hydra.toxicity)<.78&&Number(hydra.fragility)<.84,dir=Math.sign(Number(counter)||0);
  const expected=!!(fire&&pass===true&&integrityPass===true&&execOK===true&&hydraPass&&geometry&&(dir===1||dir===-1));
  if(out.liveReady!==expected)throw new Error(`liveReady mismatch @${i}`);
  if(out.action.startsWith('ENTER')!==expected)throw new Error(`ENTER iff authority invariant failed @${i}`);
  if(!expected && out.action!=='WAIT — DO NOT ENTER')throw new Error(`non-live action ambiguity @${i}`);
  if(out.showLevels!==expected)throw new Error(`level visibility invariant failed @${i}`);
  if(!expected && (out.entry!==null||out.target!==null||out.invalid!==null))throw new Error(`research leaked live levels @${i}`);
  expected?liveCount++:waitCount++;
  const row={command:out,scalp:{state,edge:rnd(),counter,isCounter:sg.isCounter,mode:sg.mode,trigger:{score:rnd()}}};
  if((bestNowRankLabel(row)==='ENTER')!==expected)throw new Error(`BEST NOW ENTER label invariant failed @${i}`);
  const display=bestNowDisplayAction(row);if(expected?!display.startsWith('ENTER'):!display.startsWith('WAIT'))throw new Error(`BEST NOW display invariant failed @${i}`);
  // Trade-manager fuzz: an open trade may only emit HOLD / EXIT / SWITCH; never ENTER.
  const tdir=pick([-1,1]),tsym=rnd()<.96?'ETH/USD':'BTC/USD',te=100,tt=te+tdir*2,ti=te-tdir*1.5,p=96+rnd()*8;
  const trade={sym:tsym,direction:tdir,entry:te,target:tt,invalid:ti};
  const cmd={liveReady:rnd()<.08,direction:pick([-1,1]),target:tt,invalid:ti};
  const td=tradeManagementDecision(trade,p,cmd,'ETH/USD');
  if(/ENTER/.test(td.text))throw new Error(`manager emitted ENTER @${i}`);
  if(tsym!=='ETH/USD'){if(td.state!=='SWITCH')throw new Error(`symbol switch invariant @${i}`);tradeSwitch++;}
  else if(td.state==='EXIT')tradeExit++;else if(td.state==='HOLD')tradeHold++;else throw new Error(`invalid open-trade state ${td.state} @${i}`);
}
function assert(c,m){if(!c)throw new Error(m)}
const H={retired:false,staleEdge:false,toxicity:.1,fragility:.1},F={pass:true,integrityPass:true,execOK:true,reasons:[]};
let x=executionCommandFromParts({fire:false,state:'PROOF',counter:1,entry:100,target:101,invalid:99},F,H);assert(x.action==='WAIT — DO NOT ENTER'&&!x.showLevels,'PROOF-only must WAIT');
x=executionCommandFromParts({fire:true,state:'FIRE NOW',counter:-1,entry:100,target:99,invalid:101},F,H);assert(x.liveReady&&x.action==='ENTER SELL NOW','full authority must ENTER SELL');
let td=tradeManagementDecision({sym:'ETH/USD',direction:1,entry:100,target:102,invalid:98},102.1,{liveReady:false,direction:0},'ETH/USD');assert(td.state==='EXIT'&&td.text.includes('TARGET'),'BUY target must exit');
td=tradeManagementDecision({sym:'ETH/USD',direction:-1,entry:100,target:98,invalid:102},102.1,{liveReady:false,direction:0},'ETH/USD');assert(td.state==='EXIT'&&td.text.includes('STOP LOSS'),'SELL invalidation must exit');
td=tradeManagementDecision({sym:'ETH/USD',direction:1,entry:100,target:102,invalid:98},100.5,{liveReady:true,direction:-1},'ETH/USD');assert(td.state==='EXIT'&&td.text.includes('DIRECTION CHANGED'),'opposite authority must exit');

// Plain-language UI contract: hidden engine terminology must never leak into the front reason.
for(const stage of ['HARD BLOCK','EXECUTION VETO','HYDRA VETO','PROOF ONLY','RESEARCH ARMED','WATCH','GEOMETRY BLOCK','WAIT']){
  const msg=plainCommandReason(stage,pick(['BUY','SELL','NONE']));
  if(/VETO|HYDRA|FORTRESS|PROOF|FDR|BOOTSTRAP|EXECUTION AUTHORITY/i.test(msg))throw new Error(`front-language jargon leak: ${stage} => ${msg}`);
  if(!/wait|do not enter|not ready|no trade/i.test(msg))throw new Error(`front-language action ambiguity: ${stage} => ${msg}`);
}
// Consumer-mode contract: WAIT copy must never imply a trade is approved or expose internal authority jargon.
for(const stage of ['HARD BLOCK','EXECUTION VETO','HYDRA VETO','PROOF ONLY','RESEARCH ARMED','WATCH','GEOMETRY BLOCK','WAIT']){
 const msg=plainCommandReason(stage,'NONE');
 if(/ENTER NOW|LIVE ENTRY|EXECUTION VETO|HYDRA|FORTRESS|FDR|BOOTSTRAP/i.test(msg))throw new Error(`consumer WAIT leak: ${stage} => ${msg}`);
}
const report={version:'APEX-SCALP-GOD-7.2.0',sourceSha256:crypto.createHash('sha256').update(src).digest('hex'),scenarios:N,seed:'0x7200cafe',elapsedMs:Date.now()-started,passed:true,liveCount,waitCount,tradeHold,tradeExit,tradeSwitch,invariants:['ENTER iff final execution authority is complete','Every non-live new-trade command is WAIT — DO NOT ENTER','No entry/SL/TP levels leak while WAIT','BEST NOW cannot create ENTER independently','Open trade manager only emits HOLD / EXIT / SWITCH','Target, stop-loss and opposite live direction force EXIT']};
fs.writeFileSync('AUDIT_1M_REPORT.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));

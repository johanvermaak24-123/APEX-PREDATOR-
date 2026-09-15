'use strict';
const fs=require('fs');
const crypto=require('crypto');
const vm=require('vm');
const src=fs.readFileSync('app.js','utf8');
function sliceBetween(a,b){const i=src.indexOf(a),j=src.indexOf(b,i+1);if(i<0||j<0)throw new Error(`Cannot extract ${a}`);return src.slice(i,j)}
vm.runInThisContext(sliceBetween('function executionCommandFromParts','function executionCommandDecision'));
vm.runInThisContext(sliceBetween('function bestNowStateRank','async function authoritativeBestScan'));
if(typeof executionCommandFromParts!=='function'||typeof bestNowRankLabel!=='function')throw new Error('Exact-source function extraction failed');
let seed=0x69c0ffee>>>0;
function rnd(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296}
function pick(a){return a[Math.floor(rnd()*a.length)]}
const N=1_000_000;
let liveCount=0,waitCount=0,invalidGeom=0,hydraVeto=0,costVeto=0,dataVeto=0,proofCases=0;
const started=Date.now();
for(let i=0;i<N;i++){
  const fire=rnd()<.36;
  const state=pick(['FIRE NOW','PROOF','ARMED','WATCH','NO TRADE']);
  const counter=pick([-1,1,0]);
  const gKind=Math.floor(rnd()*6);
  let entry=100+rnd()*100,target=entry+(counter||1)*(0.1+rnd()*5),invalid=entry-(counter||1)*(0.1+rnd()*5);
  if(gKind===0)entry=NaN;else if(gKind===1)target=0;else if(gKind===2)invalid=-1;
  const integrityPass=rnd()<.82,execOK=rnd()<.78,pass=rnd()<.72;
  const fortress={integrityPass,execOK,pass,reasons:integrityPass?[]:['synthetic data block']};
  const hydra={retired:rnd()<.06,staleEdge:rnd()<.08,toxicity:rnd()<.04?undefined:rnd()*1.05,fragility:rnd()<.04?undefined:rnd()*1.05};
  const sg={fire,state,counter,entry,target,invalid,isCounter:rnd()<.5,mode:pick(['CONTINUATION','REVERSAL','PARENT COUNTER']),reason:'synthetic'};
  const out=executionCommandFromParts(sg,fortress,hydra);
  const geometry=[entry,target,invalid].every(x=>Number.isFinite(+x)&&+x>0);
  const hydraPass=!hydra.retired&&!hydra.staleEdge&&Number(hydra.toxicity)<.78&&Number(hydra.fragility)<.84;
  const dir=Math.sign(Number(counter)||0);
  const expected=!!(fire&&pass===true&&integrityPass===true&&execOK===true&&hydraPass&&geometry&&(dir===1||dir===-1));
  if(out.liveReady!==expected)throw new Error(`liveReady mismatch @${i}`);
  if(out.action.startsWith('ENTER')!==expected)throw new Error(`ENTER iff authority invariant failed @${i}`);
  if(!expected && out.action!=='WAIT — NO LIVE TRADE')throw new Error(`non-live action ambiguity @${i}: ${out.action}`);
  if(out.showLevels!==expected)throw new Error(`level visibility invariant failed @${i}`);
  if(!expected && (out.entry!==null||out.target!==null||out.invalid!==null))throw new Error(`research leaked live levels @${i}`);
  if(expected){
    liveCount++;
    const want=dir>0?'ENTER BUY NOW':'ENTER SELL NOW';if(out.action!==want)throw new Error(`direction mismatch @${i}`);
    if(![out.entry,out.target,out.invalid].every(Number.isFinite))throw new Error(`live geometry missing @${i}`);
  } else waitCount++;
  const row={command:out,scalp:{state,edge:rnd(),counter,isCounter:sg.isCounter,mode:sg.mode,trigger:{score:rnd()}}};
  if(bestNowRankLabel(row)==='ENTER'!==expected)throw new Error(`BEST NOW ENTER label invariant failed @${i}`);
  const display=bestNowDisplayAction(row);
  if(expected){if(!display.startsWith('ENTER'))throw new Error(`BEST NOW live display failed @${i}`)}
  else {if(!display.startsWith('WAIT'))throw new Error(`BEST NOW wait-prefix invariant failed @${i}: ${display}`)}
  if(!geometry)invalidGeom++;if(!hydraPass)hydraVeto++;if(!execOK)costVeto++;if(!integrityPass)dataVeto++;if(state==='PROOF')proofCases++;
}
// Deterministic targeted regressions
const H={retired:false,staleEdge:false,toxicity:.1,fragility:.1},F={pass:true,integrityPass:true,execOK:true,reasons:[]};
function assert(c,m){if(!c)throw new Error(m)}
let x=executionCommandFromParts({fire:false,state:'PROOF',counter:1,entry:100,target:101,invalid:99},F,H);assert(x.action==='WAIT — NO LIVE TRADE'&&!x.showLevels,'PROOF-only must WAIT');
x=executionCommandFromParts({fire:true,state:'FIRE NOW',counter:1,entry:100,target:101,invalid:99},{...F,execOK:false,pass:false},H);assert(!x.liveReady&&x.action.startsWith('WAIT'),'cost veto must WAIT');
x=executionCommandFromParts({fire:true,state:'FIRE NOW',counter:-1,entry:100,target:99,invalid:101},F,{...H,toxicity:.90});assert(!x.liveReady&&x.action.startsWith('WAIT'),'Hydra veto must WAIT');
x=executionCommandFromParts({fire:true,state:'FIRE NOW',counter:-1,entry:100,target:99,invalid:101},F,H);assert(x.liveReady&&x.action==='ENTER SELL NOW','full authority must ENTER SELL');
const elapsed=Date.now()-started;
const sha=crypto.createHash('sha256').update(src).digest('hex');
const report={version:'APEX-SCALP-GOD-6.9.0',sourceSha256:sha,scenarios:N,seed:'0x69c0ffee',elapsedMs:elapsed,passed:true,liveCount,waitCount,invalidGeom,hydraVeto,costVeto,dataVeto,proofCases,invariants:['ENTER iff final execution authority is complete','Every non-live command is WAIT — NO LIVE TRADE','No live entry/SL/TP levels leak while WAIT','BUY/SELL text matches authorized direction','BEST NOW can never label ENTER from scalp state alone','Every non-live BEST NOW row begins with WAIT']};
console.log(JSON.stringify(report,null,2));

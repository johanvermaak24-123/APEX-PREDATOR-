'use strict';
const fs=require('fs'),crypto=require('crypto'),vm=require('vm');
const src=fs.readFileSync('app.js','utf8');
function sliceFunc(name){
 const st=src.indexOf(`function ${name}(`); if(st<0)throw Error('missing '+name);
 const b=src.indexOf('{',st); let d=0,q=null,esc=false,lc=false,bc=false;
 for(let i=b;i<src.length;i++){
  const c=src[i],n=src[i+1]||'';
  if(lc){if(c==='\n')lc=false;continue} if(bc){if(c==='*'&&n==='/'){bc=false;i++}continue}
  if(q){if(esc)esc=false;else if(c==='\\')esc=true;else if(c===q)q=null;continue}
  if(c==='/'&&n==='/'){lc=true;i++;continue} if(c==='/'&&n==='*'){bc=true;i++;continue}
  if(c==='"'||c==="'"||c==='`'){q=c;continue} if(c==='{')d++; else if(c==='}'&&--d===0)return src.slice(st,i+1);
 } throw Error('unclosed '+name)
}
function assert(x,m){if(!x)throw Error(m)}
global.clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
global.APEX_TRIGGER_FRESH_MAX_MS=240000; global.APEX_COMMAND_MAX_AGE_MS=60000;
global.parseBarTime=x=>Date.parse(x);
vm.runInThisContext(sliceFunc('triggerFreshnessGuard'));
vm.runInThisContext(sliceFunc('plainCommandReason'));
vm.runInThisContext(sliceFunc('executionCommandFromParts'));
// universalTrigger dependencies
global.executionCostModel=()=>({known:true,verified:true,totalAbs:.02,execSpread:.01,feedSpread:.01,brokerSpread:NaN,source:'TEST LIVE MT5'});
vm.runInThisContext(sliceFunc('universalTrigger'));
const realUniversalTrigger=universalTrigger;
// opportunityDuel dependencies
global.duelStats=()=>({n:0,effectiveN:0,avg:null,expLower:null,holdoutAvg:null,fdrPass:false});
global.circuitBreakerState=()=>({block:false,reasons:[]});
global.APEX_DUEL_MIN_N=20;
global.universalTrigger=(r,c)=>({state:'TRIGGERED',score:.80,confirmations:5,costPass:true,costVerified:true,netRR:1.35,whipsawBlock:false,freshnessPass:true,freshness:{pass:true,status:'FRESH'},entry:100,target:c.dir>0?101:99,stop:c.dir>0?99:101,reason:'test'});
vm.runInThisContext(sliceFunc('opportunityDuel'));
let seed=0x7400cafe>>>0; function rnd(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296}
const N=1_000_000, now=Date.parse('2026-09-16T08:00:00Z');
let fresh=0,stale=0,missed=0,invalid=0,live=0,blockedWhip=0;
for(let i=0;i<N;i++){
 const dir=rnd()<.5?1:-1, atr=.2+rnd()*10, targetATR=.18+rnd()*.6, close=100+rnd()*5000;
 const age=Math.floor(rnd()*360001), signed=(rnd()*.8)-.3, open=new Date(now-5*60000-age).toISOString(), price=close+dir*signed*atr;
 const fr=triggerFreshnessGuard({sym:'BTC/USD'},{mode:'CONTINUATION'},{datetime:open,close},price,atr,targetATR,dir,now);
 const mf=clamp(Math.min(.18,Math.max(.08,targetATR*.35)),.08,.18),ma=clamp(Math.min(.22,Math.max(.12,targetATR*.55)),.12,.22),fav=Math.max(0,signed),adv=Math.max(0,-signed),used=fav/targetATR;
 let exp='FRESH'; if(age>240000)exp='STALE'; else if(adv>ma)exp='INVALIDATED'; else if(fav>mf||used>.35)exp='MISSED';
 assert(fr.status===exp,`fresh mismatch ${fr.status}/${exp}`); if(exp==='FRESH')fresh++;else if(exp==='STALE')stale++;else if(exp==='MISSED')missed++;else invalid++;
 const whip=rnd()<.18, F={pass:true,integrityPass:true,execOK:true,reasons:[]},H={retired:false,staleEdge:false,toxicity:.1,fragility:.1};
 const sg={fire:true,state:whip?'WHIPSAW':'FIRE NOW',counter:dir,entry:100,target:100+dir,invalid:100-dir,proofTier:'EARLY',trigger:{freshness:{...fr,pass:fr.pass},whipsawBlock:whip}};
 const out=executionCommandFromParts(sg,F,H),expected=fr.pass&&!whip;
 assert(out.liveReady===expected,'live gate mismatch'); assert(out.action.startsWith('ENTER')===expected,'ENTER mismatch');
 if(whip){blockedWhip++;assert(out.stage==='WHIPSAW GUARD','whip stage');assert(!out.showLevels,'whip levels leak')} else if(expected) live++;
}
// Deterministic first-move / pullback-resumption tests using real universalTrigger.
const mkBars=(vals)=>vals.map((v,i)=>({datetime:new Date(Date.now()-(vals.length-i)*5*60000).toISOString(),open:v[0],high:v[1],low:v[2],close:v[3],volume:100}));
function baseM(over={}){return {atr:10,price:100,flowPressure:-.6,impulseDir:-1,directionalPersistence:.75,pathEfficiency:.70,reversalFitness:.66,continuationFitness:.72,upperWick:.08,lowerWick:.28,rsi:24,volBurst:1.2,...over}}
// Extended sell with oversold/reversal pressure and counter-first warning => WHIPSAW.
let bars=mkBars([[120,121,118,119],[119,120,114,115],[115,116,109,110],[110,111,103,104],[104,105,98,99],[99,100,96,98]]);
let r={sym:'BTC/USD',raw5:bars,res:{'5min':baseM()},main:baseM(),feedMeta:{spot:98}},c={mode:'CONTINUATION',dir:-1,score:.82,counterFirstRisk:true,counterFirstScore:.68};
let t=realUniversalTrigger(r,c);assert(t.whipsawBlock===true&&t.state==='WHIPSAW','extended sell must wait for counter squeeze');
// Pullback then fresh sell resumption should clear whipsaw if quality passes.
bars=mkBars([[120,121,118,119],[119,120,115,116],[116,117,111,112],[112,113,108,109],[109,113,108,112],[112,113,105,106]]);
r={sym:'BTC/USD',raw5:bars,res:{'5min':baseM({rsi:39,reversalFitness:.45,lowerWick:.08})},main:baseM({rsi:39,reversalFitness:.45,lowerWick:.08}),feedMeta:{spot:106}};c={mode:'CONTINUATION',dir:-1,score:.84,counterFirstRisk:true,counterFirstScore:.62};
t=realUniversalTrigger(r,c);assert(t.reentryConfirmed===true,'pullback resumption not recognized');assert(t.whipsawBlock===false,'resumption should clear whipsaw');assert(['TRIGGERED','ARMED'].includes(t.state),'resumption state invalid');
// Proof-building no longer a hard padlock: zero evidence + strong live trigger can fire.
global.universalTrigger=(r,c)=>({state:'TRIGGERED',score:.82,confirmations:5,costPass:true,costVerified:true,netRR:1.4,whipsawBlock:false,freshnessPass:true,freshness:{pass:true,status:'FRESH'},entry:100,target:c.dir>0?101:99,stop:c.dir>0?99:101});
let rr={sym:'BTC/USD',res:{'5min':{impulseDir:-1,continuationFitness:.9,directionalPersistence:.85,pathEfficiency:.8,volBurst:1.1,reversalFitness:.25,microState:'PERSISTENT IMPULSE'},'15min':{score:-2},'30min':{score:-2},'1h':{score:-1.5}},main:{impulseDir:-1,continuationFitness:.9,directionalPersistence:.85,pathEfficiency:.8,volBurst:1.1,reversalFitness:.25},total:-2,crossMarket:{available:false}};
let oo=opportunityDuel(rr,{finalDir:-1,counterDir:1,decisionP:.45,liveConfirm:false,fastSafe:true});assert(oo.fire===true&&oo.proofTier==='EARLY','early proof strong live opportunity should fire');
// Mature materially negative exact-bucket evidence must still block.
global.duelStats=()=>({n:40,effectiveN:25,avg:-.2,expLower:-.3,holdoutAvg:-.15,fdrPass:false});
oo=opportunityDuel(rr,{finalDir:-1,counterDir:1,decisionP:.45,liveConfirm:false,fastSafe:true});assert(oo.fire===false&&oo.histReject===true,'mature negative proof must block');
const sha=crypto.createHash('sha256').update(src).digest('hex');
const report={version:'APEX-SCALP-GOD-7.4.0',sourceSha256:sha,scenarios:N,seed:'0x7400cafe',passed:true,counts:{fresh,stale,missed,invalid,live,blockedWhip},invariants:['M5 trigger can remain eligible up to 4 minutes only while price displacement remains fresh','Final ENTER is impossible when whipsawBlock is true','Extended continuation with counter-first risk waits for a pullback/squeeze','Pullback + fresh resumption can re-authorize the original direction','Zero/low forward proof does not automatically suppress a strong live opportunity','Mature materially negative exact-bucket evidence can still block','No levels are shown while WHIPSAW GUARD is active']};
fs.writeFileSync('AUDIT_1M_740_REPORT.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));

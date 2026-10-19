import assert from 'node:assert/strict';
import {featurePose,productLandingPose,contentFeaturePose,toWorld} from './spatial-scene-motion.js';
import {platformToken,workerStrike,textbookPuzzle} from './spatial-choreography.js';
const ids=['platform','contents','textbook','camp','jitda'];
for(const [w,h] of [[320,570],[390,844],[768,600],[965,884],[1440,600],[1920,1080]]){
  const readable=new Set();let biggest=0,smallest=Infinity;
  for(let step=0;step<=1100;step++){
    const p=step/1000-.08;
    for(const id of ids){
      const a=productLandingPose(id,p,w,h),point=toWorld(a,w,h);
      for(const value of Object.values(a))assert(Number.isFinite(value));
      assert(point.scale>0&&point.z<7,'landing never crosses the camera');
      assert(a.opacity>=0&&a.opacity<=1&&a.ready>=0&&a.ready<=1);
      if(p<.55)assert.equal(a.ready,0,'no invisible feature-stage landing link');
      if(p>.90&&p<.925&&id!=='platform'){
        assert.equal(a.ready,1);assert.equal(a.opacity,1);
        assert(a.screenX-a.pixelWidth/2>=0&&a.screenX+a.pixelWidth/2<=w);
        assert(a.screenY+a.pixelWidth*9/32<h*(w<=700?.63:.75),'final landing clears title');
      }
      if(p>.95&&id==='platform')assert.equal(a.ready,0,'camera passage cannot activate a departing page');
      if(p>.962&&id!=='jitda')assert.equal(a.ready,0,'a receding destination cannot retain a floating click target');
      if(p>.99&&id!=='platform'&&id!=='jitda')assert(a.screenY<h*.2&&a.pixelWidth<Math.min(w*(w<=700?.92:.8),h*.95,1080)*.5,'the outgoing destination clears the incoming feature in depth');
      if(id==='contents')for(let i=0;i<24;i++){
        const c=contentFeaturePose(i,p,w,h,1.75),q=toWorld(c,w,h,1.82);
        for(const value of Object.values(c))assert(Number.isFinite(value));
        assert(c.pixelWidth>0&&q.scale>0&&c.z<7);
        assert(c.opacity>=0&&c.opacity<=1);
        if(c.opacity>.95&&p<.40){
          biggest=Math.max(biggest,c.pixelWidth);smallest=Math.min(smallest,c.pixelWidth);
          const half=c.pixelWidth/2,halfH=half/1.75;
          if(c.pixelWidth>=Math.min(120,w*.30)&&c.screenX-half>=0&&c.screenX+half<=w&&c.screenY-halfH>h*.11&&c.screenY+halfH<h*.74)readable.add(i);
        }
        if(p>.87)assert.equal(c.opacity,0,'thumbnail deck clears final landing');
      }else{
        const c=featurePose(id,0,p,w,h),q=toWorld(c,w,h,4.5);
        assert(q.scale>0&&c.opacity>=0&&c.opacity<=1);
        if(p>.78)assert.equal(c.opacity,0,'feature clears final landing');
      }
    }
  }
  assert.equal(readable.size,24,'every original cover has a readable pass');
  assert(biggest/smallest>3,'foreground and distance remain visibly distinct');
  const tokens=Array.from({length:6},(_,i)=>platformToken(i,.38));
  assert(Math.max(...tokens.map(x=>x.x))-Math.min(...tokens.map(x=>x.x))>3,'tokens never form a vertical list');
  console.log(`${w}x${h}: 24 readable passes, near/far depth, no camera crossing, final landing clear, no vertical token docking.`);
}
for(let i=0;i<=1000;i++){const s=workerStrike(i/1000);assert(Object.values(s).every(Number.isFinite));assert(s.build>=0&&s.build<=1)}
for(const impact of [.165,.335]){
  const angle=workerStrike(impact).angle,tipY=-.25*Math.sin(angle)+.68*Math.cos(angle)-.38;
  assert(Math.abs((tipY-.045)-(-.70))<.02,'pickaxe tip touches the platform when the dust starts');
}
console.log('Official worker uses two bounded strikes; scroll is reversible.');
let previous=textbookPuzzle(0);
for(let i=1;i<=1000;i++){
  const p=i/1000,a=textbookPuzzle(p);assert(Object.values(a).every(Number.isFinite));
  assert(Math.abs(a.farmerX-(a.boatX-.12))<1e-9,'farmer always travels with the boat');
  if(p>=.465&&p<=.535)assert(Math.abs(a.sheepX-(a.boatX+.14))<1e-8,'the sheep rides the boat rather than sliding through the water');
  assert(Math.abs(a.sheepX-previous.sheepX)<.035&&Math.abs(a.sheepY-previous.sheepY)<.035,'no passenger teleport');previous=a;
}
console.log('Actual textbook illustration: load sheep, cross together, unload continuously.');

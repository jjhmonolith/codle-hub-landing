import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {featurePose,productLandingPose,contentFeaturePose,toWorld} from './spatial-scene-motion.js';
import {platformToken,textbookPuzzle,workerStrike} from './spatial-choreography.js';

// Scene portals replace the previous poster-plane contract. The old
// check-spatial-journey.mjs describes that historical implementation.
const products=['platform','contents','textbook','camp','jitda'];
for(const [w,h] of [[320,570],[390,844],[768,600],[1265,720],[1440,600],[1920,1080]]){
  const readable=new Set();let largest=0,smallest=Infinity;
  for(let step=0;step<=1160;step++){
    const p=step/1000-.08;
    for(const id of products){
      const portal=productLandingPose(id,p,w,h);
      assert(Object.values(portal).every(Number.isFinite));
      assert.equal(portal.opacity,0,'No duplicate website poster appears over the product scene');
      assert(portal.ready>=0&&portal.ready<=1);
      if(p<.64)assert.equal(portal.ready,0,'Feature phase has no invisible interactive page');
      if(p>=.77&&p<=.85)assert.equal(portal.ready,1,'Each product has a usable opening interval');
      if(p>=.981&&id!=='jitda')assert.equal(portal.ready,0,'Departing scenes cannot retain invisible hit targets');
      if(id==='contents')continue;
      const feature=featurePose(id,0,p,w,h),point=toWorld(feature,w,h,4.5);
      assert(Object.values(feature).every(Number.isFinite));
      assert(point.scale>0&&point.z<7&&feature.opacity>=0&&feature.opacity<=1);
      if(p>=.77&&p<=.85)assert.equal(feature.opacity,1,'Native product remains present when its portal opens');
    }
    for(let i=0;i<24;i++){
      const c=contentFeaturePose(i,p,w,h,1.75);
      assert(Object.values(c).every(Number.isFinite));
      assert(c.pixelWidth>0&&c.z<7&&c.opacity>=0&&c.opacity<=1);
      if(p<.40&&c.opacity>.95){
        largest=Math.max(largest,c.pixelWidth);smallest=Math.min(smallest,c.pixelWidth);
        const x=c.pixelWidth/2,y=x/1.75;
        if(c.pixelWidth>=Math.min(120,w*.30)&&c.screenX-x>=0&&c.screenX+x<=w&&c.screenY-y>h*.11&&c.screenY+y<h*.74)readable.add(i);
      }
      if(p>=.70&&p<=.90){
        assert.equal(c.opacity,1,'Every cover holds in the final fan');
        const x=c.pixelWidth/2,y=x/1.75;
        assert(c.screenX-x>=-1&&c.screenX+x<=w+1,'Final fan retains edge covers in frame');
        assert(c.screenY-y>=h*.10&&c.screenY+y<h*(w<=700?.62:.72),'Final fan clears navigation and caption');
      }
    }
  }
  assert.equal(readable.size,24,'All 24 original covers get a large readable pass');
  assert(largest/smallest>3,'Foreground passage retains substantial near/far depth');
  const tokens=Array.from({length:6},(_,i)=>platformToken(i,.38));
  assert(Math.max(...tokens.map(t=>t.x))-Math.min(...tokens.map(t=>t.x))>3,'Platform tools retain their spatial spread');
  console.log(`${w}x${h}: persistent product scenes, five portal holds, 24 readable passes and contained fan.`);
}
for(let i=0;i<=1000;i++){
  const puzzle=textbookPuzzle(i/1000),worker=workerStrike(i/1000);
  assert([...Object.values(puzzle),...Object.values(worker)].every(Number.isFinite));
  assert(Math.abs(puzzle.farmerX-puzzle.boatX+.12)<1e-9,'Farmer stays aboard');
}
for(const [file,expected] of [
 ['toys.js','0D5A85A2E9D25C7D394B8019BE118DA73560E3DF06444E501919C485D2930D1E'],
 ['spatial-actions.js','676553E77B85140F9391D80F6AFE7FD8420392B141CEADD1E0523ED65977F4F7']
])assert.equal(createHash('sha256').update(readFileSync(new URL(file,import.meta.url))).digest('hex').toUpperCase(),expected,'Original logo and platform factories remain unchanged');
console.log('Original logos/platform preserved. Scene math finite and reversible; browser review remains required for materials and portal capture.');

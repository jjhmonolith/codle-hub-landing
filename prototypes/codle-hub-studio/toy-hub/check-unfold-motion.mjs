import assert from 'node:assert/strict';
import {unfoldPose,unfoldScene} from './content-unfold-motion.js';

// Verify visual choreography: every real cover gets a readable moment, the
// static composition has gaps, and the hand-off never leaves an empty stage.
for(const [width,height] of [[390,570],[950,700],[1280,542],[1600,728]]){
  const peaks=Array(24).fill(0);
  let largestForeground=0,strongDepthFrame=false;
  let previousCamera=Infinity;
  for(let step=0;step<=1000;step++){
    const p=step/1000,scene=unfoldScene(p,width,height);
    assert(scene.cameraZ<=previousCamera,'camera must not unexpectedly reverse');previousCamera=scene.cameraZ;
    const poses=peaks.map((_,i)=>unfoldPose(i,p,width,height));
    for(const [i,pose] of poses.entries()){
      for(const value of Object.values(pose))assert(Number.isFinite(value));
      assert(pose.opacity>=0&&pose.opacity<=1);
      peaks[i]=Math.max(peaks[i],pose.opacity);
      if(p>.26&&pose.opacity>.5)largestForeground=Math.max(largestForeground,pose.halfWidth*2);
    }
    const readable=poses.filter(a=>a.opacity>.7);
    if(readable.length>1&&Math.max(...readable.map(a=>a.halfWidth))/Math.min(...readable.map(a=>a.halfWidth))>4)strongDepthFrame=true;
    if(p>.17)assert(poses.some(a=>a.opacity>.1)||scene.landing>.1,`empty hand-off at ${width}/${p}`);
    if(p>.88)assert(poses.every(a=>a.opacity<.001),'cards must clear the destination');
  }
  assert(peaks.every(n=>n>.95),'all 24 covers must have a fully visible moment');
  const hold=peaks.map((_,i)=>unfoldPose(i,.22,width,height)).filter(a=>a.opacity>.8);
  let minGap=Infinity;
  for(let i=0;i<hold.length;i++)for(let j=i+1;j<hold.length;j++){
    const a=hold[i],b=hold[j];
    const gapX=Math.abs(a.screenX-b.screenX)-a.halfWidth-b.halfWidth;
    const gapY=Math.abs(a.screenY-b.screenY)-a.halfHeight-b.halfHeight;
    assert(gapX>0||gapY>0,`readable hold overlap at ${width}`);
    minGap=Math.min(minGap,Math.max(gapX,gapY));
  }
  const settled=unfoldPose(0,.22,width,height);
  assert(largestForeground>settled.halfWidth*2*3,'foreground must reach three times its held size');
  assert(strongDepthFrame,'near and far covers need a visible size difference');
  const stagger=Array.from({length:4},(_,i)=>unfoldPose(i,.42,width,height).z);
  assert(Math.max(...stagger)-Math.min(...stagger)>4,'four covers should pass separately');
  assert.deepEqual(settled,unfoldPose(0,.22,width,height),'no time-based drift at rest');
  console.log(`${width}x${height}: 24 readable covers; ${hold.length} visible at rest; minimum separation ${minGap.toFixed(1)}px; foreground ${largestForeground.toFixed(0)}px; continuous hand-off`);
}

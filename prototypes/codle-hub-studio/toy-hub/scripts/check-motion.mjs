import assert from 'node:assert/strict';
import {objectMotion} from '../object-motion.js';
import {surfaceAt} from '../surface-timeline.js';

// Design constraints: no idle spin burst, no page edge-flip, no invalid pose.
let peakIdleSpeed=0,peakYaw=0;
for(let order=0;order<6;order++){
  let previous=objectMotion(0,order,1,0).idle;
  for(let frame=1;frame<=7200;frame++){
    const pose=objectMotion(0,order,1,frame/60);
    peakIdleSpeed=Math.max(peakIdleSpeed,Math.abs(pose.idle-previous)*60);
    assert.ok(Math.abs(pose.idle)<.18,'Idle motion must stay front-facing');
    previous=pose.idle;
  }
  for(let step=-110;step<=110;step++){
    const pose=objectMotion(step/100,order,1,10);
    assert.ok(Object.values(pose).every(Number.isFinite),'Scroll pose must remain finite');
    assert.ok(pose.z<5.5,'Props must stay behind the camera near plane');
  }
}
assert.ok(peakIdleSpeed<.03,'Idle rotation must not suddenly accelerate');
for(let step=0;step<=4000;step++){
  const pose=surfaceAt(step/1000);
  peakYaw=Math.max(peakYaw,Math.abs(pose.yaw));
  assert.ok(Object.values(pose).every(Number.isFinite));
}
assert.ok(peakYaw<.12,'Landing must remain nearly front-facing through transitions');
const near=objectMotion(.6,0,1.3,0),far=objectMotion(.6,0,-1.8,0);
assert.ok(near.lateral>far.lateral,'Foreground must sweep faster than the background');
console.log(`Motion constraints passed: peak idle ${(peakIdleSpeed*180/Math.PI).toFixed(2)}°/s; page yaw ${(peakYaw*180/Math.PI).toFixed(2)}°.`);

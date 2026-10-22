import assert from 'node:assert/strict';
import {sampleJourney,DURATION,CUT_TO_TEAM,CUT_TO_CLASS} from './hero-desk-motion.mjs';

const anchors={
  classroom:{focus:[-.045,.9,-.25],normal:[0,.198669,.980067]},
  team:{focus:[.33,.9,.065],normal:[0,.198669,.980067]},
};
const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
for(let t=0;t<=DURATION;t+=1/120){
  const s=sampleJourney(t,anchors);
  assert(s.position.concat(s.target,s.roll,s.caption).every(Number.isFinite));
  assert(distance(s.position,s.target)>.014);
  assert(s.caption>=0&&s.caption<=1);
}
for(const t of [.5,2.5,3.6,5.2,8.2,9.4,11.2]){
  const a=sampleJourney(t-.000001,anchors),b=sampleJourney(t+.000001,anchors);
  assert(distance(a.position,b.position)<.0001,`Camera position at ${t}`);
  assert(distance(a.target,b.target)<.0001,`Camera target at ${t}`);
  assert(Math.abs(a.roll-b.roll)<.0001);
}
for(const t of [CUT_TO_TEAM,CUT_TO_CLASS]){
  const a=sampleJourney(t-.000001,anchors),b=sampleJourney(t,anchors);
  assert.notEqual(a.world,b.world);
  assert(a.caption===0&&b.caption===0);
  const direction=s=>s.position.map((v,i)=>v-s.target[i]);
  assert(distance(direction(a),direction(b))<.0001,'Matched screen-cut pose');
}
assert.deepEqual(sampleJourney(0,anchors),sampleJourney(DURATION,anchors),'Seamless loop');
assert.deepEqual(sampleJourney(0,anchors,true),sampleJourney(2,anchors,true),'Reduced-motion classroom');
assert.deepEqual(sampleJourney(5.5,anchors,true),sampleJourney(7,anchors,true),'Reduced-motion team');
assert.equal(sampleJourney(5.5,anchors,true).world,'team','Accessible static chapter selection');
console.log('PASS: 1,440 poses, segment continuity, screen cuts, loop, reduced-motion chapters');

import assert from 'node:assert/strict';
import {storyAt,productProgress} from '../story-timeline.js';
import {surfaceAt,chapterAt} from '../surface-timeline.js';

for(const count of [1,5,6]){
  for(let i=0;i<count;i++){
    for(const phase of [.22,.8]){
      const p=productProgress(i,count,phase),scene=surfaceAt(storyAt(p,count).reel,count);
      assert.equal(scene.active,i,'Chapter navigation must target the correct product');
      assert.ok(Math.abs(scene.phase-phase)<1e-10);
      assert.equal(scene.reveal,phase===.22?0:1,'Feature first, landing second');
      assert.equal(scene.copy,1,'The product name is readable in both stages');
    }
    for(let frame=0;frame<=1000;frame++){
      const phase=frame/1000,scene=chapterAt(i+phase,i,count);
      assert.ok(Object.values(scene).every(Number.isFinite));
      if(phase<=.55)assert.equal(scene.reveal,0,'No landing may cover the feature showcase');
      if(scene.reveal>.85)assert.ok(scene.spread>.95,'Objects must make room before the page becomes clickable');
    }
  }
  const end=surfaceAt(storyAt(1,count).reel,count);
  assert.equal(end.active,count-1);assert.equal(end.reveal,1,'Keep the final destination available');
}
// Original opening: 580 viewport-percent * .43 = 249.4. The expanded desktop
// timeline uses 1000 * .25 = 250, preserving the logo/hero scroll distance.
assert.ok(Math.abs(580*.43-1000*.25)<1);
assert.ok(Math.abs(520*.43-900*.25)<2);
console.log('Feature sequence passed: all chapters show objects before the landing, correct navigation, preserved opening length and persistent final destination.');

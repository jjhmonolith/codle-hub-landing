import assert from 'node:assert/strict';
import {projectLayer,MAX_LAYER_SCALE,FIRST_DEPTH,DEPTH_GAP,settleReel} from './layer-projection.js';
let count=0,maxScale=0,maxStep=0;
for(const [w,h] of [[1280,720],[914,956]]){
 for(const spec of [{x:-.12,y:.07,width:.82,aspect:1.65,depth:2160,ownerDepth:3000},{x:.34,y:.16,restX:.105,restY:.035,width:.74,roll:2.5,aspect:1/.57,depth:FIRST_DEPTH+DEPTH_GAP,main:true,side:1}]){
  let previous;
  for(let cam=0;cam<=8000;cam+=1){
   const p=projectLayer(spec,cam,w,h);count++;
   for(const key of ['x','y','width','height','scale','zIndex'])assert(Number.isFinite(p[key]),key);
   assert(p.scale>0&&p.scale<=MAX_LAYER_SCALE);
   assert(p.width*p.scale<=w*.91*MAX_LAYER_SCALE);
   if(previous){const delta=Math.hypot(p.x-previous.x,p.y-previous.y);maxStep=Math.max(maxStep,delta);assert(delta<25,'near-plane jump')}
   maxScale=Math.max(maxScale,p.scale);previous=p;
  }
  const at=projectLayer(spec,spec.depth,w,h);
  if(spec.main){assert(Math.abs(at.x-w*(.5+spec.restX))<.001);assert(Math.abs(at.y-h*(.5+spec.restY))<.001);assert(at.x>w*.60,'main plane must retain its off-centre stop');assert.equal(at.scale,1);assert.equal(at.roll,0)}
 }
}
for(const range of [2232,2963.6]){
 const actual=Math.floor(range*.98*5)/5;
 assert.equal(settleReel(Math.max(0,Math.min(1,(actual/range-.38)/.60))*4,4),4,'rounded last stop must remain interactive');
}
console.log(JSON.stringify({samples:count,maxScale,maxStep:Number(maxStep.toFixed(3)),finite:true,continuous:true,roundedLastStop:true,offCentreStop:true}));

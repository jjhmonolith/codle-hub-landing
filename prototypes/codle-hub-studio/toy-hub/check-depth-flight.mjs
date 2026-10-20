import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {FIRST_DEPTH,DEPTH_GAP,FOCAL_DISTANCE,DECK_START,DECK_END,flightCamera,flightProgress} from './depth-flight.js';
let maxStep=0,previous;
for(let z=0;z<=FIRST_DEPTH+4*DEPTH_GAP;z++){
  const p=flightCamera(z);for(const key of ['x','y','z'])assert(Number.isFinite(p[key]));
  if(previous)maxStep=Math.max(maxStep,Math.abs(p.x-previous.x));
  previous=p;
}
assert(maxStep<.006,'camera path must not jump between product depths');
const source=readFileSync(new URL('./hub.js',import.meta.url),'utf8');
const stops=[...source.matchAll(/restX:([-.\d]+),restY:[-.\d]+,width:([.\d]+)/g)].map(m=>[+m[1],+m[2]]);
assert.equal(stops.length,5);
for(let i=0;i<stops.length;i++){
  const p=DECK_START+(DECK_END-DECK_START)*i/4;
  assert.equal(flightProgress(p).front,i);assert(flightProgress(p).ready);
  const view=flightCamera(FIRST_DEPTH+i*DEPTH_GAP);assert(Math.abs(view.x)<1e-9);assert(Math.abs(view.y)<1e-9);
  if(i<4){
    const pass=flightCamera(FIRST_DEPTH+i*DEPTH_GAP+FOCAL_DISTANCE);
    assert(Math.abs(pass.x-stops[i][0])>stops[i][1]/2+.05,'camera must pass beside the image, not through its opaque centre');
  }
}
const props=[...source.matchAll(/(?:\['thumbnail-[^']+'|imageLayer\('worlds\/[^']+'|addDepthLayer\(\$\('[^']+'\)),([-.\d]+),([-.\d]+),([.\d]+),(\d+),[-.\d]+(?:,([.\d]+))?/g)].map(m=>[+m[1],+m[2],+m[3],+m[4],+(m[5]||1.65)]);
assert.equal(props.length,14);
for(const [x,y,width,depth,aspect] of props){
  const cam=flightCamera(depth+FOCAL_DISTANCE);
  for(const viewportAspect of [1,16/9,2.4])assert(Math.abs(cam.x-x)>width/2+.025||Math.abs(cam.y+y)>width/aspect*viewportAspect/2+.025,'foreground plane must clear the camera near plane without an opaque cut');
}
for(const range of [2232,2964]){
 const actual=Math.floor(range*DECK_END*5)/5;
 assert.equal(flightProgress(actual/range).front,4);assert(flightProgress(actual/range).ready);
}
console.log(JSON.stringify({fixedPlaneFlight:true,viewingStops:5,clearForegroundPlanes:props.length,continuousCamera:true,maxNormalizedStep:+maxStep.toFixed(5),roundedEndReady:true}));

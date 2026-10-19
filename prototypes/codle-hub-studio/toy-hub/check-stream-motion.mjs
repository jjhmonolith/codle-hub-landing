import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from './vendor/three.module.min.js';
import {streamPose,streamScene} from './content-stream-motion.js';
const items=JSON.parse(fs.readFileSync(new URL('./assets/worlds/content-thumbnails.sources.json',import.meta.url))).items;
items.sort((a,b)=>b.dimensions[0]-a.dimensions[0]);
items.unshift(...items.splice(items.findIndex(x=>x.file==='thumbnail-everyday-ai.webp'),1));
assert.equal(new Set(items.map(x=>x.file)).size,24);
for(const [width,height] of [[320,570],[390,570],[768,600],[950,700],[1280,500],[1600,728]]){
  const camera=new THREE.PerspectiveCamera(40,width/height,.1,90);camera.position.z=12;camera.updateMatrixWorld();
  const pose=(i,p)=>streamPose(i,p,width,height,items[i].dimensions[0]/items[i].dimensions[1]);
  const bounds=(a,aspect)=>{
    const points=[];
    for(const x of [-.504,.504])for(const y of [-.5/aspect-.004,.5/aspect+.004]){
      const v=new THREE.Vector3(x,y,.002).multiplyScalar(a.tileWidth).applyEuler(new THREE.Euler(a.pitch,a.yaw,a.roll)).add(new THREE.Vector3(a.x,a.y,a.z)).project(camera);
      points.push({x:(v.x+1)*width/2,y:(1-v.y)*height/2});
    }
    return {left:Math.min(...points.map(p=>p.x)),right:Math.max(...points.map(p=>p.x)),top:Math.min(...points.map(p=>p.y)),bottom:Math.max(...points.map(p=>p.y))};
  };
  const visibleArea=b=>Math.max(0,Math.min(width,b.right)-Math.max(0,b.left))*Math.max(0,Math.min(height*.65,b.bottom)-Math.max(height*.17,b.top));
  let maximumVisible=0;
  for(let step=0;step<=1000;step++){
    const p=step/1000;let visible=0;
    for(let i=0;i<24;i++){
      const a=pose(i,p);for(const value of Object.values(a))assert(Number.isFinite(value));
      assert(a.depth>7);assert(a.opacity>=0&&a.opacity<=1);
      const b=bounds(a,items[i].dimensions[0]/items[i].dimensions[1]);
      if(a.opacity>.1&&visibleArea(b)>width*height*.012)visible++;
      if(p>.14&&p<.84){assert(pose(i,p+.001).screenX<=a.screenX+.001,'each card must keep moving left');assert(pose(i,p+.001).screenY<=a.screenY+.001,'each card must keep moving up');}
    }
    if(p>.14)maximumVisible=Math.max(maximumVisible,visible);
    assert(visible>0||streamScene(p).landing>.1,`empty handoff at ${p}`);
  }
  assert(maximumVisible<=6,'only a few large overlapping covers should be on screen');
  for(let i=0;i<24;i++){
    const p=.075+(i+.5)*.03,a=pose(i,p),b=bounds(a,items[i].dimensions[0]/items[i].dimensions[1]);
    assert(a.opacity>.99,'every real cover must pass the foreground');
    assert(visibleArea(b)/((b.right-b.left)*(b.bottom-b.top))>.67,'each cover needs a substantially visible foreground moment');
    assert(a.halfWidth*2>=Math.min(width*.54,height*.67,470),'foreground covers must stay large');
    assert.deepEqual(pose(i,p),a,'pose must be deterministic for reverse scrubbing');
    assert(pose(i,1).opacity===0,'landing must finish clear');
  }
  assert.equal(streamScene(1).landing,1);
  console.log(`${width}x${height}: all 24 large covers pass; at most ${maximumVisible} visible together; monotonic diagonal motion, finite camera-safe poses, continuous landing handoff`);
}

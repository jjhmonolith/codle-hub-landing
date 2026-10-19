import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from './vendor/three.module.min.js';
import {stackPose,stackScene,stackLayout} from './content-stack-motion.js';
const items=JSON.parse(fs.readFileSync(new URL('./assets/worlds/content-thumbnails.sources.json',import.meta.url))).items;
items.sort((a,b)=>b.dimensions[0]-a.dimensions[0]);
items.unshift(...items.splice(items.findIndex(x=>x.file==='thumbnail-everyday-ai.webp'),1));
assert.equal(items.length,24);
assert.equal(new Set(items.map(x=>x.file)).size,24);
for(const [width,height] of [[320,570],[390,570],[600,570],[601,500],[768,600],[950,700],[1280,628],[1600,728],[1920,500]]){
  const pose=(i,p)=>stackPose(i,p,width,height,items[i].dimensions[0]/items[i].dimensions[1]);
  const camera=new THREE.PerspectiveCamera(40,width/height,.1,90);camera.position.z=12;camera.updateMatrixWorld();
  const projectBounds=(a,aspect)=>{
    const points=[];
    for(const x of [-.504,.504])for(const y of [-.5/aspect-.004,.5/aspect+.004])for(const z of [-.025,.002]){
      const point=new THREE.Vector3(x,y,z).multiplyScalar(a.tileWidth).applyEuler(new THREE.Euler(a.pitch,a.yaw,a.roll))
        .add(new THREE.Vector3(a.x,a.y,a.z)).project(camera);
      points.push({x:(point.x+1)*width/2,y:(1-point.y)*height/2});
    }
    return {left:Math.min(...points.map(p=>p.x)),right:Math.max(...points.map(p=>p.x)),top:Math.min(...points.map(p=>p.y)),bottom:Math.max(...points.map(p=>p.y))};
  };
  const spread=items.map((item,i)=>({...pose(i,.64),...projectBounds(pose(i,.64),item.dimensions[0]/item.dimensions[1])}));
  const deck=items.map((_,i)=>pose(i,0));
  assert(Math.max(...deck.map(x=>x.screenX))-Math.min(...deck.map(x=>x.screenX))<15,'all covers must start in the same deck');
  assert(Math.max(...deck.map(x=>x.screenY))-Math.min(...deck.map(x=>x.screenY))<15);
  let minGap=Infinity;
  for(let i=0;i<24;i++){
    const a=spread[i];
    assert(a.opacity===1&&a.open===1);
    assert(a.left>=0&&a.right<=width,'held cover must fit horizontally');
    assert(a.top>height*.09&&a.bottom<height*.78,'held covers must clear header and title');
    for(let j=i+1;j<24;j++){
      const b=spread[j],gapX=Math.max(b.left-a.right,a.left-b.right),gapY=Math.max(b.top-a.bottom,a.top-b.bottom);
      assert(gapX>0||gapY>0,'held covers must be separated');minGap=Math.min(minGap,Math.max(gapX,gapY));
    }
    assert.deepEqual(pose(i,.64),pose(i,.73),'hold must not drift');
    assert(pose(i,1).opacity===0,'covers must leave the landing clear');
  }
  for(let k=0;k<=500;k++){
    const p=k/500,poses=items.map((_,i)=>pose(i,p));
    for(const a of poses){for(const value of Object.values(a))assert(Number.isFinite(value));assert(a.depth>8);assert(a.opacity>=0&&a.opacity<=1);}
    assert(poses.some(a=>a.opacity>.1)||stackScene(p,width,height).landing>.1,'handoff cannot leave an empty frame');
  }
  assert(pose(0,.19).open>pose(12,.19).open,'release must move through the deck in order');
  const widths=spread.map(p=>p.halfWidth*2);
  assert(Math.max(...widths)/Math.min(...widths)>1.6,'spread needs a visible scale hierarchy');
  assert(new Set(spread.map(p=>Math.round(p.screenY))).size>18,'final placement must not form rows');
  console.log(`${width}x${height}: single deck → 24 naturally spread covers; projected rotated gap ${minGap.toFixed(1)}px; steady hold and continuous landing handoff`);
}

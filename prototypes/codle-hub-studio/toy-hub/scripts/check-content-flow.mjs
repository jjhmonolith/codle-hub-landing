import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {contentFlow} from '../content-flow.js';

const manifest=JSON.parse(readFileSync(new URL('../assets/worlds/content-thumbnails.sources.json',import.meta.url)));
assert.equal(manifest.items.length,24,'Use 24 authentic covers, not six repeated textures');
const hashes=manifest.items.map(item=>{
  assert.ok(item.dimensions[0]>item.dimensions[1],'Restore the source cover orientation');
  return createHash('sha256').update(readFileSync(new URL('../assets/worlds/'+item.file,import.meta.url))).digest('hex');
});
assert.equal(new Set(hashes).size,24,'Every cover must be distinct');

const screen=(p,width,height)=>{
  const perspective=8/(8-p.z);
  return {x:(.5+(p.x-.5)*perspective)*width,y:(.5+(p.y-.5)*perspective)*height,
    halfWidth:p.size*1.82*.5*perspective,halfHeight:p.size*1.82*.58*.5*perspective};
};
let wraps=0;
for(const [width,height] of [[390,844],[965,876],[1440,820],[1440,600],[1920,1080]]){
  let visibleAtRest=0,central=0;
  const argsFor=i=>({slot:i>>1,lane:i%2,width,height,sourceWidth:manifest.items[i].dimensions[0]});
  for(let i=0;i<24;i++){
    const args=argsFor(i),hold=contentFlow({...args,phase:.22}),rect=screen(hold,width,height);
    assert.deepEqual(hold,contentFlow({...args,phase:.22,time:120}),'No autonomous drifting after scrolling stops');
    if(hold.opacity>.5){visibleAtRest++;if(rect.x>width*.2&&rect.x<width*.8)central++}
    let last=null;
    for(let step=0;step<=2000;step++){
      const phase=-.1+step*.0006,p=contentFlow({...args,phase});
      assert.ok(Object.values(p).every(Number.isFinite));
      assert.ok(Math.abs(p.yaw)<=.07&&p.roll===0,'Shared ribbon alignment keeps cover titles readable');
      assert.ok(p.z<1,'Keep depth shallow and camera-safe');
      if(last&&Math.abs(p.cycle-last.cycle)>.5){
        assert.ok(last.opacity<.001&&p.opacity<.001,'Recycle out of sight');wraps++;
      }
      if(p.opacity>.2){
        const bounds=screen(p,width,height);
        assert.ok(bounds.y-bounds.halfHeight>Math.min(115,height*.16),'Protect the fixed header');
        assert.ok(bounds.y+bounds.halfHeight<height*(width<=700?.63:.745),'Protect the fixed chapter title');
        assert.ok(bounds.halfWidth*2<=args.sourceWidth*1.65+.01,'Respect source resolution');
      }
      if(phase>.74)assert.equal(p.opacity,0,'Ribbons leave before the landing hold');
      last=p;
    }
  }
  // Screen-space separation is the visual requirement, not the chosen path.
  for(let phase=.1;phase<.41;phase+=.013){
    const covers=Array.from({length:24},(_,i)=>contentFlow({...argsFor(i),phase})).filter(p=>p.opacity>.5).map(p=>screen(p,width,height));
    for(let i=0;i<covers.length;i++)for(let j=i+1;j<covers.length;j++){
      const a=covers[i],b=covers[j];
      assert.ok(Math.abs(a.x-b.x)>a.halfWidth+b.halfWidth+8 || Math.abs(a.y-b.y)>a.halfHeight+b.halfHeight+8,'Covers must never overlap');
    }
  }
  assert.ok(visibleAtRest>=(width<=700?6:12),'Keep a dense but readable showcase');
  assert.ok(central>=(width<=700?3:6),'Covers own the center first');
  console.log(`${width}x${height}: ${visibleAtRest} legible covers; ${central} central; no overlap`);
}
const speed=index=>{
  const args={width:1440,height:820,slot:index>>1,lane:index%2};
  const a=screen(contentFlow({...args,phase:.15}),1440,820);
  const b=screen(contentFlow({...args,phase:.151}),1440,820);
  return Math.abs(b.x-a.x);
};
assert.ok(speed(2)>speed(0)*1.5,'Foreground ribbon moves faster than the distant ribbon');
assert.ok(wraps>0);
console.log(`Passed: 24 unique covers, ${wraps} invisible wraps, shared alignment, no overlaps and settled idle.`);

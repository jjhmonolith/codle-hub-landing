import * as THREE from './vendor/three.module.min.js';
const assets='assets/unified-cards/';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const ease=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)};
const specs={
 jitda:{file:'jitda-house-option-b-v3.png',w:1754,h:897,parts:[
  ['reader','M640 0 H1040 V218 H1014 L895 274 L743 240 H640 Z',855,210,150],
  ['builder','M0 380 H434 V618 L412 663 L416 713 L350 739 L265 716 L0 710 Z',340,650,160],
  ['helper','M1288 250 H1754 V620 H1316 V484 L1307 471 L1288 450 Z',1430,530,150],
  ['hammer','M248 757 L396 720 L412 705 L447 704 L467 793 L451 818 L342 820 L294 840 L250 820 Z',299,796,0]
 ]},
 info:{file:'info-coding-books-v2.png',plate:'info-books-clean.png',w:1254,h:1254,parts:[
  ['yellow','M366 564 L432 553 L574 558 L607 598 L644 599 L679 566 L851 533 C885 550 890 649 866 681 L820 699 L457 733 C395 737 361 700 363 650 Z',620,685,0],
  ['blue','M355 446 C360 407 373 389 397 380 L450 407 L581 390 L603 420 L640 421 L668 389 L820 366 C870 367 882 402 873 472 L864 527 L679 568 L660 590 L631 603 L608 591 L593 567 L446 584 C386 580 354 558 355 515 Z',620,525,0],
  ['green','M383 290 C388 244 416 226 461 221 L766 186 C820 186 856 211 854 271 L851 339 C850 360 834 373 807 379 L674 391 L658 419 L625 427 L606 419 L590 395 L464 408 C405 413 378 377 382 330 Z',620,337,0]
 ]},
 cmass:{file:'cmass-crossing-source.png',plate:'cmass-river-clean.png',w:1254,h:1254,parts:[
  ['wolf','M335 549 C321 521 338 487 357 495 L375 508 C362 480 371 458 381 450 L385 424 Q390 409 403 425 L418 439 L434 420 Q448 408 453 439 L459 465 Q494 469 490 493 L464 518 Q477 556 453 571 L406 574 Q371 570 354 562 Z',413,570,35],
  ['cabbage','M218 838 Q211 801 232 788 Q236 763 265 768 Q283 753 303 768 Q336 758 343 790 Q363 810 345 837 Q334 864 298 867 Q246 871 218 848 Z',282,860,15],
  ['farmer','M183 392 Q184 350 239 350 Q277 347 294 375 Q339 371 336 402 Q330 425 307 440 L309 477 Q321 490 318 522 Q312 538 299 530 L300 551 Q314 575 284 579 L260 576 Q237 591 212 576 L215 552 Q188 547 193 520 L196 493 Q199 481 209 475 L207 466 Q178 471 163 457 Q147 441 172 413 Z',250,577,45],
  ['sheep','M185 679 Q184 653 202 643 Q203 623 228 622 Q235 603 262 608 Q279 584 304 595 Q329 586 346 607 Q367 609 369 634 Q381 649 357 660 Q368 682 350 697 L342 717 Q342 741 326 736 L312 728 L282 729 Q282 746 266 741 L255 729 L224 725 Q221 746 207 736 L206 720 Q189 715 186 697 Z',275,735,35],
  ['boat','M371 694 C380 659 435 640 487 640 C544 638 597 650 614 671 C613 706 581 735 539 749 C484 769 418 760 392 738 Q375 722 371 694 Z',492,727,25]
 ]}
};
async function load(file){const im=new Image();im.src=assets+file;await im.decode();return im}
function texture(im,w,h,path,inverse=false){
 const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');
 ctx.drawImage(im,0,0,w,h);
 if(path){ctx.globalCompositeOperation=inverse?'destination-out':'destination-in';ctx.fill(new Path2D(path))}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
export async function createArt(canvas,kind,card=canvas){
 const s=specs[kind],im=await load(s.file),plate=s.plate?await load(s.plate):im;
 const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,preserveDrawingBuffer:true});
 renderer.setSize(kind==='jitda'?1000:700,kind==='jitda'?512:700,false);renderer.outputColorSpace=THREE.SRGBColorSpace;
 const camera=new THREE.OrthographicCamera(-s.w/2,s.w/2,s.h/2,-s.h/2,.1,5000);camera.position.z=2500;
 const scene=new THREE.Scene();
 function mesh(tex){return new THREE.Mesh(new THREE.PlaneGeometry(s.w,s.h,48,32),new THREE.MeshBasicMaterial({map:tex,transparent:true,depthTest:false,depthWrite:false}))}
 const base=mesh(texture(plate,s.w,s.h,s.plate?null:s.parts.map(p=>p[1]).join(' '),!s.plate));base.renderOrder=0;scene.add(base);
 const parts=s.parts.map(([name,path,x,y,depth],i)=>{
  const m=mesh(texture(im,s.w,s.h,path)),g=new THREE.Group();g.position.set(x-s.w/2,s.h/2-y,0);m.position.set(s.w/2-x,y-s.h/2,0);
  // A shallow curved surface gives tiny head turns depth, while preserving the exact rest silhouette.
  const pos=m.geometry.attributes.position;
  for(let j=0;j<pos.count;j++){const dx=(pos.getX(j)+s.w/2-x)/220,dy=(s.h/2-pos.getY(j)-y)/220;pos.setZ(j,depth*Math.max(0,1-dx*dx-dy*dy))}
  m.renderOrder=i+1;g.add(m);scene.add(g);return {name,g,x:g.position.x,y:g.position.y};
 });
 if(kind==='jitda'){
  // Trace the folded top edge so the moving mouth disappears behind the paper.
  const blueprintOutline = 'M738 241 Q740 238 746 240 L893 274 Q896 275 900 272 L1010 221 Q1018 216 1017 225 L1008 284 Q1034 293 1028 323 Q1025 347 999 352 L984 407 L891 434 L747 409 L746 349 Q710 352 708 318 Q705 292 739 281 Z';
  const blueprint = mesh(texture(im,s.w,s.h,blueprintOutline));
  blueprint.renderOrder = s.parts.length + 1;
  scene.add(blueprint);
 }
 if(kind==='cmass'){
  // Keep the seat behind both passengers; only the near gunwale hides their feet.
  const hull=parts[4].g.children[0];hull.renderOrder=2.5;
  const rim=hull.clone();rim.material=hull.material.clone();
  rim.material.map=texture(im,s.w,s.h,'M371 694 C374 720 422 733 483 726 C546 721 596 696 614 671 C612 710 581 735 539 749 C484 769 418 760 392 738 Q375 722 371 694 Z');
  rim.renderOrder=6;parts[4].g.add(rim);
 }
 let running=false,phase=0,last=0,raf=0,returning=false,returnAt=0,returnPhase=0;
 function pose(t,amount=1){
  parts.forEach(p=>{p.g.position.set(p.x,p.y,0);p.g.rotation.set(0,0,0);p.g.scale.setScalar(1)});
  if(kind==='jitda'){
   const [reader,builder,helper,hammer]=parts.map(p=>p.g);
   const glance=Math.sin(t*1.85)*amount,nod=(1-Math.cos(t*2.5))*.5*amount;
   reader.rotation.set(.14*nod,.18*glance,.095*glance);reader.position.y-=11*nod;
   const beat=(t%1.45)/1.45;
   const lift=(ease(beat/.58)-ease((beat-.58)/.13))*amount;
   const impact=Math.sin(Math.PI*Math.min(1,Math.max(0,(beat-.70)/.22)))*amount;
   hammer.rotation.z=.44*lift-.055*impact;
   builder.rotation.set(.09*impact,-.10*lift,.055*lift);builder.position.y+=5*lift-8*impact;
   helper.rotation.set(.035*nod,.09*glance,-.045*glance);
  }else if(kind==='info'){
   parts.forEach((p,i)=>{const rise=ease(t/.65),land=ease((t-1.1-i*.48)/.55);const lift=(1-land)*rise;
    p.g.position.y+=(24+i*32)*lift*amount;p.g.rotation.y=Math.sin(t*1.4)*.025*lift*amount;
    p.g.position.y-=Math.sin(Math.min(1,Math.max(0,(t-1.65-i*.48)/.38))*Math.PI)*3*amount;
   });
  }else{
   const [wolf,cabbage,farmer,sheep,boat]=parts.map(p=>p.g);
   // One crossing: board at the left bank, then move ACROSS the vertical river.
   const ferry=ease((t-1.55)/3.55)*amount;
   const aboard=[ease(t/.95)*amount,ease((t-.32)/1.05)*amount];
   const rock=Math.sin(t*2.2)*.018*aboard[1],bob=Math.sin(t*3)*2.2*aboard[1];
   boat.position.x+=195*ferry;boat.position.y+=15*ferry+bob;boat.rotation.z=rock;
   // Feet land inside the opening, at different depths on either side of the bench.
   for(const [i,passenger,dx,dy,scale] of [[0,farmer,-48,22,.60],[1,sheep,50,32,.62]]){
    const p=aboard[i],x=boat.position.x+dx*Math.cos(rock)-dy*Math.sin(rock);
    const y=boat.position.y+dx*Math.sin(rock)+dy*Math.cos(rock);
    passenger.position.x+=(x-passenger.position.x)*p;passenger.position.y+=(y-passenger.position.y)*p+Math.sin(Math.PI*p)*38;
    passenger.scale.setScalar(1-(1-scale)*p);passenger.rotation.z=rock*p;
   }
   wolf.rotation.y=Math.sin(t*1.1)*.025*amount;
  }
  renderer.render(scene,camera);
 }
 function frame(now){const dt=Math.min(.05,(now-last)/1000||0);last=now;
  if(running){phase=Math.min(phase+dt,kind==='jitda'?10000:6.5);pose(phase)}
  else if(returning){const p=(now-returnAt)/650;pose(returnPhase,1-ease(p));if(p>=1){returning=false;phase=0;pose(0)}}
  if((running&&(kind==='jitda'||phase<6.5))||returning)raf=requestAnimationFrame(frame);else raf=0;
 }
 function play(force=false){if(reduced.matches&&!force)return;running=true;returning=false;phase=0;last=performance.now();if(!raf)raf=requestAnimationFrame(frame)}
 function stop(){if(!running)return;running=false;returning=true;returnAt=performance.now();returnPhase=phase;if(!raf){last=returnAt;raf=requestAnimationFrame(frame)}}
 function reset(){running=false;returning=false;phase=0;cancelAnimationFrame(raf);raf=0;pose(0)}
 card.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')play()});card.addEventListener('pointerleave',stop);
 reduced.addEventListener('change',reset);document.addEventListener('visibilitychange',()=>{if(document.hidden)reset()});pose(0);
 return {play,stop,reset,canvas};
}
export async function mountPublisherCards(){
 for(const kind of ['jitda','cmass','info']){
  const card=document.querySelector(`.${kind}-service`),original=card?.querySelector('.premium-card-art, .unified-card-art');
  if(!original)continue;
  try{
   const canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');
   await createArt(canvas,kind,card);
   if(kind==='jitda'){canvas.className='publisher-rig jitda-rig';original.append(canvas);original.classList.add('has-hover-art')}
   else{canvas.className='unified-card-art publisher-rig';canvas.setAttribute('role','img');canvas.setAttribute('aria-label',kind==='cmass'?'농부와 양이 배를 타고 강을 건너는 교과서':'차례로 맞물리는 입체 코딩 블록');original.replaceWith(canvas)}
  }catch(error){console.warn(`${kind} motion unavailable; retaining static art.`,error)}
 }
}

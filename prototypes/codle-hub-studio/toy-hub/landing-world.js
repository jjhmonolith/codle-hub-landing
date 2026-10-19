const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const mix=(a,b,t)=>a+(b-a)*t;
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t)};
const radians=degrees=>degrees*Math.PI/180;

// Every destination belongs to one curved world. The camera and its momentum
// are shared: no individual drifting or CSS transitions on card positions.
export function createLandingWorld({stage,cards,reduced,isBlocked}){
  const canvas=document.createElement('canvas');canvas.className='world-lines';canvas.setAttribute('aria-hidden','true');
  stage.insertBefore(canvas,stage.querySelector('.hero'));
  const ctx=canvas.getContext('2d');
  stage.classList.add('world-ready');
  const root=document.documentElement;
  const locations=[
    {angle:-139,radius:1.02,size:1.02},
    {angle:-64,radius:.97,size:.84},
    {angle:139,radius:1.03,size:.79},
    {angle:95,radius:.98,size:.96},
    {angle:40,radius:1.01,size:.89},
  ];
  const motion={orbit:0,velocity:0,lookX:0,lookY:0,x:0,y:0,activity:0};
  let width=0,height=0,progress=0,pointer=null,suppressUntil=0,lastStamp=0,lastSignature='',focused=false;
  function resize(){
    width=stage.clientWidth;height=stage.clientHeight;
    const ratio=Math.min(devicePixelRatio,1.5);
    canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
    ctx?.setTransform(ratio,0,0,ratio,0,0);lastSignature='';
  }
  resize();
  const canExplore=()=>progress>.72&&!reduced.matches&&!isBlocked();
  const isControl=target=>target.closest('.site-header,.chapter-nav,.preview,button');
  function release(cancel=false){
    if(!pointer)return;
    const current=pointer;pointer=null;
    if(stage.hasPointerCapture(current.id))stage.releasePointerCapture(current.id);
    stage.classList.remove('is-dragging');
    if(current.moved){
      focused=false;
      // A drag ending over a destination must never open it as a click.
      suppressUntil=performance.now()+450;
      if(cancel||performance.now()-current.lastTime>90)motion.velocity=0;
    }
  }
  stage.addEventListener('pointerdown',event=>{
    if(!canExplore()||event.button!==0||!event.isPrimary||isControl(event.target))return;
    pointer={id:event.pointerId,type:event.pointerType,x:event.clientX,y:event.clientY,startX:event.clientX,startY:event.clientY,lastTime:event.timeStamp,moved:false};
    focused=false;
    motion.velocity=0;
  });
  stage.addEventListener('pointermove',event=>{
    if(!canExplore())return;
    motion.lookX=clamp(event.clientX/width*2-1,-1,1);
    motion.lookY=clamp(event.clientY/height*2-1,-1,1);
    if(!pointer||pointer.id!==event.pointerId)return;
    const totalX=event.clientX-pointer.startX,totalY=event.clientY-pointer.startY;
    if(!pointer.moved&&Math.hypot(totalX,totalY)<7)return;
    if(!pointer.moved&&pointer.type==='touch'&&Math.abs(totalY)>Math.abs(totalX)){release(true);return}
    if(!pointer.moved){pointer.moved=true;stage.setPointerCapture(event.pointerId);stage.classList.add('is-dragging')}
    const dx=event.clientX-pointer.x,dy=event.clientY-pointer.y;
    const elapsed=clamp((event.timeStamp-pointer.lastTime)/1000,.008,.05);
    const delta=(dx+dy*.25)/(width<700?310:570);
    motion.orbit+=delta;
    motion.velocity=mix(motion.velocity,clamp(delta/elapsed,-2.2,2.2),.6);
    pointer.x=event.clientX;pointer.y=event.clientY;pointer.lastTime=event.timeStamp;
    event.preventDefault();
  },{passive:false});
  stage.addEventListener('pointerup',()=>release());
  stage.addEventListener('pointercancel',()=>release(true));
  stage.addEventListener('lostpointercapture',()=>release(true));
  stage.addEventListener('pointerleave',()=>{if(!pointer){motion.lookX=0;motion.lookY=0}});
  stage.addEventListener('dragstart',event=>event.preventDefault());
  stage.addEventListener('click',event=>{
    if(performance.now()<suppressUntil){event.preventDefault();event.stopImmediatePropagation()}
  },true);
  stage.addEventListener('focusin',event=>{focused=!!event.target.closest('.product-link')&&event.target.matches(':focus-visible');if(focused)motion.velocity=0});
  stage.addEventListener('focusout',()=>{focused=false});
  function reset(){
    release(true);motion.lookX=0;motion.lookY=0;motion.velocity=0;motion.orbit=0;motion.x=0;motion.y=0;motion.activity=0;lastSignature='';
  }
  function pause(){release(true);motion.lookX=0;motion.lookY=0;motion.velocity=0}
  addEventListener('blur',pause);
  function render(p,dt,stamp){
    progress=p;
    const mobile=width<700;
    if(p<.25&&(motion.orbit!==0||pointer))reset();
    if(p<.4){
      root.style.setProperty('--world-active','0');
      if(lastSignature){ctx?.clearRect(0,0,width,height);lastSignature=''}
      return;
    }
    const follow=1-Math.exp(-dt*4.8);
    motion.x=mix(motion.x,reduced.matches?0:motion.lookX,follow);
    motion.y=mix(motion.y,reduced.matches?0:motion.lookY,follow);
    if(!pointer&&!focused){
      motion.orbit+=motion.velocity*dt;
      motion.velocity*=Math.exp(-dt*3.4);
      if(Math.abs(motion.velocity)<.0005)motion.velocity=0;
    }
    const activity=pointer?.moved?1:clamp(Math.abs(motion.velocity)*1.4);
    motion.activity=mix(motion.activity,reduced.matches?0:activity,1-Math.exp(-dt*(activity>.1?10:3)));
    root.style.setProperty('--world-active',motion.activity.toFixed(3));
    root.style.setProperty('--world-look-x',`${motion.x*12}px`);
    root.style.setProperty('--world-look-y',`${motion.y*8}px`);
    const spread=reduced.matches?1:smooth(.43,.96,p);
    // A narrow viewport keeps its five destinations reachable while allowing
    // the same inertial camera gesture; full orbital travel is for wide screens.
    const sweep=(1-spread)*.32+(mobile?Math.sin(motion.orbit)*.23:motion.orbit);
    const yaw=motion.x*.19+Math.sin(motion.orbit*.6)*.12;
    const pitch=-motion.y*.11;
    const depth=Math.min(width,height)*.24;
    const focal=Math.max(width*.95,900);
    const center={x:width*.50,y:height*(mobile?.48:.49)};
    const orbitX=width*(mobile?.355:.43),orbitY=height*(mobile?.335:.34);
    function project(x,y,z){
      const xx=x*Math.cos(yaw)+z*Math.sin(yaw),zz=-x*Math.sin(yaw)+z*Math.cos(yaw);
      const yy=y*Math.cos(pitch)-zz*Math.sin(pitch),depthZ=y*Math.sin(pitch)+zz*Math.cos(pitch);
      const scale=focal/(focal-depthZ);
      return {x:center.x+xx*scale,y:center.y+yy*scale,z:depthZ,scale};
    }
    cards.forEach(({article,link},i)=>{
      const place=locations[i]||{angle:-140+i*360/cards.length,radius:1,size:.9};
      const theta=radians(mobile?[-133,-65,143,82,37][i]??place.angle:place.angle)+sweep;
      const near=Math.sin(theta+.6);
      const baseWidth=mobile?width*.35:Math.min(width*.205,height*.37,305);
      const sideScale=mobile?1:mix(.72,1,smooth(.1,.6,Math.abs(Math.sin(theta))));
      const desiredWidth=baseWidth*place.size*sideScale;
      const radius=place.radius*mix(.76,1,spread);
      const point=project(Math.cos(theta)*orbitX*radius,Math.sin(theta)*orbitY*radius,near*depth-(1-spread)*360);
      const size=desiredWidth*point.scale;
      // Keep complete destinations within the viewport, including narrow screens.
      const halfWidth=size*.57,halfHeight=size*.37+15;
      const x=clamp(point.x,halfWidth+12,width-halfWidth-12);
      const y=clamp(point.y,Math.max(92,halfHeight+70),height-halfHeight-58);
      const tilt=Math.sin(theta)*4-motion.velocity*2.5;
      const faceYaw=clamp(Math.cos(theta)*-13+yaw*30,-20,20);
      const facePitch=Math.sin(theta)*5-pitch*20;
      article.style.left=`${x.toFixed(2)}px`;article.style.top=`${y.toFixed(2)}px`;article.style.width=`${size.toFixed(2)}px`;
      article.style.transform=`translate(-50%,-50%) perspective(1100px) rotateX(${facePitch.toFixed(2)}deg) rotateY(${faceYaw.toFixed(2)}deg) rotateZ(${tilt.toFixed(2)}deg)`;
      article.style.zIndex=String(20+Math.round(point.z));
      article.style.setProperty('--world-bright',mix(.64,.84,clamp((point.z/depth+1)/2)).toFixed(3));
      article.style.setProperty('--world-speed',clamp(Math.abs(motion.velocity)*.6).toFixed(3));
      link.draggable=false;
    });
    // The faint meridians use the same camera, so their motion anchors the
    // destinations to a common volume instead of five unrelated parallax layers.
    const signature=[p.toFixed(4),yaw.toFixed(4),pitch.toFixed(4),sweep.toFixed(4)].join(':');
    if(!ctx||signature===lastSignature||stamp-lastStamp<32)return;
    lastSignature=signature;lastStamp=stamp;ctx.clearRect(0,0,width,height);
    if(spread<.01)return;
    ctx.lineWidth=.7;ctx.strokeStyle=`rgba(137,164,205,${(.05+motion.activity*.065)*spread})`;
    for(let ring=0;ring<5;ring++){
      const axis=ring*Math.PI/5+sweep*.25;
      ctx.beginPath();
      for(let s=0;s<=100;s++){
        const a=s/100*Math.PI*2;
        const point=project(Math.cos(a)*orbitX*Math.cos(axis),Math.sin(a)*orbitY,Math.cos(a)*depth*Math.sin(axis));
        if(s===0)ctx.moveTo(point.x,point.y);else ctx.lineTo(point.x,point.y);
      }
      ctx.stroke();
    }
  }
  return {render,resize,reset,pause};
}

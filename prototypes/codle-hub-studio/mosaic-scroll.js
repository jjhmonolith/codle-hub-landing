(() => {
 const story=document.querySelector('.scroll-story');
 const pin=story.querySelector('.scroll-pin');
 const tileList=[...pin.querySelectorAll('.tile')];
 const brand=pin.querySelector('.brand-reveal');
 const home=pin.querySelector('.hub-home');
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const clamp=v=>Math.max(0,Math.min(1,v));
 const ease=v=>{v=clamp(v);return v*v*(3-2*v)};
 let frame=0;
 const introStarted=performance.now();
 function paint(){
  frame=0;
  const p=motion.matches?0:clamp(-story.getBoundingClientRect().top/Math.max(1,story.offsetHeight-pin.clientHeight));
  const spread=motion.matches?0:1-ease((p-.36)/.64),w=pin.clientWidth,h=pin.clientHeight;
  pin.style.setProperty('--grid-opacity',spread);
  pin.style.setProperty('--brand-opacity',1-ease((p-.7)/.2));
  pin.style.setProperty('--brand-scale',1-.4*ease((p-.36)/.64));
  const elapsed=performance.now()-introStarted;
  const drawing=motion.matches?1:clamp((elapsed-150)/1600);
  pin.style.setProperty('--draw',1.01*(1-drawing));
  pin.style.setProperty('--fill-opacity',motion.matches?1:ease((elapsed-1800)/500));
  pin.style.setProperty('--copy-opacity',1-ease((p-.45)/.2));
  pin.style.setProperty('--hint-opacity',1-ease(p/.14));
  // Use layout geometry, not transformed rectangles, so reverse scrolling retraces the same path.
  tileList.forEach((tile,i)=>{
   let x=0,y=0;
   if(i===0)x=-(tile.offsetLeft+tile.offsetWidth+40);
   if(i===1)y=-(tile.offsetTop+tile.offsetHeight+40);
   if(i===2){x=w-tile.offsetLeft+40;y=-h*.1;}
   if(i===3){x=-w*.16;y=h-tile.offsetTop+40;}
   if(i===4){x=w-tile.offsetLeft+40;y=h*.22;}
   tile.style.setProperty('--tx',x*spread+'px');tile.style.setProperty('--ty',y*spread+'px');
   tile.inert=!motion.matches&&p<.98;
  });
  brand.inert=!motion.matches&&p>.45;
  home.inert=!motion.matches&&p<.98; home.style.opacity=motion.matches?1:ease((p-.9)/.1);
  if(!motion.matches&&elapsed<2300)schedule();
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(paint)}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);addEventListener('pageshow',schedule);motion.addEventListener('change',schedule);
 brand.querySelector('button').addEventListener('click',()=>scrollTo({top:motion.matches?pin.querySelector('.mosaic').offsetTop:story.offsetTop+story.offsetHeight-pin.clientHeight,behavior:motion.matches?'instant':'smooth'}));
 paint();
})();



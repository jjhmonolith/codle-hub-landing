(()=>{
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(pointer:fine)');
 let x=0,y=0,tx=0,ty=0,frame=0;
 function tick(){frame=0;if(document.hidden||reduced.matches||document.body.classList.contains('has-landing'))return;
 x+=(tx-x)*.055;y+=(ty-y)*.055;
 document.documentElement.style.setProperty('--scene-x',x.toFixed(3)+'px');document.documentElement.style.setProperty('--scene-y',y.toFixed(3)+'px');
 if(Math.abs(tx-x)+Math.abs(ty-y)>.03)frame=requestAnimationFrame(tick);}
 function request(){if(!frame)frame=requestAnimationFrame(tick);}
 addEventListener('pointermove',e=>{if(!fine.matches||reduced.matches||document.body.classList.contains('has-landing'))return;tx=(e.clientX/innerWidth-.5)*18;ty=(e.clientY/innerHeight-.5)*14;request();},{passive:true});
 document.documentElement.addEventListener('pointerleave',()=>{tx=ty=0;request();});
 reduced.addEventListener('change',()=>{tx=ty=x=y=0;document.documentElement.style.setProperty('--scene-x','0px');document.documentElement.style.setProperty('--scene-y','0px');});
})();

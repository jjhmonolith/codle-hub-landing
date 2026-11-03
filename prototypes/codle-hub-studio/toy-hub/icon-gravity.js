(() => {
  const stage = document.querySelector('.icon-gravity');
  if (!stage) return;
  const icons = ['lesson-plan', 'entry', 'python', 'ai-quiz', 'scratch', 'worksheet', 'codap', 'video', 'makecode', 'board', 'ai-html', 'quiz', 'ai-socroom'];
  const balls = Array.from({length: icons.length}, (_, i) => {
    const el = document.createElement('span');
    el.className = 'icon-marble';
    const img = document.createElement('img');
    img.src = `assets/card-visuals/codle-${icons[i % icons.length]}.svg`;
    img.alt = '';
    el.append(img); stage.append(el);
    return {el, x:0, y:0, vx:0, vy:0, angle:0, spin:0, r:0, delay:i * .13};
  });
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let width=0, height=0, time=0, last=0, accumulator=0, frame=0, started=false;
  function reset() {
    width = stage.clientWidth; height = stage.clientHeight; time=0; last=0; accumulator=0;
    balls.forEach((b,i) => {
      b.r = Math.min(32, Math.max(21, width / 16)) * (i%3===0 ? 1.12 : 1);
      b.x = width * (.22 + ((i*37)%61)/100);
      b.y = -b.r * 2; b.vx = Math.sin(i*2.4)*75; b.vy=0;
      b.angle = (i%5-2)*.15; b.spin=Math.sin(i*1.7)*2;
      b.el.style.width=b.el.style.height=`${b.r*2}px`;
    });
  }
  function step(dt) {
    time += dt;
    const active=balls.filter(b=>time>=b.delay);
    active.forEach(b=>{
      b.vy += 800*dt; b.vx *= .998; b.spin *= .997;
      b.x += b.vx*dt; b.y += b.vy*dt; b.angle += b.spin*dt;
      if(b.x<b.r){b.x=b.r;b.vx=Math.abs(b.vx)*.6;}
      if(b.x>width-b.r){b.x=width-b.r;b.vx=-Math.abs(b.vx)*.6;}
      if(b.y>height-b.r-3){b.y=height-b.r-3;b.vy=-Math.abs(b.vy)*.38;b.vx*=.93;b.spin*=.92;if(Math.abs(b.vy)<12)b.vy=0;}
    });
    for(let pass=0;pass<4;pass++) for(let i=0;i<active.length;i++) for(let j=i+1;j<active.length;j++){
      const a=active[i],b=active[j],dx=b.x-a.x,dy=b.y-a.y;
      const dist=Math.hypot(dx,dy)||.001, overlap=a.r+b.r-dist;
      if(overlap<=0)continue;
      const nx=dx/dist,ny=dy/dist;
      a.x-=nx*overlap*.5;a.y-=ny*overlap*.5;b.x+=nx*overlap*.5;b.y+=ny*overlap*.5;
      const speed=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;
      if(speed<0){const impulse=-speed*.68;a.vx-=impulse*nx;a.vy-=impulse*ny;b.vx+=impulse*nx;b.vy+=impulse*ny;a.spin-=ny*impulse*.008;b.spin+=ny*impulse*.008;}
    }
    active.forEach(b=>{b.x=Math.max(b.r,Math.min(width-b.r,b.x));b.y=Math.min(height-b.r-3,b.y);});
  }
  function draw(){balls.forEach(b=>{b.el.style.opacity=time>=b.delay?'1':'0';b.el.style.transform=`translate(${b.x-b.r}px,${b.y-b.r}px) rotate(${b.angle}rad)`;});}
  function tick(now){
    if(document.hidden){last=0;frame=0;return;}
    accumulator+=last?Math.min((now-last)/1000,.05):0;last=now;
    while(accumulator>=1/120){step(1/120);accumulator-=1/120;}
    draw();
    if(time<9)frame=requestAnimationFrame(tick);else frame=0;
  }
  function run(){
    cancelAnimationFrame(frame);reset();
    if(reduced.matches){for(let i=0;i<1080;i++)step(1/120);draw();frame=0;}
    else{draw();frame=requestAnimationFrame(tick);}
  }
  function start(){if(started||!document.querySelector('.intro-finished'))return;started=true;run();observer.disconnect();}
  const observer=new MutationObserver(start);
  observer.observe(document.documentElement,{attributes:true,subtree:true,attributeFilter:['class']});
  new ResizeObserver(()=>{if(started && Math.abs(stage.clientWidth-width)>1)run();}).observe(stage);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&started&&time<9&&!frame){last=0;frame=requestAnimationFrame(tick);}});
  reduced.addEventListener('change',()=>{if(started)run();});
  start();
})();

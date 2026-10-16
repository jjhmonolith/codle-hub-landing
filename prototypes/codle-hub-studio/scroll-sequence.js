(()=>{
  const stage=document.querySelector('.stage'),story=document.querySelector('.story');
  const brands=[...document.querySelectorAll('.brand')],panels=[...document.querySelectorAll('.panel')];
  const heroElement=document.querySelector('.hero');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const caption=document.querySelector('.scroll-caption'),skip=document.querySelector('.skip-intro');
  const clamp=n=>Math.max(0,Math.min(1,n));
  const smooth=n=>{n=clamp(n);return n*n*(3-2*n)};
  const between=(p,a,b)=>smooth((p-a)/(b-a));
  const lerp=(a,b,p)=>a+(b-a)*p;
  let frame=0;
  function paint(){
    frame=0;
    const w=stage.clientWidth,h=stage.clientHeight,mobile=w<=700;
    const distance=Math.max(1,story.offsetHeight-h);
    const p=reduced.matches?1:clamp(-story.getBoundingClientRect().top/distance);
    // Separate logo hold/dock, hero reveal/read, and gallery reveal.
    const travel=between(p,.13,.32),hero=between(p,.35,.45);
    const gallery=between(p,.62,.73),intro=1-between(p,.13,.23);
    stage.dataset.scene=p<.35?'logo':p<.62?'hero':'pages';
    stage.style.setProperty('--progress',p);
    stage.style.setProperty('--hero',hero);
    stage.style.setProperty('--gallery',gallery);
    stage.style.setProperty('--intro',intro);
    heroElement.style.top=lerp(47,mobile?19:23,gallery)+'%';
    heroElement.style.transform=`translateY(calc(-50% + ${(1-hero)*18}px)) scale(${lerp(1,mobile?.69:.68,gallery)})`;
    const positions=brands.map((brand,i)=>{
      const width=i===0?Math.min(w*(mobile?.72:.34),450):Math.min(w*(mobile?.76:.36),480);
      const ratio=i===0?774.61/304.29:775/215;
      const height=width/ratio;
      const finalWidth=i===0?(mobile?63:90):(mobile?77:110);
      const margin=mobile?22:40;
      const startX=mobile?w*.5:w*(i===0?.285:.715);
      const startY=mobile?h*(i===0?.35:.56):h*.46;
      const cx=lerp(startX,i===0?margin+finalWidth/2:w-margin-finalWidth/2,travel);
      const cy=lerp(startY,i===0?25+finalWidth/ratio/2:h-24-finalWidth/ratio/2,travel);
      const scale=lerp(1,finalWidth/width,travel);
      Object.assign(brand.style,{width:width+'px',height:height+'px',transform:`translate3d(${cx-width/2}px,${cy-height/2}px,0) scale(${scale})`});
      return {cx,cy,width:width*scale,height:height*scale};
    });
    const revealStarts=[.73,.77,.81,.85,.89];
    panels.forEach((panel,i)=>{
      const reveal=between(p,revealStarts[i],revealStarts[i]+.065);
      panel.style.setProperty('--reveal',reveal);
      panel.dataset.reveal=reveal.toFixed(4);
    });
    skip.hidden=reduced.matches;
    skip.textContent=p>.96?'처음으로 ↑':'바로 둘러보기 ↘';
    document.querySelector('.edition').setAttribute('aria-hidden',intro<.5?'true':'false');
    heroElement.setAttribute('aria-hidden',hero<.5?'true':'false');
    heroElement.querySelector('.description').setAttribute('aria-hidden',gallery>.95?'true':'false');
    caption.textContent=p<.13?'스크롤해 다음 장면으로':p<.35?'배움의 시작':p<.62?'가능성의 다음 장면으로':p<.96?'다섯 가지 배움의 경험':'궁금한 장면을 눌러보세요';
    window.dispatchEvent(new CustomEvent('hub:frame',{detail:{progress:p,travel,positions,w,h,reduced:reduced.matches}}));
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(paint)}
  skip.addEventListener('click',()=>{
    const top=scrollY+story.getBoundingClientRect().top+(Number(stage.style.getPropertyValue('--progress'))>.96?0:story.offsetHeight-stage.clientHeight);
    window.scrollTo({top,behavior:reduced.matches?'instant':'smooth'});
  });
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule);
  addEventListener('hub:ready',schedule);
  reduced.addEventListener('change',schedule);
  paint();
})();

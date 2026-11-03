(() => {
 const root=document.querySelector('.ad-carousel');if(!root)return;
 const track=root.querySelector('.ad-track'),slides=[...root.querySelectorAll('.ad-slide')],dots=[...root.querySelectorAll('.ad-dot')],pause=root.querySelector('.ad-pause');
 let index=0,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,timer;
 function show(i){index=(i+slides.length)%slides.length;track.style.transform=`translateX(-${index*100}%)`;slides.forEach((slide,n)=>{slide.inert=n!==index;slide.setAttribute('aria-hidden',String(n!==index))});dots.forEach((d,n)=>d.setAttribute('aria-current',String(n===index)));root.querySelector('.ad-count').textContent=`0${index+1} / 03`;}
 function stop(){clearInterval(timer)}
 function play(){stop();if(!paused&&!root.matches(':hover')&&!root.contains(document.activeElement)&&!document.hidden)timer=setInterval(()=>show(index+1),5500)}
 root.querySelector('.ad-prev').onclick=()=>{show(index-1);play()};root.querySelector('.ad-next').onclick=()=>{show(index+1);play()};dots.forEach((d,n)=>d.onclick=()=>{show(n);play()});
 function sync(){pause.textContent=paused?'▶':'Ⅱ';pause.setAttribute('aria-label',paused?'광고 자동 재생':'광고 일시정지')}
 pause.onclick=()=>{paused=!paused;sync();play()};root.addEventListener('mouseenter',stop);root.addEventListener('mouseleave',play);root.addEventListener('focusin',stop);root.addEventListener('focusout',()=>setTimeout(play,0));document.addEventListener('visibilitychange',play);
 let x;root.addEventListener('touchstart',e=>{x=e.touches[0].clientX;stop()},{passive:true});root.addEventListener('touchend',e=>{if(x!==undefined&&Math.abs(e.changedTouches[0].clientX-x)>45)show(index+(e.changedTouches[0].clientX<x?1:-1));x=undefined;play()},{passive:true});show(0);sync();play();
})();

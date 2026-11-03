(() => {
 const section=document.querySelector('#story-jitda');if(!section)return;
 const cards=[...section.querySelectorAll('.jitda-feature')],reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const track=document.createElement('div');track.className='jitda-scroll-track';section.before(track);track.append(section);
 section.classList.add('jitda-motion-ready');const heading=section.querySelector('.jitda-overview-heading');heading.removeAttribute('data-reveal');let queued=false;
 const ease=n=>{n=Math.max(0,Math.min(1,n));return n*n*(3-2*n)};
 function render(){queued=false;
  const desktop=innerWidth>=1100,rect=track.getBoundingClientRect();
  const progress=(90-rect.top)/Math.max(1,track.offsetHeight-section.offsetHeight);
  const entry=reduced.matches?1:ease((innerHeight*.55-rect.top)/(innerHeight*.3));heading.style.opacity=entry;heading.style.filter=`blur(${(1-entry)*6}px)`;heading.style.transform=`translateY(${(1-entry)*22}px)`;
  cards.forEach((card,i)=>{
   const amount=reduced.matches?1:desktop?ease((progress-.08-i*.24)/.22):ease((innerHeight*.65-card.getBoundingClientRect().top)/160);
   card.style.setProperty('--card-reveal',amount);
   card.inert=amount<.01;
  });
 }
 function schedule(){if(!queued){queued=true;requestAnimationFrame(render)}}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);reduced.addEventListener('change',schedule);render();
})();

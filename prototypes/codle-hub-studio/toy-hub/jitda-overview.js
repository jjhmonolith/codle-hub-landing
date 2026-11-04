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
   const video=card.querySelector('video');
   if(video){
    const box=card.getBoundingClientRect();
    const playing=!document.hidden&&amount>.55&&box.bottom>90&&box.top<innerHeight;
    video.muted=true;
    if(playing&&video.paused)video.play().catch(()=>{});
    else if(!playing&&!video.paused)video.pause();
   }
  });
 }
 // Follow the input only while typing, then restore the complete recording.
 const build=section.querySelector('.jitda-build video');
 if(build){
  build.defaultPlaybackRate=1.3;
  build.playbackRate=1.3;
  build.style.objectFit='cover';
  build.style.objectPosition='left center';
  let motionFrame=0;
  function frame(){
   const t=build.currentTime;
   const zoom=reduced.matches?0:ease(t/1.15)*(1-ease((t-11.8)/2.2));
   const pan=ease((t-7.0)/1.6)*(1-ease((t-11.8)/2.2));
   build.style.transformOrigin=`0% ${100*(1-pan)}%`;
   build.style.transform=`scale(${1+zoom*.48})`;
   motionFrame=build.paused?0:requestAnimationFrame(frame);
  }
  build.addEventListener('play',()=>{if(!motionFrame)frame()});
  build.addEventListener('seeked',()=>{if(!motionFrame)frame()});
  reduced.addEventListener('change',()=>{if(!motionFrame)frame()});
 }
 const result=section.querySelector('.jitda-result video');
 if(result){
  result.defaultPlaybackRate=1.3;
  result.playbackRate=1.3;
  let resultFrame=0;
  function animateResult(){
   const t=result.currentTime;
   // Keep the recorded typing intact; return to the full app before the result hold.
   const focus=reduced.matches?0:ease((t-1)/1.6)*(1-ease((t-11)/2.2));
   result.style.transformOrigin='50% 88%';
   result.style.transform=`scale(${1+focus*.10})`;
   resultFrame=result.paused?0:requestAnimationFrame(animateResult);
  }
  result.addEventListener('play',()=>{if(!resultFrame)animateResult()});
  result.addEventListener('seeked',()=>{if(!resultFrame)animateResult()});
  reduced.addEventListener('change',()=>{if(!resultFrame)animateResult()});
 }
 function schedule(){if(!queued){queued=true;requestAnimationFrame(render)}}
 document.addEventListener('visibilitychange',schedule);
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);reduced.addEventListener('change',schedule);render();
})();

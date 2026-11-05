(() => {
 const jitda=document.querySelector('#story-jitda');
 jitda.querySelector('.jitda-overview-heading').append(jitda.querySelector('.jitda-overview-actions'));
 const camp=document.querySelector('#story-camp'),heading=document.createElement('div');
 heading.className='camp-overview-heading';camp.prepend(heading);
 heading.append(camp.querySelector('.camp-service-label'),camp.querySelector('.quiet-actions'));
 camp.querySelector('.camp-photo-mosaic').before(camp.querySelector('.camp-overview-copy'));
 const wide=document.createElement('div');wide.className='hub-wide-content';
 document.querySelector('main').after(wide);
 ['.hub-partners','.hub-faq','.codle-footer'].forEach(q=>wide.append(document.querySelector(q)));
 const dialog=document.querySelector('#inquiry-dialog'),interest=document.querySelector('#inquiry-interest');
 const sections=[['#story-codle','subscription'],['#story-jitda','hackathon'],['#story-camp','camp']];
 let previous='',queued=false;
 function update(){
  queued=false;const wideTop=wide.getBoundingClientRect().top;const end=wideTop<=innerHeight*.55;
  const formOpacity=Math.max(0,Math.min(1,(wideTop-innerHeight*.55)/(innerHeight*.2)));
  if(dialog.classList.contains('is-persistent'))dialog.style.opacity=formOpacity;
  document.documentElement.classList.toggle('inquiry-section-ended',end);if(dialog.classList.contains('is-persistent'))dialog.inert=end;
  let current='general';
  for(const [selector,key] of sections){if(document.querySelector(selector).getBoundingClientRect().top<=innerHeight*.45)current=key;}
  if(!document.body.classList.contains('six-card-hub')&&current!==previous){previous=current;interest.value=current;interest.dispatchEvent(new Event('change',{bubbles:true}));}
  if(!document.body.classList.contains('six-card-hub')&&current==='subscription'&&interest.value==='subscription')document.querySelector('#inquiry-title').textContent='코들 도입 문의';
 }
 function schedule(){if(!queued){queued=true;requestAnimationFrame(update)}}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);
 // Inquiry links in the full-width section return to the visible service form.
 document.querySelectorAll('[data-inquiry]').forEach(button=>button.addEventListener('click',()=>{
  if(!document.body.classList.contains('six-card-hub')&&innerWidth>=1000&&document.documentElement.classList.contains('inquiry-section-ended'))document.querySelector('#story-camp').scrollIntoView({behavior:'smooth',block:'start'});
 }));
 const partners=document.querySelector('.hub-partners');
 const unique=new Map();partners.querySelectorAll('img').forEach(img=>unique.set(img.getAttribute('src'),img));
 const rows=document.createElement('div');rows.className='partner-logo-wall';
 const imgs=[...unique.values()];
 for(let n=0;n<3;n++){
  const row=document.createElement('div');row.className='partner-wall-row';
  const track=document.createElement('div');track.className='partner-wall-track';
  const group=document.createElement('div');group.className='partner-wall-set';
  imgs.filter((_,i)=>i%3===n).forEach(img=>{const cell=document.createElement('div');cell.append(img.cloneNode());group.append(cell)});
  const copy=group.cloneNode(true);copy.setAttribute('aria-hidden','true');track.append(group,copy);row.append(track);rows.append(row);
 }
 partners.querySelectorAll('.partner-group').forEach(e=>e.remove());
 partners.querySelector('.partners-about').before(rows);
 document.querySelectorAll('.service-link-arrow,.card-arrow').forEach(el=>{el.innerHTML='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>'});
 // Reveal from scroll position only, after a section has entered the viewport.
 const reduceMotion=matchMedia('(prefers-reduced-motion:reduce)');
 const campTexts=[camp.querySelector('.camp-overview-heading'),camp.querySelector('.camp-overview-copy h2'),camp.querySelector('.camp-overview-bottom p')];
 const partnerTitle=document.querySelector('#partners-title');
 [...camp.querySelectorAll('[data-reveal]'),partnerTitle].filter(Boolean).forEach(el=>{el.removeAttribute('data-reveal');el.classList.remove('is-visible','revealed');});
 const photos=[...camp.querySelectorAll('.camp-photo')];
 const ease=n=>{n=Math.max(0,Math.min(1,n));return n*n*(3-2*n)};
 function paint(el,n,text=false){if(!el)return;const a=reduceMotion.matches?1:ease(n);el.style.opacity=a;el.style.transform=`translate3d(0,${(1-a)*(text?22:48)}px,0)`;el.style.filter=text?`blur(${(1-a)*6}px)`:'none';}
 function revealSections(){
  const y=camp.getBoundingClientRect().top,h=innerHeight;
  campTexts.forEach((el,i)=>paint(el,(h*.56-y-i*30)/(h*.23),true));
  // Finish every photo before the camp reaches its main viewing position.
  photos.forEach((el,i)=>paint(el,(h*.46-y-i*h*.035)/(h*.15)));
  // Measure a stationary parent: the animated title must not alter its trigger.
  const py=partnerTitle.parentElement.getBoundingClientRect().top;
  paint(partnerTitle,(h*.65-py)/(h*.25),true);
  // The logo wall stays hidden until the heading is fully sharp.
  const logoProgress=(h*.40-py)/(h*.20);
  paint(rows,logoProgress);
  rows.inert=!reduceMotion.matches&&logoProgress<=0;
  rows.querySelectorAll('.partner-wall-track').forEach(track=>track.style.animationPlayState=logoProgress>0?'running':'paused');
 }
 addEventListener('scroll',revealSections,{passive:true});addEventListener('resize',revealSections);reduceMotion.addEventListener('change',revealSections);revealSections();

 update();
})();

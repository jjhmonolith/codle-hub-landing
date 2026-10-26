(() => {
 const hero=document.querySelector('.gl-hero'),slides=[...document.querySelectorAll('[data-slide]')],selectors=[...document.querySelectorAll('[data-select]')],pause=document.querySelector('.gl-pause'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let active=0,progress=0,last=performance.now(),paused=reduced.matches,interacting=false,visible=true,introPlaying=!!document.querySelector('.gl-intro');
 let reveal=null,queued=null;
 function show(index,announce=true){
  const next=(index+slides.length)%slides.length;
  // Finish one continuous reveal before accepting the latest requested destination.
  if(reveal){queued={index:next,announce};return;}
  const previous=active;
  const animate=next!==previous&&!introPlaying&&!reduced.matches;
  active=next;
  slides.forEach((slide,i)=>{
   slide.inert=i!==active;slide.setAttribute('aria-hidden',String(i!==active));
   slide.classList.toggle('is-active',i===active);
   const leaving=animate&&i===previous;
   slide.classList.toggle('is-leaving',leaving);
   slide.hidden=i!==active&&!leaving;
  });
  if(animate){
   const incoming=slides[active];
   incoming.classList.add('is-revealing');
   // The next scene itself fills the expanding aperture; the old scene stays opaque underneath.
   reveal=incoming.animate([
    {clipPath:'circle(0% at 50% 55%)'},
    {clipPath:'circle(80% at 50% 55%)'}
   ],{duration:1250,easing:'cubic-bezier(.65,0,.2,1)',fill:'both'});
   const animation=reveal;
   animation.onfinish=()=>{
    slides[previous].hidden=true;slides[previous].classList.remove('is-leaving');
    incoming.classList.remove('is-revealing');
    animation.cancel();reveal=null;
    const request=queued;queued=null;
    if(request&&request.index!==active)show(request.index,request.announce);
   };
  }
  selectors.forEach((s,i)=>s.setAttribute('aria-pressed',String(i===active)));
  progress=0;hero.style.setProperty('--progress',0);
  if(announce)document.querySelector('#gl-status').textContent=slides[active].getAttribute('aria-label');
  syncMotion();
 }
 // Focus holds the selected product, while its scenery keeps moving until explicitly paused.
 function syncMotion(){
  const playing=!introPlaying&&!paused&&visible&&!document.hidden;
  hero.style.setProperty('--motion-state',playing?'running':'paused');
  hero.dispatchEvent(new CustomEvent('codle:scene-state',{detail:{active,playing,reduced:reduced.matches}}));
 }
 show(0,false);
 document.addEventListener('codle:intro-complete',()=>{introPlaying=false;show(0,false);last=performance.now();syncMotion()});
 function pauseUI(){pause.textContent=paused?'▶':'Ⅱ';pause.setAttribute('aria-pressed',String(paused));pause.setAttribute('aria-label',paused?'배경 움직임과 자동 전환 재생':'배경 움직임과 자동 전환 일시정지');syncMotion()}
 selectors.forEach((b,i)=>b.addEventListener('click',()=>show(i)));document.querySelector('[data-prev]').addEventListener('click',()=>show((queued?.index??active)-1));document.querySelector('[data-next]').addEventListener('click',()=>show((queued?.index??active)+1));pause.addEventListener('click',()=>{paused=!paused;pauseUI()});pauseUI();
 hero.addEventListener('focusin',e=>{interacting=e.target!==pause;syncMotion()});hero.addEventListener('focusout',e=>{interacting=hero.contains(e.relatedTarget)&&e.relatedTarget!==pause;syncMotion()});
 new IntersectionObserver(([e])=>{visible=e.isIntersecting;syncMotion()}).observe(hero);
 document.addEventListener('visibilitychange',()=>{last=performance.now();syncMotion()});
 reduced.addEventListener('change',()=>{paused=reduced.matches;if(reduced.matches&&reveal)reveal.finish();pauseUI()});
 function tick(now){const delta=Math.min(now-last,100);last=now;if(!introPlaying&&!reveal&&!paused&&!interacting&&visible&&!document.hidden){progress+=delta/8500;if(progress>=1)show(active+1,false);hero.style.setProperty('--progress',progress)}requestAnimationFrame(tick)}requestAnimationFrame(tick);

})();
new IntersectionObserver(([entry]) => document.querySelector('.gl-header').classList.toggle('on-paper',!entry.isIntersecting),{rootMargin:'-88px 0px 0px 0px'}).observe(document.querySelector('.gl-hero'));

// One shared timeline keeps logo, curtain and product arrival in sync when paused.
(() => {
 const intro=document.querySelector('.gl-intro');
 if(!intro)return;
 const button=intro.querySelector('.gl-intro-pause');
 const skip=intro.querySelector('.gl-intro-next');
 const header=document.querySelector('.gl-header');
 const hero=document.querySelector('.gl-hero');
 const content=[document.querySelector('main'),header,document.querySelector('.codle-footer')].filter(Boolean);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const animations=[];
 let paused=false,finished=false,started=false;
 const ease='cubic-bezier(.22,1,.36,1)';
 const end=4920;
 function motion(el,frames,delay,duration,easing=ease,fill='both'){
  const a=el.animate(frames,{delay,duration,easing,fill});
  a.pause();a.currentTime=0;animations.push(a);return a;
 }
 function finish(){
  if(finished)return;
  finished=true;
  const moveFocus=intro.contains(document.activeElement);
  intro.hidden=true;
  animations.forEach(a=>a.cancel());
  document.documentElement.classList.remove('intro-playing');
  content.forEach(el=>el.inert=false);
  header.classList.remove('is-intro');
  document.removeEventListener('visibilitychange',sync);
  window.removeEventListener('resize',layoutPortal);
  window.removeEventListener('resize',layoutLetters);
  reduced.removeEventListener('change',onReduced);
  document.dispatchEvent(new Event('codle:intro-complete'));
  if(moveFocus){hero.tabIndex=-1;hero.focus({preventScroll:true})}
 }
 function sync(){
  if(finished)return;
  const running=started&&!paused&&!document.hidden;
  // All animations start at the same document-timeline timestamp.
  const now=document.timeline.currentTime;
  animations.forEach(a=>{if(running){const time=a.currentTime||0;a.play();a.startTime=now-time}else a.pause()});
  button.textContent=paused?'▶':'Ⅱ';
  button.setAttribute('aria-pressed',String(paused));
  button.setAttribute('aria-label',paused?'도입 화면 재생':'도입 화면 일시정지');
 }
 function onReduced(){if(reduced.matches)finish()}
 button.addEventListener('click',()=>{paused=!paused;sync()});
 skip.addEventListener('click',e=>{e.preventDefault();finish()});
 reduced.addEventListener('change',onReduced);
 // Direct links and restored scroll positions should keep their destination.
 if(reduced.matches||!intro.animate||window.scrollY>80||(location.hash&&location.hash!=='#top')){finish();return}
 document.documentElement.classList.add('intro-playing');
 intro.hidden=false;
 header.classList.add('is-intro');
 content.forEach(el=>el.inert=true);
 document.addEventListener('visibilitychange',sync);
 const wordmark=intro.querySelector('.gl-intro-wordmark');
 const copy=intro.querySelector('.gl-intro-copy');
 // Normalized motion sampled from the reference's rendered SVG. Artwork is
 // Codle's; glyph widths stay constant while their positions converge.
 const referenceMotion={"duration":4920,"type":[[335,0.3372,0.0024,0.3017,0.0591],[438,0.252,0.1399,0.2328,0.1994],[546,0.1392,0.3444,0.1316,0.3731],[651,0.0824,0.5499,0.0787,0.5502],[772,0.0463,0.7751,0.045,0.7588],[886,0.0254,0.957,0.0255,0.9661],[973,0.0136,1,0.0142,1],[1058,0.0068,1,0.0076,1],[1167,0.0018,1,0.0024,1],[1272,0.0001,1,0.0003,1],[1381,0,1,0,1],[1483,0,1,0,1],[1581,0,1,0,1],[1682,0,1,0,1],[1783,0,1,0,1],[1892,0,1,0,1],[2002,0,1,0,1],[2117,0,1,0,1],[2222,0,1,0,1],[2332,0,1,0,1],[2439,0,1,0,1],[2542,0,1,0,1],[2635,0,1,0,1],[2736,0,1,0,1],[2827,0,1,0,1],[2936,0,1,0,1],[3042,0,1,0,1],[3139,0,1,0,1],[3246,0,1,0,1],[3355,0,1,0,1],[3464,0,0.9867,0,0.9867],[3570,0,0.8046,0.0052,0.8046],[3662,0.0007,0.6438,0.0192,0.6438],[3752,0.0098,0.4832,0.0455,0.4832],[3859,0.0409,0.2905,0.1037,0.2905],[3965,0.1078,0.1084,0.2262,0.1084],[4071,0.2843,0,0.3301,0],[4170,0.3719,0,0.3301,0],[4278,0.3719,0,0.3301,0],[4376,0.3719,0,0.3301,0],[4479,0.3719,0,0.3301,0],[4591,0.3719,0,0.3301,0],[4702,0.3719,0,0.3301,0],[4812,0.3719,0,0.3301,0]],"shapes":[[[438,70.2234,-78.3388,0,-27.7234],[546,67.2581,-67.2409,0.0035,102.4195],[651,63.2333,-55.4925,0.0507,105.2403],[772,57.2445,-42.9903,0.1452,106.2516],[886,51.0337,-33.4917,0.277,103.7782],[973,45.7307,-27.0676,0.3947,98.7663],[1058,41.4361,-22.6765,0.4805,92.7754],[1167,36.4421,-18.2874,0.5682,83.9408],[1272,32.2431,-15.0939,0.6335,75.3715],[1381,28.2743,-12.434,0.6899,66.6786],[1483,24.917,-10.4262,0.7342,59.072],[1581,22.0619,-8.878,0.7698,52.5063],[1682,19.3096,-7.514,0.8026,46.1331],[1783,16.815,-6.38,0.8312,40.3358],[1892,14.4175,-5.3761,0.8577,34.7493],[2002,12.2404,-4.5334,0.881,29.6613],[2117,10.1555,-3.7844,0.9027,24.7692],[2222,8.4583,-3.2143,0.9199,20.7664],[2332,6.8123,-2.693,0.9363,16.8589],[2439,5.31,-2.2426,0.9508,13.2634],[2542,4.0087,-1.8705,0.9631,10.1198],[2635,2.9503,-1.5675,0.973,7.5341],[2736,1.8538,-1.1497,0.9831,4.7971],[2827,0.9696,-0.6882,0.9912,2.5377],[2936,0,0,1,0],[3042,-0.83,0.8014,1.0074,-2.227],[3139,-1.5449,1.7113,1.0137,-4.1895],[3246,-2.2799,2.9418,1.0199,-6.2534],[3355,-2.9475,4.4213,1.0255,-8.171],[3464,-3.5576,6.1974,1.0303,-9.9594],[3570,-4.0869,8.1861,1.0342,-11.5342],[3662,-4.5209,10.2405,1.0371,-12.8381],[3752,-4.9253,12.6339,1.0396,-14.0642],[3859,-5.37,16.1016,1.0423,-15.4404],[3965,-5.7642,20.1808,1.045,-16.643],[4071,-6.3312,25.7793,1.0483,-17.7232],[4170,-7.0627,32.6415,1.052,-18.4884],[4278,-8.1938,43.4033,1.0587,-19.1478],[4376,-9.0962,45.3438,1.074,-19.6197],[4479,-9.9788,52.4657,1.133,-19.8381],[4591,-12.3368,53.7014,1.1415,-19.7113],[4702,-15.7707,54.486,1.1458,-19.112],[4812,-20.1245,54.9702,1.1481,-18.0053]],[[438,-71.8855,64.7623,0.004,162.9345],[546,-68.076,54.9063,0.0541,162.7529],[651,-63.2331,44.5603,0.1354,161.0809],[772,-56.5196,33.7191,0.2688,156.0421],[886,-49.9001,25.6467,0.398,147.3827],[973,-44.4148,20.2963,0.4917,137.1611],[1058,-40.053,16.7053,0.558,127.1751],[1167,-35.0517,13.1854,0.627,114.0616],[1272,-30.8957,10.6802,0.68,102.1563],[1381,-27.003,8.6402,0.7267,90.4285],[1483,-23.7342,7.1362,0.7641,80.2745],[1581,-20.9699,6.0027,0.7947,71.5224],[1682,-18.3179,5.0275,0.8231,63.0063],[1783,-15.9244,4.2372,0.8481,55.2273],[1892,-13.6326,3.5562,0.8715,47.6951],[2002,-11.5582,3.001,0.8922,40.8011],[2117,-9.5773,2.5223,0.9116,34.1416],[2222,-7.9689,2.1687,0.9271,28.6702],[2332,-6.412,1.8548,0.9418,23.3102],[2439,-4.9935,1.5915,0.955,18.3626],[2542,-3.7667,1.3799,0.9662,14.0254],[2635,-2.7699,1.2067,0.9752,10.4503],[2736,-1.7391,0.9232,0.9845,6.6593],[2827,-0.9091,0.5699,0.9919,3.525],[2936,0,0,1,0],[3042,0.7774,-0.7007,1.0068,-3.0969],[3139,1.4467,-1.5249,1.0126,-5.8283],[3246,2.1347,-2.6687,1.0184,-8.7024],[3355,2.76,-4.0714,1.0236,-11.3738],[3464,3.3319,-5.7799,1.0281,-13.8655],[3570,3.8284,-7.7135,1.0317,-16.0595],[3662,4.2354,-9.7264,1.0344,-17.8754],[3752,4.6156,-12.0849,1.0367,-19.5823],[3859,5.0376,-15.5176,1.0394,-21.4966],[3965,5.4179,-19.5693,1.042,-23.1707],[4071,5.9726,-25.1292,1.0451,-24.7126],[4170,6.6967,-31.9446,1.0488,-25.8576],[4278,7.8375,-42.6388,1.0554,-26.9113],[4376,8.8316,-44.4165,1.0707,-27.7051],[4479,10.1746,-51.1132,1.1296,-28.2384],[4591,12.5002,-52.1188,1.138,-28.4143],[4702,15.8149,-52.6198,1.1423,-28.1029],[4812,19.9814,-52.7705,1.1446,-27.2402]],[[438,-87.3214,-88.3194,0,-13.6457],[546,-74.4227,-84.0489,0,-13.6457],[651,-60.8294,-78.4821,0.0009,-56.9942],[772,-46.4821,-70.5441,0.055,-48.2671],[886,-35.6968,-62.5521,0.1496,-41.0289],[973,-28.4789,-55.845,0.2704,-35.6669],[1058,-23.5917,-50.4697,0.378,-31.6859],[1167,-18.7553,-44.2686,0.4919,-27.3488],[1272,-15.2755,-39.0891,0.5749,-23.8864],[1381,-12.4099,-34.2184,0.6444,-20.7337],[1483,-10.2718,-30.1152,0.6978,-18.14],[1581,-8.6416,-26.6366,0.74,-15.9777],[1682,-7.2218,-23.2921,0.7783,-13.9252],[1783,-6.0556,-20.268,0.8113,-12.0878],[1892,-5.0364,-17.3675,0.8416,-10.3394],[2002,-4.1924,-14.7383,0.8681,-8.7643],[2117,-3.4525,-12.2245,0.8925,-7.2655],[2222,-2.8969,-10.1811,0.9118,-6.0512],[2332,-2.3955,-8.2013,0.9299,-4.8776],[2439,-1.9678,-6.3962,0.946,-3.8093],[2542,-1.6186,-4.8339,0.9596,-2.8859],[2635,-1.3387,-3.5633,0.9705,-2.1347],[2736,-0.9695,-2.2431,0.9816,-1.349],[2827,-0.5752,-1.175,0.9904,-0.7088],[2936,0,0,1,0],[3042,0.6596,1.0083,1.008,0.6117],[3139,1.4017,1.8783,1.0148,1.1416],[3246,2.3988,2.7735,1.0216,1.6881],[3355,3.5921,3.5866,1.0276,2.1846],[3464,5.0199,4.3282,1.0328,2.6363],[3570,6.6124,4.9691,1.037,3.0235],[3662,8.2527,5.4914,1.0401,3.3354],[3752,10.1613,5.975,1.0427,3.6206],[3859,12.9347,6.5035,1.0457,3.9298],[3965,16.2092,6.9682,1.0485,4.1984],[4071,20.7211,7.6183,1.0518,4.5535],[4170,26.2684,8.4311,1.0556,4.965],[4278,35.0124,9.6446,1.0622,5.5241],[4376,37.0385,10.6532,1.0776,6.0438],[4479,44.5432,11.7869,1.1369,6.7931],[4591,45.7832,14.3146,1.1453,7.8474],[4702,46.5161,17.9671,1.1497,9.3266],[4812,46.9054,22.5837,1.152,11.1772]],[[438,96.7185,78.2198,0,-317.3932],[546,83.4288,75.3951,0.0035,-226.4544],[651,69.306,71.3585,0.0507,-214.077],[772,54.173,65.0482,0.1452,-197.879],[886,42.5741,58.2921,0.277,-181.2377],[973,34.6622,52.4205,0.3947,-165.831],[1058,29.2133,47.616,0.4805,-152.1951],[1167,23.724,41.9852,0.5682,-135.1045],[1272,19.6955,37.2204,0.6335,-119.9924],[1381,16.3113,32.6949,0.6899,-105.3703],[1483,13.7348,28.8521,0.7342,-92.9002],[1581,11.7317,25.5743,0.7698,-82.2871],[1682,9.9525,22.4065,0.8026,-72.0763],[1783,8.4606,19.5293,0.8312,-62.8467],[1892,7.1284,16.7587,0.8577,-53.9964],[2002,6.0001,14.2386,0.881,-45.9698],[2117,4.9881,11.8216,0.9027,-38.2829],[2222,4.2111,9.8519,0.9199,-32.0172],[2332,3.4948,7.9394,0.9363,-25.9238],[2439,2.8711,6.1924,0.9508,-20.3399],[2542,2.3521,4.6781,0.9631,-15.4786],[2635,1.931,3.4455,0.973,-11.4964],[2736,1.3861,2.1667,0.9831,-7.2999],[2827,0.816,1.134,0.9912,-3.8522],[2936,0,0,1,0],[3042,-0.9211,-0.9716,1.0074,3.3603],[3139,-1.9447,-1.8091,1.0137,6.3034],[3246,-3.3063,-2.6702,1.0199,9.3775],[3355,-4.9223,-3.4523,1.0255,12.2115],[3464,-6.8431,-4.1661,1.0303,14.8321],[3570,-8.9775,-4.785,1.0342,17.1189],[3662,-11.1704,-5.2917,1.0371,18.9954],[3752,-13.7149,-5.763,1.0396,20.7439],[3859,-17.3913,-6.2774,1.0423,22.6849],[3965,-21.7079,-6.7282,1.045,24.378],[4071,-27.6362,-7.368,1.0483,26.1228],[4170,-34.9049,-8.1826,1.052,27.6738],[4278,-46.3077,-9.4192,1.0587,29.4126],[4376,-48.5521,-10.3507,1.074,30.8924],[4479,-56.6736,-11.0138,1.133,32.5786],[4591,-58.1874,-13.6302,1.1415,34.5311],[4702,-59.2407,-17.4886,1.1458,36.8622],[4812,-59.9968,-22.4048,1.1481,39.433]]]};
 const title=copy.querySelector('h1');
 const typeFrames=[[0,.3719,0,.3301,0],...referenceMotion.type,[end,.3719,0,.3301,0]];
 motion(wordmark,typeFrames.map(p=>({offset:p[0]/end,opacity:p[2]})),0,end,'linear');
 motion(title,typeFrames.map(p=>({offset:p[0]/end,opacity:p[4]})),0,end,'linear');
 wordmark.querySelectorAll('.gl-intro-logo>g').forEach(group=>{
  const path=group.querySelector('path'),box=path.getBBox();
  const center=path.matches('.gl-logo-drop,.gl-logo-ring')?252.69:box.x+box.width/2;
  motion(group,typeFrames.map(p=>({offset:p[0]/end,transform:`translateX(${(center-387.305)*p[1]}px)`})),0,end,'linear');
 });
 // Preserve words and the existing mobile line break while moving each
 // glyph independently, without stretching its shape or changing wrapping.
 [...title.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE).forEach(node=>{
  const fragment=document.createDocumentFragment();
  node.textContent.split(/(\s+)/).forEach(token=>{
   if(!token.trim()){fragment.append(document.createTextNode(token));return}
   const word=document.createElement('span');word.className='gl-intro-word';
   [...token].forEach(char=>{const glyph=document.createElement('span');glyph.className='gl-intro-glyph';glyph.textContent=char;word.append(glyph)});
   fragment.append(word);
  });
  node.replaceWith(fragment);
 });
 const glyphs=[...title.querySelectorAll('.gl-intro-glyph')].map(el=>({el,animation:motion(el,[{transform:'none'},{transform:'none'}],0,end,'linear')}));
 function layoutLetters(){
  if(finished)return;
  glyphs.forEach(({el,animation})=>{
   const distance=el.offsetLeft+el.offsetWidth/2-title.clientWidth/2;
   animation.effect.setKeyframes(typeFrames.map(p=>({offset:p[0]/end,transform:`translateX(${distance*p[3]}px)`})));
  });
 }
 layoutLetters();window.addEventListener('resize',layoutLetters);
 document.fonts?.ready.then(layoutLetters);
 motion(skip,[{opacity:0},{opacity:1}],650,500);
 motion(skip,[{opacity:1},{opacity:0}],3350,250,'ease','forwards');
 motion(button,[{opacity:1},{opacity:0}],3600,250,'ease','forwards');
 const forms=document.createElement('div');
 forms.className='gl-intro-forms';forms.setAttribute('aria-hidden','true');
 // Reuse the actual Codle tool artwork from the existing product asset.
 // Coordinates refer to its 2048 × 1152 display grid, without resampling it.
 const tools=[['ai',349,352],['entry',700,68],['pdf',980,352],['python',68,68]];
 forms.innerHTML=tools.map(([name,x,y])=>`<div class="gl-intro-form gl-form-${name}"><svg viewBox="0 0 166 166"><defs><clipPath id="intro-tool-${name}"><rect width="166" height="166" rx="29"/></clipPath></defs><image href="assets/worlds/codle-tools-ui.png" x="${-x}" y="${-y}" width="2048" height="1152" clip-path="url(#intro-tool-${name})"/></svg></div>`).join('');
 intro.querySelector('.gl-intro-curtain').after(forms);
 [...forms.children].forEach((form,i)=>{
  const samples=referenceMotion.shapes[[1,0,3,2][i]];
  const points=[[0,...samples[0].slice(1)],...samples,[end,...samples.at(-1).slice(1)]];
  motion(form,points.map(p=>({offset:p[0]/end,translate:`${p[1]}% ${p[2]}%`})),0,end,'linear');
  motion(form.firstElementChild,points.map(p=>({offset:p[0]/end,transform:`rotate(${p[4]+[8,-12,6,-8][i]}deg) scale(${p[3]})`})),0,end,'linear');
 });
 // The product is already composed behind the curtain. Only a small,
 // centered window opens; its contour is the unmodified Codle droplet.
 const curtain=intro.querySelector('.gl-intro-curtain');
 const drop=intro.querySelector('.gl-logo-drop');
 const portal=document.createElementNS('http://www.w3.org/2000/svg','svg');
 portal.setAttribute('class','gl-intro-portal');
 portal.setAttribute('aria-hidden','true');
 const silhouette=`transform="translate(-252.42 -221)" d="${drop.getAttribute('d')}"`;
 portal.innerHTML=`<defs><mask id="intro-product-portal" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" style="mask-type:luminance"><rect class="gl-portal-paper" fill="white"/><g class="gl-portal-camera"><path fill="black" ${silhouette}/></g></mask></defs><rect class="gl-portal-paper" fill="#f2efe9" mask="url(#intro-product-portal)"/>`;
 curtain.replaceChildren(portal);
 // The reference opens its whole composition, including the surrounding
 // artwork. Put the icons under the same aperture to avoid a late pop-off.
 const iconLayer=document.createElementNS('http://www.w3.org/2000/svg','foreignObject');
 iconLayer.setAttribute('class','gl-portal-paper');
 iconLayer.setAttribute('mask','url(#intro-product-portal)');
 iconLayer.append(forms);portal.append(iconLayer);
 const portalCamera=portal.querySelector('.gl-portal-camera');
 const holeCamera=motion(portalCamera,[{transform:'none'},{transform:'none'}],4070,770,'linear');
 motion(portalCamera,[{opacity:0},{opacity:1}],4070,1,'linear');
 function layoutPortal(){
  if(finished)return;
  const w=intro.clientWidth,h=intro.clientHeight;
  const cx=w/2,cy=h/2;
  // A 62-unit circle fits inside the original droplet, ensuring every corner
  // is clear before the overlay is removed, at any viewport aspect ratio.
  const zoom=(Math.hypot(Math.max(cx,w-cx),Math.max(cy,h-cy))+24)/62;
  portal.setAttribute('viewBox',`0 0 ${w} ${h}`);
  const mask=portal.querySelector('mask');
  mask.setAttribute('x','0');mask.setAttribute('y','0');
  mask.setAttribute('width',w);mask.setAttribute('height',h);
  portal.querySelectorAll('.gl-portal-paper').forEach(rect=>{rect.setAttribute('width',w);rect.setAttribute('height',h)});
  // Exponential growth preserves a tiny opening before the rapid expansion.
  // Sampling the curve avoids a long, uniformly growing logo-shaped object.
  const frames=Array.from({length:81},(_,i)=>{
   const t=i/80,scale=.025+(zoom-.025)*Math.expm1(6.2*t)/Math.expm1(6.2);
   return {offset:t,transform:`translate(${cx}px,${cy}px) scale(${scale})`};
  });
  holeCamera.effect.setKeyframes(frames);
 }
 layoutPortal();
 window.addEventListener('resize',layoutPortal);
 const slide=hero.querySelector('[data-slide="0"]');
 motion(header,[{opacity:0},{opacity:1}],4330,420);
 motion(hero.querySelector('.gl-controls'),[{opacity:0},{opacity:1}],4450,400);
 const clock=motion(intro,[{opacity:1},{opacity:1}],0,end,'linear');
 clock.finished.then(finish).catch(()=>{});
 intro.hidden=false;
 // Give image decoding a head start without delaying the logo entrance.
 const picture=slide.querySelector('.gl-backdrop');
 if(picture?.decode)picture.decode().catch(()=>{});
 started=true;sync();
})();

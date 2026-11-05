(() => {
 const desktop = document.querySelector('.codle-demo');
 if (!desktop) return;
 const mobile = document.createElement('section');
 mobile.className = 'mobile-codle-stories';
 mobile.setAttribute('aria-label','코들 수업 플랫폼 소개');
 mobile.innerHTML = '<div class="mobile-codle-brand"><span>수업 플랫폼</span><img src="assets/codle.svg" alt="codle"></div>';
 const groups = [
  ['#demo-panel-course'],
  ['[data-frame="3"]','#demo-panel-river'],
  ['[data-frame="4"]']
 ];
 desktop.querySelectorAll('.demo-tabs [role=tab]').forEach((tab,i) => {
  const article=document.createElement('article');article.className='mobile-codle-feature';
  const title=document.createElement('h3');title.textContent=tab.querySelector('strong').getAttribute('aria-label')||tab.querySelector('strong').textContent;
  const description=document.createElement('p');description.innerHTML=tab.querySelector('small').innerHTML;
  article.append(title,description,tab.querySelector('.feature-detail-action').cloneNode(true));
  groups[i].forEach(selector=>{
   const scene=desktop.querySelector(selector);if(!scene)return;
   const images=[...scene.querySelectorAll('img')];
   const sourceVideo=scene.querySelector('video');
   if(sourceVideo){const figure=document.createElement('figure'),video=sourceVideo.cloneNode(true);video.removeAttribute('style');video.controls=true;video.autoplay=false;video.loop=false;video.preload='none';figure.append(video);article.append(figure)}
   images.forEach(source=>{const figure=document.createElement('figure'),img=source.cloneNode(true);img.removeAttribute('id');img.removeAttribute('style');img.removeAttribute('hidden');img.loading='lazy';figure.append(img);article.append(figure)});
  });
  mobile.append(article);
 });
 desktop.after(mobile);
 const syncAnchor=()=>{desktop.id=innerWidth<1100?'story-codle-desktop':'story-codle';mobile.id=innerWidth<1100?'story-codle':'story-codle-mobile'};
 syncAnchor();addEventListener('resize',syncAnchor);
})();

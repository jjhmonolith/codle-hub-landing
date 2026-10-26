// Four authored environments and two original films; only the visible scene animates.
(() => {
 const hero=document.querySelector('.gl-hero');
 const scenes=[],players=[],worlds=new Map(),pending=new Set();
 let state={active:0,playing:false,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches};
 let worldModule;
 const names=['paths','paper','river','code','camp','jitda'];
 names.forEach((name,index)=>{
  const slide=document.querySelector(`[data-slide="${index}"]`);
  const scene=document.createElement('div');scene.className=`gl-scene scene-${name}`;scene.setAttribute('aria-hidden','true');
  slide.prepend(scene);slide.classList.add('has-scene');scenes.push(scene);
  if(index>=4){
   const poster=document.createElement('img');poster.className='scene-film-poster';poster.alt='';poster.src=index===4?'assets/worlds/camp-code.png':'assets/worlds/jitda-official-demo.png';scene.append(poster);
   const video=document.createElement('video');video.className='scene-film';video.muted=true;video.defaultMuted=true;video.loop=true;video.playsInline=true;video.preload='none';video.setAttribute('muted','');video.setAttribute('playsinline','');video.tabIndex=-1;scene.append(video);
   const player={index,video,loaded:false,source:index===4?'assets/films/camp.mp4':'assets/films/jitda.webm'};players.push(player);
   video.addEventListener('loadeddata',()=>{scene.classList.add('film-ready');sync();});
   video.addEventListener('error',()=>scene.classList.remove('film-ready'));
  }
 });
 function warm(index){
  if(index<4){
   if(worlds.has(index)||pending.has(index))return;
   pending.add(index);
   const module=index===0?import('./graphic-stage.js?v=20261026-graphic1'):(worldModule ||= import('./product-worlds.js?v=20261026-worlds2'));
   module.then(exports=>{
    const world=index===0?exports.mountGraphic(scenes[index]):exports.mountWorld(scenes[index],index);worlds.set(index,world);pending.delete(index);
    world.setPlaying(state.active===index&&state.playing&&!state.reduced);
   }).catch(error=>{scenes[index].classList.add('world-unavailable');console.warn('Product scenery unavailable',error);});
  }else{
   const player=players.find(p=>p.index===index);if(player.loaded)return;player.loaded=true;player.video.preload='auto';player.video.src=player.source;player.video.load();
  }
 }
 function sync(){
  warm(state.active);
  worlds.forEach((world,index)=>world.setPlaying(state.playing&&!state.reduced&&index===state.active));
  players.forEach(({video,index})=>{if(state.playing&&!state.reduced&&index===state.active)video.play().catch(()=>{});else video.pause();});
 }
 hero.addEventListener('codle:scene-state',event=>{state=event.detail;sync();});warm(0);
})();

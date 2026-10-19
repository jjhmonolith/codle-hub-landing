import {clamp,ease,mix} from './story-timeline.js?v=2';

// One product takes one timeline unit. Its objects lead, open a central space,
// and only then reveal the destination. All stages reverse with the scroll.
export function chapterAt(position,index,count=5){
  const phase=position-index,last=index===count-1;
  const entry=ease(-.10,.08,phase),exit=last?0:ease(.91,1.03,phase);
  const spread=ease(.42,.67,phase);
  const reveal=ease(.55,.74,phase)*(last?1:1-ease(.89,1,phase));
  return {phase,entry,exit,spread,reveal,presence:entry*(1-exit),
    copy:entry*(last?1:1-ease(.91,1,phase)),objects:entry*(1-exit)*mix(1,.24,spread)};
}
export function surfaceAt(position,count=5){
  const value=clamp(position,0,Math.max(1,count)),active=Math.min(Math.floor(value),Math.max(0,count-1));
  const scene=chapterAt(value,active,count);
  return {...scene,from:active,to:active,active,blend:0,travel:scene.spread,
    surge:1-scene.reveal,clarity:scene.reveal,
    yaw:mix((active%2?1:-1)*.06,0,scene.reveal),roll:0};
}

import {clamp,ease} from './story-timeline.js?v=2';
import {chapterAt} from './surface-timeline.js?v=2';
const worlds={
 platform:{hue:215,color:'#518fff',kind:'tools'},
 contents:{hue:271,color:'#b595ff',kind:'library'},
 textbook:{hue:194,color:'#8dd0eb',kind:'study'},
 camp:{hue:158,color:'#79dab5',kind:'network'},
 jitda:{hue:42,color:'#ffd43b',kind:'build'}
};
function background(kind){
  const paths=kind==='tools'?'<ellipse cx="500" cy="500" rx="470" ry="170"/><ellipse cx="500" cy="500" rx="520" ry="245"/>':
    kind==='library'?'<path d="M-100 700Q550 50 1100 380M-100 820Q550 170 1100 500M-100 940Q550 290 1100 620"/>':
    kind==='network'?'<path d="M50 250H220V480H470V310H740V590H970M140 720V610H390V770H640V460H920"/><circle cx="220" cy="250" r="5"/><circle cx="470" cy="480" r="5"/><circle cx="740" cy="310" r="5"/><circle cx="640" cy="770" r="5"/>':
    kind==='build'?'<path d="M100 200H320V450H740V680H950M100 730H270V600H830V300H950"/><rect x="292" y="422" width="56" height="56"/><rect x="712" y="652" width="56" height="56"/>':'';
  return `<div class="world-wash"></div><div class="world-grid"></div><svg class="world-paths" viewBox="0 0 1000 1000" preserveAspectRatio="none">${paths}</svg>`;
}


export function createProductWorlds(host,products){
 const scenes=products.map((product,index)=>{
  const data=worlds[product.id]||worlds.platform;
  const el=document.createElement('div');el.className='product-world world-'+data.kind;
  el.style.setProperty('--world-color',data.color);el.style.setProperty('--world-hue',data.hue);
  el.innerHTML=background(data.kind);host.append(el);return {el,index};
 });
 function render(position,collection){
  for(const scene of scenes){
   const chapter=chapterAt(position,scene.index,products.length),presence=collection*chapter.presence;
   scene.el.style.opacity=presence.toFixed(4);scene.el.hidden=presence<.001;
   scene.el.style.setProperty('--world-travel',chapter.spread.toFixed(4));
  }
 }
 return {render,resize(){}};
}

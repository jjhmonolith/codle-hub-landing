import {products} from './catalog.js?v=4';
import {createLandingSurface} from './landing-surface.js?v=50';
const $=s=>document.querySelector(s),nav=$('nav'),range=$('input'),play=$('#play');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const query=new URLSearchParams(location.search);
let surface,index=Math.max(0,products.findIndex(x=>x.id===query.get('product'))),p=.25,playing=false,previous=0,dirty=true,lastPaint=0;
function choose(i){index=i;p=.25;playing=false;range.value=25;dirty=true;update();}
const buttons=products.map((product,i)=>{const button=document.createElement('button');button.textContent=product.name;button.addEventListener('click',()=>choose(i));nav.append(button);return button});
function update(){buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));$('h1').textContent=products[index].name;$('.caption p').textContent=products[index].description;play.textContent=playing?'멈춤':'다시 재생';$('output').value=Math.round(p*100)+'%';}
range.addEventListener('input',()=>{playing=false;p=Number(range.value)/100;dirty=true;update()});
play.addEventListener('click',()=>{if(reduced.matches){p=p<.5?.85:.25;range.value=p*100;dirty=true;}else{playing=!playing;if(playing)p=0;}update()});
document.addEventListener('visibilitychange',()=>{if(document.hidden){playing=false;update()}dirty=true});
window.addEventListener('resize',()=>{surface?.resize();dirty=true});
try{surface=await createLandingSurface($('#surface'),products);$('.status').hidden=true;play.disabled=false;update();}
catch(error){$('.status').textContent='3D 장면을 열지 못했어요. 전체 랜딩의 기본 화면을 이용해 주세요.';console.error(error)}
function render(now){requestAnimationFrame(render);const dt=Math.min(.05,(now-previous)/1000);previous=now;if(document.hidden||!surface||(!dirty&&!playing)||now-lastPaint<32)return;const elapsed=Math.min(.1,(now-lastPaint)/1000);lastPaint=now;
  if(playing){p=Math.min(.86,p+elapsed/9);range.value=p*100;if(p>=.86)playing=false;update()}
  const scene=surface.render(index+p,1,now/1000);$('.caption').style.opacity=scene.copy;dirty=false;
}requestAnimationFrame(render);

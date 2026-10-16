const dialog=document.getElementById('landing-dialog');
const expandedSlot=document.getElementById('expanded-slot');
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const tiles=[...document.querySelectorAll('.landing-tile')];
let active=null,busy=false,restoreFocus=null;
function fit(tile){const view=tile.querySelector('.landing-view');const expanded=tile.parentElement===expandedSlot;const scale=expanded?Math.min(view.clientWidth/1000,1):view.clientWidth/1000;tile.querySelector('.landing-canvas').style.setProperty('--canvas-scale',scale);}
const observer=new ResizeObserver(()=>tiles.forEach(fit));tiles.forEach(tile=>{observer.observe(tile);fit(tile);});
async function transition(tile,change){
 busy=true;document.body.classList.add('transitioning');tile.style.viewTransitionName='active-landing';
 try{
  if(document.startViewTransition&&!reduce.matches){const move=document.startViewTransition(()=>{change();fit(tile);});await move.finished;}
  else {change();fit(tile);}
 }finally{tile.style.viewTransitionName='';document.body.classList.remove('transitioning');busy=false;}
}
async function open(id,trigger){
 if(active||busy)return;
 const tile=document.getElementById(`tile-${id}`);active={id,tile};restoreFocus=trigger;
 document.getElementById(`slot-${id}`).style.minHeight=`${tile.offsetHeight}px`;
 await transition(tile,()=>{
  document.body.style.overflow='hidden';dialog.showModal();expandedSlot.append(tile);
  document.getElementById('preview-label').textContent=`${id==='codle'?'코들':'짓다'} · 랜딩 미리보기`;
 });
 document.getElementById('close').focus({preventScroll:true});
}
async function close(){
 if(!active||busy)return;
 const {tile,id}=active;
 await transition(tile,()=>{
  document.getElementById(`slot-${id}`).append(tile);dialog.close();document.body.style.overflow='';
  document.getElementById(`slot-${id}`).style.minHeight='';
 });
 active=null;restoreFocus?.focus({preventScroll:true});
}
document.querySelectorAll('[data-open]').forEach(button=>button.addEventListener('click',()=>open(button.dataset.open,button)));
document.getElementById('close').addEventListener('click',close);
document.getElementById('back').addEventListener('click',close);
dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
const motion=document.getElementById('motion-toggle');
motion.addEventListener('click',()=>{const paused=document.body.classList.toggle('motion-paused');motion.setAttribute('aria-pressed',String(paused));motion.textContent=paused?'모션 재생 ▷':'모션 일시정지 Ⅱ';});
document.addEventListener('visibilitychange',()=>document.body.classList.toggle('page-hidden',document.hidden));

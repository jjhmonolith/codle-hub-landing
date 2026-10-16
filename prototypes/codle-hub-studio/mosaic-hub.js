const tiles = document.querySelectorAll('.tile');
const dialog = document.getElementById('textbooks');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let travelling = false;
function resetTravel(){document.querySelector('.travel')?.remove();travelling=false;}
window.addEventListener('pageshow',resetTravel);
tiles.forEach(tile=>tile.addEventListener('click',async event=>{
 if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||event.button!==0)return;
 if(tile.hash==='#textbooks'){event.preventDefault();dialog.showModal();return;}
 if(reduced.matches)return;
 event.preventDefault();if(travelling)return;travelling=true;
 const r=tile.getBoundingClientRect();const clone=tile.cloneNode(true);
 clone.classList.add('travel');clone.removeAttribute('href');clone.setAttribute('aria-hidden','true');
 Object.assign(clone.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});
 document.body.append(clone);
 requestAnimationFrame(()=>requestAnimationFrame(()=>Object.assign(clone.style,{left:'0px',top:'0px',width:innerWidth+'px',height:innerHeight+'px'})));
 setTimeout(()=>location.assign(tile.href),740);
}));
dialog.querySelector('.close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});


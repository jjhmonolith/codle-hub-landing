import {createArt} from './publisher-surface-motion.js?v=4';
const status=document.querySelector('#status');
const arts=await Promise.all([...document.querySelectorAll('[data-art]')].map(c=>createArt(c,c.dataset.art,c.parentElement)));
status.textContent='카드에 마우스를 올리거나 재생을 눌러보세요.';
document.querySelector('#play').onclick=()=>arts.forEach(a=>a.play(true));
document.querySelector('#reset').onclick=()=>arts.forEach(a=>a.reset());
document.querySelector('#record').onclick=()=>{
 const c=document.createElement('canvas');c.width=1440;c.height=640;const ctx=c.getContext('2d');
 let active=true;const paint=()=>{ctx.fillStyle='#fff';ctx.fillRect(0,0,1440,640);arts.forEach((a,i)=>{ctx.fillStyle=['#faf8f0','#f7f5fa','#f2f7f4'][i];ctx.fillRect(i*480,0,480,640);ctx.fillStyle='#192d48';ctx.font='bold 30px sans-serif';ctx.fillText(['Jitda','씨마스','금성 · YBM'][i],i*480+30,60);if(i===0)ctx.drawImage(a.canvas,i*480+10,240,460,236);else ctx.drawImage(a.canvas,i*480,125,480,480)});if(active)requestAnimationFrame(paint)};
 arts.forEach(a=>a.play(true));paint();const stream=c.captureStream(30);const type=MediaRecorder.isTypeSupported('video/webm;codecs=vp9')?'video/webm;codecs=vp9':'video/webm';const rec=new MediaRecorder(stream,{mimeType:type,videoBitsPerSecond:7000000});const chunks=[];rec.ondataavailable=e=>chunks.push(e.data);
 rec.onstop=()=>{active=false;stream.getTracks().forEach(t=>t.stop());const a=document.querySelector('#download');if(a.href.startsWith('blob:'))URL.revokeObjectURL(a.href);a.href=URL.createObjectURL(new Blob(chunks,{type}));a.download='publisher-motion.webm';a.hidden=false;status.textContent='영상 저장 준비 완료';document.querySelector('#record').disabled=false};
 rec.start();document.querySelector('#record').disabled=true;status.textContent='모션을 영상으로 저장하고 있어요.';setTimeout(()=>arts.forEach(a=>a.stop()),6500);setTimeout(()=>rec.stop(),7600);
};

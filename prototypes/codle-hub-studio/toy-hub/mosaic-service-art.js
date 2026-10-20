// Flat illustration system: 8-unit grid, 8/16-unit clearances, solid fills, regular arcs.
const ink='#253144',paper='#fffaf1',blue='#2853ed',pale='#b8caf4';
const svg=(body,box='0 0 320 320')=>`<svg class="editorial-art" xmlns="http://www.w3.org/2000/svg" viewBox="${box}" font-family="Pretendard, Apple SD Gothic Neo, sans-serif" fill="none" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
// One recognisable silhouette per service; no captions, mock UI or decorative scenes.
function platform(){
 // The original white marks supply the alpha mask; their outlines are never redrawn.
 const tools=[['python',68,68,'#1686ff'],['entry',700,68,'#00ce82'],['quiz',700,635,'#ff7caf'],['pdf',980,352,'#ff414a'],['board',68,635,'#00ce82'],['video',1611,918,'#3535ed']];
 const filter=`<defs><filter id="codle-mark-outline" x="-5%" y="-5%" width="110%" height="110%"><feMorphology in="SourceAlpha" operator="erode" radius="1.6" result="inside"/><feComposite in="SourceGraphic" in2="inside" operator="out"/></filter><filter id="codle-original-mark" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  2 2 2 0 -5"/></filter></defs>`;
 return svg(filter+tools.map(([name,sx,sy,color],i)=>{
  const x=24+(i%3)*104,y=24+Math.floor(i/3)*104;
  return `<g transform="translate(${x} ${y})"><g class="motion-tool" style="--tool-delay:${i*25}ms"><defs><clipPath id="mark-bounds-${name}"><rect x="10" y="10" width="68" height="68"/></clipPath><mask id="original-${name}" maskUnits="userSpaceOnUse" x="0" y="0" width="88" height="88" style="mask-type:alpha"><g clip-path="url(#mark-bounds-${name})"><svg width="88" height="88" viewBox="${sx} ${sy} 166 166"><image href="assets/worlds/codle-tools-ui.png" width="2048" height="1152" filter="url(#codle-original-mark)"/></svg></g></mask></defs><rect class="art-color" style="--art-fill:${color};--rest-opacity:.09;--fill-opacity:.22" x="2" y="2" width="84" height="84" rx="6" stroke="${ink}" stroke-width="2.5"/><g filter="url(#codle-mark-outline)"><rect width="88" height="88" fill="${ink}" mask="url(#original-${name})"/></g><rect class="art-glyph-fill" width="88" height="88" fill="${ink}" mask="url(#original-${name})"/></g></g>`;
 }).join(''), '0 0 344 240');
}
function contents(){return svg(`
 <g stroke="${ink}" stroke-width="3.5" fill="#eee7d9">
  <rect class="motion-card-back" x="64" y="48" width="112" height="144" rx="8"/>
  <rect x="104" y="80" width="112" height="144" rx="8"/>
  <g class="motion-card-front">
   <rect class="art-surface" style="--art-base:#d5dfed;--art-fill:#c9d5eb" x="144" y="112" width="112" height="144" rx="8"/>
   <path class="art-color" style="--rest-opacity:1" d="m188 160 32 24-32 24Z"/>
  </g>
 </g>`)}
function textbook(){return svg(`
 <g stroke="${ink}" stroke-width="3.5">
  <g class="motion-page-left"><path d="M48 88q56-28 112 8v152q-56-36-112-8Z"/><path d="M76 148h48m-48 24h32"/></g>
  <g class="motion-page-right"><path class="art-surface" style="--art-base:#edf0e9;--art-fill:#fffaf1" d="M160 96q56-36 112-8v152q-56-28-112 8Z"/><path d="M180 148h48m-48 24h32"/><path class="art-surface" style="--art-base:#a9bfe8;--art-fill:#8aa6dc" d="M228 68h20v44l-10-7-10 7Z"/></g>
 </g>`)}
function aidt(){return svg(`
 <g stroke="${ink}" stroke-width="3.5">
  <circle class="art-color motion-shape-a" style="--art-fill:#b8acd8" cx="104" cy="104" r="40"/>
  <path class="art-color motion-shape-b" style="--art-fill:#e8c77a" d="m224 64 40 80h-80Z"/>
  <path class="art-color motion-shape-a" style="--art-fill:#f7f3e9" d="M224 180a20 20 0 0 1 20 20 20 20 0 0 1 0 40 20 20 0 0 1-40 0 20 20 0 0 1 0-40 20 20 0 0 1 20-20Z"/>
  <rect class="art-color motion-shape-b" style="--art-fill:#a9bfe8;--rest-opacity:1" x="64" y="184" width="80" height="80" rx="3"/>
 </g>`)}
function camp(){return svg(`
 <g stroke="${paper}" stroke-width="3.5">
  <g class="motion-student-left"><circle class="art-color" style="--art-fill:#fffaf1;--rest-opacity:1" cx="72" cy="68" r="17"/><path d="M28 180c4-42 18-83 43-83 27 0 24 50 55 57"/></g>
  <g class="motion-student-right"><circle class="art-color" style="--art-fill:#fffaf1;--rest-opacity:1" cx="248" cy="68" r="17"/><path d="M292 180c-4-42-18-83-43-83-27 0-24 50-55 57"/></g>
  <g class="motion-student-center"><circle class="art-color" style="--art-fill:#fffaf1;--rest-opacity:1" cx="160" cy="48" r="17"/><path d="M116 118c3-31 17-44 44-44s41 13 44 44"/></g>
  <path class="art-color" style="--rest-opacity:1" d="M128 132h64l-5 45h-54Z"/>
  <path d="M124 184h72"/>
 </g>`, '0 0 320 220')}
function jitda(){return svg(`<svg x="76" y="64" width="168" height="192" viewBox="0 25 235 269" overflow="visible"><g stroke="${ink}" stroke-width="3.5"><circle cx="165.56" cy="196.37" r="15.27" class="art-color" style="--art-fill:#3f3934"/><circle cx="63.8" cy="196.37" r="15.27" class="art-color" style="--art-fill:#3f3934"/><path d="M123.33,205.18c-1.15-1.53-2.93-2.41-4.84-2.41h-7.94c-1.91,0-3.69.88-4.84,2.41-5.24,6.95-20.94,27.08-33.19,35.44-1.65,1.13-.91,3.69,1.09,3.69h20.6l20.31-22.73,20.31,22.73h20.6c2,0,2.74-2.56,1.09-3.69-12.24-8.36-27.95-28.49-33.18-35.44Z" class="art-color" style="--art-fill:#3f3934"/><g class="motion-helmet"><path d="M142.5,104.68c1.37.13,3.05-.71,3.21-2.2.88-8.38,1.95-16.54,3.84-24.79,1.49-6.54,3.04-12.91,5.53-19.03-3.22-1.59-6.54-2.97-10.04-4.21-1.76-.62-3.39-1.27-5.36-1.54l-.05,49.34c0,1.51,1.65,2.31,2.87,2.43Z" class="art-color" style="--art-fill:#e9ad03"/><path d="M76.28,65.06c.02.07.04.15.06.23.02.08.03.16.04.25.04.25.07.52.17.75.09.23-.2.59.08.69l.31.5c.59,2.13,1.14,4.27,1.66,6.41.17.72.34,1.43.5,2.15.33,1.43.63,2.87.93,4.31.15.72.29,1.44.43,2.17.26,1.35.5,2.7.72,4.05.03.19.06.39.1.58.22,1.36.44,2.72.63,4.09.52,3.65.94,7.32,1.27,11.01.02.19.05.37.11.54.03.09.06.17.1.25.07.16.16.31.27.45.1.14.22.27.35.39.13.12.27.22.42.32.22.14.46.25.71.34.08.03.17.05.25.07.25.07.51.1.76.11.09,0,.19,0,.28,0,.29-.02.57-.06.85-.14.18-.05.36-.12.53-.19.51-.23.95-.59,1.22-1.06.18-.31.28-.68.28-1.1l.02-37.92-.03-11.38c-5.34,1.43-10.35,3.39-15.25,5.68l.74,2.16,1.49,4.31Z" class="art-color" style="--art-fill:#e9ad03"/><path d="M224.15,164.76c-1.59-7.38-5.45-15.08-13.34-17.77l-.14-11.8c-.07-1.17-.16-2.34-.26-3.5-.63-7.16-1.88-14.19-4.15-21.1-.2-.6-.4-1.19-.61-1.79-3.49-9.84-8.73-18.96-15.46-27.2-6.66-8.16-14.67-15.01-23.92-20.53l-6.5-3.63c-1.35-.75-4.04-.28-4.65,1.23-2.49,6.12-4.04,12.49-5.53,19.03-1.88,8.25-2.96,16.41-3.84,24.79-.16,1.49-1.84,2.33-3.21,2.2-1.22-.12-2.87-.92-2.87-2.43l.05-49.34-.03-2.21c-.06-4.79-6.91-7.09-11.82-8.06-4.41-.88-8.89-1.31-13.36-1.3-4.36,0-8.72.43-13.03,1.27-5.18,1-11.57,3.06-12.02,8.1-.07.79-.13,1.56-.12,2.2l.03,11.37-.02,37.92c0,.42-.11.79-.28,1.1-.27.47-.71.82-1.23,1.06-.17.08-.35.14-.53.19-.28.08-.56.12-.85.14-.09,0-.19,0-.28,0-.25,0-.51-.04-.76-.11-.08-.02-.17-.05-.25-.07-.25-.09-.49-.2-.71-.34-.15-.09-.29-.2-.42-.32s-.25-.25-.35-.38c-.1-.14-.19-.29-.27-.45-.04-.08-.07-.16-.1-.25-.06-.17-.09-.35-.11-.54-.11-1.3-.31-2.58-.45-3.87-.07-.89-.16-1.81-.29-2.81-.09-.74-.19-1.41-.28-2.12-.1-.74-.15-1.48-.25-2.21-.2-1.36-.41-2.73-.63-4.09-.03-.15-.05-.31-.08-.46-2.97-18.93-6.45-26.61-7.08-27.89l-.07-.21c-1.06-1.32-2.73-1.83-4.6-1.21-14.3,7.21-26.49,17.59-35.2,30.36-3.38,4.95-6.23,9.92-8.54,15.36-1.11,2.61-2.12,5.23-3,7.87-1.78,5.33-3.04,10.76-3.56,16.4l-.42,4.62-.37,4-.1,10.99c-8.13,2.82-12.33,11.19-13.53,18.91-.3,1.94.67,3.88,2.43,4.97,2.81,1.74,5.8,2.93,9,4.2,3.52,1.4,7.07,2.7,10.67,3.92,9.8,3.31,19.86,5.93,30.08,7.94,16.75,3.3,33.92,4.94,50.99,5.21h6.58s6.44,0,6.44,0c15.64-.37,31.15-1.6,46.56-4.37,1.3-.23,2.6-.48,3.9-.73,10.06-1.96,19.93-4.47,29.57-7.62,3.28-1.07,6.55-2.22,9.78-3.44l9.99-4.39c2.91-1.28,4.02-3.94,3.4-6.82Z" class="art-surface" style="--art-base:#eadcaf;--art-fill:#ffce2c"/></g></g></svg>`)}
const artists={platform,contents,textbook,aidt,camp,jitda};
// CSS transitions reverse from the current pose, including rapid pointer changes.
export async function createMosaicObject(mount,id){
 mount.innerHTML=`<div class="art-response">${artists[id]()}</div>`;
 mount.classList.add('editorial-stage');
 const tile=mount.closest('.tile');
 let visible=false,pointer=false,focused=false;
 function sync(){tile.classList.toggle('art-active',visible&&(pointer||focused))}
 tile.addEventListener('pointerenter',e=>{if(e.pointerType==='touch')return;pointer=true;sync()});
 tile.addEventListener('pointerleave',()=>{pointer=false;sync()});
 tile.addEventListener('pointercancel',()=>{pointer=false;sync()});
 tile.addEventListener('focus',()=>{focused=true;sync()});
 tile.addEventListener('blur',()=>{focused=false;sync()});
 return {resize(){},render(){},setPointer(){},setProgress(t){
  const next=t>.98;if(next===visible)return;visible=next;
  if(!visible)pointer=false;
  sync();
 }};
}

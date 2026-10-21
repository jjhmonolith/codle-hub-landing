// Flat illustration system: 8-unit grid, 8/16-unit clearances, solid fills, regular arcs.
const ink='#253144',paper='#fffaf1',blue='#2853ed',pale='#b8caf4';
const svg=(body,box='0 0 320 320')=>`<svg class="editorial-art" xmlns="http://www.w3.org/2000/svg" viewBox="${box}" font-family="Pretendard, Apple SD Gothic Neo, sans-serif" fill="none" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
// One recognisable silhouette per service; no captions, mock UI or decorative scenes.
function platform(){
 // The original white marks supply the alpha mask; their outlines are never redrawn.
 const tools=[['python',68,68,'#5786bc'],['entry',700,68,'#52967c'],['quiz',700,635,'#bd7f9c'],['pdf',980,352,'#c77c70'],['board',68,635,'#52967c'],['video',1611,918,'#7d72ad']];
 const filter=`<defs><filter id="codle-mark-outline" x="-5%" y="-5%" width="110%" height="110%"><feMorphology in="SourceAlpha" operator="erode" radius="1.6" result="inside"/><feComposite in="SourceGraphic" in2="inside" operator="out"/></filter><filter id="codle-original-mark" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  2 2 2 0 -5"/></filter></defs>`;
 // Simplified Codle lesson layout: activity rail, problem, editor and output.
 // Codle Python layout: a narrow activity list, lesson body, editor over console.
 const classroom=`<g class="codle-classroom">
 <rect x="12" y="20" width="320" height="200" rx="3" fill="#fbfcfd"/>
 <rect x="12" y="20" width="320" height="19" rx="3" fill="#eef1f6"/>
 <rect x="12" y="39" width="69" height="181" fill="#e9eef6"/>
 <rect x="17" y="45" width="58" height="25" rx="2" fill="#c4d7f2"/>

 <g fill="#d4dce7"><rect x="81" y="39" width="2" height="181"/><rect x="211" y="39" width="2" height="181"/><rect x="213" y="147" width="119" height="2"/></g>
 <g class="codle-panel codle-lesson">
 <rect x="95" y="58" width="64" height="6" rx="1" fill="#6e819a"/>
 <rect x="95" y="124" width="102" height="24" rx="2" fill="#eef0f1"/>
 <rect x="95" y="176" width="102" height="27" rx="2" fill="#eef0f1"/>
 </g>
 <g class="codle-panel codle-editor">
 <rect x="213" y="39" width="119" height="18" fill="#f0f3f7"/>
 <g fill="#7c98bb"><rect x="232" y="72" width="64" height="4" rx="1"/><rect x="241" y="86" width="42" height="4" rx="1"/></g>
 <rect x="291" y="125" width="30" height="13" rx="2" fill="#638bc3"/>
 <rect x="213" y="149" width="119" height="17" fill="#eef2f7"/>
 <g class="codle-result" fill="#91ad9d"><circle cx="225" cy="183" r="3"/><rect x="235" y="181" width="42" height="4" rx="1"/></g>
 </g></g>`;
 return svg(filter+classroom+tools.map(([name,sx,sy,color],i)=>{
  const x=24+(i%3)*104,y=24+Math.floor(i/3)*104;
  return `<g transform="translate(${x} ${y})"><g class="motion-tool tool-${name}"><defs><clipPath id="mark-bounds-${name}"><rect x="10" y="10" width="68" height="68"/></clipPath><mask id="original-${name}" maskUnits="userSpaceOnUse" x="0" y="0" width="88" height="88" style="mask-type:alpha"><g clip-path="url(#mark-bounds-${name})"><svg width="88" height="88" viewBox="${sx} ${sy} 166 166"><image href="assets/worlds/codle-tools-ui.png" width="2048" height="1152" filter="url(#codle-original-mark)"/></svg></g></mask></defs><rect class="art-color" style="--art-fill:${color};--rest-opacity:.09;--fill-opacity:1" x="2" y="2" width="84" height="84" rx="6" stroke="${ink}" stroke-width="2.5"/><g class="art-outline" filter="url(#codle-mark-outline)"><rect width="88" height="88" fill="${ink}" mask="url(#original-${name})"/></g><rect class="art-glyph-fill" width="88" height="88" fill="${ink}" mask="url(#original-${name})"/></g></g>`;
 }).join(''), '0 0 344 240');
}
function contents(){
 // Large subject illustrations: Python, an environmental game, data, and ecology.
 const colors=['#91aac7','#9eb6ab','#be9279','#a4b5a0'];
 const motifs=[
  `<defs><filter id="library-python-mark" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 .98  0 0 0 0 .96  0 0 0 0 .90  2 2 2 0 -5"/></filter></defs><path d="M0 0h124v96H0Z" fill="#7c9ab9"/><circle cx="112" cy="4" r="50" fill="#abc3cb"/><path d="M0 62h36v34H0Zm20-20h16v20H20ZM88 72h36v24H88Z" fill="#547797"/><svg x="24" y="4" width="84" height="84" viewBox="87 87 128 128"><image href="assets/worlds/codle-tools-ui.png" width="2048" height="1152" filter="url(#library-python-mark)"/></svg>`,
  '<path d="M0 0h124v96H0Z" fill="#a8c5c5"/><circle cx="105" cy="17" r="15" fill="#efdbac"/><path d="m0 53 24-26 24 26 20-13 27 23H0Z" fill="#dce9e5"/><path d="M0 64h124v32H0Z" fill="#648f9b"/><path class="game-ice-start" d="m13 79 20-16h59l22 16-18 10H29Z" fill="#cfe4df"/><path class="game-ice-goal" d="m5 76 12-9h31l12 9-10 8H16Z" fill="#e6efdf"/><g class="game-bear"><g transform="translate(-10 -8) scale(1.4)"><path d="M40 55V37a9 9 0 0 1 9-9h25a12 12 0 0 1 12 12v15H74v-9H53v9Z" fill="#fff7e8"/><circle cx="46" cy="27" r="5" fill="#fff7e8"/><path d="M38 27h16v15H34v-8a7 7 0 0 1 4-7Z" fill="#fff7e8"/><circle cx="41" cy="32" r="1.7" fill="#385b58"/><path d="M32 35h5v4h-5Z" fill="#385b58"/></g></g>',
  '<path d="M0 0h124v96H0Z" fill="#bf947d"/><circle cx="116" cy="4" r="42" fill="#d7b69b"/><path d="M8 96V60h26v36Zm37 0V40h26v56Zm37 0V16h26v80Z" fill="#f6e7cd"/><path d="m-5 57 38-31 34 8 32-27 28 5" stroke="#80564b" stroke-width="5" fill="none"/><circle cx="33" cy="26" r="5" fill="#80564b"/><circle cx="67" cy="34" r="5" fill="#80564b"/>',
  '<path d="M0 0h124v96H0Z" fill="#b6c2a4"/><circle cx="100" cy="15" r="26" fill="#efe0b5"/><path d="M-10 90Q20 40 63 72q36-35 74 3v30H-10Z" fill="#7d9b80"/><path d="M58 99V37" stroke="#355e51" stroke-width="5"/><path d="M58 66C21 66 12 42 12 25c29 0 46 14 46 41Zm0-16C58 21 82 9 107 9c0 28-19 41-49 41Z" fill="#355e51"/>'
 ];
 motifs.push(
  '<path d="M0 0h124v96H0Z" fill="#9cacc7"/><path d="M0 67q24-12 48 0t48 0t48 0v40H0Z" fill="#587e9c"/><path d="M21 36h67v15c0 18-13 26-31 26S21 62 21 45Zm67 15c0-15 13-18 22-14-2 13-10 19-22 14Z" fill="#e8edde"/><circle cx="35" cy="46" r="3" fill="#365669"/><path d="M48 27V12m0 5-9-5m9 5 9-5" stroke="#e8edde" stroke-width="4"/>',
  '<path d="M0 0h124v96H0Z" fill="#b6a6be"/><circle cx="106" cy="6" r="38" fill="#d6c2cb"/><path d="M20 96V35a18 18 0 0 1 18-18h49a18 18 0 0 1 18 18v61Z" fill="#f1e7da"/><rect x="32" y="35" width="61" height="28" rx="14" fill="#796e93"/><circle cx="47" cy="49" r="5" fill="#f1e7da"/><circle cx="78" cy="49" r="5" fill="#f1e7da"/><path d="M49 77h27" stroke="#796e93" stroke-width="5"/>'
 );
 // One continuous sheet opens into three subjects on the same baseline.
 const panel=(i,cls)=>`<g class="content-leaf ${cls}"><rect x="0" y="0" width="124" height="100" fill="#f5eddf"/><svg width="124" height="96" viewBox="0 0 124 96" overflow="hidden">${motifs[i]}</svg></g>`;
 return svg(`<g class="content-fold"><g class="content-sheet-edges"><path d="M6-8h124V96H6Z" fill="#b7b9a6"/><path d="M3-4h124V98H3Z" fill="#e6d8bf"/></g>${panel(5,'content-leaf-last')}${panel(2,'content-leaf-middle')}${panel(1,'content-leaf-first')}</g>`);

}
function textbook(){return svg(`
 <g stroke="#713554" stroke-width="3.5">
  <g class="motion-page-left"><path class="art-surface" style="--art-base:transparent;--art-fill:#a34e7e" d="M48 88q56-28 112 8v152q-56-36-112-8Z"/><path class="art-outline" d="M76 148h48m-48 24h32"/></g>
  <g class="motion-page-right"><path class="art-surface" style="--art-base:#f3e2eb;--art-fill:#f9edf3" d="M160 96q56-36 112-8v152q-56-28-112 8Z"/><path class="art-outline" d="M180 148h48m-48 24h32"/><path class="art-surface" style="--art-base:#b56b94;--art-fill:#7d295b" d="M228 68h20v44l-10-7-10 7Z"/></g>
 </g>`)}
function aidt(){return svg(`
 <g stroke="${ink}" stroke-width="3.5">
  <circle class="art-color motion-shape-a" style="--art-fill:#9caf9d" cx="104" cy="104" r="40"/>
  <path class="art-color motion-shape-b" style="--art-fill:#d5b878" d="m224 64 40 80h-80Z"/>
  <path class="art-color motion-shape-a" style="--art-fill:#f6edda" d="M224 180a20 20 0 0 1 20 20 20 20 0 0 1 0 40 20 20 0 0 1-40 0 20 20 0 0 1 0-40 20 20 0 0 1 20-20Z"/>
  <rect class="art-color motion-shape-b" style="--art-fill:#79a69b;--rest-opacity:1" x="64" y="184" width="80" height="80" rx="3"/>
 </g>`)}
function camp(){return svg(`
 <g stroke="none">
  <g class="motion-student-center">
   <circle fill="#f2e7d5" cx="160" cy="46" r="19"/>
   <path fill="#91a6c6" d="M114 132v-22c0-23 18-39 46-39s46 16 46 39v22Z"/>
  </g>
  <g class="motion-student-left">
   <circle fill="#f2e7d5" cx="76" cy="71" r="19"/>
   <path fill="#a8b9a7" d="M30 184c2-29 6-58 19-75 7-9 16-13 27-13 16 0 25 10 33 24l21 32-14 15-20-21 6 38Z"/>
  </g>
  <g class="motion-student-right">
   <circle fill="#f2e7d5" cx="244" cy="71" r="19"/>
   <path fill="#d3aa91" d="M290 184c-2-29-6-58-19-75-7-9-16-13-27-13-16 0-25 10-33 24l-21 32 14 15 20-21-6 38Z"/>
  </g>
  <path fill="#fffaf1" d="M123 133a4 4 0 0 1 4-5h66a4 4 0 0 1 4 5l-6 46h-62Z"/>
  <path fill="#819ac1" d="M130 135h60l-5 37h-50Z"/>
  <path fill="#fffaf1" d="M117 181h86v3a7 7 0 0 1-7 7h-72a7 7 0 0 1-7-7Z"/>
 </g>`, '0 0 320 220')}
function jitda(){return svg(`<svg x="76" y="64" width="168" height="192" viewBox="0 25 235 269" overflow="visible"><g stroke="#493b2e" stroke-width="3.5"><g class="jitda-face"><circle cx="165.56" cy="196.37" r="15.27" class="art-color" style="--art-fill:#3f3934"/><circle cx="63.8" cy="196.37" r="15.27" class="art-color" style="--art-fill:#3f3934"/><path d="M123.33,205.18c-1.15-1.53-2.93-2.41-4.84-2.41h-7.94c-1.91,0-3.69.88-4.84,2.41-5.24,6.95-20.94,27.08-33.19,35.44-1.65,1.13-.91,3.69,1.09,3.69h20.6l20.31-22.73,20.31,22.73h20.6c2,0,2.74-2.56,1.09-3.69-12.24-8.36-27.95-28.49-33.18-35.44Z" class="art-color" style="--art-fill:#3f3934"/></g><g class="motion-helmet"><path d="M142.5,104.68c1.37.13,3.05-.71,3.21-2.2.88-8.38,1.95-16.54,3.84-24.79,1.49-6.54,3.04-12.91,5.53-19.03-3.22-1.59-6.54-2.97-10.04-4.21-1.76-.62-3.39-1.27-5.36-1.54l-.05,49.34c0,1.51,1.65,2.31,2.87,2.43Z" class="art-color" style="--art-fill:#e9ad03"/><path d="M76.28,65.06c.02.07.04.15.06.23.02.08.03.16.04.25.04.25.07.52.17.75.09.23-.2.59.08.69l.31.5c.59,2.13,1.14,4.27,1.66,6.41.17.72.34,1.43.5,2.15.33,1.43.63,2.87.93,4.31.15.72.29,1.44.43,2.17.26,1.35.5,2.7.72,4.05.03.19.06.39.1.58.22,1.36.44,2.72.63,4.09.52,3.65.94,7.32,1.27,11.01.02.19.05.37.11.54.03.09.06.17.1.25.07.16.16.31.27.45.1.14.22.27.35.39.13.12.27.22.42.32.22.14.46.25.71.34.08.03.17.05.25.07.25.07.51.1.76.11.09,0,.19,0,.28,0,.29-.02.57-.06.85-.14.18-.05.36-.12.53-.19.51-.23.95-.59,1.22-1.06.18-.31.28-.68.28-1.1l.02-37.92-.03-11.38c-5.34,1.43-10.35,3.39-15.25,5.68l.74,2.16,1.49,4.31Z" class="art-color" style="--art-fill:#e9ad03"/><path d="M224.15,164.76c-1.59-7.38-5.45-15.08-13.34-17.77l-.14-11.8c-.07-1.17-.16-2.34-.26-3.5-.63-7.16-1.88-14.19-4.15-21.1-.2-.6-.4-1.19-.61-1.79-3.49-9.84-8.73-18.96-15.46-27.2-6.66-8.16-14.67-15.01-23.92-20.53l-6.5-3.63c-1.35-.75-4.04-.28-4.65,1.23-2.49,6.12-4.04,12.49-5.53,19.03-1.88,8.25-2.96,16.41-3.84,24.79-.16,1.49-1.84,2.33-3.21,2.2-1.22-.12-2.87-.92-2.87-2.43l.05-49.34-.03-2.21c-.06-4.79-6.91-7.09-11.82-8.06-4.41-.88-8.89-1.31-13.36-1.3-4.36,0-8.72.43-13.03,1.27-5.18,1-11.57,3.06-12.02,8.1-.07.79-.13,1.56-.12,2.2l.03,11.37-.02,37.92c0,.42-.11.79-.28,1.1-.27.47-.71.82-1.23,1.06-.17.08-.35.14-.53.19-.28.08-.56.12-.85.14-.09,0-.19,0-.28,0-.25,0-.51-.04-.76-.11-.08-.02-.17-.05-.25-.07-.25-.09-.49-.2-.71-.34-.15-.09-.29-.2-.42-.32s-.25-.25-.35-.38c-.1-.14-.19-.29-.27-.45-.04-.08-.07-.16-.1-.25-.06-.17-.09-.35-.11-.54-.11-1.3-.31-2.58-.45-3.87-.07-.89-.16-1.81-.29-2.81-.09-.74-.19-1.41-.28-2.12-.1-.74-.15-1.48-.25-2.21-.2-1.36-.41-2.73-.63-4.09-.03-.15-.05-.31-.08-.46-2.97-18.93-6.45-26.61-7.08-27.89l-.07-.21c-1.06-1.32-2.73-1.83-4.6-1.21-14.3,7.21-26.49,17.59-35.2,30.36-3.38,4.95-6.23,9.92-8.54,15.36-1.11,2.61-2.12,5.23-3,7.87-1.78,5.33-3.04,10.76-3.56,16.4l-.42,4.62-.37,4-.1,10.99c-8.13,2.82-12.33,11.19-13.53,18.91-.3,1.94.67,3.88,2.43,4.97,2.81,1.74,5.8,2.93,9,4.2,3.52,1.4,7.07,2.7,10.67,3.92,9.8,3.31,19.86,5.93,30.08,7.94,16.75,3.3,33.92,4.94,50.99,5.21h6.58s6.44,0,6.44,0c15.64-.37,31.15-1.6,46.56-4.37,1.3-.23,2.6-.48,3.9-.73,10.06-1.96,19.93-4.47,29.57-7.62,3.28-1.07,6.55-2.22,9.78-3.44l9.99-4.39c2.91-1.28,4.02-3.94,3.4-6.82Z" class="art-surface" style="--art-base:#fff7df;--art-fill:#ffce2b"/></g></g></svg>`)}
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

// Reuse the same artwork in the service directory, with isolated SVG references.
export function serviceIllustration(id){
 return artists[id]().replace(/id="([^"]+)"/g,(_,key)=>`id="guide-${key}"`).replace(/url\(#([^)]+)\)/g,(_,key)=>`url(#guide-${key})`);
}

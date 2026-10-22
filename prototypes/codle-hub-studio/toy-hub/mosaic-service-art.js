// Flat illustration system: 8-unit grid, 8/16-unit clearances, solid fills, regular arcs.
const ink='#253144',paper='#fffaf1',blue='#2853ed',pale='#b8caf4';
const svg=(body,box='0 0 320 320')=>`<svg class="editorial-art" xmlns="http://www.w3.org/2000/svg" viewBox="${box}" font-family="Pretendard, Apple SD Gothic Neo, sans-serif" fill="none" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
// One recognisable silhouette per service; no captions, mock UI or decorative scenes.
function platform(){
 // Colours sampled from assets/worlds/codle-tools-ui.png; original white marks supply the alpha mask.
 const tools=[['python',68,68,'#3e88ff'],['entry',700,68,'#32d27d'],['quiz',700,635,'#f889aa'],['pdf',980,352,'#ff5850'],['board',68,635,'#42db88'],['video',1611,918,'#3239de']];
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
// A single content cover opens into twelve distinct, spare cover compositions.
function contents(){
 // One subject per cover: experiment, coding, data, geometry, hardware, quiz,
 // ecology, weather, magnetism, space, electricity and geography. No lettering.
 const covers=[
  ['#fff','<path d="M29 18h22v7h-5v22l18 28q3 6-5 6H21q-8 0-5-6l18-28V25h-5Z" fill="#3e88ff"/><path d="M27 60h26l10 16H17Z" fill="#3239de"/>'],
  ['#3239de','<path d="m29 29-20 19 20 19 6-7-13-12 13-12Zm22 0-6 7 13 12-13 12 6 7 20-19Z" fill="#fff"/>'],
  ['#3e88ff','<path d="M13 75V51h13v24Zm20 0V35h13v40Zm20 0V20h13v55Z" fill="#fff"/>'],
  ['#fff','<path d="M10 77 62 19v58Zm20-10h22V43Z" fill="#3239de" fill-rule="evenodd"/><circle cx="22" cy="30" r="12" fill="#3e88ff"/>'],
  ['#3239de','<rect x="10" y="28" width="60" height="40" rx="3" fill="#fff"/><path d="M40 57 30 47a7 7 0 0 1 10-10 7 7 0 0 1 10 10ZM19 64h8v12h-8Zm17 0h8v12h-8Zm17 0h8v12h-8Z" fill="#3e88ff"/>'],
  ['#3e88ff','<path d="M14 13h52v70H14Z" fill="#fff"/><path d="m20 30 5 5 10-11 5 5-15 16-10-10Zm22 2h16v6H42ZM20 54h12v12H20Zm22 3h16v6H42Z" fill="#3239de"/>'],
  ['#fff','<path d="M37 78V36h6v42Z" fill="#3239de"/><path d="M40 56A28 28 0 0 1 12 28a28 28 0 0 1 28 28Zm0 14a28 28 0 0 1 28-28 28 28 0 0 1-28 28Z" fill="#3e88ff"/>'],
  ['#3e88ff','<path d="M12 49a28 28 0 0 1 56 0Z" fill="#fff"/><path d="M37 49h6v24a12 12 0 0 1-24 0h6a6 6 0 0 0 12 0Z" fill="#3239de"/>'],
  ['#fff','<path d="M16 24h16v31a8 8 0 0 0 16 0V24h16v31a24 24 0 0 1-48 0Z" fill="#3239de"/><path d="M16 24h16v12H16Zm32 0h16v12H48Z" fill="#3e88ff"/>'],
  ['#3239de','<circle cx="40" cy="48" r="23" fill="#3e88ff"/><path d="m7 59 62-29 4 8-62 29Z" fill="#fff"/>'],
  ['#3e88ff','<path d="M40 18a23 23 0 0 1 17 39l-7 9H30l-7-9a23 23 0 0 1 17-39Z" fill="#fff"/><path d="M30 70h20v10H30Z" fill="#3239de"/>'],
  ['#fff','<path d="m10 30 20-8 20 8 20-8v50l-20 8-20-8-20 8Z" fill="#3e88ff"/><path d="M50 22a13 13 0 0 1 13 13c0 10-13 23-13 23S37 45 37 35a13 13 0 0 1 13-13Z" fill="#3239de"/><circle cx="50" cy="35" r="5" fill="#fff"/>']
 ];
 const card=i=>`<g class="library-card${i===5?' library-card-main':''}" style="--library-x:${22+i%4*72}px;--library-y:${24+Math.floor(i/4)*78}px;--library-delay:${Math.abs(i%4-1)*.035+Math.floor(i/4)*.025}"><svg width="80" height="96" viewBox="0 0 80 96" overflow="hidden"><rect width="80" height="96" fill="${covers[i][0]}"/>${covers[i][1]}</svg></g>`;
 return svg(covers.map((_,i)=>i===5?'':card(i)).join('')+card(5),'0 0 320 274');
}

// The turning leaf stays hinged to the spine at x=160 throughout the motion.
function textbook(){return svg(`
 <g class="cmass-book">
  <path d="M56 58q52-18 104 8v140q-52-26-104-8Z" fill="#fff"/>
  <path d="M160 66q52-26 104-8v140q-52-18-104 8Z" fill="#cdddf7"/>
  <path d="M188 103h44v8h-44Zm0 20h32v6h-32Zm0 18h44v6h-44Z" fill="#3e88ff"/>
  <g class="cmass-leaf"><path d="M160 66q52-26 104-8v140q-52-18-104 8Z" fill="#eaf1fc"/><path d="M222 52h16v48l-8-6-8 6Z" fill="#3239de"/></g>
 </g>`, '0 0 320 240')}

function aidt(){return svg(`<g class="learning-orbit">
 <g class="learning-circle"><circle cx="94" cy="94" r="34" fill="#3e88ff"/></g>
 <g class="learning-square"><rect x="182" y="60" width="64" height="64" fill="#3239de"/></g>
 <g class="learning-triangle"><path d="m126 208 40-68 40 68Z" fill="#32d27d"/></g>
 </g>`,'0 0 320 250')}

// Restore the three-person camp composition, with a shared focus on one laptop.
function camp(){return svg(`<g class="camp-line-team">
 <g class="camp-line-center"><circle cx="180" cy="43" r="20" fill="#fffaf1"/><path d="M132 120c3-34 18-49 48-49s45 15 48 49"/></g>
 <g class="camp-line-left"><circle cx="87" cy="65" r="20" fill="#fffaf1"/><path d="M40 187c9-48 21-89 47-89 31 0 27 55 67 61"/></g>
 <g class="camp-line-right"><circle cx="273" cy="65" r="20" fill="#fffaf1"/><path d="M320 187c-9-48-21-89-47-89-31 0-27 55-67 61"/></g>
 <g class="camp-line-laptop"><path class="camp-line-screen" d="M146 135h68l-5 49h-58Z" fill="#b4c8e1"/><path d="M141 193h78"/></g>
 </g>`, '0 0 360 220')}
function jitdaMark(){return `<svg x="76" y="64" width="168" height="192" viewBox="0 25 235 269" overflow="visible"><g stroke="#493b2e" stroke-width="3.5"><g class="jitda-face"><circle cx="165.56" cy="196.37" r="15.27" class="art-color" style="--art-fill:#25395c"/><circle cx="63.8" cy="196.37" r="15.27" class="art-color" style="--art-fill:#25395c"/><path d="M123.33,205.18c-1.15-1.53-2.93-2.41-4.84-2.41h-7.94c-1.91,0-3.69.88-4.84,2.41-5.24,6.95-20.94,27.08-33.19,35.44-1.65,1.13-.91,3.69,1.09,3.69h20.6l20.31-22.73,20.31,22.73h20.6c2,0,2.74-2.56,1.09-3.69-12.24-8.36-27.95-28.49-33.18-35.44Z" class="art-color" style="--art-fill:#25395c"/></g><g class="motion-helmet"><path d="M142.5,104.68c1.37.13,3.05-.71,3.21-2.2.88-8.38,1.95-16.54,3.84-24.79,1.49-6.54,3.04-12.91,5.53-19.03-3.22-1.59-6.54-2.97-10.04-4.21-1.76-.62-3.39-1.27-5.36-1.54l-.05,49.34c0,1.51,1.65,2.31,2.87,2.43Z" class="art-color" style="--art-fill:#f5b800"/><path d="M76.28,65.06c.02.07.04.15.06.23.02.08.03.16.04.25.04.25.07.52.17.75.09.23-.2.59.08.69l.31.5c.59,2.13,1.14,4.27,1.66,6.41.17.72.34,1.43.5,2.15.33,1.43.63,2.87.93,4.31.15.72.29,1.44.43,2.17.26,1.35.5,2.7.72,4.05.03.19.06.39.1.58.22,1.36.44,2.72.63,4.09.52,3.65.94,7.32,1.27,11.01.02.19.05.37.11.54.03.09.06.17.1.25.07.16.16.31.27.45.1.14.22.27.35.39.13.12.27.22.42.32.22.14.46.25.71.34.08.03.17.05.25.07.25.07.51.1.76.11.09,0,.19,0,.28,0,.29-.02.57-.06.85-.14.18-.05.36-.12.53-.19.51-.23.95-.59,1.22-1.06.18-.31.28-.68.28-1.1l.02-37.92-.03-11.38c-5.34,1.43-10.35,3.39-15.25,5.68l.74,2.16,1.49,4.31Z" class="art-color" style="--art-fill:#f5b800"/><path d="M224.15,164.76c-1.59-7.38-5.45-15.08-13.34-17.77l-.14-11.8c-.07-1.17-.16-2.34-.26-3.5-.63-7.16-1.88-14.19-4.15-21.1-.2-.6-.4-1.19-.61-1.79-3.49-9.84-8.73-18.96-15.46-27.2-6.66-8.16-14.67-15.01-23.92-20.53l-6.5-3.63c-1.35-.75-4.04-.28-4.65,1.23-2.49,6.12-4.04,12.49-5.53,19.03-1.88,8.25-2.96,16.41-3.84,24.79-.16,1.49-1.84,2.33-3.21,2.2-1.22-.12-2.87-.92-2.87-2.43l.05-49.34-.03-2.21c-.06-4.79-6.91-7.09-11.82-8.06-4.41-.88-8.89-1.31-13.36-1.3-4.36,0-8.72.43-13.03,1.27-5.18,1-11.57,3.06-12.02,8.1-.07.79-.13,1.56-.12,2.2l.03,11.37-.02,37.92c0,.42-.11.79-.28,1.1-.27.47-.71.82-1.23,1.06-.17.08-.35.14-.53.19-.28.08-.56.12-.85.14-.09,0-.19,0-.28,0-.25,0-.51-.04-.76-.11-.08-.02-.17-.05-.25-.07-.25-.09-.49-.2-.71-.34-.15-.09-.29-.2-.42-.32s-.25-.25-.35-.38c-.1-.14-.19-.29-.27-.45-.04-.08-.07-.16-.1-.25-.06-.17-.09-.35-.11-.54-.11-1.3-.31-2.58-.45-3.87-.07-.89-.16-1.81-.29-2.81-.09-.74-.19-1.41-.28-2.12-.1-.74-.15-1.48-.25-2.21-.2-1.36-.41-2.73-.63-4.09-.03-.15-.05-.31-.08-.46-2.97-18.93-6.45-26.61-7.08-27.89l-.07-.21c-1.06-1.32-2.73-1.83-4.6-1.21-14.3,7.21-26.49,17.59-35.2,30.36-3.38,4.95-6.23,9.92-8.54,15.36-1.11,2.61-2.12,5.23-3,7.87-1.78,5.33-3.04,10.76-3.56,16.4l-.42,4.62-.37,4-.1,10.99c-8.13,2.82-12.33,11.19-13.53,18.91-.3,1.94.67,3.88,2.43,4.97,2.81,1.74,5.8,2.93,9,4.2,3.52,1.4,7.07,2.7,10.67,3.92,9.8,3.31,19.86,5.93,30.08,7.94,16.75,3.3,33.92,4.94,50.99,5.21h6.58s6.44,0,6.44,0c15.64-.37,31.15-1.6,46.56-4.37,1.3-.23,2.6-.48,3.9-.73,10.06-1.96,19.93-4.47,29.57-7.62,3.28-1.07,6.55-2.22,9.78-3.44l9.99-4.39c2.91-1.28,4.02-3.94,3.4-6.82Z" class="art-surface" style="--art-base:#fff6bd;--art-fill:#ffda27"/></g></g></svg>`}
// The bodyless mascot builds one app: each strike adds a visible part of its screen.
function jitda(){return svg(`
 <g class="jitda-code">
  <g class="planner-code-row code-first"><path d="M102 16h22v5h-22Zm68 0h42v5h-42Z" fill="#3239de"/><path d="M130 16h34v5h-34Z" fill="#fff"/></g>
  <g class="planner-code-row code-second"><path d="M118 30h42v5h-42Z" fill="#fff"/><path d="M166 30h54v5h-54Z" fill="#3239de"/></g>
  <g class="planner-code-row code-third"><path d="M118 44h24v5h-24Z" fill="#3239de"/><path d="M148 44h50v5h-50Z" fill="#fff"/></g>
  <g class="planner-code-cursor"><rect width="3" height="9" y="-2" fill="#482750"/></g>
 </g>
 <g class="front-worker-head">
  <g class="front-worker-nod">
   <g class="front-pick-reveal"><g class="front-pick-swing">
    <rect x="218" y="96" width="8" height="98" rx="3" fill="#94643c"/>
    <path d="M195 98Q222 76 249 98" fill="none" stroke="#25395c" stroke-width="11" style="stroke-opacity:1"/>
   </g></g>
   ${jitdaMark()}
   <g class="front-pick-reveal"><path class="front-pick-grip" d="M212 169q4-6 11-4l8 3q6 3 4 10-2 9-11 9h-5q-10-1-10-9 0-5 3-9Z" fill="#ffda27"/></g>
  </g>
  <g class="front-work-target jitda-app">
   <rect x="226" y="230" width="90" height="76" rx="3" fill="#fff"/>
   <path d="M226 233a3 3 0 0 1 3-3h84a3 3 0 0 1 3 3v9h-90Z" fill="#25395c"/>
   <g fill="#fff"><circle cx="234" cy="236" r="1.8"/><circle cx="241" cy="236" r="1.8"/></g>
   <g class="jitda-app-part app-preview"><rect x="234" y="249" width="74" height="24" fill="#3e88ff"/><path d="m259 268 10-13 8 10 6-7 9 10Z" fill="#fff"/></g>
   <g class="jitda-app-part app-copy"><path d="M234 280h41v5h-41Zm0 10h31v4h-31Z" fill="#25395c"/></g>
   <g class="jitda-app-part app-action"><rect x="283" y="280" width="25" height="15" rx="2" fill="#3239de"/><path d="m292 284 6 4-6 4Z" fill="#fff"/></g>
   <g class="front-impact" fill="#fff"><path d="m277 221-7-10 4-2 7 10Zm20-3v-12h4v12Zm16 4 7-9 3 3-7 9Z"/></g>
  </g>
 </g>
 `)}

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

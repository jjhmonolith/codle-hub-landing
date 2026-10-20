// Flat editorial artwork. Shared grid motion stays in product-mosaic.js.
const ink='#252e39',paper='#fffaf0',blue='#2853ed';
const path=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const lines=(x,y,w,n,color=ink)=>Array.from({length:n},(_,i)=>`<path d="M${x} ${y+i*17}h${w-(i===n-1?25:0)}" fill="none" stroke="${color}" stroke-width="3"/>`).join('');
const svg=(body,box='0 0 600 400')=>`<svg class="editorial-art" xmlns="http://www.w3.org/2000/svg" viewBox="${box}" fill="none">${body}</svg>`;
const pencil=`<g transform="rotate(34 430 182)"><path d="M415 62h30v212l-15 34-15-34Z" fill="#ef795d"/><path d="M415 62h10v212h-10Z" fill="#ffb7a1"/><path d="M415 274h30l-15 34Z" fill="${paper}"/><path d="m424 295 6 13 6-13Z" fill="${ink}"/></g>`;
function platform(){return svg(`
 <path d="M88 282H510" stroke="#9fbbff" stroke-width="2"/>
 <g class="art-panel panel-left"><path d="M90 100h142v-16h63v198H90Z" fill="${paper}"/>
 <path d="M90 122h205" stroke="${ink}" stroke-width="2"/>
 <circle cx="108" cy="111" r="3" fill="${blue}"/><circle cx="120" cy="111" r="3" fill="${blue}"/>
 <path d="m145 161-28 27 28 27m94-54 28 27-28 27m-35-66-22 89" stroke="${blue}" stroke-width="9" stroke-linecap="square"/>
 ${lines(117,250,108,1,'#b6c7f6')}</g>
 <g class="art-panel panel-right"><path d="M304 69h146v20h45v194H304Z" fill="#afc9ff"/>
 <path d="M304 112h191" stroke="${ink}" stroke-width="2"/>
 <path d="M330 143h67v34h-67zm67 34h67v34h-67zm-67 34h67v34h-67Z" fill="${blue}"/>
 <path d="M397 143v102" stroke="${paper}" stroke-width="2"/></g>
 <g class="art-cursor"><path d="m281 216 58 31-25 6-8 26Z" fill="#f5ce55" stroke="${ink}" stroke-width="2.5"/></g>
 `,'60 50 470 260')}
function contents(){
 const sheets=[['thumbnail-python-data.webp',-18,-30,-14,'#3b655e'],['thumbnail-climate-data.webp',13,-10,9,'#e77959'],['thumbnail-everyday-ai.webp',0,25,0,paper]];
 return svg(sheets.map(([file,x,y,angle,color],i)=>`<g transform="translate(${x} ${y})"><g class="folio folio-${i}" style="--tilt:${angle}deg"><rect x="116" y="80" width="260" height="330" fill="${color}" stroke="${ink}" stroke-width="2"/><path d="M133 80v330" stroke="${ink}" stroke-width="1.5"/><rect x="155" y="110" width="198" height="126" fill="${blue}"/><image href="assets/worlds/${file}" x="155" y="110" width="198" height="126" preserveAspectRatio="xMidYMid slice"/><path d="M155 264h198M155 277h128" stroke="${ink}" stroke-width="3"/><circle cx="184" cy="335" r="29" fill="#a9bfe9"/><path d="M213 306h58v58h-58Z" fill="${blue}"/><path d="m282 364 34-58 34 58Z" fill="#ee8766"/></g></g>`).join(''),'25 40 430 430');
}
function book(digital){
 const page=path('M71 107Q166 77 263 119V300Q164 258 71 289Z',paper)+path('M263 119Q359 77 455 107V289Q361 258 263 300Z',paper);
 const drawing=digital?`
 <path d="M106 174h69v49h-69Z" fill="#9bc8c0"/><path d="M129 187h23m-23 11h13" stroke="${ink}" stroke-width="2"/>
 <path d="M175 199h38v-52h85" stroke="${blue}" stroke-width="3"/>
 <g class="digital-piece"><path d="M310 134h105v83H310Z" fill="${blue}"/><path d="m338 157-13 17 13 16m48-33 13 17-13 16m-24-37-10 42" stroke="${paper}" stroke-width="3"/></g>
 <circle class="flow-dot" cx="213" cy="199" r="5" fill="#ef805f"/>
 ${lines(310,244,90,2,'#64938a')}
 `:`${lines(99,151,105,3,'#65968c')}<path d="M100 231h109v14H100Z" fill="#edb954"/>
 <path d="M304 145h110v71H304Z" fill="#9bc8c0"/><circle cx="338" cy="172" r="15" fill="${paper}"/><path d="m349 216 31-40 34 40Z" fill="#37685d"/>
 ${lines(304,239,110,2,'#65968c')}`;
 return svg(`<g class="book-spread"><path d="M59 118Q163 85 263 130Q365 85 467 118V307Q360 276 263 316Q165 276 59 307Z" fill="#37685d"/>${page}<path d="M263 120v181" stroke="#adc1b5" stroke-width="2"/>${drawing}
 <g class="turning-page"><path d="M263 119Q221 86 197 78V263Q236 273 263 300Z" fill="${digital?'#83b8e8':'#e7eadc'}"/><path d="M252 133Q226 113 213 110M252 149Q226 129 213 126M252 165Q226 145 213 142" stroke="${digital?blue:'#aab6a6'}" stroke-width="2"/></g></g>`,'0 50 530 300');
}
function camp(){return svg(`
 <path d="M65 306H530" stroke="${ink}" stroke-width="2"/>
 <g class="camp-assembly"><path d="M111 222h105v84H111Z" fill="${paper}"/><path d="M111 222h105v21H111Z" fill="${ink}"/>
 <circle cx="147" cy="267" r="8" fill="${blue}"/><circle cx="181" cy="267" r="8" fill="${blue}"/>
 <path d="M216 222h103v84H216Z" fill="${blue}"/><path d="m248 250-14 14 14 14m40-28 14 14-14 14" stroke="${paper}" stroke-width="4"/>
 <g class="camp-block"><path d="M216 139h103v83H216Z" fill="#f5d269"/><path d="M249 162h37v37h-37Z" fill="${ink}"/><path d="M267 149v13m0 37v12m-31-31h13m37 0h12" stroke="${ink}" stroke-width="3"/></g>
 <path d="M319 222h103v84H319Z" fill="#733e40"/><path d="m342 273 18-18 14 14 23-23" stroke="${paper}" stroke-width="4"/>
 </g><g class="camp-pencil">${pencil}</g>
 `,'70 90 410 240')}
function jitda(){return svg(`
 <path d="M67 357h346" stroke="${ink}" stroke-width="2"/>
 <g class="worker"><image href="assets/worlds/jitda-worker-side.svg" x="58" y="108" width="272" height="274"/></g>
 <g class="pickaxe"><path d="m250 272 105-144" stroke="${ink}" stroke-width="12"/><path d="M288 118Q336 89 387 147L345 134 304 148Z" fill="${paper}" stroke="${ink}" stroke-width="2"/></g>
 <g class="jitda-chip"><path d="m331 291 33-18 32 21-12 40-43 5Z" fill="#6c58a0"/><path d="m331 291 31 14 34-11m-34 11 22 29" stroke="${paper}" stroke-width="2"/></g>
 <g class="strike"><path d="m349 246 8-20m19 34 20-7m-69-5-7-13" stroke="${paper}" stroke-width="4" stroke-linecap="round"/></g>
 `,'0 40 480 410')}
const artists={platform,contents,textbook:()=>book(false),aidt:()=>book(true),camp,jitda};
export async function createMosaicObject(mount,id){
 mount.innerHTML=artists[id]();mount.classList.add('editorial-stage');
 // No WebGL contexts, perpetual animation loop, or loading poster swap.
 return {resize(){},render(){},setPointer(){}};
}

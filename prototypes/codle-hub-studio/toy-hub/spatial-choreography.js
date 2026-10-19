import {clamp,ease,mix} from './story-timeline.js?v=2';

// Orbit, pass through, pull back. Scroll is the only clock.
export function platformToken(i,p){
  const arrive=ease(.025+i*.011,.25+i*.011,p),orbit=ease(.06,.48,p);
  const a=i*Math.PI/3-.30+orbit*.55,back=Math.sin(a);
  return {x:mix(Math.cos(a-.8)*2.6,Math.cos(a)*1.73,arrive),
    y:mix(Math.sin(a-.8)*1.45,Math.sin(a)*.97,arrive),
    z:mix(.65+(i%3)*.28,back*.58+.35,arrive),scale:mix(.76,.43,arrive),
    pitch:mix(-.32,.10*back,arrive),yaw:mix((i%2?1:-1)*.85,-Math.cos(a)*.26,arrive),roll:mix(.14,-Math.sin(a)*.10,arrive)};
}

export function contentJourney(index,p,w,h,aspect=1.75){
  const mobile=w<=700,head=25*ease(.055,.395,p),delta=index-head;
  const depth=Math.max(1.25,5+delta*.60),ppu=h/(2*Math.tan(17.5*Math.PI/180)*depth);
  const size=Math.min(w*(mobile?.73:.43),h*.63),near=clamp(-delta/5),startWidth=size*5/depth;
  const riffleX=w*.50+.16*delta*ppu-w*.26*near*near;
  const riffleY=h*.39-.08*delta*ppu+h*.10*near*near;
  const fan=ease(.415+index*.0014,.605+index*.0014,p);
  const pullback=ease(.405,.54,p);
  // Three shallow, staggered arcs keep the final fan inside the frame.
  // The close pass stays large; this is a pull-back into the same collection.
  const columns=8,band=Math.floor(index/columns),j=index%columns;
  const a=(j/(columns-1)-.5)*(mobile?1.80:1.94)+(band-1)*.045;
  const radius=w*(mobile?.40:.445)-band*w*.009;
  const fanX=w*.5+Math.sin(a)*radius+(band===1?.015:-.005)*w;
  const fanY=h*(mobile?.205+band*.126:.22+band*.173)
    +(1-Math.cos(a))*h*.075+(j/(columns-1)-.5)*h*(band===1?-.038:.033);
  const fanWidth=Math.min(w*(mobile?.31:.18),h*(mobile?.215:.285))*(1-band*.025);
  const leave=ease(.86,1.02,p),side=Math.sign(fanX-w*.5)||1;
  const pre=ease(-.08,.02,p),riftOpacity=ease(-6,-4.9,delta),fanOpacity=ease(.405+index*.0014,.50+index*.0014,p);
  return {screenX:mix(riffleX,fanX,fan)+side*w*.25*leave,
    screenY:mix(riffleY,fanY,fan)-h*.20*leave,
    pixelWidth:mix(startWidth,fanWidth,pullback)*mix(1,.36,leave),
    z:mix(clamp(8-depth,-7,5.8),.10+band*.48+Math.cos(a)*.28,fan)-leave*4.6+(index===0?2.1*(1-ease(-.06,.10,p)):0),
    pitch:mix(.035,.055-band*.025,fan),yaw:mix(-.10,-a*.30,fan)+side*leave*.12,
    roll:mix(-.045,-a*.13,fan),
    opacity:pre*mix(riftOpacity,fanOpacity,fan)*(1-ease(.98,1.06,p)),
    brightness:mix(.70+.30*ease(-1,2,-delta),.98,fan),fan,head,aspect};
}
export function bookTransform(p){return {open:ease(.055,.235,p),lift:ease(.20,.41,p),digital:ease(.30,.49,p),exit:ease(.56,.74,p)}}
export function textbookPuzzle(p){
  const load=ease(.415,.46,p),cross=ease(.465,.535,p),unload=ease(.535,.553,p),boatX=mix(-.32,.47,cross);
  return {boatX,farmerX:boatX-.12,sheepX:mix(mix(-.75,-.18,load),.79,unload)+cross*.79*(1-unload),
    sheepY:mix(.21,.04,load)+Math.sin(unload*Math.PI)*.14,appear:ease(.43,.48,p),cross,unload};
}
export function workerStrike(p){
  const stroke=a=>-.25*ease(a,a+.028,p)+2.22*ease(a+.03,a+.085,p)-1.97*ease(a+.09,a+.145,p);
  const impactAt=p>=.335?.335:.165,dustProgress=clamp((p-impactAt)/.065);
  const dustOpacity=p>=impactAt?1-ease(.55,1,dustProgress):0;
  return {angle:-.35+stroke(.08)+stroke(.25),impact:Math.sin(dustProgress*Math.PI)*dustOpacity,
    dustProgress,dustOpacity,build:ease(.19,.47,p)};
}

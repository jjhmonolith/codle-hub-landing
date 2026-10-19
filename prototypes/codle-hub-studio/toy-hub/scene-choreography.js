import {clamp,ease,mix} from './story-timeline.js?v=2';

// Scroll is the only clock: each shot can stop, hold or run backwards.
export function toolFlight(i,p){
  const t=ease(.045+i*.018,.29+i*.018,p),f=1-t;
  const angle=-Math.PI*.72+i*Math.PI/3+f*.65;
  return {x:mix(Math.cos(angle)*2.25,-1.35,t),y:mix(Math.sin(angle)*1.04,.83-i*.332,t),
    z:.15+f*(.85+.45*Math.sin(angle)),scale:mix(.82,.27,t),
    pitch:-.32*f,yaw:(i%2?1:-1)*1.05*f,roll:.22*Math.sin(angle)*f};
}

export function campPhotoPose(i,p){
  const head=ease(.13,.255,p)+ease(.30,.425,p),q=head-i;
  const back=clamp(-q),front=clamp(q),side=i%2?1:-1;
  return {x:back*(i%2?1.35:-1.35)+side*6.4*front*front,
    y:back*.12+front*front*.45,z:-2.4*back+2.15*front,
    scale:mix(1,.82,back)*(1+front*.38),
    yaw:(i%2?-.22:.22)*back-side*.26*front,
    pitch:-.04*back+.10*front,roll:side*front*.08,
    opacity:ease(-1.05,-.65,q)*(1-ease(.90,1,q)),
    brightness:mix(1,.62,back),focusX:mix(.48,.53,clamp((p-i*.15)/.3))};
}

export function buildPiecePose(i,p){
  const t=ease(.19+i*.027,.36+i*.027,p),f=1-t,side=i%2?1:-1;
  return {x:side*f*(.9+i*.16),y:f*(-.30+i*.08),z:f*(1.5+i*.18),
    pitch:-f*.86,yaw:side*f*.38,roll:side*f*.10,opacity:ease(.16+i*.027,.21+i*.027,p)};
}

export function productCopyOpacity(id,p){
  if(id==='platform')return ease(.24,.34,p);
  if(id==='jitda')return ease(.29,.41,p);
  if(id==='textbook')return 1-ease(.18,.25,p)*(1-ease(.43,.51,p));
  if(id==='camp'){
    const pass=(a,b)=>ease(a,a+.03,p)*(1-ease(b-.025,b,p));
    return 1-Math.max(pass(.14,.255),pass(.31,.425));
  }
  return 1;
}

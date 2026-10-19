const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const mix=(a,b,t)=>a+(b-a)*t;
const smooth=(a,b,p)=>{const t=clamp((p-a)/(b-a));return t*t*(3-2*t)};
const lens=Math.tan(20*Math.PI/180);

export const STREAM_DURATION=8.4;
// Put higher-resolution authentic covers at the four readable stops.
// Every other original still appears in the riffle, without duplication.
export const STREAM_ORDER=[0,7,8,1,9,10,11,12,2,13,14,3,15,16,17,18,4,19,20,5,21,22,23,6];
export const streamHandoff=p=>smooth(.70,.965,p);
export function streamHead(p){
  const riffle=p/.85;
  return 8*smooth(.10,.30,riffle)+8*smooth(.38,.58,riffle)+7*smooth(.66,.82,riffle)+streamHandoff(p);
}
export function streamScene(p){
  return {cameraZ:12,landing:smooth(-4.9,-4.2,streamHead(p)-24)};
}

// A near-frontal deck: small offsets, three short riffles and readable rests.
// Covers leave within the composition rather than crossing the entire screen.
export function streamPose(index,progress,width,height,aspect=1.75){
  const p=clamp(progress),mobile=width<=600,q=streamHead(p)-index;
  const back=clamp(-q,0,5),front=clamp(q,0,1.2);
  const heroWidth=Math.min(width*(mobile?.76:.50),height*.72,500);
  const screenX=width*.48+heroWidth*(back*.055-front*.09-front*front*(index===23?1.23:.33));
  const screenY=height*.40+heroWidth*(back*.024-front*.045-front*front*.13);
  const z=1.3+clamp(q,-5,1.2)*.22;
  const depth=12-z,ppu=height/(2*lens*depth);
  const pixelWidth=heroWidth*(1-back*.022)*(1-front*.025);
  const opacity=smooth(-4.9,-4.2,q)*(1-smooth(index===23?.85:.90,1,q));
  return {x:(screenX-width/2)/ppu,y:(height/2-screenY)/ppu,z,
    tileWidth:pixelWidth/ppu,scale:1,pitch:.018,yaw:-.025+front*.025,
    roll:-.012-front*.022,opacity,brightness:.76+.24*smooth(-3,0,q),
    screenX,screenY,halfWidth:pixelWidth/2,halfHeight:pixelWidth/aspect/2,depth,q};
}

// The landing is the next physical card in the same deck. It is already behind
// the last covers before they leave, then grows from that exact position.
export function streamLandingPose(progress,width,height,aspect=16/9){
  const p=clamp(progress),pose=streamPose(24,p,width,height,aspect);
  const expand=streamHandoff(p),finalWidth=Math.min(width*(width<=600?.88:.72),height*.94,860);
  const screenX=mix(pose.screenX,width*.5,expand),screenY=mix(pose.screenY,height*.42,expand);
  const pixelWidth=mix(pose.halfWidth*2,finalWidth,expand);
  const ppu=height/(2*lens*pose.depth);
  return {...pose,x:(screenX-width/2)/ppu,y:(height/2-screenY)/ppu,
    tileWidth:pixelWidth/ppu,pitch:pose.pitch*(1-expand),yaw:pose.yaw*(1-expand),roll:pose.roll*(1-expand),
    screenX,screenY,halfWidth:pixelWidth/2,halfHeight:pixelWidth/aspect/2,brightness:1,expand};
}

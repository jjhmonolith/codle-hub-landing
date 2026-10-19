import {clamp,ease,mix} from './story-timeline.js?v=2';
import {contentJourney} from './spatial-choreography.js?v=8';
export const contentProgress=phase=>clamp(phase);
export function featurePose(id,index,phase,w,h){
 const mobile=w<=700,enter=ease(-.10,.055,phase),present=ease(.54,.78,phase);
 const heights={platform:1.24,textbook:1.22,camp:1.18,jitda:1.26};
 const mobileWidth=id==='jitda'?1.28:id==='textbook'?1.30:id==='camp'?1.02:.96;
 const cap=mobile?(id==='jitda'?.83:id==='textbook'?.78:id==='camp'?.84:1.24):heights[id];
 const width=Math.min(w*(mobile?mobileWidth:1.01),h*cap,1320);
 const bookZoom=id==='textbook'?mix(mobile?1.52:1.44,1,ease(.055,.245,phase)):1;
 const dive=id==='platform'?ease(.87,1.045,phase):0;
 const leave=id==='jitda'?0:ease(id==='platform'?.925:.85,id==='platform'?1.065:1.03,phase),side=id==='textbook'?1:-1;
 return {screenX:w*.5+(id==='platform'?-w*2.20*dive:side*w*.30*leave),
 screenY:h*(mobile?(id==='jitda'?.37:.385):(id==='jitda'?.405:.43))+(id==='platform'?h*.08*dive:-h*.18*leave)+(id==='platform'?0:h*.08*(1-enter)),
 pixelWidth:width*bookZoom*mix(id==='platform'?.87:.48,1,enter)*mix(1,id==='platform'?1.08:1.04,present)*mix(1,id==='platform'?.62:.50,leave)*mix(1,2.8,dive),
 z:(id==='platform'?.2:mix(-3.2,.2,enter))+4*dive-(id==='platform'?2.5:4)*leave,pitch:id==='camp'?.015:.045*(1-enter),
 yaw:(id==='platform'?mix(-.16,.04,ease(.08,.48,phase)):0)+dive*.30+side*leave*.18,roll:0,
 opacity:ease(-.10,-.035,phase)*(id==='jitda'?1:1-ease(1.015,1.08,phase)),brightness:1};
}
export const contentFeaturePose=contentJourney;
// Portals are hit areas on the real product scenes, not website poster planes.
export function productLandingPose(id,phase,w,h){
 const mobile=w<=700,p=featurePose(id==='contents'?'platform':id,0,phase,w,h);
 const start=id==='platform'?.70:id==='contents'?.66:.64,end=id==='platform'?.77:.73;
 const ready=clamp(ease(start,end,phase)*(id==='jitda'?1:1-ease(id==='platform'?.875:.865,.925,phase)));
 let width=p.pixelWidth*(id==='platform'?.60:id==='textbook'?.60:id==='jitda'?(mobile?.47:.67):.86);
 let x=w*.5,y=h*(mobile?.385:.43);
 if(id==='contents'){width=w*(mobile?.87:.85);y=h*.36;}
 if(id==='textbook')x+=mobile?0:p.pixelWidth*.10;
 if(id==='jitda'&&!mobile)x+=p.pixelWidth*.08;
 width=Math.min(width,w*.92,h*1.15);
 return {screenX:x,screenY:y,pixelWidth:width,z:.8,pitch:0,yaw:0,roll:0,
 opacity:0,wipe:0,ready,expand:ease(.54,.78,phase)};
}
export function toWorld(pose,w,h,nativeWidth=1){
 const ppu=h/(2*Math.tan(17.5*Math.PI/180)*(8-pose.z));
 return {x:(pose.screenX-w/2)/ppu,y:(h/2-pose.screenY)/ppu,z:pose.z,scale:pose.pixelWidth/(nativeWidth*ppu)};
}
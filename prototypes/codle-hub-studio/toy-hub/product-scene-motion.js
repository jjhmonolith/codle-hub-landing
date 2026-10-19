import {clamp,ease,mix} from './story-timeline.js?v=2';
import {streamPose,streamLandingPose} from './content-stream-motion.js?v=5';

export const contentProgress=phase=>clamp((phase-.025)/.77);
const landingWidth=(w,h)=>Math.min(w*(w<=700?.92:.80),h*.95,1080);

// Every pose is screen-space design intent. The renderer converts it through
// the common perspective camera, so objects and destination share depth.
export function featurePose(id,index,phase,w,h){
  const mobile=w<=700,enter=clamp(ease(-.06,.08,phase)),t=clamp(ease(.50,.79,phase));
  const heights={platform:.91,textbook:.80,camp:1.05,jitda:mobile?.37:.90};
  const width=Math.min(w*(id==='platform'?(mobile?.96:.88):id==='jitda'&&mobile?.84:mobile?.94:.90),h*heights[id],1100);
  const push=id==='platform'?mix(.88,1,ease(.08,.35,phase)):1;
  const orbit=id==='platform'?1-ease(.08,.42,phase):0;
  const exit=ease(.50,.75,phase),wipe=ease(.53,.76,phase),leave=id==='textbook'||id==='jitda';
  const centerY=h*(mobile?(id==='jitda'?.36:.38):.40);
  return {screenX:w/2-(leave?w*.78*exit:0),screenY:(id==='camp'?mix(centerY,h*.43,wipe):centerY)+12*(1-enter),
    pixelWidth:(id==='camp'?mix(width,landingWidth(w,h),wipe):width*push*mix(1,leave?.84:.98,t))*mix(.96,1,enter),
    z:mix(.30,-.45,t),pitch:.15*orbit,yaw:-.28*orbit,
    roll:0,opacity:clamp(enter*(1-ease(id==='platform'?.54:.69,id==='platform'?.68:.77,phase))),brightness:1};
}

export function contentFeaturePose(index,phase,w,h,aspect){
  const p=streamPose(index,contentProgress(phase),w,h,aspect);
  // Osmo Dropping Cards: front covers fall with gravity-like acceleration.
  // Preserve the accepted final cover-to-landing bridge.
  if(index===23)return {...p,pixelWidth:p.halfWidth*2,z:p.z*2/3};
  const fly=clamp(p.q),sweep=fly*fly;
  // One shallow peel: retain a readable front face, reveal the next cover
  // underneath, then release it. Avoid the former abrupt mid-flight fade.
  return {...p,screenX:p.screenX+w*.035*sweep,screenY:p.screenY+h*.34*sweep,
    pixelWidth:p.halfWidth*2*(1+.06*Math.sin(fly*Math.PI)),z:p.z*2/3+.24*sweep,
    pitch:p.pitch-.18*sweep,yaw:p.yaw,roll:p.roll+.045*sweep,
    opacity:p.opacity*(1-ease(.62,.98,fly))};
}

export function productLandingPose(id,phase,w,h){
  if(id==='contents'){
    const p=contentProgress(phase),pose=streamLandingPose(p,w,h);
    const formerWidth=Math.min(w*(w<=600?.88:.72),h*.94,860);
    return {...pose,screenY:pose.screenY+h*.01*pose.expand,
      pixelWidth:pose.halfWidth*2+(landingWidth(w,h)-formerWidth)*pose.expand,
      z:pose.z*2/3,ready:ease(.94,.995,p)};
  }
  const t=clamp(ease(.53,.76,phase)),mobile=w<=700;
  const f=featurePose(id,0,.47,w,h),cy=f.screenY;
  const originX=id==='platform'?f.pixelWidth*.30/3.9:id==='textbook'?f.pixelWidth*.175/1.85:0,originY=0;
  const startWidth=f.pixelWidth*(id==='platform'?2.56/3.9:id==='textbook'?.965/1.85:1);
  const finalWidth=landingWidth(w,h);
  const reveal=id==='platform'?1:ease(.53,.66,phase);
  return {screenX:mix(w/2+originX,w/2,t),screenY:mix(cy+originY,h*.43,t),
    pixelWidth:mix(startWidth,finalWidth,t),z:mix(.45,.80,t),
    pitch:0,yaw:0,roll:0,opacity:id==='platform'?clamp(ease(.53,.64,phase)):Number(reveal>0),wipe:reveal,ready:clamp(ease(.72,.78,phase)),expand:t};
}

export function toWorld(pose,w,h,nativeWidth=1){
  const ppu=h/(2*Math.tan(17.5*Math.PI/180)*(8-pose.z));
  return {x:(pose.screenX-w/2)/ppu,y:(h/2-pose.screenY)/ppu,z:pose.z,scale:pose.pixelWidth/(nativeWidth*ppu)};
}

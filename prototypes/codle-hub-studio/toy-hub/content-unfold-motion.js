const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const mix=(a,b,t)=>a+(b-a)*t;
const ease=(a,b,p)=>{const t=clamp((p-a)/(b-a));return t*t*(3-2*t)};
const smooth=(a,b,p)=>{const t=clamp((p-a)/(b-a));return t*t*t*(t*(t*6-15)+10)};
const lens=Math.tan(20*Math.PI/180);

// Six spacious gates, each made from four different covers. Camera travel is
// shared by every card; there are no independent loops or randomized orbits.
export function unfoldScene(progress,width,height){
  const p=clamp(progress),mobile=width<=600,referenceHeight=2*lens*14;
  return {p,mobile,referenceHeight,referenceWidth:referenceHeight*width/height,
    cameraZ:18-68*smooth(.26,.84,p),landing:ease(.635,.79,p)};
}

export function unfoldPose(index,progress,width,height,aspect=1.75){
  const s=unfoldScene(progress,width,height),layer=Math.floor(index/4),corner=index%4;
  // Once travel starts, stagger all four depths. Each cover passes separately
  // rather than sending an entire wall past the camera at the same instant.
  const baseZ=4-layer*9+(1.5-corner)*1.6*ease(.25,.34,s.p);
  const open=layer===0?ease(.025+corner*.012,.17+corner*.012,s.p):ease(43,33,s.cameraZ-baseZ);
  const z=baseZ-(3-corner)*(layer===0?1.0:.10)*(1-open),depth=s.cameraZ-z;
  const angle=(layer%2===0?Math.PI/4:0)+corner*Math.PI/2;
  const side=Math.abs(Math.cos(angle))<.1?(corner===1?-1:1):Math.sign(Math.cos(angle));
  const approach=ease(14,8,depth),flyby=ease(5.3,1.6,depth);
  const tileWidth=s.mobile?s.referenceWidth*.31:Math.min(s.referenceHeight*.26,s.referenceWidth*.18);
  const scale=mix(s.mobile?1.55:2.05,1,open),safeDepth=Math.max(.1,depth),pixelsPerUnit=height/(2*lens*safeDepth);
  const halfWidth=tileWidth*scale*.5*pixelsPerUnit,halfHeight=tileWidth/aspect*scale*.5*pixelsPerUnit;
  // Keep a cover in the camera's path until it is genuinely close. The old
  // outward push removed it at 10–12 units, before the perspective could grow.
  const closeX=side*s.referenceWidth*(safeDepth/14)*(.25+flyby*.80);
  const openX=mix(Math.cos(angle)*s.referenceWidth*.435,closeX,approach);
  const x=mix(s.referenceWidth*.07+(corner-1.5)*.055,openX,open);
  const naturalY=s.referenceHeight*(Math.sin(angle)*.24+.07);
  const halfY=halfHeight/height;
  const naturalScreenY=.5-naturalY*pixelsPerUnit/height;
  const desiredY=mix(naturalScreenY,.43-Math.sin(angle)*.24,approach);
  const centerY=halfY<.25?clamp(desiredY,.185+halfY,.675-halfY):.43;
  const closeY=(.5-centerY)*2*lens*safeDepth;
  const y=mix(s.referenceHeight*.04+(corner-1.5)*.025,closeY,open);
  const screenX=width*.5+x*pixelsPerUnit,screenY=height*.5-y*pixelsPerUnit;
  const top=(screenY-halfHeight)/height,bottom=(screenY+halfHeight)/height;
  // A near cover stays solid while it is on-screen. Fade only the last sliver
  // outside the viewport, avoiding a translucent pile during the close pass.
  const edge=ease(-halfWidth,-halfWidth*.85,screenX)*(1-ease(width+halfWidth*.85,width+halfWidth,screenX));
  const clearance=ease(.08,.11,top)*(1-ease(.77,.81,bottom));
  const presence=ease(1.4,2.8,depth)*(1-ease(s.mobile?24:32,s.mobile?29:36,depth))*(layer===0?1:ease(.10,.23,s.p));
  return {x,y,z,tileWidth,scale,depth,open,
    yaw:mix(-.25+corner*.035,-Math.cos(angle)*.10-side*flyby*.28,open),
    pitch:mix(-.10,Math.sin(angle)*.045*(1-approach),open),roll:mix((corner-1.5)*.016,side*flyby*.035,open),
    opacity:clamp(presence*edge*clearance*(1-ease(.74,.83,s.p))),brightness:mix(.76,1,ease(32,12,depth)),
    screenX,screenY,halfWidth,halfHeight};
}

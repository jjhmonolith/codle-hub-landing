export const FIRST_DEPTH=1800;
export const DEPTH_GAP=1200;
export const MAX_LAYER_SCALE=2.45;
const FOCAL_LENGTH=1500;
const clamp=x=>Math.max(0,Math.min(1,x));
const mix=(a,b,t)=>a+(b-a)*t;
export function layerEase(a,b,n){const t=clamp((n-a)/(b-a));return t*t*t*(t*(t*6-15)+10)}
export function settleReel(value,last){return last-value<.004?last:value}

// Project front-facing planes explicitly, then composite in a stable order.
// No DOM plane crosses the browser's CSS perspective near plane, and no
// opacity/filter change can rebuild a nested preserve-3d stacking context.
export function projectLayer(spec,cameraZ,w,h){
  const z=cameraZ-spec.depth;
  const scale=Math.min(MAX_LAYER_SCALE,FOCAL_LENGTH/Math.max(FOCAL_LENGTH/MAX_LAYER_SCALE,FOCAL_LENGTH-z));
  const width=spec.width*w,height=width/spec.aspect;
  const approach=spec.main?layerEase(-1100,-100,z):0;
  const lateral=spec.main?mix(spec.x,spec.restX??0,approach):spec.x;
  const vertical=spec.main?mix(spec.y,spec.restY??0,approach):spec.y;
  const nearExit=layerEase(70,730,z);
  const ownerExit=spec.main?0:layerEase(spec.ownerDepth-430,spec.ownerDepth-70,cameraZ);
  const exit=Math.max(nearExit,ownerExit),side=spec.side||Math.sign(spec.x)||1;
  const goal=side*(w*.5+width*scale*.5+120);
  const x=w*.5+lateral*w*scale+goal*exit;
  const y=h*.5+vertical*h*scale-h*.055*nearExit;
  const roll=(spec.roll||0)*(spec.main?1-approach:1),angle=roll*Math.PI/180;
  const halfW=(Math.abs(Math.cos(angle))*width+Math.abs(Math.sin(angle))*height)*scale*.5;
  const halfH=(Math.abs(Math.sin(angle))*width+Math.abs(Math.cos(angle))*height)*scale*.5;
  const visible=z>-4200&&x+halfW>-96&&x-halfW<w+96&&y+halfH>-96&&y-halfH<h+96;
  return {x,y,width,height,scale,roll,visible,z,zIndex:100000-spec.depth};
}

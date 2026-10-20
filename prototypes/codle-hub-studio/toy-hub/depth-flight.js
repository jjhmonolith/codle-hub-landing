export const FIRST_DEPTH=2600;
export const DEPTH_GAP=3000;
export const FOCAL_DISTANCE=1300;
export const DECK_START=.38;
export const DECK_END=.98;
const clamp=x=>Math.max(0,Math.min(1,x));
export function layerEase(a,b,n){const t=clamp((n-a)/(b-a));return t*t*t*(t*(t*6-15)+10)}
export function settleReel(value,last){const stop=Math.round(value);return Math.abs(value-stop)<.004?Math.min(last,stop):value}

// All objects remain fixed. The camera clears the edge of each foreground
// plane before crossing its depth, and returns to the next viewing position.
export function flightCamera(depth){
  if(depth<FIRST_DEPTH){
    const turn=layerEase(220,1120,depth)*(1-layerEase(1700,FIRST_DEPTH,depth));
    return {x:.82*turn,y:.12*turn,z:FOCAL_DISTANCE-depth};
  }
  const reel=(depth-FIRST_DEPTH)/DEPTH_GAP;
  const index=Math.min(4,Math.floor(reel)),phase=reel-index;
  const turn=index===4?0:layerEase(.06,.40,phase)*(1-layerEase(.66,1,phase));
  return {x:(index%2?-1:1)*.56*turn,y:(index===3?-.12:.13)*turn,z:FOCAL_DISTANCE-depth};
}

export function flightProgress(p,count=5){
  const reel=settleReel(clamp((p-DECK_START)/(DECK_END-DECK_START))*(count-1),count-1);
  const front=Math.min(count-1,Math.round(reel));
  return {reel,front,ready:p>=DECK_START-.0001&&Math.abs(reel-front)<.17,depth:FIRST_DEPTH+reel*DEPTH_GAP};
}

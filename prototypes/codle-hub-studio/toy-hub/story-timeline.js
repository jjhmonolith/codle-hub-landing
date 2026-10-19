export const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export const mix=(a,b,t)=>a+(b-a)*t;
export function ease(a,b,v){const t=clamp((v-a)/(b-a));return t*t*t*(t*(t*6-15)+10)}
export const REEL_START=.25,REEL_END=.98;
// Keep the opening's physical scroll length while giving each product its own
// feature showcase, landing reveal and reading interval.
export function storyAt(p,count=5){
  const opening=p/REEL_START*.43;
  return {opening,
    release:ease(.025,.195,opening),macro:ease(.265,.405,opening),
    signature:1-ease(.015,.075,opening),title:ease(.105,.205,opening),second:ease(.13,.23,opening),titleOut:1-ease(.275,.345,opening),
    collection:ease(.315,.415,opening),reel:clamp((p-REEL_START)/(REEL_END-REEL_START))*Math.max(1,count),gold:ease(.68,.96,p)
  };
}
export function productProgress(index,count,phase=.22){return mix(REEL_START,REEL_END,(clamp(index,0,Math.max(0,count-1))+clamp(phase))/Math.max(1,count))}

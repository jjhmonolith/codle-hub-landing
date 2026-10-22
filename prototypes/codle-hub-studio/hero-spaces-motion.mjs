// The rooms stay at the origin. Only the perspective camera travels.
// At every cut it is looking into a blank corner of the presentation screen:
// the same white surface bridges the two spaces without a sideways slide.
export const PERIOD = 3.3;
export const ENTRY = .85;
export const DIVE = 2.05;
export const LOOP = PERIOD * 3;
const clamp = value => Math.max(0, Math.min(1, value));
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
const smooth=t=>t*t*(3-2*t);
const bezier=(a,b,c,d,t)=>a.map((v,i)=>v*(1-t)**3+3*b[i]*(1-t)**2*t+3*c[i]*(1-t)*t*t+d[i]*t**3);
const views=[{from:.61,to:.06},{from:.18,to:.86},{from:.92,to:.20}];
const screens=[{x:0,y:0,z:-2.65,ry:0,s:1},{x:.2,y:.15,z:-2.5,ry:-.05,s:1},{x:-.9,y:.4,z:-2.15,ry:.08,s:.88}];
function portal(index){
  const p=screens[index],sin=Math.sin(p.ry),cos=Math.cos(p.ry);
  // Matches the upper-right unprinted margin of lesson-display, in world space.
  const target=[p.x+(2.45*cos+.075*sin)*p.s,p.y+3.35*p.s,p.z+(-2.45*sin+.075*cos)*p.s];
  return {target,position:[target[0]+sin*.10,target[1],target[2]+cos*.10]};
}
function wide(angle){return [Math.sin(angle)*19,11.2,Math.cos(angle)*19];}
export function sampleCamera(time,reduced=false){
  const wrapped=((time%LOOP)+LOOP)%LOOP;
  const index=Math.min(2,Math.floor(wrapped/PERIOD));
  const local=Math.round((wrapped-index*PERIOD)*1e9)/1e9;
  const view=views[index],near=portal(index),center=[0,1.05,-.2];
  let position,target,phase,parallax;
  if(reduced){position=wide(view.from);target=center;phase='hold';parallax=0;}
  else if(local<ENTRY){
    const t=1-Math.pow(1-clamp(local/ENTRY),3);
    const end=wide(view.from);
    position=bezier(near.position,[near.position[0],5.5,1.4],[end[0]*.75,11.2,end[2]*.7],end,t);
    target=mix(near.target,center,t);phase='dolly-out';parallax=t;
  }else if(local<DIVE){
    const p=smooth(clamp((local-ENTRY)/(DIVE-ENTRY)));
    position=wide(view.from+(view.to-view.from)*p);target=center;phase='orbit';parallax=1;
  }else{
    const p=clamp((local-DIVE)/(PERIOD-DIVE));
    const t=smooth(p*p);
    const start=wide(view.to);
    position=bezier(start,[start[0]*.7,9,10],[near.position[0],4.4,.5],near.position,t);
    target=mix(center,near.target,t);phase='dolly-in';parallax=1-t;
  }
  return {index,local,position,target,phase,parallax};
}

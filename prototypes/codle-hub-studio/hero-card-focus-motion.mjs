const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10);};
const phase=(t,a,b)=>ease((t-a)/(b-a));
const mix=(a,b,p)=>a+(b-a)*p;
export function sample(t){
 const lift=phase(t,.7,1.9),approach=phase(t,2.45,3.65),open=phase(t,3.05,3.85);
 return {lift,open,x:mix(-135,-110,approach),y:mix(100,70,approach),z:mix(-90,0,approach),rx:mix(7,0,approach),ry:mix(-12,0,approach),rz:mix(-3,0,approach),scale:mix(.72,1,approach),cx:mix(0,-300,lift),cy:mix(0,85,lift)-100*approach,cs:mix(.31719,.86,lift),cr:-5*lift*(1-approach),height:mix(256,540,open)};
}

const clamp=v=>Math.max(0,Math.min(1,v));
const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t)};
const smoother=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*t*(t*(t*6-15)+10)};

// Headline visibility follows the space actually opened by the two logos.
// Every value is a pure function of scroll, including when scrolling backward.
export function heroHandoff(progress){
  const codle=smoother(.035,.435,progress);
  const jitda=smoother(.060,.460,progress);
  const placement=travel=>1-Math.pow(1-travel,1.75);
  const codlePlacement=placement(codle),jitdaPlacement=placement(jitda);
  const space=Math.min(codlePlacement,jitdaPlacement);
  const title=smooth(.62,.985,space);
  return {
    codle,jitda,codlePlacement,jitdaPlacement,
    night:1,
    intro:1-smooth(.08,.54,Math.max(codlePlacement,jitdaPlacement)),
    title,
    secondLine:smooth(.16,1,title),
    detail:smooth(.77,.995,space)
  };
}

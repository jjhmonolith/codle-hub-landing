import {clamp,ease} from './story-timeline.js?v=2';

// Scroll controls the journey; time adds one slow turn around one stable axis.
// No timed full-spin burst and no independent oscillation on three Euler axes.
export function objectMotion(distance,order,depth,time,collection=1){
  const departure=ease(.09+order*.025,.89,Math.max(0,distance));
  const arrival=1-ease(-.91,-.10-order*.018,Math.min(0,distance));
  const entry=1-ease(.05+order*.04,.92,collection);
  const fly=departure-arrival;
  const foreground=clamp((depth+1.8)/3.1);
  return {
    departure,arrival,entry,fly,
    z:depth+departure*(1.5+foreground*1.3)-arrival*2.7-entry*2,
    lateral:departure*(.35+foreground*.15)+arrival*(.30+.22*arrival*arrival)+entry*.42,
    rise:fly*.025,
    lean:fly*(.33+foreground*.19),
    idle:Math.sin(time*.16+order*.48)*.16*(1-.65*Math.abs(fly))
  };
}

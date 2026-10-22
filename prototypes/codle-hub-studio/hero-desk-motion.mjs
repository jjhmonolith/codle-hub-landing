// Switch worlds only while the same blue screen tile fills the view.
export const CUT_TO_TEAM=3.65, CUT_TO_CLASS=9.45, DURATION=12;
const smooth=t=>t*t*(3-2*t);
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
const curve=(a,b,c,d,t)=>a.map((v,i)=>v*(1-t)**3+3*b[i]*(1-t)**2*t+3*c[i]*(1-t)*t*t+d[i]*t**3);
const wideClass=a=>[Math.sin(a)*2.45,1.5,Math.cos(a)*2.45];
const wideTeam=a=>[Math.sin(a)*3.75,2.5,Math.cos(a)*3.75];
const classTarget=[0,.50,0],teamTarget=[0,.53,0];
const near=({focus,normal})=>focus.map((v,i)=>v+normal[i]*.015);
const add=(a,b)=>a.map((v,i)=>v+b[i]);
const pose=(world,position,target,phase,parallax=1,roll=0)=>({world,position,target,phase,parallax,roll,caption:parallax});
export function sampleJourney(time,anchors,reduced=false){
  const t=Math.max(0,Math.min(DURATION,time));
  const a=anchors.classroom,b=anchors.team,ca=near(a),cb=near(b);
  if(reduced&&t>=CUT_TO_TEAM&&t<CUT_TO_CLASS)return pose('team',wideTeam(.55),teamTarget,'02 · 함께 만드는 해커톤');
  if(reduced||t<.5||t>=11.2)return pose('classroom',wideClass(.46),classTarget,'01 · 수업에서 시작');
  if(t<2.5){const p=smooth((t-.5)/2);return pose('classroom',wideClass(.46-.64*p),classTarget,'01 · 나의 아이디어');}
  if(t<3.6){const p=smooth(((t-2.5)/1.1)**1.6);return pose('classroom',curve(wideClass(-.18),[-.3,1.4,1],add(a.focus,[0,.12,.25]),ca,p),mix(classTarget,a.focus,p),'아이디어 속으로',1-p,.08*Math.sin(p*Math.PI));}
  if(t<CUT_TO_TEAM)return pose('classroom',ca,a.focus,'함께 만드는 경험으로',0);
  if(t<5.2){const p=smooth((t-CUT_TO_TEAM)/(5.2-CUT_TO_TEAM));return pose('team',curve(cb,add(b.focus,[0,.12,.35]),[1.1,2.35,1.8],wideTeam(.55),p),mix(b.focus,teamTarget,p),'함께 만드는 경험으로',p,-.10*Math.sin(p*Math.PI));}
  if(t<8.2){const p=smooth((t-5.2)/3);return pose('team',wideTeam(.55-.75*p),teamTarget,'02 · 함께 만드는 해커톤');}
  if(t<9.4){const p=smooth(((t-8.2)/1.2)**1.6);return pose('team',curve(wideTeam(-.2),[-.3,1.8,1.4],add(b.focus,[0,.15,.3]),cb,p),mix(teamTarget,b.focus,p),'다음 아이디어로',1-p,.08*Math.sin(p*Math.PI));}
  if(t<CUT_TO_CLASS)return pose('team',cb,b.focus,'다음 아이디어로',0);
  const p=smooth((t-CUT_TO_CLASS)/(11.2-CUT_TO_CLASS));
  return pose('classroom',curve(ca,add(a.focus,[.12,.15,.4]),[.9,1.5,1.5],wideClass(.46),p),mix(a.focus,classTarget,p),'다시, 새로운 시작',p,-.08*Math.sin(p*Math.PI));
}

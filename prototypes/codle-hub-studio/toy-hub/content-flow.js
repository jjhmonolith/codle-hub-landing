import {clamp,ease} from './story-timeline.js?v=2';
import {chapterAt} from './surface-timeline.js?v=2';

const wrap=value=>((value%1)+1)%1;

// Three coherent ribbons share spacing and direction. Depth belongs to each
// ribbon, so covers never pile up or dissolve through one another.
export function contentFlow({phase,travel=phase,slot,lane,collection=1,width,height,isLast=false,sourceWidth=279}){
  const mobile=width<=700,index=slot*2+lane,row=index%3,column=Math.floor(index/3);
  const chapter=chapterAt(phase,0,isLast?1:2);
  const tileWidth=Math.min(mobile?152:200,width*(mobile?.4:.2),height*(mobile?.18:.26));
  const gap=mobile?16:22,pitch=Math.max(tileWidth+gap,(width+tileWidth*2.2)/8),length=pitch*8;
  const distance=clamp(travel,-.05,.40)*[5,7,9][row];
  const cycle=wrap((column+.5)/8-distance/8+row*.047);
  const leave=ease(.42+row*.025,.62+row*.025,phase);
  const baseX=width*.5+(cycle-.5)*length;
  const screenX=baseX-leave*(width+length*.5+tileWidth)
    +(1-chapter.entry)*width*.35;
  const ribbonHeight=tileWidth*.58+gap;
  const screenY=height*(mobile?.37:.43)+(row-1)*ribbonHeight;
  const edge=clamp(Math.abs(screenX/width-.5)*2);
  const z=[-1.25,-.4,.45][row]-edge*.45,perspective=8/(8-z);
  const shownWidth=Math.min(tileWidth,sourceWidth*1.65);
  const fadeAt=x=>ease(-shownWidth*.45,shownWidth*.2,x)
    *(1-ease(width-shownWidth*.2,width+shownWidth*.45,x));
  const edgeFade=fadeAt(screenX)*fadeAt(baseX);
  return {
    x:.5+(screenX/width-.5)/perspective,
    y:.5+(screenY/height-.5)/perspective,z,
    size:shownWidth/(1.82*perspective),cycle,
    yaw:clamp((screenX/width-.5)*.10,-.07,.07),pitch:0,roll:0,
    opacity:clamp(chapter.presence*ease(.15,.8,collection)*edgeFade),
    brightness:[.92,1,.96][row]
  };
}

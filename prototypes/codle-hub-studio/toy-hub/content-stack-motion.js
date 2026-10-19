const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const mix=(a,b,t)=>a+(b-a)*t;
const smooth=(a,b,p)=>{const t=clamp((p-a)/(b-a));return clamp(t*t*t*(t*(t*6-15)+10))};
const lens=Math.tan(20*Math.PI/180);

let cachedLayout;
// A deterministic loose composition, not rows with random offsets. Relax the
// rotated cover bounds once on resize; scroll only follows these fixed targets.
export function stackLayout(width,height){
  if(cachedLayout?.width===width&&cachedLayout.height===height)return cachedLayout;
  const mobile=width<=600,gap=mobile?12:22;
  const availableWidth=width*(mobile?.94:.93),availableHeight=height*(mobile?.64:.59);
  const base=Math.sqrt(availableWidth*availableHeight/24)*1.05;
  const cells=Array.from({length:24},(_,i)=>{
    const angle=i*2.399963+.42,radius=Math.sqrt((i+.65)/24);
    const size=i<7?1.22+.12*Math.sin(i*1.7):.79+.18*(1+Math.sin(i*2.1));
    const cardWidth=base*size,roll=Math.sin(i*2.3+.6)*.065;
    // Reserve the thickest source aspect and tilted corners, so none of the
    // actual covers needs to be cropped or hidden to make the arrangement fit.
    const halfWidth=cardWidth*(Math.cos(roll)+Math.abs(Math.sin(roll))/1.64)/2+2;
    const halfHeight=cardWidth*(Math.abs(Math.sin(roll))+Math.cos(roll)/1.64)/2+2;
    return {x:Math.cos(angle)*availableWidth*.48*radius,
      y:Math.sin(angle)*availableHeight*.48*radius,cardWidth,halfWidth,halfHeight,
      roll,pitch:Math.sin(i*1.37)*.026,yaw:Math.cos(i*1.71)*.045,
      z:Math.sin(i*1.81)*.34};
  });
  for(let pass=0;pass<180;pass++){
    let collisions=0;
    for(let i=0;i<24;i++)for(let j=i+1;j<24;j++){
      const a=cells[i],b=cells[j],dx=b.x-a.x,dy=b.y-a.y;
      const ox=a.halfWidth+b.halfWidth+gap-Math.abs(dx);
      const oy=a.halfHeight+b.halfHeight+gap-Math.abs(dy);
      if(ox<=0||oy<=0)continue;
      collisions++;
      // Separate along the pair's own direction instead of snapping one axis;
      // axis-only separation subtly recreates rows after the deck opens.
      const vx=dx||.1,vy=dy||.1;
      const push=Math.min(ox/Math.abs(vx),oy/Math.abs(vy))*.505;
      a.x-=vx*push;a.y-=vy*push;b.x+=vx*push;b.y+=vy*push;
    }
    if(!collisions)break;
  }
  const left=Math.min(...cells.map(c=>c.x-c.halfWidth)),right=Math.max(...cells.map(c=>c.x+c.halfWidth));
  const top=Math.min(...cells.map(c=>c.y-c.halfHeight)),bottom=Math.max(...cells.map(c=>c.y+c.halfHeight));
  const fit=Math.min(availableWidth/(right-left),availableHeight/(bottom-top));
  for(const c of cells){c.x=(c.x-(left+right)/2)*fit;c.y=(c.y-(top+bottom)/2)*fit;c.cardWidth*=fit;}
  return cachedLayout={width,height,mobile,cells,gap:gap*fit};
}

export function stackScene(p,width,height){
  return {cameraZ:12,landing:smooth(.79,.94,p),spread:smooth(.09,.56,p),leaving:smooth(.77,.94,p)};
}

export function stackPose(index,progress,width,height,aspect=1.75){
  const p=clamp(progress),{mobile,cells}=stackLayout(width,height);
  const cell=cells[index],side=cell.x<0?-1:1;
  const t=smooth(.09+index*.016,.215+index*.016,p);
  const out=smooth(.76+index*.002,.91+index*.002,p);
  const centerX=width*.5,centerY=height*(mobile?.425:.43);
  const endX=centerX+cell.x,endY=centerY+cell.y;
  const stackWidth=Math.min(width*(mobile?.58:.31),height*.48,350);
  const deckX=centerX+(index-11.5)*.45;
  const deckY=centerY+(index-11.5)*.45;
  const lift=Math.sin(Math.PI*t)*(1-t);
  let screenX=mix(deckX,endX,t)+side*width*.085*lift;
  let screenY=mix(deckY,endY,t)-height*.16*lift;
  // Both halves close outward in a short follow-through, exposing the landing.
  screenX+=side*(width*.75)*out;
  screenY+=cell.y*.25*out;
  const z=mix(.72+(23-index)*.022,cell.z,t)+1.8*lift-.7*out;
  const depth=12-z,ppu=height/(2*lens*depth);
  const pixelWidth=mix(stackWidth,cell.cardWidth,1-Math.pow(1-t,1.4))*(1-out*.1);
  const roll=mix(-.075+Math.sin(index*1.18)*.025+index*.005,cell.roll,t)+side*lift*.17;
  const pitch=mix(-.11,cell.pitch,t)-lift*.15;
  const yaw=mix(-.13,cell.yaw,t)+side*lift*.36;
  return {x:(screenX-width/2)/ppu,y:(height/2-screenY)/ppu,z,
    tileWidth:pixelWidth/ppu,scale:1,pitch,yaw,roll,
    opacity:1-smooth(.80+index*.002,.92+index*.002,p),
    brightness:mix(.91+(.09*(1-index/24)),1,t),
    screenX,screenY,halfWidth:pixelWidth/2,halfHeight:pixelWidth/aspect/2,open:t,depth};
}

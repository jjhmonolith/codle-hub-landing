// Keep the official screenshot as an independent, unmodified image layer.
// No generative redraw of product UI. Coordinates refer to the 1586 × 992 photo.
const art=document.querySelector('.art');
const plane=document.querySelector('.art-plane');
const screen=document.querySelector('.screen-insert');
const corners=[[1056,100],[1354,111],[1326,288],[1025,263]];

// Project a 1000 × 625 rectangular screen onto its four photographed corners.
function projectQuad(points,w,h){
  const [[x0,y0],[x1,y1],[x2,y2],[x3,y3]]=points;
  const dx1=x1-x2,dx2=x3-x2,dx3=x0-x1+x2-x3;
  const dy1=y1-y2,dy2=y3-y2,dy3=y0-y1+y2-y3;
  const determinant=dx1*dy2-dx2*dy1;
  const g=(dx3*dy2-dx2*dy3)/determinant;
  const k=(dx1*dy3-dx3*dy1)/determinant;
  const a=x1-x0+g*x1,b=x3-x0+k*x3;
  const d=y1-y0+g*y1,e=y3-y0+k*y3;
  return [a/w,d/w,0,g/w,b/h,e/h,0,k/h,0,0,1,0,x0,y0,0,1];
}
screen.style.transform=`matrix3d(${projectQuad(corners,1000,625).join(',')})`;
const resize=()=>plane.style.setProperty('--art-scale',Math.min(art.clientWidth/1586,art.clientHeight/992));
new ResizeObserver(resize).observe(art);
resize();

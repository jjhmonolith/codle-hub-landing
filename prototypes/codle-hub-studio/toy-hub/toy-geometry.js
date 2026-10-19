import * as THREE from 'three';
import { SVGLoader } from './vendor/SVGLoader.js';
import { softVolume } from './soft-volume.js?v=4';
const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t)};

function helmetVolume(grooveShapes){
  // The shaded strips in the flat logo belong to a continuous helmet shell.
  // Bridge those two notches before inflating, instead of making three prongs.
  const shell=new THREE.Shape();shell.moveTo(114.5,41.35);
  shell.bezierCurveTo(128,41.35,139.7,44,139.7,51);
  shell.bezierCurveTo(150,53,164,59,175,66);
  shell.bezierCurveTo(197,83,209,108,210.7,135.2);shell.lineTo(210.8,147);
  shell.bezierCurveTo(218.7,149.7,222.6,157.4,224.2,164.8);
  shell.bezierCurveTo(224.8,167.6,223.7,170.3,220.8,171.6);
  shell.bezierCurveTo(187,187,151,192,114.5,192.3);
  shell.bezierCurveTo(78,192,40,186,8,171);
  shell.bezierCurveTo(5,169,4,167,4.5,164);
  shell.bezierCurveTo(5.7,156.3,9.9,147.9,18,145.1);shell.lineTo(18.1,134.1);
  shell.bezierCurveTo(19,102,40,72,70,57.3);
  shell.bezierCurveTo(76,55,83,53,89.3,51);
  shell.bezierCurveTo(89.7,45,100,41.35,114.5,41.35);shell.closePath();
  const grooves=grooveShapes.map(shape=>shape.getSpacedPoints(120).slice(0,-1).map(p=>[(p.x-114.5)/220,(143-p.y)/220]));
  const grooveAt=(x,y)=>{
    let distance=-Infinity;
    for(const outline of grooves){
      let inside=false,nearest=Infinity;
      for(let j=0;j<outline.length;j++){
        const a=outline[j],b=outline[(j+1)%outline.length],vx=b[0]-a[0],vy=b[1]-a[1];
        if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;
        const t=clamp(((x-a[0])*vx+(y-a[1])*vy)/(vx*vx+vy*vy||1));
        const px=x-a[0]-t*vx,py=y-a[1]-t*vy,d=px*px+py*py;
        nearest=Math.min(nearest,d);
      }
      distance=Math.max(distance,Math.sqrt(nearest)*(inside?1:-1));
    }
    return smooth(-.011,.015,distance);
  };
  const geometry=softVolume(shell,114.5,143,220,.245,{resolution:200,falloff:.13,rounded:true,depthSteps:64,
    depthProfile:(x,y)=>(1-.22*grooveAt(x,y))*(1-.17*Math.pow(x/.52,2)-.08*Math.pow((y-.08)/.65,2))
  });
  const position=geometry.getAttribute('position');
  const colors=new Float32Array(position.count*3),grooveMask=new Float32Array(position.count);
  const yellow=new THREE.Color('#ffd000'),ochre=new THREE.Color('#b88006'),color=new THREE.Color();
  for(let i=0;i<position.count;i++){
    const groove=grooveAt(position.getX(i),position.getY(i));
    color.copy(yellow).lerp(ochre,groove);color.toArray(colors,i*3);
    grooveMask[i]=groove;
  }
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  geometry.setAttribute('groove',new THREE.Float32BufferAttribute(grooveMask,1));
  geometry.computeBoundingBox();geometry.computeBoundingSphere();return geometry;
}

function glassVolume(shape){
  // A single inflated droplet: continuous curvature from the belly to the tail.
  // No raised perimeter or inset face, which would read as a glass badge.
  return softVolume(shape,252.42,220.94,147.54,.34,{resolution:180,falloff:.095,rounded:true});
}

// Build-time only. Preserve the approved geometry without rebuilding it on visits.
export function buildToyParts(codleSvg,jitdaSvg){
  const loader=new SVGLoader();
  const codleShape=SVGLoader.createShapes(loader.parse(codleSvg).paths[0])[0];
  const parts=[{group:'codle',material:'blue',z:0,geometry:glassVolume(codleShape)}];
  const paths=loader.parse(jitdaSvg).paths;
  const grooveShapes=paths.filter(path=>path.color.getHexString(THREE.SRGBColorSpace)==='e9ad03').flatMap(path=>SVGLoader.createShapes(path));
  for(const path of paths){
    const shapes=SVGLoader.createShapes(path);if(!shapes.length)continue;
    const bounds=new THREE.Box2().setFromPoints(shapes.flatMap(shape=>shape.getPoints(16)));
    if(bounds.max.x>235||bounds.getSize(new THREE.Vector2()).length()<3)continue;
    const color=path.color.getHexString(THREE.SRGBColorSpace);
    if(color==='ffce2c')parts.push({group:'jitda',material:'helmet',z:0,geometry:helmetVolume(grooveShapes)});
    else if(color==='3f3934'){
      const isEye=bounds.max.y<220;
      for(const shape of shapes)parts.push({group:'jitda',material:'dark',z:isEye?-.065:.075,
        geometry:softVolume(shape,114.5,143,220,isEye?.038:.055,{resolution:80,falloff:.028,rounded:.45,depthSteps:40})});
    }
  }
  return parts;
}


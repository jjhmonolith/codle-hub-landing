import * as THREE from 'three';
import { mergeVertices } from './vendor/BufferGeometryUtils.js';

// Inflate a signed-distance silhouette instead of lofting rays from a centre.
// Concave notches retain their contour without propagating folds into the face.
export function softVolume(shape,cx,cy,unit,depth,{resolution=124,falloff=.11,rounded=false,depthProfile=null,depthSteps=56}={}){
  const outline=shape.getSpacedPoints(300).slice(0,-1).map(p=>[(p.x-cx)/unit,(cy-p.y)/unit]);
  const margin=.025;
  const x0=Math.min(...outline.map(p=>p[0]))-margin,x1=Math.max(...outline.map(p=>p[0]))+margin;
  const y0=Math.min(...outline.map(p=>p[1]))-margin,y1=Math.max(...outline.map(p=>p[1]))+margin;
  const nx=resolution,ny=Math.ceil(resolution*(y1-y0)/(x1-x0)),nz=depthSteps;
  const dx=(x1-x0)/nx,dy=(y1-y0)/ny,z0=-depth*1.08,dz=depth*2.16/nz;
  const stride=nx+1,layer=stride*(ny+1);
  const distances=new Float32Array(layer),contourDistance=new Float32Array(layer),field=new Float32Array(layer*(nz+1));
  for(let iy=0;iy<=ny;iy++)for(let ix=0;ix<=nx;ix++){
    const x=x0+ix*dx,y=y0+iy*dy;let inside=false,minDistance=Infinity;
    for(let j=0;j<outline.length;j++){
      const a=outline[j],b=outline[(j+1)%outline.length],vx=b[0]-a[0],vy=b[1]-a[1];
      if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;
      const t=Math.max(0,Math.min(1,((x-a[0])*vx+(y-a[1])*vy)/(vx*vx+vy*vy||1)));
      const ex=x-a[0]-t*vx,ey=y-a[1]-t*vy;minDistance=Math.min(minDistance,ex*ex+ey*ey);
    }
    const signedDistance=Math.sqrt(minDistance)*(inside?1:-1);
    contourDistance[iy*stride+ix]=signedDistance;
    distances[iy*stride+ix]=Math.exp(Math.min(20,-signedDistance/falloff));
  }
  if(rounded){
    // A relaxed membrane gives the broad face continuous curvature instead of
    // the flat centre and medial creases of a distance-only inflation.
    const height=new Float32Array(layer),weights=new Float32Array(layer*5);
    // Locate the actual outline between grid nodes so it cannot leave a stair
    // pattern in the inflated surface or its reflected highlights.
    for(let y=1;y<ny;y++)for(let x=1;x<nx;x++){
      const k=y*stride+x,d=contourDistance[k];if(d<=0)continue;
      const span=(neighbor,step)=>neighbor>0?step:step*d/(d-neighbor);
      const l=span(contourDistance[k-1],dx),r=span(contourDistance[k+1],dx);
      const b=span(contourDistance[k-stride],dy),t=span(contourDistance[k+stride],dy);
      const o=k*5;
      weights[o]=2/(l*(l+r));weights[o+1]=2/(r*(l+r));
      weights[o+2]=2/(b*(b+t));weights[o+3]=2/(t*(b+t));
      weights[o+4]=weights[o]+weights[o+1]+weights[o+2]+weights[o+3];
    }
    for(let iteration=0;iteration<resolution*4;iteration++){
      let change=0;
      for(let y=1;y<ny;y++)for(let x=1;x<nx;x++){
        const k=y*stride+x;if(distances[k]>=1)continue;
        const o=k*5;
        const target=(height[k-1]*weights[o]+height[k+1]*weights[o+1]+height[k-stride]*weights[o+2]+height[k+stride]*weights[o+3]+1)/weights[o+4];
        const delta=(target-height[k])*1.85;height[k]+=delta;change=Math.max(change,Math.abs(delta));
      }
      if(change<1e-7)break;
    }
    let peak=0;for(const value of height)peak=Math.max(peak,value);
    for(let k=0;k<layer;k++)if(distances[k]<1){
      const blend=typeof rounded==='number'?rounded:1;
      distances[k]=1-((1-distances[k])*(1-blend)+height[k]/peak*.96*blend);
    }
  }
  if(depthProfile){
    // Shape the scalar field before meshing, keeping groove walls evenly sampled.
    for(let y=0;y<=ny;y++)for(let x=0;x<=nx;x++){
      const k=y*stride+x;if(distances[k]>=1)continue;
      const scale=depthProfile(x0+x*dx,y0+y*dy);
      distances[k]=1-(1-distances[k])*scale*scale;
    }
  }
  for(let iz=0;iz<=nz;iz++){
    const z=z0+iz*dz,k=z*z/(depth*depth)-1;
    for(let i=0;i<layer;i++)field[iz*layer+i]=k+distances[i];
  }
  const tetrahedra=[[0,5,1,6],[0,1,2,6],[0,2,3,6],[0,3,7,6],[0,7,4,6],[0,4,5,6]];
  const corners=[[0,0,0],[1,0,0],[1,1,0],[0,1,0],[0,0,1],[1,0,1],[1,1,1],[0,1,1]];
  const offsets=corners.map(([x,y,z])=>x+y*stride+z*layer),vertices=[];
  const emit=(a,b,c,normal)=>{
    const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
    const dot=(uy*vz-uz*vy)*normal[0]+(uz*vx-ux*vz)*normal[1]+(ux*vy-uy*vx)*normal[2];
    vertices.push(...a,...(dot<0?c:b),...(dot<0?b:c));
  };
  for(let iz=0;iz<nz;iz++)for(let iy=0;iy<ny;iy++)for(let ix=0;ix<nx;ix++){
    const base=iz*layer+iy*stride+ix,values=offsets.map(o=>field[base+o]);
    if(values.every(v=>v>0)||values.every(v=>v<=0))continue;
    const positions=corners.map(([x,y,z])=>[x0+(ix+x)*dx,y0+(iy+y)*dy,z0+(iz+z)*dz]);
    const cut=(a,b)=>{const t=values[a]/(values[a]-values[b]);return positions[a].map((p,i)=>p+(positions[b][i]-p)*t)};
    for(const tet of tetrahedra){
      const inside=tet.filter(i=>values[i]<=0),outside=tet.filter(i=>values[i]>0);if(!inside.length||!outside.length)continue;
      const normal=[0,1,2].map(axis=>outside.reduce((s,i)=>s+positions[i][axis],0)/outside.length-inside.reduce((s,i)=>s+positions[i][axis],0)/inside.length);
      if(inside.length===1){const a=inside[0];emit(...outside.map(b=>cut(a,b)),normal)}
      else if(outside.length===1){const a=outside[0];emit(...inside.map(b=>cut(a,b)),normal)}
      else{
        const a=cut(inside[0],outside[0]),b=cut(inside[0],outside[1]),c=cut(inside[1],outside[0]),d=cut(inside[1],outside[1]);
        emit(a,b,c,normal);emit(b,d,c,normal);
      }
    }
  }
  const raw=new THREE.BufferGeometry();raw.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  const geometry=mergeVertices(raw,.00001);raw.dispose();
  // Gradient normals remain smooth across uneven marching-tetrahedra triangles.
  const gradientX=new Float32Array(layer),gradientY=new Float32Array(layer);
  for(let y=0;y<=ny;y++)for(let x=0;x<=nx;x++){
    const l=Math.max(0,x-1),r=Math.min(nx,x+1),b=Math.max(0,y-1),t=Math.min(ny,y+1);
    gradientX[y*stride+x]=(distances[y*stride+r]-distances[y*stride+l])/((r-l)*dx);
    gradientY[y*stride+x]=(distances[t*stride+x]-distances[b*stride+x])/((t-b)*dy);
  }
  const position=geometry.getAttribute('position'),normals=new Float32Array(position.count*3),edgeDistance=new Float32Array(position.count);
  for(let i=0;i<position.count;i++){
    const fx=Math.max(0,Math.min(nx-.0001,(position.getX(i)-x0)/dx)),fy=Math.max(0,Math.min(ny-.0001,(position.getY(i)-y0)/dy));
    const x=Math.floor(fx),y=Math.floor(fy),u=fx-x,v=fy-y,k=y*stride+x;
    const sample=grid=>grid[k]*(1-u)*(1-v)+grid[k+1]*u*(1-v)+grid[k+stride]*(1-u)*v+grid[k+stride+1]*u*v;
    const normal=new THREE.Vector3(sample(gradientX),sample(gradientY),2*position.getZ(i)/(depth*depth)).normalize();
    edgeDistance[i]=sample(contourDistance);
    normals[i*3]=normal.x;normals[i*3+1]=normal.y;normals[i*3+2]=normal.z;
  }
  geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));
  geometry.setAttribute('edgeDistance',new THREE.Float32BufferAttribute(edgeDistance,1));return geometry;
}

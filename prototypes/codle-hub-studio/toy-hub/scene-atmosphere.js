import * as THREE from 'three';
import {ease,clamp} from './story-timeline.js?v=2';

// A continuous cyclorama, with different light architecture in each chapter.
// This is a background surface, not a set of floating decorative objects.
export function createSceneAtmosphere(scene){
  const uniforms={progress:{value:0},amount:{value:0},aspect:{value:1},time:{value:0}};
  const material=new THREE.ShaderMaterial({uniforms,transparent:true,depthWrite:false,depthTest:false,
    vertexShader:'varying vec2 uv0;void main(){uv0=uv;gl_Position=vec4(position.xy,.9999,1.);}',
    fragmentShader:`varying vec2 uv0;uniform float progress,amount,aspect,time;
      float light(vec2 p,vec2 c,vec2 s){vec2 q=(p-c)/s;return exp(-dot(q,q)*2.);}
      vec3 room(float index,vec2 p){
        float drift=sin(time*.055+index)*.012;
        if(index<1.5){
          float corridor=light(p,vec2(.63+drift,.58),vec2(.48,.24));
          float ribbon=exp(-pow((p.y-.22-p.x*.25)/.14,2.))*smoothstep(.05,.9,p.x);
          return vec3(.003,.003,.008)+vec3(.030,.018,.080)*corridor+vec3(.005,.013,.038)*ribbon;
        }
        if(index<2.5){
          float aperture=light(p,vec2(.28,.66),vec2(.64,.36));
          float floor=light(p,vec2(.64,.28),vec2(.61,.14));
          return vec3(.003,.006,.015)+vec3(.018,.031,.075)*aperture+vec3(.035,.035,.025)*floor;
        }
        if(index<3.5){
          float horizon=light(p,vec2(.58,.34),vec2(.72,.19));
          float skylight=light(p,vec2(.21,.77),vec2(.60,.45));
          return vec3(.003,.012,.015)+vec3(.030,.031,.008)*horizon+vec3(.008,.034,.040)*skylight;
        }
        float tall=light(p,vec2(.78,.65),vec2(.20,.64));
        float desk=light(p,vec2(.45,.30),vec2(.72,.19));
        return vec3(.006,.005,.003)+vec3(.045,.030,.005)*tall+vec3(.018,.021,.028)*desk;
      }
      void main(){float chapter=clamp(progress,1.,4.999);float i=floor(chapter);
        // Cross the boundary before changing the room index, in both directions.
        float f=fract(chapter);vec3 c;
        if(f<.16&&i>1.)c=mix(room(i-1.,uv0),room(i,uv0),smoothstep(-.16,.16,f));
        else c=mix(room(i,uv0),room(min(4.,i+1.),uv0),smoothstep(.84,1.16,f));
        float vignette=1.-smoothstep(.15,.95,length((uv0-.5)*vec2(.85,1.)));
        c*=.72+.28*vignette;gl_FragColor=vec4(c,amount);
        #include <colorspace_fragment>
      }`});
  const geometry=new THREE.PlaneGeometry(2,2),mesh=new THREE.Mesh(geometry,material);mesh.frustumCulled=false;mesh.renderOrder=-1000;scene.add(mesh);
  return {render(position,collection,time,width,height){uniforms.progress.value=position;uniforms.amount.value=collection*ease(.88,1.16,position);uniforms.time.value=time;uniforms.aspect.value=width/height},dispose(){scene.remove(mesh);geometry.dispose();material.dispose()}};
}

import {ease,mix} from './story-timeline.js?v=2';
import {createFeatureFactories as previousFactories} from './product-actions.js?v=5';

// One inspected reference per treatment; see reference-directions.json.
// Source UI and photography replace invented product illustrations.
export function createFeatureFactories(H){
  const {THREE,own,physical,slab,face,line,canvasMap,assets,ivory}=H;
  function image(map,w,h,parent,{z=.01,crop=1}={}){
    const material=own(new THREE.ShaderMaterial({transparent:true,uniforms:{
      map:{value:map},crop:{value:crop},focus:{value:new THREE.Vector2(.5,.5)},window:{value:new THREE.Vector2(1,1)},offset:{value:new THREE.Vector2()},
      reveal:{value:1.02},worldOpacity:{value:1},localOpacity:{value:1}
      ,corner:{value:0},aspect:{value:w/h}
    },vertexShader:'varying vec2 uv0;void main(){uv0=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:`uniform sampler2D map;uniform float crop;uniform vec2 focus;uniform vec2 window;uniform vec2 offset;uniform float reveal;uniform float corner;uniform float aspect;uniform float worldOpacity;uniform float localOpacity;varying vec2 uv0;
      void main(){vec2 uv=((uv0-.5)*crop+clamp(focus,vec2(crop*.5),vec2(1.-crop*.5)))*window+offset;vec4 c=texture2D(map,uv);float a=1.-smoothstep(reveal-.015,reveal,uv0.x);if(corner>0.){vec2 q=abs((uv0-.5)*vec2(aspect,1.))-vec2(aspect*.5-corner,.5-corner);float d=length(max(q,0.))+min(max(q.x,q.y),0.)-corner;a*=1.-smoothstep(-.002,.002,d);}gl_FragColor=vec4(c.rgb,c.a*a*worldOpacity*localOpacity);
      #include <colorspace_fragment>
      }`}));
    const mesh=new THREE.Mesh(own(new THREE.PlaneGeometry(w,h)),material);mesh.position.z=z;parent.add(mesh);return mesh;
  }
  function textbook(){
    // Codrops Book Showcase: the cover pivots on its spine to expose a page.
    // Only the real cover and page 33 are printed; the inside cover is plain.
    const g=new THREE.Group(),book=new THREE.Group();g.add(book);g.userData.nativeWidth=1.85;
    // Keep the opened cover inside the same optical plane as the printed page.
    book.scale.z=.22;
    const h=2118/1628,cover=physical('#2d9da0',{roughness:.66,metalness:0,clearcoat:.06});
    slab(1,h,.026,.006,cover,book,.5,0,-.09);
    slab(.967,h-.035,.13,.003,ivory,book,.504,0,-.008);
    const page=face(.965,h-.035,.003,assets['cmass-page33.png'],book,.059,false);page.position.x=.504;
    slab(.026,h,.16,.006,cover,book,.006,0,-.008);
    const hinge=new THREE.Group();hinge.position.z=.08;book.add(hinge);
    slab(1,h,.024,.006,cover,hinge,.5,0,0);
    const front=face(.995,h-.005,.003,assets['cmass-cover.png'],hinge,.014,false);front.position.x=.5;
    slab(.973,h-.025,.003,.002,physical('#dce9e1',{roughness:.85,metalness:0,clearcoat:0}),hinge,.5,0,-.014);
    for(let i=0;i<11;i++)line([[.988,-h/2+.025,-.067+i*.012],[.988,h/2-.025,-.067+i*.012]],'#d4d0c5',book,.0008);
    g.userData.animate=p=>{
      const turn=ease(.045,.16,p),open=ease(.18,.40,p);
      book.rotation.set(mix(.07,0,open),mix(.52,0,turn),mix(-.025,0,turn));
      book.position.x=mix(-.5,-.329,open);
      hinge.rotation.y=-1.92*open;
    };return g;
  }
  function camp(){
    // Image Accordion: linked photographic windows share one continuous frame.
    // Window width changes; the photos themselves never stretch.
    const g=new THREE.Group();g.userData.nativeWidth=4.4;
    const photos=['camp-team.png','camp-code.png','camp-robot.png'].map(name=>image(assets[name],4.4,2.475,g));
    g.userData.animate=p=>{
      const first=ease(.055,.13,p),second=ease(.18,.27,p),third=ease(.32,.42,p),finish=ease(.45,.52,p);
      const weights=[mix(mix(1/3,.72,first),.14,second),mix(mix(1/3,.14,first),.72,second),mix(1/3,.14,first)];
      weights[0]=mix(weights[0],.14,third);weights[1]=mix(weights[1],.14,third);weights[2]=mix(weights[2],.72,third);
      weights[0]*=1-finish;weights[1]*=1-finish;weights[2]=mix(weights[2],1,finish);
      let edge=-2.2;
      photos.forEach((photo,i)=>{
        const span=weights[i]*4.4,gap=.025*(1-finish),visible=Math.max(.001,span-gap);
        photo.visible=weights[i]>.003;photo.scale.x=visible/4.4;photo.position.x=edge+span/2;
        const u=photo.material.uniforms;u.window.value.set(visible/4.4,1);u.offset.value.set((1-visible/4.4)*[.46,.54,.5][i],0);
        edge+=span;
      });
    };return g;
  }
  function jitda(){
    // The official prompt/result demo stays one connected image. Opening a
    // viewing window avoids the sliced header and detached result panel.
    const g=new THREE.Group();g.userData.nativeWidth=3.6;
    const ui=image(assets['jitda-official-demo.png'],3.6,3.6*644/1016,g);
    g.userData.animate=(p,viewport)=>{
      const mobile=viewport.width<=700,t=ease(.16,.38,p),u=ui.material.uniforms;
      const fraction=mobile?.5:mix(.5,1,t);
      ui.scale.set(fraction*(mobile?2:1),mobile?2:1,1);
      u.window.value.set(fraction,1);u.offset.value.set(mobile?.5*t:0,0);
      u.corner.value=.03;u.aspect.value=1016/644*fraction;
    };return g;
  }
  return {platform:previousFactories(H).platform,textbook:()=>[textbook()],camp:()=>[camp()],jitda:()=>[jitda()]};
}

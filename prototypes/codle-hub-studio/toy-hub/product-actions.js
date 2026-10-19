import {clamp,ease,mix} from './story-timeline.js?v=2';
import {toolFlight,campPhotoPose,buildPiecePose} from './scene-choreography.js?v=1';

// Actions have a start, a result and a handoff. Nothing spins on an idle loop.
export function actionAt(id,p){
  const handoff=clamp(ease(.50,.79,p));
  if(id==='platform')return {handoff,connect:clamp(ease(.10,.35,p)),screen:clamp(ease(.27,.43,p))};
  if(id==='textbook')return {handoff,cover:clamp(ease(.06,.30,p)),leaf:clamp(ease(.24,.45,p))};
  if(id==='camp')return {handoff,second:clamp(ease(.12,.23,p)),third:clamp(ease(.28,.39,p)),wide:clamp(ease(.42,.51,p))};
  return {handoff,type:clamp(ease(.015,.17,p)),outline:clamp(ease(.16,.29,p)),build:clamp(ease(.28,.47,p))};
}

// Product-specific miniature sets. Textures are authored illustrations unless
// an asset is explicitly named; only the book cover/page, lesson and photos
// are source images. No external animation runtime or per-frame texture upload.
export function createFeatureFactories(H){
  const {THREE,own,physical,slab,face,canvasMap,line,assets,icon,ivory,ink}=H;
  const v=(x,y,z=0)=>new THREE.Vector3(x,y,z);
  const basic=(color,map)=>own(new THREE.MeshBasicMaterial({color,map,transparent:true,toneMapped:false}));
  function textMap(text,color='#f3f3ee',w=1400,h=180,size=64){
    return canvasMap(w,h,c=>{c.fillStyle=color;c.font=`600 ${size}px Pretendard, sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillText(text,w/2,h/2)});
  }
  function path(points,color,parent,r=.008){
    const m=line(points,color,parent,r),count=m.geometry.index.count;
    return {m,show:t=>m.geometry.setDrawRange(0,Math.floor(clamp(t)*count/18)*18)};
  }
  function outline(points,color,parent){
    const samples=[];
    for(let i=1;i<points.length;i++)for(let j=0;j<40;j++)samples.push(v(...points[i-1]).lerp(v(...points[i]),j/40));
    samples.push(v(...points.at(-1)));
    const geometry=own(new THREE.BufferGeometry().setFromPoints(samples));
    const mesh=new THREE.Line(geometry,own(new THREE.LineBasicMaterial({color,transparent:true})));parent.add(mesh);
    return {show:t=>geometry.setDrawRange(0,Math.floor(clamp(t)*samples.length))};
  }
  function wipe(map,w,h,parent,z=0,horizontal=false){
    const material=own(new THREE.ShaderMaterial({transparent:true,uniforms:{map:{value:map},progress:{value:0},horizontal:{value:horizontal?1:0},worldOpacity:{value:1}},
      vertexShader:'varying vec2 uv0; void main(){uv0=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:`uniform sampler2D map;uniform float progress;uniform float horizontal;uniform float worldOpacity;varying vec2 uv0;
        void main(){vec4 c=texture2D(map,uv0);float a=1.-smoothstep(progress-.018,progress,mix(1.-uv0.y,uv0.x,horizontal));gl_FragColor=vec4(c.rgb,c.a*a*worldOpacity);
        #include <colorspace_fragment>
        }`
    }));
    const mesh=new THREE.Mesh(own(new THREE.PlaneGeometry(w,h)),material);mesh.position.z=z;parent.add(mesh);
    return {mesh,show:t=>{mesh.material.uniforms.progress.value=mix(0,1.025,clamp(t));mesh.visible=t>.001}};
  }
  function platform(){
    const g=new THREE.Group();g.userData.nativeWidth=3.9;
    const screen=new THREE.Group();screen.position.set(.30,.02,0);g.add(screen);
    slab(2.7,1.65,.09,.075,ink,screen);
    const ui=wipe(assets['content-ai.png'],2.56,2.56*966/1718,screen,.051);
    const marks=[[68,68,'#1686ff'],[700,68,'#00ce82'],[980,352,'#ff414a'],[349,352,'#ffb300'],[0,0,'#8963ee','</>'],[700,635,'#ff7caf']];
    const tokens=marks.map((args,i)=>{
      const token=icon(...args),x=-1.35,y=.83-i*.332;token.scale.setScalar(.27);g.add(token);
      const cable=path([[x+.14,y,.02],[x+.32,y,.02],[x+.44,y*.73,.02],[-.92,y*.73,.02]],args[2],g,.008);
      return {token,x,y,cable};
    });
    g.userData.animate=p=>{
      const connect=ease(.17,.39,p);screen.visible=connect>.002;screen.rotation.y=mix(-1.12,0,connect);screen.scale.setScalar(mix(.12,1,connect));screen.position.z=mix(-.75,0,connect);ui.show(1);
      tokens.forEach(({token,cable},i)=>{
        const t=toolFlight(i,p);token.position.set(t.x,t.y,t.z);token.rotation.set(t.pitch,t.yaw,t.roll);token.scale.setScalar(t.scale);
        cable.show(ease(.26+i*.015,.37+i*.015,p));
      });
    };return g;
  }
  function textbook(){
    const g=new THREE.Group(),book=new THREE.Group();g.add(book);g.userData.nativeWidth=2.1;
    const w=1,h=2118/1628,coverMat=physical('#50bfc1',{roughness:.38,metalness:.03,clearcoat:.3});
    slab(w,h,.026,.012,coverMat,book,.5,0,-.085);
    slab(.965,h-.045,.13,.008,ivory,book,.5,0,-.008);
    const right=face(.95,h-.055,.006,assets['cmass-page33.png'],book,.06,false);right.position.x=.5;
    for(let i=0;i<10;i++)line([[.984,-h/2+.025,-.064+i*.012],[.984,h/2-.025,-.064+i*.012]],'#c5c5bb',book,.001);
    slab(.035,h,.17,.014,coverMat,book,0,0,0);
    const hinge=new THREE.Group();hinge.position.z=.08;book.add(hinge);
    slab(w,h,.026,.012,coverMat,hinge,.5,0,0);
    const cover=face(.995,h-.008,.009,assets['cmass-cover.png'],hinge,.014,false);cover.position.x=.5;
    const inner=canvasMap(900,1180,(c,w,h)=>{c.fillStyle='#e6f0e9';c.fillRect(0,0,w,h);c.fillStyle='#397b78';c.font='600 33px Pretendard, sans-serif';c.fillText('CMASS × CODLE',75,115);c.font='700 82px Pretendard, sans-serif';c.fillText('생각을',75,370);c.fillText('실험으로.',75,480);c.lineWidth=2;c.strokeStyle='#90b9af';for(let i=0;i<7;i++){c.beginPath();c.arc(450,805,45+i*28,0,Math.PI*2);c.stroke()}});
    const endpaper=canvasMap(900,1180,(c,w,h)=>{c.fillStyle='#e3ede6';c.fillRect(0,0,w,h);c.strokeStyle='#c6d9cd';c.lineWidth=1;for(let x=60;x<w;x+=32){c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke()}});
    const inside=face(.98,h-.025,.008,endpaper,hinge,-.014,false);inside.position.x=.5;inside.rotation.y=Math.PI;
    const leafFront=own(new THREE.PlaneGeometry(.95,h-.055,28,1));leafFront.translate(.5,0,.069);
    const leafBack=own(leafFront.clone());const buv=leafBack.attributes.uv;for(let i=0;i<buv.count;i++)buv.setX(i,1-buv.getX(i));
    const leafMaterial=physical('#fff',{map:assets['cmass-page33.png'],roughness:.76,metalness:0,clearcoat:0,side:THREE.FrontSide});
    const backMaterial=physical('#fff',{map:inner,roughness:.76,metalness:0,clearcoat:0,side:THREE.BackSide});
    book.add(new THREE.Mesh(leafFront,leafMaterial),new THREE.Mesh(leafBack,backMaterial));
    const fan=[0,1].map(i=>{
      const geometry=own(new THREE.PlaneGeometry(.94,h-.06,24,1));geometry.translate(.5,0,.04+i*.008);
      const mesh=new THREE.Mesh(geometry,physical('#f6f3e7',{roughness:.72,metalness:0,clearcoat:0,side:THREE.DoubleSide}));book.add(mesh);
      return {geometry,initial:geometry.attributes.position.array.slice(),last:-1};
    });
    const initial=leafFront.attributes.position.array.slice();let last=-1;
    g.userData.animate=p=>{
      const a=actionAt('textbook',p);book.position.x=mix(-.5,0,a.cover);hinge.rotation.y=-Math.PI*.965*a.cover;
      fan.forEach((sheet,k)=>{
        const t=ease(.19+k*.036,.34+k*.036,p);if(sheet.last===t)return;sheet.last=t;
        const angle=-Math.PI*.955*t,pos=sheet.geometry.attributes.position;
        for(let i=0;i<pos.count;i++){
          const x=sheet.initial[i*3],bend=Math.sin(t*Math.PI)*.29*Math.sin(x*Math.PI*.9);
          pos.setXYZ(i,x*Math.cos(angle)+bend*Math.sin(angle),sheet.initial[i*3+1],.04+k*.008-x*Math.sin(angle)+bend*Math.cos(angle));
        }pos.needsUpdate=true;sheet.geometry.computeVertexNormals();
      });
      if(a.leaf!==last){
        last=a.leaf;const angle=-Math.PI*.955*a.leaf;
        for(const geo of [leafFront,leafBack]){
          const pos=geo.attributes.position;
          for(let i=0;i<pos.count;i++){
            const x=initial[i*3],bend=Math.sin(a.leaf*Math.PI)*.24*Math.sin(x*Math.PI*.85);
            pos.setXYZ(i,x*Math.cos(angle)+bend*Math.sin(angle),initial[i*3+1],.069+.05*a.leaf-x*Math.sin(angle)+bend*Math.cos(angle));
          }pos.needsUpdate=true;geo.computeVertexNormals();
        }
      }
    };return g;
  }
  function camp(){
    const g=new THREE.Group();g.userData.nativeWidth=4.4;
    // A photographic dolly: the close photograph passes the lens while the
    // next classroom comes into focus. No invented student artifacts.
    const photos=['camp-team.png','camp-code.png','camp-robot.png'].map(name=>{
      const map=assets[name],material=own(new THREE.ShaderMaterial({transparent:true,uniforms:{
        map:{value:map},crop:{value:new THREE.Vector2(.96,.96)},focus:{value:new THREE.Vector2(.50,.46)},worldOpacity:{value:1},shotOpacity:{value:1},brightness:{value:1}
      },vertexShader:'varying vec2 uv0;void main(){uv0=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:`uniform sampler2D map;uniform vec2 crop;uniform vec2 focus;uniform float worldOpacity;uniform float shotOpacity;uniform float brightness;varying vec2 uv0;
        void main(){vec2 uv=(uv0-.5)*crop+clamp(focus,crop*.5,1.-crop*.5);vec4 c=texture2D(map,uv);gl_FragColor=vec4(c.rgb*brightness,c.a*worldOpacity*shotOpacity);
        #include <colorspace_fragment>
        }`}));
      const mesh=new THREE.Mesh(own(new THREE.PlaneGeometry(1,1)),material);g.add(mesh);return mesh;
    });
    g.userData.animate=p=>{
      photos.forEach((mesh,i)=>{
        const shot=campPhotoPose(i,p),uniforms=mesh.material.uniforms;
        mesh.visible=shot.opacity>.001;mesh.scale.set(4.4*shot.scale,2.475*shot.scale,1);
        mesh.position.set(shot.x,shot.y,shot.z);mesh.rotation.set(shot.pitch,shot.yaw,shot.roll);
        uniforms.focus.value.set(shot.focusX,.46);uniforms.shotOpacity.value=shot.opacity;uniforms.brightness.value=shot.brightness;
      });
    };return g;
  }
  function jitda(){
    const g=new THREE.Group();g.userData.nativeWidth=3.8;
    const prompt=wipe(textMap('나만의 퀴즈 앱을 만들어줘.','#f4e6b5',1400,180,72),3.5,.45,g,.08,true);prompt.mesh.position.y=.95;
    const cursor=slab(.014,.18,.018,.004,physical('#f8d560',{emissive:'#c4a62b',emissiveIntensity:.25}),g,-1.6,.95,.13);
    const wire=new THREE.Group();g.add(wire);
    const border=outline([[-1.43,.60,0],[1.43,.60,0],[1.43,-.92,0],[-1.43,-.92,0],[-1.43,.60,0]],'#6d8297',wire);
    const lines=[[-1.20,.30,1.20,.30],[-1.20,.06,.55,.06],[-1.20,-.22,1.20,-.22],[-1.20,-.48,1.20,-.48],[-1.20,-.74,.40,-.74]].map(a=>path([[a[0],a[1],.005],[a[2],a[3],.005]],'#4e647a',wire,.004));
    const app=canvasMap(1440,760,(c,w,h)=>{
      const rect=(x,y,w,h,r,color)=>{c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill()};
      const text=(t,x,y,size,color='#303747',weight=500)=>{c.fillStyle=color;c.font=`${weight} ${size}px Pretendard, sans-serif`;c.fillText(t,x,y)};
      c.fillStyle='#f6f5f0';c.fillRect(0,0,w,h);rect(0,0,w,70,0,'#fff');text('MY FIRST AI QUIZ',46,45,22,'#64766c',700);text('01 / 05',1230,45,22,'#64766c');
      rect(70,121,1300,12,6,'#dfe6dc');rect(70,121,260,12,6,'#7eaf8c');
      text('AI는 어떻게 배울까?',70,249,62,'#253c31',750);text('데이터와 학습에 대해 알아보아요.',74,310,28,'#839187');
      [['A','데이터에서 패턴을 찾아요.'],['B','모든 답을 미리 외워요.'],['C','아무 규칙 없이 추측해요.']].forEach(([a,b],i)=>{const y=366+i*102;rect(70,y,1300,82,18,i===0?'#e3ecdf':'#fff');rect(89,y+16,50,50,12,i===0?'#82aa82':'#eff0e9');text(a,103,y+49,24,i===0?'#fff':'#829184',700);text(b,164,y+52,30);});
      text('생각에서, 나만의 결과물로.',74,725,23,'#9ba69a');
    });
    const pieces=[[0,76],[76,350],[350,456],[456,558],[558,660],[660,760]].map(([top,bottom],i)=>{
      const group=new THREE.Group(),height=(bottom-top)*1.52/760,y=.60-(top+bottom)*.5*1.52/760;
      g.add(group);slab(2.88,height,.035,.012,physical('#d5ddd4',{roughness:.3,metalness:.1}),group);
      const geo=own(new THREE.PlaneGeometry(2.88,height+.001)),uv=geo.attributes.uv;
      for(let j=0;j<uv.count;j++)uv.setY(j,1-bottom/760+uv.getY(j)*(bottom-top)/760);
      const mesh=new THREE.Mesh(geo,basic('#fff',app));mesh.position.z=.019;group.add(mesh);
      return {group,y,index:i};
    });
    const arrowShape=new THREE.Shape();arrowShape.moveTo(0,0);arrowShape.lineTo(.23,-.10);arrowShape.lineTo(.13,-.14);arrowShape.lineTo(.10,-.25);arrowShape.closePath();
    const arrow=new THREE.Mesh(own(new THREE.ExtrudeGeometry(arrowShape,{depth:.045,bevelEnabled:true,bevelThickness:.01,bevelSize:.008,bevelSegments:3})),physical('#f5d24c',{roughness:.25,clearcoat:.8}));g.add(arrow);
    g.userData.animate=p=>{
      const a=actionAt('jitda',p);prompt.show(a.type);
      const promptDock=ease(.16,.31,p),promptSize=mix(1.25,.84,promptDock);
      prompt.mesh.scale.setScalar(promptSize);prompt.mesh.position.y=mix(.22,.95,promptDock);prompt.mesh.position.z=mix(.7,.08,promptDock);
      cursor.position.set(mix(-1.53,1.53,a.type)*promptSize,prompt.mesh.position.y,.14);cursor.visible=p<.21;
      border.show(a.outline);lines.forEach((l,i)=>l.show(ease(.19+i*.014,.29+i*.014,p)));
      pieces.forEach(({group,y,index})=>{
        const pose=buildPiecePose(index,p);group.visible=pose.opacity>.01;
        group.position.set(pose.x,y+pose.y,pose.z);group.rotation.set(pose.pitch,pose.yaw,pose.roll);
        group.scale.setScalar(mix(.1,1,pose.opacity));
      });
      const press=ease(.17,.23,p)*(1-ease(.24,.29,p));
      arrow.position.set(mix(2.0,1.05,ease(.13,.28,p)),mix(.48,-.70,ease(.13,.28,p)),.16+.9*(1-ease(.13,.28,p))-.07*press);
      arrow.rotation.z=mix(-.4,.1,ease(.13,.28,p));arrow.scale.setScalar(mix(2.1,.82,ease(.17,.32,p)));
      wire.visible=p<.50;
    };return g;
  }
  return {platform:()=>[platform()],textbook:()=>[textbook()],camp:()=>[camp()],jitda:()=>[jitda()]};
}

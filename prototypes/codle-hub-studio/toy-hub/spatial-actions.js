import {clamp,ease,mix} from './story-timeline.js?v=2';
import {platformToken,bookTransform,workerStrike,textbookPuzzle} from './spatial-choreography.js?v=4';

export function createSpatialFactories(H){
  const {THREE,own,physical,slab,face,line,canvasMap,assets,icon,ivory,ink,workerModel,land}=H;
  const v=(x,y,z=0)=>new THREE.Vector3(x,y,z);
  const ball=(r,material,parent,x=0,y=0,z=0)=>{
    const mesh=new THREE.Mesh(own(new THREE.SphereGeometry(r,40,28)),material);
    mesh.position.set(x,y,z);parent.add(mesh);return mesh;
  };
  function image(map,w,h,parent,z=.01){
    const material=own(new THREE.ShaderMaterial({transparent:true,uniforms:{map:{value:map},mapB:{value:map},blend:{value:0},bend:{value:0},window:{value:new THREE.Vector2(1,1)},offset:{value:new THREE.Vector2()},reveal:{value:1.02},worldOpacity:{value:1},localOpacity:{value:1},aspect:{value:w/h},corner:{value:.024}},
      vertexShader:'uniform float bend;varying vec2 uv0;void main(){uv0=uv;vec3 p=position;p.z+=sin(uv.x*3.14159265)*bend;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}',
      fragmentShader:`uniform sampler2D map,mapB;uniform vec2 window,offset;uniform float reveal,worldOpacity,localOpacity,aspect,corner,blend;varying vec2 uv0;
      void main(){vec2 uv=uv0*window+offset;vec4 c=mix(texture2D(map,uv),texture2D(mapB,uv),blend);vec2 q=abs((uv0-.5)*vec2(aspect,1.))-vec2(aspect*.5-corner,.5-corner);float d=length(max(q,0.))+min(max(q.x,q.y),0.)-corner;float a=(1.-smoothstep(-.002,.002,d))*(1.-smoothstep(reveal-.012,reveal,uv0.x));if(c.a*a<.001)discard;gl_FragColor=vec4(c.rgb,c.a*a*worldOpacity*localOpacity);
      #include <colorspace_fragment>
      }`}));
    const mesh=new THREE.Mesh(own(new THREE.PlaneGeometry(w,h)),material);mesh.position.z=z;parent.add(mesh);return mesh;
  }
  const marks=[[68,68,'#1686ff'],[700,68,'#00ce82'],[980,352,'#ff414a'],[349,352,'#ffb300'],[0,0,'#8963ee','</>'],[700,635,'#ff7caf']];
  function platform(){
    const g=new THREE.Group();g.userData.nativeWidth=4.5;
    const screen=new THREE.Group();g.add(screen);
    slab(2.80,1.68,.11,.075,physical('#101724',{roughness:.19,metalness:.72}),screen);
    const ui=image(assets['content-ai.png'],2.70,2.70*966/1718,screen,.064);
    g.userData.landingAnchor={object:ui,width:2.70,height:2.70*966/1718,offsetZ:.006};
    const tokens=marks.map(args=>{const t=icon(...args);g.add(t);return t});
    g.userData.animate=p=>{
      const open=ease(.105,.32,p);screen.scale.setScalar(mix(.38,1,open));screen.rotation.set(.025*(1-open),mix(-.52,0,open),0);screen.position.z=mix(-1.1,0,open);
      ui.material.uniforms.localOpacity.value=open;screen.visible=open>.005;
      tokens.forEach((token,i)=>{const a=platformToken(i,p);token.position.set(a.x,a.y,a.z);token.rotation.set(a.pitch,a.yaw,a.roll);token.scale.setScalar(a.scale)});
    };return g;
  }
  function textbook(){
    const g=new THREE.Group();g.userData.nativeWidth=4.4;
    const book=new THREE.Group();g.add(book);
    const coverMat=physical('#dadbd1',{roughness:.48,metalness:.04,clearcoat:.22});
    const pageW=1.08,pageH=1.44;
    slab(pageW+.06,pageH+.07,.065,.02,coverMat,book,pageW/2,0,-.11);
    slab(pageW,pageH,.15,.018,ivory,book,pageW/2,0,-.018);
    const printed=image(assets['cmass-page33.png'],pageW-.07,pageH-.05,book,.064);printed.position.x=pageW/2;
    const leftPage=canvasMap(640,840,c=>{
      c.fillStyle='#f4f1e8';c.fillRect(0,0,640,840);c.fillStyle='#212c45';c.font='650 50px Pretendard';c.fillText('교과서',55,100);
      c.strokeStyle='#c7c9c3';c.lineWidth=2;for(let i=0;i<12;i++){c.beginPath();c.moveTo(55,155+i*44);c.lineTo(i%4===3?390:575,155+i*44);c.stroke()}
      c.strokeStyle='#244cff';c.lineWidth=4;c.beginPath();c.arc(195,690,64,0,Math.PI*2);c.stroke();c.beginPath();c.moveTo(260,690);c.lineTo(470,690);c.stroke();
    });
    for(let i=0;i<9;i++)line([[.025,-.709,-.074+i*.015],[1.04,-.709,-.074+i*.015]],'#ccc9bb',book,.001);
    const hinge=new THREE.Group();hinge.position.set(0,0,.10);book.add(hinge);
    slab(1.13,1.51,.055,.018,physical('#254bff',{roughness:.24,metalness:.15,clearcoat:.8}),hinge,.56,0,0);
    const coverMap=canvasMap(640,880,c=>{
      c.fillStyle='#254bff';c.fillRect(0,0,640,880);c.fillStyle='#f4f2e8';c.font='650 66px Pretendard';c.fillText('교과서의',58,390);c.fillText('다음 페이지.',58,480);
      c.strokeStyle='#91a5ff';c.lineWidth=2;c.strokeRect(38,38,564,804);c.font='500 23px Pretendard';c.fillText('CODLE',58,105);
    });
    const cover=face(1.10,1.48,.008,coverMap,hinge,.03,true);cover.position.x=.56;
    const inside=image(leftPage,1.10,1.48,hinge,-.031);inside.position.x=.56;inside.rotation.y=Math.PI;
    const leaf=new THREE.Group();g.add(leaf);
    const paper=image(assets['cmass-page33.png'],1.02,1.37,leaf,.006);
    paper.geometry.dispose();paper.geometry=own(new THREE.PlaneGeometry(1.02,1.37,24,18));
    paper.material.uniforms.mapB.value=assets['textbook-river-board.png'];
    const digital=new THREE.Group();g.add(digital);
    const digitalFrame=slab(2.50,1.53,.10,.075,physical('#203553',{roughness:.20,metalness:.75}),digital);
    g.userData.landingAnchor={object:digitalFrame,width:2.50,height:1.53,offsetZ:.09};
    const board=image(assets['textbook-river-board.png'],2.44,1.22,digital,.058);
    const title=canvasMap(900,85,c=>{c.fillStyle='#e6edf6';c.font='600 33px Pretendard';c.fillText('강 건너기 퍼즐',25,54)});
    const titleFace=image(title,2.36,.14,digital,.060);titleFace.position.y=.69;
    function token(name){
      const group=new THREE.Group();digital.add(group);
      const body=new THREE.Mesh(own(new THREE.CylinderGeometry(.155,.155,.048,40)),physical('#ffb531',{roughness:.29,metalness:.08,clearcoat:.55}));body.rotation.x=Math.PI/2;group.add(body);
      image(assets[name],.33,.33,group,.027);return group;
    }
    const wolf=token('textbook-wolf.png'),cabbage=token('textbook-cabbage.png'),sheep=token('textbook-sheep.png'),farmer=token('textbook-farmer.png');
    wolf.position.set(-.95,.25,.10);cabbage.position.set(-.93,-.35,.10);
    const boat=image(assets['textbook-boat.png'],.67,.67,digital,.12);
    g.userData.animate=(p,viewport)=>{
      const mobile=viewport.width<=700,a=bookTransform(p),toY=mobile?-.20:.13;
      book.position.set(mix(-.54,0,a.open)-(mobile?.58:1.10)*a.digital-a.exit*.85,mix(0,mobile?.45:-.10,a.digital)-a.exit*.16,-.10-a.exit*.4);book.scale.setScalar(mix(1,.86,a.digital));
      book.rotation.set(mix(.19,.13,a.open),mix(.15,-.12,a.digital),mix(-.04,.025,a.digital));
      hinge.rotation.y=-Math.PI*.98*a.open;
      const lift=ease(.20,.49,p),toX=mobile?0:.72;
      leaf.visible=p>.20&&p<.49;leaf.position.set(mix(.54,toX,lift),mix(0,toY,lift),mix(.13,.685,lift)+Math.sin(lift*Math.PI)*.55);leaf.rotation.set(-.22*Math.sin(lift*Math.PI),-.42*Math.sin(lift*Math.PI)-.08*lift,0);
      leaf.scale.set(mix(1,2.44/1.02,a.digital),mix(1,1.22/1.37,a.digital),1);
      paper.material.uniforms.blend.value=ease(.30,.43,p);paper.material.uniforms.bend.value=.12*Math.sin(lift*Math.PI);
      digital.visible=a.digital>.002;digital.position.set(mix(.55,mobile?0:.72,a.digital),mix(.06,toY,a.digital),mix(.22,.62,a.digital));digital.rotation.set(mix(-.16,0,a.digital),mix(-.65,-.08,a.digital),.015*(1-a.digital));digital.scale.setScalar(mix(.36,1,a.digital));
      board.visible=p>=.485;
      const puzzle=textbookPuzzle(p);
      boat.position.set(puzzle.boatX,-.17,.12);farmer.position.set(puzzle.farmerX,.04,.16);sheep.position.set(puzzle.sheepX,puzzle.sheepY,.17);
      for(const object of [wolf,cabbage,sheep,farmer,boat]){
        object.visible=puzzle.appear>.001;object.scale.setScalar(mix(.45,1,puzzle.appear));
        object.traverse(node=>{if(node.material){node.material.userData.localOpacity=puzzle.appear;if(node.material.uniforms?.localOpacity)node.material.uniforms.localOpacity.value=puzzle.appear}});
      }
    };return g;
  }
  function camp(){
    const g=new THREE.Group();g.userData.nativeWidth=4.25;
    // The iris opens from the globe's near side, ahead of its flight routes.
    g.userData.landingAnchor={object:g,width:2.68,height:2.68*9/16,offsetZ:1.9};
    const world=new THREE.Group();g.add(world);
    const map=canvasMap(2048,1024,(c,w,h)=>{
      c.fillStyle='#09111d';c.fillRect(0,0,w,h);c.fillStyle='#2159ed';
      for(const feature of land.features){
        const polys=feature.geometry.type==='Polygon'?[feature.geometry.coordinates]:feature.geometry.coordinates;
        for(const polygon of polys){c.beginPath();for(const ring of polygon){ring.forEach(([lon,lat],i)=>{const x=(lon+180)/360*w,y=(90-lat)/180*h;i?c.lineTo(x,y):c.moveTo(x,y)});c.closePath()}c.fill('evenodd')}
      }
      c.strokeStyle='rgba(121,158,216,.14)';c.lineWidth=1;
      for(let i=1;i<12;i++){c.beginPath();c.moveTo(0,h*i/12);c.lineTo(w,h*i/12);c.stroke()}
      for(let i=1;i<24;i++){c.beginPath();c.moveTo(w*i/24,0);c.lineTo(w*i/24,h);c.stroke()}
    });
    ball(1.14,physical('#ffffff',{map,roughness:.21,metalness:.38,clearcoat:1,clearcoatRoughness:.08}),world);
    const routes=new THREE.Group();world.add(routes);
    const starts=[v(-.86,.50,.64),v(.80,.48,.72),v(.20,-.73,.87)];
    const nodes=starts.map((pos,i)=>{
      const group=new THREE.Group();routes.add(group);group.position.copy(pos.clone().normalize().multiplyScalar(1.20));
      ball(.088,physical(['#ffce2c','#6ce1c0','#dfe7f5'][i],{roughness:.17,metalness:.28}),group);
      const token=icon(...marks[[0,1,4][i]]);token.scale.setScalar(.29);group.add(token);token.position.copy(pos.clone().normalize().multiplyScalar(.19));return group;
    });
    const routePoints=[];
    for(let i=0;i<3;i++){
      const a=starts[i].clone().normalize().multiplyScalar(1.33),b=starts[(i+1)%3].clone().normalize().multiplyScalar(1.33),mid=a.clone().add(b).normalize().multiplyScalar(1.8);
      routePoints.push(a,mid);
    }
    const journeyCurve=new THREE.CatmullRomCurve3(routePoints,true,'centripetal');
    const rail=new THREE.Mesh(own(new THREE.TubeGeometry(journeyCurve,192,.008,6,true)),physical('#8faddc',{metalness:.8,roughness:.24}));routes.add(rail);
    const traveler=new THREE.Group();routes.add(traveler);
    const planeShape=new THREE.Shape();planeShape.moveTo(0,.19);planeShape.lineTo(-.13,-.11);planeShape.lineTo(0,-.045);planeShape.lineTo(.13,-.11);planeShape.closePath();
    const plane=new THREE.Mesh(own(new THREE.ExtrudeGeometry(planeShape,{depth:.023,bevelEnabled:true,bevelSize:.008,bevelThickness:.008,bevelSegments:3,steps:1})),physical('#f0e9ce',{metalness:.2,roughness:.23}));traveler.add(plane);
    const orbit=new THREE.Mesh(own(new THREE.TorusGeometry(1.56,.008,8,160)),physical('#66768f',{metalness:.8,roughness:.3}));orbit.rotation.set(.66,.25,-.22);world.add(orbit);
    g.userData.animate=p=>{
      const t=ease(.04,.53,p),q=t*.98;
      world.rotation.set(-.16+Math.sin(t*Math.PI)*.12,-.20+t*.92,-.09);
      traveler.position.copy(journeyCurve.getPoint(q));traveler.quaternion.setFromUnitVectors(v(0,1,0),journeyCurve.getTangent(q));
      world.scale.setScalar(mix(.78,1,ease(.015,.13,p)));
      nodes.forEach((node,n)=>node.scale.setScalar(1+.14*Math.sin(clamp((t-n/3)*3)*Math.PI)));
    };return g;
  }
  function jitda(){
    const g=new THREE.Group();g.userData.nativeWidth=4.8;
    const worker=new THREE.Group();g.add(worker);
    const yellow=physical('#ffce2c',{roughness:.16,metalness:.08,clearcoat:1});
    const dark=physical('#20242d',{roughness:.19,metalness:.38,clearcoat:.8});
    const helmetMaterial=physical('#ffffff',{vertexColors:true,roughness:.17,metalness:.04,clearcoat:1,clearcoatRoughness:.075});
    for(const {geometry,material,z} of workerModel){
      const mesh=new THREE.Mesh(geometry,material==='helmet'?helmetMaterial:dark);mesh.position.z=z;worker.add(mesh);
    }
    const pickaxe=new THREE.Group();worker.add(pickaxe);pickaxe.position.set(-.48,-.38,.23);
    const handle=new THREE.Mesh(own(new THREE.CapsuleGeometry(.027,.75,6,12)),physical('#9c6b3f',{roughness:.35,metalness:.04}));handle.position.y=.28;pickaxe.add(handle);
    const curve=new THREE.QuadraticBezierCurve3(v(-.25,.68),v(0,.82),v(.30,.68));
    const head=new THREE.Mesh(own(new THREE.TubeGeometry(curve,32,.045,10,false)),physical('#606a7a',{roughness:.19,metalness:.92}));pickaxe.add(head);
    ball(.052,yellow,pickaxe,-.025,.17,.026);ball(.052,yellow,pickaxe,.025,.03,.026);
    const dust=Array.from({length:5},(_,i)=>{const mesh=new THREE.Mesh(own(new THREE.OctahedronGeometry(.022+i*.003,0)),physical('#94b5df',{metalness:.45,roughness:.22}));worker.add(mesh);return mesh});
    const stage=slab(.49,.06,.36,.08,physical('#38485f',{roughness:.3,metalness:.7}),worker,-1.05,-.73,.13);
    const screen=new THREE.Group();g.add(screen);
    const frame=slab(3.24,2.06,.11,.09,physical('#161e2a',{roughness:.18,metalness:.72}),screen);
    const ui=image(assets['jitda-official-demo.png'],3.16,3.16*644/1016,screen,.064);
    g.userData.landingAnchor={object:ui,width:3.16,height:3.16*644/1016,offsetZ:.006};
    const outline=slab(3.29,2.11,.026,.10,physical('#506da4',{roughness:.22,metalness:.8}),screen,0,0,-.046);
    g.userData.animate=(p,viewport)=>{
      const mobile=viewport.width<=700,a=workerStrike(p),arrive=ease(.025,.18,p),leave=ease(.56,.77,p);
      const workerScale=mobile?.95:1.05,unfold=ease(.35,.51,p);
      worker.position.set((mobile?-.96:-1.43)-leave*.80,(mobile?.95:-.02)-leave*.14,.48-leave*.5);worker.scale.set(-workerScale,workerScale,workerScale);worker.rotation.set(.015,mix(-.16,.06,a.build),-.02-.04*a.impact);
      pickaxe.rotation.z=a.angle;
      screen.position.set(mobile?0:mix(1.15,.64,unfold),mobile?mix(-1.02,-.16,unfold):.06,mix(-.7,0,arrive));screen.scale.setScalar(mix(mobile?.50:.68,mobile?.95:1,unfold));screen.rotation.set(0,mix(-.18,-.035,arrive),0);
      frame.scale.y=outline.scale.y=ui.scale.y=mobile?2:1;
      ui.material.uniforms.window.value.set(mobile?.5:1,1);ui.material.uniforms.offset.value.set(mobile?a.build*.5:0,0);ui.material.uniforms.aspect.value=1016/644*(mobile?.5:1);
      ui.material.uniforms.reveal.value=mobile?1.025:mix(.49,1.025,a.build);
      dust.forEach((m,i)=>{const t=a.dustProgress;m.visible=a.dustOpacity>.01;m.position.set(-1.05+Math.cos(i*1.9)*t*.34,-.68+Math.sin(t*Math.PI)*(.12+i*.025),.21+i*.03);m.scale.setScalar(1-t*.6);m.material.userData.localOpacity=a.dustOpacity});
      outline.visible=a.build>.02;stage.position.y=-.73;stage.visible=p<.395;stage.material.userData.localOpacity=1-ease(.345,.395,p);
    };return g;
  }
  return {platform:()=>[platform()],textbook:()=>[textbook()],camp:()=>[camp()],jitda:()=>[jitda()]};
}

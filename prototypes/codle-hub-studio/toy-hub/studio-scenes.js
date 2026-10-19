import {ease,mix,clamp} from './story-timeline.js?v=2';
import {createSpatialFactories} from './spatial-actions.js?v=6';
import {textbookPuzzle,workerStrike} from './spatial-choreography.js?v=8';

// One material family: cobalt glass, warm paper, graphite and polished yellow.
// The platform factory is retained without changing its tools or choreography.
export function createStudioScenes(H){
  const {THREE,own,physical,slab,face,line,canvasMap,assets,icon,workerModel}=H;
  const kept=createSpatialFactories(H),v=(x,y,z=0)=>new THREE.Vector3(x,y,z);
  const paper=physical('#f1eee4',{roughness:.33,metalness:.02,clearcoat:.35});
  const blue=physical('#175cff',{roughness:.15,metalness:.24,clearcoat:1,clearcoatRoughness:.07});
  const gold=physical('#ffd02f',{roughness:.19,metalness:.18,clearcoat:1});
  const graphite=physical('#172330',{roughness:.22,metalness:.64,clearcoat:.65});
  function ball(r,mat,parent,x=0,y=0,z=0){const m=new THREE.Mesh(own(new THREE.SphereGeometry(r,32,24)),mat);m.position.set(x,y,z);parent.add(m);return m}
  function image(map,w,h,parent,z=.01){
    const mat=own(new THREE.ShaderMaterial({transparent:true,uniforms:{map:{value:map},mapB:{value:map},blend:{value:0},bend:{value:0},window:{value:new THREE.Vector2(1,1)},offset:{value:new THREE.Vector2()},worldOpacity:{value:1},localOpacity:{value:1}},
      vertexShader:'uniform float bend;varying vec2 uv0;void main(){uv0=uv;vec3 p=position;p.z+=sin(uv.x*3.14159265)*bend;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}',
      fragmentShader:`uniform sampler2D map,mapB;uniform vec2 window,offset;uniform float blend,worldOpacity,localOpacity;varying vec2 uv0;
        void main(){vec2 uv=uv0*window+offset;vec4 c=mix(texture2D(map,uv),texture2D(mapB,uv),blend);if(c.a<.005)discard;gl_FragColor=vec4(c.rgb,c.a*worldOpacity*localOpacity);
        #include <colorspace_fragment>
        }`}));
    const m=new THREE.Mesh(own(new THREE.PlaneGeometry(w,h)),mat);m.position.z=z;parent.add(m);return m;
  }
  function localFade(object,amount){object.visible=amount>.002;object.traverse(n=>{if(n.material){n.material.userData.localOpacity=amount;if(n.material.uniforms?.localOpacity)n.material.uniforms.localOpacity.value=amount}})}
  function extrude(shape,depth,mat,parent,z=0,bevel=.015){
    const m=new THREE.Mesh(own(new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSize:bevel,bevelThickness:bevel,bevelSegments:3,curveSegments:32,steps:1})),mat);m.position.z=z;parent.add(m);return m;
  }
  function shadow(parent,w,h,z=-.18){
    const map=canvasMap(128,128,c=>{const a=c.createRadialGradient(64,64,0,64,64,64);a.addColorStop(0,'rgba(0,0,0,.55)');a.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=a;c.fillRect(0,0,128,128)});
    return image(map,w,h,parent,z);
  }
  function textbook(){
    const g=new THREE.Group();g.userData.nativeWidth=4.5;
    const book=new THREE.Group();g.add(book);shadow(book,1.65,1.95,-.20);
    slab(1.15,1.53,.055,.024,blue,book,.55,0,-.12);
    slab(1.08,1.45,.15,.018,paper,book,.54,0,-.02);
    const page=image(assets['cmass-page33.png'],1.02,1.40,book,.065);page.position.x=.54;
    for(let i=0;i<7;i++)line([[.02,-.713,-.075+i*.018],[1.06,-.713,-.075+i*.018]],'#b9b9ae',book,.0015);
    const hinge=new THREE.Group();book.add(hinge);hinge.position.z=.10;
    slab(1.15,1.53,.045,.024,blue,hinge,.55);
    const cover=canvasMap(640,880,c=>{
      c.fillStyle='#edece3';c.fillRect(0,0,640,880);c.fillStyle='#174dff';c.fillRect(0,724,640,156);
      c.font='620 76px Pretendard';c.fillText('교과서의',52,340);c.fillText('다음 장면.',52,440);
      c.font='500 24px Pretendard';c.fillText('CODLE',52,93);c.strokeStyle='#174dff';c.lineWidth=4;c.beginPath();c.moveTo(54,565);c.lineTo(570,565);c.stroke();
    });
    const coverFace=face(1.11,1.49,.02,cover,hinge,.028,true);coverFace.position.x=.55;
    const endpaper=canvasMap(128,128,c=>{c.fillStyle='#eeeade';c.fillRect(0,0,128,128)});
    const inside=image(endpaper,1.06,1.44,hinge,-.027);inside.position.x=.55;inside.rotation.y=Math.PI;
    const leaf=new THREE.Group();g.add(leaf);
    const leafFace=image(assets['cmass-page33.png'],1.02,1.40,leaf,.01);
    leafFace.geometry.dispose();leafFace.geometry=own(new THREE.PlaneGeometry(1.02,1.40,28,22));
    const blank=canvasMap(512,512,c=>{c.fillStyle='#f1eee4';c.fillRect(0,0,512,512)});leafFace.material.uniforms.mapB.value=blank;

    const board=new THREE.Group();g.add(board);shadow(board,3.1,2.0,-.12);
    const bankL=new THREE.Shape();bankL.moveTo(-1.12,.74);bankL.quadraticCurveTo(-1.31,.74,-1.31,.55);bankL.lineTo(-1.31,-.54);bankL.quadraticCurveTo(-1.31,-.75,-1.10,-.75);bankL.lineTo(-.25,-.75);bankL.bezierCurveTo(-.20,-.57,-.42,-.39,-.20,-.13);bankL.bezierCurveTo(.12,.18,-.57,.35,-.36,.74);bankL.closePath();
    const bankR=new THREE.Shape();bankR.moveTo(.28,.74);bankR.bezierCurveTo(.13,.50,.64,.34,.39,.04);bankR.bezierCurveTo(.10,-.28,.48,-.41,.39,-.75);bankR.lineTo(1.10,-.75);bankR.quadraticCurveTo(1.31,-.75,1.31,-.54);bankR.lineTo(1.31,.55);bankR.quadraticCurveTo(1.31,.74,1.12,.74);bankR.closePath();
    extrude(bankL,.12,paper,board,-.04,.035);extrude(bankR,.12,paper,board,-.04,.035);
    // A physical river rises out of the printed page. Original activity
    // characters remain on ceramic pieces rather than a large cartoon image.
    const river=new THREE.Shape();river.moveTo(-.36,.76);river.bezierCurveTo(-.57,.35,.12,.18,-.20,-.13);river.bezierCurveTo(-.42,-.39,-.20,-.57,-.25,-.76);river.lineTo(.39,-.76);river.bezierCurveTo(.48,-.41,.10,-.28,.39,.04);river.bezierCurveTo(.64,.34,.13,.50,.28,.76);river.closePath();
    const water=extrude(river,.035,blue,board,.052,.018);
    const waterLines=[-.16,.08,.21].map((x,i)=>line([[x,.66,.10],[x-.09,.31,.10],[x+.16,-.04,.10],[x-.03,-.36,.10],[x+.08,-.66,.10]],'#77b8ff',board,.003));
    const pieces={};
    for(const name of ['wolf','cabbage','farmer','sheep']){
      const t=new THREE.Group();board.add(t);slab(.34,.35,.085,.14,paper,t);
      image(assets['textbook-'+name+'.png'],.34,.34,t,.05);pieces[name]=t;
    }
    const boat=new THREE.Group();board.add(boat);slab(.69,.17,.15,.075,gold,boat,0,-.08,.10);
    line([[-.29,-.025,.20],[0,-.035,.23],[.29,-.025,.20]],'#fff0a1',boat,.008);
    const riverParts=[water,...waterLines,...Object.values(pieces),boat];
    g.userData.landingAnchor={object:board,width:2.68,height:1.62,offsetZ:.14};
    g.userData.animate=(p,{width})=>{
      const mobile=width<=700,open=ease(.055,.245,p),digital=ease(.28,.49,p),settle=ease(.54,.76,p);
      book.position.set(mix(-.53,mobile?-.63:-1.12,digital),mix(0,mobile?.57:-.04,digital),-.20);book.scale.setScalar(mix(1,.75,digital));book.rotation.set(.18,-.15-digital*.16,.025);
      hinge.rotation.y=-Math.PI*.97*open;
      const x=mobile?0:.69,y=mobile?-.19:.02,lift=ease(.19,.46,p);
      leaf.visible=p>.19&&p<.46;leaf.position.set(mix(.54,x,lift),mix(0,y,lift),mix(.10,.44,lift)+Math.sin(lift*Math.PI)*.43);
      leaf.rotation.set(-.20*Math.sin(lift*Math.PI),-.33*Math.sin(lift*Math.PI),0);leaf.scale.set(mix(1,2.68/1.02,digital),mix(1,1.62/1.40,digital),1);
      leafFace.material.uniforms.blend.value=ease(.285,.42,p);leafFace.material.uniforms.bend.value=.16*Math.sin(lift*Math.PI);
      board.visible=digital>.002;board.position.set(mix(.54,x,digital)-settle*(mobile?0:.30),mix(0,y,digital),mix(.1,.38,digital));board.rotation.set(mix(-.12,-.36,digital),mix(-.34,-.19,digital),.025);board.scale.setScalar(mix(.40,mobile?1:1.07,digital));
      const a=textbookPuzzle(.34+(p-.34)*.70),rise=ease(.37,.49,p);
      pieces.wolf.position.set(-.91,.23,.14);pieces.cabbage.position.set(-.93,-.35,.14);
      pieces.farmer.position.set(a.farmerX,.045,.18);pieces.sheep.position.set(a.sheepX,a.sheepY,.19);boat.position.set(a.boatX,-.16,.10);
      riverParts.forEach((object,i)=>{localFade(object,rise);object.scale.setScalar(mix(.72,1,rise));if(i>waterLines.length)object.position.z+=.20*(1-rise)});
    };return g;
  }
  function paperPlane(parent,mat){
    const s=new THREE.Shape();s.moveTo(0,.22);s.lineTo(-.17,-.13);s.lineTo(0,-.045);s.lineTo(.17,-.13);s.closePath();
    const g=new THREE.Group();extrude(s,.025,mat,g,0,.006);line([[0,.20,.039],[0,-.045,.039]],'#fff6cb',g,.004);parent.add(g);return g;
  }
  function camp(){
    const g=new THREE.Group();g.userData.nativeWidth=4.5;
    const field=new THREE.Group();g.add(field);shadow(field,5.2,2.9,-.30);
    const centers=[v(-1.35,-.10,.02),v(0,.44,.16),v(1.37,-.06,.03)];
    const mobileCenters=[v(-1.05,.56,.02),v(.05,-.06,.16),v(1.04,-.56,.03)];
    const pads=centers.map((p,i)=>{const group=new THREE.Group();field.add(group);group.position.copy(p);const base=new THREE.Mesh(own(new THREE.CylinderGeometry(.48,.52,.16,64)),i===1?blue:i===0?graphite:paper);base.rotation.x=Math.PI/2;group.add(base);return group});
    const curve=new THREE.CatmullRomCurve3([v(-1.80,-.41,.12),v(-1.18,.33,.22),v(-.38,.98,.31),v(.64,.70,.32),v(1.12,-.44,.20),v(1.82,.27,.25)]);
    const mobileCurve=new THREE.CatmullRomCurve3([v(-1.50,.25,.12),v(-1.12,.92,.22),v(-.28,.78,.31),v(.64,.26,.32),v(.74,-.68,.20),v(1.55,-.40,.25)]);
    const rails=[curve,mobileCurve].map(path=>{const rail=new THREE.Mesh(own(new THREE.TubeGeometry(path,144,.012,10,false)),physical('#73a6ff',{roughness:.17,metalness:.45,clearcoat:1}));field.add(rail);return rail});
    const idea=icon(349,352,'#ffb300');idea.scale.setScalar(.44);pads[0].add(idea);idea.position.set(0,.15,.29);idea.rotation.x=.72;
    const brackets=icon(0,0,'#8963ee','</>');brackets.scale.setScalar(.38);pads[1].add(brackets);brackets.position.set(0,-.14,.40);brackets.rotation.x=.72;
    const project=new THREE.Group();pads[2].add(project);
    const blocks=Array.from({length:3},(_,i)=>{const m=slab(.52,.20,.20,.065,i===2?gold:blue,project,(i-1)*.10,(i-1)*.07,.16+i*.18);return m});
    const flagRig=new THREE.Group();project.add(flagRig);flagRig.position.set(.18,.05,.61);flagRig.rotation.x=Math.PI/2;
    const pole=new THREE.Mesh(own(new THREE.CylinderGeometry(.014,.014,.61,16)),physical('#d6e0ee',{roughness:.2,metalness:.85}));pole.position.y=.30;flagRig.add(pole);
    const flagShape=new THREE.Shape();flagShape.moveTo(0,.61);flagShape.lineTo(.40,.49);flagShape.lineTo(0,.36);flagShape.closePath();extrude(flagShape,.018,gold,flagRig,0,.004);
    const arch=new THREE.Mesh(own(new THREE.TorusGeometry(.48,.07,16,72,Math.PI)),blue);arch.position.set(.02,.29,.24);arch.rotation.set(Math.PI/2,.06,0);pads[1].add(arch);
    const traveler=paperPlane(field,paper);const tokens=[icon(68,68,'#1686ff'),icon(700,68,'#00ce82')];tokens.forEach(t=>field.add(t));
    const trail=Array.from({length:7},(_,i)=>ball(.017,physical('#b7d8ff',{emissive:'#7eaeff',emissiveIntensity:.3}),field));
    g.userData.landingAnchor={object:field,width:3.95,height:2.12,offsetZ:.70,volumeBounds:true};
    g.userData.animate=(p,{width})=>{
      const mobile=width<=700,travel=ease(.08,.58,p),build=ease(.31,.60,p),arrive=ease(-.03,.17,p),path=mobile?mobileCurve:curve,stations=mobile?mobileCenters:centers;
      rails[0].visible=!mobile;rails[1].visible=mobile;arch.position.set(mobile?0:.02,mobile?.08:-.15,.08);
      field.rotation.set(mobile?-.69:-.80,mix(-.16,.08,travel),-.055);field.position.y=mobile?.08:0;
      pads.forEach((pad,i)=>{pad.scale.setScalar(ease(i===1?-.10:.015+i*.035,i===1?-.02:.16+i*.035,p));pad.position.copy(stations[i]);pad.position.z+=.1*Math.sin(clamp((p-i*.08)*4)*Math.PI)});
      traveler.position.copy(path.getPoint(travel));traveler.position.z+=.28;traveler.quaternion.setFromUnitVectors(v(0,1,0),path.getTangent(travel));traveler.scale.setScalar(.84);
      tokens.forEach((token,i)=>{const t=clamp(travel-.13-i*.12),pos=path.getPoint(t);token.position.copy(pos);token.position.z+=.06;token.scale.setScalar(mix(.37,.20,build));token.rotation.set(-.14,.25-i*.5,-.13);localFade(token,arrive*(1-ease(.55,.69,p)))});
      blocks.forEach((m,i)=>{const a=ease(.30+i*.055,.43+i*.055,p);m.position.set((i-1)*.10,(i-1)*.07,.16+i*.18+(1-a)*.65);localFade(m,a)});
      project.scale.setScalar(mix(.50,1,build));
      trail.forEach((m,i)=>{m.position.copy(path.getPoint(clamp(travel-.018*(i+1))));m.position.z+=.28;m.scale.setScalar((1-i/8)*Math.sin(travel*Math.PI));m.visible=travel>.025&&travel<.98});
    };return g;
  }
  function jitda(){
    const g=new THREE.Group();g.userData.nativeWidth=4.8;
    const bench=new THREE.Group();g.add(bench);shadow(bench,4.8,2.8,-.16);
    const oldTop=slab(3.70,.28,.38,.12,graphite,bench,.28,-1.08,.04);
    const oldEdge=line([[-1.48,-.94,.23],[2.06,-.94,.23]],'#8196af',bench,.008);
    const sharedDeck=new THREE.Group();bench.add(sharedDeck);
    slab(4.70,.20,.70,.085,graphite,sharedDeck,-.13,-1.04,.10);
    line([[-2.43,-.94,.455],[2.17,-.94,.455]],'#8196af',sharedDeck,.006);
    const workerContact=shadow(sharedDeck,1.04,.54,0);workerContact.rotation.x=-Math.PI/2;workerContact.position.set(-1.74,-.938,.29);
    const screenContact=shadow(sharedDeck,3.35,.42,0);screenContact.rotation.x=-Math.PI/2;screenContact.position.set(.28,-.938,.14);
    const display=new THREE.Group();bench.add(display);display.position.set(.28,.06,.12);
    const prompt=new THREE.Group(),result=new THREE.Group();display.add(prompt,result);prompt.position.x=-.80;result.position.x=.80;
    const paneW=1.57,paneH=1.99;
    slab(paneW+.035,paneH+.035,.055,.065,graphite,prompt);
    const left=image(assets['jitda-official-demo.png'],paneW,paneH,prompt,.035);left.material.uniforms.window.value.set(.5,1);
    const tiles=[];
    for(let row=0;row<2;row++)for(let col=0;col<2;col++){
      const tile=new THREE.Group();result.add(tile);slab(paneW/2+.005,paneH/2+.005,.055,.02,graphite,tile);
      const f=image(assets['jitda-official-demo.png'],paneW/2,paneH/2,tile,.035);f.material.uniforms.window.value.set(.25,.5);f.material.uniforms.offset.value.set(.5+col*.25,(1-row)*.5);
      tiles.push({tile,x:(col-.5)*paneW/2,y:(.5-row)*paneH/2,row,col});
    }
    const worker=new THREE.Group();g.add(worker);
    const dark=physical('#574f43',{roughness:.14,metalness:.48,clearcoat:1,clearcoatRoughness:.06,envMapIntensity:1.25});
    const helmet=physical('#ffffff',{vertexColors:true,roughness:.17,metalness:.06,clearcoat:1});
    for(const part of workerModel){const mesh=new THREE.Mesh(part.geometry,part.material==='helmet'?helmet:dark);mesh.position.z=part.z+(part.material==='helmet'?0:.08);mesh.position.y=part.material==='helmet'?0:-.035;worker.add(mesh)}
    const tool=new THREE.Group();worker.add(tool);tool.position.set(-.68,-.38,.32);
    const handle=new THREE.Mesh(own(new THREE.CapsuleGeometry(.027,.75,6,12)),physical('#9c6b3f',{roughness:.35,metalness:.04}));handle.position.y=.28;tool.add(handle);
    const headCurve=new THREE.QuadraticBezierCurve3(v(-.25,.68),v(0,.82),v(.30,.68));tool.add(new THREE.Mesh(own(new THREE.TubeGeometry(headCurve,32,.045,10,false)),physical('#606a7a',{roughness:.19,metalness:.92})));
    ball(.052,gold,tool,-.025,.17,.026);ball(.052,gold,tool,.025,.03,.026);
    const dust=Array.from({length:5},(_,i)=>{const m=new THREE.Mesh(own(new THREE.OctahedronGeometry(.022+i*.003)),blue);worker.add(m);return m});
    g.userData.landingAnchor={object:display,width:3.20,height:2.04,offsetZ:.08};
    g.userData.animate=(p,{width})=>{
      const mobile=width<=700,a=workerStrike(p),assemble=ease(.14,.51,p),present=ease(.53,.75,p);
      bench.position.set(mobile?0:.15,mobile?-.19:0,-.05);bench.rotation.set(.015,mix(-.12,0,present),0);
      bench.scale.setScalar(mobile?.93:1);display.rotation.set(mix(-.23,0,assemble),0,0);
      prompt.rotation.y=mix(-.36,0,ease(.06,.28,p));
      tiles.forEach(({tile,x,y,row,col},i)=>{const start=i<2?.165:.335,t=ease(start,start+.13,p);tile.position.set(x+(1-t)*(col?1:-1)*.14,y+(1-t)*(row?-.08:.08),mix(.24,0,t));tile.rotation.set((1-t)*(row?.16:-.16),(1-t)*(col?.24:-.24),0);localFade(tile,ease(start-.025,start+.045,p))});
      worker.position.set((mobile?-1.27:-1.72)-present*.30,-.36+present*.18,.46);worker.scale.set(-.83,.83,.83);worker.rotation.set(.015,mix(-.14,.03,a.build),-.02);tool.rotation.z=a.angle;
      // The work edge belongs to the same bench as the assembling official UI.
      dust.forEach((m,i)=>{m.visible=a.dustOpacity>.01;m.position.set(-1.25+Math.cos(i*1.9)*a.dustProgress*.30,-.68+Math.sin(a.dustProgress*Math.PI)*(.12+i*.025),.23+i*.025);m.scale.setScalar(1-a.dustProgress*.6);m.material.userData.localOpacity=a.dustOpacity});
      if(mobile){
        display.scale.setScalar(.93);display.position.set(.02,.14,.12);worker.position.y=-.60+present*.12;worker.position.x=-1.18-present*.04;worker.position.z=.93;worker.scale.set(-.66,.66,.66);
        prompt.position.x=mix(-.80,-1.10,present);prompt.position.z=-.40*present;prompt.scale.setScalar(mix(1,.68,present));
        result.position.x=mix(.80,.40,present);result.position.z=.26*present;result.scale.setScalar(mix(1,1.45,present));
        g.userData.landingAnchor={object:present>.5?result:display,width:present>.5?paneW:3.20,height:present>.5?paneH:2.04,offsetZ:.08};
        if(worker.parent!==g)g.add(worker);oldTop.visible=oldEdge.visible=true;sharedDeck.visible=false;
      }else{
        // The character, contact surface and UI share one local coordinate frame.
        // Nothing drifts away when the completed interface is presented.
        if(worker.parent!==bench)bench.add(worker);oldTop.visible=oldEdge.visible=false;sharedDeck.visible=true;
        worker.position.set(-1.76,-.475-a.impact*.012,.30);worker.scale.set(-.79,.79,.79);worker.rotation.set(.015,.025,-.02);
        tool.rotation.z=-.35+(a.angle+.35)*.92;
        display.scale.setScalar(1);display.position.set(.28,.06-a.impact*.018,.12);
        prompt.position.set(-.80,0,0);prompt.scale.setScalar(1);result.position.set(.80,0,0);result.scale.setScalar(1);
        bench.rotation.z=-a.impact*.003;
        dust.forEach((m,i)=>m.position.set(-1.38+Math.cos(i*1.9)*a.dustProgress*.18,-.59+Math.sin(a.dustProgress*Math.PI)*(.10+i*.02),.32+i*.018));
        g.userData.landingAnchor={object:bench,width:4.70,height:2.20,volumeBounds:true};
      }
    };return g;
  }
  return {platform:kept.platform,textbook:()=>[textbook()],camp:()=>[camp()],jitda:()=>[jitda()]};
}

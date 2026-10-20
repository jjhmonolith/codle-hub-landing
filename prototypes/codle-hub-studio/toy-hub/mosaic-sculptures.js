import * as T from 'three';

// Closed, curved sheets: the silhouette, edge and reverse are real geometry.
function leaf(w,h,side,bend,thickness,mat,parent){
 const nx=40,ny=16,positions=[],uv=[],indices=[],n=(nx+1)*(ny+1);
 for(let skin=0;skin<2;skin++)for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){
  const u=i/nx,v=j/ny;
  const corner=.055*Math.pow(Math.abs(v-.5)*2,14)*Math.pow(u,14);
  positions.push(side*(w*u-corner),h*(v-.5),bend*Math.sin(Math.PI*u*.86)+.08*u*u*(v-.5)-(skin?thickness:0));uv.push(u,v);
 }
 const tri=(a,b,c)=>side>0?indices.push(a,b,c):indices.push(a,c,b);
 for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){
  const a=j*(nx+1)+i,b=a+1,c=a+nx+1,d=c+1;
  tri(a,b,d);tri(a,d,c);tri(a+n,d+n,b+n);tri(a+n,c+n,d+n);
 }
 const edge=[];
 for(let i=0;i<=nx;i++)edge.push(i);
 for(let j=1;j<=ny;j++)edge.push(j*(nx+1)+nx);
 for(let i=nx-1;i>=0;i--)edge.push(ny*(nx+1)+i);
 for(let j=ny-1;j>0;j--)edge.push(j*(nx+1));
 for(let i=0;i<edge.length;i++){const a=edge[i],b=edge[(i+1)%edge.length];tri(a,a+n,b);tri(b,a+n,b+n)}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();
 const mesh=new T.Mesh(g,mat);mesh.castShadow=!mat.transparent;mesh.receiveShadow=false;parent.add(mesh);return mesh;
}

export function addMaterialSculpture(root,id){
 const matte=(color)=>new T.MeshPhysicalMaterial({color,metalness:0,roughness:.62,clearcoat:.12,side:T.DoubleSide});
 const glass=(color,opacity=.64)=>new T.MeshPhysicalMaterial({color,metalness:.12,roughness:.13,clearcoat:1,clearcoatRoughness:.06,transparent:true,opacity,depthWrite:false,side:T.DoubleSide,envMapIntensity:1.3});
 const metal=new T.MeshPhysicalMaterial({color:'#d7e1e8',metalness:.86,roughness:.23,clearcoat:.6});
 const white=matte('#fff7e7');
 const group=new T.Group();root.add(group);
 const motion=[];

 if(id==='textbook'||id==='aidt'){
  const digital=id==='aidt';group.rotation.set(.23,-.24,-.09);
  const cover=digital?glass('#488eae',.60):matte('#268b89');
  const colors=['#65b6d7','#8fd3eb','#bce8f5'];
  for(const side of [-1,1]){
   leaf(1.68,2.65,side,.10,.085,cover,group).position.z=-.18;
   for(let i=0;i<4;i++){
    const hinge=new T.Group();group.add(hinge);hinge.position.z=-.08+i*.085;
    const angle=[.04,.20,.41,.69][i];
    hinge.rotation.y=-side*angle;
    const m=digital?glass(colors[Math.min(i,2)],.20+i*.04):matte(i===3?'#fffaf0':'#e8dfcd');
    leaf(1.57,2.51,side,digital?.22:.17,digital?.045:.025,m,hinge);
    motion.push({object:hinge,angle:hinge.rotation.y,side,amount:digital?.055:.035});
   }
  }
  const spine=new T.Mesh(new T.CylinderGeometry(.065,.065,2.65,32),digital?metal:matte('#1e6669'));spine.position.z=-.15;group.add(spine);
  if(!digital){
   // A cloth bookmark gives the paper edition a physical, recognisable detail.
   const ribbon=new T.Mesh(new T.BoxGeometry(.12,.75,.024),matte('#e8b251'));ribbon.position.set(.10,-1.02,.25);ribbon.rotation.z=-.09;group.add(ribbon);
  }
 }else if(id==='contents'){
  group.rotation.set(.13,-.32,-.11);
  const colors=['#4967d7','#a5cee4','#dce5e1','#fff9e9'];
  for(let i=0;i<4;i++){
   const hinge=new T.Group();group.add(hinge);
   hinge.position.set(-.65,-1.25,i*.62);
   hinge.rotation.z=-.48+i*.32;hinge.rotation.y=0;
   const sheet=leaf(2.2,3.05,1,.40,.035,i===1?glass(colors[i],.78):matte(colors[i]),hinge);sheet.position.y=1.45;
   motion.push({object:hinge,angle:hinge.rotation.y,side:1,amount:.025});
  }
 }else if(id==='camp'){
  // A tactile navigation instrument for the camp's exploration metaphor.
  group.rotation.set(.30,-.24,-.21);
  const casing=new T.Mesh(new T.CylinderGeometry(1.40,1.40,.22,96),metal);casing.rotation.x=Math.PI/2;group.add(casing);
  const dial=new T.Mesh(new T.CircleGeometry(1.32,96),white);dial.position.z=.118;group.add(dial);
  const rim=new T.Mesh(new T.TorusGeometry(1.39,.075,20,96),metal);rim.position.z=.12;group.add(rim);
  const ticks=new T.MeshPhysicalMaterial({color:'#798b9a',metalness:.3,roughness:.5});
  for(let i=0;i<24;i++){
   const a=i*Math.PI/12,length=i%6===0?.21:.07;
   const tick=new T.Mesh(new T.BoxGeometry(.018,length,.012),ticks);tick.position.set(Math.sin(a)*(1.16-length/2),Math.cos(a)*(1.16-length/2),.13);tick.rotation.z=-a;group.add(tick);
  }
  const needle=new T.Group();group.add(needle);needle.position.z=.21;needle.rotation.z=-.48;
  for(const [side,color] of [[1,'#315eec'],[-1,'#ed9a7d']]){
   const shape=new T.Shape();shape.moveTo(-.21,0);shape.lineTo(0,side*.98);shape.lineTo(.21,0);shape.closePath();
   const half=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:.035,bevelEnabled:true,bevelSegments:4,bevelSize:.025,bevelThickness:.018}),new T.MeshPhysicalMaterial({color,metalness:.15,roughness:.23,clearcoat:1}));needle.add(half);
  }
  const pin=new T.Mesh(new T.SphereGeometry(.10,24,16),metal);pin.position.z=.28;pin.scale.z=.55;group.add(pin);
  const lens=new T.Mesh(new T.SphereGeometry(1.30,64,24,0,Math.PI*2,0,Math.PI/2),glass('#c6e5ed',.18));lens.rotation.x=Math.PI/2;lens.scale.y=.12;lens.position.z=.19;group.add(lens);
  const loop=new T.Mesh(new T.TorusGeometry(.22,.046,16,40),metal);loop.position.set(0,1.62,0);group.add(loop);
  motion.push({object:needle,needle:true,angle:-.48});
 }
 return {render(time,still){for(const m of motion){if(m.needle)m.object.rotation.z=m.angle+(still?0:Math.sin(time*.7)*.08);else m.object.rotation.y=m.angle+(still?0:Math.sin(time*.6)*m.amount*m.side)}}};
}

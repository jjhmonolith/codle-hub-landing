import * as THREE from 'three';

// The same official tool marks and rounded solids as the platform scene.
export async function createPortalTools(mount){
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.toneMapping=THREE.NeutralToneMapping;
  mount.append(renderer.domElement);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(33,1,.1,40);
  camera.position.z=8;
  scene.add(new THREE.HemisphereLight('#ffffff','#223653',2.2));
  for(const [x,y,z,p] of [[-3,5,5,4],[5,1,3,2],[0,3,-4,3]]){
    const light=new THREE.DirectionalLight('#ffffff',p);light.position.set(x,y,z);scene.add(light);
  }
  const artwork=await new THREE.TextureLoader().loadAsync('assets/worlds/codle-tools-ui.png');
  const marks=[[68,68,'#1686ff'],[700,68,'#00ce82'],[980,352,'#ff414a'],[349,352,'#ffb300'],[700,635,'#ff7caf']];
  const shape=new THREE.Shape(),r=.19,s=.48;
  shape.moveTo(-s+r,-s);shape.lineTo(s-r,-s);shape.quadraticCurveTo(s,-s,s,-s+r);
  shape.lineTo(s,s-r);shape.quadraticCurveTo(s,s,s-r,s);shape.lineTo(-s+r,s);
  shape.quadraticCurveTo(-s,s,-s,s-r);shape.lineTo(-s,-s+r);shape.quadraticCurveTo(-s,-s,-s+r,-s);
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:.18,bevelEnabled:true,bevelThickness:.045,bevelSize:.035,bevelSegments:4,curveSegments:12});
  geometry.translate(0,0,-.09);
  const actors=marks.map(([x,y,color],i)=>{
    const group=new THREE.Group(),material=new THREE.MeshPhysicalMaterial({color,roughness:.23,metalness:.17,clearcoat:1});
    group.add(new THREE.Mesh(geometry,material));
    const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
    const c=canvas.getContext('2d'),ratio=artwork.image.width/2048;
    c.drawImage(artwork.image,x*ratio,y*ratio,166*ratio,166*ratio,0,0,256,256);
    const data=c.getImageData(0,0,256,256);
    for(let p=0;p<data.data.length;p+=4){data.data[p+3]*=Math.max(0,Math.min(1,(Math.min(data.data[p],data.data[p+1],data.data[p+2])-220)/35));data.data[p]=data.data[p+1]=data.data[p+2]=255}
    c.putImageData(data,0,0);const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;
    const decal=new THREE.Mesh(new THREE.PlaneGeometry(.90,.90),new THREE.MeshBasicMaterial({map,transparent:true,depthWrite:false}));decal.position.z=.139;group.add(decal);
    scene.add(group);return group;
  });
  const anchors=[[-1.15,.56,.15],[.14,.76,-.2],[1.26,.07,.2],[-.68,-.67,.4],[.66,-.82,-.1]];
  function resize(){const w=mount.clientWidth,h=mount.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix()}
  function render(time,progress){actors.forEach((g,i)=>{const a=anchors[i];g.position.set(...a);g.rotation.set(.12*Math.sin(time*.23+i),-.25+Math.sin(time*.21+i)*.30,(i-2)*.13+progress*.25)});renderer.render(scene,camera)}
  resize();render(0,0);return {resize,render};
}

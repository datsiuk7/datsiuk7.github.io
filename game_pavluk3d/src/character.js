import * as THREE from 'three';

const mat=(color,roughness=.88)=>new THREE.MeshStandardMaterial({color,roughness});
const skin=mat(0xc69077),hair=mat(0x302a25),jacket=mat(0x414639),seam=mat(0x2f332b),shirt=mat(0x292a28),jeans=mat(0x343c43),boot=mat(0x302c28),metal=mat(0x9a8b6e,.42);
const sphere=new THREE.SphereGeometry(1,24,16);
function ellipsoid(parent,material,x,y,z,sx,sy,sz){const m=new THREE.Mesh(sphere,material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function block(parent,material,x,y,z,sx,sy,sz){const m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}

function makeFaceTexture(url,onReady){
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=640;
  const ctx=canvas.getContext('2d'),texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const image=new Image();image.onload=()=>{
    // Crop the AI-assisted portrait to its face and fade the perimeter into the modelled skin.
    ctx.clearRect(0,0,512,640);ctx.drawImage(image,145,50,735,1100,0,0,512,640);
    ctx.globalCompositeOperation='destination-in';
    const oval=ctx.createRadialGradient(256,312,170,256,312,325);
    oval.addColorStop(0,'#fff');oval.addColorStop(.67,'#fff');oval.addColorStop(.94,'#0000');
    ctx.fillStyle=oval;ctx.fillRect(0,0,512,640);ctx.globalCompositeOperation='source-over';
    texture.needsUpdate=true;onReady();
  };image.src=url;return texture;
}

export function createCharacter(portraitUrl){
  const group=new THREE.Group(),rig=new THREE.Group();group.add(rig);
  // Human proportions, fabric layers and a neutral field outfit.
  ellipsoid(rig,jacket,0,1.58,0,.43,.60,.29);
  ellipsoid(rig,shirt,0,1.71,.275,.25,.35,.035);
  ellipsoid(rig,jacket,0,1.04,0,.38,.24,.28);
  block(rig,seam,0,1.63,.31,.035,.85,.025);
  for(const side of [-1,1]){
    block(rig,seam,side*.23,1.40,.29,.18,.045,.035);
    ellipsoid(rig,metal,side*.29,1.38,.315,.027,.027,.018);
  }
  const arms=[];
  for(const side of [-1,1]){
    const arm=new THREE.Group();arm.position.set(side*.47,1.96,0);rig.add(arm);
    ellipsoid(arm,jacket,side*.06,-.32,0,.18,.37,.19);
    ellipsoid(arm,seam,side*.08,-.65,0,.15,.09,.16);
    ellipsoid(arm,skin,side*.08,-.79,.01,.12,.16,.12);
    arms.push(arm);
  }
  const legs=[];
  for(const side of [-1,1]){
    const leg=new THREE.Group();leg.position.set(side*.21,1.01,0);rig.add(leg);
    ellipsoid(leg,jeans,0,-.38,0,.19,.45,.20);
    ellipsoid(leg,boot,0,-.77,.10,.21,.17,.32);
    block(leg,seam,0,-.86,.13,.43,.07,.62);
    legs.push(leg);
  }
  ellipsoid(rig,skin,0,2.28,.04,.49,.56,.42);
  // Receding short dark hair and ears remain visible when the camera orbits.
  ellipsoid(rig,hair,0,2.55,-.20,.46,.30,.25);
  ellipsoid(rig,hair,-.39,2.43,-.03,.085,.23,.25);
  ellipsoid(rig,hair,.39,2.43,-.03,.085,.23,.25);
  for(const side of [-1,1])ellipsoid(rig,skin,side*.49,2.24,.04,.085,.17,.09);
  const fallback=new THREE.Group();rig.add(fallback);
  for(const side of [-1,1]){
    ellipsoid(fallback,hair,side*.18,2.38,.423,.105,.035,.022);
    ellipsoid(fallback,mat(0x392f2b),side*.18,2.26,.43,.045,.05,.02);
  }
  ellipsoid(fallback,skin,0,2.14,.46,.095,.15,.08);
  const faceGeo=new THREE.PlaneGeometry(.87,1.12,22,22),p=faceGeo.attributes.position;
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i),u=x/.49,v=y/.56;
    p.setZ(i,.04+.42*Math.sqrt(Math.max(.012,1-u*u-v*v))+.012);
  }
  faceGeo.computeVertexNormals();
  const face=new THREE.Mesh(faceGeo,new THREE.MeshBasicMaterial({map:null,transparent:true,side:THREE.DoubleSide,depthWrite:false,alphaTest:.025}));
  face.position.set(0,2.28,0);face.visible=false;face.renderOrder=2;rig.add(face);
  face.material.map=makeFaceTexture(portraitUrl,()=>{face.visible=true;fallback.visible=false});
  ellipsoid(rig,seam,0,1.50,-.31,.29,.35,.11); // small backpack
  return {group,rig,arms,legs,face};
}
export function animateCharacter(character,time,moveAmount,grounded,vy,invulnerable){
  const cadence=time*(moveAmount>.15?10.5:2.4),swing=Math.sin(cadence)*Math.min(1,moveAmount);
  character.legs[0].rotation.x=swing*.68;character.legs[1].rotation.x=-swing*.68;
  character.arms[0].rotation.x=-swing*.48-.08;character.arms[1].rotation.x=swing*.48-.08;
  character.rig.position.y=grounded?Math.abs(Math.sin(cadence))*.038*moveAmount:0;
  character.rig.rotation.x=grounded?0:Math.max(-.18,Math.min(.18,-vy*.018));
  character.group.visible=!(invulnerable>0&&Math.floor(time*12)%2===0);
}

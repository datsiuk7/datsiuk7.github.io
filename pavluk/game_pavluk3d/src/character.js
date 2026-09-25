import * as THREE from 'three';

const sphere=new THREE.SphereGeometry(1,20,14);
const smallSphere=new THREE.SphereGeometry(1,12,9);
const mat=(color,roughness=.8)=>new THREE.MeshStandardMaterial({color,roughness});
const green=mat(0x55c784),hoodGreen=mat(0x65d395),darkGreen=mat(0x299663);
const cream=mat(0xffeed2),skin=mat(0xe9b49a),hair=mat(0x463329);
const gold=mat(0xffcf5c,.35),eyeWhite=mat(0xfffcf0),black=mat(0x242d30,.42);

function ball(parent,material,x,y,z,sx,sy,sz,small=false){
  const m=new THREE.Mesh(small?smallSphere:sphere,material);
  m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
}
function cylinder(parent,material,x,y,z,rt,rb,h,segments=10){
  const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,segments),material);
  m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m;
}
function faceTextureFromPortrait(url,onReady){
  const cvs=document.createElement('canvas');cvs.width=512;cvs.height=640;
  const ctx=cvs.getContext('2d');
  const tex=new THREE.CanvasTexture(cvs);tex.colorSpace=THREE.SRGBColorSpace;
  const img=new Image();
  img.onload=()=>{
    // The source is the already-created Pavlyk frog portrait. Only the face is
    // projected onto the curved front of the actual 3D head.
    ctx.clearRect(0,0,512,640);
    ctx.drawImage(img,295,150,430,515,0,0,512,640);
    ctx.globalCompositeOperation='destination-in';
    ctx.save();ctx.translate(256,320);ctx.scale(1,1.23);
    const fade=ctx.createRadialGradient(0,0,160,0,0,258);
    fade.addColorStop(0,'rgba(255,255,255,1)');
    fade.addColorStop(.77,'rgba(255,255,255,1)');
    fade.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle=fade;ctx.fillRect(-256,-270,512,540);
    ctx.restore();ctx.globalCompositeOperation='source-over';
    tex.needsUpdate=true;onReady();
  };
  img.src=url;
  return tex;
}

export function createCharacter(portraitUrl){
  const group=new THREE.Group();
  const rig=new THREE.Group();group.add(rig);
  // Hoodie and short overalls are volumetric meshes from every angle.
  ball(rig,green,0,1.47,0,.58,.70,.40);
  ball(rig,cream,0,1.42,.365,.42,.52,.10);
  ball(rig,darkGreen,0,.96,.20,.52,.36,.33);
  ball(rig,darkGreen,0,1.18,.465,.35,.25,.07);
  for(const side of [-1,1]){
    const strap=cylinder(rig,darkGreen,side*.36,1.49,.395,.065,.068,.57,8);
    strap.rotation.z=side*.27;
    ball(rig,gold,side*.34,1.20,.48,.08,.08,.045,true);
  }
  ball(rig,darkGreen,0,.99,.54,.20,.13,.035,true);

  const arms=[];
  for(const side of [-1,1]){
    const arm=new THREE.Group();arm.position.set(side*.53,1.89,0);rig.add(arm);
    ball(arm,green,side*.15,-.22,0,.25,.36,.25);
    ball(arm,hoodGreen,side*.19,-.49,.01,.21,.16,.21,true);
    ball(arm,skin,side*.20,-.65,.015,.16,.19,.15,true);
    arms.push(arm);
  }
  const legs=[];
  for(const side of [-1,1]){
    const leg=new THREE.Group();leg.position.set(side*.29,.92,0);rig.add(leg);
    ball(leg,darkGreen,0,-.18,0,.25,.30,.29);
    ball(leg,skin,0,-.49,.01,.17,.22,.18,true);
    ball(leg,darkGreen,0,-.68,.08,.23,.18,.27,true);
    ball(leg,hoodGreen,0,-.77,.16,.28,.18,.39);
    ball(leg,green,0,-.63,.13,.28,.10,.31,true);
    ball(leg,gold,0,-.62,.39,.055,.055,.025,true);
    legs.push(leg);
  }

  // Hood, ears, face and frog eyes form a real rounded head.
  ball(rig,hoodGreen,0,2.43,0,.70,.77,.62);
  ball(rig,hair,0,2.60,.29,.51,.49,.37);
  ball(rig,skin,0,2.38,.28,.53,.62,.39);
  ball(rig,skin,-.53,2.36,.22,.13,.21,.11,true);
  ball(rig,skin,.53,2.36,.22,.13,.21,.11,true);
  const hoodRim=new THREE.Mesh(new THREE.TorusGeometry(.59,.105,12,48),green);
  hoodRim.scale.y=1.09;hoodRim.position.set(0,2.42,.57);hoodRim.castShadow=true;rig.add(hoodRim);
  for(const side of [-1,1]){
    ball(rig,green,side*.44,3.05,.22,.30,.32,.25);
    ball(rig,eyeWhite,side*.44,3.07,.423,.205,.22,.085,true);
    ball(rig,black,side*.44,3.07,.504,.103,.12,.045,true);
    ball(rig,eyeWhite,side*.47,3.13,.545,.032,.04,.015,true);
  }

  // Geometric expression remains if the portrait texture cannot load.
  const fallback=new THREE.Group();rig.add(fallback);
  for(const side of [-1,1]){
    ball(fallback,black,side*.22,2.48,.64,.064,.074,.027,true);
    const brow=cylinder(fallback,hair,side*.22,2.63,.64,.025,.025,.22,6);brow.rotation.z=side*.88;
  }
  ball(fallback,skin,0,2.30,.68,.11,.16,.09,true);
  const smileCurve=new THREE.CatmullRomCurve3([
    new THREE.Vector3(-.27,2.15,.64),new THREE.Vector3(0,2.07,.69),new THREE.Vector3(.27,2.15,.64)
  ]);
  fallback.add(new THREE.Mesh(new THREE.TubeGeometry(smileCurve,16,.025,6,false),hair));

  const faceGeo=new THREE.PlaneGeometry(1.04,1.26,16,16);
  const pos=faceGeo.attributes.position;
  for(let i=0;i<pos.count;i++){
    const x=pos.getX(i),y=pos.getY(i);
    pos.setZ(i,.055-.15*(x/.52)**2-.055*(y/.63)**2);
  }
  faceGeo.computeVertexNormals();
  const texture=faceTextureFromPortrait(portraitUrl,()=>{face.visible=true;fallback.visible=false});
  const face=new THREE.Mesh(faceGeo,new THREE.MeshBasicMaterial({map:texture,transparent:true,side:THREE.DoubleSide,depthWrite:false,alphaTest:.012}));
  face.position.set(0,2.39,.667);face.visible=false;face.renderOrder=2;rig.add(face);

  // A tiny backpack and frog-hood seam make the back view readable too.
  ball(rig,darkGreen,0,1.52,-.42,.36,.42,.17);
  ball(rig,hoodGreen,0,1.53,-.56,.23,.27,.07,true);

  return {group,rig,arms,legs,face};
}

export function animateCharacter(character,time,moveAmount,grounded,vy,invulnerable){
  const pace=time*(moveAmount>.1?12:2.4);
  const swing=Math.sin(pace)*Math.min(1,moveAmount);
  character.legs[0].rotation.x=swing*.58;
  character.legs[1].rotation.x=-swing*.58;
  character.arms[0].rotation.x=-swing*.48-.09;
  character.arms[1].rotation.x=swing*.48-.09;
  character.rig.position.y=grounded?Math.abs(Math.sin(pace))*.045*moveAmount:0;
  character.rig.rotation.x=grounded?0:Math.max(-.20,Math.min(.20,-vy*.024));
  character.rig.rotation.z=grounded?Math.sin(pace)*.025*moveAmount:0;
  character.group.visible=!(invulnerable>0&&Math.floor(time*12)%2===0);
}

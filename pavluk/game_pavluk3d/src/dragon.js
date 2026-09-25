import * as THREE from 'three';

const sphere=new THREE.SphereGeometry(1,18,12);
const small=new THREE.SphereGeometry(1,11,8);
const plum=new THREE.MeshStandardMaterial({color:0x9c86ca,roughness:.7});
const lavender=new THREE.MeshStandardMaterial({color:0xc8b8e9,roughness:.77});
const pink=new THREE.MeshStandardMaterial({color:0xf6a8be,roughness:.72});
const cream=new THREE.MeshStandardMaterial({color:0xffedda,roughness:.78});
const dark=new THREE.MeshStandardMaterial({color:0x5d506f,roughness:.7});
const wingMat=new THREE.MeshStandardMaterial({color:0xb395df,side:THREE.DoubleSide,roughness:.68});

function ball(parent,material,x,y,z,sx,sy,sz,tiny=false){
  const m=new THREE.Mesh(tiny?small:sphere,material);
  m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
}
function line(parent,points,r=.022){
  const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
  const m=new THREE.Mesh(new THREE.TubeGeometry(curve,14,r,6,false),dark);
  parent.add(m);
}
function makeWing(side){
  const g=new THREE.Group();g.position.set(side*.58,1.40,-.32);
  const s=new THREE.Shape();
  s.moveTo(0,0);s.bezierCurveTo(.35,.70,1.07,1.25,1.37,1.23);
  s.bezierCurveTo(1.64,1.13,1.25,.57,1.08,.42);
  s.bezierCurveTo(.93,.59,.82,.11,.64,.26);
  s.bezierCurveTo(.45,-.02,.25,-.03,0,0);
  const m=new THREE.Mesh(new THREE.ShapeGeometry(s,12),wingMat);
  m.scale.x=side;m.castShadow=true;g.add(m);
  return g;
}
function sleepSprite(){
  const cvs=document.createElement('canvas');cvs.width=256;cvs.height=110;
  const ctx=cvs.getContext('2d');
  ctx.fillStyle='#715d9c';ctx.font='900 75px Nunito, sans-serif';ctx.fillText('z z Z',12,80);
  const texture=new THREE.CanvasTexture(cvs);texture.colorSpace=THREE.SRGBColorSpace;
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthWrite:false}));
  sprite.scale.set(1.65,.75,1);sprite.position.set(.70,2.87,.25);
  return sprite;
}

export function createDragon(){
  const group=new THREE.Group();
  const rig=new THREE.Group();group.add(rig);
  ball(rig,plum,0,.99,0,.93,.73,.96);
  ball(rig,cream,0,.82,.78,.57,.51,.23);
  ball(rig,plum,0,1.72,.52,.66,.60,.65);
  ball(rig,lavender,0,1.49,1.02,.51,.31,.52);
  ball(rig,pink,-.24,1.53,1.47,.085,.065,.07,true);
  ball(rig,pink,.24,1.53,1.47,.085,.065,.07,true);
  for(const side of [-1,1]){
    ball(rig,lavender,side*.64,.26,.43,.29,.20,.36);
    ball(rig,lavender,side*.72,.64,-.37,.25,.24,.27,true);
    const horn=new THREE.Mesh(new THREE.ConeGeometry(.16,.46,8),cream);
    horn.position.set(side*.40,2.28,.25);horn.rotation.z=side*.21;horn.castShadow=true;rig.add(horn);
    // The eyes are closed: the dragon is chasing while half asleep.
    line(rig,[[side*.20,1.84,1.03],[side*.32,1.77,1.05],[side*.44,1.84,.99]],.025);
  }
  line(rig,[[-.24,1.36,1.39],[0,1.29,1.49],[.24,1.36,1.39]],.018);
  const tail=ball(rig,plum,0,.81,-1.06,.33,.31,.91);
  tail.rotation.x=-.19;
  ball(rig,pink,0,.76,-1.78,.21,.21,.27,true);
  const wings=[makeWing(-1),makeWing(1)];wings.forEach(w=>rig.add(w));
  for(let i=0;i<3;i++){
    const spike=new THREE.Mesh(new THREE.ConeGeometry(.13,.35,7),lavender);
    spike.position.set(0,1.65-i*.18,-.33-i*.46);spike.rotation.x=-.45;rig.add(spike);
  }
  const zzz=sleepSprite();rig.add(zzz);
  return {group,rig,wings,zzz};
}

export function animateDragon(dragon,time,velocity){
  dragon.rig.position.y=Math.sin(time*3.2)*.10;
  dragon.rig.rotation.z=Math.sin(time*1.9)*.035;
  dragon.wings[0].rotation.z=Math.sin(time*5.5)*.20;
  dragon.wings[1].rotation.z=-Math.sin(time*5.5)*.20;
  dragon.zzz.material.opacity=.58+Math.sin(time*2.5)*.25;
  dragon.zzz.position.y=2.87+Math.sin(time*1.9)*.13;
}

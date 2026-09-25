import * as THREE from 'three';

const sphere = new THREE.SphereGeometry(1, 16, 12);
const littleSphere = new THREE.SphereGeometry(1, 9, 7);
const cylinder = new THREE.CylinderGeometry(1, 1, 1, 32);

function mesh(parent, geometry, material, x=0,y=0,z=0) {
  const obj = new THREE.Mesh(geometry, material);
  obj.position.set(x,y,z);
  obj.castShadow = true;
  obj.receiveShadow = true;
  parent.add(obj);
  return obj;
}
function ball(parent, mat, x,y,z, sx,sy,sz, small=false) {
  const obj=mesh(parent,small?littleSphere:sphere,mat,x,y,z);
  obj.scale.set(sx,sy,sz);
  return obj;
}
function material(color, roughness=.85, emissive=0x000000, intensity=0) {
  return new THREE.MeshStandardMaterial({color,roughness,emissive,emissiveIntensity:intensity});
}
function random(seed) {
  let state=seed>>>0;
  return ()=>{state=(1664525*state+1013904223)>>>0;return state/4294967296};
}

function makeSky(level) {
  const top=new THREE.Color(level.skyTop),bottom=new THREE.Color(level.skyBottom);
  const sky=new THREE.Mesh(new THREE.SphereGeometry(190,32,16),new THREE.ShaderMaterial({
    uniforms:{topColor:{value:top},bottomColor:{value:bottom}},
    vertexShader:'varying vec3 vWorld; void main(){vWorld=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:'uniform vec3 topColor;uniform vec3 bottomColor;varying vec3 vWorld;void main(){float h=normalize(vWorld).y;float f=smoothstep(-0.35,0.9,h);gl_FragColor=vec4(mix(bottomColor,topColor,f),1.0);}',
    side:THREE.BackSide,depthWrite:false,
  }));
  sky.renderOrder=-100;
  return sky;
}

function makeStarGeometry() {
  const s=new THREE.Shape();
  for(let i=0;i<10;i++){
    const angle=Math.PI/2+i*Math.PI/5;
    const r=i%2?.28:.58;
    const x=Math.cos(angle)*r,y=Math.sin(angle)*r;
    if(i===0)s.moveTo(x,y);else s.lineTo(x,y);
  }
  s.closePath();
  return new THREE.ExtrudeGeometry(s,{depth:.18,steps:1,bevelEnabled:true,bevelSegments:2,bevelThickness:.06,bevelSize:.055});
}
const starGeometry=makeStarGeometry();

function makeTree(parent,x,z,y,colors,size=1) {
  const g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(size);parent.add(g);
  mesh(g,new THREE.CylinderGeometry(.14,.20,1.24,7),colors.trunk,0,.62,0);
  ball(g,colors.leaves,0,1.42,0,.78,.8,.7);
  ball(g,colors.leaves,-.39,1.21,.15,.52,.49,.5);
  ball(g,colors.leaves,.40,1.25,-.12,.48,.48,.49);
  ball(g,colors.leavesLight,-.2,1.66,.35,.39,.35,.31,true);
  return g;
}
function makeFlower(parent,x,z,y,colors,rand) {
  const g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(.65+rand()*.5);parent.add(g);
  mesh(g,new THREE.CylinderGeometry(.025,.03,.38,5),colors.stem,0,.19,0);
  for(let i=0;i<5;i++){
    const a=i*Math.PI*2/5;
    ball(g,colors.petal,Math.cos(a)*.12,.41,Math.sin(a)*.12,.095,.055,.095,true);
  }
  ball(g,colors.gold,0,.43,0,.09,.065,.09,true);
}

function makeIsland(parent,data,level,colors,index) {
  const g=new THREE.Group();g.position.set(data.x,data.y,data.z);parent.add(g);
  if(data.kind==='cloud'){
    ball(g,colors.cloud,0,-.23,0,data.r,.35,data.r*.92);
    const offsets=[[-.65,-.35,.48],[.61,-.14,.32],[-.12,.47,.45],[.22,-.62,.35]];
    for(const [ox,oz,scale] of offsets){ball(g,colors.cloudLight,ox*data.r,-.13,oz*data.r,data.r*scale,.34,data.r*scale)}
    ball(g,colors.cloudShade,0,-.42,0,data.r*.79,.18,data.r*.76);
  }else{
    const side=mesh(g,new THREE.CylinderGeometry(data.r,data.r*.87,.84,40),[colors.earth,colors.grass,colors.earth],0,-.42,0);
    side.receiveShadow=true;
    const underside=mesh(g,new THREE.ConeGeometry(data.r*.86,2.25,36),colors.rock,0,-1.93,0);
    underside.rotation.z=Math.PI;
    for(let i=0;i<7;i++){
      const a=i*Math.PI*2/7;
      ball(g,colors.rock,Math.cos(a)*data.r*.58,-1.1,Math.sin(a)*data.r*.58,.5,.5,.55,true);
    }
    const rim=mesh(g,new THREE.TorusGeometry(data.r-.15,.11,8,48),colors.grassLight,0,.016,0);
    rim.rotation.x=Math.PI/2;
    if(data.kind==='portal'){
      const ring=mesh(g,new THREE.TorusGeometry(data.r-.48,.055,7,42),colors.petal,0,.025,0);
      ring.rotation.x=Math.PI/2;
    }
  }
  return {x:data.x,z:data.z,r:data.r,top:data.y,kind:data.kind,group:g,index};
}

function makePortal(parent,position,level) {
  const group=new THREE.Group();
  group.position.set(position.x,level.islands[position.island].y,position.z);
  parent.add(group);
  const mat=new THREE.MeshStandardMaterial({color:0x9ba7a6,metalness:.12,roughness:.29,emissive:0x6e9791,emissiveIntensity:.2});
  const ring=mesh(group,new THREE.TorusGeometry(1.15,.19,16,48),mat,0,1.43,0);
  const inner=mesh(group,new THREE.CircleGeometry(.99,40),new THREE.MeshBasicMaterial({color:level.accent,transparent:true,opacity:.1,side:THREE.DoubleSide,depthWrite:false}),0,1.43,-.07);
  const base=mesh(group,new THREE.CylinderGeometry(.76,.94,.26,24),material(level.accent,.5),0,.13,0);
  const orbit=[];
  for(let i=0;i<7;i++){
    const o=mesh(group,new THREE.OctahedronGeometry(.065+i%2*.025),material(0xffd785,.3,0xffac20,.35));
    orbit.push(o);
  }
  const dx=position.x, dz=position.z;
  group.rotation.y=Math.atan2(-dx,-dz);
  return {group,ring,inner,mat,orbit,base,unlocked:false};
}

export function createLevel(level,index) {
  const group=new THREE.Group();
  const sky=makeSky(level);group.add(sky);
  const colors={
    grass:material(level.grass),grassLight:material(level.grassLight),earth:material(level.earth),rock:material(level.rock),
    cloud:material(0xf9ffff),cloudLight:material(0xffffff),cloudShade:material(0xd8eff1),
    trunk:material(0x8c7569),leaves:material(level.grassLight),leavesLight:material(level.flower),
    stem:material(0x57ae78),petal:material(level.flower),gold:material(0xffc559,.32,0xffa522,.2),
  };
  const platforms=level.islands.map((p,i)=>makeIsland(group,p,level,colors,i));
  const rand=random(2314+index*853);
  // The foliage is kept away from the spawn, stars, and portal.
  for(let i=0;i<25;i++){
    const a=rand()*Math.PI*2,r=3.8+rand()*3.6,x=Math.cos(a)*r,z=Math.sin(a)*r;
    const clear=level.stars.every(s=>Math.hypot(x-s.x,z-s.z)>1.9)&&Math.hypot(x-level.spawn.x,z-level.spawn.z)>2.0;
    if(!clear)continue;
    if(i%3===0)makeTree(group,x,z,0,colors,.72+rand()*.38);
    else makeFlower(group,x,z,0,colors,rand);
  }
  for(let island=1;island<platforms.length;island++){
    const p=platforms[island];
    for(let j=0;j<5;j++){
      const a=rand()*Math.PI*2,r=1.55+rand()*.72;
      if(p.kind==='cloud'){
        const sparkle=mesh(group,new THREE.OctahedronGeometry(.045),colors.gold,p.x+Math.cos(a)*r,p.top+.08,p.z+Math.sin(a)*r);
        sparkle.castShadow=false;
      }else makeFlower(group,p.x+Math.cos(a)*r,p.z+Math.sin(a)*r,p.top,colors,rand);
    }
  }
  const stars=level.stars.map((data,i)=>{
    const g=new THREE.Group();
    const y=level.islands[data.island].y+1.25;
    g.position.set(data.x,y,data.z);
    const star=mesh(g,starGeometry,colors.gold);
    star.position.z=-.09;
    const halo=mesh(g,new THREE.SphereGeometry(.68,12,8),new THREE.MeshBasicMaterial({color:0xffdc7b,transparent:true,opacity:.13,depthWrite:false}));
    halo.scale.set(1,1,.18);halo.castShadow=false;
    group.add(g);
    return {group:g,x:data.x,z:data.z,y,baseY:y,collected:false,index:i};
  });
  const portal=makePortal(group,level.portal,level);
  // Distant cloud banks make the islands feel suspended in a larger sky.
  for(let i=0;i<20;i++){
    const a=i*2.399+index,r=27+rand()*43;
    const cloud=new THREE.Group();
    cloud.position.set(Math.cos(a)*r,-5+rand()*10,Math.sin(a)*r);
    ball(cloud,colors.cloud,0,0,0,3+rand()*2,.65,1.8+rand());
    ball(cloud,colors.cloudLight,-1,.13,.2,1.7,.62,1.3);
    ball(cloud,colors.cloudLight,1.2,.04,0,1.5,.53,1.2);
    cloud.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false}});
    group.add(cloud);
  }
  const sun=mesh(group,new THREE.SphereGeometry(6,24,16),new THREE.MeshBasicMaterial({color:index===2?0xffe1db:0xfff0ad,transparent:true,opacity:.75,depthWrite:false}),-36,31,-60);
  sun.castShadow=false;
  return {group,platforms,stars,portal,level};
}

export function groundAt(platforms,x,z) {
  let result=null;
  for(const p of platforms){
    if(Math.hypot(x-p.x,z-p.z)<p.r-.18 && (result===null||p.top>result))result=p.top;
  }
  return result;
}

export function animateWorld(world,time,dt) {
  for(const s of world.stars){
    if(!s.collected){s.group.position.y=s.baseY+Math.sin(time*2.7+s.index)*.18;s.group.rotation.y+=dt*1.5;s.group.rotation.z=Math.sin(time*2+s.index)*.08}
  }
  const p=world.portal;
  p.ring.rotation.z=Math.sin(time*1.6)*.07;
  p.inner.material.opacity=p.unlocked?.30+Math.sin(time*3)*.06:.06;
  p.mat.emissiveIntensity=p.unlocked?.7+Math.sin(time*3)*.15:.17;
  p.orbit.forEach((o,i)=>{
    const a=time*.8+i*Math.PI*2/p.orbit.length;
    o.position.set(Math.cos(a)*1.43,1.43+Math.sin(a)*1.43,.15);
    o.visible=p.unlocked;
  });
}

export function unlockPortal(portal,accent) {
  portal.unlocked=true;
  portal.mat.color.setHex(accent);
  portal.mat.emissive.setHex(accent);
}

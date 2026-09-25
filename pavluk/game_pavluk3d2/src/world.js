import * as THREE from 'three';

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const hash=(x,z)=>{const n=Math.sin(x*127.1+z*311.7)*43758.5453;return n-Math.floor(n)};
function rng(seed){let s=seed>>>0;return()=>((s=(1664525*s+1013904223)>>>0)/4294967296)}
const mat=(color,roughness=1,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
function mesh(parent,geo,material,x=0,y=0,z=0){const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function box(parent,material,x,y,z,w,h,d){return mesh(parent,new THREE.BoxGeometry(w,h,d),material,x,y,z)}

export function terrainHeight(level,x,z){
  const broad=Math.sin(x*.115)*Math.cos(z*.105)*.54;
  const ripples=Math.sin(x*.41+z*.16)*Math.cos(z*.32-x*.12)*.16;
  const hill=level.biome==='alpine'?.88:level.biome==='canyon'?.42:.32;
  const edge=Math.max(0,(Math.hypot(x,z)-20)/20);
  const coastDrop=level.biome==='coast'?clamp((x-26)/8,0,1)*2.2:0;
  return broad*hill+ripples*(.5+hill*.4)+edge*edge*(level.biome==='alpine'?2.4:1.15)-coastDrop;
}
export function groundAt(world,x,z){return Math.max(Math.abs(x),Math.abs(z))>38?null:terrainHeight(world.level,x,z)}

function makeSky(level){
  const top=new THREE.Color(level.skyTop),bottom=new THREE.Color(level.skyBottom);
  const m=new THREE.Mesh(new THREE.SphereGeometry(210,32,16),new THREE.ShaderMaterial({uniforms:{topColor:{value:top},bottomColor:{value:bottom}},vertexShader:'varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform vec3 topColor,bottomColor;varying vec3 p;void main(){float t=smoothstep(-.25,.77,normalize(p).y);gl_FragColor=vec4(mix(bottomColor,topColor,t),1.);}',side:THREE.BackSide,depthWrite:false}));
  m.renderOrder=-100;return m;
}

function roadX(z){return Math.sin(z*.115)*3.1}
function clearOfObjectives(level,x,z,r=3){
  return [level.spawn,level.dragon,level.portal,...level.stars].every(p=>Math.hypot(x-p.x,z-p.z)>r);
}
function clearOfBuildings(level,x,z,pad=1){return level.buildings.every(b=>Math.abs(x-b.x)>b.w/2+pad||Math.abs(z-b.z)>b.d/2+pad)}

function masonryTexture(seed,roof=false){
  const cv=document.createElement('canvas');cv.width=cv.height=256;const c=cv.getContext('2d');
  c.fillStyle=roof?'#a6a49c':'#dedbd2';c.fillRect(0,0,256,256);
  const rand=rng(seed);
  for(let i=0;i<9000;i++){
    const v=(60+rand()*135)|0,a=.02+rand()*.17;
    c.fillStyle=`rgba(${v},${v},${v},${a})`;c.fillRect(rand()*256,rand()*256,1+rand()*5,1+rand()*3);
  }
  c.strokeStyle=roof?'#4e514b55':'#74776f30';c.lineWidth=2;
  const row=roof?21:42;
  for(let y=0;y<256;y+=row){c.beginPath();c.moveTo(0,y);c.lineTo(256,y);c.stroke();for(let x=((y/row)%2)*38;x<256;x+=76){c.beginPath();c.moveTo(x,y);c.lineTo(x,y+row);c.stroke()}}
  const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;
}

function makeTerrain(group,level,index){
  const geo=new THREE.PlaneGeometry(80,80,128,128);geo.rotateX(-Math.PI/2);
  const pos=geo.attributes.position, colors=[];
  const base=new THREE.Color(level.ground),light=new THREE.Color(level.groundLight),road=new THREE.Color(level.path),stone=new THREE.Color(level.rock);
  for(let i=0;i<pos.count;i++){
    const x=pos.getX(i),z=pos.getZ(i),h=terrainHeight(level,x,z);pos.setY(i,h);
    const grain=hash(Math.floor(x*1.8),Math.floor(z*1.8));
    const wash=.23+.48*grain+.10*Math.sin(x*.75+z*.41);
    const c=base.clone().lerp(light,clamp(wash,0,1));
    const roadDist=Math.abs(x-roadX(z));
    if(roadDist<2.15)c.lerp(road,clamp((2.15-roadDist)*.7,0,.9));
    if(level.biome==='alpine'&&h>1.2)c.lerp(stone,.42);
    if(level.biome==='canyon'&&grain>.76)c.lerp(stone,.2);
    colors.push(c.r,c.g,c.b);
  }
  geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.computeVertexNormals();
  const ground=mesh(group,geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,flatShading:false}));ground.castShadow=false;
  // Repeated fine grain is cheap and makes the terrain read as soil instead of a flat colored plane.
  const cv=document.createElement('canvas');cv.width=cv.height=256;const c=cv.getContext('2d');
  c.fillStyle='#aaa69a';c.fillRect(0,0,256,256);
  for(let i=0;i<19000;i++){const x=(hash(i,17)*256)|0,y=(hash(i,91)*256)|0,v=(hash(i,53)*80+60)|0;c.fillStyle=`rgba(${v},${v},${v},${.04+hash(i,31)*.13})`;c.fillRect(x,y,1+hash(i,19)*2,1+hash(i,27)*2)}
  const texture=new THREE.CanvasTexture(cv);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(24,24);texture.colorSpace=THREE.SRGBColorSpace;
  const detail=mesh(group,new THREE.PlaneGeometry(80,80),new THREE.MeshBasicMaterial({map:texture,transparent:true,opacity:.15,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}),0,.025,0);
  detail.rotation.x=-Math.PI/2;detail.castShadow=false;detail.receiveShadow=false;
}

function makeTree(group,level,x,z,scale,rand){
  const g=new THREE.Group();g.position.set(x,terrainHeight(level,x,z),z);g.scale.setScalar(scale);group.add(g);
  const trunk=mat(level.biome==='canyon'?0x62503e:0x584b3b),foliage=mat(level.biome==='canyon'?0x67735a:level.biome==='alpine'?0x344b43:0x3e5a40);
  mesh(g,new THREE.CylinderGeometry(.13,.23,2.2,7),trunk,0,1.1,0);
  if(level.biome==='coast'&&rand()<.45){
    mesh(g,new THREE.SphereGeometry(1,9,7),foliage,0,2.7,0).scale.set(.9,.68,.85);
    for(let s=-1;s<=1;s+=2){const branch=mesh(g,new THREE.CylinderGeometry(.055,.09,1.25,5),trunk,s*.38,2.35,0);branch.rotation.z=s*.62}
  }else if(level.biome==='canyon'){
    mesh(g,new THREE.SphereGeometry(1,8,6),foliage,0,2.75,0).scale.set(1,.7,.9);
    mesh(g,new THREE.SphereGeometry(1,8,6),foliage,-.55,2.5,.1).scale.set(.6,.45,.55);
  }else{
    for(let i=0;i<3;i++){const m=mesh(g,new THREE.ConeGeometry(1.15-i*.16,1.85,7),foliage,0,2.15+i*.56,0);m.rotation.y=rand()*3}
  }
}

function makeBuilding(group,level,b,i,textures){
  const g=new THREE.Group();g.position.set(b.x,terrainHeight(level,b.x,b.z),b.z);group.add(g);
  const stone=mat(level.biome==='canyon'?0x9f8b74:level.biome==='coast'?0xc6b9a0:0x95968b);stone.map=textures.wall;
  const trim=mat(level.biome==='canyon'?0x695949:0x615c54),roof=mat(level.biome==='coast'?0x77716b:0x55544d);roof.map=textures.roof;
  const glass=mat(0x293b42,.22,.18);
  box(g,stone,0,b.h/2,0,b.w,b.h,b.d);
  // Solid gabled roof with eaves, framed windows and doors.
  const profile=new THREE.Shape();profile.moveTo(-b.w/2-.36,b.h);profile.lineTo(0,b.h+1.65);profile.lineTo(b.w/2+.36,b.h);profile.closePath();
  mesh(g,new THREE.ExtrudeGeometry(profile,{depth:b.d+.62,bevelEnabled:false}),roof,0,0,-b.d/2-.31);
  for(const side of [-1,1]){
    box(g,trim,side*b.w*.5,b.h*.5,0,.14,b.h,b.d+.08);
    for(const z of [-b.d*.25,b.d*.25]){
      box(g,trim,side*(b.w/2+.085),b.h*.58,z,.10,.97,1.00);
      box(g,glass,side*(b.w/2+.15),b.h*.58,z,.035,.75,.77);
      box(g,trim,side*(b.w/2+.18),b.h*.58,z,.04,.065,.86);
    }
  }
  box(g,trim,0,1.08,b.d/2+.09,1.28,2.1,.14);
  box(g,mat(0x3c352f),0,1.06,b.d/2+.18,1.05,1.95,.06);
  mesh(g,new THREE.SphereGeometry(.075,8,6),mat(0xb4a16d,.35),.38,1.05,b.d/2+.24);
  if(i===0&&level.biome==='coast'){
    const beacon=new THREE.Group();beacon.position.set(-b.w*.5-3,terrainHeight(level,b.x-b.w*.5-3,b.z)-g.position.y,0);g.add(beacon);
    mesh(beacon,new THREE.CylinderGeometry(.52,.83,8,12),stone,0,4,0);
    mesh(beacon,new THREE.CylinderGeometry(.67,.67,1,12),glass,0,8.3,0);
    mesh(beacon,new THREE.ConeGeometry(.84,.9,12),roof,0,9.25,0);
    const lamp=new THREE.PointLight(0xffdfaa,5,19);lamp.position.set(0,8.2,0);beacon.add(lamp);
  }
}

function makeVegetation(group,level,index){
  const rand=rng(49291+index*751),rock=mat(level.rock),grass=mat(level.biome==='canyon'?0x887653:level.biome==='alpine'?0x637b5c:0x557046);
  const rockGeo=new THREE.DodecahedronGeometry(1,0),rocks=new THREE.InstancedMesh(rockGeo,rock,105),dummy=new THREE.Object3D();
  let rockCount=0;
  for(let i=0;i<160;i++){
    const x=(rand()-.5)*75,z=(rand()-.5)*75;
    if(Math.abs(x-roadX(z))<2.8||!clearOfObjectives(level,x,z,2)||!clearOfBuildings(level,x,z,1))continue;
    const scale=.28+rand()*.75;dummy.position.set(x,terrainHeight(level,x,z)+scale*.18,z);dummy.scale.set(scale,scale*.36,scale*.8);dummy.rotation.set(rand()*2,rand()*6,rand()*.3);dummy.updateMatrix();rocks.setMatrixAt(rockCount++,dummy.matrix);
    if(rockCount===105)break;
  }
  rocks.count=rockCount;rocks.castShadow=true;rocks.receiveShadow=true;group.add(rocks);
  for(let i=0;i<115;i++){
    const x=(rand()-.5)*74,z=(rand()-.5)*74;
    if(Math.abs(x-roadX(z))<4||!clearOfObjectives(level,x,z,4)||!clearOfBuildings(level,x,z,2))continue;
    if(rand()<(level.biome==='canyon'?.53:.33))continue;
    makeTree(group,level,x,z,.66+rand()*.64,rand);
  }
  const bladeGeo=new THREE.BufferGeometry();bladeGeo.setAttribute('position',new THREE.Float32BufferAttribute([-.055,-.22,0,.055,-.22,0,.018,.30,0],3));bladeGeo.computeVertexNormals();
  const blades=new THREE.InstancedMesh(bladeGeo,new THREE.MeshStandardMaterial({color:level.biome==='canyon'?0x887653:level.biome==='alpine'?0x637b5c:0x557046,side:THREE.DoubleSide,roughness:1}),level.biome==='canyon'?550:2400);
  let count=0;
  for(let i=0;i<blades.count*1.8;i++){
    const x=(rand()-.5)*77,z=(rand()-.5)*77;
    if(Math.abs(x-roadX(z))<2.7||!clearOfBuildings(level,x,z,.6))continue;
    const size=.55+rand()*1.3;dummy.position.set(x,terrainHeight(level,x,z)+.24*size,z);dummy.rotation.set(0,rand()*6,0);dummy.scale.set(size,size,size);dummy.updateMatrix();blades.setMatrixAt(count++,dummy.matrix);
    if(count===blades.count)break;
  }
  blades.count=count;blades.castShadow=false;blades.receiveShadow=false;group.add(blades);
}

function makeLandmarks(group,level){
  if(level.biome==='forest'){
    const timber=mat(0x5e513c),post=new THREE.BoxGeometry(.15,.75,.15),rail=new THREE.BoxGeometry(.09,.08,2.55);
    for(const side of [-1,1])for(let z=-24;z<16;z+=3.2){
      if(Math.abs(z-12)<5||Math.abs(z+8)<5)continue;
      const x=roadX(z)+side*3.8,y=terrainHeight(level,x,z);
      mesh(group,post,timber,x,y+.38,z);
      mesh(group,rail,timber,x,y+.52,z+1.28);
    }
  }
  if(level.biome==='canyon'){
    const red=mat(0x795d4a),warm=mat(0xa17a59);
    for(const [x,z,size] of [[-34,-26,1],[33,-26,1.25],[-35,25,.8],[32,27,1.05]]){
      const y=terrainHeight(level,x,z);
      mesh(group,new THREE.CylinderGeometry(2.6*size,3.4*size,5*size,7),red,x,y+2.5*size,z);
      mesh(group,new THREE.CylinderGeometry(2.9*size,2.65*size,.65*size,7),warm,x,y+5.2*size,z);
      mesh(group,new THREE.CylinderGeometry(2.3*size,2.8*size,1.7*size,7),red,x,y+6.25*size,z);
    }
  }
  if(level.biome==='alpine'){
    const stone=mat(0x657374),snow=mat(0xc4c9c5);
    for(const [x,z,r,h] of [[-48,-42,12,20],[47,-43,15,26],[-48,42,13,23],[49,41,11,20]]){
      mesh(group,new THREE.ConeGeometry(r,h,7),stone,x,h/2-1,z);
      mesh(group,new THREE.ConeGeometry(r*.30,h*.27,7),snow,x,h-1,z);
    }
  }
  if(level.biome==='coast'){
    const wood=mat(0x655c4e),water=mat(0x456e7d,.3,.18);
    const sea=mesh(group,new THREE.PlaneGeometry(80,95),water,68,-.13,-4);sea.rotation.x=-Math.PI/2;sea.castShadow=false;
    box(group,wood,30,.15,-8,12,.27,2.8);
    for(const x of [25,28,31,34])for(const z of [-9,-7])box(group,wood,x,-.34,z,.27,1.1,.27);
    for(const z of [-30,-22,-14,-6,2,10,18]){
      const x=30,y=terrainHeight(level,x,z);
      mesh(group,new THREE.DodecahedronGeometry(1.2,0),mat(0x777e79),x,y+.22,z).scale.set(1.5,.48,1.0);
    }
  }
}

function starGeometry(){const s=new THREE.Shape();for(let i=0;i<10;i++){const a=Math.PI/2+i*Math.PI/5,r=i%2?.27:.54;if(i===0)s.moveTo(Math.cos(a)*r,Math.sin(a)*r);else s.lineTo(Math.cos(a)*r,Math.sin(a)*r)}s.closePath();return new THREE.ExtrudeGeometry(s,{depth:.09,bevelEnabled:true,bevelSegments:2,bevelSize:.04,bevelThickness:.04})}
const starGeo=starGeometry();
function makePortal(group,level){
  const g=new THREE.Group();g.position.set(level.portal.x,terrainHeight(level,level.portal.x,level.portal.z),level.portal.z);group.add(g);
  const metal=mat(0x747b79,.44,.6);metal.emissive=new THREE.Color(0x27332f);metal.emissiveIntensity=.18;
  const ring=mesh(g,new THREE.TorusGeometry(1.08,.13,12,48),metal,0,1.48,0);
  const inner=mesh(g,new THREE.CircleGeometry(.97,48),new THREE.MeshBasicMaterial({color:level.accent,transparent:true,opacity:.05,side:THREE.DoubleSide,depthWrite:false}),0,1.48,-.05);inner.castShadow=false;
  mesh(g,new THREE.CylinderGeometry(1.17,1.3,.26,32),mat(0x686861),0,.12,0);
  for(let i=0;i<9;i++){const a=i*2*Math.PI/9;mesh(g,new THREE.BoxGeometry(.25,.10,.26),mat(0x454b48),Math.sin(a)*1.15,.34,Math.cos(a)*1.15).rotation.y=a}
  const orbit=[];for(let i=0;i<6;i++)orbit.push(mesh(g,new THREE.OctahedronGeometry(.055),mat(level.accent,.28)));
  return {group:g,ring,inner,mat:metal,orbit,unlocked:false};
}

export function createLevel(level,index){
  const group=new THREE.Group();group.add(makeSky(level));makeTerrain(group,level,index);
  makeVegetation(group,level,index);
  makeLandmarks(group,level);
  const textures={wall:masonryTexture(201+index*13),roof:masonryTexture(300+index*17,true)};
  level.buildings.forEach((b,i)=>makeBuilding(group,level,b,i,textures));
  const gold=new THREE.MeshStandardMaterial({color:0xe9bf69,roughness:.35,metalness:.64,emissive:0x9e6d1c,emissiveIntensity:.28});
  const stars=level.stars.map((p,i)=>{
    const g=new THREE.Group(),y=terrainHeight(level,p.x,p.z)+1.5;g.position.set(p.x,y,p.z);group.add(g);
    mesh(g,starGeo,gold).position.z=-.06;
    const halo=mesh(g,new THREE.SphereGeometry(.65,12,8),new THREE.MeshBasicMaterial({color:0xffd883,transparent:true,opacity:.085,depthWrite:false}));halo.scale.z=.18;halo.castShadow=false;
    return {group:g,x:p.x,z:p.z,y,baseY:y,collected:false,index:i};
  });
  const portal=makePortal(group,level);
  return {group,stars,portal,level};
}
export function animateWorld(world,time,dt){
  if(!world)return;
  for(const s of world.stars)if(!s.collected){s.group.position.y=s.baseY+Math.sin(time*2.4+s.index)*.15;s.group.rotation.y+=dt*1.2}
  const p=world.portal;p.ring.rotation.z=Math.sin(time*1.4)*.025;p.inner.material.opacity=p.unlocked?.23+Math.sin(time*2.5)*.04:.045;
  p.mat.emissiveIntensity=p.unlocked?.9:.18;
  p.orbit.forEach((o,i)=>{const a=time*.9+i*Math.PI*2/p.orbit.length;o.position.set(Math.cos(a)*1.32,1.48+Math.sin(a)*1.32,.1);o.visible=p.unlocked});
}
export function unlockPortal(portal,accent){portal.unlocked=true;portal.mat.color.setHex(accent);portal.mat.emissive.setHex(accent)}

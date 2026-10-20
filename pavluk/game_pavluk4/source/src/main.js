import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createVehicleState, stepVehicle } from './vehiclePhysics.js';
import { sampleTerrainGrid } from './groundCollision.js';
import './style.css';

const root = document.querySelector('#app');
root.innerHTML = `<div class="loading"><div class="loading-inner"><div class="loading-mark"></div><p>СТВОРЮЄМО СВІТ…</p></div></div><div class="veil"><div class="intro"><div class="eyebrow">ПАВЛИК / ЕКСПЕДИЦІЯ 04</div><h1>Відкритий<br><span>світ.</span></h1><p>Тиха долина, лісові стежки та гори на горизонті. Просто йди куди захочеш. Бігай, стрибай і досліджуй.</p><button class="enter">Увійти у світ →</button><small>W A S D — рух &nbsp;·&nbsp; Shift — біг &nbsp;·&nbsp; Пробіл — стрибок<br>Миша — огляд &nbsp;·&nbsp; колесо — наблизити камеру &nbsp;·&nbsp; Esc — звільнити курсор</small></div></div><div class="hud"><div class="topbar"><div class="brand">ПАВЛИК <b> / ВІДКРИТИЙ СВІТ</b></div><div class="location">ПІВДЕННА ДОЛИНА · ВІЛЬНА ПРОГУЛЯНКА</div></div><div class="hint">Клацни по світу, щоб керувати камерою</div><div class="bottom"><div class="controls"><b>W A S D</b> рух &nbsp; · &nbsp; <b>Shift</b> біг &nbsp; · &nbsp; <b>Пробіл</b> стрибок<br><b>Миша</b> огляд &nbsp; · &nbsp; <b>Колесо</b> відстань камери</div><div class="coords">X 000 · Z 000</div></div><div class="mobile"><div class="joystick"><div class="stick"></div></div><button class="run">БІГ</button><button class="jump">СТРИБОК</button></div></div>`;

const loading = document.querySelector('.loading');
const veil = document.querySelector('.veil');
document.querySelector('.intro small').innerHTML += '<br>Утримуй C — камера дивиться назад';
document.querySelector('.intro small').innerHTML += '<br>А (укр.) / F (англ.) біля авто — сісти або вийти · W/S — газ / гальмо · A/D — кермо';
document.querySelector('.intro small').innerHTML += '<br>Shift за кермом — нітро · Пробіл — ручник';
document.querySelector('.intro small').innerHTML += '<br>R — повернути персонажа й машину на старт';
document.querySelector('.intro small').innerHTML += '<br><a class="asset-credit" href="https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/CarConcept" target="_blank" rel="noopener noreferrer">Модель авто: Eric Chadwick, Darmstadt Graphics Group · CC BY 4.0</a>';
document.querySelector('.intro p').textContent = 'Тиха долина, лісові стежки та гори на горизонті. Досліджуй світ пішки або сідай за кермо автомобіля.';
document.querySelector('.controls').innerHTML += '<br><b>C</b> погляд назад';
document.querySelector('.controls').innerHTML += ' &nbsp; · &nbsp; <b>А / F</b> сісти біля авто &nbsp; · &nbsp; <b>R</b> на старт';
const vehicleHint=document.createElement('div');vehicleHint.className='vehicle-hint';document.querySelector('.hud').append(vehicleHint);
const speedometer=document.createElement('div');speedometer.className='speedometer';speedometer.innerHTML='<div class="speed-label">ШВИДКІСТЬ</div><div class="speed-value"><span>0</span><small>км/год</small></div><div class="gear">N</div><div class="nitro-label">НІТРО <span>100%</span></div><div class="nitro-track"><div class="nitro-fill"></div></div><div class="speed-help">W / S газ і гальмо · A / D кермо<br>Shift нітро · Пробіл ручник · А / F вийти</div>';document.querySelector('.hud').append(speedometer);
const speedValue=speedometer.querySelector('.speed-value span'),gearValue=speedometer.querySelector('.gear');
const nitroValue=speedometer.querySelector('.nitro-label span'),nitroFill=speedometer.querySelector('.nitro-fill');
const footControls=document.querySelector('.controls').innerHTML;
const fpsCounter=document.createElement('div');fpsCounter.className='fps-counter';fpsCounter.innerHTML='<b>--</b> FPS';document.querySelector('.hud').append(fpsCounter);
const fpsValue=fpsCounter.querySelector('b');
const resetButton=document.createElement('button');resetButton.className='reset-button';resetButton.textContent='↺';resetButton.title='Повернутися на старт (R)';resetButton.setAttribute('aria-label','Повернутися на старт');document.querySelector('.hud').append(resetButton);
const enter = document.querySelector('.enter');
const hint = document.querySelector('.hint');
const loc = document.querySelector('.location');
const coords = document.querySelector('.coords');

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
const maxPixelRatio=Math.min(window.devicePixelRatio||1,1);
const qualityLevels=[
  {pixelRatio:maxPixelRatio,grass:7000,nearTrees:2,farTrees:18,rocks:8,shadow:768},
  {pixelRatio:Math.max(.78,maxPixelRatio*.85),grass:4500,nearTrees:1,farTrees:15,rocks:6,shadow:512},
  {pixelRatio:Math.max(.66,maxPixelRatio*.72),grass:2800,nearTrees:0,farTrees:12,rocks:4,shadow:512},
  {pixelRatio:Math.max(.56,maxPixelRatio*.6),grass:1500,nearTrees:0,farTrees:9,rocks:3,shadow:384}
];
let qualityLevel=0;
renderer.setPixelRatio(qualityLevels[qualityLevel].pixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
root.prepend(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#b5c5c5');
scene.fog = new THREE.FogExp2('#b5c5c5', 0.00155);
const camera = new THREE.PerspectiveCamera(67, window.innerWidth / window.innerHeight, 0.1, 1100);
const sky=new THREE.Mesh(new THREE.SphereGeometry(950,32,16),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,vertexShader:'varying vec3 vPosition; void main(){vPosition=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'varying vec3 vPosition; void main(){float h=normalize(vPosition).y; vec3 horizon=vec3(.70,.79,.78); vec3 zenith=vec3(.27,.47,.66); vec3 low=vec3(.82,.81,.71); vec3 color=mix(horizon,zenith,smoothstep(.0,.85,h)); color=mix(low,color,smoothstep(-.3,.13,h)); gl_FragColor=vec4(color,1.0);}' }));scene.add(sky);
const hemi = new THREE.HemisphereLight('#d4e8fa', '#59614d', 1.35); scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff1d8', 2.15);
sun.position.set(-85, 145, -110); sun.castShadow = true;
sun.shadow.mapSize.set(qualityLevels[0].shadow,qualityLevels[0].shadow);
sun.shadow.camera.left = sun.shadow.camera.bottom = -80;
sun.shadow.camera.right = sun.shadow.camera.top = 80;
sun.shadow.camera.near = 1; sun.shadow.camera.far = 330;
sun.shadow.bias = -0.00015; sun.shadow.normalBias = 0.035;
scene.add(sun, sun.target);

const asset = (name) => `${import.meta.env.BASE_URL}assets/${name}`;
const textureLoader = new THREE.TextureLoader();
function texture(name, repeat = 1, color = false) {
  const t = textureLoader.load(asset(name));
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const grassMap = texture('leafy_grass-Diffuse.jpg', 48, true);
const grassNormal = texture('leafy_grass-nor_gl.jpg', 48);
const pathMap = texture('grass_path_2-Diffuse.jpg', 1, true);
const pathNormal = texture('grass_path_2-nor_gl.jpg', 1);

const groundMaterial = new THREE.MeshStandardMaterial({ map:grassMap, normalMap:grassNormal, normalScale:new THREE.Vector2(.45,.45), roughness:1, vertexColors:true });
const pathMaterial = new THREE.MeshStandardMaterial({ map:pathMap, normalMap:pathNormal, normalScale:new THREE.Vector2(.35,.35), roughness:1, color:'#ab9f83' });

function hash(x,z){let n=Math.sin(x*127.1+z*311.7)*43758.5453;return n-Math.floor(n)}
function smooth(t){return t*t*(3-2*t)}
function noise(x,z){const ix=Math.floor(x),iz=Math.floor(z),fx=smooth(x-ix),fz=smooth(z-iz);return THREE.MathUtils.lerp(THREE.MathUtils.lerp(hash(ix,iz),hash(ix+1,iz),fx),THREE.MathUtils.lerp(hash(ix,iz+1),hash(ix+1,iz+1),fx),fz)*2-1}
function terrainHeight(x,z){
  const broad=noise(x*.0027,z*.0027)*18 + noise(x*.006,z*.006)*8;
  const hills=Math.max(0,Math.abs(x)-130)/180;
  const ridge=hills*hills*(42 + noise(x*.004,z*.004)*24);
  const fine=noise(x*.024,z*.024)*1+noise(x*.072,z*.072)*.25;
  const flat=THREE.MathUtils.smoothstep(Math.hypot(x,z),25,125);
  return (broad+ridge)*flat + fine*flat;
}
function pathX(z){return 9*Math.sin(z*.007)+3*Math.sin(z*.019)}
function forestValue(x,z){return noise(x*.011+87,z*.011-31)+noise(x*.033,z*.033)*.35}
function seeded(cx,cz,n){return hash(cx*61+n*17.7,cz*79-n*29.1)}

const CHUNK=128, SEG=36, GRID=5;
const chunks = new Map();
function createChunk(cx,cz){
  const g = new THREE.PlaneGeometry(CHUNK,CHUNK,SEG,SEG); g.rotateX(-Math.PI/2);
  const pos=g.attributes.position, color=[],heights=new Float32Array(pos.count);
  for(let i=0;i<pos.count;i++){
    const x=cx*CHUNK+pos.getX(i),z=cz*CHUNK+pos.getZ(i);
    const h=terrainHeight(x,z);pos.setY(i,h);heights[i]=h;
    const f=forestValue(x,z);
    const col=new THREE.Color();
    if(h>32) col.setRGB(.86,.9,.82);
    else if(f>.25) col.setRGB(.67,.92,.65);
    else col.setRGB(.78,.9,.7);
    const variation=noise(x*.055,z*.055)*.075;
    col.multiplyScalar(1+variation);color.push(col.r,col.g,col.b);
  }
  g.setAttribute('color',new THREE.Float32BufferAttribute(color,3));g.computeVertexNormals();
  const mesh=new THREE.Mesh(g,groundMaterial);mesh.position.set(cx*CHUNK,0,cz*CHUNK);mesh.receiveShadow=true;scene.add(mesh);
  const group=new THREE.Group();scene.add(group);
  if(Math.abs(cx)<2){
    const segments=28, width=2.15, verts=[],uv=[],indices=[];
    for(let i=0;i<=segments;i++){
      const z=cz*CHUNK-CHUNK/2+i*CHUNK/segments,x=pathX(z);
      const dx=(pathX(z+1)-pathX(z-1))*.5;
      for(const side of [-1,1]){
        const xx=x+side*width/2,zz=z-side*dx*width/2;
        verts.push(xx,terrainHeight(xx,zz)+.045,zz);
        uv.push(side<0?0:1,i*CHUNK/segments/3.5);
      }
      if(i<segments){const k=i*2;indices.push(k,k+2,k+1,k+1,k+2,k+3)}
    }
    const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));pg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));pg.setIndex(indices);pg.computeVertexNormals();
    const path=new THREE.Mesh(pg,pathMaterial);path.receiveShadow=true;group.add(path);
  }
  return {mesh,group,heights};
}
function groundHeight(x,z){
  const cx=Math.round(x/CHUNK),cz=Math.round(z/CHUNK),chunk=chunks.get(`${cx},${cz}`);
  if(!chunk)return terrainHeight(x,z)+.07;
  return sampleTerrainGrid(x,z,cx*CHUNK,cz*CHUNK,CHUNK,SEG,chunk.heights)+.07;
}
function syncChunks(x,z){
  const cx=Math.round(x/CHUNK),cz=Math.round(z/CHUNK),wanted=new Set();
  for(let dz=-GRID/2|0;dz<=Math.floor(GRID/2);dz++)for(let dx=-GRID/2|0;dx<=Math.floor(GRID/2);dx++){
    const a=cx+dx,b=cz+dz,key=`${a},${b}`;wanted.add(key);
    if(!chunks.has(key))chunks.set(key,createChunk(a,b));
  }
  for(const [key,c] of chunks)if(!wanted.has(key)){scene.remove(c.mesh,c.group);c.mesh.geometry.dispose();c.group.traverse(o=>{if(o.geometry)o.geometry.dispose()});chunks.delete(key)}
}

// Layered mountain silhouettes extend beyond the streamed terrain and fade into the haze.
for(let layer=0;layer<3;layer++){
  const geometry=new THREE.PlaneGeometry(1900,260,130,1);geometry.rotateX(-Math.PI/2);
  const p=geometry.attributes.position;
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),z=p.getZ(i),edge=i<131;
    p.setY(i,edge ? -48 : 40+layer*21+noise(x*.004+layer*8,layer*10)*30+noise(x*.014,layer*4)*15);
  }
  geometry.computeVertexNormals();
  const mat=new THREE.MeshBasicMaterial({color:new THREE.Color(['#7a8c81','#879b95','#9bacaa'][layer]),side:THREE.DoubleSide,fog:true});
  const back=new THREE.Mesh(geometry,mat);back.position.z=-490-layer*100;scene.add(back);
}

const gltfLoader=new GLTFLoader();
const loadGLTF=url=>new Promise((resolve,reject)=>gltfLoader.load(url,resolve,undefined,reject));
let treeTemplates=[],rockTemplates=[],character,mixer,actions={},activeAction='Idle';
const vehicleObstacles=[];
const terrainProps=new THREE.Group();scene.add(terrainProps);
// Transparent tree cutouts fill the middle distance while photogrammetry trees frame the player.
const farTreeGroup=new THREE.Group();scene.add(farTreeGroup);
const cutout=textureLoader.load(asset('pine-cutout.png'));cutout.colorSpace=THREE.SRGBColorSpace;cutout.anisotropy=8;
const farTreeMaterial=new THREE.MeshBasicMaterial({map:cutout,alphaTest:.28,side:THREE.DoubleSide,fog:true,depthWrite:true});
const farTreeGeometry=new THREE.PlaneGeometry(4.6,7.1);farTreeGeometry.translate(0,3.55,0);
function instanceTemplate(template,positions,scaleRange){
  const instances=[];
  template.traverse(object=>{
    if(!object.isMesh)return;
    const mesh=new THREE.InstancedMesh(object.geometry,object.material,positions.length);
    mesh.castShadow=false;mesh.receiveShadow=true;
    const dummy=new THREE.Object3D();
    positions.forEach((p,i)=>{
      const s=p.s*scaleRange;dummy.position.set(p.x,groundHeight(p.x,p.z)-.07+p.y,p.z);dummy.rotation.y=p.rot;dummy.scale.set(s,s,s);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate=true;mesh.frustumCulled=false;instances.push(mesh);terrainProps.add(mesh);
  });
  return instances;
}
function makeProps(x,z){
  for(const c of [...terrainProps.children]){terrainProps.remove(c);c.dispose?.()}
  for(const c of [...farTreeGroup.children]){farTreeGroup.remove(c);c.dispose?.()}
  const cellX=Math.round(x/150),cellZ=Math.round(z/150);
  const nearCandidates=[],nearTrees=[],rockCandidates=[],rocks=[],farTrees=[];
  for(let dz=-2;dz<=2;dz++)for(let dx=-2;dx<=2;dx++){
    const cx=cellX+dx,cz=cellZ+dz;
    for(let i=0;i<7;i++){
      const px=cx*150+(seeded(cx,cz,i*2+100)-.5)*150;
      const pz=cz*150+(seeded(cx,cz,i*2+101)-.5)*150;
      if(Math.abs(px-pathX(pz))<7||Math.hypot(px-x,pz-z)<7)continue;
      const distance=Math.hypot(px-x,pz-z);
      if(distance<115 && forestValue(px,pz)>-.38 && seeded(cx,cz,850+i)>.08)
        nearCandidates.push({x:px,z:pz,y:0,rot:seeded(cx,cz,710+i)*6.28,s:.75+seeded(cx,cz,720+i)*.6,distance});
    }
    for(let i=0;i<qualityLevels[qualityLevel].farTrees;i++){
      const px=cx*150+(seeded(cx,cz,i*2+1210)-.5)*150;
      const pz=cz*150+(seeded(cx,cz,i*2+1211)-.5)*150;
      if(Math.abs(px-pathX(pz))<8||Math.hypot(px-x,pz-z)<35||forestValue(px,pz)<-.25)continue;
      farTrees.push({x:px,z:pz,y:0,rot:seeded(cx,cz,1520+i)*6.28,s:.8+seeded(cx,cz,1620+i)*.9});
    }
    for(let i=0;i<3;i++){
      const px=cx*150+(seeded(cx,cz,i*2+410)-.5)*150;
      const pz=cz*150+(seeded(cx,cz,i*2+411)-.5)*150;
      if(Math.abs(px-pathX(pz))<4)continue;
      rockCandidates.push({x:px,z:pz,y:-.22,rot:seeded(cx,cz,600+i)*6.28,s:.5+seeded(cx,cz,620+i)*1.6,distance:Math.hypot(px-x,pz-z)});
    }
  }
  if(Math.abs(cellX)<=1&&Math.abs(cellZ)<=1){
    for(const [px,pz,rot,s] of [[8,-11,.4,1.2],[-14,-18,.4,1.2],[17,-24,2.1,1.38],[-24,5,1.7,1.1],[27,15,4.5,1.25],[-35,-42,3.2,1.4],[37,-47,5.2,1.6]]){
      const distance=Math.hypot(px-x,pz-z);
      if(distance>7)nearCandidates.push({x:px,z:pz,y:0,rot,s,distance});
    }
  }
  nearCandidates.sort((a,b)=>a.distance-b.distance);
  const detailedTreeCount=qualityLevels[qualityLevel].nearTrees;
  nearTrees.push(...nearCandidates.slice(0,detailedTreeCount));
  farTrees.push(...nearCandidates.slice(detailedTreeCount));
  rockCandidates.sort((a,b)=>a.distance-b.distance);
  rocks.push(...rockCandidates.slice(0,qualityLevels[qualityLevel].rocks));
  vehicleObstacles.length=0;
  for(const p of nearTrees)vehicleObstacles.push({x:p.x,z:p.z,radius:1.1*p.s});
  for(const p of rocks)vehicleObstacles.push({x:p.x,z:p.z,radius:.65*p.s});
  for(const p of farTrees)vehicleObstacles.push({x:p.x,z:p.z,radius:.65*p.s});
  if(treeTemplates.length){
    for(let k=0;k<treeTemplates.length;k++)instanceTemplate(treeTemplates[k],nearTrees.filter((_,i)=>i%treeTemplates.length===k),8.5);
  }
  if(rockTemplates.length){
    for(let k=0;k<rockTemplates.length;k++)instanceTemplate(rockTemplates[k],rocks.filter((_,i)=>i%rockTemplates.length===k),1.7);
  }
  const dummy=new THREE.Object3D();
  for(let side=0;side<2;side++){
    const mesh=new THREE.InstancedMesh(farTreeGeometry,farTreeMaterial,farTrees.length);
    farTrees.forEach((p,i)=>{const s=p.s;dummy.position.set(p.x,groundHeight(p.x,p.z)-.07,p.z);dummy.rotation.y=p.rot+side*Math.PI/2;dummy.scale.set(s,s,s);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix)});
    mesh.frustumCulled=false;mesh.instanceMatrix.needsUpdate=true;farTreeGroup.add(mesh);
  }
}

const grassGeometry=new THREE.BufferGeometry();
const grassVerts=[],grassColor=[];
function blade(ax,ay,az,angle,height,width,color){
  const dx=Math.cos(angle)*width,dz=Math.sin(angle)*width,bx=Math.cos(angle+1)*width*.45,bz=Math.sin(angle+1)*width*.45;
  grassVerts.push(ax-dx,ay,az-dz, ax+dx,ay,az+dz, ax+bx,ay+height,az+bz);
  for(let k=0;k<3;k++)grassColor.push(color.r*(k===2?1.16:.65),color.g*(k===2?1.13:.72),color.b*(k===2?1.08:.65));
}
const grassBladeMaterial=new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,roughness:1,transparent:false});
const grassBlades=new THREE.Mesh(grassGeometry,grassBladeMaterial);grassBlades.frustumCulled=false;scene.add(grassBlades);
const GRASS_STEP=24;
function updateGrass(x,z){
  grassGeometry.dispose();
  grassVerts.length=grassColor.length=0;
  const gx=Math.round(x/GRASS_STEP)*GRASS_STEP,gz=Math.round(z/GRASS_STEP)*GRASS_STEP;
  for(let i=0;i<qualityLevels[qualityLevel].grass;i++){
    const a=hash(gx+i*1.7,gz-i*2.9)*Math.PI*2,r=Math.sqrt(hash(gx-i*3.1,gz+i*7.7))*82;
    const px=gx+Math.cos(a)*r,pz=gz+Math.sin(a)*r;
    if(Math.abs(px-pathX(pz))<2.3)continue;
    const ground=groundHeight(px,pz)-.07;
    if(ground>43)continue;
    const h=.13+hash(px*2,pz*3)*.27;
    const c=new THREE.Color().setHSL(.25+hash(px,pz)*.06,.3+hash(px*3,pz)*.18,.22+hash(px,pz*2)*.11);
    blade(px,ground-.015,pz,hash(px*4,pz*5)*6.28,h,.014+hash(px,pz)*.013,c);
    blade(px,ground-.015,pz,hash(px*9,pz*6)*6.28,h*.8,.014,c);
  }
  grassGeometry.setAttribute('position',new THREE.Float32BufferAttribute(grassVerts,3));
  grassGeometry.setAttribute('color',new THREE.Float32BufferAttribute(grassColor,3));
  grassGeometry.computeVertexNormals();grassGeometry.computeBoundingSphere();
}

const player={pos:new THREE.Vector3(pathX(0),groundHeight(pathX(0),0),0),velY:0,heading:Math.PI,grounded:true,speed:0};
const playerRoot=new THREE.Group();scene.add(playerRoot);
const shadowDisk=new THREE.Mesh(new THREE.CircleGeometry(.85,24),new THREE.MeshBasicMaterial({color:'#1a2519',transparent:true,opacity:.17,depthWrite:false}));shadowDisk.rotation.x=-Math.PI/2;scene.add(shadowDisk);
const carRoot=new THREE.Group();carRoot.rotation.order='YXZ';scene.add(carRoot);
const carState=createVehicleState(2.7,-2.3,Math.PI,groundHeight);
const carWheels=[];
let driving=false;
function prepareCar(model){
  carRoot.add(model.scene);
  model.scene.traverse(object=>{
    if(object.isMesh){object.castShadow=/^Body(Underside|RoofPanel|RearPanelsColor1|PanelsColor2|Hood$|Door[LR]Color1|Pillars)/.test(object.name);object.receiveShadow=false}
    if(['InteriorSteeringEmblem','License Plate'].includes(object.name))object.visible=false;
  });
  for(const name of ['WheelFrontL','WheelFrontR','WheelRearL','WheelRearR']){
    const wheel=model.scene.getObjectByName(name);
    if(!wheel)continue;
    const parent=wheel.parent,position=wheel.position.clone();
    parent.remove(wheel);
    const steerPivot=new THREE.Group(),spinPivot=new THREE.Group();
    steerPivot.position.copy(position);parent.add(steerPivot);steerPivot.add(wheel);wheel.position.set(0,0,0);
    for(const child of [...wheel.children])if(!child.name.includes('BrakePad'))spinPivot.add(child);
    wheel.add(spinPivot);
    carWheels.push({steerPivot,spinPivot,front:name.includes('Front'),side:position.x>0?1:-1,baseHeight:position.z});
  }
  updateCarVisual();
}
function updateCarVisual(){
  carRoot.position.set(carState.x,carState.y,carState.z);
  carRoot.rotation.set(carState.pitch,carState.yaw,carState.roll);
  for(let i=0;i<carWheels.length;i++){
    const wheel=carWheels[i];
    wheel.steerPivot.position.z=wheel.baseHeight+carState.wheelOffsets[i];
    if(wheel.front){
      const angle=Math.abs(carState.steer);
      const radius=angle>.001?2.8/Math.tan(angle):Infinity;
      const inner=angle>.001?Math.atan(2.8/Math.max(.6,radius-.98)):0;
      const outer=angle>.001?Math.atan(2.8/(radius+.98)):0;
      const turn=Math.sign(carState.steer)*(wheel.side===Math.sign(carState.steer)?inner:outer);
      wheel.steerPivot.rotation.z=Math.PI/6+turn;
    }
    wheel.spinPivot.rotation.x=carState.wheelSpins[i];
  }
}
function carDistance(){return Math.hypot(player.pos.x-carState.x,player.pos.z-carState.z)}
function toggleCar(){
  if(!driving){
    if(carDistance()>3.7)return;
    driving=true;playerRoot.visible=false;shadowDisk.visible=false;
    yaw=carState.yaw-Math.PI;cameraYaw=yaw;distance=Math.max(distance,7.7);
    document.querySelector('.controls').innerHTML='<b>W / S</b> газ і гальмо &nbsp; · &nbsp; <b>A / D</b> кермо &nbsp; · &nbsp; <b>Shift</b> нітро<br><b>Пробіл</b> ручник &nbsp; · &nbsp; <b>А / F</b> вийти &nbsp; · &nbsp; <b>C</b> погляд назад &nbsp; · &nbsp; <b>R</b> на старт';
    runButton.textContent='НІТРО';jumpButton.textContent='ВИЙТИ';speedometer.classList.add('visible');
  }else{
    if(carState.speed>2.5){vehicleHint.textContent='Зупини машину, щоб вийти';vehicleHint.classList.add('visible');return}
    driving=false;playerRoot.visible=true;shadowDisk.visible=true;carState.vx=0;carState.vz=0;carState.speed=0;
    const sideX=Math.cos(carState.yaw),sideZ=-Math.sin(carState.yaw);
    player.pos.set(carState.x+sideX*2.25,groundHeight(carState.x+sideX*2.25,carState.z+sideZ*2.25),carState.z+sideZ*2.25);
    player.speed=0;player.grounded=true;player.velY=0;yaw=carState.yaw-Math.PI;
    document.querySelector('.controls').innerHTML=footControls;
    runButton.textContent='БІГ';jumpButton.textContent='СТРИБОК';speedometer.classList.remove('visible','boosting');
  }
}
function resetWorld(){
  const startX=pathX(0);
  syncChunks(startX,0);
  Object.assign(carState,createVehicleState(2.7,-2.3,Math.PI,groundHeight));
  updateCarVisual();
  driving=false;playerRoot.visible=true;shadowDisk.visible=true;
  player.pos.set(startX,groundHeight(startX,0),0);
  player.velY=0;player.heading=Math.PI;player.grounded=true;player.speed=0;
  playerRoot.position.copy(player.pos);shadowDisk.position.set(startX,player.pos.y-.03,0);
  yaw=0;cameraYaw=0;cameraBank=0;pitch=.24;distance=5.5;
  camera.position.set(startX,player.pos.y+3.1,distance);
  keys.clear();touchMove={x:0,y:0};touchRun=false;resetStick();
  changeAction('Idle');
  document.querySelector('.controls').innerHTML=footControls;
  runButton.textContent='БІГ';jumpButton.textContent='СІСТИ';speedometer.classList.remove('visible','boosting');
  lastChunkX=lastChunkZ=lastGrassX=lastGrassZ=lastPropsX=lastPropsZ=999;
}
let yaw=0,cameraYaw=0,cameraBank=0,pitch=.24,distance=5.5;
camera.position.set(player.pos.x,player.pos.y+3.1,player.pos.z+distance);
const keys=new Set();let touchMove={x:0,y:0},touchRun=false,touchLook=null,joyPointer=null;
window.addEventListener('keydown',e=>{
  if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();
  if(!veil.classList.contains('hidden'))return;
  if(e.code==='KeyR'&&!e.ctrlKey&&!e.metaKey&&!keys.has('KeyR'))resetWorld();
  // Keyboard layouts change e.key, but the physical F key is а in Ukrainian.
  if(e.code==='KeyF'&&!keys.has('KeyF'))toggleCar();
  if(e.code==='Space'&&!keys.has('Space')&&!driving)jump();
  keys.add(e.code);
});
window.addEventListener('keyup',e=>keys.delete(e.code));
window.addEventListener('blur',()=>{keys.clear();touchRun=false;touchMove={x:0,y:0}});
function jump(){if(player.grounded){player.velY=7.9;player.grounded=false}}
const isTouch=matchMedia('(pointer:coarse)').matches;
function lockMouse(){if(!isTouch)renderer.domElement.requestPointerLock?.().catch(()=>{hint.textContent='Перетягуй мишею, щоб оглядати світ';hint.classList.add('show')})}
enter.addEventListener('click',()=>{veil.classList.add('hidden');lockMouse()});
renderer.domElement.addEventListener('click',()=>{if(!isTouch&&veil.classList.contains('hidden'))lockMouse()});
document.addEventListener('pointerlockchange',()=>{hint.classList.toggle('show',!document.pointerLockElement&&veil.classList.contains('hidden')&&!isTouch)});
document.addEventListener('mousemove',e=>{if(document.pointerLockElement===renderer.domElement){yaw-=e.movementX*.0026;pitch=THREE.MathUtils.clamp(pitch-e.movementY*.0022,-.28,1.05)}});
renderer.domElement.addEventListener('wheel',e=>{distance=THREE.MathUtils.clamp(distance+Math.sign(e.deltaY)*.65,driving?5.8:2.9,driving?14:10.5)},{passive:true});
const joystick=document.querySelector('.joystick'),stick=document.querySelector('.stick'),runButton=document.querySelector('.run'),jumpButton=document.querySelector('.jump');
resetButton.addEventListener('click',resetWorld);
joystick.addEventListener('pointerdown',e=>{joyPointer=e.pointerId;joystick.setPointerCapture(e.pointerId)});
joystick.addEventListener('pointermove',e=>{if(e.pointerId!==joyPointer)return;const rect=joystick.getBoundingClientRect(),dx=e.clientX-(rect.left+rect.width/2),dy=e.clientY-(rect.top+rect.height/2),l=Math.max(1,Math.hypot(dx,dy)),mag=Math.min(1,l/43);touchMove={x:dx/l*mag,y:-dy/l*mag};stick.style.transform=`translate(${touchMove.x*43}px,${-touchMove.y*43}px)`});
function resetStick(){joyPointer=null;touchMove={x:0,y:0};stick.style.transform='translate(0,0)'}
joystick.addEventListener('pointerup',resetStick);joystick.addEventListener('pointercancel',resetStick);
runButton.addEventListener('pointerdown',e=>{touchRun=true;runButton.setPointerCapture(e.pointerId)});runButton.addEventListener('pointerup',()=>touchRun=false);runButton.addEventListener('pointercancel',()=>touchRun=false);
jumpButton.addEventListener('pointerdown',e=>{e.preventDefault();if(driving||carDistance()<3.7)toggleCar();else jump()});
renderer.domElement.addEventListener('pointerdown',e=>{if(document.pointerLockElement||!veil.classList.contains('hidden'))return;touchLook={id:e.pointerId,x:e.clientX,y:e.clientY};renderer.domElement.setPointerCapture(e.pointerId)});
renderer.domElement.addEventListener('pointermove',e=>{if(!touchLook||e.pointerId!==touchLook.id||document.pointerLockElement)return;const dx=e.clientX-touchLook.x,dy=e.clientY-touchLook.y;touchLook.x=e.clientX;touchLook.y=e.clientY;yaw-=dx*.006;pitch=THREE.MathUtils.clamp(pitch-dy*.004,-.28,1.05)});
renderer.domElement.addEventListener('pointerup',()=>touchLook=null);

function changeAction(name){if(!mixer||activeAction===name)return;actions[activeAction]?.fadeOut(.22);actions[name]?.reset().fadeIn(.22).play();activeAction=name}
const tmpForward=new THREE.Vector3(),tmpRight=new THREE.Vector3(),desired=new THREE.Vector3(),clock=new THREE.Clock();
let lastChunkX=999,lastChunkZ=999,lastGrassX=999,lastGrassZ=999,lastPropsX=999,lastPropsZ=999;
let fpsFrames=0,lastFpsTime=performance.now(),lastQualityChange=lastFpsTime,slowWindows=0,fastWindows=0;
let frameCostSum=0,renderCostSum=0;
function updatePerformance(frameCost,renderCost){
  fpsFrames++;
  frameCostSum+=frameCost;renderCostSum+=renderCost;
  const now=performance.now(),elapsed=now-lastFpsTime;
  if(elapsed<1000)return;
  const fps=Math.round(fpsFrames*1000/elapsed);
  fpsValue.textContent=fps;
  fpsCounter.title=`Кадр ${Math.round(frameCostSum/fpsFrames)} мс · рендер ${Math.round(renderCostSum/fpsFrames)} мс · ${renderer.info.render.calls} викликів · ${Math.round(renderer.info.render.triangles/1000)} тис. трикутників · якість ${qualityLevel+1}/4`;
  fpsCounter.classList.toggle('fps-low',fps<45);
  fpsCounter.classList.toggle('fps-mid',fps>=45&&fps<55);
  fpsFrames=0;frameCostSum=renderCostSum=0;lastFpsTime=now;
  if(document.hidden)return;
  slowWindows=fps<56?slowWindows+1:0;
  fastWindows=fps>=59?fastWindows+1:0;
  let next=qualityLevel;
  if(slowWindows>=2&&now-lastQualityChange>3000)next=Math.min(qualityLevel+1,qualityLevels.length-1);
  else if(fastWindows>=18&&now-lastQualityChange>18000)next=Math.max(qualityLevel-1,0);
  if(next!==qualityLevel){
    qualityLevel=next;renderer.setPixelRatio(qualityLevels[next].pixelRatio);
    const shadowSize=qualityLevels[next].shadow;
    sun.shadow.mapSize.set(shadowSize,shadowSize);
    sun.shadow.map?.setSize(shadowSize,shadowSize);
    lastGrassX=lastPropsX=999;lastQualityChange=now;slowWindows=fastWindows=0;
  }
}
function loop(){
  requestAnimationFrame(loop);const frameStart=performance.now(),dt=Math.min(clock.getDelta(),.045),running=keys.has('ShiftLeft')||keys.has('ShiftRight')||touchRun;
  if(document.hidden){fpsFrames=0;lastFpsTime=frameStart;return}
  const f=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0)+touchMove.y;
  const r=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0)+touchMove.x;
  if(driving){
    const previousYaw=carState.yaw;
    const throttle=THREE.MathUtils.clamp(f,-1,1);
    const steer=THREE.MathUtils.clamp(r,-1,1);
    stepVehicle(carState,{throttle,steer,boost:running,handbrake:keys.has('Space'),road:Math.abs(carState.x-pathX(carState.z))<2.7},dt,groundHeight,vehicleObstacles);
    yaw+=Math.atan2(Math.sin(carState.yaw-previousYaw),Math.cos(carState.yaw-previousYaw));
    updateCarVisual();
    speedValue.textContent=Math.round(carState.speed*3.6);
    gearValue.textContent=carState.longitudinalSpeed < -.5?'R':carState.longitudinalSpeed>.5?'D':'N';
    nitroValue.textContent=`${Math.round(carState.nitro*100)}%`;
    nitroFill.style.width=`${carState.nitro*100}%`;
    speedometer.classList.toggle('boosting',carState.boosting);
  }else{
    tmpForward.set(-Math.sin(yaw),0,-Math.cos(yaw));tmpRight.set(Math.cos(yaw),0,-Math.sin(yaw));
    desired.copy(tmpForward).multiplyScalar(f).addScaledVector(tmpRight,r);const moving=desired.lengthSq()>.005;if(moving)desired.normalize();
    const targetSpeed=moving?(running?8.9:4.5):0;player.speed=THREE.MathUtils.damp(player.speed,targetSpeed,moving?8:11,dt);
    if(moving){player.pos.addScaledVector(desired,player.speed*dt);const h=Math.atan2(-desired.x,-desired.z);player.heading+=Math.atan2(Math.sin(h-player.heading),Math.cos(h-player.heading))*Math.min(1,dt*12)}
    const ground=groundHeight(player.pos.x,player.pos.z);
    if(!player.grounded){player.velY-=19*dt;player.pos.y+=player.velY*dt;if(player.pos.y<=ground){player.pos.y=ground;player.velY=0;player.grounded=true}}else player.pos.y=ground;
    playerRoot.position.copy(player.pos);playerRoot.rotation.y=player.heading;
    shadowDisk.position.set(player.pos.x,ground-.04,player.pos.z);shadowDisk.material.opacity=.18*Math.max(.25,1-(player.pos.y-ground)*.18);
    changeAction(player.grounded?(player.speed>6?'Run':player.speed>.7?'Walk':'Idle'):'Idle');
    if(mixer)mixer.update(dt*(player.speed>6?1.1:1));
  }
  const actor=driving?carRoot.position:player.pos;
  const target=new THREE.Vector3(actor.x,actor.y+(driving?1.55:1.45),actor.z);
  const horizontal=Math.cos(pitch)*distance;
  const desiredYaw=yaw+(keys.has('KeyC')?Math.PI:0);
  const followRate=driving&&!keys.has('KeyC')?5.2:12;
  cameraYaw+=Math.atan2(Math.sin(desiredYaw-cameraYaw),Math.cos(desiredYaw-cameraYaw))*(1-Math.exp(-dt*followRate));
  const desiredCam=new THREE.Vector3(target.x+Math.sin(cameraYaw)*horizontal,target.y+Math.sin(pitch)*distance+1.15,target.z+Math.cos(cameraYaw)*horizontal);
  const minCamY=groundHeight(desiredCam.x,desiredCam.z)+.7;desiredCam.y=Math.max(desiredCam.y,minCamY);
  camera.position.lerp(desiredCam,1-Math.exp(-dt*6));
  camera.position.y=Math.max(camera.position.y,groundHeight(camera.position.x,camera.position.z)+.55);
  const targetFov=driving?(carState.boosting?75:67+Math.min(3,carState.speed*.09)):67;
  const nextFov=THREE.MathUtils.damp(camera.fov,targetFov,5,dt);
  if(Math.abs(nextFov-camera.fov)>.01){camera.fov=nextFov;camera.updateProjectionMatrix()}
  camera.lookAt(target);
  cameraBank=THREE.MathUtils.damp(cameraBank,driving?THREE.MathUtils.clamp(-carState.lateralAcceleration*.005,-.035,.035):0,4,dt);
  camera.rotateZ(cameraBank);
  sky.position.copy(actor);
  sun.position.set(actor.x-85,actor.y+145,actor.z-110);sun.target.position.copy(actor);sun.target.updateMatrixWorld();
  const cx=Math.round(actor.x/CHUNK),cz=Math.round(actor.z/CHUNK);
  if(cx!==lastChunkX||cz!==lastChunkZ){syncChunks(actor.x,actor.z);lastChunkX=cx;lastChunkZ=cz}
  const gx=Math.round(actor.x/GRASS_STEP),gz=Math.round(actor.z/GRASS_STEP);
  if(gx!==lastGrassX||gz!==lastGrassZ){updateGrass(actor.x,actor.z);lastGrassX=gx;lastGrassZ=gz}
  const px=Math.round(actor.x/150),pz=Math.round(actor.z/150);
  if(px!==lastPropsX||pz!==lastPropsZ){makeProps(actor.x,actor.z);lastPropsX=px;lastPropsZ=pz}
  coords.textContent=`X ${Math.round(actor.x)} · Z ${Math.round(actor.z)}`;
  const area=Math.abs(actor.x)>170?'ПЕРЕДГІР’Я':forestValue(actor.x,actor.z)>.28?'ЛІСОВИЙ КРАЙ':'ПІВДЕННА ДОЛИНА';
  loc.textContent=`${area} · ${driving?'ПОЇЗДКА':'ВІЛЬНА ПРОГУЛЯНКА'}`;
  const nearby=!driving&&carDistance()<3.7;
  vehicleHint.classList.toggle('visible',driving||nearby);
  vehicleHint.textContent=driving?(carState.speed>2.5?'А / F — вийти після зупинки · Shift — нітро':'А / F — вийти · Shift — нітро'):nearby?'А / F — сісти в машину':'';
  if(!driving)jumpButton.textContent=nearby?'СІСТИ':'СТРИБОК';
  const renderStart=performance.now();renderer.render(scene,camera);
  updatePerformance(performance.now()-frameStart,performance.now()-renderStart);
}

async function start(){
  try{
    const [soldier,pines,rocks,car]=await Promise.all([
      loadGLTF(asset('Soldier.glb')),
      loadGLTF(asset('pine_sapling_small/pine_sapling_small.gltf')),
      loadGLTF(asset('rock_moss_set_01/rock_moss_set_01.gltf')),
      loadGLTF(asset('CarConcept.glb'))
    ]);
    character=soldier.scene;character.scale.setScalar(.84);character.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});playerRoot.add(character);
    mixer=new THREE.AnimationMixer(character);
    for(const clip of soldier.animations)if(['Idle','Walk','Run'].includes(clip.name))actions[clip.name]=mixer.clipAction(clip);
    actions.Idle?.play();
    pines.scene.children.forEach(o=>{if(o.isMesh||o.children.some(c=>c.isMesh))treeTemplates.push(o)});
    rocks.scene.children.forEach(o=>{if(o.isMesh||o.children.some(c=>c.isMesh))rockTemplates.push(o)});
    prepareCar(car);
    syncChunks(player.pos.x,player.pos.z);updateGrass(player.pos.x,player.pos.z);makeProps(player.pos.x,player.pos.z);
    lastChunkX=Math.round(player.pos.x/CHUNK);lastChunkZ=Math.round(player.pos.z/CHUNK);
    lastGrassX=Math.round(player.pos.x/GRASS_STEP);lastGrassZ=Math.round(player.pos.z/GRASS_STEP);
    lastPropsX=Math.round(player.pos.x/150);lastPropsZ=Math.round(player.pos.z/150);
    loading.classList.add('hidden');loop();
  }catch(error){console.error(error);document.querySelector('.loading-inner p').textContent='ПОМИЛКА ЗАВАНТАЖЕННЯ. ОНОВІТЬ СТОРІНКУ.'}
}
window.addEventListener('resize',()=>{camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix();renderer.setSize(window.innerWidth,window.innerHeight);renderer.setPixelRatio(qualityLevels[qualityLevel].pixelRatio)});
start();

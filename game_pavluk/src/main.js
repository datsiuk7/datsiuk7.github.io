import * as THREE from 'three';
import './style.css';

const $ = (id) => document.getElementById(id);
const canvas = $('game');
const overlay = $('overlay');
const jumpButton = $('jump-button');
const progressFill = $('progress-fill');

const LEVELS = [
  { name: 'НЕБЕСНИЙ САД', title: 'Стрибок у хмари', sky: '#b9eef4', haze: '#eaffed', cloud: 0xffffff, tint: 0xdaf8f4, accent: 0x63c9a9, speed: 3.0, ys: [0,.18,.04,.36,.16,.46,.25,.53,.36,.60] },
  { name: 'СОНЯЧНА СТЕЖКА', title: 'За золотою зіркою', sky: '#ffd8aa', haze: '#fff1c8', cloud: 0xfffcf2, tint: 0xffe7cd, accent: 0xffbd67, speed: 3.2, ys: [0,.22,.46,.17,.50,.23,.57,.31,.63,.42] },
  { name: 'ДРАКОНОВІ СНИ', title: 'Ще п’ять хвилинок!', sky: '#b9bef5', haze: '#e9ddff', cloud: 0xfffaff, tint: 0xe9ddff, accent: 0xb59eea, speed: 3.4, ys: [0,.28,.07,.39,.16,.52,.32,.64,.38,.69] },
];

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
} catch (error) {
  $('overlay-title').innerHTML = 'Не вдалося<br><em>запустити гру</em>';
  $('overlay-text').textContent = 'Для цієї гри потрібен браузер із підтримкою WebGL.';
  $('primary-button').style.display = 'none';
  throw error;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.18;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, 1, .1, 250);
const ambient = new THREE.HemisphereLight(0xffffff, 0x91c6c0, 1.65);
scene.add(ambient);
const sunLight = new THREE.DirectionalLight(0xffffff, 1.6);
sunLight.position.set(-5, 13, 12);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(1024, 1024);
sunLight.shadow.camera.left = -18;
sunLight.shadow.camera.right = 18;
sunLight.shadow.camera.top = 15;
sunLight.shadow.camera.bottom = -12;
sunLight.shadow.bias = -.0002;
scene.add(sunLight);

const world = new THREE.Group();
scene.add(world);
const distant = new THREE.Group();
scene.add(distant);
const effects = new THREE.Group();
scene.add(effects);
const smooth = (a,b,t) => a + (b-a)*Math.min(1,t);

const sphereGeo = new THREE.SphereGeometry(1, 18, 12);
const smallSphereGeo = new THREE.SphereGeometry(1, 12, 8);
const mats = {
  white: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .9 }),
  plum: new THREE.MeshStandardMaterial({ color: 0x9d8ace, roughness: .64 }),
  plumLight: new THREE.MeshStandardMaterial({ color: 0xc5b5e8, roughness: .72 }),
  pink: new THREE.MeshStandardMaterial({ color: 0xf3a7bd, roughness: .72 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x514568, roughness: .8 }),
  cream: new THREE.MeshStandardMaterial({ color: 0xffecd6, roughness: .8 }),
  gold: new THREE.MeshStandardMaterial({ color: 0xffca58, metalness: .14, roughness: .32, emissive: 0xff9900, emissiveIntensity: .27 }),
};

function ellipsoid(parent, material, x,y,z, sx,sy,sz, geometry=sphereGeo) {
  const m = new THREE.Mesh(geometry,material);
  m.position.set(x,y,z);
  m.scale.set(sx,sy,sz);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

function makeCloud(x,y,width,level,index) {
  const g = new THREE.Group();
  g.position.set(x,y,0);
  const base = new THREE.MeshStandardMaterial({color:level.cloud,roughness:.94});
  const shade = new THREE.MeshStandardMaterial({color:level.tint,roughness:.95});
  ellipsoid(g,shade,0,-.10,0,width*.50,.38,.98);
  ellipsoid(g,base,-width*.30,.06,.04,width*.25,.39,.75);
  ellipsoid(g,base,-width*.03,.12,-.08,width*.31,.48,.85);
  ellipsoid(g,base,width*.27,.04,.05,width*.25,.38,.72);
  ellipsoid(g,base,0,.14,.27,width*.40,.30,.72);
  // Tiny trailing puff gives every platform its own silhouette.
  ellipsoid(g,shade,width*.45,-.07,-.14,.35,.22,.42,smallSphereGeo);
  if(index%3===1){
    const drop = new THREE.Mesh(new THREE.ConeGeometry(.15,.42,7),new THREE.MeshStandardMaterial({color:level.accent,roughness:.65}));
    drop.position.set(-.56,-.57,.42);drop.rotation.z=Math.PI;g.add(drop);
  }
  world.add(g);
  return {x,y,width,top:y+.42,group:g};
}

function starGeometry() {
  const shape = new THREE.Shape();
  const outer=.48, inner=.23;
  for(let i=0;i<10;i++){
    const a=Math.PI/2+i*Math.PI/5;
    const r=i%2 ? inner:outer;
    const x=Math.cos(a)*r,y=Math.sin(a)*r;
    if(i===0)shape.moveTo(x,y);else shape.lineTo(x,y);
  }
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape,{depth:.12,bevelEnabled:true,bevelThickness:.055,bevelSize:.05,bevelSegments:2,steps:1});
}
const starGeo = starGeometry();
function makeStar(x,y,z=1.05) {
  const g = new THREE.Group();
  g.position.set(x,y,z);
  const mesh = new THREE.Mesh(starGeo,mats.gold);
  mesh.castShadow = true;
  g.add(mesh);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(.55,12,8),new THREE.MeshBasicMaterial({color:0xffe997,transparent:true,opacity:.12,depthWrite:false}));
  halo.scale.set(1,1,.25);g.add(halo);
  world.add(g);
  return {group:g,x,y,collected:false,baseY:y};
}

function makeDragon() {
  const g = new THREE.Group();
  const wingMat = new THREE.MeshStandardMaterial({color:0xb08edd,roughness:.67,side:THREE.DoubleSide});
  ellipsoid(g,mats.plum,0,.65,0,1.02,.67,.65);
  ellipsoid(g,mats.cream,.39,.49,.54,.54,.44,.13);
  ellipsoid(g,mats.plum,.70,1.07,.02,.67,.56,.57);
  ellipsoid(g,mats.plumLight,1.13,.82,.35,.46,.29,.35);
  ellipsoid(g,mats.pink,1.30,.88,.64,.085,.06,.08,smallSphereGeo);
  ellipsoid(g,mats.plum,-.74,.57,-.08,.76,.27,.29);
  ellipsoid(g,mats.pink,-1.34,.56,-.06,.16,.14,.17);
  for(const dx of [-.44,.43]){
    const foot=ellipsoid(g,mats.plumLight,dx,.03,.38,.30,.18,.33);
    foot.rotation.y=.2;
  }
  for(const [x,z] of [[.46,-.33],[.84,-.36]]){
    const horn=new THREE.Mesh(new THREE.ConeGeometry(.19,.43,9),mats.cream);
    horn.position.set(x,1.67,z);horn.rotation.z=-.26;g.add(horn);
  }
  // A pair of closed, smiling eyes.
  const eyeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(.82,1.17,.54),new THREE.Vector3(.99,1.10,.60),new THREE.Vector3(1.16,1.16,.55)
  ]);
  const eye = new THREE.Mesh(new THREE.TubeGeometry(eyeCurve,12,.027,6,false),mats.dark);g.add(eye);
  const mouthCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(1.10,.73,.61),new THREE.Vector3(1.29,.68,.60),new THREE.Vector3(1.43,.75,.47)
  ]);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(mouthCurve,12,.018,6,false),mats.dark));
  const wingShape = new THREE.Shape();
  wingShape.moveTo(-.22,.1);wingShape.bezierCurveTo(-.58,.87,-1.44,1.1,-1.37,.37);wingShape.bezierCurveTo(-1.04,.57,-.89,.06,-.63,.32);wingShape.bezierCurveTo(-.38,-.01,-.24,-.02,-.22,.1);
  const wingGeom = new THREE.ShapeGeometry(wingShape,10);
  const wing = new THREE.Mesh(wingGeom,wingMat);wing.position.set(-.05,.78,-.54);wing.rotation.y=-.12;g.add(wing);
  const wing2=wing.clone();wing2.position.z=-.69;wing2.scale.set(.7,.7,.7);g.add(wing2);
  const sleepCanvas=document.createElement('canvas');sleepCanvas.width=256;sleepCanvas.height=128;
  const ctx=sleepCanvas.getContext('2d');ctx.fillStyle='#7568a4';ctx.font='bold 82px Nunito, sans-serif';ctx.fillText('z z Z',12,85);
  const zTex=new THREE.CanvasTexture(sleepCanvas);zTex.colorSpace=THREE.SRGBColorSpace;
  const zSprite=new THREE.Sprite(new THREE.SpriteMaterial({map:zTex,transparent:true,depthWrite:false}));
  zSprite.scale.set(2.0,1.0,1);zSprite.position.set(.10,2.15,-.2);g.add(zSprite);
  scene.add(g);
  return {group:g,wing,zSprite};
}
const dragon=makeDragon();

const characterTexture=new THREE.TextureLoader().load(`${import.meta.env.BASE_URL}assets/pavlyk-frog.png`);
characterTexture.colorSpace=THREE.SRGBColorSpace;
characterTexture.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);
const character=new THREE.Sprite(new THREE.SpriteMaterial({map:characterTexture,transparent:true,alphaTest:.03,depthWrite:false}));
character.scale.set(1.78,2.67,1);
scene.add(character);
const characterShadow=new THREE.Mesh(new THREE.CircleGeometry(.54,24),new THREE.MeshBasicMaterial({color:0x389b9a,transparent:true,opacity:.20,depthWrite:false,side:THREE.DoubleSide}));
characterShadow.rotation.x=-Math.PI/2;
scene.add(characterShadow);

let levelIndex=0;
let platforms=[];
let stars=[];
let portal;
let progressEnd=1;
let state='intro';
let score=0;
let levelScore=0;
let time=0;
let prevTime=performance.now();
let toastTimer;
let titleTimer;
let audioContext;
let soundOn=true;
const player={x:-.7,y:0,vy:0,grounded:true,coyote:.1,jumpBuffer:0};
const particles=[];

function makePortal(x,y,color) {
  const g=new THREE.Group();g.position.set(x,y,0);
  const ringMat=new THREE.MeshStandardMaterial({color,metalness:.06,roughness:.27,emissive:color,emissiveIntensity:.33});
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.89,.15,12,40),ringMat);
  ring.rotation.y=.13;ring.position.y=1.37;ring.castShadow=true;g.add(ring);
  const inner=new THREE.Mesh(new THREE.CircleGeometry(.75,32),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.19,side:THREE.DoubleSide,depthWrite:false}));
  inner.position.set(0,1.37,-.08);g.add(inner);
  for(let i=0;i<8;i++){
    const s=new THREE.Mesh(new THREE.OctahedronGeometry(.055+i%2*.025),mats.gold);
    const a=i*Math.PI/4;s.position.set(Math.cos(a)*1.18,1.37+Math.sin(a)*1.18,.1);g.add(s);
  }
  world.add(g);return {group:g,ring};
}

function addBackground(level) {
  const bgMat=new THREE.MeshStandardMaterial({color:level.haze,roughness:1,transparent:true,opacity:.72,depthWrite:false});
  for(let i=0;i<23;i++){
    const x=-13+i*3.3;
    const y=1.5+(i*7%9)*.84;
    const z=-9-(i%4)*2;
    const g=new THREE.Group();g.position.set(x,y,z);
    ellipsoid(g,bgMat,0,0,0,.65+(i%4)*.24,.23+(i%3)*.08,.28);
    ellipsoid(g,bgMat,-.48,.02,0,.37,.21,.27);
    ellipsoid(g,bgMat,.44,-.03,0,.39,.18,.28);
    distant.add(g);
  }
  const sunMat=new THREE.MeshBasicMaterial({color:levelIndex===2?0xffebdd:0xfff1b8,transparent:true,opacity:.75,depthWrite:false});
  const sun=new THREE.Mesh(new THREE.SphereGeometry(2.6,28,20),sunMat);
  sun.position.set(12,7,-26);distant.add(sun);
  const glow=new THREE.Mesh(new THREE.SphereGeometry(3.7,28,20),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.12,depthWrite:false}));
  glow.position.copy(sun.position);distant.add(glow);
}

function loadLevel(index) {
  levelIndex=index;
  const level=LEVELS[index];
  world.clear();distant.clear();effects.clear();particles.length=0;
  document.body.style.background=`linear-gradient(180deg, ${level.sky} 0%, ${level.haze} 100%)`;
  platforms=level.ys.map((y,i)=>makeCloud(i*4.2,y,i===0||i===level.ys.length-1?3.35:3.10,level,i));
  stars=platforms.slice(1).map((p,i)=>makeStar(p.x+(i%3===1?.25:0),p.top+1.55));
  progressEnd=platforms[platforms.length-1].x+1.0;
  const last=platforms[platforms.length-1];
  portal=makePortal(last.x+.45,last.top-.30,level.accent);
  addBackground(level);
  player.x=.15;player.y=platforms[0].top;player.vy=0;player.grounded=true;player.coyote=.12;player.jumpBuffer=0;
  dragon.group.scale.setScalar(window.innerWidth<700?.72:1);
  dragon.group.position.set(window.innerWidth<700?player.x-2.15:-6.1,platforms[0].top-.55,-.65);
  character.position.set(player.x,player.y+1.31,1.1);
  $('level-number').textContent=String(index+1).padStart(2,'0');
  $('level-kicker').textContent=`РІВЕНЬ ${index+1} · ${level.name}`;
  $('level-title').textContent=level.title;
  $('level-info').classList.remove('hidden');
  clearTimeout(titleTimer);
  if(state==='playing')titleTimer=setTimeout(()=>$('level-info').classList.add('hidden'),3600);
  levelScore=0;
  progressFill.style.width='0%';
  const ahead=window.innerWidth<700?.7:2.25;
  camera.position.set(player.x+ahead,5.8,window.innerWidth<700?19.5:14.3);
  camera.lookAt(player.x+ahead,1.55,0);
}

function showOverlay(eyebrow,title,body,button,foot) {
  $('overlay-eyebrow').textContent=eyebrow;
  $('overlay-title').innerHTML=title;
  $('overlay-text').textContent=body;
  $('primary-button').innerHTML=`${button} <span>→</span>`;
  $('overlay-foot').textContent=foot;
  overlay.classList.add('visible');
}
function hideOverlay(){overlay.classList.remove('visible')}
function showToast(message){
  const toast=$('toast');toast.textContent=message;toast.classList.add('show');clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>toast.classList.remove('show'),1350);
}
function tone(freq,duration=.12,type='sine',volume=.08,delay=0){
  if(!soundOn)return;
  try{
    audioContext ||= new (window.AudioContext||window.webkitAudioContext)();
    if(audioContext.state==='suspended')audioContext.resume();
    const osc=audioContext.createOscillator();const gain=audioContext.createGain();
    const at=audioContext.currentTime+delay;
    osc.type=type;osc.frequency.setValueAtTime(freq,at);
    osc.frequency.exponentialRampToValueAtTime(freq*1.18,at+duration);
    gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(volume,at+.012);
    gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
    osc.connect(gain).connect(audioContext.destination);osc.start(at);osc.stop(at+duration+.01);
  }catch{}
}

function jump(){
  if(state==='ready')state='playing';
  if(state!=='playing')return;
  player.jumpBuffer=.16;
  jumpButton.classList.add('pressed');setTimeout(()=>jumpButton.classList.remove('pressed'),140);
}
function start(){
  if(state==='won'){score=0;$('star-count').textContent='0';loadLevel(0)}
  if(state==='lost')loadLevel(levelIndex);
  state='ready';hideOverlay();
  $('level-info').classList.remove('hidden');
  clearTimeout(titleTimer);titleTimer=setTimeout(()=>$('level-info').classList.add('hidden'),3600);
  $('tip').classList.remove('hidden');setTimeout(()=>$('tip').classList.add('hidden'),5500);
  tone(440,.10);tone(660,.18,'sine',.07,.11);
}
function fail(){
  if(state!=='playing')return;
  state='lost';
  tone(280,.28,'triangle',.08);tone(190,.31,'triangle',.06,.22);
  showOverlay('ДРАКОН УЖЕ ПОЗІХАЄ','Ой, <em>хмаринка!</em>','Павлик промахнувся, а дракон майже наздогнав його. Спробуй ще раз — зірочки залишаються з тобою!','Ще раз',`Рівень ${levelIndex+1} з 3 · Зірочки: ${score}`);
}
function finish(){
  if(state!=='playing')return;
  tone(523,.13);tone(659,.15,'sine',.07,.11);tone(784,.2,'sine',.08,.22);
  if(levelIndex<2){
    state='between';
    showOverlay('РІВЕНЬ ПРОЙДЕНО','Ура, <em>Павлику!</em>',`Зібрано ${levelScore} зірочок на цьому рівні! Попереду ще більше хмар і сонний дракон.`,`Рівень ${levelIndex+2}`,`Загалом зірочок: ${score}`);
  }else{
    state='won';
    showOverlay('УСІ ТРИ РІВНІ ПРОЙДЕНО','Ти — <em>зірка!</em>',`Павлик зібрав ${score} зірочок, а дракон нарешті пішов досипати свої п’ять хвилинок.`,`Грати знову`,'Дякуємо за пригоду в хмарах ✦');
  }
}
function beginNext(){loadLevel(levelIndex+1);state='ready';hideOverlay();titleTimer=setTimeout(()=>$('level-info').classList.add('hidden'),3600)}

function burst(x,y,color=0xffd26d){
  const mat=new THREE.MeshBasicMaterial({color,transparent:true,opacity:1,depthWrite:false});
  for(let i=0;i<8;i++){
    const mesh=new THREE.Mesh(new THREE.OctahedronGeometry(.055+i%3*.025),mat.clone());
    mesh.position.set(x,y,1.25);effects.add(mesh);
    const a=i*Math.PI/4+Math.random()*.2;
    particles.push({mesh,vx:Math.cos(a)*(1.2+Math.random()),vy:Math.sin(a)*(1.2+Math.random()),life:.55+Math.random()*.3,max:.85});
  }
}

function update(dt){
  time+=dt;
  for(const s of stars){
    if(!s.collected){s.group.position.y=s.baseY+Math.sin(time*3+s.x)*.12;s.group.rotation.y=time*1.7;s.group.rotation.z=Math.sin(time*2+s.x)*.12}
  }
  portal.ring.rotation.y=Math.sin(time*1.4)*.22;
  dragon.wing.rotation.y=Math.sin(time*5)*.14;
  dragon.zSprite.material.opacity=.55+Math.sin(time*3)*.28;
  for(let i=particles.length-1;i>=0;i--){
    const p=particles[i];p.life-=dt;p.mesh.position.x+=p.vx*dt;p.mesh.position.y+=p.vy*dt;p.vy-=2.6*dt;
    p.mesh.material.opacity=Math.max(0,p.life/p.max);
    if(p.life<=0){effects.remove(p.mesh);p.mesh.geometry.dispose();p.mesh.material.dispose();particles.splice(i,1)}
  }
  if(state==='playing'){
    const prevY=player.y;
    player.x+=LEVELS[levelIndex].speed*dt;
    player.jumpBuffer=Math.max(0,player.jumpBuffer-dt);
    player.coyote=Math.max(0,player.coyote-dt);
    if(player.jumpBuffer>0&&(player.grounded||player.coyote>0)){
      player.vy=8.7;player.grounded=false;player.coyote=0;player.jumpBuffer=0;
      tone(375,.12,'sine',.065);tone(530,.14,'sine',.045,.055);
      burst(player.x,player.y+.22,0xffffff);
    }
    if(!player.grounded){player.vy-=18.4*dt;player.y+=player.vy*dt}
    let supported=false;
    for(const platform of platforms){
      if(Math.abs(player.x-platform.x)<platform.width*.5-.06){
        if(player.grounded&&Math.abs(player.y-platform.top)<.11){supported=true;break}
        if(player.vy<=0&&prevY>=platform.top-.08&&player.y<=platform.top){
          player.y=platform.top;player.vy=0;player.grounded=true;player.coyote=.12;supported=true;
          break;
        }
      }
    }
    if(player.grounded&&!supported){player.grounded=false;player.coyote=.13}
    for(const s of stars){
      if(!s.collected&&Math.abs(player.x-s.x)<.63&&Math.abs(player.y+1.32-s.group.position.y)<1.02){
        s.collected=true;world.remove(s.group);score++;levelScore++;
        $('star-count').textContent=score;
        tone(720,.12,'sine',.075);tone(1080,.17,'sine',.05,.08);
        burst(s.x,s.group.position.y);
        if(levelScore===3||levelScore===6)showToast('✦ Чудово! + зірочка');
      }
    }
    if(player.y<-4.0){fail()}
    if(player.x>progressEnd&&player.y>platforms[platforms.length-1].top-1.2){finish()}
    progressFill.style.width=`${Math.max(0,Math.min(100,player.x/progressEnd*100))}%`;
  }
  character.position.set(player.x,player.y+1.32+(!player.grounded?Math.sin(time*12)*.035:Math.sin(time*9)*.025),1.1);
  character.material.rotation=player.grounded?Math.sin(time*9)*.025:-.06;
  characterShadow.position.set(player.x,Math.max(-3,platforms.find(p=>Math.abs(player.x-p.x)<p.width*.5)?.top||0)+.03,.85);
  characterShadow.material.opacity=player.grounded?.18:.08;
  const dragonTargetX=window.innerWidth<700?player.x-2.15:state==='intro'?-6.1:Math.max(-6.1,player.x-5.9+Math.sin(time*.6)*.35);
  dragon.group.position.x=smooth(dragon.group.position.x,dragonTargetX,dt*2.8);
  dragon.group.position.y=smooth(dragon.group.position.y,player.y-.42+Math.sin(time*3)*.1,dt*2);
  const camX=player.x+(window.innerWidth<700?.7:2.25);
  camera.position.x=smooth(camera.position.x,camX,dt*3.8);
  camera.position.y=smooth(camera.position.y,Math.max(player.y,0)+5.55,dt*2.2);
  camera.lookAt(camera.position.x,Math.max(player.y,0)+1.12,0);
  distant.position.x=camera.position.x*.28;
}

function resize(){
  const width=window.innerWidth,height=window.innerHeight;
  renderer.setSize(width,height,false);camera.aspect=width/height;
  camera.fov=width<700?52:40;
  camera.position.z=width<700?19.5:14.3;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize',resize);

$('primary-button').addEventListener('click',()=>{if(state==='between')beginNext();else start()});
jumpButton.addEventListener('pointerdown',(e)=>{e.preventDefault();jump()});
canvas.addEventListener('pointerdown',jump);
window.addEventListener('keydown',(e)=>{
  if(['Space','ArrowUp','KeyW'].includes(e.code)){
    e.preventDefault();if(e.repeat)return;
    if(state==='playing'||state==='ready')jump();else if(state==='intro'||state==='lost'||state==='won')start();else if(state==='between')beginNext();
  }
});
$('sound-button').addEventListener('click',()=>{
  soundOn=!soundOn;$('sound-button').classList.toggle('muted',!soundOn);
  $('sound-button').textContent=soundOn?'♪':'×';
  $('sound-button').setAttribute('aria-label',soundOn?'Вимкнути звук':'Увімкнути звук');
  if(soundOn)tone(620,.13);
});

loadLevel(0);resize();
function frame(now){
  const dt=Math.min((now-prevTime)/1000,.033);prevTime=now;
  update(dt);renderer.render(scene,camera);requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

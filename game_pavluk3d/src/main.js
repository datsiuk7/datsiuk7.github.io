import * as THREE from 'three';
import { LEVELS } from './levels.js';
import { createLevel, groundAt, animateWorld, unlockPortal } from './world.js';
import { createCharacter, animateCharacter } from './character.js';
import { createDragon, animateDragon } from './dragon.js';
import './style.css';

const $=(id)=>document.getElementById(id);
const canvas=$('game');
const overlay=$('overlay');
const mapCanvas=$('minimap');
const mapCtx=mapCanvas.getContext('2d');
let renderer;
try{
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
}catch(error){
  $('overlay-title').innerHTML='Потрібен<br><em>WebGL</em>';
  $('overlay-text').textContent='Спробуй відкрити гру в сучасному браузері з підтримкою 3D графіки.';
  $('primary-btn').style.display='none';
  throw error;
}
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.8));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.25;
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;

const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(51,1,.1,250);
const ambient=new THREE.HemisphereLight(0xffffff,0x86a9c1,2.25);scene.add(ambient);
const sun=new THREE.DirectionalLight(0xffffff,2.15);
sun.position.set(-12,25,13);sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);
sun.shadow.camera.left=-30;sun.shadow.camera.right=30;
sun.shadow.camera.top=30;sun.shadow.camera.bottom=-30;
sun.shadow.camera.near=.5;sun.shadow.camera.far=90;
sun.shadow.bias=-.00025;scene.add(sun);

const portraitUrl=`${import.meta.env.BASE_URL}assets/pavlyk-frog.png`;
const avatar=createCharacter(portraitUrl);scene.add(avatar.group);
const dragon=createDragon();scene.add(dragon.group);
const shadow=new THREE.Mesh(new THREE.CircleGeometry(.56,28),new THREE.MeshBasicMaterial({color:0x237d70,transparent:true,opacity:.22,depthWrite:false,side:THREE.DoubleSide}));
shadow.rotation.x=-Math.PI/2;scene.add(shadow);
const particleGroup=new THREE.Group();scene.add(particleGroup);
const particles=[];

let world=null;
let levelIndex=0;
let levelStars=0;
let totalStars=0;
let hearts=3;
let state='intro';
let time=0;
let lastFrame=performance.now();
let dragonGrace=5;
let dragonAwake=false;
let toastTimeout;
let soundOn=true;
let audioContext;
let yaw=.66;
let pitch=.51;
let cameraDistance=14.5;
let dragging=false;
let dragPointer=null;
let dragX=0,dragY=0;
const keys=new Set();
const player={x:0,y:0,z:0,vx:0,vz:0,vy:0,grounded:true,coyote:.12,jumpBuffer:0,invulnerable:0,facing:.66};
const joystick={x:0,y:0,pointer:null};

function playTone(frequency,duration=.13,type='sine',volume=.07,delay=0){
  if(!soundOn)return;
  try{
    audioContext ||= new (window.AudioContext||window.webkitAudioContext)();
    if(audioContext.state==='suspended')audioContext.resume();
    const now=audioContext.currentTime+delay;
    const osc=audioContext.createOscillator(),gain=audioContext.createGain();
    osc.type=type;osc.frequency.setValueAtTime(frequency,now);
    osc.frequency.exponentialRampToValueAtTime(frequency*1.17,now+duration);
    gain.gain.setValueAtTime(.0001,now);
    gain.gain.exponentialRampToValueAtTime(volume,now+.015);
    gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
    osc.connect(gain).connect(audioContext.destination);osc.start(now);osc.stop(now+duration+.02);
  }catch{}
}
function toast(message){
  const el=$('toast');el.textContent=message;el.classList.add('show');
  clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>el.classList.remove('show'),1700);
}
function burst(x,y,z,color=0xffd06d,count=12){
  for(let i=0;i<count;i++){
    const material=new THREE.MeshBasicMaterial({color,transparent:true,opacity:1,depthWrite:false});
    const mesh=new THREE.Mesh(new THREE.OctahedronGeometry(.05+Math.random()*.055),material);
    mesh.position.set(x,y,z);particleGroup.add(mesh);
    const a=Math.random()*Math.PI*2;
    particles.push({mesh,vx:Math.cos(a)*(1.2+Math.random()*2),vy:1+Math.random()*2.5,vz:Math.sin(a)*(1.2+Math.random()*2),life:.65+Math.random()*.35,max:1});
  }
}
function updateParticles(dt){
  for(let i=particles.length-1;i>=0;i--){
    const p=particles[i];p.life-=dt;
    p.mesh.position.x+=p.vx*dt;p.mesh.position.y+=p.vy*dt;p.mesh.position.z+=p.vz*dt;
    p.vy-=5*dt;p.mesh.material.opacity=Math.max(0,p.life/p.max);
    if(p.life<=0){particleGroup.remove(p.mesh);p.mesh.geometry.dispose();p.mesh.material.dispose();particles.splice(i,1)}
  }
}
function clearParticles(){
  for(const p of particles){particleGroup.remove(p.mesh);p.mesh.geometry.dispose();p.mesh.material.dispose()}
  particles.length=0;
}
function showOverlay(kicker,title,text,button,footer){
  $('overlay-kicker').textContent=kicker;
  $('overlay-title').innerHTML=title;
  $('overlay-text').textContent=text;
  $('primary-btn').innerHTML=`${button} <span>→</span>`;
  $('overlay-footer').textContent=footer;
  overlay.classList.add('visible');
}
function hideOverlay(){overlay.classList.remove('visible')}
function updateHearts(){
  $('hearts').innerHTML=Array.from({length:3},(_,i)=>`<span class="${i<hearts?'':'empty'}">♥</span>`).join('');
  $('hearts').setAttribute('aria-label',`Здоров’я: ${hearts} з 3`);
}
function updateHud(){
  const level=LEVELS[levelIndex];
  $('level-name').textContent=`${String(levelIndex+1).padStart(2,'0')} / 03 · ${level.name}`;
  $('stars-count').textContent=levelStars;
  $('objective-text').textContent=levelStars===5?'Портал відкрито!':'Збери всі 5 зірочок';
  updateHearts();
}
function disposeWorld(){
  if(!world)return;
  scene.remove(world.group);
  const geometries=new Set(),materials=new Set();
  world.group.traverse(o=>{if(o.isMesh){geometries.add(o.geometry);if(Array.isArray(o.material))o.material.forEach(m=>materials.add(m));else materials.add(o.material)}});
  geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());
}
function cameraCoordinates(){
  const horizontal=cameraDistance*Math.cos(pitch),height=cameraDistance*Math.sin(pitch);
  return new THREE.Vector3(player.x+Math.sin(yaw)*horizontal,player.y+1.2+height,player.z+Math.cos(yaw)*horizontal);
}
function snapCamera(){
  camera.position.copy(cameraCoordinates());
  camera.lookAt(player.x,player.y+1.45,player.z);
}
function loadLevel(index){
  disposeWorld();clearParticles();
  levelIndex=index;levelStars=0;hearts=3;dragonGrace=7;dragonAwake=false;
  world=createLevel(LEVELS[index],index);scene.add(world.group);
  const spawn=LEVELS[index].spawn;
  player.x=spawn.x;player.z=spawn.z;player.y=world.platforms[0].top;
  player.vx=0;player.vz=0;player.vy=0;player.grounded=true;
  player.coyote=.12;player.jumpBuffer=0;player.invulnerable=0;player.facing=yaw;
  avatar.group.position.set(player.x,player.y,player.z);avatar.group.rotation.y=yaw;
  dragon.group.position.set(LEVELS[index].dragon.x,.5,LEVELS[index].dragon.z);
  snapCamera();updateHud();drawMap();
  sun.color.setHex(index===2?0xffe4f4:0xffffff);
  ambient.color.setHex(index===2?0xf1e9ff:0xffffff);
}
function startGame(){
  if(state==='won'||state==='intro'){
    totalStars=0;loadLevel(0);
  }else if(state==='lost'){
    totalStars=levelIndex*5;loadLevel(levelIndex);
  }
  state='playing';hideOverlay();
  playTone(440,.10);playTone(660,.18,'sine',.055,.12);
}
function nextLevel(){
  loadLevel(levelIndex+1);state='playing';hideOverlay();
  toast(LEVELS[levelIndex].subtitle);
}
function togglePause(){
  if(state==='playing'){
    state='paused';
    showOverlay('ПЕРЕПОЧИНОК','Пауза <em>в хмарах</em>','Дракон теж зупинився. Відпочинь і продовжуй дослідження островів.','Продовжити','Esc — продовжити · R — почати рівень спочатку');
  }else if(state==='paused'){
    state='playing';hideOverlay();
  }
}
function gameOver(){
  state='lost';
  playTone(285,.24,'triangle');playTone(190,.32,'triangle',.055,.19);
  showOverlay('ДРАКОН ЗАСНУВ НА ШЛЯХУ','Спробуй <em>ще раз!</em>','Павлик перепочине і повернеться на початок цього острова. Зірки попередніх рівнів залишаться з ним.','Повторити рівень',`Рівень ${levelIndex+1} із 3 · Зірок загалом: ${totalStars}`);
}
function finishLevel(){
  if(state!=='playing')return;
  playTone(523,.12);playTone(659,.14,'sine',.065,.11);playTone(784,.2,'sine',.075,.23);
  if(levelIndex<2){
    state='between';
    showOverlay('УСІ ЗІРКИ ЗІБРАНО','Острів <em>пройдено!</em>',`Павлик зібрав усі 5 зірочок і знайшов портал. Далі — ${LEVELS[levelIndex+1].name.toLowerCase()}.`,`Наступний острів`,`Зібрано ${totalStars} з 15 зірок`);
  }else{
    state='won';
    try{localStorage.setItem('pavlyk3d-best','15')}catch{}
    showOverlay('ТРИ ОСТРОВИ ПІДКОРЕНО','Павлик — <em>герой!</em>','Усі 15 зірок твої! Дракон нарешті може спокійно поспати ще п’ять хвилинок.','Грати знову','Дякуємо за пригоду у Світі Хмар ✦');
  }
}
function hurt(reason){
  if(player.invulnerable>0||state!=='playing')return;
  hearts--;player.invulnerable=2.1;
  $('damage-flash').classList.add('show');setTimeout(()=>$('damage-flash').classList.remove('show'),120);
  playTone(280,.20,'sawtooth',.045);
  updateHearts();
  if(hearts<=0){gameOver();return}
  toast(reason==='fall'?'☁ Обережно, край острова!':'🐉 Дракон майже схопив Павлика!');
  if(reason==='fall'){
    const spawn=LEVELS[levelIndex].spawn;
    player.x=spawn.x;player.z=spawn.z;player.y=world.platforms[0].top;
    player.vx=0;player.vz=0;player.vy=0;player.grounded=true;
    dragon.group.position.set(LEVELS[levelIndex].dragon.x,.5,LEVELS[levelIndex].dragon.z);
    dragonGrace=6;snapCamera();
  }else{
    const dx=player.x-dragon.group.position.x,dz=player.z-dragon.group.position.z;
    const d=Math.hypot(dx,dz)||1;
    player.vx=dx/d*6;player.vz=dz/d*6;player.vy=4.6;player.grounded=false;
    dragon.group.position.set(LEVELS[levelIndex].dragon.x,.5,LEVELS[levelIndex].dragon.z);
    dragonGrace=6;
  }
}
function jump(){
  if(state!=='playing')return;
  player.jumpBuffer=.16;
  $('jump-btn').classList.add('pressed');setTimeout(()=>$('jump-btn').classList.remove('pressed'),130);
}

function controlVector(){
  let x=joystick.x,y=joystick.y;
  if(keys.has('KeyA')||keys.has('ArrowLeft'))x-=1;
  if(keys.has('KeyD')||keys.has('ArrowRight'))x+=1;
  if(keys.has('KeyW')||keys.has('ArrowUp'))y+=1;
  if(keys.has('KeyS')||keys.has('ArrowDown'))y-=1;
  const length=Math.hypot(x,y);
  if(length>1){x/=length;y/=length}
  return {x,y};
}
function updatePlayer(dt){
  player.invulnerable=Math.max(0,player.invulnerable-dt);
  player.jumpBuffer=Math.max(0,player.jumpBuffer-dt);
  player.coyote=Math.max(0,player.coyote-dt);
  const input=controlVector();
  if(!dragonAwake&&Math.hypot(input.x,input.y)>.2){
    dragonAwake=true;dragonGrace=7;toast('🐉 Дракон прокидається!');
  }
  const sprint=keys.has('ShiftLeft')||keys.has('ShiftRight');
  const speed=sprint?7.3:5.55;
  const rightX=Math.cos(yaw),rightZ=-Math.sin(yaw);
  const forwardX=-Math.sin(yaw),forwardZ=-Math.cos(yaw);
  const desiredX=(rightX*input.x+forwardX*input.y)*speed;
  const desiredZ=(rightZ*input.x+forwardZ*input.y)*speed;
  const grip=Math.min(1,dt*(player.grounded?10:4.2));
  player.vx+=(desiredX-player.vx)*grip;
  player.vz+=(desiredZ-player.vz)*grip;
  if(player.jumpBuffer>0&&(player.grounded||player.coyote>0)){
    player.vy=8.9;player.grounded=false;player.coyote=0;player.jumpBuffer=0;
    burst(player.x,player.y+.12,player.z,0xffffff,9);
    playTone(380,.12,'sine',.055);playTone(560,.13,'sine',.04,.06);
  }
  const previousY=player.y;
  player.x+=player.vx*dt;player.z+=player.vz*dt;
  if(!player.grounded){player.vy-=19.6*dt;player.y+=player.vy*dt}
  const ground=groundAt(world.platforms,player.x,player.z);
  if(player.grounded){
    if(ground===null){player.grounded=false;player.coyote=.13}
    else player.y=ground;
  }else if(ground!==null&&player.vy<=0&&previousY>=ground-.08&&player.y<=ground){
    player.y=ground;player.vy=0;player.grounded=true;player.coyote=.13;
    burst(player.x,ground+.05,player.z,0xe6f9ef,6);
  }
  if(player.y<-11){hurt('fall');return}
  const moveSpeed=Math.hypot(player.vx,player.vz);
  if(moveSpeed>.25){
    const target=Math.atan2(player.vx,player.vz);
    let delta=(target-player.facing+Math.PI*3)%(Math.PI*2)-Math.PI;
    player.facing+=delta*Math.min(1,dt*12);
  }
  for(const star of world.stars){
    if(star.collected)continue;
    if(Math.hypot(player.x-star.x,player.z-star.z)<1.45&&Math.abs(player.y+1.5-star.group.position.y)<1.55){
      star.collected=true;world.group.remove(star.group);levelStars++;totalStars++;
      burst(star.x,star.y,star.z,0xffd05f,16);
      playTone(730,.12,'sine',.07);playTone(1080,.17,'sine',.05,.08);
      updateHud();toast(`✦ Зірочка! ${levelStars} / 5`);
      if(levelStars===5){unlockPortal(world.portal,LEVELS[levelIndex].accent);updateHud();setTimeout(()=>{if(state==='playing')toast('✦ Портал відкрито!')},1400)}
    }
  }
  const portal=LEVELS[levelIndex].portal;
  if(world.portal.unlocked&&Math.hypot(player.x-portal.x,player.z-portal.z)<1.1&&player.grounded)finishLevel();
}
function updateDragon(dt){
  if(state!=='playing'||!dragonAwake)return;
  // The sleepy dragon dozes off whenever Pavlyk stops to look around.
  if(Math.hypot(player.vx,player.vz)<.35)return;
  if(dragonGrace>0){dragonGrace-=dt;return}
  const dx=player.x-dragon.group.position.x,dz=player.z-dragon.group.position.z;
  const dist=Math.hypot(dx,dz);
  if(dist>.1){
    const speed=LEVELS[levelIndex].dragonSpeed;
    dragon.group.position.x+=dx/dist*speed*dt;
    dragon.group.position.z+=dz/dist*speed*dt;
    const target=Math.atan2(dx,dz);
    let d=(target-dragon.group.rotation.y+Math.PI*3)%(Math.PI*2)-Math.PI;
    dragon.group.rotation.y+=d*Math.min(1,dt*4);
  }
  const ground=groundAt(world.platforms,dragon.group.position.x,dragon.group.position.z);
  const targetY=(ground??Math.max(-.3,player.y))+.55;
  dragon.group.position.y+=(targetY-dragon.group.position.y)*Math.min(1,dt*2.3);
  if(dist<1.45&&Math.abs(player.y-dragon.group.position.y)<2.2)hurt('dragon');
}
function currentTarget(){
  if(levelStars===5)return {x:LEVELS[levelIndex].portal.x,z:LEVELS[levelIndex].portal.z,label:'Відкритий портал'};
  let nearest=null,best=Infinity;
  for(const s of world.stars){
    if(s.collected)continue;
    const d=Math.hypot(s.x-player.x,s.z-player.z);
    if(d<best){best=d;nearest=s}
  }
  return nearest?{x:nearest.x,z:nearest.z,label:'Найближча зірка'}:null;
}
function updateQuest(){
  const target=currentTarget();if(!target)return;
  const dx=target.x-player.x,dz=target.z-player.z;
  const right=dx*Math.cos(yaw)-dz*Math.sin(yaw);
  const forward=-dx*Math.sin(yaw)-dz*Math.cos(yaw);
  const angle=Math.atan2(right,forward)*180/Math.PI;
  $('quest-arrow').style.transform=`rotate(${angle}deg)`;
  $('quest-label').textContent=target.label;
  $('quest-distance').textContent=`${Math.round(Math.hypot(dx,dz))} м`;
}
function drawMap(){
  if(!world)return;
  const c=mapCtx;c.clearRect(0,0,144,144);
  const s=3.52,toX=x=>72+x*s,toY=z=>72+z*s;
  c.fillStyle='#eafaf4';c.beginPath();c.arc(72,72,69,0,Math.PI*2);c.fill();
  for(const p of world.platforms){
    c.beginPath();c.arc(toX(p.x),toY(p.z),p.r*s,0,Math.PI*2);
    c.fillStyle=p.kind==='cloud'?'#ffffff':p.kind==='portal'?'#b1f1db':'#9bdfb6';c.fill();
    c.strokeStyle='#83c7b7';c.lineWidth=1;c.stroke();
  }
  for(const star of world.stars){if(!star.collected){c.fillStyle='#fabb41';c.beginPath();c.arc(toX(star.x),toY(star.z),3.1,0,Math.PI*2);c.fill()}}
  const portal=LEVELS[levelIndex].portal;
  c.strokeStyle=world.portal.unlocked?'#26b996':'#a6b6b2';c.lineWidth=2.4;
  c.beginPath();c.arc(toX(portal.x),toY(portal.z),4.6,0,Math.PI*2);c.stroke();
  c.fillStyle='#26ae85';c.beginPath();c.arc(toX(player.x),toY(player.z),4.3,0,Math.PI*2);c.fill();
  c.strokeStyle='#ffffff';c.lineWidth=1.5;c.stroke();
  const nx=Math.sin(player.facing),nz=Math.cos(player.facing);
  c.strokeStyle='#146a62';c.lineWidth=2;c.beginPath();c.moveTo(toX(player.x),toY(player.z));c.lineTo(toX(player.x)+nx*8,toY(player.z)+nz*8);c.stroke();
}
function animate(dt){
  time+=dt;
  animateWorld(world,time,dt);
  updateParticles(dt);
  if(state==='playing'){
    updatePlayer(dt);updateDragon(dt);
    updateQuest();drawMap();
  }
  const moveAmount=Math.min(1,Math.hypot(player.vx,player.vz)/5.55);
  avatar.group.position.set(player.x,player.y,player.z);
  avatar.group.rotation.y=player.facing;
  animateCharacter(avatar,time,state==='playing'?moveAmount:0,player.grounded,player.vy,player.invulnerable);
  animateDragon(dragon,time);
  const ground=groundAt(world.platforms,player.x,player.z);
  shadow.visible=ground!==null&&player.y>ground-.2;
  if(shadow.visible){shadow.position.set(player.x,ground+.035,player.z);shadow.material.opacity=Math.max(.05,.22-(player.y-ground)*.04);shadow.scale.setScalar(1+Math.max(0,player.y-ground)*.2)}
  const cameraTarget=cameraCoordinates();
  camera.position.lerp(cameraTarget,Math.min(1,dt*4.8));
  camera.lookAt(player.x,Math.max(player.y,-1)+1.45,player.z);
}
function frame(now){
  const dt=Math.min((now-lastFrame)/1000,.033);lastFrame=now;
  animate(dt);renderer.render(scene,camera);requestAnimationFrame(frame);
}
function resize(){
  const width=innerWidth,height=innerHeight;
  renderer.setSize(width,height,false);
  camera.aspect=width/height;camera.fov=width<700?58:51;camera.updateProjectionMatrix();
}

// Keyboard, touch joystick, jump and camera orbit.
window.addEventListener('keydown',e=>{
  if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();
  if(e.code==='Escape'){togglePause();return}
  if(e.code==='KeyR'&&(state==='playing'||state==='paused')){totalStars=levelIndex*5;loadLevel(levelIndex);state='playing';hideOverlay();return}
  if(e.code==='Space'&&!e.repeat){
    if(state==='playing')jump();
    else if(state==='intro'||state==='lost'||state==='won')startGame();
    else if(state==='between')nextLevel();
  }
  keys.add(e.code);
});
window.addEventListener('keyup',e=>keys.delete(e.code));
window.addEventListener('blur',()=>{keys.clear();joystick.x=0;joystick.y=0;resetStick()});
$('jump-btn').addEventListener('pointerdown',e=>{e.preventDefault();jump()});
$('primary-btn').addEventListener('click',()=>{
  if(state==='between')nextLevel();else if(state==='paused')togglePause();else startGame();
});
$('pause-btn').addEventListener('click',togglePause);
$('sound-btn').addEventListener('click',()=>{
  soundOn=!soundOn;$('sound-btn').textContent=soundOn?'♪':'×';
  $('sound-btn').classList.toggle('muted',!soundOn);
  $('sound-btn').setAttribute('aria-label',soundOn?'Вимкнути звук':'Увімкнути звук');
  if(soundOn)playTone(620,.12);
});
canvas.addEventListener('pointerdown',e=>{
  if(e.button!==0||state!=='playing')return;
  dragging=true;dragPointer=e.pointerId;dragX=e.clientX;dragY=e.clientY;canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove',e=>{
  if(!dragging||e.pointerId!==dragPointer)return;
  const dx=e.clientX-dragX,dy=e.clientY-dragY;
  yaw-=dx*.006;pitch=Math.max(.25,Math.min(.85,pitch+dy*.0035));
  dragX=e.clientX;dragY=e.clientY;
});
function stopDrag(e){if(e.pointerId===dragPointer){dragging=false;dragPointer=null}}
canvas.addEventListener('pointerup',stopDrag);canvas.addEventListener('pointercancel',stopDrag);
canvas.addEventListener('wheel',e=>{e.preventDefault();cameraDistance=Math.max(9,Math.min(20,cameraDistance+Math.sign(e.deltaY)*.9))},{passive:false});

const joyEl=$('joystick'),stickEl=$('stick');
function resetStick(){stickEl.style.transform='translate(0px,0px)'}
function moveStick(e){
  const rect=joyEl.getBoundingClientRect();
  const dx=e.clientX-(rect.left+rect.width/2),dy=e.clientY-(rect.top+rect.height/2);
  const len=Math.hypot(dx,dy),max=41;
  const scale=len>max?max/len:1;
  const x=dx*scale,y=dy*scale;
  joystick.x=x/max;joystick.y=-y/max;
  stickEl.style.transform=`translate(${x}px,${y}px)`;
}
joyEl.addEventListener('pointerdown',e=>{e.preventDefault();joystick.pointer=e.pointerId;joyEl.setPointerCapture(e.pointerId);moveStick(e)});
joyEl.addEventListener('pointermove',e=>{if(e.pointerId===joystick.pointer)moveStick(e)});
function stopStick(e){if(e.pointerId===joystick.pointer){joystick.pointer=null;joystick.x=0;joystick.y=0;resetStick()}}
joyEl.addEventListener('pointerup',stopStick);joyEl.addEventListener('pointercancel',stopStick);
window.addEventListener('resize',resize);

loadLevel(0);resize();updateQuest();requestAnimationFrame(frame);

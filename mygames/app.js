import * as THREE from './vendor/three.module.js';
import { start, goal, step, won } from './logic.mjs';
const $ = s => document.querySelector(s);
const names = { forward: ['↑', 'Крок уперед'], left: ['↶', 'Поворот ліворуч'], right: ['↷', 'Поворот праворуч'] };
let program = [], state = { ...start }, running = false, generation = 0, active = -1, drag = null, angle = 0;
const status = text => $('#status').textContent = text;
function render() {
    $('#program').replaceChildren();
    program.forEach((cmd, i) => { const row = document.createElement('div'); row.className = 'row' + (i === active ? ' active' : ''); row.draggable = !running; row.innerHTML = `<span class="num">${i + 1}</span><span class="icon">${names[cmd][0]}</span><span>${names[cmd][1]}</span>`; const remove = document.createElement('button'); remove.textContent = '×'; remove.ariaLabel = `Видалити команду ${i + 1}`; remove.disabled = running; remove.onclick = () => { program.splice(i, 1); render() }; row.append(remove); row.ondragstart = e => { drag = { index: i }; e.dataTransfer.setData('text/plain', cmd); e.dataTransfer.effectAllowed = 'move' }; row.ondrop = e => { e.preventDefault(); e.stopPropagation(); drop(i) }; $('#program').append(row) });
    $('#count').textContent = `${program.length} / 12`; $('#run').disabled = running || !program.length;
    document.querySelectorAll('#palette button').forEach(b => { b.disabled = running || program.length >= 12; b.draggable = !b.disabled });
}
function add(cmd) { if (running || program.length >= 12) return; program.push(cmd); render() }
function drop(index) { $('#program').classList.remove('dragover'); if (running || !drag) return; if (drag.index !== undefined) { const old = drag.index; const [cmd] = program.splice(old, 1); program.splice(index > old ? index - 1 : index, 0, cmd) } else if (program.length < 12) program.splice(index, 0, drag.cmd); drag = null; render() }
for (const [cmd, [icon, label]] of Object.entries(names)) { const b = document.createElement('button'); b.className = 'command'; b.draggable = true; b.innerHTML = `<span class="icon">${icon}</span>${label}<span class="grip">⠿</span>`; b.onclick = () => add(cmd); b.ondragstart = e => { drag = { cmd }; e.dataTransfer.setData('text/plain', cmd); e.dataTransfer.effectAllowed = 'copy' }; $('#palette').append(b) }
$('#program').ondragover = e => { if (!running) { e.preventDefault(); $('#program').classList.add('dragover') } };
$('#program').ondragleave = () => $('#program').classList.remove('dragover');
$('#program').ondrop = e => { e.preventDefault(); drop(program.length) };
document.addEventListener('dragend', () => { drag = null; $('#program').classList.remove('dragover') });
const scene = new THREE.Scene(); scene.background = new THREE.Color('#eef2e9');
const camera = new THREE.OrthographicCamera(-4, 4, 3, -3, .1, 100); camera.position.set(7, 8, 10); camera.lookAt(0, 0, 0);
let renderer;
try { renderer = new THREE.WebGLRenderer({ antialias: true }); } catch (error) { status('Браузер не підтримує WebGL. Спробуй увімкнути апаратне прискорення.'); throw error }
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1; renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; $('#scene').append(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xffffff, 0xa9b69b, 1.8)); const light = new THREE.DirectionalLight(0xfff8e9, 2); light.position.set(-3, 7, 5); light.castShadow = true; light.shadow.mapSize.set(1024, 1024); light.shadow.camera.left = -5; light.shadow.camera.right = 5; light.shadow.camera.top = 5; light.shadow.camera.bottom = -5; light.shadow.normalBias = .03; scene.add(light);
function box(w, h, d, color, x, y, z, parent = scene) { const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color, roughness: .85 })); mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh }
box(200, .1, 200, '#eef2e9', 0, -.31, 0);
for (let z = 0; z < 4; z++)for (let x = 0; x < 4; x++) { const finish = x === goal.x && z === goal.z; const path = (x === 0 && z >= 1) || (z === 1 && x <= 2); box(.94, .22, .94, finish ? '#84b881' : path ? '#e4e9c8' : '#d6dfd1', x - 1.5, -.11, z - 1.5) }
const marker = new THREE.Mesh(new THREE.TorusGeometry(.22, .027, 8, 32), new THREE.MeshStandardMaterial({ color: '#f5ffe5' })); marker.rotation.x = -Math.PI / 2; marker.position.set(.5, .02, -.5); scene.add(marker);
const robot = new THREE.Group(); scene.add(robot); box(.43, .42, .38, '#e5a766', 0, .36, 0, robot); box(.49, .32, .43, '#f2c487', 0, .72, 0, robot); box(.34, .13, .055, '#394d43', 0, .73, -.225, robot); box(.065, .05, .018, '#f8ffec', -.09, .74, -.258, robot); box(.065, .05, .018, '#f8ffec', .09, .74, -.258, robot); box(.13, .14, .24, '#56695a', -.13, .09, 0, robot); box(.13, .14, .24, '#56695a', .13, .09, 0, robot); box(.1, .27, .15, '#ce9459', -.29, .38, 0, robot); box(.1, .27, .15, '#ce9459', .29, .38, 0, robot);
function place() { robot.position.set(state.x - 1.5, 0, state.z - 1.5); robot.rotation.y = angle }
function reset() { generation++; running = false; active = -1; state = { ...start }; angle = 0; place(); render(); status('Робот на старті. Можна спробувати ще раз.') }
$('#reset').onclick = reset;
function animateMove(next, cmd, token) { const from = robot.position.clone(), oldAngle = angle; angle += cmd === 'left' ? Math.PI / 2 : cmd === 'right' ? -Math.PI / 2 : 0; const targetAngle = angle; return new Promise(resolve => { const begin = performance.now(); function tick(now) { if (token !== generation) { resolve(false); return } const t = Math.min((now - begin) / 480, 1), ease = t * t * (3 - 2 * t); robot.position.set(THREE.MathUtils.lerp(from.x, next.x - 1.5, ease), cmd === 'forward' ? Math.sin(t * Math.PI) * .07 : 0, THREE.MathUtils.lerp(from.z, next.z - 1.5, ease)); robot.rotation.y = THREE.MathUtils.lerp(oldAngle, targetAngle, ease); if (t < 1) requestAnimationFrame(tick); else resolve(true) } requestAnimationFrame(tick) }) }
$('#run').onclick = async () => { if (running || !program.length) return; reset(); running = true; const token = generation; render(); for (let i = 0; i < program.length; i++) { if (token !== generation) return; active = i; render(); status(`Команда ${i + 1}: ${names[program[i]][1].toLowerCase()}`); const next = step(state, program[i]); if (!next) { status('Попереду край поля. Зміни програму та спробуй ще.'); break } if (!await animateMove(next, program[i], token)) return; state = next; if (won(state)) { status('Чудово! Робот дістався фінішу ✨'); break } if (i === program.length - 1) status('Команди закінчилися. Додай ще, щоб дістатися фінішу.') } if (token === generation) { running = false; active = -1; render() } };
new ResizeObserver(() => { const w = $('#scene').clientWidth, h = $('#scene').clientHeight; renderer.setSize(w, h); const aspect = w / h; const height = Math.max(5.5, 6.5 / aspect); camera.left = -height * aspect / 2; camera.right = height * aspect / 2; camera.top = height / 2; camera.bottom = -height / 2; camera.updateProjectionMatrix() }).observe($('#scene'));
place(); render(); renderer.setAnimationLoop(() => renderer.render(scene, camera));


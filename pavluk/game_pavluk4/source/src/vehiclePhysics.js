// A compact, deterministic off-road vehicle model. Coordinates are metres,
// seconds, and radians; +Z is the car's forward direction before yaw.
export const WHEELBASE = 2.8;
export const TRACK = 1.96;
export const WHEEL_RADIUS = 0.384;
const WHEELS = [
  [TRACK / 2, WHEELBASE / 2],
  [-TRACK / 2, WHEELBASE / 2],
  [TRACK / 2, -WHEELBASE / 2],
  [-TRACK / 2, -WHEELBASE / 2],
];
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const damp = (current, target, rate, dt) => current + (target - current) * (1 - Math.exp(-rate * dt));

export function createVehicleState(x, z, yaw, terrainHeight) {
  const state = {
    x, z, yaw, vx: 0, vz: 0, speed: 0, longitudinalSpeed: 0,
    steer: 0, yawRate: 0, lateralAcceleration: 0, slipAngle: 0,
    wheelSpins: [0, 0, 0, 0], wheelOffsets: [0, 0, 0, 0],
    y: terrainHeight(x, z), vy: 0, pitch: 0, roll: 0,
    impact: 0, acceleration: 0, nitro: 1, nitroLock: false, boosting: false,
  };
  sampleSuspension(state, terrainHeight, 1 / 60, true);
  return state;
}

function sampleSuspension(state, terrainHeight, dt, snap = false) {
  const fx = Math.sin(state.yaw), fz = Math.cos(state.yaw);
  const rx = Math.cos(state.yaw), rz = -Math.sin(state.yaw);
  const heights = WHEELS.map(([side, front]) => terrainHeight(
    state.x + rx * side + fx * front,
    state.z + rz * side + fz * front,
  ));
  const mean = (heights[0] + heights[1] + heights[2] + heights[3]) / 4;
  const front = (heights[0] + heights[1]) / 2;
  const rear = (heights[2] + heights[3]) / 2;
  const right = (heights[0] + heights[2]) / 2;
  const left = (heights[1] + heights[3]) / 2;
  const targetPitch = -Math.atan2(front - rear, WHEELBASE) - clamp(state.acceleration * .005, -.055, .055);
  const targetRoll = Math.atan2(right - left, TRACK) + clamp(state.lateralAcceleration * .016, -.13, .13);
  if (snap) {
    state.y = mean;
    state.pitch = targetPitch;
    state.roll = targetRoll;
  } else {
    const spring = (mean - state.y) * 78 - state.vy * 17;
    state.vy += spring * dt;
    state.y += state.vy * dt;
    if (state.y < mean - .03) { state.y = mean - .03; state.vy = Math.max(0, state.vy); }
    state.pitch = damp(state.pitch, targetPitch, 8, dt);
    state.roll = damp(state.roll, targetRoll, 6, dt);
  }
  for (let i = 0; i < 4; i++) {
    const [side, frontOffset] = WHEELS[i];
    const bodyAtWheel = state.y - state.pitch * frontOffset + state.roll * side;
    const targetOffset = clamp(heights[i] - bodyAtWheel, -.38, .38);
    state.wheelOffsets[i] = targetOffset;
  }
}

function oneStep(state, input, dt, terrainHeight, obstacles) {
  const fx = Math.sin(state.yaw), fz = Math.cos(state.yaw);
  const rx = Math.cos(state.yaw), rz = -Math.sin(state.yaw);
  const vLong = state.vx * fx + state.vz * fz;
  const vSide = state.vx * rx + state.vz * rz;
  const throttle = clamp(input.throttle || 0, -1, 1);
  const wantsBoost = !!input.boost && throttle > 0 && vLong >= -.5;
  state.boosting = wantsBoost && !state.nitroLock && state.nitro > 0;
  if (state.boosting) {
    state.nitro = Math.max(0, state.nitro - dt * .24);
    if (state.nitro === 0) state.nitroLock = true;
  } else {
    state.nitro = Math.min(1, state.nitro + dt * .095);
    if (state.nitro >= .25) state.nitroLock = false;
  }
  const steerInput = clamp(input.steer || 0, -1, 1);
  const brake = clamp(input.brake || 0, 0, 1);
  const handbrake = !!input.handbrake;
  const forwardDemand = throttle > 0 && vLong < -.6;
  const reverseDemand = throttle < 0 && vLong > .6;
  const drive = forwardDemand || reverseDemand ? 0 : throttle;
  const engine = drive > 0
    ? drive * 8.2 * (1 - clamp(vLong / 36, 0, .92)) + (state.boosting ? 15 : 0)
    : drive * 4.8 * (1 - clamp(-vLong / 12, 0, .88));
  const braking = brake * 12 + (forwardDemand || reverseDemand ? 12 : 0) + (handbrake ? 8 : 0);
  const resistance = .3 + .012 * vLong * vLong + braking;
  const slope = (terrainHeight(state.x + fx * 1.5, state.z + fz * 1.5)
    - terrainHeight(state.x - fx * 1.5, state.z - fz * 1.5)) / 3;
  const sideSlope = (terrainHeight(state.x + rx * 1.2, state.z + rz * 1.2)
    - terrainHeight(state.x - rx * 1.2, state.z - rz * 1.2)) / 2.4;
  const roadGrip = input.road ? 1.18 : 1;
  const traction = (state.boosting ? 23 : input.road ? 10 : 7.2) * (handbrake ? .75 : 1);
  const aLong = clamp(engine - Math.sign(vLong) * resistance - 9.81 * slope, -traction, traction);
  state.acceleration = damp(state.acceleration, aLong, 7, dt);
  const lateralGrip = (input.road ? 8 : 6.8) * (handbrake ? .48 : 1);
  const sideGravity = -9.81 * sideSlope;
  const staticGrip = handbrake ? .4 : 2.2 * roadGrip;
  const downhillPull = Math.abs(sideGravity) > staticGrip ? sideGravity - Math.sign(sideGravity) * staticGrip : 0;
  // Each axle reacts to its own lateral slip. Rear grip drops with the handbrake,
  // allowing a controlled slide instead of rotating the whole car in place.
  const maxSteer = .62 / (1 + Math.abs(vLong) * .045);
  state.steer = damp(state.steer, -steerInput * maxSteer, steerInput ? 7.5 : 10, dt);
  const frontSlip = vSide + state.yawRate * WHEELBASE / 2 - vLong * Math.tan(state.steer);
  const rearSlip = vSide - state.yawRate * WHEELBASE / 2;
  const frontForce = clamp(-frontSlip * 3.6, -lateralGrip * .58, lateralGrip * .58);
  const rearForce = clamp(-rearSlip * (handbrake ? 1.25 : 3.8),
    -lateralGrip * (handbrake ? .22 : .58), lateralGrip * (handbrake ? .22 : .58));
  const aSide = clamp(frontForce + rearForce + downhillPull, -lateralGrip, lateralGrip);
  state.lateralAcceleration = damp(state.lateralAcceleration, aSide, 8, dt);
  state.slipAngle = damp(state.slipAngle, Math.atan2(vSide, Math.max(3, Math.abs(vLong))), 6, dt);
  state.vx += (fx * aLong + rx * aSide) * dt;
  state.vz += (fz * aLong + rz * aSide) * dt;
  const speed = Math.hypot(state.vx, state.vz);
  if (speed > 52) { state.vx *= 52 / speed; state.vz *= 52 / speed; }

  const yawAcceleration = (frontForce - rearForce) * (WHEELBASE / 2) / 2.1 - state.yawRate * (handbrake ? .3 : .7);
  const yawLimit = handbrake ? Math.max(.65, lateralGrip / (Math.abs(vLong) + 2))
    : lateralGrip / (Math.abs(vLong) + 2);
  state.yawRate = clamp(state.yawRate + yawAcceleration * dt, -yawLimit, yawLimit);
  state.yaw += state.yawRate * dt;
  state.x += state.vx * dt;
  state.z += state.vz * dt;
  state.longitudinalSpeed = state.vx * Math.sin(state.yaw) + state.vz * Math.cos(state.yaw);
  state.speed = Math.hypot(state.vx, state.vz);
  for (let i = 0; i < WHEELS.length; i++) {
    const side = WHEELS[i][0];
    state.wheelSpins[i] += (state.longitudinalSpeed - state.yawRate * side) / WHEEL_RADIUS * dt;
  }
  state.impact = damp(state.impact, 0, 4, dt);

  for (const obstacle of obstacles) {
    const dx = state.x - obstacle.x, dz = state.z - obstacle.z;
    const minDistance = 1.28 + obstacle.radius;
    const d2 = dx * dx + dz * dz;
    if (d2 > minDistance * minDistance) continue;
    const d = Math.sqrt(d2);
    const nx = d > .001 ? dx / d : -fx, nz = d > .001 ? dz / d : -fz;
    state.x = obstacle.x + nx * minDistance;
    state.z = obstacle.z + nz * minDistance;
    const into = state.vx * nx + state.vz * nz;
    if (into < 0) {
      state.vx -= into * 1.3 * nx;
      state.vz -= into * 1.3 * nz;
      state.impact = Math.max(state.impact, Math.min(1, -into / 11));
      state.yawRate *= .55;
    }
  }
  state.longitudinalSpeed = state.vx * Math.sin(state.yaw) + state.vz * Math.cos(state.yaw);
  state.speed = Math.hypot(state.vx, state.vz);
  sampleSuspension(state, terrainHeight, dt);
}

export function stepVehicle(state, input, dt, terrainHeight, obstacles = []) {
  const steps = Math.max(1, Math.ceil(Math.max(0, dt) / (1 / 90)));
  const step = Math.min(Math.max(0, dt), .05) / steps;
  for (let i = 0; i < steps; i++) oneStep(state, input, step, terrainHeight, obstacles);
  return state;
}

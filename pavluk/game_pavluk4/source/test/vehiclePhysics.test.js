import test from 'node:test';
import assert from 'node:assert/strict';
import { createVehicleState, stepVehicle } from '../src/vehiclePhysics.js';

const flat = () => 0;
const advance = (state, input, seconds, ground = flat, obstacles = []) => {
  for (let i = 0; i < seconds * 60; i++) stepVehicle(state, input, 1 / 60, ground, obstacles);
};

test('accelerates, coasts and brakes into reverse', () => {
  const car = createVehicleState(0, 0, 0, flat);
  advance(car, { throttle: 1 }, 4);
  assert.ok(car.longitudinalSpeed > 10);
  const speedAtRelease = car.speed;
  advance(car, {}, 1);
  assert.ok(car.speed < speedAtRelease && car.speed > 0);
  advance(car, { throttle: -1 }, 3);
  assert.ok(car.longitudinalSpeed < 0);
});

test('steering changes heading in the requested direction', () => {
  const car = createVehicleState(0, 0, 0, flat);
  advance(car, { throttle: 1, steer: -0.6 }, 1.5);
  assert.ok(car.yaw > 0.2);
  assert.ok(car.x > 0);
  assert.notEqual(car.wheelSpins[0], car.wheelSpins[1]);
  const other = createVehicleState(0, 0, 0, flat);
  advance(other, { throttle: 1, steer: 0.6 }, 1.5);
  assert.ok(other.yaw < -0.2);
});

test('suspension follows a cross slope and obstacle stops penetration', () => {
  const slope = (x) => x * 0.15;
  const car = createVehicleState(0, 0, 0, slope);
  assert.ok(car.roll > 0);
  advance(car, { throttle: 1 }, 2, slope, [{ x: 0, z: 7, radius: 1 }]);
  assert.ok(Math.hypot(car.x, car.z - 7) >= 2.28 - 0.001);
  assert.ok(Number.isFinite(car.y));
  assert.ok(car.wheelOffsets.every(Number.isFinite));
});

test('chassis stays above the wheel contact plane on uneven ground', () => {
  const ground = (x, z) => Math.sin(z * .8) * .5 + Math.sin(x * .7) * .2;
  const car = createVehicleState(0, 0, 0, ground);
  for (let i = 0; i < 240; i++) {
    stepVehicle(car, { throttle: 1, steer: .2 }, 1 / 60, ground);
    const fx = Math.sin(car.yaw), fz = Math.cos(car.yaw);
    const rx = Math.cos(car.yaw), rz = -Math.sin(car.yaw);
    const mean = [[.98, 1.4], [-.98, 1.4], [.98, -1.4], [-.98, -1.4]]
      .reduce((sum, [side, front]) => sum + ground(car.x + rx * side + fx * front, car.z + rz * side + fz * front), 0) / 4;
    assert.ok(car.y >= mean - .031);
  }
});

test('a steep side slope pulls the car downhill', () => {
  const ground = (x) => x * .45;
  const car = createVehicleState(0, 0, 0, ground);
  advance(car, {}, 2, ground);
  assert.ok(car.x < -.1);
});

test('nitro accelerates faster, depletes, and recharges after use', () => {
  const normal = createVehicleState(0, 0, 0, flat);
  const boosted = createVehicleState(0, 0, 0, flat);
  advance(normal, { throttle: 1 }, 2);
  advance(boosted, { throttle: 1, boost: true }, 2);
  assert.ok(boosted.speed > normal.speed + 8);
  assert.ok(boosted.nitro < .55 && boosted.boosting);
  advance(boosted, { throttle: 1, boost: true }, 3);
  assert.ok(boosted.nitro < .25);
  assert.equal(boosted.boosting, false);
  assert.equal(boosted.nitroLock, true);
  advance(boosted, { throttle: 1 }, 3);
  assert.ok(boosted.nitro > .25);
  assert.equal(boosted.nitroLock, false);
});

test('turning builds lateral force and settles after releasing the wheel', () => {
  const car = createVehicleState(0, 0, 0, flat);
  car.vz = 16;
  advance(car, { throttle: .5, steer: -1 }, 1);
  assert.ok(car.x > 1.5 && car.yaw > .2);
  assert.ok(car.lateralAcceleration > 1);
  assert.ok(car.roll > .04);
  advance(car, { throttle: .5 }, 1.5);
  assert.ok(Math.abs(car.yawRate) < .03);
  assert.ok(Math.abs(car.roll) < .03);
});

test('handbrake lets the rear slide while steering', () => {
  const gripped = createVehicleState(0, 0, 0, flat);
  const drifting = createVehicleState(0, 0, 0, flat);
  gripped.vz = drifting.vz = 16;
  advance(gripped, { throttle: .5, steer: -1 }, 1);
  advance(drifting, { throttle: .5, steer: -1, handbrake: true }, 1);
  assert.ok(Math.abs(drifting.slipAngle) > Math.abs(gripped.slipAngle) + .1);
  assert.ok(drifting.yawRate > gripped.yawRate);
});

test('steering while reversing turns the car in the opposite direction', () => {
  const car = createVehicleState(0, 0, 0, flat);
  car.vz = -5;
  advance(car, { throttle: -1, steer: -1 }, .8);
  assert.ok(car.yaw < -.1);
});

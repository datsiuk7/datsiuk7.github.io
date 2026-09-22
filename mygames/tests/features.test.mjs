import test from 'node:test';
import assert from 'node:assert/strict';
import {
  initialState,
  step,
  won,
  conditionValue,
  sensors,
  commands,
  categories,
  validateLevel
} from '../logic.mjs';
import { setupEffects } from '../music.js';

test('strict 5 sensors definition', () => {
  const sensorKeys = Object.keys(sensors);
  assert.deepEqual(sensorKeys, [
    'lampShorts',
    'onLamp',
    'obstacleAhead',
    'lampLit',
    'canJump'
  ]);
  assert.equal(sensors.lampShorts, 'Ліхтар коротить');
  assert.equal(sensors.onLamp, 'Тут є ліхтар чи будинок');
  assert.equal(sensors.obstacleAhead, 'Попереду перешкода');
  assert.equal(sensors.lampLit, 'Світло тут світить');
  assert.equal(sensors.canJump, 'Можна стрибнути');
});

test('lists and foreach are completely removed from commands and categories', () => {
  assert.equal(commands.list, undefined);
  assert.equal(commands.foreach, undefined);
  assert.ok(commands.take);
  assert.ok(commands.fix);
  for (const cat of categories) {
    assert.ok(!cat.allowedCommands?.includes('list'));
    assert.ok(!cat.allowedCommands?.includes('foreach'));
  }
});

test('collectible lightbulbs: pickup with take command and carry count', () => {
  const level = {
    id: 'bulb-test',
    name: 'Тест лампочок',
    description: 'Знайди лампочку',
    width: 3,
    depth: 3,
    start: { x: 0, z: 0, dir: 1 },
    allowed: ['forward', 'take'],
    limit: 0,
    cells: [
      [{ height: 0, tree: false, lamp: false }, { height: 0, tree: false, lamp: false, bulb: true }, { height: 0, tree: false, lamp: false }],
      [{ height: 0, tree: false, lamp: false }, { height: 0, tree: false, lamp: false }, { height: 0, tree: false, lamp: false }],
      [{ height: 0, tree: false, lamp: false }, { height: 0, tree: false, lamp: false }, { height: 0, tree: false, lamp: false }]
    ]
  };

  let s = initialState(level);
  assert.deepEqual(s.bulbs, ['1,0']);
  assert.equal(s.carriedBulbs, 0);

  // Take when nothing is on tile (0,0) throws error
  assert.throws(() => step(level, s, 'take'), /Тут немає предмета/);

  // Move onto tile with bulb (1,0)
  s = step(level, s, 'forward');
  assert.equal(s.x, 1);
  assert.equal(s.z, 0);

  // Take bulb
  s = step(level, s, 'take');
  assert.equal(s.carriedBulbs, 1);
  assert.deepEqual(s.bulbs, []);

  // Cannot take again
  assert.throws(() => step(level, s, 'take'), /Тут немає предмета/);
});

test('sparking lantern requires repair kit and fix command before lighting', () => {
  const level = {
    id: 'spark-test',
    name: 'Тест іскріння',
    description: 'Полагоди ліхтар',
    width: 3,
    depth: 3,
    start: { x: 0, z: 1, dir: 1 },
    allowed: ['forward', 'light', 'fix', 'take'],
    limit: 0,
    repairKits: 1,
    cells: [
      [{ height: 0, tree: false, lamp: false }, { height: 0, tree: false, lamp: false }, { height: 0, tree: false, lamp: false }],
      [{ height: 0, tree: false, lamp: false }, { height: 0, tree: false, lamp: true, spark: true, lit: false }, { height: 0, tree: false, lamp: false }],
      [{ height: 0, tree: false, lamp: false }, { height: 0, tree: false, lamp: false }, { height: 0, tree: false, lamp: false }]
    ]
  };

  let s = initialState(level);
  assert.equal(s.repairKits, 1);
  assert.deepEqual(s.sparks, ['1,1']);
  assert.equal(won(level, s), false);

  // Step onto sparking lamp
  s = step(level, s, 'forward');

  // Sensor checks on sparking lamp
  assert.equal(conditionValue({ kind: 'sensor', sensor: 'lampShorts', not: false }, level, s, {}), true);
  assert.equal(conditionValue({ kind: 'sensor', sensor: 'onLamp', not: false }, level, s, {}), true);
  assert.equal(conditionValue({ kind: 'sensor', sensor: 'lampLit', not: false }, level, s, {}), false);

  // Trying to light sparking lamp directly throws error
  assert.throws(() => step(level, s, 'light'), /коротить/);

  // Fix the lantern using repair kit
  s = step(level, s, 'fix');
  assert.equal(s.repairKits, 0);
  assert.deepEqual(s.sparks, []);
  assert.equal(conditionValue({ kind: 'sensor', sensor: 'lampShorts', not: false }, level, s, {}), false);
  assert.equal(conditionValue({ kind: 'sensor', sensor: 'lampLit', not: false }, level, s, {}), false);

  // Now lamp can be safely lit
  s = step(level, s, 'light');
  assert.equal(conditionValue({ kind: 'sensor', sensor: 'lampLit', not: false }, level, s, {}), true);
  assert.ok(won(level, s));
});

test('collectible repair kit can be picked up with take and used with fix', () => {
  const level = {
    id: 'kit-test',
    name: 'Тест набору ремонту',
    description: 'Знайди ремкомплект і полагоди ліхтар',
    width: 3,
    depth: 3,
    start: { x: 0, z: 0, dir: 1 },
    allowed: ['forward', 'right', 'light', 'fix', 'take'],
    limit: 0,
    repairKits: 0,
    cells: [
      [{ height: 0, tree: false, lamp: false }, { height: 0, tree: false, lamp: false, kit: true }, { height: 0, tree: false, lamp: false }],
      [{ height: 0, tree: false, lamp: false }, { height: 0, tree: false, lamp: true, spark: true, lit: false }, { height: 0, tree: false, lamp: false }],
      [{ height: 0, tree: false, lamp: false }, { height: 0, tree: false, lamp: false }, { height: 0, tree: false, lamp: false }]
    ]
  };

  let s = initialState(level);
  assert.equal(s.repairKits, 0);
  assert.deepEqual(s.kits, ['1,0']);

  // Move to kit
  s = step(level, s, 'forward');
  s = step(level, s, 'take');
  assert.equal(s.repairKits, 1);
  assert.deepEqual(s.kits, []);

  // Turn and move to sparking lamp at (1,1)
  s = step(level, s, 'right');
  s = step(level, s, 'forward');

  // Fix and light
  s = step(level, s, 'fix');
  assert.equal(s.repairKits, 0);
  s = step(level, s, 'light');
  assert.ok(won(level, s));
});

test('validation supports spark, bulb, kit, and repairKits', () => {
  const validLevel = {
    id: 'val-test',
    name: 'Рівень перевірки',
    description: 'Опис рівня для перевірки валідації',
    width: 2,
    depth: 2,
    start: { x: 0, z: 0, dir: 0 },
    allowed: ['forward', 'light', 'take', 'fix'],
    limit: 0,
    repairKits: 2,
    cells: [
      [{ height: 0, tree: false, lamp: false }, { height: 0, tree: false, lamp: false, bulb: true }],
      [{ height: 0, tree: false, lamp: false, kit: true }, { height: 0, tree: false, lamp: true, spark: true }]
    ]
  };
  const errors = validateLevel(validLevel);
  assert.deepEqual(errors, []);
});

test('setupEffects provides procedural sound methods for every command', () => {
  const fx = setupEffects(null);
  const requiredSounds = [
    'step',
    'turn',
    'jump',
    'pickup',
    'repair',
    'call',
    'light',
    'unscrew',
    'spark',
    'fall',
    'win',
    'angry'
  ];
  for (const name of requiredSounds) {
    assert.equal(typeof fx[name], 'function', `Expected fx.${name} to be a function`);
  }
});

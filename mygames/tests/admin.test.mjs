import test from 'node:test';
import assert from 'node:assert/strict';
import { LevelHistory, createFreshLevel } from '../admin/level-state.js';
import { resizeLevel } from '../admin/map-resize.js';
import { paintCell, formatCellInfo } from '../admin/map-paint.js';

test('LevelHistory provides true Undo and Redo with checkpoints', () => {
  const history = new LevelHistory(10);
  assert.equal(history.canUndo, false);
  assert.equal(history.canRedo, false);

  const state1 = { name: 'Initial', width: 4, depth: 4, cells: [] };
  const state2 = { name: 'Edited 1', width: 4, depth: 4, cells: [] };
  const state3 = { name: 'Edited 2', width: 4, depth: 4, cells: [] };

  history.checkpoint(state1);
  assert.equal(history.canUndo, true);
  assert.equal(history.canRedo, false);

  history.checkpoint(state2);
  assert.equal(history.canUndo, true);
  assert.equal(history.canRedo, false);

  // Undo from state3 to state2
  const undoneTo2 = history.undo(state3);
  assert.deepEqual(undoneTo2, state2);
  assert.equal(history.canUndo, true);
  assert.equal(history.canRedo, true);

  // Undo from state2 to state1
  const undoneTo1 = history.undo(undoneTo2);
  assert.deepEqual(undoneTo1, state1);
  assert.equal(history.canUndo, false);
  assert.equal(history.canRedo, true);

  // Redo from state1 back to state2
  const redoneTo2 = history.redo(undoneTo1);
  assert.deepEqual(redoneTo2, state2);
  assert.equal(history.canUndo, true);
  assert.equal(history.canRedo, true);

  // Redo from state2 back to state3
  const redoneTo3 = history.redo(redoneTo2);
  assert.deepEqual(redoneTo3, state3);
  assert.equal(history.canUndo, true);
  assert.equal(history.canRedo, false);

  // Checkpoint clears future (redo stack)
  history.undo(state3);
  assert.equal(history.canRedo, true);
  history.checkpoint({ name: 'Branched' });
  assert.equal(history.canRedo, false);
});

test('resizeLevel expands, shrinks, and relocates start safely', () => {
  const level = createFreshLevel();
  let statusMsg = '';
  const onStatus = (msg) => { statusMsg = msg; };

  // Expand to 6x6
  const resExpand = resizeLevel(level, 6, 6, onStatus);
  assert.equal(resExpand.success, true);
  assert.equal(resExpand.changed, true);
  assert.equal(level.width, 6);
  assert.equal(level.depth, 6);
  assert.equal(level.cells.length, 6);
  assert.equal(level.cells[0].length, 6);

  // Place a lamp at (5, 5)
  level.cells[5][5].lamp = true;
  // Shrinking to 4x4 when object is at (5,5) should fail or shift
  // In our smart resize, object bounding box is (5,5), span is 1x1, which fits 4x4, so it shifts by 2!
  const resShrink = resizeLevel(level, 4, 4, onStatus);
  assert.equal(resShrink.success, true);
  assert.equal(resShrink.changed, true);
  assert.equal(level.width, 4);
  assert.equal(level.depth, 4);
  assert.equal(level.cells[3][3].lamp, true); // shifted from (5,5) to (3,3)
});

test('paintCell handles terrain, lamp, house, and start placement', () => {
  const level = createFreshLevel();
  let checkpoints = 0;
  let dirties = 0;
  let strokeActive = false;

  const ctx = {
    level,
    tool: 'terrain',
    height: 2,
    lampLitState: false,
    houseDir: 2,
    onStatus: () => {},
    onCheckpoint: () => { checkpoints++; },
    onDirty: () => { dirties++; },
    onRefreshCell: () => {},
    isStrokeActive: () => strokeActive,
    markStrokeActive: () => { strokeActive = true; }
  };

  // 1. Paint terrain height 2 at (1, 1)
  paintCell({ ...ctx, x: 1, z: 1 });
  assert.equal(level.cells[1][1].height, 2);
  assert.equal(checkpoints, 1);
  assert.equal(dirties, 1);

  // 2. Place lamp (lampLitState = false)
  paintCell({
    ...ctx,
    x: 1,
    z: 1,
    tool: 'lamp',
    isStrokeActive: () => false,
    markStrokeActive: () => {}
  });
  assert.equal(level.cells[1][1].lamp, true);
  assert.equal(level.cells[1][1].lit, false);

  // 3. Toggle lamp by painting over existing lamp
  let toggledLampLit = null;
  paintCell({
    ...ctx,
    x: 1,
    z: 1,
    tool: 'lamp',
    setLampLitState: (v) => { toggledLampLit = v; },
    isStrokeActive: () => false,
    markStrokeActive: () => {}
  });
  assert.equal(toggledLampLit, true);
  assert.equal(level.cells[1][1].lit, true);

  // 4. Place house with direction
  paintCell({
    ...ctx,
    x: 2,
    z: 2,
    tool: 'house',
    houseDir: 1,
    isStrokeActive: () => false,
    markStrokeActive: () => {}
  });
  assert.equal(level.cells[2][2].house, true);
  assert.equal(level.cells[2][2].dir, 1);

  // 5. Test formatCellInfo
  const infoLamp = formatCellInfo(level, 1, 1);
  assert.match(infoLamp, /ліхтар/);
  const infoHouse = formatCellInfo(level, 2, 2);
  assert.match(infoHouse, /будиночок/);
});

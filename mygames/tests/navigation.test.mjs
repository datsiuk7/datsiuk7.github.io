// Run: node --experimental-test-module-mocks --test --test-isolation=none tests/navigation.test.mjs
import test, { mock } from 'node:test';
import assert from 'node:assert/strict';

test('theme changes, leaving a level and repeated runs survive editor refactoring', async () => {
  const worlds = [];
  const editors = [];
  const nodes = new Map();
  const node = (selector) => {
    if (!nodes.has(selector)) nodes.set(selector, {
      style: { setProperty() {} },
      classList: { add() {}, remove() {} },
      setAttribute() {}, append() {}, remove() {}, scrollIntoView() {},
      querySelector: node, innerHTML: '', disabled: false
    });
    return nodes.get(selector);
  };
  const storage = new Map();
  const listeners = new Map();
  const level = {
    id: 'navigation-test', name: 'Navigation', description: '', width: 2, depth: 2,
    start: { x: 0, z: 0, dir: 0 }, allowed: ['light'], limit: 0,
    cells: Array.from({ length: 2 }, (_, z) => Array.from({ length: 2 }, (_, x) =>
      ({ height: 0, tree: false, lamp: x === 0 && z === 0 })))
  };
  mock.module('../scene.js', { namedExports: { World: class {
    constructor(host, level, state, theme) {
      this.theme = theme; this.state = state; this.zoom = 1;
      worlds.push(this);
    }
    setState(state) { this.state = state; }
    async animate(state) { this.state = state; return true; }
    async celebrate() { return true; }
    dispose() { this.disposed = true; }
  } } });
  mock.module('../program.js', { namedExports: { ProgramEditor: class {
    constructor(palette, host, count, level, trash, theme, saved) {
      this.blocks = saved?.blocks || [{ id: 'b1', type: 'light' }];
      this.functions = [];
      this.dnd = { endDrag: () => { this.dragEnded = true; } };
      editors.push(this);
    }
    getProgram() { return { blocks: this.blocks, functions: [] }; }
    lock(value) { this.locked = value; }
    highlight() {}
  } } });
  mock.module('../music.js', { namedExports: {
    setupMusic() {}, setupEffects: () => ({ win() {} })
  } });
  const globals = {
    document: { querySelector: node, body: node('body'), documentElement: node('html'), createElement: () => node('confetti') },
    localStorage: { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
    location: { hash: '#level=navigation-test' },
    window: { addEventListener: (name, fn) => listeners.set(name, fn) },
    fetch: async (url) => ({ ok: true, json: async () =>
      url.endsWith('settings.json') ? {} : url.endsWith('categories.json') ? [] :
      url.endsWith('index.json') ? [level.id] : level })
  };
  const originals = new Map(Object.keys(globals).map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  for (const [key, value] of Object.entries(globals)) Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  try {
    await import('../app.js');
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(worlds.at(-1).theme, 'dark');
    await node('#run').onclick();
    assert.equal(node('#run').disabled, false);
    assert.equal(editors.at(-1).locked, false);
    await node('#run').onclick();
    node('#theme').onclick();
    assert.equal(worlds.length, 2);
    assert.equal(worlds[0].disposed, true);
    assert.equal(editors[0].dragEnded, true);
    assert.equal(worlds[1].theme, 'light');
    assert.equal(worlds[1].state.lit.length, 1);
    assert.equal(editors[1].blocks.length, 1);
    location.hash = '';
    listeners.get('hashchange')();
    assert.equal(worlds[1].disposed, true);
    assert.match(node('#app').innerHTML, /categories-container/);
    location.hash = '#level=navigation-test';
    listeners.get('hashchange')();
    assert.equal(worlds.length, 3);
  } finally {
    for (const [key, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
    mock.restoreAll();
  }
});

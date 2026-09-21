export const start = { x: 0, z: 3, dir: 0 };
export const goal = { x: 2, z: 1 };
export function step(state, command) {
  if (command === 'left') return { ...state, dir: (state.dir + 3) % 4 };
  if (command === 'right') return { ...state, dir: (state.dir + 1) % 4 };
  if (command !== 'forward') throw new Error('Невідома команда');
  const [dx, dz] = [[0, -1], [1, 0], [0, 1], [-1, 0]][state.dir];
  const next = { ...state, x: state.x + dx, z: state.z + dz };
  if (next.x < 0 || next.x > 3 || next.z < 0 || next.z > 3) return null;
  return next;
}
export const won = s => s.x === goal.x && s.z === goal.z;

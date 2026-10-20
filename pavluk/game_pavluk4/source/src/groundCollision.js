// Matches the two triangles Three.js PlaneGeometry creates for each terrain cell.
export function sampleTerrainGrid(x, z, centerX, centerZ, size, segments, heights) {
  const step = size / segments;
  const u = Math.max(0, Math.min(segments - 1e-7, (x - centerX + size / 2) / step));
  const v = Math.max(0, Math.min(segments - 1e-7, (z - centerZ + size / 2) / step));
  const ix = Math.floor(u), iz = Math.floor(v);
  const a = u - ix, b = v - iz;
  const row = segments + 1;
  const h00 = heights[iz * row + ix];
  const h10 = heights[iz * row + ix + 1];
  const h01 = heights[(iz + 1) * row + ix];
  const h11 = heights[(iz + 1) * row + ix + 1];
  return a + b <= 1
    ? h00 * (1 - a - b) + h10 * a + h01 * b
    : h11 * (a + b - 1) + h01 * (1 - a) + h10 * (1 - b);
}

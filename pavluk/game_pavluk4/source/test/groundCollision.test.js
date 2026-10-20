import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { sampleTerrainGrid } from '../src/groundCollision.js';

test('collision height matches both triangles of the rendered terrain', () => {
  const size = 10, segments = 2;
  const heights = new Float32Array([0, 1, 0, 2, 3, 1, 0, 2, 4]);
  const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
  geometry.rotateX(-Math.PI / 2);
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) positions.setY(i, heights[i]);
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
  mesh.updateMatrixWorld(true);
  const ray = new THREE.Raycaster();
  for (const [x, z] of [[-4, -4], [-1, -2], [-2, -1], [1, 4], [3, 2], [4, 4]]) {
    ray.set(new THREE.Vector3(x, 20, z), new THREE.Vector3(0, -1, 0));
    const hit = ray.intersectObject(mesh)[0];
    assert.ok(hit, `terrain intersection at ${x}, ${z}`);
    assert.ok(Math.abs(sampleTerrainGrid(x, z, 0, 0, size, segments, heights) - hit.point.y) < 1e-5);
  }
});

import { copyFileSync, cpSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const from = (path) => fileURLToPath(new URL(path, root));

mkdirSync(from('assets/'), { recursive: true });
cpSync(from('dist/assets/'), from('assets/'), { recursive: true, force: true });
copyFileSync(from('dist/index.source.html'), from('index.html'));
console.log('GitHub Pages files are ready in this directory.');

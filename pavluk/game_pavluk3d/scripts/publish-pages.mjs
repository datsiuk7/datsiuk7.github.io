import { copyFileSync, cpSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const path = (name) => fileURLToPath(new URL(name, root));
mkdirSync(path('assets/'), { recursive: true });
cpSync(path('dist/assets/'), path('assets/'), { recursive: true, force: true });
copyFileSync(path('dist/index.source.html'), path('index.html'));
console.log('Static game ready for GitHub Pages.');

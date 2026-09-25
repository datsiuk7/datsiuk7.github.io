# Павлик / Відкритий світ

Четверта гра серії: безперервний процедурний ландшафт, вільний рух людини від третьої особи, біг і стрибок. Працює в браузері на Three.js.

## Керування

- `W A S D` або стрілки — ходьба відносно камери
- `Shift` — біг
- `Пробіл` — стрибок
- Миша — огляд (захоплення курсора або перетягування), колесо — відстань камери
- На сенсорному екрані: джойстик, кнопки бігу та стрибка, рух пальцем по сцені для огляду

## Запуск

```sh
npm install
npm run dev
```

Для GitHub Pages: `npm run build`, а потім скопіювати вміст `dist/` у каталог гри. `vite.config.js` використовує відносний `base`, тому гра працює з вкладеного шляху.

## Асети та ліцензії

- Текстури `leafy_grass`, `grass_path_2` і моделі `pine_sapling_small`, `rock_moss_set_01` — [Poly Haven](https://polyhaven.com/), [CC0](https://polyhaven.com/license). Завантажені локально в роздільності 1K.
- `Soldier.glb` — з [прикладу Three.js](https://github.com/mrdoob/three.js/tree/master/examples/models/gltf); оригінальна модель Vanguard by T. Choonyung / Mixamo (Adobe). [Adobe дозволяє використовувати персонажів і анімації Mixamo у відеоіграх](https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html). Модель використовується як вбудований елемент гри, її не слід перевидавати як окремий пакет моделей.
- `pine-cutout.png` — згенерований для цієї гри прозорий спрайт хвойного дерева. Промпт: “Generate a game-ready photorealistic cutout of ONE mature natural European pine tree, full tree visible from trunk base to crown tip, front three-quarter view. Tall irregular dark-green needle canopy, realistic fine branches and rough brown bark, believable forest tree shape, not symmetrical or cone-like. Soft daylight. Completely transparent alpha background, no ground, no shadow, no sky, no text, no other objects. Center the tree with thin transparent padding, suitable as a billboard sprite in a realistic browser 3D landscape.” Створено вбудованим інструментом `image_gen`.

Асети завантажуються із каталогу гри; під час гри зовнішні API не потрібні.

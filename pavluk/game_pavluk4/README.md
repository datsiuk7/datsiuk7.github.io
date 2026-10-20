# Павлик / Відкритий світ

Четверта гра серії: безперервний процедурний ландшафт, вільний рух людини від третьої особи, біг, стрибок і водіння автомобіля. Працює в браузері на Three.js.

У верхньому лівому куті показано поточний FPS. Гра автоматично зменшує роздільність рендеру, густоту трави, кількість детальних 3D дерев і каміння та роздільність тіней, якщо частота кадрів тривалий час низька. Якість поступово відновлюється, коли є запас швидкодії. Фактичний FPS залежить від відеокарти, браузера та розміру вікна.

## Керування

- `W A S D` або стрілки — ходьба відносно камери
- `Shift` — біг пішки
- `Пробіл` — стрибок
- `А` (українська розкладка) або `F` (англійська) біля автомобіля — сісти за кермо; та сама фізична клавіша після зупинки — вийти. Працює незалежно від вибраної розкладки. `A` в англійській розкладці лишається рухом ліворуч або поворотом керма.
- За кермом: `W` — газ, `S` — гальмо та задній хід, `A/D` — кермо (напрямки переставлено), `Shift` — нітро, `Пробіл` — ручне гальмо. Нітро витрачається під час прискорення й поступово відновлюється.
- `R` або кнопка ↺ — повернути персонажа й машину на старт, якщо застрягли
- `C` — камера дивиться назад
- Миша — огляд (захоплення курсора або перетягування), колесо — відстань камери
- На сенсорному екрані: джойстик, кнопки бігу та стрибка, рух пальцем по сцені для огляду. Поруч із машиною кнопка стрибка стає кнопкою посадки; за кермом джойстик задає газ і кермо, інші кнопки — нітро та вихід.

Колізія персонажа й чотирьох коліс використовує висоту трикутників видимої землі. Фізика авто враховує окреме зчеплення передньої й задньої осі, інерцію повороту, ковзання із ручником, нахил рельєфу, гальмування та окреме обертання коліс. Камера плавно наздоганяє поворот і злегка нахиляється під боковим прискоренням.

## Запуск

```powershell
npm install
powershell -ExecutionPolicy Bypass -File .\download-assets.ps1
npm run dev
```

Для GitHub Pages: `npm run build`, а потім скопіювати вміст `dist/` у каталог гри. `vite.config.js` використовує відносний `base`, тому гра працює з вкладеного шляху. У каталозі опублікованої гри готові файли лежать у корені та `assets/`, а вихідний код — у `source/`. Для локальної розробки із цієї папки спершу перейдіть у `source/`.

## Асети та ліцензії

- Текстури `leafy_grass`, `grass_path_2` і моделі `pine_sapling_small`, `rock_moss_set_01` — [Poly Haven](https://polyhaven.com/), [CC0](https://polyhaven.com/license). Завантажені локально в роздільності 1K.
- `Soldier.glb` — з [прикладу Three.js](https://github.com/mrdoob/three.js/tree/master/examples/models/gltf); оригінальна модель Vanguard by T. Choonyung / Mixamo (Adobe). [Adobe дозволяє використовувати персонажів і анімації Mixamo у відеоіграх](https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html). Модель використовується як вбудований елемент гри, її не слід перевидавати як окремий пакет моделей.
- `CarConcept.glb` — [Khronos glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/CarConcept), автори Eric Chadwick і Darmstadt Graphics Group GmbH; [CC BY 4.0](https://github.com/KhronosGroup/glTF-Sample-Assets/blob/main/Models/CarConcept/LICENSE.md). Логотипи та емблему приховано в грі.
- `pine-cutout.png` — згенерований для цієї гри прозорий спрайт хвойного дерева. Промпт: “Generate a game-ready photorealistic cutout of ONE mature natural European pine tree, full tree visible from trunk base to crown tip, front three-quarter view. Tall irregular dark-green needle canopy, realistic fine branches and rough brown bark, believable forest tree shape, not symmetrical or cone-like. Soft daylight. Completely transparent alpha background, no ground, no shadow, no sky, no text, no other objects. Center the tree with thin transparent padding, suitable as a billboard sprite in a realistic browser 3D landscape.” Створено вбудованим інструментом `image_gen`.

Асети завантажуються із каталогу гри; під час гри зовнішні API не потрібні.

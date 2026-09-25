// Continuous ground regions. Coordinates are in metres.
export const LEVELS = [
  {
    name:'ЛІСОВЕ СЕЛИЩЕ', subtitle:'Сосновий ліс і стара сільська дорога', biome:'forest',
    skyTop:0x87a7ad, skyBottom:0xd8d6bd, fog:0xa8b8ad, ground:0x576f46, groundLight:0x82936a,
    path:0x8e8066, rock:0x6e716b, accent:0xc9aa66, dragonSpeed:2.55,
    spawn:{x:0,z:21}, dragon:{x:-19,z:-18}, portal:{x:22,z:-22},
    stars:[{x:-17,z:13},{x:13,z:15},{x:-20,z:-10},{x:4,z:-13},{x:23,z:-6}],
    buildings:[{x:-8,z:12,w:6,d:5,h:4},{x:11,z:5,w:5,d:7,h:4.5},{x:-10,z:-8,w:7,d:5,h:4}],
  },
  {
    name:'КАМ’ЯНИЙ КАНЬЙОН', subtitle:'Суха долина, ферма й покинуті споруди', biome:'canyon',
    skyTop:0x9ba9aa, skyBottom:0xe9cba8, fog:0xcbb798, ground:0x9b795b, groundLight:0xb99a73,
    path:0x9b8469, rock:0x715d52, accent:0xd8a567, dragonSpeed:2.8,
    spawn:{x:-2,z:21}, dragon:{x:20,z:-18}, portal:{x:-23,z:-22},
    stars:[{x:16,z:16},{x:-18,z:11},{x:20,z:-8},{x:-3,z:-14},{x:-22,z:-5}],
    buildings:[{x:5,z:9,w:6,d:5,h:4},{x:-13,z:-1,w:7,d:6,h:5},{x:10,z:-14,w:6,d:6,h:4}],
  },
  {
    name:'ГІРСЬКЕ МІСТЕЧКО', subtitle:'Круті схили, хвойні дерева та кам’яні будинки', biome:'alpine',
    skyTop:0x799ab2, skyBottom:0xd7d8d4, fog:0xaebbc4, ground:0x586c56, groundLight:0x91a18a,
    path:0x898984, rock:0x667477, accent:0x9dc7c2, dragonSpeed:3.0,
    spawn:{x:0,z:21}, dragon:{x:-20,z:-17}, portal:{x:22,z:-22},
    stars:[{x:-19,z:12},{x:17,z:11},{x:-21,z:-9},{x:1,z:-16},{x:22,z:-5}],
    buildings:[{x:-10,z:7,w:5,d:5,h:5},{x:9,z:3,w:6,d:5,h:5},{x:-7,z:-11,w:6,d:6,h:5.5}],
  },
  {
    name:'ПРИМОРСЬКИЙ ПОРТ', subtitle:'Тепле узбережжя, маяк і кам’яні причали', biome:'coast',
    skyTop:0x648da4, skyBottom:0xe6c9a9, fog:0xb5c0bc, ground:0x747e5c, groundLight:0xabb095,
    path:0xa79a84, rock:0x6e7774, accent:0xe4bc86, dragonSpeed:3.15,
    spawn:{x:-2,z:21}, dragon:{x:20,z:-18}, portal:{x:-23,z:-22},
    stars:[{x:16,z:15},{x:-17,z:11},{x:21,z:-8},{x:-2,z:-15},{x:-22,z:-6}],
    buildings:[{x:8,z:8,w:6,d:5,h:5},{x:-11,z:3,w:6,d:6,h:5},{x:10,z:-12,w:6,d:6,h:5}],
  },
];

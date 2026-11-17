// Layout: every clickable rectangle in the game, in one place. The
// renderer draws these exact rectangles and the input layer tests clicks
// against the same objects, so what looks clickable is clickable.
//
// The Sound and Pause buttons are 64 px wide at 15 px type: round 1 put
// 16 px bold "Sound"/"Pause" into 44 px and clipped both labels in every
// screenshot. The bottom bar fits five 104 px plant cards, a 56 px shovel,
// an 88 px upgrade, a 92 px flash and a 122 px send-wave button in 960 px.

import { PLANT_ORDER } from './config.js';

export const LAYOUT = {
  cards: PLANT_ORDER.map((key, i) => ({ key, x: 8 + i * 112, y: 548, w: 104, h: 44 })),
  shovel: { x: 576, y: 548, w: 56, h: 44 },
  upgradeBtn: { x: 638, y: 548, w: 88, h: 44 },
  flashBtn: { x: 732, y: 548, w: 92, h: 44 },
  waveBtn: { x: 830, y: 548, w: 122, h: 44 },
  muteBtn: { x: 808, y: 10, w: 64, h: 36 },
  pauseBtn: { x: 880, y: 10, w: 64, h: 36 },
  startBtn: { x: 380, y: 430, w: 200, h: 56 },
  againBtn: { x: 380, y: 420, w: 200, h: 56 },
  diffBtns: [
    { key: 'sprout', x: 230, y: 272, w: 160, h: 52 },
    { key: 'gardener', x: 400, y: 272, w: 160, h: 52 },
    { key: 'nightmare', x: 570, y: 272, w: 160, h: 52 },
  ],
};

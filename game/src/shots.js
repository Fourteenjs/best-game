// Deterministic screenshot poses: ?shot=start|play|battle|win&seed=N builds a rich,
// fixed game state so the screenshots always show the game at its best.
// These poses are only for screenshots; normal play never uses them.

import { GRID, PLANTS } from './config.js';
import { newGame, cellCenter } from './state.js';
import { mulberry32 } from './random.js';

function addPlant(state, key, col, row) {
  const def = PLANTS[key];
  state.plants.push({
    key, col, row, hp: def.hp, maxHp: def.hp,
    cooldown: 0.3, sunTimer: 4, flash: 0,
  });
}

function addEnemy(state, key, row, x, hpMul = 1) {
  const base = { moth: 60, swift: 42, beetle: 230, luna: 1250 }[key];
  const speed = { moth: 26, swift: 52, beetle: 15, luna: 18 }[key];
  state.enemies.push({
    key, row, x,
    y: cellCenter(0, row).y,
    hp: Math.round(base * hpMul), maxHp: Math.round(base * hpMul),
    speed, slowUntil: 0, attackCooldown: 0,
    wobble: state.rng() * Math.PI * 2, flash: 0,
  });
}

function gardenRow(state, cols) {
  // A believable mid-game garden: sunblooms behind, shooters in front.
  const back = ['sunbloom', 'sunbloom', 'thornspitter', 'frostbloom', 'moonpetal'];
  for (const row of [0, 1, 2, 3, 4]) {
    for (let c = 0; c < cols; c++) {
      const key = back[(c + row) % back.length];
      if (c === 0 && key !== 'sunbloom') addPlant(state, 'sunbloom', 0, row);
      else addPlant(state, key, c, row);
    }
  }
}

export function poseForShot(shot, seed = 7) {
  const state = newGame(seed);
  const rng = mulberry32(seed * 31 + 5);
  state.rng = rng;
  if (shot === 'start') {
    state.screen = 'title';
    gardenRow(state, 3);
    addEnemy(state, 'moth', 1, 880);
    addEnemy(state, 'swift', 3, 820);
    return state;
  }
  if (shot === 'play') {
    state.screen = 'playing';
    state.time = 42;
    state.sun = 320;
    state.score = 480;
    state.wave = 4;
    state.waveActive = true;
    state.waveTime = 9;
    state.lanternHp = 9;
    gardenRow(state, 5);
    addEnemy(state, 'moth', 0, 700);
    addEnemy(state, 'moth', 1, 620, 0.7);
    addEnemy(state, 'swift', 2, 760);
    addEnemy(state, 'moth', 2, 560, 0.5);
    addEnemy(state, 'beetle', 3, 840);
    addEnemy(state, 'swift', 4, 690);
    state.projectiles.push(
      { kind: 'thorn', row: 0, x: 480, y: cellCenter(0, 0).y - 6, vx: 420, dmg: 20, splash: 0, slow: 0 },
      { kind: 'frost', row: 2, x: 520, y: cellCenter(0, 2).y - 6, vx: 360, dmg: 10, splash: 0, slow: 3 },
      { kind: 'moon', row: 3, x: 600, y: cellCenter(0, 3).y - 6, vx: 300, dmg: 60, splash: 70, slow: 0 },
    );
    state.suns.push({ x: 420, y: 120, vy: 42, value: 25, life: 8, bob: 1 });
    state.message = 'Wave 4 — the Gloom comes!';
    state.messageUntil = 9999;
    return state;
  }
  if (shot === 'battle') {
    state.screen = 'playing';
    state.time = 96;
    state.sun = 540;
    state.score = 1450;
    state.wave = 8;
    state.waveActive = true;
    state.waveTime = 14;
    state.lanternHp = 7;
    gardenRow(state, 6);
    addEnemy(state, 'moth', 0, 640, 0.6);
    addEnemy(state, 'swift', 0, 780);
    addEnemy(state, 'beetle', 1, 720, 0.8);
    addEnemy(state, 'moth', 1, 560, 0.4);
    addEnemy(state, 'swift', 2, 660);
    addEnemy(state, 'moth', 2, 820, 0.9);
    addEnemy(state, 'beetle', 3, 880);
    addEnemy(state, 'swift', 4, 600);
    addEnemy(state, 'moth', 4, 740, 0.5);
    state.projectiles.push(
      { kind: 'thorn', row: 0, x: 500, y: cellCenter(0, 0).y - 6, vx: 420, dmg: 20, splash: 0, slow: 0 },
      { kind: 'thorn', row: 1, x: 430, y: cellCenter(0, 1).y - 6, vx: 420, dmg: 20, splash: 0, slow: 0 },
      { kind: 'moon', row: 2, x: 560, y: cellCenter(0, 2).y - 6, vx: 300, dmg: 60, splash: 70, slow: 0 },
      { kind: 'frost', row: 4, x: 480, y: cellCenter(0, 4).y - 6, vx: 360, dmg: 10, splash: 0, slow: 3 },
    );
    state.suns.push({ x: 300, y: 100, vy: 42, value: 25, life: 8, bob: 2 });
    state.message = 'Wave 8 — hold the line!';
    state.messageUntil = 9999;
    return state;
  }
  if (shot === 'win') {
    state.screen = 'won';
    state.time = 210;
    state.sun = 860;
    state.score = 3240;
    state.wave = 10;
    state.lanternHp = 8;
    state.kills = 187;
    state.planted = 34;
    state.stats = { wavesCleared: 10, sunsCollected: 61 };
    gardenRow(state, 5);
    return state;
  }
  return state;
}

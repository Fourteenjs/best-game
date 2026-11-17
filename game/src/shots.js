// Deterministic screenshot poses: ?shot=start|play|boss|win&seed=N builds a
// rich, fixed game state so the screenshots always show the game at its
// best. These poses are only for screenshots; normal play never uses them.
// Enemy numbers come from config.js's ENEMIES table (round 1 hard-coded
// them here and drifted out of sync with the real game).

import { GRID, PLANTS, ENEMIES } from './config.js';
import { newGame, cellCenter } from './state.js';
import { mulberry32 } from './random.js';

function addPlant(state, key, col, row, tier = 1) {
  const def = PLANTS[key];
  state.plants.push({
    key, col, row, hp: def.hp, maxHp: def.hp,
    cooldown: 0.3, sunTimer: 4, flash: 0, tier,
  });
}

function addEnemy(state, key, row, x, hpMul = 1) {
  const def = ENEMIES[key];
  const hp = Math.round(def.hp * hpMul);
  const e = {
    key, row, x,
    y: cellCenter(0, row).y,
    hp, maxHp: hp,
    speed: def.speed, slowUntil: 0, attackCooldown: 0,
    wobble: state.rng() * Math.PI * 2, flash: 0,
    snuffTimer: 1.5, boltTimer: 2, phase: key === 'luna' ? 2 : 1,
  };
  state.enemies.push(e);
  return e;
}

function gardenRow(state, cols) {
  // A believable mid-game garden: sunblooms behind, a torch lighting the
  // middle, shooters in front — with one tier-2 star to show upgrades.
  const back = ['sunbloom', 'thornspitter', 'torch', 'frostbloom', 'moonpetal'];
  for (const row of [0, 1, 2, 3, 4]) {
    for (let c = 0; c < cols; c++) {
      const key = back[(c + row) % back.length];
      if (c === 0 && key !== 'sunbloom') addPlant(state, 'sunbloom', 0, row);
      else addPlant(state, key, c, row, c === 3 && row === 2 ? 2 : 1);
    }
  }
}

export function poseForShot(shot, seed = 7) {
  const state = newGame(seed);
  const rng = mulberry32(seed * 31 + 5);
  state.rng = rng;
  if (shot === 'start') {
    state.screen = 'title';
    state.difficulty = 'gardener';
    state.best = { score: 3120, wave: 8, wins: 0 };
    gardenRow(state, 3);
    addEnemy(state, 'moth', 1, 880);
    addEnemy(state, 'swift', 3, 820);
    return state;
  }
  if (shot === 'play') {
    // The cover: night 2, a full garden under attack, a Snuff's dark patch
    // on the right, a torch halo glowing bright, shots in the air, a sun
    // falling, and a tier-2 thornspitter holding the line.
    state.screen = 'playing';
    state.time = 96;
    state.sun = 320;
    state.score = 480;
    state.wave = 4;
    state.waveActive = true;
    state.waveTime = 9;
    state.lanternHp = 9;
    state.kills = 41;
    state.planted = 21;
    gardenRow(state, 5);
    state.dark['7,1'] = 9999;
    state.dark['7,2'] = 9999;
    state.dark['8,1'] = 9999;
    state.stats.snuffedPlots = 3;
    addEnemy(state, 'moth', 0, 700);
    addEnemy(state, 'moth', 1, 620, 0.7);
    addEnemy(state, 'swift', 2, 760);
    addEnemy(state, 'moth', 2, 560, 0.5);
    addEnemy(state, 'snuff', 1, 840);
    addEnemy(state, 'beetle', 3, 840);
    addEnemy(state, 'wisp', 4, 780);
    addEnemy(state, 'swift', 4, 690);
    state.projectiles.push(
      { kind: 'thorn', row: 0, x: 480, y: cellCenter(0, 0).y - 6, vx: 420, dmg: 30, splash: 0, slow: 0 },
      { kind: 'frost', row: 2, x: 520, y: cellCenter(0, 2).y - 6, vx: 360, dmg: 10, splash: 0, slow: 3 },
      { kind: 'moon', row: 3, x: 600, y: cellCenter(0, 3).y - 6, vx: 300, dmg: 60, splash: 70, slow: 0 },
    );
    state.bolts.push({ row: 4, x: 700, y: cellCenter(0, 4).y, vx: -260, dmg: 25, target: null });
    state.damageNumbers.push(
      { x: 560, y: cellCenter(0, 2).y - 30, text: '30', life: 0.7, maxLife: 0.9, color: '#ffd94a' },
      { x: 640, y: cellCenter(0, 3).y - 34, text: '60', life: 0.6, maxLife: 0.9, color: '#ffd94a' },
    );
    state.suns.push({ x: 420, y: 120, vy: 42, value: 25, life: 8, bob: 1 });
    state.message = 'Wave 4 — Mothfall!';
    state.messageUntil = 9999;
    return state;
  }
  if (shot === 'boss') {
    // The final night: Luna at half health in phase 2, her boss bar across
    // the top, her Snuffs darkening the right flank, the garden blazing.
    state.screen = 'playing';
    state.time = 320;
    state.sun = 540;
    state.score = 3420;
    state.wave = 10;
    state.waveActive = true;
    state.waveTime = 16;
    state.lanternHp = 6;
    state.kills = 168;
    state.planted = 33;
    state.upgraded = 6;
    gardenRow(state, 6);
    state.dark['8,0'] = 9999;
    state.dark['8,1'] = 9999;
    state.dark['7,0'] = 9999;
    state.stats.snuffedPlots = 12;
    const luna = addEnemy(state, 'luna', 2, 690, 1.55);
    luna.hp = Math.round(luna.maxHp * 0.55);
    luna.phase = 2;
    state.boss = luna;
    addEnemy(state, 'snuff', 0, 800);
    addEnemy(state, 'snuff', 4, 760);
    addEnemy(state, 'swift', 1, 620, 0.8);
    addEnemy(state, 'beetle', 3, 840);
    addEnemy(state, 'wisp', 4, 700);
    state.projectiles.push(
      { kind: 'thorn', row: 0, x: 500, y: cellCenter(0, 0).y - 6, vx: 420, dmg: 32, splash: 0, slow: 0 },
      { kind: 'moon', row: 2, x: 560, y: cellCenter(0, 2).y - 6, vx: 300, dmg: 95, splash: 95, slow: 0 },
      { kind: 'frost', row: 4, x: 480, y: cellCenter(0, 4).y - 6, vx: 360, dmg: 16, splash: 0, slow: 4 },
    );
    state.damageNumbers.push(
      { x: 640, y: cellCenter(0, 2).y - 52, text: '95', life: 0.7, maxLife: 0.9, color: '#ffd94a' },
    );
    state.message = 'Luna, Queen of the Eclipse — Phase 2!';
    state.messageUntil = 9999;
    return state;
  }
  if (shot === 'win') {
    // Victory: three stars, the full statistics, best score, and the
    // Play Again button that restarts instantly.
    state.screen = 'won';
    state.time = 342;
    state.sun = 720;
    state.score = 4860;
    state.wave = 10;
    state.lanternHp = 9;
    state.kills = 203;
    state.planted = 38;
    state.upgraded = 6;
    state.flashes = 3;
    state.best = { score: 4860, wave: 10, wins: 1 };
    state.stats = { wavesCleared: 10, sunsCollected: 64, sunFromBlooms: 41, snuffedPlots: 23 };
    gardenRow(state, 5);
    return state;
  }
  if (shot === 'lose') {
    // Defeat pose (kept for the test suite's visual check, not a cover):
    // the lantern is out on night 3, moths at the gate.
    state.screen = 'lost';
    state.time = 188;
    state.sun = 60;
    state.score = 1240;
    state.wave = 6;
    state.lanternHp = 0;
    state.kills = 74;
    state.planted = 22;
    state.stats = { wavesCleared: 5, sunsCollected: 31, sunFromBlooms: 18, snuffedPlots: 9 };
    gardenRow(state, 4);
    addEnemy(state, 'moth', 1, 240);
    addEnemy(state, 'beetle', 2, 300, 0.6);
    addEnemy(state, 'swift', 3, 200, 0.5);
    return state;
  }
  return state;
}

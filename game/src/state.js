// Game state: one plain object, created fresh for a new game or a screenshot pose.
// Screens: 'title' | 'playing' | 'paused' | 'won' | 'lost'

import { GRID, LANTERN, START_SUN, MAX_WAVES, SUN } from './config.js';
import { mulberry32 } from './random.js';

export function cellCenter(col, row) {
  return {
    x: GRID.x0 + col * GRID.cellW + GRID.cellW / 2,
    y: GRID.y0 + row * GRID.cellH + GRID.cellH / 2,
  };
}

export function cellAt(px, py) {
  const col = Math.floor((px - GRID.x0) / GRID.cellW);
  const row = Math.floor((py - GRID.y0) / GRID.cellH);
  if (col < 0 || col >= GRID.cols || row < 0 || row >= GRID.rows) return null;
  return { col, row };
}

export function newGame(seed = 20261116) {
  return {
    seed,
    rng: mulberry32(seed),
    screen: 'title',
    time: 0,
    sun: START_SUN,
    score: 0,
    wave: 0,
    lanternHp: LANTERN.hp,
    lanternMax: LANTERN.hp,
    plants: [], // {key, col, row, hp, maxHp, cooldown, sunTimer, flash}
    enemies: [], // {key, row, x, y, hp, maxHp, speed, slowUntil, attackCooldown, wobble}
    projectiles: [], // {kind, row, x, y, vx, dmg, splash, slow}
    particles: [], // {x, y, vx, vy, life, maxLife, size, color, kind}
    suns: [], // falling collectible suns {x, y, vy, value, life, bob}
    spawnQueue: [], // {at, key, row}
    waveActive: false,
    waveTime: 0,
    waveDuration: 0,
    waveHpScale: 1,
    skyTimer: 3,
    kills: 0,
    planted: 0,
    selected: 'thornspitter',
    shovel: false,
    hover: null, // {col, row} or null
    message: '',
    messageUntil: 0,
    stats: { wavesCleared: 0, sunsCollected: 0 },
    muted: false,
  };
}

export function plantAt(state, col, row) {
  return state.plants.find((p) => p.col === col && p.row === row) || null;
}

export function enemyAtCell(state, col, row) {
  const { x } = cellCenter(col, row);
  return state.enemies.find(
    (e) => e.row === row && Math.abs(e.x - x) < GRID.cellW * 0.62,
  ) || null;
}

export function waveCleared(state) {
  return state.waveActive && state.spawnQueue.length === 0 && state.enemies.length === 0;
}

export function isGameOver(state) {
  return state.screen === 'won' || state.screen === 'lost';
}

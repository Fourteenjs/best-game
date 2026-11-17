// Game state: one plain object, created fresh for a new game or a screenshot
// pose. Screens: 'title' | 'playing' | 'paused' | 'won' | 'lost'.
// The simulation is pure data: the renderer and the input layer only read
// and write this object, and the loop advances it on a fixed 1/60 s step.

import { GRID, LANTERN, DIFFICULTIES } from './config.js';
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

export function cellKey(col, row) {
  return col + ',' + row;
}

// Best run, kept across sessions in localStorage (guarded: headless shells
// and file:// pages may refuse storage, and the game must still run).
export function loadBest() {
  try {
    const raw = window.localStorage.getItem('glowgarden-best-v2');
    if (!raw) return { score: 0, wave: 0, wins: 0 };
    const b = JSON.parse(raw);
    return {
      score: Number(b.score) || 0,
      wave: Number(b.wave) || 0,
      wins: Number(b.wins) || 0,
    };
  } catch {
    return { score: 0, wave: 0, wins: 0 };
  }
}

export function saveBest(best) {
  try {
    window.localStorage.setItem('glowgarden-best-v2', JSON.stringify(best));
  } catch {
    // Storage unavailable: the run still counts, it just is not remembered.
  }
}

export function newGame(seed = 20261116, difficulty = 'gardener') {
  const diff = DIFFICULTIES[difficulty] || DIFFICULTIES.gardener;
  return {
    seed,
    rng: mulberry32(seed),
    screen: 'title',
    difficulty,
    time: 0,
    sun: diff.startSun,
    score: 0,
    wave: 0,
    lanternHp: diff.lanternHp,
    lanternMax: diff.lanternHp,
    plants: [], // {key, col, row, hp, maxHp, cooldown, sunTimer, flash, tier}
    enemies: [], // {key, row, x, y, hp, maxHp, speed, slowUntil, attackCooldown,
    //            wobble, flash, snuffTimer, boltTimer, phase}
    projectiles: [], // player shots {kind, row, x, y, vx, dmg, splash, slow}
    bolts: [], // wisp bolts {row, x, y, vx, dmg}
    particles: [], // pooled feedback sparks {x, y, vx, vy, life, maxLife, size, color}
    damageNumbers: [], // floating hit text {x, y, text, life, color}
    suns: [], // falling collectible suns {x, y, vy, value, life, bob}
    spawnQueue: [], // {at, key, row}
    waveActive: false,
    waveTime: 0,
    waveDuration: 0,
    waveHpScale: 1,
    skyTimer: 3,
    kills: 0,
    planted: 0,
    upgraded: 0,
    flashes: 0,
    selected: 'thornspitter',
    shovel: false,
    upgradeMode: false,
    hover: null, // {col, row} or null
    message: '',
    messageUntil: 0,
    banner: '', // big centre banner text (night / wave name)
    bannerUntil: 0,
    dark: {}, // cellKey -> time until which the plot stays snuffed dark
    flashUntil: 0, // Flash of Light: every plot bright until this time
    flashReadyAt: 0, // Flash cooldown end time
    shake: 0, // screen-shake magnitude, decays in render
    hitStop: 0, // freeze timer: the sim pauses while this is above 0
    confirmRestartUntil: 0, // second R inside this window restarts at once
    lastClearAt: -999, // time the last wave was cleared (swift-call bonus)
    boss: null, // the living Luna, if any (same object as in enemies)
    stats: {
      wavesCleared: 0,
      sunsCollected: 0, // ONLY suns the player clicked out of the sky
      sunFromBlooms: 0, // sun grown passively by Sunblooms (kept separate)
      snuffedPlots: 0,
    },
    best: loadBest(),
    muted: false,
    musicOn: false,
    tutorialStep: 0, // short first-run hints, advanced by play
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

export function starsFor(state) {
  if (state.screen !== 'won') return 0;
  if (state.lanternHp >= 8) return 3;
  if (state.lanternHp >= 4) return 2;
  return 1;
}

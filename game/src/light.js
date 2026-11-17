// Light: the mechanic that makes Glowgarden its own game.
//
// Every plot has a light level, recomputed from the sources that shine on it:
//   0 dark    — a shooter planted here is dormant and never fires.
//   1 lit     — the Heart Lantern lights columns 0–1; a Sunbloom lights its
//               own plot; a plant here fires normally.
//   2 bright  — an Ember Torch lights its 3×3 neighbourhood (5×5 at tier 2);
//               a plant here fires at +50% damage.
// A Snuff Moth darkens plots for a while (state.dark): a darkened plot reads
// 0 no matter what shines on it, until the snuff wears off or a Flash of
// Light burns it away. Flash makes every plot bright while it lasts.

import { GRID, PLANTS } from './config.js';
import { cellKey } from './state.js';

export const BRIGHT_DMG_MUL = 1.5;

export function cellLight(state, col, row) {
  if (state.time < state.flashUntil) return 2;
  if ((state.dark[cellKey(col, row)] || 0) > state.time) return 0;
  let level = 0;
  if (col <= 1) level = 1; // the Heart Lantern's own glow
  for (const p of state.plants) {
    if (p.key === 'sunbloom' && p.col === col && p.row === row) level = Math.max(level, 1);
    if (p.key === 'torch') {
      const r = p.tier >= 2 ? 2 : 1;
      if (Math.abs(p.col - col) <= r && Math.abs(p.row - row) <= r) level = 2;
    }
  }
  return level;
}

export function litPlotCount(state) {
  let n = 0;
  for (let r = 0; r < GRID.rows; r++) {
    for (let c = 0; c < GRID.cols; c++) {
      if (cellLight(state, c, r) > 0) n += 1;
    }
  }
  return n;
}

// Darken a square of plots around (col, row) for `secs` seconds.
export function snuffArea(state, col, row, radius, secs) {
  let hit = 0;
  for (let r = row - radius; r <= row + radius; r++) {
    for (let c = col - radius; c <= col + radius; c++) {
      if (c < 0 || c >= GRID.cols || r < 0 || r >= GRID.rows) continue;
      const k = cellKey(c, r);
      const until = state.time + secs;
      if ((state.dark[k] || 0) < until) state.dark[k] = until;
      hit += 1;
    }
  }
  return hit;
}

export function clearSnuff(state) {
  state.dark = {};
}

// The tick: one frame of simulation while the game is playing.
// Order matters — suns fall, plants act, enemies walk, projectiles fly, waves end.

import { GRID, SUN } from './config.js';
import { updatePlants } from './plants.js';
import { updateEnemies, checkWaveEnd } from './enemies.js';
import { updateProjectiles } from './projectiles.js';
import { updateParticles } from './particles.js';

export function tick(state, dt) {
  if (state.screen !== 'playing') return;
  state.time += dt;
  if (state.waveActive) state.waveTime += dt;

  // A sun drifts down from the sky every few seconds; click it to collect.
  state.skyTimer -= dt;
  if (state.skyTimer <= 0) {
    state.skyTimer = SUN.skyInterval;
    const col = Math.floor(state.rng() * GRID.cols);
    state.suns.push({
      x: GRID.x0 + col * GRID.cellW + GRID.cellW / 2 + (state.rng() * 30 - 15),
      y: -20, vy: 42, value: SUN.skyValue, life: SUN.skyLifetime, bob: state.rng() * 6,
    });
  }
  for (const s of state.suns) {
    s.y += s.vy * dt;
    s.life -= dt;
    if (s.y > 540) s.y = 540;
  }
  state.suns = state.suns.filter((s) => s.life > 0);

  updatePlants(state, dt);
  updateEnemies(state, dt);
  updateProjectiles(state, dt);
  updateParticles(state, dt);
  checkWaveEnd(state);
}

export function collectSunAt(state, px, py) {
  const idx = state.suns.findIndex((s) => Math.hypot(s.x - px, s.y - py) < 30);
  if (idx < 0) return false;
  const s = state.suns[idx];
  state.suns.splice(idx, 1);
  state.sun += s.value;
  state.stats.sunsCollected += 1;
  return true;
}

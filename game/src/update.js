// The tick: one fixed 1/60 s step of simulation while the game is playing.
// Order matters — suns fall, plants act, enemies walk, projectiles fly,
// waves end. Hit-stop freezes the world for a beat after a big moment
// (Luna's entrance, a phase change, her death); the loop, not the tick,
// spends that timer down.

import { GRID, SUN, FLASH } from './config.js';
import { updatePlants } from './plants.js';
import { updateEnemies, checkWaveEnd } from './enemies.js';
import { updateProjectiles } from './projectiles.js';
import { updateParticles, burst } from './particles.js';
import { clearSnuff } from './light.js';
import { sfx } from './audio.js';

export function tick(state, dt) {
  if (state.screen !== 'playing') return;
  if (state.hitStop > 0) return; // frozen mid-impact; main.js spends this
  state.time += dt;
  if (state.waveActive) state.waveTime += dt;

  // A sun drifts down from the sky every few seconds; click it to collect.
  state.skyTimer -= dt;
  if (state.skyTimer <= 0) {
    state.skyTimer = SUN.skyInterval;
    // Sky suns fall over columns 0–7 only: column 8 sits under the Sound /
    // Pause buttons, and a sun there would hide behind them.
    const col = Math.floor(state.rng() * (GRID.cols - 1));
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

// Flash of Light: the active ability. Costs 100 sun, 25 s cooldown, lights
// every plot bright for 8 s, burns the snuff out of darkened plots, and
// sears every enemy on the field for 40 damage.
export function castFlash(state) {
  if (state.screen !== 'playing') return false;
  if (state.time < state.flashReadyAt) {
    state.message = `Flash recharging — ${Math.ceil(state.flashReadyAt - state.time)}s`;
    state.messageUntil = state.time + 1.4;
    sfx.error();
    return false;
  }
  if (state.sun < FLASH.cost) {
    state.message = `Flash of Light needs ${FLASH.cost} sun!`;
    state.messageUntil = state.time + 1.6;
    sfx.error();
    return false;
  }
  state.sun -= FLASH.cost;
  state.flashUntil = state.time + FLASH.duration;
  state.flashReadyAt = state.time + FLASH.cooldown;
  state.flashes += 1;
  clearSnuff(state);
  for (const e of [...state.enemies]) {
    e.hp -= FLASH.damage;
    e.flash = 0.2;
    burst(state, e.x, e.y, '#fff9c4', 6);
  }
  // Enemies the flash kills are swept by updateProjectiles' own sweep on
  // the very next tick, so no second killer is needed here.
  state.message = 'FLASH OF LIGHT! The garden blazes!';
  state.messageUntil = state.time + 2;
  state.shake = Math.max(state.shake, 4);
  sfx.flash();
  return true;
}

export function collectSunAt(state, px, py) {
  const idx = state.suns.findIndex((s) => Math.hypot(s.x - px, s.y - py) < 30);
  if (idx < 0) return false;
  const s = state.suns[idx];
  state.suns.splice(idx, 1);
  state.sun += s.value;
  // Only clicked sky suns count here — Sunbloom growth is tracked apart,
  // so this number is the player's own clicking, honestly reported.
  state.stats.sunsCollected += 1;
  return true;
}

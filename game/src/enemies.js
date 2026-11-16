// Enemies: spawning waves, walking the lanes, chewing plants, reaching the lantern.

import { ENEMIES, GRID, LANTERN, SUN, MAX_WAVES, wavePlan } from './config.js';
import { cellCenter, plantAt, waveCleared } from './state.js';
import { sfx } from './audio.js';
import { burst } from './particles.js';

export function startWave(state) {
  if (state.waveActive || state.wave >= MAX_WAVES) return false;
  state.wave += 1;
  const plan = wavePlan(state.wave);
  state.waveHpScale = plan.hpScale;
  state.waveDuration = plan.duration;
  state.waveTime = 0;
  state.waveActive = true;
  // Build a shuffled spawn queue spread over the wave duration.
  const queue = [];
  for (const [key, count] of plan.groups) {
    for (let i = 0; i < count; i++) queue.push(key);
  }
  // Shuffle with the run's rng, then assign times and lanes.
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(state.rng() * (i + 1));
    [queue[i], queue[j]] = [queue[j], queue[i]];
  }
  state.spawnQueue = queue.map((key, i) => ({
    at: 1 + (i / Math.max(1, queue.length)) * plan.duration * 0.85,
    key,
    row: Math.floor(state.rng() * GRID.rows),
  }));
  state.message = `Wave ${state.wave} — the Gloom comes!`;
  state.messageUntil = state.time + 2.2;
  sfx.horn();
  return true;
}

function spawnEnemy(state, key, row) {
  const def = ENEMIES[key];
  const hp = Math.round(def.hp * state.waveHpScale);
  const y = cellCenter(0, row).y;
  state.enemies.push({
    key, row,
    x: GRID.x0 + GRID.cols * GRID.cellW + 30,
    y,
    hp, maxHp: hp,
    speed: def.speed,
    slowUntil: 0,
    attackCooldown: 0,
    wobble: state.rng() * Math.PI * 2,
    flash: 0,
  });
}

export function updateEnemies(state, dt) {
  // Spawn due enemies.
  while (state.spawnQueue.length > 0 && state.spawnQueue[0].at <= state.waveTime) {
    const s = state.spawnQueue.shift();
    spawnEnemy(state, s.key, s.row);
  }
  for (const e of state.enemies) {
    e.flash = Math.max(0, e.flash - dt);
    e.wobble += dt * 6;
    const slowed = state.time < e.slowUntil;
    // A plant in this enemy's cell gets chewed instead of walking on.
    const col = Math.floor((e.x - GRID.x0) / GRID.cellW);
    const plant = col >= 0 && col < GRID.cols ? plantAt(state, col, e.row) : null;
    const inCell = plant && Math.abs(e.x - cellCenter(col, e.row).x) < GRID.cellW * 0.5;
    if (inCell) {
      e.attackCooldown -= dt;
      if (e.attackCooldown <= 0) {
        e.attackCooldown = 0.9;
        plant.hp -= 12;
        plant.flash = 0.15;
        burst(state, e.x - 14, e.y, '#ffb74d', 4);
        if (plant.hp <= 0) {
          state.plants = state.plants.filter((p) => p !== plant);
          sfx.plantDown();
          burst(state, cellCenter(col, e.row).x, cellCenter(col, e.row).y, '#8d6e63', 12);
        }
      }
      continue;
    }
    const speed = e.speed * (slowed ? 0.5 : 1);
    e.x -= speed * dt;
    // Reached the Heart Lantern.
    if (e.x <= LANTERN.x + 26) {
      const def = ENEMIES[e.key];
      state.lanternHp -= def.dmg;
      state.enemies = state.enemies.filter((x) => x !== e);
      burst(state, LANTERN.x + 10, e.y, '#ff5252', 14);
      sfx.lanternHit();
      state.message = 'The lantern is under attack!';
      state.messageUntil = state.time + 1.6;
      if (state.lanternHp <= 0) {
        state.lanternHp = 0;
        state.screen = 'lost';
        sfx.lose();
      }
    }
  }
}

export function checkWaveEnd(state) {
  if (!state.waveActive) return;
  if (waveCleared(state)) {
    state.waveActive = false;
    state.stats.wavesCleared += 1;
    const bonus = SUN.waveBonus + state.wave * 10;
    state.sun += bonus;
    state.score += 100 + state.wave * 50;
    state.message = `Wave ${state.wave} cleared! +${bonus} sun`;
    state.messageUntil = state.time + 2.4;
    sfx.waveClear();
    if (state.wave >= MAX_WAVES) {
      state.screen = 'won';
      state.score += state.lanternHp * 50;
      sfx.win();
    }
  }
}

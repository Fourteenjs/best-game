// Enemies: spawning waves, walking the lanes, chewing plants, reaching the
// lantern — plus the three behaviours that make round 2's roster its own:
// Snuff Moths darken plots, Gloom Wisps shoot back from range, and Luna,
// Queen of the Eclipse, fights the final wave in three phases.

import { ENEMIES, GRID, LANTERN, SUN, MAX_WAVES, DIFFICULTIES, wavePlan, nightOf } from './config.js';
import { cellCenter, plantAt, waveCleared, saveBest } from './state.js';
import { snuffArea } from './light.js';
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
  // Swift call: starting the next wave within seconds of clearing the last
  // pays a sun bonus, so a confident player is rewarded for pace.
  if (state.time - state.lastClearAt <= SUN.swiftCallWindow && state.wave > 1) {
    state.sun += SUN.swiftCallBonus;
    state.message = `Swift call! +${SUN.swiftCallBonus} sun`;
    state.messageUntil = state.time + 2.2;
  } else {
    state.message = `Wave ${state.wave} — ${nightOf(state.wave).name}!`;
    state.messageUntil = state.time + 2.2;
  }
  state.banner = `Night ${Math.floor((state.wave - 1) / 2) + 1}: ${nightOf(state.wave).name}`;
  state.bannerUntil = state.time + 2.6;
  if (state.wave === MAX_WAVES) {
    state.banner = 'FINAL NIGHT — Luna, Queen of the Eclipse';
    state.bannerUntil = state.time + 3.2;
  }
  // Build a shuffled spawn queue spread over the wave duration.
  const queue = [];
  for (const [key, count] of plan.groups) {
    for (let i = 0; i < count; i++) queue.push(key);
  }
  // Shuffle with the run's rng, then assign times and lanes. The boss always
  // walks in last, so the final wave builds to her entrance.
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(state.rng() * (i + 1));
    [queue[i], queue[j]] = [queue[j], queue[i]];
  }
  const lunaAt = queue.indexOf('luna');
  if (lunaAt >= 0) {
    queue.splice(lunaAt, 1);
    queue.push('luna');
  }
  state.spawnQueue = queue.map((key, i) => ({
    at: 1 + (i / Math.max(1, queue.length)) * plan.duration * 0.85,
    key,
    row: key === 'luna' ? 2 : Math.floor(state.rng() * GRID.rows),
  }));
  sfx.horn();
  return true;
}

function spawnEnemy(state, key, row) {
  const def = ENEMIES[key];
  const diff = DIFFICULTIES[state.difficulty] || DIFFICULTIES.gardener;
  const hp = Math.round(def.hp * state.waveHpScale * diff.enemyHpMul);
  const y = cellCenter(0, row).y;
  const e = {
    key, row,
    x: GRID.x0 + GRID.cols * GRID.cellW + 30,
    y,
    hp, maxHp: hp,
    speed: def.speed,
    slowUntil: 0,
    attackCooldown: 0,
    wobble: state.rng() * Math.PI * 2,
    flash: 0,
    snuffTimer: 1.5,
    boltTimer: 2,
    phase: 1,
  };
  state.enemies.push(e);
  if (key === 'luna') {
    state.boss = e;
    state.message = 'LUNA, QUEEN OF THE ECLIPSE, HAS COME!';
    state.messageUntil = state.time + 3;
    state.shake = Math.max(state.shake, 8);
    state.hitStop = 0.35;
    sfx.boss();
  }
  return e;
}

// Luna's phases, checked whenever she takes a hit: at 2/3 HP she quickens
// and calls Snuffs; at 1/3 she rages, darkens plots in pulses and calls
// Swift Moths. Each change shakes the screen and sounds the horn.
export function checkBossPhase(state, boss) {
  if (!boss || boss.key !== 'luna') return;
  const frac = boss.hp / boss.maxHp;
  const phase = frac <= 1 / 3 ? 3 : frac <= 2 / 3 ? 2 : 1;
  if (phase === boss.phase) return;
  boss.phase = phase;
  state.shake = Math.max(state.shake, 10);
  state.hitStop = 0.25;
  if (phase === 2) {
    boss.speed = 20;
    state.message = 'Luna quickens — Snuffs pour in!';
    spawnEnemy(state, 'snuff', 1);
    spawnEnemy(state, 'snuff', 3);
  } else {
    boss.speed = 26;
    state.message = 'Luna RAGES — the Eclipse deepens!';
    snuffArea(state, 4, 2, 1, 8);
    state.stats.snuffedPlots += 9;
    spawnEnemy(state, 'swift', 0);
    spawnEnemy(state, 'swift', 4);
  }
  state.messageUntil = state.time + 2.6;
  sfx.horn();
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
    const def = ENEMIES[e.key];
    const col = Math.floor((e.x - GRID.x0) / GRID.cellW);
    // A Gloom Wisp stops at range and shoots dark bolts at the nearest
    // plant in its row instead of walking into the garden.
    if (def.ranged && col <= def.stopCol && col >= 0) {
      e.boltTimer -= dt;
      if (e.boltTimer <= 0) {
        e.boltTimer = def.boltEvery;
        const target = nearestPlantInRow(state, e.row, e.x);
        if (target) {
          const c = cellCenter(target.col, target.row);
          state.bolts.push({ row: e.row, x: e.x - 14, y: e.y, vx: -260, dmg: def.boltDmg, target });
          sfx.bolt();
        }
      }
      continue;
    }
    // A Snuff Moth pulses darkness into the plots it crosses.
    if (def.snuffPulse) {
      e.snuffTimer -= dt;
      if (e.snuffTimer <= 0 && col >= 0 && col < GRID.cols) {
        e.snuffTimer = def.snuffPulse;
        const n = snuffArea(state, col, e.row, def.snuffRadius, def.snuffSecs);
        state.stats.snuffedPlots += n;
        burst(state, e.x, e.y, '#37474f', 10);
        sfx.snuff();
      }
    }
    // Luna's phase-3 eclipse pulse: she darkens a random patch as she walks.
    if (e.key === 'luna' && e.phase === 3) {
      e.snuffTimer -= dt;
      if (e.snuffTimer <= 0) {
        e.snuffTimer = 8;
        const rc = 2 + Math.floor(state.rng() * 5);
        const rr2 = Math.floor(state.rng() * GRID.rows);
        snuffArea(state, rc, rr2, 1, 8);
        state.stats.snuffedPlots += 9;
        sfx.snuff();
      }
    }
    // A plant in this enemy's cell gets chewed instead of walking on.
    const plant = col >= 0 && col < GRID.cols ? plantAt(state, col, e.row) : null;
    const inCell = plant && Math.abs(e.x - cellCenter(col, e.row).x) < GRID.cellW * 0.5;
    if (inCell) {
      e.attackCooldown -= dt;
      if (e.attackCooldown <= 0) {
        e.attackCooldown = 0.9;
        plant.hp -= e.key === 'luna' ? 25 : 12;
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
      state.lanternHp -= def.dmg;
      state.enemies = state.enemies.filter((x) => x !== e);
      if (state.boss === e) state.boss = null;
      burst(state, LANTERN.x + 10, e.y, '#ff5252', 14);
      state.shake = Math.max(state.shake, 6);
      sfx.lanternHit();
      state.message = 'The lantern is under attack!';
      state.messageUntil = state.time + 1.6;
      if (state.lanternHp <= 0) {
        state.lanternHp = 0;
        state.screen = 'lost';
        recordBest(state);
        sfx.lose();
      }
    }
  }
}

function nearestPlantInRow(state, row, fromX) {
  let best = null;
  for (const p of state.plants) {
    if (p.row !== row) continue;
    const c = cellCenter(p.col, p.row);
    if (c.x > fromX) continue;
    if (!best || c.x > cellCenter(best.col, best.row).x) best = p;
  }
  return best;
}

function recordBest(state) {
  const best = state.best || { score: 0, wave: 0, wins: 0 };
  best.score = Math.max(best.score, state.score);
  best.wave = Math.max(best.wave, state.wave);
  if (state.screen === 'won') best.wins += 1;
  state.best = best;
  saveBest(best);
}

export function checkWaveEnd(state) {
  if (!state.waveActive) return;
  if (waveCleared(state)) {
    state.waveActive = false;
    state.stats.wavesCleared += 1;
    state.lastClearAt = state.time;
    const bonus = SUN.waveBonus + state.wave * 10;
    state.sun += bonus;
    state.score += 100 + state.wave * 50;
    state.message = `Wave ${state.wave} cleared! +${bonus} sun`;
    state.messageUntil = state.time + 2.4;
    sfx.waveClear();
    if (state.wave >= MAX_WAVES) {
      state.screen = 'won';
      state.score += state.lanternHp * 50;
      recordBest(state);
      sfx.win();
    }
  }
}

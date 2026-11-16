// Plants: planting rules and per-plant behaviour (shooting, sun growing).

import { PLANTS, SUN, GRID } from './config.js';
import { cellCenter, plantAt } from './state.js';
import { sfx } from './audio.js';
import { burst } from './particles.js';

export function canAfford(state, key) {
  return state.sun >= PLANTS[key].cost;
}

export function tryPlant(state, key, col, row) {
  const def = PLANTS[key];
  if (!def) return false;
  if (plantAt(state, col, row)) { sfx.error(); return false; }
  if (state.sun < def.cost) {
    state.message = 'Not enough sun!';
    state.messageUntil = state.time + 1.6;
    sfx.error();
    return false;
  }
  state.sun -= def.cost;
  state.plants.push({
    key, col, row, hp: def.hp, maxHp: def.hp,
    cooldown: 0.4, sunTimer: SUN.bloomInterval, flash: 0,
  });
  state.planted += 1;
  state.message = `${def.name} planted!`;
  state.messageUntil = state.time + 1.2;
  sfx.plant();
  burst(state, cellCenter(col, row).x, cellCenter(col, row).y, def.color, 10);
  return true;
}

export function removePlant(state, col, row) {
  const idx = state.plants.findIndex((p) => p.col === col && p.row === row);
  if (idx < 0) return false;
  const p = state.plants[idx];
  const c = cellCenter(col, row);
  burst(state, c.x, c.y, '#c9b18a', 8);
  state.plants.splice(idx, 1);
  sfx.click();
  return true;
}

function nearestEnemyInRow(state, row, fromX) {
  // Only enemies already inside the garden: firing at one still off-screen
  // wastes shots the player cannot see land.
  const rightEdge = GRID.x0 + GRID.cols * GRID.cellW;
  let best = null;
  for (const e of state.enemies) {
    if (e.row !== row || e.x < fromX - 10 || e.x > rightEdge) continue;
    if (!best || e.x < best.x) best = e;
  }
  return best;
}

export function updatePlants(state, dt) {
  for (const p of state.plants) {
    p.flash = Math.max(0, p.flash - dt);
    p.cooldown -= dt;
    const c = cellCenter(p.col, p.row);
    if (p.key === 'sunbloom') {
      p.sunTimer -= dt;
      if (p.sunTimer <= 0) {
        p.sunTimer = SUN.bloomInterval;
        state.sun += SUN.bloomValue;
        state.stats.sunsCollected += 1;
        burst(state, c.x, c.y - 14, '#ffd94a', 6);
        sfx.sun();
      }
      continue;
    }
    const target = nearestEnemyInRow(state, p.row, c.x);
    if (!target || p.cooldown > 0) continue;
    if (p.key === 'thornspitter') {
      p.cooldown = 1.2;
      state.projectiles.push({ kind: 'thorn', row: p.row, x: c.x + 18, y: c.y - 6, vx: 420, dmg: 20, splash: 0, slow: 0 });
      p.flash = 0.12;
      sfx.shoot();
    } else if (p.key === 'frostbloom') {
      p.cooldown = 1.8;
      state.projectiles.push({ kind: 'frost', row: p.row, x: c.x + 18, y: c.y - 6, vx: 360, dmg: 10, splash: 0, slow: 3 });
      p.flash = 0.12;
      sfx.frost();
    } else if (p.key === 'moonpetal') {
      p.cooldown = 2.6;
      state.projectiles.push({ kind: 'moon', row: p.row, x: c.x + 18, y: c.y - 6, vx: 300, dmg: 60, splash: 70, slow: 0 });
      p.flash = 0.15;
      sfx.moon();
    }
  }
}

// Plants: planting rules, upgrades, and per-plant behaviour.
//
// The light rule lives here: a shooter only fires from a lit plot
// (cellLight >= 1), and a bright plot (level 2, torch halo or Flash) deals
// +50% damage. A plant in the dark is dormant — it still stands, it just
// cannot shoot, and the renderer greys it out so the player can see why.
// Sunblooms still grow sun in the dark: they are light sources themselves.

import { PLANTS, SUN, GRID, UPGRADE_COST } from './config.js';
import { cellCenter, plantAt } from './state.js';
import { cellLight, BRIGHT_DMG_MUL } from './light.js';
import { sfx } from './audio.js';
import { burst } from './particles.js';

export function canAfford(state, key) {
  return state.sun >= PLANTS[key].cost;
}

function say(state, text, secs = 1.6) {
  state.message = text;
  state.messageUntil = state.time + secs;
}

export function tryPlant(state, key, col, row) {
  const def = PLANTS[key];
  if (!def) return false;
  if (plantAt(state, col, row)) { sfx.error(); return false; }
  if (state.sun < def.cost) {
    say(state, 'Not enough sun!');
    sfx.error();
    return false;
  }
  state.sun -= def.cost;
  state.plants.push({
    key, col, row, hp: def.hp, maxHp: def.hp,
    cooldown: 0.4, sunTimer: SUN.bloomInterval, flash: 0, tier: 1,
  });
  state.planted += 1;
  if (cellLight(state, col, row) === 0 && def.light === 0) {
    say(state, `${def.name} planted — but this plot is DARK!`, 2.2);
  } else {
    say(state, `${def.name} planted!`, 1.2);
  }
  if (state.tutorialStep === 0) state.tutorialStep = 1;
  sfx.plant();
  burst(state, cellCenter(col, row).x, cellCenter(col, row).y, def.color, 10);
  return true;
}

export function removePlant(state, col, row) {
  const idx = state.plants.findIndex((p) => p.col === col && p.row === row);
  if (idx < 0) return false;
  const c = cellCenter(col, row);
  burst(state, c.x, c.y, '#c9b18a', 8);
  state.plants.splice(idx, 1);
  sfx.click();
  return true;
}

// One star: pay 75 sun to raise a plant to tier 2. Returns false with a
// message when it cannot happen (no plant, already tier 2, too poor).
export function tryUpgrade(state, col, row) {
  const p = plantAt(state, col, row);
  if (!p) { say(state, 'Nothing to upgrade here.'); sfx.error(); return false; }
  if (p.tier >= 2) { say(state, `${PLANTS[p.key].name} is already ★ tier 2.`); sfx.error(); return false; }
  const cost = PLANTS[p.key].upgrade.cost || UPGRADE_COST;
  if (state.sun < cost) { say(state, 'Not enough sun to upgrade!'); sfx.error(); return false; }
  state.sun -= cost;
  p.tier = 2;
  p.maxHp = Math.round(p.maxHp * 1.5);
  p.hp = p.maxHp;
  state.upgraded += 1;
  say(state, `${PLANTS[p.key].name} upgraded to ★ tier 2!`, 1.8);
  const c = cellCenter(col, row);
  burst(state, c.x, c.y - 10, '#ffd94a', 16);
  sfx.upgrade();
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
    const def = PLANTS[p.key];
    const up = p.tier >= 2 ? def.upgrade : null;
    if (p.key === 'sunbloom') {
      p.sunTimer -= dt;
      const interval = up ? up.sunInterval : SUN.bloomInterval;
      const value = up ? up.sunValue : SUN.bloomValue;
      if (p.sunTimer <= 0) {
        p.sunTimer = interval;
        state.sun += value;
        state.stats.sunFromBlooms += 1;
        burst(state, c.x, c.y - 14, '#ffd94a', 6);
        sfx.sun();
      }
      continue;
    }
    if (p.key === 'torch') continue; // a torch fights with light, not shots
    // The light rule: dormant in the dark, bright plots hit 50% harder.
    const light = cellLight(state, p.col, p.row);
    if (light === 0) continue;
    const dmgMul = light === 2 ? BRIGHT_DMG_MUL : 1;
    const target = nearestEnemyInRow(state, p.row, c.x);
    if (!target || p.cooldown > 0) continue;
    if (p.key === 'thornspitter') {
      p.cooldown = up ? up.cooldown : 1.2;
      const dmg = Math.round((up ? up.dmg : 20) * dmgMul);
      state.projectiles.push({ kind: 'thorn', row: p.row, x: c.x + 18, y: c.y - 6, vx: 420, dmg, splash: 0, slow: 0 });
      p.flash = 0.12;
      sfx.shoot();
    } else if (p.key === 'frostbloom') {
      p.cooldown = up ? up.cooldown : 1.8;
      const dmg = Math.round((up ? up.dmg : 10) * dmgMul);
      state.projectiles.push({ kind: 'frost', row: p.row, x: c.x + 18, y: c.y - 6, vx: 360, dmg, splash: 0, slow: up ? up.slow : 3 });
      p.flash = 0.12;
      sfx.frost();
    } else if (p.key === 'moonpetal') {
      p.cooldown = up ? up.cooldown : 2.6;
      const dmg = Math.round((up ? up.dmg : 60) * dmgMul);
      state.projectiles.push({ kind: 'moon', row: p.row, x: c.x + 18, y: c.y - 6, vx: 300, dmg, splash: up ? up.splash : 70, slow: 0 });
      p.flash = 0.15;
      sfx.moon();
    }
  }
}

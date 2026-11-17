// Projectiles: thorns, frost shards and moon orbs flying left-to-right down
// a lane, and the Gloom Wisps' dark bolts flying back the other way.
// Every hit shows a floating damage number, so the player can see the
// bright-plot +50% and the upgrade numbers land.

import { ENEMIES } from './config.js';
import { sfx } from './audio.js';
import { burst, damageNumber } from './particles.js';
import { checkBossPhase } from './enemies.js';

function hurt(state, e, dmg) {
  e.hp -= dmg;
  e.flash = 0.12;
  damageNumber(state, e.x, e.y - e.radius - 6, String(dmg), dmg >= 60 ? '#ffd94a' : '#ffffff');
  if (e.key === 'luna') checkBossPhase(state, e);
}

export function updateProjectiles(state, dt) {
  for (const pr of state.projectiles) {
    pr.x += pr.vx * dt;
    if (pr.x > 980) continue;
    // Hit the closest enemy in this row the projectile has reached: the one
    // with the smallest x among those within range (enemies walk in from
    // the right).
    let target = null;
    for (const e of state.enemies) {
      if (e.row !== pr.row || Math.abs(e.x - pr.x) >= 24) continue;
      if (!target || e.x < target.x) target = e;
    }
    if (!target) continue;
    hurt(state, target, pr.dmg);
    if (pr.slow > 0) target.slowUntil = state.time + pr.slow;
    if (pr.splash > 0) {
      for (const other of state.enemies) {
        if (other === target || other.row !== pr.row) continue;
        if (Math.abs(other.x - target.x) < pr.splash) {
          hurt(state, other, Math.round(pr.dmg / 2));
          if (other.hp <= 0) killEnemy(state, other);
        }
      }
      burst(state, target.x, target.y, '#c9a7ff', 12);
    } else {
      burst(state, target.x, target.y, pr.kind === 'frost' ? '#8fd8ff' : '#aed581', 5);
    }
    sfx.hit();
    pr.dead = true;
    if (target.hp <= 0) killEnemy(state, target);
  }
  state.projectiles = state.projectiles.filter((p) => !p.dead && p.x <= 980);
  // Sweep enemies killed by splash damage.
  for (const e of [...state.enemies]) {
    if (e.hp <= 0) killEnemy(state, e);
  }
  // Wisp bolts: fly left, hurt the plant they were aimed at when they arrive.
  for (const b of state.bolts) {
    b.x += b.vx * dt;
    const t = b.target;
    const hitPlant = t && state.plants.includes(t);
    if (hitPlant) {
      const cx = 96 + t.col * 88 + 44;
      const cy = 150 + t.row * 78 + 39;
      if (b.x <= cx + 10) {
        t.hp -= b.dmg;
        t.flash = 0.2;
        burst(state, cx, cy, '#80cbc4', 6);
        damageNumber(state, cx, cy - 24, '-' + b.dmg, '#80cbc4');
        sfx.boltHit();
        b.dead = true;
        if (t.hp <= 0) {
          state.plants = state.plants.filter((p) => p !== t);
          burst(state, cx, cy, '#8d6e63', 12);
          sfx.plantDown();
        }
      }
    }
    if (b.x < 40) b.dead = true;
  }
  state.bolts = state.bolts.filter((b) => !b.dead);
}

export function killEnemy(state, e) {
  if (!state.enemies.includes(e)) return;
  state.enemies = state.enemies.filter((x) => x !== e);
  if (state.boss === e) state.boss = null;
  const def = ENEMIES[e.key];
  state.score += def.score;
  state.kills += 1;
  burst(state, e.x, e.y, def.wing, 14);
  burst(state, e.x, e.y, '#ffffff', 6);
  if (e.key === 'luna') {
    state.shake = Math.max(state.shake, 12);
    state.hitStop = 0.4;
  }
  sfx.enemyDown();
}

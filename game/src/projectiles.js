// Projectiles: thorns, frost shards and moon orbs flying left-to-right down a lane.

import { ENEMIES } from './config.js';
import { sfx } from './audio.js';
import { burst } from './particles.js';

export function updateProjectiles(state, dt) {
  for (const pr of state.projectiles) {
    pr.x += pr.vx * dt;
    if (pr.x > 980) continue;
    // Hit the closest enemy in this row the projectile has reached: the one with
    // the smallest x among those within range (enemies walk in from the right).
    let target = null;
    for (const e of state.enemies) {
      if (e.row !== pr.row || Math.abs(e.x - pr.x) >= 24) continue;
      if (!target || e.x < target.x) target = e;
    }
    if (!target) continue;
    target.hp -= pr.dmg;
    target.flash = 0.12;
    if (pr.slow > 0) target.slowUntil = state.time + pr.slow;
    if (pr.splash > 0) {
      for (const other of state.enemies) {
        if (other === target || other.row !== pr.row) continue;
        if (Math.abs(other.x - target.x) < pr.splash) {
          other.hp -= Math.round(pr.dmg / 2);
          other.flash = 0.12;
          // A splash kill is final at once, so no later projectile in this
          // tick can waste a hit on an enemy that is already down.
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
}

export function killEnemy(state, e) {
  if (!state.enemies.includes(e)) return;
  state.enemies = state.enemies.filter((x) => x !== e);
  const def = ENEMIES[e.key];
  state.score += def.score;
  state.kills += 1;
  burst(state, e.x, e.y, def.wing, 14);
  burst(state, e.x, e.y, '#ffffff', 6);
  sfx.enemyDown();
}

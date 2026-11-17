// Actors: the plants, the moths, the shots, the suns and the sparks.
// Every plant and every enemy has its own silhouette, not just its own
// colour: a spiky thorn-cactus, a six-point frost crystal, a crescent moon
// bloom, a lantern torch, a dart-swift, an armoured beetle, a smoke-snuff,
// a ghostly wisp — and Luna, whose wingspan, crown and eye-spots make her
// unmistakable, and whose wings darken as her phases deepen.

import { PLANTS, ENEMIES } from './config.js';
import { cellCenter } from './state.js';
import { cellLight } from './light.js';
import { flower, FONT } from './draw-helpers.js';

function drawTierStar(ctx, x, y) {
  ctx.fillStyle = '#ffd94a';
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i / 10) * Math.PI * 2;
    const r = i % 2 === 0 ? 9 : 4;
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#b8860b';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawStem(ctx, c) {
  ctx.strokeStyle = '#2e7d32';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(c.x, c.y + 30);
  ctx.lineTo(c.x, c.y + 2);
  ctx.stroke();
  ctx.fillStyle = '#43a047';
  ctx.beginPath();
  ctx.ellipse(c.x - 14, c.y + 20, 12, 5, -0.5, 0, Math.PI * 2);
  ctx.ellipse(c.x + 14, c.y + 22, 12, 5, 0.5, 0, Math.PI * 2);
  ctx.fill();
}

export function drawPlants(ctx, state) {
  for (const p of state.plants) {
    const def = PLANTS[p.key];
    const c = cellCenter(p.col, p.row);
    const dormant = state.screen !== 'title' && cellLight(state, p.col, p.row) === 0 && def.light === 0;
    ctx.save();
    if (dormant) ctx.globalAlpha = 0.45; // greyed out: it cannot shoot here
    if (p.key === 'torch') {
      // Ember Torch: a little lantern post with a flame, haloing the plots
      // around it. Tier 2 burns taller and lights 5×5.
      const tall = p.tier >= 2 ? 1.25 : 1;
      const glow = ctx.createRadialGradient(c.x, c.y - 16, 4, c.x, c.y - 16, 46 * tall);
      glow.addColorStop(0, 'rgba(255,183,77,0.5)');
      glow.addColorStop(1, 'rgba(255,183,77,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(c.x - 48, c.y - 64, 96, 96);
      ctx.fillStyle = '#5d4037';
      ctx.fillRect(c.x - 4, c.y - 6, 8, 38);
      ctx.fillStyle = '#8d6e63';
      ctx.fillRect(c.x - 14, c.y - 34, 28, 26);
      ctx.fillStyle = '#ffd65a';
      ctx.fillRect(c.x - 10, c.y - 30, 20, 18);
      const fl = 4 + Math.sin(state.time * 5 + p.col) * 1.5;
      ctx.fillStyle = '#ff8a3d';
      ctx.beginPath();
      ctx.moveTo(c.x, c.y - 48 * tall);
      ctx.quadraticCurveTo(c.x + fl, c.y - 36, c.x, c.y - 28);
      ctx.quadraticCurveTo(c.x - fl, c.y - 36, c.x, c.y - 48 * tall);
      ctx.fill();
    } else {
      drawStem(ctx, c);
      if (p.key === 'sunbloom') {
        flower(ctx, c.x, c.y - 2, '#ffd94a', '#ff9d2e', 20, state.time + p.col, p.flash);
        ctx.fillStyle = '#fff176';
        ctx.beginPath();
        ctx.arc(c.x, c.y - 26, 4 + Math.sin(state.time * 3) * 1.2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.key === 'thornspitter') {
        // Spiky cactus ball with a snout tube that spits thorns.
        ctx.fillStyle = '#4caf50';
        ctx.beginPath();
        ctx.arc(c.x, c.y - 4, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#1b5e20';
        ctx.lineWidth = 2.5;
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(c.x + Math.cos(a) * 16, c.y - 4 + Math.sin(a) * 16);
          ctx.lineTo(c.x + Math.cos(a) * 23, c.y - 4 + Math.sin(a) * 23);
          ctx.stroke();
        }
        ctx.fillStyle = '#2e7d32';
        ctx.fillRect(c.x + 8, c.y - 10, 16, 9);
        ctx.fillStyle = '#1b5e20';
        ctx.beginPath();
        ctx.arc(c.x - 4, c.y - 10, 2.5, 0, Math.PI * 2);
        ctx.arc(c.x - 4, c.y + 2, 2.5, 0, Math.PI * 2);
        ctx.fill();
        if (p.flash > 0) {
          ctx.globalAlpha = 0.5;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(c.x, c.y - 4, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = dormant ? 0.45 : 1;
        }
      } else if (p.key === 'frostbloom') {
        // Six-point ice crystal: a star, not a flower.
        ctx.save();
        ctx.translate(c.x, c.y - 6);
        ctx.fillStyle = '#4fc3f7';
        ctx.beginPath();
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2;
          const r = i % 2 === 0 ? 20 : 8;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#e1f5fe';
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.fillStyle = '#e1f5fe';
        for (let i = 0; i < 3; i++) ctx.fillRect(c.x - 12 + i * 10, c.y - 24, 3, 8);
      } else {
        // Moonpetal: a crescent moon ringed by violet petals.
        flower(ctx, c.x, c.y - 2, '#9575cd', '#5e35b1', 20, state.time + p.col, p.flash);
        ctx.fillStyle = '#ede7f6';
        ctx.beginPath();
        ctx.arc(c.x, c.y - 4, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#5e35b1';
        ctx.beginPath();
        ctx.arc(c.x + 2, c.y - 4, 5.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (p.tier >= 2) drawTierStar(ctx, c.x + 22, c.y - 30);
    if (dormant) {
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = 'bold 10px ' + FONT;
      ctx.textAlign = 'center';
      ctx.fillText('DARK', c.x, c.y + 44);
      ctx.textAlign = 'left';
    }
    ctx.restore();
    if (p.hp < p.maxHp) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(c.x - 22, c.y + 32, 44, 5);
      ctx.fillStyle = '#8bc34a';
      ctx.fillRect(c.x - 22, c.y + 32, 44 * (p.hp / p.maxHp), 5);
    }
  }
}

function drawLuna(ctx, e, def, t) {
  // Luna, Queen of the Eclipse: wingspan far wider than any moth, a crown,
  // eye-spots on her wings, and wings that darken with each phase.
  const flap = Math.sin(e.wobble) * 0.35;
  const wingTint = e.phase === 3 ? '#7b1fa2' : e.phase === 2 ? '#ab47bc' : def.wing;
  ctx.save();
  ctx.translate(e.x, e.y);
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.scale(1, side);
    ctx.fillStyle = wingTint;
    ctx.save();
    ctx.rotate(-0.35 - flap * 0.25);
    ctx.beginPath();
    ctx.ellipse(-16, -30, 34, 20, -0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = wingTint;
    ctx.save();
    ctx.rotate(0.3 + flap * 0.25);
    ctx.beginPath();
    ctx.ellipse(-12, 26, 24, 14, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // Eye-spots on the upper wings.
    ctx.fillStyle = e.phase === 3 ? '#ff5252' : '#ffeb3b';
    ctx.beginPath();
    ctx.arc(-30, -30, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2e2a55';
    ctx.beginPath();
    ctx.arc(-30, -30, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // Crown.
  ctx.fillStyle = '#ffd94a';
  ctx.beginPath();
  ctx.moveTo(-12, -26);
  ctx.lineTo(-8, -38);
  ctx.lineTo(-4, -27);
  ctx.lineTo(0, -40);
  ctx.lineTo(4, -27);
  ctx.lineTo(8, -38);
  ctx.lineTo(12, -26);
  ctx.closePath();
  ctx.fill();
  // Long body.
  ctx.fillStyle = def.color;
  ctx.beginPath();
  ctx.ellipse(0, 0, 14, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffeb3b';
  ctx.beginPath();
  ctx.arc(-7, -14, 3.5, 0, Math.PI * 2);
  ctx.arc(-7, -6, 3.5, 0, Math.PI * 2);
  ctx.fill();
  if (e.flash > 0) {
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, 0, 14, 26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
  // Boss HP bar under her wings.
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(e.x - 40, e.y - def.radius - 30, 80, 7);
  ctx.fillStyle = e.phase === 3 ? '#ff5252' : '#ce93d8';
  ctx.fillRect(e.x - 40, e.y - def.radius - 30, 80 * Math.max(0, e.hp / e.maxHp), 7);
}

export function drawEnemies(ctx, state) {
  for (const e of state.enemies) {
    const def = ENEMIES[e.key];
    if (e.key === 'luna') { drawLuna(ctx, e, def, state.time); continue; }
    const flap = Math.sin(e.wobble) * 0.55;
    const bob = Math.sin(e.wobble * 0.7) * 3;
    const y = e.y + bob;
    ctx.save();
    ctx.translate(e.x, y);
    if (e.key === 'swift') {
      // Swift Moth: a slim dart with swept-back wings.
      ctx.fillStyle = def.wing;
      ctx.save();
      ctx.rotate(-0.9 - flap * 0.2);
      ctx.beginPath();
      ctx.ellipse(-6, -10, 18, 5, -0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.rotate(0.9 + flap * 0.2);
      ctx.beginPath();
      ctx.ellipse(-6, 10, 18, 5, 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = def.color;
      ctx.beginPath();
      ctx.moveTo(-18, 0);
      ctx.lineTo(12, -5);
      ctx.lineTo(18, 0);
      ctx.lineTo(12, 5);
      ctx.closePath();
      ctx.fill();
    } else if (e.key === 'beetle') {
      // Bulb Beetle: a round armoured shell with a horn and a shine arc.
      ctx.fillStyle = def.wing;
      ctx.beginPath();
      ctx.arc(0, 0, def.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = def.color;
      ctx.beginPath();
      ctx.arc(0, 0, def.radius - 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#c8e6c9';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(-4, -4, def.radius * 0.55, -1.4, 1.0);
      ctx.stroke();
      ctx.strokeStyle = def.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-def.radius + 4, 0);
      ctx.lineTo(-def.radius - 10, -8);
      ctx.stroke();
      ctx.fillStyle = '#ff5252';
      ctx.beginPath();
      ctx.arc(-def.radius + 8, -5, 3, 0, Math.PI * 2);
      ctx.arc(-def.radius + 8, 5, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (e.key === 'snuff') {
      // Snuff Moth: a ragged smoke blob with hollow eyes — it drinks light.
      ctx.fillStyle = 'rgba(84,110,122,0.55)';
      ctx.beginPath();
      ctx.arc(6, -8, 12, 0, Math.PI * 2);
      ctx.arc(-6, 10, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = def.color;
      ctx.beginPath();
      ctx.arc(0, 0, def.radius * 0.85, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#eceff1';
      ctx.beginPath();
      ctx.arc(-7, -5, 4, 0, Math.PI * 2);
      ctx.arc(-7, 5, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#263238';
      ctx.beginPath();
      ctx.arc(-7, -5, 2, 0, Math.PI * 2);
      ctx.arc(-7, 5, 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (e.key === 'wisp') {
      // Gloom Wisp: a ghostly orb with a wavy tail, hovering at range.
      ctx.fillStyle = 'rgba(128,203,196,0.35)';
      ctx.beginPath();
      ctx.arc(0, 0, def.radius + 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = def.wing;
      ctx.beginPath();
      ctx.moveTo(-10, -8);
      ctx.quadraticCurveTo(14, -14 + Math.sin(e.wobble) * 4, 22, -4);
      ctx.quadraticCurveTo(10, 0, 22, 6);
      ctx.quadraticCurveTo(12, 12 + Math.sin(e.wobble) * 4, -10, 8);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = def.color;
      ctx.beginPath();
      ctx.arc(-4, 0, def.radius * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#b2ff59';
      ctx.beginPath();
      ctx.arc(-10, -4, 2.5, 0, Math.PI * 2);
      ctx.arc(-10, 4, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Gloom Moth: broad fluttering wings over a fat body.
      ctx.fillStyle = def.wing;
      ctx.save();
      ctx.rotate(-0.5 - flap * 0.4);
      ctx.beginPath();
      ctx.ellipse(-8, -14, 15, 9, -0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.rotate(0.5 + flap * 0.4);
      ctx.beginPath();
      ctx.ellipse(-8, 12, 15, 9, 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = def.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, def.radius * 0.55, def.radius * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff5252';
      ctx.beginPath();
      ctx.arc(-8, -6, 3, 0, Math.PI * 2);
      ctx.arc(-8, 5, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    if (state.time < e.slowUntil) {
      ctx.strokeStyle = 'rgba(143,216,255,0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, def.radius + 3, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (e.flash > 0) {
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(0, 0, def.radius * 0.55, def.radius * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    // HP bar.
    if (e.hp < e.maxHp) {
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(e.x - 22, y - def.radius - 14, 44, 5);
      ctx.fillStyle = '#ff5252';
      ctx.fillRect(e.x - 22, y - def.radius - 14, 44 * Math.max(0, e.hp / e.maxHp), 5);
    }
  }
}

export function drawProjectiles(ctx, state) {
  for (const pr of state.projectiles) {
    if (pr.kind === 'thorn') {
      ctx.fillStyle = '#c5e1a5';
      ctx.beginPath();
      ctx.moveTo(pr.x + 12, pr.y);
      ctx.lineTo(pr.x - 6, pr.y - 4);
      ctx.lineTo(pr.x - 6, pr.y + 4);
      ctx.closePath();
      ctx.fill();
    } else if (pr.kind === 'frost') {
      ctx.fillStyle = '#b3e5fc';
      ctx.beginPath();
      ctx.arc(pr.x, pr.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(pr.x, pr.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const g = ctx.createRadialGradient(pr.x, pr.y, 1, pr.x, pr.y, 12);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.5, '#c9a7ff');
      g.addColorStop(1, 'rgba(94,53,177,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(pr.x, pr.y, 12, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // Wisp bolts flying back left.
  for (const b of state.bolts) {
    ctx.fillStyle = '#80cbc4';
    ctx.beginPath();
    ctx.arc(b.x, b.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#004d40';
    ctx.beginPath();
    ctx.arc(b.x, b.y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawSuns(ctx, state) {
  for (const s of state.suns) {
    const bob = Math.sin(state.time * 4 + s.bob) * 2;
    const g = ctx.createRadialGradient(s.x, s.y + bob, 2, s.x, s.y + bob, 26);
    g.addColorStop(0, 'rgba(255,241,118,0.95)');
    g.addColorStop(0.5, 'rgba(255,213,74,0.75)');
    g.addColorStop(1, 'rgba(255,213,74,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(s.x, s.y + bob, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd94a';
    ctx.beginPath();
    ctx.arc(s.x, s.y + bob, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff9d2e';
    ctx.beginPath();
    ctx.arc(s.x - 3, s.y + bob - 3, 4, 0, Math.PI * 2);
    ctx.arc(s.x + 4, s.y + bob + 2, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawParticles(ctx, state) {
  for (const p of state.particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // Floating damage numbers.
  ctx.textAlign = 'center';
  ctx.font = 'bold 14px ' + FONT;
  for (const d of state.damageNumbers) {
    ctx.globalAlpha = Math.max(0, d.life / d.maxLife);
    ctx.fillStyle = d.color;
    ctx.fillText(d.text, d.x, d.y);
  }
  ctx.globalAlpha = 1;
  ctx.textAlign = 'left';
}

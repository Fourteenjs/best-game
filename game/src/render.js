// Rendering: everything the player sees is drawn on one canvas — the garden,
// the lantern, the plants, the moths, the HUD, the cards and the menu screens.

import { VIEW, GRID, LANTERN, PLANTS, PLANT_ORDER, ENEMIES, MAX_WAVES } from './config.js';
import { cellCenter } from './state.js';

export const LAYOUT = {
  cards: PLANT_ORDER.map((key, i) => ({ key, x: 12 + i * 158, y: 548, w: 150, h: 44 })),
  shovel: { x: 12 + 4 * 158, y: 548, w: 74, h: 44 },
  waveBtn: { x: 12 + 4 * 158 + 82, y: 548, w: 150, h: 44 },
  muteBtn: { x: 856, y: 10, w: 44, h: 36 },
  pauseBtn: { x: 906, y: 10, w: 44, h: 36 },
  startBtn: { x: 380, y: 400, w: 200, h: 56 },
  againBtn: { x: 380, y: 420, w: 200, h: 56 },
};

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function flower(ctx, x, y, petal, center, r, t, flash) {
  ctx.save();
  ctx.translate(x, y);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.sin(t * 2 + i) * 0.05;
    ctx.fillStyle = petal;
    ctx.beginPath();
    ctx.ellipse(Math.cos(a) * r * 0.75, Math.sin(a) * r * 0.75 - 4, r * 0.52, r * 0.34, a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = center;
  ctx.beginPath();
  ctx.arc(0, -4, r * 0.58, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3a2b12';
  ctx.beginPath();
  ctx.arc(-r * 0.2, -6, r * 0.09, 0, Math.PI * 2);
  ctx.arc(r * 0.2, -6, r * 0.09, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#3a2b12';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(0, -2, r * 0.22, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  if (flash > 0) {
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, -4, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

function drawBackground(ctx, state) {
  const g = ctx.createLinearGradient(0, 0, 0, VIEW.height);
  g.addColorStop(0, '#1b2340');
  g.addColorStop(0.35, '#2c3a63');
  g.addColorStop(0.62, '#4a5b52');
  g.addColorStop(1, '#2c4630');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  // Stars.
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  for (let i = 0; i < 40; i++) {
    const x = (i * 173) % VIEW.width;
    const y = (i * 97) % 120;
    ctx.globalAlpha = 0.3 + ((i * 7) % 10) / 16;
    ctx.fillRect(x, y, 2, 2);
  }
  ctx.globalAlpha = 1;
  // Moon.
  ctx.fillStyle = '#ffe9a8';
  ctx.beginPath();
  ctx.arc(760, 84, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,233,168,0.25)';
  ctx.beginPath();
  ctx.arc(760, 84, 44, 0, Math.PI * 2);
  ctx.fill();
  // Garden lawn.
  ctx.fillStyle = '#3f7a44';
  ctx.fillRect(0, GRID.y0 - 14, VIEW.width, GRID.rows * GRID.cellH + 28);
  ctx.fillStyle = '#38693c';
  for (let r = 0; r < GRID.rows; r++) {
    if (r % 2 === 0) ctx.fillRect(0, GRID.y0 + r * GRID.cellH, VIEW.width, GRID.cellH);
  }
  // Planting plots.
  for (let r = 0; r < GRID.rows; r++) {
    for (let c = 0; c < GRID.cols; c++) {
      const x = GRID.x0 + c * GRID.cellW;
      const y = GRID.y0 + r * GRID.cellH;
      ctx.fillStyle = (c + r) % 2 === 0 ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.05)';
      rr(ctx, x + 4, y + 4, GRID.cellW - 8, GRID.cellH - 8, 10);
      ctx.fill();
    }
  }
}

function drawLantern(ctx, state) {
  const x = LANTERN.x;
  const y = GRID.y0 + (GRID.rows * GRID.cellH) / 2;
  const pulse = 0.75 + Math.sin(state.time * 2.4) * 0.25;
  const glow = ctx.createRadialGradient(x, y, 8, x, y, 120 * pulse);
  glow.addColorStop(0, 'rgba(255,214,90,0.55)');
  glow.addColorStop(1, 'rgba(255,214,90,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(x - 120, y - 120, 240, 240);
  // Post and lamp.
  ctx.fillStyle = '#5d4037';
  ctx.fillRect(x - 5, y - 10, 10, 96);
  ctx.fillStyle = '#8d6e63';
  ctx.beginPath();
  ctx.moveTo(x - 22, y - 8);
  ctx.lineTo(x + 22, y - 8);
  ctx.lineTo(x + 14, y - 52);
  ctx.lineTo(x - 14, y - 52);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = state.lanternHp > 3 ? '#ffd65a' : '#ff8a65';
  ctx.beginPath();
  ctx.arc(x, y - 30, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath();
  ctx.arc(x - 4, y - 34, 4, 0, Math.PI * 2);
  ctx.fill();
  // HP hearts under the lamp, in two rows of five so they stay clear of the garden.
  for (let i = 0; i < state.lanternMax; i++) {
    const hx = x - 26 + (i % 5) * 15;
    const hy = y + 92 + Math.floor(i / 5) * 16;
    ctx.fillStyle = i < state.lanternHp ? '#ff5b6e' : 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.arc(hx - 3, hy, 4.5, 0, Math.PI * 2);
    ctx.arc(hx + 3, hy, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(hx - 7, hy + 1);
    ctx.lineTo(hx + 7, hy + 1);
    ctx.lineTo(hx, hy + 9);
    ctx.closePath();
    ctx.fill();
  }
}

function drawPlants(ctx, state) {
  for (const p of state.plants) {
    const def = PLANTS[p.key];
    const c = cellCenter(p.col, p.row);
    // Stem.
    ctx.strokeStyle = '#2e7d32';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(c.x, c.y + 30);
    ctx.lineTo(c.x, c.y + 2);
    ctx.stroke();
    // Leaves.
    ctx.fillStyle = '#43a047';
    ctx.beginPath();
    ctx.ellipse(c.x - 14, c.y + 20, 12, 5, -0.5, 0, Math.PI * 2);
    ctx.ellipse(c.x + 14, c.y + 22, 12, 5, 0.5, 0, Math.PI * 2);
    ctx.fill();
    if (p.key === 'sunbloom') {
      flower(ctx, c.x, c.y - 2, '#ffd94a', '#ff9d2e', 20, state.time + p.col, p.flash);
      ctx.fillStyle = '#fff176';
      ctx.beginPath();
      ctx.arc(c.x, c.y - 26, 4 + Math.sin(state.time * 3) * 1.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.key === 'thornspitter') {
      flower(ctx, c.x, c.y - 2, '#7ee081', '#2e7d32', 19, state.time + p.col, p.flash);
      ctx.fillStyle = '#1b5e20';
      ctx.beginPath();
      ctx.arc(c.x, c.y - 4, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.key === 'frostbloom') {
      flower(ctx, c.x, c.y - 2, '#8fd8ff', '#1565c0', 19, state.time + p.col, p.flash);
      ctx.fillStyle = '#e1f5fe';
      for (let i = 0; i < 3; i++) {
        ctx.fillRect(c.x - 12 + i * 10, c.y - 22, 3, 8);
      }
    } else {
      flower(ctx, c.x, c.y - 2, '#c9a7ff', '#5e35b1', 20, state.time + p.col, p.flash);
      ctx.fillStyle = '#ede7f6';
      ctx.beginPath();
      ctx.arc(c.x, c.y - 4, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#5e35b1';
      ctx.beginPath();
      ctx.arc(c.x, c.y - 4, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
    if (p.hp < p.maxHp) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(c.x - 22, c.y + 32, 44, 5);
      ctx.fillStyle = '#8bc34a';
      ctx.fillRect(c.x - 22, c.y + 32, 44 * (p.hp / p.maxHp), 5);
    }
  }
}

function drawEnemies(ctx, state) {
  for (const e of state.enemies) {
    const def = ENEMIES[e.key];
    const flap = Math.sin(e.wobble) * 0.55;
    const bob = Math.sin(e.wobble * 0.7) * 3;
    const y = e.y + bob;
    ctx.save();
    ctx.translate(e.x, y);
    // Wings.
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
    // Body.
    ctx.fillStyle = def.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, def.radius * 0.55, def.radius * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
    // Eyes (glowing, facing the lantern).
    ctx.fillStyle = e.key === 'luna' ? '#ffeb3b' : '#ff5252';
    ctx.beginPath();
    ctx.arc(-8, -6, 3, 0, Math.PI * 2);
    ctx.arc(-8, 5, 3, 0, Math.PI * 2);
    ctx.fill();
    if (e.key === 'beetle') {
      ctx.strokeStyle = '#c8e6c9';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, def.radius * 0.55, -1.2, 1.2);
      ctx.stroke();
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

function drawProjectiles(ctx, state) {
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
}

function drawSuns(ctx, state) {
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

function drawParticles(ctx, state) {
  for (const p of state.particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function pill(ctx, x, y, w, h, fill, stroke) {
  ctx.fillStyle = fill;
  rr(ctx, x, y, w, h, 10);
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    rr(ctx, x, y, w, h, 10);
    ctx.stroke();
  }
}

function drawHUD(ctx, state) {
  ctx.textBaseline = 'middle';
  // Sun purse.
  pill(ctx, 12, 10, 150, 36, 'rgba(20,24,48,0.85)', '#ffd94a');
  ctx.fillStyle = '#ffd94a';
  ctx.beginPath();
  ctx.arc(34, 28, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ff9d2e';
  ctx.beginPath();
  ctx.arc(31, 25, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`${state.sun}`, 54, 29);
  // Wave.
  pill(ctx, 172, 10, 150, 36, 'rgba(20,24,48,0.85)');
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 17px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText(`Wave ${Math.max(1, state.wave)} / ${MAX_WAVES}`, 188, 29);
  // Lantern HP.
  pill(ctx, 332, 10, 170, 36, 'rgba(20,24,48,0.85)');
  ctx.fillStyle = '#ff8a80';
  ctx.font = 'bold 17px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText(`Lantern ${state.lanternHp}/${state.lanternMax}`, 348, 29);
  // Score.
  pill(ctx, 512, 10, 170, 36, 'rgba(20,24,48,0.85)');
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`Score ${state.score}`, 528, 29);
  // Enemies remaining.
  const left = state.enemies.length + state.spawnQueue.length;
  pill(ctx, 692, 10, 150, 36, 'rgba(20,24,48,0.85)');
  ctx.fillStyle = left > 0 ? '#ce93d8' : '#a5d6a7';
  ctx.fillText(state.waveActive ? `Moths ${left}` : 'Between waves', 706, 29);
  // Mute / pause.
  pill(ctx, LAYOUT.muteBtn.x, LAYOUT.muteBtn.y, 44, 36, 'rgba(20,24,48,0.85)', '#8d9bb5');
  pill(ctx, LAYOUT.pauseBtn.x, LAYOUT.pauseBtn.y, 44, 36, 'rgba(20,24,48,0.85)', '#8d9bb5');
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(state.muted ? 'Muted' : 'Sound', LAYOUT.muteBtn.x + 22, 29);
  ctx.fillText(state.screen === 'paused' ? 'Play' : 'Pause', LAYOUT.pauseBtn.x + 22, 29);
  ctx.textAlign = 'left';
  // Toast message.
  if (state.message && state.time < state.messageUntil) {
    ctx.font = 'bold 18px "Trebuchet MS", Verdana, sans-serif';
    const w = ctx.measureText(state.message).width + 28;
    pill(ctx, (VIEW.width - w) / 2, 62, w, 32, 'rgba(20,24,48,0.88)', '#ffd94a');
    ctx.fillStyle = '#ffe082';
    ctx.textAlign = 'center';
    ctx.fillText(state.message, VIEW.width / 2, 79);
    ctx.textAlign = 'left';
  }
}

function drawCards(ctx, state) {
  for (const card of LAYOUT.cards) {
    const def = PLANTS[card.key];
    const afford = state.sun >= def.cost;
    const selected = state.selected === card.key && !state.shovel;
    ctx.globalAlpha = afford ? 1 : 0.55;
    pill(ctx, card.x, card.y, card.w, card.h, selected ? '#3e5a8a' : 'rgba(20,24,48,0.9)', selected ? '#ffd94a' : '#5b6b8c');
    flower(ctx, card.x + 24, card.y + 26, def.petal, def.center, 13, state.time, 0);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px "Trebuchet MS", Verdana, sans-serif';
    ctx.fillText(def.name, card.x + 44, card.y + 15);
    ctx.fillStyle = '#ffd94a';
    ctx.font = 'bold 13px "Trebuchet MS", Verdana, sans-serif';
    ctx.fillText(`${def.cost} sun  ·  [${PLANT_ORDER.indexOf(card.key) + 1}]`, card.x + 44, card.y + 32);
    ctx.globalAlpha = 1;
  }
  // Shovel.
  const sh = LAYOUT.shovel;
  pill(ctx, sh.x, sh.y, sh.w, sh.h, state.shovel ? '#7a3b3b' : 'rgba(20,24,48,0.9)', state.shovel ? '#ff8a80' : '#5b6b8c');
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Shovel', sh.x + sh.w / 2, sh.y + 15);
  ctx.fillText('[5]', sh.x + sh.w / 2, sh.y + 32);
  ctx.textAlign = 'left';
  // Send wave.
  const wb = LAYOUT.waveBtn;
  const canSend = !state.waveActive && state.wave < MAX_WAVES && state.screen === 'playing';
  ctx.globalAlpha = canSend ? 1 : 0.5;
  pill(ctx, wb.x, wb.y, wb.w, wb.h, canSend ? '#2e7d32' : 'rgba(20,24,48,0.9)', canSend ? '#a5d6a7' : '#5b6b8c');
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 15px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(state.waveActive ? `Wave ${state.wave}…` : state.wave >= MAX_WAVES ? 'Final wave!' : `Send Wave ${state.wave + 1}`, wb.x + wb.w / 2, wb.y + 23);
  ctx.textAlign = 'left';
  ctx.globalAlpha = 1;
  // Hover highlight on a plot.
  if (state.hover && state.screen === 'playing') {
    const c = cellCenter(state.hover.col, state.hover.row);
    ctx.strokeStyle = 'rgba(255,217,74,0.9)';
    ctx.lineWidth = 2.5;
    rr(ctx, c.x - GRID.cellW / 2 + 4, c.y - GRID.cellH / 2 + 4, GRID.cellW - 8, GRID.cellH - 8, 10);
    ctx.stroke();
  }
}

function overlay(ctx) {
  ctx.fillStyle = 'rgba(10,14,32,0.62)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
}

function bigButton(ctx, rect, label, enabled = true) {
  ctx.globalAlpha = enabled ? 1 : 0.5;
  pill(ctx, rect.x, rect.y, rect.w, rect.h, '#2e7d32', '#a5d6a7');
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2 + 1);
  ctx.textAlign = 'left';
  ctx.globalAlpha = 1;
}

function drawTitle(ctx, state) {
  overlay(ctx);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd94a';
  ctx.font = 'bold 64px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('GLOWGARDEN', VIEW.width / 2, 150);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('Lantern Defense', VIEW.width / 2, 192);
  ctx.font = '17px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillStyle = '#d7e3ff';
  ctx.fillText('Night falls. Gloom Moths swarm from the dark to snuff out the Heart Lantern.', VIEW.width / 2, 240);
  ctx.fillText('Plant sun-powered flowers, grow your sun, and hold the garden for 10 waves.', VIEW.width / 2, 266);
  ctx.fillText('Click a plant card, then a plot · 1–4 pick a plant · 5 shovel · Space sends a wave', VIEW.width / 2, 300);
  ctx.fillText('Click falling suns to collect them · P pauses · M mutes · R restarts', VIEW.width / 2, 326);
  ctx.fillStyle = '#ffe082';
  ctx.font = 'bold 16px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('Sunbloom grows sun  ·  Thornspitter shoots  ·  Frostbloom slows  ·  Moonpetal splashes', VIEW.width / 2, 362);
  ctx.textAlign = 'left';
  bigButton(ctx, LAYOUT.startBtn, '▶  Start Game');
}

function drawEnd(ctx, state) {
  overlay(ctx);
  const won = state.screen === 'won';
  ctx.textAlign = 'center';
  ctx.fillStyle = won ? '#ffd94a' : '#ff8a80';
  ctx.font = 'bold 56px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText(won ? 'THE LANTERN SHINES!' : 'THE LIGHT WENT OUT', VIEW.width / 2, 150);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText(
    won ? 'Ten waves held — the garden glows again.' : `The moths reached the lantern on wave ${Math.max(1, state.wave)}.`,
    VIEW.width / 2, 200,
  );
  ctx.font = '20px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillStyle = '#d7e3ff';
  ctx.fillText(`Score ${state.score}   ·   Moths banished ${state.kills}   ·   Plants grown ${state.planted}`, VIEW.width / 2, 250);
  ctx.fillText(`Waves cleared ${state.stats.wavesCleared} / ${MAX_WAVES}   ·   Suns collected ${state.stats.sunsCollected}`, VIEW.width / 2, 282);
  ctx.fillText('Press R or click Play Again to tend the garden once more.', VIEW.width / 2, 330);
  ctx.textAlign = 'left';
  bigButton(ctx, LAYOUT.againBtn, '↻  Play Again');
}

function drawPaused(ctx) {
  overlay(ctx);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('PAUSED', VIEW.width / 2, 280);
  ctx.font = '18px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillStyle = '#d7e3ff';
  ctx.fillText('Press P or click Pause to keep gardening.', VIEW.width / 2, 320);
  ctx.textAlign = 'left';
}

export function render(ctx, state) {
  ctx.clearRect(0, 0, VIEW.width, VIEW.height);
  drawBackground(ctx, state);
  drawLantern(ctx, state);
  drawPlants(ctx, state);
  drawEnemies(ctx, state);
  drawProjectiles(ctx, state);
  drawSuns(ctx, state);
  drawParticles(ctx, state);
  if (state.screen !== 'title') {
    drawHUD(ctx, state);
    drawCards(ctx, state);
  }
  if (state.screen === 'title') drawTitle(ctx, state);
  else if (state.screen === 'paused') drawPaused(ctx);
  else if (state.screen === 'won' || state.screen === 'lost') drawEnd(ctx, state);
}

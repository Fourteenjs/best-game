// Garden drawing: night sky, moon, lawn, planting plots — and the light
// itself. Dark plots (light 0) are visibly shadowed with a small crescent
// mark; bright plots (light 2) get a warm halo, so the light mechanic reads
// at a glance without any text. The Heart Lantern stands at the garden's
// left edge with its HP hearts beneath it.

import { VIEW, GRID, LANTERN } from './config.js';
import { cellLight } from './light.js';
import { rr } from './draw-helpers.js';

export function drawBackground(ctx, state) {
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
  // Planting plots, shaded by their light level.
  for (let r = 0; r < GRID.rows; r++) {
    for (let c = 0; c < GRID.cols; c++) {
      const x = GRID.x0 + c * GRID.cellW;
      const y = GRID.y0 + r * GRID.cellH;
      ctx.fillStyle = (c + r) % 2 === 0 ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.05)';
      rr(ctx, x + 4, y + 4, GRID.cellW - 8, GRID.cellH - 8, 10);
      ctx.fill();
      const light = state.screen === 'title' ? 1 : cellLight(state, c, r);
      if (light === 0) {
        // Dark: heavy shadow + a small crescent, so "no light" is visible.
        ctx.fillStyle = 'rgba(5,8,22,0.52)';
        rr(ctx, x + 4, y + 4, GRID.cellW - 8, GRID.cellH - 8, 10);
        ctx.fill();
        ctx.strokeStyle = 'rgba(148,163,255,0.75)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + GRID.cellW - 18, y + 16, 6, 0.4, Math.PI * 1.5);
        ctx.stroke();
      } else if (light === 2) {
        // Bright: warm halo so the +50% damage zone is obvious.
        ctx.fillStyle = 'rgba(255,214,90,0.10)';
        rr(ctx, x + 4, y + 4, GRID.cellW - 8, GRID.cellH - 8, 10);
        ctx.fill();
      }
    }
  }
  // Flash of Light: the whole garden blazes gold while it lasts.
  if (state.time < state.flashUntil) {
    ctx.fillStyle = 'rgba(255,236,140,0.10)';
    ctx.fillRect(0, GRID.y0 - 14, VIEW.width, GRID.rows * GRID.cellH + 28);
  }
}

export function drawLantern(ctx, state) {
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

// HUD and bottom bar: sun purse, night + wave, lantern HP, score, moths
// left, the light count, the boss bar on the final wave, the night banner,
// and the five plant cards plus shovel, upgrade, flash and send-wave.
// The Sound and Pause buttons are 64 px wide at 15 px type: "Sound" and
// "Pause" both fit with room to spare (round 1 squeezed 16 px bold text
// into 44 px and clipped it in every screenshot).

import { VIEW, GRID, PLANTS, PLANT_ORDER, MAX_WAVES, FLASH, UPGRADE_COST, nightOf } from './config.js';
import { cellCenter } from './state.js';
import { litPlotCount } from './light.js';
import { pill, flower, FONT } from './draw-helpers.js';
import { LAYOUT } from './layout.js';

export function drawHUD(ctx, state) {
  ctx.textBaseline = 'middle';
  // Sun purse.
  pill(ctx, 12, 10, 138, 36, 'rgba(20,24,48,0.85)', '#ffd94a');
  ctx.fillStyle = '#ffd94a';
  ctx.beginPath();
  ctx.arc(34, 28, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ff9d2e';
  ctx.beginPath();
  ctx.arc(31, 25, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px ' + FONT;
  ctx.textAlign = 'left';
  ctx.fillText(`${state.sun}`, 54, 29);
  // Night + wave.
  const night = nightOf(Math.max(1, state.wave));
  const nightNo = Math.floor((Math.max(1, state.wave) - 1) / 2) + 1;
  pill(ctx, 158, 10, 178, 36, 'rgba(20,24,48,0.85)');
  ctx.fillStyle = '#ffe082';
  ctx.font = 'bold 15px ' + FONT;
  ctx.fillText(`Night ${nightNo} · Wave ${Math.max(1, state.wave)}/${MAX_WAVES}`, 170, 29);
  // Lantern HP.
  pill(ctx, 344, 10, 152, 36, 'rgba(20,24,48,0.85)');
  ctx.fillStyle = '#ff8a80';
  ctx.font = 'bold 16px ' + FONT;
  ctx.fillText(`Lantern ${state.lanternHp}/${state.lanternMax}`, 358, 29);
  // Score.
  pill(ctx, 504, 10, 138, 36, 'rgba(20,24,48,0.85)');
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`Score ${state.score}`, 518, 29);
  // Enemies remaining.
  const left = state.enemies.length + state.spawnQueue.length;
  pill(ctx, 650, 10, 150, 36, 'rgba(20,24,48,0.85)');
  ctx.fillStyle = left > 0 ? '#ce93d8' : '#a5d6a7';
  ctx.font = 'bold 15px ' + FONT;
  ctx.fillText(state.waveActive ? `Moths ${left}` : 'Between waves', 662, 29);
  // Sound / Pause: wide enough for their labels, always clickable.
  pill(ctx, LAYOUT.muteBtn.x, LAYOUT.muteBtn.y, LAYOUT.muteBtn.w, LAYOUT.muteBtn.h, 'rgba(20,24,48,0.85)', '#8d9bb5');
  pill(ctx, LAYOUT.pauseBtn.x, LAYOUT.pauseBtn.y, LAYOUT.pauseBtn.w, LAYOUT.pauseBtn.h, 'rgba(20,24,48,0.85)', '#8d9bb5');
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 15px ' + FONT;
  ctx.textAlign = 'center';
  ctx.fillText(state.muted ? 'Muted' : 'Sound', LAYOUT.muteBtn.x + LAYOUT.muteBtn.w / 2, 29);
  ctx.fillText(state.screen === 'paused' ? 'Play' : 'Pause', LAYOUT.pauseBtn.x + LAYOUT.pauseBtn.w / 2, 29);
  ctx.textAlign = 'left';
  // Light count + difficulty, small, under the sun purse.
  ctx.fillStyle = '#ffe082';
  ctx.font = '13px ' + FONT;
  ctx.fillText(`Light: ${litPlotCount(state)}/45 plots · ${state.difficulty}`, 12, 62);
  if (state.time < state.flashUntil) {
    ctx.fillStyle = '#fff9c4';
    ctx.font = 'bold 13px ' + FONT;
    ctx.fillText(`FLASH! All plots bright — ${Math.ceil(state.flashUntil - state.time)}s`, 220, 62);
  }
  // Boss bar across the top of the garden on the final wave.
  const boss = state.boss;
  if (boss && state.enemies.includes(boss)) {
    const bw = 560;
    const bx = (VIEW.width - bw) / 2;
    const by = 76;
    ctx.fillStyle = 'rgba(10,14,32,0.85)';
    ctx.fillRect(bx - 8, by - 20, bw + 16, 40);
    ctx.fillStyle = '#e1bee7';
    ctx.font = 'bold 14px ' + FONT;
    ctx.textAlign = 'center';
    ctx.fillText(`LUNA, QUEEN OF THE ECLIPSE — Phase ${boss.phase}`, VIEW.width / 2, by - 8);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(bx, by + 2, bw, 10);
    ctx.fillStyle = boss.phase === 3 ? '#ff5252' : '#ce93d8';
    ctx.fillRect(bx, by + 2, bw * Math.max(0, boss.hp / boss.maxHp), 10);
    ctx.textAlign = 'left';
  }
  // Toast message.
  if (state.message && state.time < state.messageUntil) {
    ctx.font = 'bold 18px ' + FONT;
    const w = ctx.measureText(state.message).width + 28;
    pill(ctx, (VIEW.width - w) / 2, 96, w, 32, 'rgba(20,24,48,0.88)', '#ffd94a');
    ctx.fillStyle = '#ffe082';
    ctx.textAlign = 'center';
    ctx.fillText(state.message, VIEW.width / 2, 113);
    ctx.textAlign = 'left';
  }
  // Night banner: big centre text when a wave starts.
  if (state.banner && state.time < state.bannerUntil) {
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(10,14,32,0.55)';
    ctx.fillRect(0, 250, VIEW.width, 64);
    ctx.fillStyle = '#ffd94a';
    ctx.font = 'bold 34px ' + FONT;
    ctx.fillText(state.banner, VIEW.width / 2, 278);
    ctx.fillStyle = '#d7e3ff';
    ctx.font = '16px ' + FONT;
    ctx.fillText(night.tagline, VIEW.width / 2, 302);
    ctx.textAlign = 'left';
  }
}

export function drawCards(ctx, state) {
  for (const card of LAYOUT.cards) {
    const def = PLANTS[card.key];
    const afford = state.sun >= def.cost;
    const selected = state.selected === card.key && !state.shovel && !state.upgradeMode;
    ctx.globalAlpha = afford ? 1 : 0.55;
    pill(ctx, card.x, card.y, card.w, card.h, selected ? '#3e5a8a' : 'rgba(20,24,48,0.9)', selected ? '#ffd94a' : '#5b6b8c');
    if (card.key === 'torch') {
      ctx.fillStyle = '#ffd65a';
      ctx.fillRect(card.x + 14, card.y + 12, 18, 20);
      ctx.fillStyle = '#ff8a3d';
      ctx.beginPath();
      ctx.moveTo(card.x + 23, card.y + 4);
      ctx.quadraticCurveTo(card.x + 28, card.y + 10, card.x + 23, card.y + 14);
      ctx.quadraticCurveTo(card.x + 18, card.y + 10, card.x + 23, card.y + 4);
      ctx.fill();
    } else {
      flower(ctx, card.x + 22, card.y + 26, def.petal, def.center, 12, state.time, 0);
    }
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px ' + FONT;
    ctx.fillText(def.name, card.x + 38, card.y + 15);
    ctx.fillStyle = '#ffd94a';
    ctx.font = 'bold 12px ' + FONT;
    ctx.fillText(`${def.cost} sun [${PLANT_ORDER.indexOf(card.key) + 1}]`, card.x + 38, card.y + 32);
    ctx.globalAlpha = 1;
  }
  // Shovel.
  const sh = LAYOUT.shovel;
  pill(ctx, sh.x, sh.y, sh.w, sh.h, state.shovel ? '#7a3b3b' : 'rgba(20,24,48,0.9)', state.shovel ? '#ff8a80' : '#5b6b8c');
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px ' + FONT;
  ctx.textAlign = 'center';
  ctx.fillText('Shovel', sh.x + sh.w / 2, sh.y + 15);
  ctx.fillText('[6]', sh.x + sh.w / 2, sh.y + 32);
  ctx.textAlign = 'left';
  // Upgrade (★ tier 2 for 75 sun).
  const up = LAYOUT.upgradeBtn;
  pill(ctx, up.x, up.y, up.w, up.h, state.upgradeMode ? '#6a4a00' : 'rgba(20,24,48,0.9)', state.upgradeMode ? '#ffd94a' : '#5b6b8c');
  ctx.fillStyle = '#ffd94a';
  ctx.font = 'bold 12px ' + FONT;
  ctx.textAlign = 'center';
  ctx.fillText('★ Upgrade', up.x + up.w / 2, up.y + 15);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`${UPGRADE_COST} sun [U]`, up.x + up.w / 2, up.y + 32);
  ctx.textAlign = 'left';
  // Flash of Light ability.
  const fb = LAYOUT.flashBtn;
  const flashReady = state.time >= state.flashReadyAt;
  const canFlash = flashReady && state.sun >= FLASH.cost;
  ctx.globalAlpha = canFlash ? 1 : 0.55;
  pill(ctx, fb.x, fb.y, fb.w, fb.h, canFlash ? '#6a1b9a' : 'rgba(20,24,48,0.9)', canFlash ? '#ce93d8' : '#5b6b8c');
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px ' + FONT;
  ctx.textAlign = 'center';
  ctx.fillText('✦ Flash [F]', fb.x + fb.w / 2, fb.y + 15);
  ctx.fillStyle = '#ffd94a';
  ctx.fillText(flashReady ? `${FLASH.cost} sun` : `${Math.ceil(state.flashReadyAt - state.time)}s`, fb.x + fb.w / 2, fb.y + 32);
  ctx.textAlign = 'left';
  ctx.globalAlpha = 1;
  // Send wave.
  const wb = LAYOUT.waveBtn;
  const canSend = !state.waveActive && state.wave < MAX_WAVES && state.screen === 'playing';
  ctx.globalAlpha = canSend ? 1 : 0.5;
  pill(ctx, wb.x, wb.y, wb.w, wb.h, canSend ? '#2e7d32' : 'rgba(20,24,48,0.9)', canSend ? '#a5d6a7' : '#5b6b8c');
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px ' + FONT;
  ctx.textAlign = 'center';
  ctx.fillText(state.waveActive ? `Wave ${state.wave}…` : state.wave >= MAX_WAVES ? 'Final wave!' : `Send Wave ${state.wave + 1}`, wb.x + wb.w / 2, wb.y + 23);
  ctx.textAlign = 'left';
  ctx.globalAlpha = 1;
  // Hover highlight on a plot.
  if (state.hover && state.screen === 'playing') {
    const c = cellCenter(state.hover.col, state.hover.row);
    ctx.strokeStyle = 'rgba(255,217,74,0.9)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.rect(c.x - GRID.cellW / 2 + 4, c.y - GRID.cellH / 2 + 4, GRID.cellW - 8, GRID.cellH - 8);
    ctx.stroke();
  }
}

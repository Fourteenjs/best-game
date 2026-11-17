// Screens: title (with three difficulties, the guide and the best score),
// pause, and the win / lose screens with stars, full statistics and a
// Play Again button that restarts instantly into a new game.

import { VIEW, MAX_WAVES, DIFFICULTIES, NIGHTS } from './config.js';
import { starsFor } from './state.js';
import { pill, bigButton, FONT } from './draw-helpers.js';
import { LAYOUT } from './layout.js';

function overlay(ctx) {
  ctx.fillStyle = 'rgba(10,14,32,0.62)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
}

export function drawTitle(ctx, state) {
  overlay(ctx);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd94a';
  ctx.font = 'bold 58px ' + FONT;
  ctx.fillText('GLOWGARDEN', VIEW.width / 2, 108);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px ' + FONT;
  ctx.fillText('Lantern Defense', VIEW.width / 2, 144);
  ctx.font = '16px ' + FONT;
  ctx.fillStyle = '#d7e3ff';
  ctx.fillText('Night falls. Gloom Moths swarm to snuff out the Heart Lantern.', VIEW.width / 2, 180);
  ctx.fillText('Shooters only fire from LIT plots — plant Sunblooms and Ember Torches to', VIEW.width / 2, 204);
  ctx.fillText('carry the light across the garden. Snuff Moths darken plots. Hold 5 nights!', VIEW.width / 2, 226);
  // Difficulty buttons.
  ctx.font = 'bold 15px ' + FONT;
  ctx.fillStyle = '#ffe082';
  ctx.fillText('Choose your difficulty:', VIEW.width / 2, 262);
  for (const b of LAYOUT.diffBtns) {
    const d = DIFFICULTIES[b.key];
    const sel = state.difficulty === b.key;
    pill(ctx, b.x, b.y, b.w, b.h, sel ? '#3e5a8a' : 'rgba(20,24,48,0.9)', sel ? '#ffd94a' : '#5b6b8c');
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px ' + FONT;
    ctx.fillText(d.name, b.x + b.w / 2, b.y + 18);
    ctx.fillStyle = '#d7e3ff';
    ctx.font = '12px ' + FONT;
    ctx.fillText(d.blurb, b.x + b.w / 2, b.y + 38);
  }
  // The five nights, named.
  ctx.font = '13px ' + FONT;
  ctx.fillStyle = '#9fb0d8';
  ctx.fillText('Five nights: 1 First Flicker · 2 Mothfall · 3 Beetle March · 4 The Long Dark · 5 Luna’s Eclipse', VIEW.width / 2, 372);
  // Plant guide, one line.
  ctx.fillStyle = '#ffe082';
  ctx.font = 'bold 14px ' + FONT;
  ctx.fillText('Sunbloom grows sun · Thornspitter shoots · Frostbloom slows · Moonpetal splashes · Torch lights 3×3 bright', VIEW.width / 2, 396);
  // Best score.
  const best = state.best || { score: 0, wave: 0, wins: 0 };
  if (best.score > 0) {
    ctx.fillStyle = '#a5d6a7';
    ctx.font = 'bold 15px ' + FONT;
    ctx.fillText(`Best: ${best.score} points · reached wave ${best.wave} · ${best.wins} garden${best.wins === 1 ? '' : 's'} saved`, VIEW.width / 2, 420);
  } else {
    ctx.fillStyle = '#9fb0d8';
    ctx.font = '14px ' + FONT;
    ctx.fillText('No garden saved yet — your best score will live here.', VIEW.width / 2, 420);
  }
  ctx.textAlign = 'left';
  bigButton(ctx, LAYOUT.startBtn, '▶  Start Game');
  ctx.textAlign = 'center';
  ctx.fillStyle = '#9fb0d8';
  ctx.font = '13px ' + FONT;
  ctx.fillText('Click a plant card, then a plot · 1–5 plants · 6 shovel · U upgrade · F flash · Space sends a wave · P pause · M mute · R restart', VIEW.width / 2, 514);
  ctx.textAlign = 'left';
}

export function drawEnd(ctx, state) {
  overlay(ctx);
  const won = state.screen === 'won';
  ctx.textAlign = 'center';
  ctx.fillStyle = won ? '#ffd94a' : '#ff8a80';
  ctx.font = 'bold 52px ' + FONT;
  ctx.fillText(won ? 'THE LANTERN SHINES!' : 'THE LIGHT WENT OUT', VIEW.width / 2, 132);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px ' + FONT;
  ctx.fillText(
    won ? 'Five nights held — the garden glows again.' : `The moths reached the lantern on ${NIGHTS[Math.floor((Math.max(1, state.wave) - 1) / 2)].name}.`,
    VIEW.width / 2, 176,
  );
  if (won) {
    // Stars for the victory screen: 3 when the lantern is nearly untouched.
    const stars = starsFor(state);
    ctx.font = '44px ' + FONT;
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = i < stars ? '#ffd94a' : 'rgba(255,255,255,0.25)';
      ctx.fillText('★', VIEW.width / 2 - 60 + i * 60, 228);
    }
    ctx.fillStyle = '#ffe082';
    ctx.font = 'bold 16px ' + FONT;
    ctx.fillText(stars === 3 ? 'A flawless dawn — three stars!' : stars === 2 ? 'A hard-won dawn — two stars.' : 'The garden survived — one star.', VIEW.width / 2, 258);
  }
  ctx.font = '19px ' + FONT;
  ctx.fillStyle = '#d7e3ff';
  // Text is laid out to end above LAYOUT.againBtn (y 420), so the button
  // the player sees is the rectangle the input layer tests.
  const y0 = won ? 286 : 232;
  ctx.fillText(`Score ${state.score}   ·   Best ${state.best.score}   ·   Moths banished ${state.kills}`, VIEW.width / 2, y0);
  ctx.fillText(`Waves cleared ${state.stats.wavesCleared} / ${MAX_WAVES}   ·   Plants grown ${state.planted}   ·   Upgraded ${state.upgraded}`, VIEW.width / 2, y0 + 28);
  ctx.fillText(`Suns caught ${state.stats.sunsCollected}   ·   Sun grown ${state.stats.sunFromBlooms}   ·   Plots snuffed ${state.stats.snuffedPlots}   ·   Flashes ${state.flashes}`, VIEW.width / 2, y0 + 56);
  ctx.fillText(`Lantern ${state.lanternHp}/${state.lanternMax} HP left   ·   ${Math.round(state.time)}s in the garden   ·   ${state.difficulty}`, VIEW.width / 2, y0 + 84);
  ctx.fillStyle = '#ffe082';
  ctx.font = 'bold 16px ' + FONT;
  ctx.fillText('Play Again restarts instantly — same difficulty, fresh garden.', VIEW.width / 2, y0 + 116);
  ctx.textAlign = 'left';
  bigButton(ctx, LAYOUT.againBtn, '↻  Play Again');
}

export function drawPaused(ctx) {
  overlay(ctx);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px ' + FONT;
  ctx.fillText('PAUSED', VIEW.width / 2, 280);
  ctx.font = '18px ' + FONT;
  ctx.fillStyle = '#d7e3ff';
  ctx.fillText('Press P or click Pause to keep gardening.', VIEW.width / 2, 320);
  ctx.fillText('M mutes · R restarts (press twice) · F flashes when you return.', VIEW.width / 2, 348);
  ctx.textAlign = 'left';
}

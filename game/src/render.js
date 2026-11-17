// Rendering: orchestration only. The garden, the actors, the HUD and the
// screens each live in their own module; this file decides the draw order
// and applies the screen shake. Nothing here simulates: render reads state.
//
// Draw order (back to front): sky and lawn → lantern → plants → enemies →
// shots and suns → sparks and damage numbers → HUD and cards → the night
// banner, title, pause and end screens on top.

import { VIEW } from './config.js';
import { drawBackground, drawLantern } from './draw-garden.js';
import { drawPlants, drawEnemies, drawProjectiles, drawSuns, drawParticles } from './draw-actors.js';
import { drawHUD, drawCards } from './draw-hud.js';
import { drawTitle, drawEnd, drawPaused } from './draw-screens.js';

export function render(ctx, state) {
  ctx.clearRect(0, 0, VIEW.width, VIEW.height);
  ctx.save();
  // Screen shake: a decaying random offset, only while shake is live.
  if (state.shake > 0.2) {
    const s = state.shake;
    ctx.translate((Math.random() * 2 - 1) * s, (Math.random() * 2 - 1) * s);
    state.shake *= 0.86;
    if (state.shake < 0.2) state.shake = 0;
  }
  drawBackground(ctx, state);
  drawLantern(ctx, state);
  drawPlants(ctx, state);
  drawEnemies(ctx, state);
  drawProjectiles(ctx, state);
  drawSuns(ctx, state);
  drawParticles(ctx, state);
  ctx.restore();
  if (state.screen !== 'title') {
    drawHUD(ctx, state);
    drawCards(ctx, state);
  }
  if (state.screen === 'title') drawTitle(ctx, state);
  else if (state.screen === 'paused') drawPaused(ctx);
  else if (state.screen === 'won' || state.screen === 'lost') drawEnd(ctx, state);
}

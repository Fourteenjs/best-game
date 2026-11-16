// Glowgarden — Lantern Defense: boot, game loop and screenshot poses.
// The page is plain static files; the loop runs on requestAnimationFrame and
// the simulation advances on a fixed dt so play is the same on any machine.

import { VIEW } from './config.js';
import { newGame } from './state.js';
import { tick } from './update.js';
import { render } from './render.js';
import { attachInput } from './input.js';
import { poseForShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = VIEW.width;
canvas.height = VIEW.height;

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
const seed = Number(params.get('seed') || '7');

const stateRef = { current: shot ? poseForShot(shot, seed) : newGame() };
attachInput(canvas, stateRef, () => { /* state swapped on restart */ });

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  const state = stateRef.current;
  if (!shot) tick(state, dt);
  else if (state.screen === 'playing') state.time += dt;
  render(ctx, state);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Expose the state for headless smoke tests (read-only inspection).
window.__glowgarden = {
  state: () => stateRef.current,
  shot: shot || null,
};

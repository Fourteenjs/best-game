// Glowgarden — Lantern Defense: boot, game loop and screenshot poses.
// The page is plain static files. The loop runs on requestAnimationFrame,
// but the simulation advances on a TRUE fixed step — an accumulator feeds
// the tick exact 1/60 s slices, so play is the same on any machine and at
// any frame rate. (Round 1 claimed a fixed dt while feeding the loop a
// variable, clamped dt; this is the real thing.)
//
// Headless test hooks, exposed on window.__glowgarden:
//   state()  — the live state object, for inspection
//   step(n)  — advance the simulation n fixed steps at once, so an
//              automated play-test can play a whole run in seconds
//   shot     — the ?shot= pose name, or null in normal play

import { VIEW, STEP } from './config.js';
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

function spendHitStop(state, dt) {
  if (state.hitStop > 0) state.hitStop = Math.max(0, state.hitStop - dt);
}

let last = performance.now();
let acc = 0;
let shotReady = false;
function frame(now) {
  const frameDt = Math.min(0.1, (now - last) / 1000);
  last = now;
  const state = stateRef.current;
  if (!shot) {
    spendHitStop(state, frameDt);
    acc += frameDt;
    let steps = 0;
    while (acc >= STEP && steps < 5) {
      tick(state, STEP);
      acc -= STEP;
      steps += 1;
    }
    if (steps === 5) acc = 0; // a long hitch drops time instead of spiralling
  }
  render(ctx, state);
  if (shot && !shotReady) {
    shotReady = true;
    window.__shotReady = true;
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Expose the state for headless smoke tests (inspection + fast-forward).
window.__glowgarden = {
  state: () => stateRef.current,
  shot: shot || null,
  step(n) {
    const state = stateRef.current;
    for (let i = 0; i < n; i++) {
      spendHitStop(state, STEP);
      tick(state, STEP);
    }
    return state;
  },
};

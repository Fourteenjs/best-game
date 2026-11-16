// Input: mouse clicks on cards, plots, suns and buttons; keyboard shortcuts.
// Every clickable region is the same rectangle the renderer draws.

import { PLANT_ORDER } from './config.js';
import { cellAt, newGame } from './state.js';
import { tryPlant, removePlant } from './plants.js';
import { startWave } from './enemies.js';
import { collectSunAt } from './update.js';
import { LAYOUT } from './render.js';
import { sfx, setMuted } from './audio.js';

function inside(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

function canvasPos(canvas, ev) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((ev.clientX - rect.left) / rect.width) * canvas.width,
    y: ((ev.clientY - rect.top) / rect.height) * canvas.height,
  };
}

export function attachInput(canvas, stateRef, onState) {
  // stateRef: {current} so restarts swap the state object without re-binding.
  const get = () => stateRef.current;
  const set = (s) => { stateRef.current = s; onState(s); };

  canvas.addEventListener('mousemove', (ev) => {
    const state = get();
    const { x, y } = canvasPos(canvas, ev);
    state.hover = state.screen === 'playing' ? cellAt(x, y) : null;
  });

  canvas.addEventListener('click', (ev) => {
    const state = get();
    const { x, y } = canvasPos(canvas, ev);
    if (state.screen === 'title') {
      if (inside(x, y, LAYOUT.startBtn)) {
        state.screen = 'playing';
        sfx.click();
      }
      return;
    }
    if (state.screen === 'won' || state.screen === 'lost') {
      if (inside(x, y, LAYOUT.againBtn)) set(newGame(state.seed + 1));
      return;
    }
    if (inside(x, y, LAYOUT.muteBtn)) {
      state.muted = !state.muted;
      setMuted(state.muted);
      return;
    }
    if (inside(x, y, LAYOUT.pauseBtn)) {
      if (state.screen === 'playing') state.screen = 'paused';
      else if (state.screen === 'paused') state.screen = 'playing';
      sfx.click();
      return;
    }
    if (state.screen !== 'playing') return;
    // Falling suns first — they are the most rewarding click.
    if (collectSunAt(state, x, y)) { sfx.sun(); return; }
    for (const card of LAYOUT.cards) {
      if (inside(x, y, card)) {
        state.selected = card.key;
        state.shovel = false;
        sfx.click();
        return;
      }
    }
    if (inside(x, y, LAYOUT.shovel)) {
      state.shovel = !state.shovel;
      sfx.click();
      return;
    }
    if (inside(x, y, LAYOUT.waveBtn)) {
      startWave(state);
      return;
    }
    const cell = cellAt(x, y);
    if (!cell) return;
    if (state.shovel) removePlant(state, cell.col, cell.row);
    else tryPlant(state, state.selected, cell.col, cell.row);
  });

  window.addEventListener('keydown', (ev) => {
    const state = get();
    if (ev.repeat) return;
    const k = ev.key.toLowerCase();
    if (k === 'm') {
      state.muted = !state.muted;
      setMuted(state.muted);
      return;
    }
    if (k === 'r') {
      set(newGame(state.seed + 1));
      return;
    }
    if (state.screen === 'title' && (k === 'enter' || k === ' ')) {
      state.screen = 'playing';
      sfx.click();
      return;
    }
    if ((state.screen === 'won' || state.screen === 'lost') && (k === 'enter' || k === ' ')) {
      set(newGame(state.seed + 1));
      return;
    }
    if (k === 'p' || k === 'escape') {
      if (state.screen === 'playing') state.screen = 'paused';
      else if (state.screen === 'paused') state.screen = 'playing';
      return;
    }
    if (state.screen !== 'playing') return;
    if (k >= '1' && k <= '4') {
      state.selected = PLANT_ORDER[Number(k) - 1];
      state.shovel = false;
      sfx.click();
    } else if (k === '5') {
      state.shovel = !state.shovel;
      sfx.click();
    } else if (k === ' ') {
      ev.preventDefault();
      startWave(state);
    }
  });
}

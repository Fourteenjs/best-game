// Input: mouse clicks on cards, plots, suns and buttons; keyboard shortcuts.
// Every clickable region is the same rectangle the renderer draws, so a
// button that looks clickable is clickable — including Sound and Pause on
// the win and lose screens, where round 1's early return left them dead.
//
// Restart is instant from the end screens (Play Again, R, Enter or Space
// all drop the player straight back into a fresh game on the same
// difficulty), but R mid-game asks first: one press arms it
// ("Press R again to restart"), a second press within 3 s restarts.

import { PLANT_ORDER, DIFFICULTY_ORDER } from './config.js';
import { cellAt, newGame } from './state.js';
import { tryPlant, removePlant, tryUpgrade } from './plants.js';
import { startWave } from './enemies.js';
import { collectSunAt, castFlash } from './update.js';
import { LAYOUT } from './layout.js';
import { sfx, setMuted, startMusic } from './audio.js';

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

// A fresh run that starts playing at once, keeping the player's difficulty,
// mute choice and best score. Used by Play Again, R and Enter on the end
// screens — round 1 sent the player back to the title instead.
function restartPlaying(old) {
  const next = newGame(old.seed + 1, old.difficulty);
  next.screen = 'playing';
  next.muted = old.muted;
  next.musicOn = old.musicOn;
  next.best = old.best;
  return next;
}

function toggleMute(state) {
  state.muted = !state.muted;
  setMuted(state.muted);
  sfx.click();
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
    startMusic();
    if (state.screen === 'title') {
      for (const b of LAYOUT.diffBtns) {
        if (inside(x, y, b)) {
          state.difficulty = b.key;
          // Difficulty changes the lantern and the starting sun at once.
          const fresh = newGame(state.seed, b.key);
          fresh.muted = state.muted;
          fresh.musicOn = state.musicOn;
          fresh.best = state.best;
          set(fresh);
          sfx.click();
          return;
        }
      }
      if (inside(x, y, LAYOUT.startBtn)) {
        state.screen = 'playing';
        state.musicOn = true;
        startMusic();
        sfx.click();
      }
      return;
    }
    // Sound and Pause answer on every screen except the title, end screens
    // included — muting from the victory screen must just work. They are
    // tested AFTER falling suns: a sun drifting down behind the top-right
    // buttons must be collected, not turn the sound off (round 1's order
    // let a sky sun toggle mute when it fell over the button).
    if (state.screen === 'playing' && collectSunAt(state, x, y)) { sfx.sun(); return; }
    if (inside(x, y, LAYOUT.muteBtn)) { toggleMute(state); return; }
    if (inside(x, y, LAYOUT.pauseBtn)) {
      if (state.screen === 'playing') state.screen = 'paused';
      else if (state.screen === 'paused') state.screen = 'playing';
      sfx.click();
      return;
    }
    if (state.screen === 'won' || state.screen === 'lost') {
      if (inside(x, y, LAYOUT.againBtn)) set(restartPlaying(state));
      return;
    }
    if (state.screen !== 'playing') return;
    for (const card of LAYOUT.cards) {
      if (inside(x, y, card)) {
        state.selected = card.key;
        state.shovel = false;
        state.upgradeMode = false;
        sfx.click();
        return;
      }
    }
    if (inside(x, y, LAYOUT.shovel)) {
      state.shovel = !state.shovel;
      state.upgradeMode = false;
      sfx.click();
      return;
    }
    if (inside(x, y, LAYOUT.upgradeBtn)) {
      state.upgradeMode = !state.upgradeMode;
      state.shovel = false;
      sfx.click();
      return;
    }
    if (inside(x, y, LAYOUT.flashBtn)) {
      castFlash(state);
      return;
    }
    if (inside(x, y, LAYOUT.waveBtn)) {
      startWave(state);
      return;
    }
    const cell = cellAt(x, y);
    if (!cell) return;
    if (state.shovel) removePlant(state, cell.col, cell.row);
    else if (state.upgradeMode) tryUpgrade(state, cell.col, cell.row);
    else tryPlant(state, state.selected, cell.col, cell.row);
  });

  window.addEventListener('keydown', (ev) => {
    const state = get();
    if (ev.repeat) return;
    const k = ev.key.toLowerCase();
    startMusic();
    if (k === 'm') { toggleMute(state); return; }
    if (k === 'r') {
      if (state.screen === 'title') return;
      if (state.screen === 'won' || state.screen === 'lost') {
        set(restartPlaying(state));
        return;
      }
      // Mid-game R needs a second press to confirm, so a stray key never
      // throws a good run away.
      if (state.time < state.confirmRestartUntil) {
        set(restartPlaying(state));
      } else {
        state.confirmRestartUntil = state.time + 3;
        state.message = 'Press R again to restart!';
        state.messageUntil = state.time + 3;
        sfx.click();
      }
      return;
    }
    if (state.screen === 'title') {
      if (k === 'enter' || k === ' ') {
        state.screen = 'playing';
        state.musicOn = true;
        startMusic();
        sfx.click();
      } else if (k === 'arrowleft' || k === 'arrowright') {
        const i = DIFFICULTY_ORDER.indexOf(state.difficulty);
        const d = k === 'arrowright' ? 1 : -1;
        const next = DIFFICULTY_ORDER[(i + d + DIFFICULTY_ORDER.length) % DIFFICULTY_ORDER.length];
        const fresh = newGame(state.seed, next);
        fresh.muted = state.muted;
        fresh.musicOn = state.musicOn;
        fresh.best = state.best;
        set(fresh);
        sfx.click();
      }
      return;
    }
    if ((state.screen === 'won' || state.screen === 'lost') && (k === 'enter' || k === ' ')) {
      set(restartPlaying(state));
      return;
    }
    if (k === 'p' || k === 'escape') {
      if (state.screen === 'playing') state.screen = 'paused';
      else if (state.screen === 'paused') state.screen = 'playing';
      return;
    }
    if (state.screen !== 'playing') return;
    if (k >= '1' && k <= '5') {
      state.selected = PLANT_ORDER[Number(k) - 1];
      state.shovel = false;
      state.upgradeMode = false;
      sfx.click();
    } else if (k === '6') {
      state.shovel = !state.shovel;
      state.upgradeMode = false;
      sfx.click();
    } else if (k === 'u') {
      state.upgradeMode = !state.upgradeMode;
      state.shovel = false;
      sfx.click();
    } else if (k === 'f') {
      castFlash(state);
    } else if (k === ' ') {
      ev.preventDefault();
      startWave(state);
    }
  });
}

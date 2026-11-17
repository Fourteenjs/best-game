// Sound: synthesized effects plus a generative music loop, all WebAudio —
// no audio files, everything is generated. All sounds are short and quiet,
// and M (or the Sound button) toggles mute. Nothing here throws: a browser
// with no audio, or a headless shell, simply stays silent.
//
// Music: a slow A-minor pentatonic lullaby. A lookahead scheduler plays one
// plucked note every half beat and a low root note every bar, so the garden
// hums while you play. It starts on the first user gesture (browsers refuse
// audio before one) and follows the mute switch like every other sound.

let ctx = null;
let master = null;
let muted = false;
let musicTimer = null;
let nextNoteTime = 0;
let step = 0;

// A-minor pentatonic, one octave plus the root above.
const SCALE = [220.0, 261.63, 293.66, 329.63, 392.0, 440.0, 523.25];
// A gentle, singable order the loop walks through, then wanders from.
const MELODY = [0, 2, 4, 3, 5, 4, 2, 1, 0, 2, 3, 4, 5, 4, 3, 2];
const ROOTS = [110.0, 87.31, 130.81, 98.0]; // A2 F2 C3 G2, one per bar

export function setMuted(m) {
  muted = m;
  if (master && ctx) master.gain.setTargetAtTime(m ? 0 : 0.9, ctx.currentTime, 0.02);
}

export function isMuted() {
  return muted;
}

function audio() {
  if (muted) return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq, dur, type = 'sine', vol = 0.12, slideTo = null, delay = 0, when = null) {
  const ac = audio();
  if (!ac) return;
  try {
    const t0 = when !== null ? when : ac.currentTime + delay;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t0 + dur);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  } catch {
    // A note that cannot sound is skipped, never a crash.
  }
}

function noise(dur, vol = 0.08, delay = 0, low = 400) {
  const ac = audio();
  if (!ac) return;
  try {
    const t0 = ac.currentTime + delay;
    const len = Math.floor(ac.sampleRate * dur);
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ac.createBufferSource();
    src.buffer = buf;
    const filter = ac.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = low;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filter).connect(gain).connect(master);
    src.start(t0);
  } catch {
    // Silence on failure, as above.
  }
}

// Start the generative loop. Safe to call repeatedly; safe before any
// gesture (the context simply stays suspended until the browser allows it).
export function startMusic() {
  try {
    const ac = audio();
    if (!ac || musicTimer) return;
    nextNoteTime = ac.currentTime + 0.1;
    step = 0;
    musicTimer = setInterval(() => {
      if (muted || !ctx) return;
      try {
        while (nextNoteTime < ctx.currentTime + 0.25) {
          const idx = MELODY[step % MELODY.length];
          tone(SCALE[idx], 0.9, 'triangle', 0.05, null, 0, nextNoteTime);
          if (step % 16 === 0) {
            tone(ROOTS[(step / 16) % ROOTS.length], 2.2, 'sine', 0.06, null, 0, nextNoteTime);
          }
          if (step % 8 === 4) tone(SCALE[idx] * 2, 0.5, 'sine', 0.025, null, 0, nextNoteTime);
          step += 1;
          nextNoteTime += 0.42; // ~71 bpm, half-beat steps
        }
      } catch {
        // The loop survives a scheduling hiccup.
      }
    }, 120);
  } catch {
    // No music where audio is unavailable.
  }
}

export const sfx = {
  plant() { tone(520, 0.12, 'triangle', 0.14, 780); noise(0.08, 0.05, 0, 900); },
  shoot() { tone(880, 0.08, 'square', 0.05, 620); },
  frost() { tone(1200, 0.14, 'sine', 0.07, 1800); },
  moon() { tone(340, 0.22, 'sine', 0.1, 180); },
  hit() { noise(0.06, 0.07, 0, 1400); },
  enemyDown() { tone(300, 0.18, 'triangle', 0.12, 90); noise(0.14, 0.06, 0, 700); },
  sun() { tone(1320, 0.1, 'sine', 0.1, 1760); tone(1760, 0.12, 'sine', 0.07, 2200, 0.06); },
  plantDown() { tone(220, 0.25, 'sawtooth', 0.08, 70); },
  lanternHit() { tone(140, 0.3, 'sawtooth', 0.14, 60); noise(0.2, 0.1, 0, 500); },
  horn() { tone(196, 0.35, 'triangle', 0.14, 196); tone(294, 0.35, 'triangle', 0.12, 294, 0.12); },
  waveClear() { tone(523, 0.12, 'triangle', 0.12); tone(659, 0.12, 'triangle', 0.12, 0, 0.1); tone(784, 0.2, 'triangle', 0.12, 0, 0.2); },
  win() {
    [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.28, 'triangle', 0.13, 0, i * 0.13));
  },
  lose() {
    [392, 330, 262, 196].forEach((f, i) => tone(f, 0.4, 'sine', 0.13, 0, i * 0.22));
  },
  click() { tone(700, 0.05, 'sine', 0.07); },
  error() { tone(180, 0.14, 'square', 0.07, 120); },
  upgrade() { tone(660, 0.1, 'triangle', 0.12, 990); tone(990, 0.16, 'triangle', 0.1, 0, 0.09); },
  flash() {
    tone(880, 0.3, 'sine', 0.12, 1760);
    tone(1760, 0.4, 'sine', 0.08, 0, 0.1);
    noise(0.3, 0.05, 0, 2400);
  },
  snuff() { tone(160, 0.3, 'sawtooth', 0.07, 60); },
  bolt() { tone(980, 0.1, 'square', 0.04, 420); },
  boltHit() { noise(0.12, 0.08, 0, 900); },
  boss() {
    tone(98, 0.6, 'sawtooth', 0.14, 49);
    tone(147, 0.6, 'sawtooth', 0.1, 73, 0.2);
    noise(0.5, 0.08, 0, 400);
  },
};

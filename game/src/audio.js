// Synthesized sound effects with WebAudio — no audio files, everything is generated.
// All sounds are short, quiet and optional (M toggles mute).

let ctx = null;
let muted = false;

export function setMuted(m) {
  muted = m;
}

export function isMuted() {
  return muted;
}

function audio() {
  if (muted) return null;
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq, dur, type = 'sine', vol = 0.12, slideTo = null, delay = 0) {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t0 + dur);
  gain.gain.setValueAtTime(vol, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function noise(dur, vol = 0.08, delay = 0, low = 400) {
  const ac = audio();
  if (!ac) return;
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
  src.connect(filter).connect(gain).connect(ac.destination);
  src.start(t0);
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
};

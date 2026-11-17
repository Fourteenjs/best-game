// Particles and floating text: tiny feedback sparks — hits, deaths, sun
// sparkles, planting puffs — plus the damage numbers that make every hit
// readable. The pool is hard-capped at 400: old sparks drop instead of
// growing without bound, and nothing allocates per frame beyond the pool.

const MAX_PARTICLES = 400;

export function burst(state, x, y, color, count) {
  for (let i = 0; i < count; i++) {
    if (state.particles.length >= MAX_PARTICLES) state.particles.shift();
    const a = state.rng() * Math.PI * 2;
    const speed = 30 + state.rng() * 90;
    state.particles.push({
      x, y,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed - 20,
      life: 0.45 + state.rng() * 0.35,
      maxLife: 0.8,
      size: 2 + state.rng() * 3.5,
      color,
    });
  }
}

export function damageNumber(state, x, y, text, color) {
  if (state.damageNumbers.length > 40) state.damageNumbers.shift();
  state.damageNumbers.push({ x, y, text, life: 0.9, maxLife: 0.9, color: color || '#ffffff' });
}

export function updateParticles(state, dt) {
  for (const p of state.particles) {
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 160 * dt;
  }
  state.particles = state.particles.filter((p) => p.life > 0);
  for (const d of state.damageNumbers) {
    d.life -= dt;
    d.y -= 34 * dt;
  }
  state.damageNumbers = state.damageNumbers.filter((d) => d.life > 0);
}

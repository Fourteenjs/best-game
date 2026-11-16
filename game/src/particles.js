// Particles: tiny feedback sparks — hits, deaths, sun sparkles, planting puffs.

export function burst(state, x, y, color, count) {
  for (let i = 0; i < count; i++) {
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

export function updateParticles(state, dt) {
  for (const p of state.particles) {
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 160 * dt;
  }
  state.particles = state.particles.filter((p) => p.life > 0);
}

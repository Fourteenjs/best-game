// Glowgarden — Lantern Defense: balance, waves and plant/enemy definitions.
// Every number the game plays by lives here, so tuning is one file.

export const VIEW = { width: 960, height: 600 };
export const GRID = { cols: 9, rows: 5, x0: 96, y0: 150, cellW: 88, cellH: 78 };
export const LANTERN = { x: 52, hp: 10 };
export const START_SUN = 150;
export const MAX_WAVES = 10;

export const PLANTS = {
  sunbloom: {
    key: 'sunbloom', name: 'Sunbloom', cost: 50, hp: 120,
    blurb: 'Grows +25 sun every 8s',
    color: '#ffd94a', petal: '#ffcf3d', center: '#ff9d2e',
  },
  thornspitter: {
    key: 'thornspitter', name: 'Thornspitter', cost: 100, hp: 150,
    blurb: 'Spits a thorn every 1.2s · 20 dmg',
    color: '#7ee081', petal: '#4caf50', center: '#2e7d32',
  },
  frostbloom: {
    key: 'frostbloom', name: 'Frostbloom', cost: 125, hp: 150,
    blurb: 'Frost shard every 1.8s · 10 dmg + slows',
    color: '#8fd8ff', petal: '#4fc3f7', center: '#1565c0',
  },
  moonpetal: {
    key: 'moonpetal', name: 'Moonpetal', cost: 200, hp: 180,
    blurb: 'Moon orb every 2.6s · 60 splash dmg',
    color: '#c9a7ff', petal: '#9575cd', center: '#5e35b1',
  },
};
export const PLANT_ORDER = ['sunbloom', 'thornspitter', 'frostbloom', 'moonpetal'];

export const ENEMIES = {
  moth: {
    key: 'moth', name: 'Gloom Moth', hp: 60, speed: 26, dmg: 1, score: 10,
    radius: 20, color: '#5b4a8a', wing: '#8e7cc3',
  },
  swift: {
    key: 'swift', name: 'Swift Moth', hp: 42, speed: 52, dmg: 1, score: 15,
    radius: 16, color: '#7a5aa8', wing: '#b39ddb',
  },
  beetle: {
    key: 'beetle', name: 'Bulb Beetle', hp: 230, speed: 15, dmg: 2, score: 30,
    radius: 24, color: '#3d5a3a', wing: '#81c784',
  },
  luna: {
    key: 'luna', name: 'Luna Moth', hp: 1250, speed: 18, dmg: 5, score: 200,
    radius: 34, color: '#2e2a55', wing: '#e1bee7',
  },
};

// Wave plan: each wave lists [enemyKey, count] groups, spawned over its duration.
export function wavePlan(wave) {
  const hpScale = 1 + (wave - 1) * 0.14;
  const groups = [];
  const moths = 4 + wave * 2;
  groups.push(['moth', moths]);
  if (wave >= 3) groups.push(['swift', 2 + wave]);
  if (wave >= 5) groups.push(['beetle', 1 + Math.floor((wave - 3) / 2)]);
  if (wave >= 7) groups.push(['swift', 3 + wave]);
  if (wave === 10) groups.push(['luna', 1]);
  if (wave === 10) groups.push(['beetle', 3]);
  return { groups, hpScale, duration: 26 + wave * 2 };
}

export const SUN = {
  skyInterval: 7, skyValue: 25, skyLifetime: 9,
  bloomInterval: 8, bloomValue: 25,
  waveBonus: 50,
};

// Glowgarden — Lantern Defense, round 2: balance, nights, plants, enemies.
// Every number the game plays by lives here, so tuning is one file.
//
// The idea that makes this game its own: LIGHT is the battlefield. Shooters
// only fire from a lit plot. The Heart Lantern lights the two leftmost
// columns, a Sunbloom lights its own plot, and an Ember Torch lights the
// plots around it — bright plots even deal +50% damage. Snuff Moths darken
// plots, and the Flash of Light ability re-lights the whole garden.

export const VIEW = { width: 960, height: 600 };
export const GRID = { cols: 9, rows: 5, x0: 96, y0: 150, cellW: 88, cellH: 78 };
export const LANTERN = { x: 52, hp: 10 };
export const START_SUN = 150;
export const MAX_WAVES = 10;
export const STEP = 1 / 60;

// Five named nights, two waves each. The night name is the chapter the
// player is in: HUD, wave banner, title screen and screenshots all show it.
export const NIGHTS = [
  { name: 'First Flicker', tagline: 'The dark notices the garden.' },
  { name: 'Mothfall', tagline: 'Wings blot out the moon.' },
  { name: 'Beetle March', tagline: 'Armour crunches through the grass.' },
  { name: 'The Long Dark', tagline: 'The night itself comes to snuff you.' },
  { name: "Luna's Eclipse", tagline: 'The Queen of the Eclipse descends.' },
];

export function nightOf(wave) {
  return NIGHTS[Math.min(NIGHTS.length - 1, Math.floor((Math.max(1, wave) - 1) / 2))];
}

export const DIFFICULTIES = {
  sprout: {
    key: 'sprout', name: 'Sprout', blurb: 'Gentle · lantern 14 HP',
    lanternHp: 14, enemyHpMul: 0.8, startSun: 175,
  },
  gardener: {
    key: 'gardener', name: 'Gardener', blurb: 'Fair · lantern 10 HP',
    lanternHp: 10, enemyHpMul: 1.0, startSun: 150,
  },
  nightmare: {
    key: 'nightmare', name: 'Nightmare', blurb: 'Cruel · lantern 8 HP',
    lanternHp: 8, enemyHpMul: 1.25, startSun: 125,
  },
};
export const DIFFICULTY_ORDER = ['sprout', 'gardener', 'nightmare'];

// Plants. `light` is the light the plant itself sheds: 0 none, 1 its own
// plot, 2 a torch halo. `upgrade` is what one star (tier 2) buys for 75 sun.
export const PLANTS = {
  sunbloom: {
    key: 'sunbloom', name: 'Sunbloom', cost: 50, hp: 120, light: 1,
    blurb: 'Grows +25 sun · lights its plot',
    color: '#ffd94a', petal: '#ffcf3d', center: '#ff9d2e',
    upgrade: { cost: 75, sunValue: 40, sunInterval: 6, blurb: '★ +40 sun / 6s' },
  },
  thornspitter: {
    key: 'thornspitter', name: 'Thornspitter', cost: 100, hp: 150, light: 0,
    blurb: 'Thorn every 1.2s · 20 dmg',
    color: '#7ee081', petal: '#4caf50', center: '#2e7d32',
    upgrade: { cost: 75, dmg: 32, cooldown: 1.0, blurb: '★ 32 dmg · faster' },
  },
  frostbloom: {
    key: 'frostbloom', name: 'Frostbloom', cost: 125, hp: 150, light: 0,
    blurb: 'Frost every 1.8s · 10 dmg + slows',
    color: '#8fd8ff', petal: '#4fc3f7', center: '#1565c0',
    upgrade: { cost: 75, dmg: 16, cooldown: 1.5, slow: 4, blurb: '★ 16 dmg · 4s slow' },
  },
  moonpetal: {
    key: 'moonpetal', name: 'Moonpetal', cost: 200, hp: 180, light: 0,
    blurb: 'Moon orb every 2.6s · 60 splash',
    color: '#c9a7ff', petal: '#9575cd', center: '#5e35b1',
    upgrade: { cost: 75, dmg: 95, cooldown: 2.2, splash: 95, blurb: '★ 95 splash dmg' },
  },
  torch: {
    key: 'torch', name: 'Ember Torch', cost: 75, hp: 100, light: 2,
    blurb: 'Lights 3×3 bright · +50% dmg',
    color: '#ffb74d', petal: '#ff8a3d', center: '#e65100',
    upgrade: { cost: 75, radius: 2, blurb: '★ Lights 5×5 bright' },
  },
};
export const PLANT_ORDER = ['sunbloom', 'thornspitter', 'frostbloom', 'moonpetal', 'torch'];
export const UPGRADE_COST = 75;

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
  snuff: {
    key: 'snuff', name: 'Snuff Moth', hp: 80, speed: 22, dmg: 1, score: 25,
    radius: 18, color: '#263238', wing: '#546e7a',
    snuffPulse: 4, snuffRadius: 1, snuffSecs: 10,
  },
  wisp: {
    key: 'wisp', name: 'Gloom Wisp', hp: 55, speed: 30, dmg: 1, score: 25,
    radius: 15, color: '#37474f', wing: '#80cbc4',
    ranged: true, stopCol: 7, boltEvery: 3.5, boltDmg: 25,
  },
  luna: {
    key: 'luna', name: 'Luna, Queen of the Eclipse', hp: 2600, speed: 14, dmg: 5,
    score: 500, radius: 38, color: '#2e2a55', wing: '#e1bee7', boss: true,
  },
};

// Wave plan: each wave lists [enemyKey, count] groups, spawned over its
// duration. Waves run ~20 s so a full run is 5–7 minutes, not 8–12.
export function wavePlan(wave) {
  const hpScale = 1 + (wave - 1) * 0.12;
  const groups = [];
  groups.push(['moth', 4 + wave * 2]);
  if (wave >= 2) groups.push(['swift', 1 + wave]);
  if (wave >= 3) groups.push(['snuff', 1 + Math.floor((wave - 1) / 2)]);
  if (wave >= 5) groups.push(['beetle', 1 + Math.floor((wave - 3) / 2)]);
  if (wave >= 5) groups.push(['wisp', 1 + Math.floor((wave - 4) / 2)]);
  if (wave >= 7) groups.push(['swift', 2 + wave]);
  if (wave >= 8) groups.push(['snuff', 2]);
  if (wave === 10) groups.push(['luna', 1]);
  if (wave === 10) groups.push(['beetle', 3]);
  if (wave === 10) groups.push(['wisp', 2]);
  return { groups, hpScale, duration: 18 + wave * 1.5 };
}

export const SUN = {
  skyInterval: 7, skyValue: 25, skyLifetime: 9,
  bloomInterval: 8, bloomValue: 25,
  waveBonus: 50,
  swiftCallBonus: 40, swiftCallWindow: 6,
};

export const FLASH = {
  cost: 100, cooldown: 25, duration: 8, damage: 40,
};

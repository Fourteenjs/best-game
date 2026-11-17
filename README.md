# Glowgarden — Lantern Defense

[![make.fun · best-game-01](https://make.fun/badge/best-game-01.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![rank](https://make.fun/badge/best-game-01/Fourteenjs/best-game/rank.svg)](https://make.fun/bounty/best-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![reward](https://make.fun/badge/best-game-01/Fourteenjs/best-game/reward.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)

Night falls on the garden. Gloom Moths swarm from the dark to snuff out the Heart Lantern — and light itself is the battlefield: shooters only fire from lit plots, so you carry the light across the garden with Sunblooms and Ember Torches while Snuff Moths darken the plots behind you. Hold all five named nights and face Luna, Queen of the Eclipse.

A complete, original lane-defense game that runs offline in a desktop browser from static files: no build step, no network requests, no libraries. All art is drawn on canvas and all sound — effects and a generative music loop — is synthesized with WebAudio.

## How to play

- **Goal:** keep the Heart Lantern lit through all 10 waves, across 5 named nights: First Flicker, Mothfall, Beetle March, The Long Dark, and Luna's Eclipse. If its HP reaches 0, the light goes out.
- **Light:** the lantern lights the two leftmost columns. A Sunbloom lights its own plot; an Ember Torch lights the 3×3 around it bright, and plants on bright plots deal +50% damage. A shooter on a dark plot is dormant — it stands, but it cannot fire. Snuff Moths darken plots for 10 seconds.
- **Plant:** click a plant card (or press 1–5), then click a garden plot.
  - **Sunbloom** (50 sun) — grows +25 sun every 8s, lights its plot.
  - **Thornspitter** (100 sun) — spits a thorn every 1.2s, 20 damage.
  - **Frostbloom** (125 sun) — frost shard every 1.8s, 10 damage and slows moths.
  - **Moonpetal** (200 sun) — moon orb every 2.6s, 60 splash damage.
  - **Ember Torch** (75 sun) — lights 3×3 bright; no shot, all light.
- **Upgrade (U, 75 sun):** click ★ Upgrade, then a plant, to raise it to tier 2 — more damage, faster fire, more sun, or a 5×5 torch halo.
- **Flash of Light (F, 100 sun):** lights every plot bright for 8 seconds, burns away snuffed dark, and sears every enemy for 40 damage. 25 s cooldown.
- **Sun:** falling suns drift down from the sky — click them to collect +25 sun.
- **Waves:** press Space or click **Send Wave**. Clearing a wave pays a sun bonus; calling the next wave within 6 seconds of a clear pays a +40 swift-call bonus. Moths get tougher every wave; Swift Moths arrive from wave 2, Snuff Moths from wave 3, armored Bulb Beetles and shooting Gloom Wisps from wave 5, and Luna, Queen of the Eclipse — a three-phase boss with her own HP bar — on wave 10.
- **Shovel (6):** remove a plant. **P** pauses, **M** mutes, **R** restarts (press twice to confirm).
- **Difficulty:** Sprout (gentle), Gardener (fair), or Nightmare (cruel) on the title screen. Your best score, best wave and gardens saved are kept in localStorage and shown on the title and end screens.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Or serve `game/` with any static file server and open `game/index.html`.

## Screenshots

The four shots in `screenshots/` are real renders of the game's own code in headless Chromium, driven by the deterministic `?shot=` poses in `game/src/shots.js` (see `shots.json`): 1-play (the cover: night 2 under attack), 2-start (title with difficulty choice), 3-boss (Luna, phase 2, boss bar), 4-win (three stars, full statistics, Play Again).

## Layout

- `game/index.html` — page shell
- `game/css/style.css` — page chrome around the canvas
- `game/src/main.js` — boot + fixed 1/60 s step loop
- `game/src/config.js` — balance, nights, difficulties, plant/enemy definitions
- `game/src/state.js` — game state + best-score save
- `game/src/light.js` — the light mechanic (lit / bright / snuffed plots)
- `game/src/update.js` — the simulation tick + Flash of Light
- `game/src/plants.js` — planting, upgrades, plant behaviour
- `game/src/enemies.js` — waves, walking, chewing, Snuff/Wisp/Luna behaviour
- `game/src/projectiles.js` — thorns, frost, moon orbs, wisp bolts, damage numbers
- `game/src/particles.js` — pooled feedback sparks + floating damage text
- `game/src/audio.js` — synthesized WebAudio effects + generative music loop
- `game/src/render.js` — draw orchestration + screen shake
- `game/src/draw-helpers.js` — shared canvas helpers
- `game/src/draw-garden.js` — sky, lawn, plots by light level, Heart Lantern
- `game/src/draw-actors.js` — plants, enemies (incl. Luna), shots, suns
- `game/src/draw-hud.js` — HUD, boss bar, night banner, bottom bar
- `game/src/draw-screens.js` — title, pause, win/lose screens
- `game/src/layout.js` — every clickable rectangle, shared by renderer and input
- `game/src/input.js` — mouse + keyboard
- `game/src/random.js` — seeded RNG
- `game/src/shots.js` — deterministic screenshot poses
- `main.ts` — the make.fun entrypoint (copies `game/` + `screenshots/` to `/output`, writes `dossier.json`)
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged

---

<sub>Entered on [make.fun](https://make.fun/?ref=kbna3w8m&utm_source=github&utm_medium=readme&utm_campaign=best-game-01) · AI agents build software for cash rewards</sub>

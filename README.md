# Glowgarden — Lantern Defense

[![make.fun · best-game-01](https://make.fun/badge/best-game-01.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![rank](https://make.fun/badge/best-game-01/Fourteenjs/best-game/rank.svg)](https://make.fun/bounty/best-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![reward](https://make.fun/badge/best-game-01/Fourteenjs/best-game/reward.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)

Night falls on the garden. Gloom Moths swarm from the dark to snuff out the Heart Lantern — plant sun-powered flowers, grow your sun, and hold the garden for 10 waves.

A complete, original lane-defense game that runs offline in a desktop browser from static files: no build step, no network requests, no libraries. All art is drawn on canvas and all sound is synthesized with WebAudio.

## How to play

- **Goal:** keep the Heart Lantern lit through all 10 waves. If its HP reaches 0, the light goes out.
- **Plant:** click a plant card (or press 1–4), then click a garden plot.
  - **Sunbloom** (50 sun) — grows +25 sun every 8s.
  - **Thornspitter** (100 sun) — spits a thorn every 1.2s, 20 damage.
  - **Frostbloom** (125 sun) — frost shard every 1.8s, 10 damage and slows moths.
  - **Moonpetal** (200 sun) — moon orb every 2.6s, 60 splash damage.
- **Sun:** falling suns drift down from the sky — click them to collect +25 sun.
- **Waves:** press Space or click **Send Wave**. Clearing a wave pays a sun bonus. Moths get tougher every wave; Swift Moths arrive from wave 3, armored Bulb Beetles from wave 5, and the giant Luna Moth on wave 10.
- **Shovel (5):** remove a plant. **P** pauses, **M** mutes, **R** restarts.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Or serve `game/` with any static file server and open `game/index.html`.

## Screenshots

The four shots in `screenshots/` are real renders of the game's own code in headless Chromium, driven by the deterministic `?shot=` poses in `game/src/shots.js` (see `shots.json`).

## Layout

- `game/index.html` — page shell
- `game/css/style.css` — page chrome around the canvas
- `game/src/main.js` — boot + game loop
- `game/src/config.js` — balance, waves, plant/enemy definitions
- `game/src/state.js` — game state
- `game/src/update.js` — the simulation tick
- `game/src/plants.js` — planting and plant behaviour
- `game/src/enemies.js` — wave spawning, walking, chewing, lantern attacks
- `game/src/projectiles.js` — thorns, frost shards, moon orbs
- `game/src/particles.js` — feedback sparks
- `game/src/render.js` — all canvas drawing (garden, HUD, menus)
- `game/src/input.js` — mouse + keyboard
- `game/src/audio.js` — synthesized WebAudio sound effects
- `game/src/random.js` — seeded RNG
- `game/src/shots.js` — deterministic screenshot poses
- `main.ts` — the make.fun entrypoint (copies `game/` + `screenshots/` to `/output`, writes `dossier.json`)
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged

---

<sub>Entered on [make.fun](https://make.fun/?ref=kbna3w8m&utm_source=github&utm_medium=readme&utm_campaign=best-game-01) · AI agents build software for cash rewards</sub>

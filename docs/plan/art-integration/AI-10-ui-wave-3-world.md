# AI-10: UI wave 3: menu, logo, toys, sky, parallax, particles, chrome

**Read `README.md` and `coverage.md` first.** Size: L. Needs vision: yes. Depends on: AI-00 only. Touches `ops.js`: **no** (CSS, `pixel.js`, `app.js`, `core.js` art hooks, `styles.css`, `index.html`). Can run in parallel with AI-05 to AI-07.

## Goal

Replace the pixel edition's procedural sprites in `pixel.js` and the menu with the new art, one group at a time, with the old sprite as the fallback for every slot.

## Groups (one agent each; none depends on another)

1. **Title screen:** logo (the game is "Infinite Monkey Industries"; reject art reading anything else), hero monkey (idle, ooh-ooh bubble, click reaction; the hero canvas is `#heroCv`, driven by `app.js` `PXA.monkeyFrame`/`monkeyEyes` pupils and `#hmHit`), Play/Continue banana buttons (idle, hover, press), motes.
2. **Toys** (`core.js` `TOYS`; art hooks `art.toys[id]` in `app.js`): snack banana peel (7-frame one-shot, `PXA.banana`), coconut crack (5 frames, `PXA.coconut`), weather gauge (4 states), night gauge (4 phases), ready/cooling states.
3. **Sky and world:** `PXA.paintSky`, `SKY_DAY/SKY_NIGHT` (add dusk/dawn bands matching `world.js` phases), drifters, stars, fireflies, rain, parallax `farTile/midTile/nearTile`. Tiles must seamlessly repeat in X (lint `tile`).
4. **Particles and juice:** `IMI.burst/fall` kinds (`banana, spark, leaf, drop, paw, star`, confetti, dust), letter pops, shockwaves.
5. **Chrome:** 9-slice frames (`frames.*` in `pixel.js`, slice 6), plank/vine tiles, banana buttons, chips, bars, cooldown ring.
6. **App icon and favicon:** only if the owner wants it; output to `art/icons/`, never overwrite `icons/`.

## Approach

`pixel.js` keeps its API (`PXA.spr`, `PXA.css(name, url)`, `PXA.frames`, `PXA.install()`). Add a loader that, when `ART2`'s art assets are present, **replaces** the entry (same name, same size) before `install()` runs; if a load fails the procedural one stays. Do not rename sprite keys. Anything that cannot be made size-compatible is a `wrong subject`/`resize` row to send back to Gemini.

## Acceptance

- Each group: before/after screenshots at three sizes, day and night, `evidence/AI-10/<group>/`; flag off identical to baseline.
- First-load cost measured (bytes and decode time) with and without art; menu stays interactive in < 1 s on a throttled mobile profile.
- Seamless tiling verified by a 2x-wide screenshot.
- No scroll added; reduced motion shows static frames.

## Do not

Edit `ops.js`; change game flow, toy cooldowns or weather timing (`world.js`, `weather.js`); ship art that fails the coverage matrix.

## Status

Not started.

## Handoff notes

(fill in per group)

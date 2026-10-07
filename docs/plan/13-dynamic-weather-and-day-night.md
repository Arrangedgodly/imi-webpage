# 13: Weather and day/night become part of the game loop

**Read `README.md` first.** Size: L. Independent of 10-12 (its offline handling shares `simulateAway`).

## Decisions made with the owner (do not re-litigate)

- Day/night runs on a **game clock**, not the player's local time: one full day is about **14 real minutes** (about 9 minutes day, 1 dusk, 3 night, 1 dawn). Everyone sees the same cycle; it is computed from the wall clock, so it needs no saved state and works offline.
- The weather and night **toy buttons stop being toggles.** They become read-only **gauges** (current sky, time to the next change). A shop **barometer** extends how far ahead the forecast shows. Weather is something to plan around, not control. (No "nudge" button.)

## Why

Today `Weather.state` is a number the player cycles with a button and night is a class on `<body>` toggled by another. The rights market already has demand drivers keyed to them (`marketBias`: night lifts Bamboo, rain lifts Hibiscus, a storm lifts Lagoon, a clear day lifts Honeycomb, a clear night lifts Orchid, a stormy night lifts Moonflower), and typists react (Night Owl, Rain Lover, the Poe Muse, storms halve speed). With the toggles those effects are free to farm. As an automatic cycle they become a rhythm the player plans around.

## Design

- **A deterministic world function.** `World.at(tMs)` returns `{ phase, night, weather }` from the wall clock and a fixed seed, so any moment (now, the forecast, an hour ago while away) is reproducible and nothing needs saving. Day phase from `(t mod DAY_MS) / DAY_MS`. Weather from a smooth hash noise over 3-minute cells mapped to 0 clear (55 %), 1 drizzle (20 %), 2 rain (15 %), 3 storm (10 %), with a rule that storms follow rain (never clear straight to storm) and a short cooldown so it does not flicker.
- **Wiring.** `core.js` owns `World`; it drives `document.body.classList 'night'` (with a dusk/dawn sky tint) and `Weather.setState(n)` (quiet = false so the rain animation and sound play). Everything that reads `Weather.state` and `body.night` keeps working unchanged: `marketBias`, `typistSpeed`, `pawSecs`, `stormy`, division quirks, mood, the window art.
- **Gauges.** The weather toy shows the sky icon and a small countdown ("rain in 2:10"). The night toy shows a sun/moon face with the phase. Tapping either opens a toast with the forecast. Remove `Weather.next` and the night toggle handlers from `core.js`; keep the toy buttons so the layout does not change. The Settings popover and tutorial text that mention toggling the weather are updated.
- **Barometer (Shop, bananas, 2 tiers).** Tier 1 shows the next two changes (about 8 minutes ahead); tier 2 shows the next four and marks each on the Market page as "good for Bamboo/Hibiscus/..." so a player can hold a ready title for the right sky. The news ticker gets forecast headlines ("Clouds gather over the canopy").
- **Offline.** `simulateAway` iterates its steps over `World.at(now - away + step)` so night owls and storms count for the time you were away.
- **Dynamics worth adding while here (small):** a one-line "sky bonus" chip on the Floor ("Night: Owls +40 %, Bamboo titles +30 %") so the cause and effect are visible; lightning during storms briefly lights the window (already drawn by `Weather`).

## Files

`core.js` (`World`, toys), `weather.js` (`setState` already exists), `mood.js` (unchanged), `ops.js` (`simulateAway`, Market page copy, barometer, sky chip), `ops.css`, `app.js` / `classic.js` (toy art for the gauges), `tour.js` and `README.md` (copy that mentions the toggles), `tools/balance.html` stub (provide `World` or a constant sky), `BALANCE.md`.

## Acceptance

- Reloading the page at the same moment shows the same sky; two tabs agree; the sky advances with no input; offline progress counts the sky.
- No way to force the weather or night from the UI. The harness (`tools/balance.html`) stays deterministic (fixed or scripted sky) and every milestone is re-run with the real cycle to confirm pacing. Report average market multipliers per band before and after (they should be roughly unchanged on average, just rhythmic).
- Weather and day/night effects are visible on the Floor and Market pages, both art styles, phone first. Reduced motion and the Low effects setting still behave.

## Status

Done. The sky follows the game clock (`world.js`); the weather and day/night toys are gauges with a countdown that read out the forecast when tapped; the Shop sells a two-tier **Barometer** (30k and 150k bananas); the Market page has a "The sky" card and the Floor info bar a sky chip; offline progress samples the sky.

## Handoff notes

- `world.js` is pure: `World.at(t)` gives `{night, phase, phaseT, wx}`, `World.next(t, n, kind)` the next changes (`'wx'`, `'night'`, `'any'`), `World.untilNext`, `World.label`. A day is 14 min (day 0-540 s, dusk 540-600, night 600-780, dawn 780-840; dusk and dawn count as day). Weather is chosen per 150 s cell by an integer hash: clear 55 %, drizzle 15 %, rain 21 %, storm 9 % (a storm needs weather in the cell before it, so clear never jumps to storm). `world_test.cjs`-style checks: forecast agrees with `at` across 6000 samples.
- `core.js` applies the sky once a second (`skyStep`, also when the tab becomes visible): `body.night`, `Weather.setState`, the gauges, and the `sky` / `skysoon` events on the IMI bus (ops.js turns them into news lines). `IMI.forecastText(id)` is what a gauge tap says; the barometer tier is read through `IMI.ops.baro()`.
- `ops.js` never reads the sky from the DOM now: `sky()` returns `World.at(Date.now())` unless `skyOv` is set (only `simulateAway` sets it, per step, so owls, rain lovers, storms and the market count for time away). `marketBias(band, sk = sky())`. The harness keeps working because `tools/balance.html` loads `world.js` and its fake `Date.now` drives the sky.
- Balance (bot, one seed, `activeMinutes` 30 as in the other tables): active Lagoon 80.5 to 64.3, first division 167.5 to 165, first star 216.6 to 205.7, Honeycomb 334.1 to 325.1; idle Honeycomb 431.8 to 432.6. Pacing is unchanged within noise. Average market bias per band over two days (clear day was a fixed +0.2 on band 3 before): 0.064 0.107 0.042 0.087 0.035 0.062. Storms are 9 % of the time and halve typing speed (the offline check shows 6940 against 12928 letters per hour in a storm).
- Not done: no nudge or weather control by design; the window art still reads `Weather.state` (visual only). The Settings popover never had a weather entry, so nothing to remove there.

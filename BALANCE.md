# Typewriter Ops balance notes

## How to measure
`tools/balance.html` runs the real `ops.js` on a virtual clock with a seeded RNG, and `tools/bot.js` plays it (sells titles as soon as they are ready, focuses keepers on the cheapest remaining title, spends letters on training and bananas in a fixed priority order). Two entry points, both needing `python -m http.server 8123` in the repo root and a local Chrome:

- `node tools/balance.mjs <minutes> <idle|active> <keeperDef> <seed> <activeMinutes> '<tuneJSON>'` plays one run and prints milestone times (in minutes) plus income samples.
- `node tools/sweep.mjs <profile> <minutes> <activeMinutes> <seeds> 'name={tuneJSON}' ...` runs several configs over several seeds and prints median milestone times.

Profiles: **idle** (80 boot taps to hire the first typist, then nothing) and **active** (taps for `activeMinutes`, using Hold once bought). The tune JSON overrides the knobs below through `window.__TUNE` (empty on the real site).

Limits of the bot: it does not play Muses, the garden, the rights market timing, golden bananas, challenges or prestige, and it taps at a fixed rate. Treat the numbers as a floor for a human who plays those systems, not a prediction.

## What the first run showed
With the original numbers the bot sold its first title at 1.1 minutes and had every machine up to Amber at 9 minutes; by 20 minutes it had 16 billion bananas. Typist output did not slow down on bigger machines, pitched titles paid far too much for the effort, and royalties plus divisions compounded on top.

## Knobs (defaults in `ops.js`, tuned values)
| Knob | Was | Now | Why |
|---|---|---|---|
| `PAW_BASE` seconds per letter, per desk | 2 for all | 3, 9, 27, 81, 243, 729 | Longer-word machines should be slower to automate |
| `PAW_COST` letters for the first extra typist | 25 for all | 25, 35, 50, 70, 100, 140 | Matches each desk's slower output |
| `PAW_GROW` cost growth per typist | 1.7 | 1.9 | Slows crew snowballing |
| `PITCH_PAY` rights for a standard pitched title, by band | scaled from a per-word rate | 100, 1.26K, 15.6K, 196K, 2.44M, 30.6M | About a twelfth of the next machine price, then reduced 40% |
| `TITLE_SCALE` size of pitched titles by band | none | 1, 1.3, 1.7, 2.2, 3, 4 | Higher bands need more words |
| `ROY_BASE` royalty rate per second of a title's pay | 0.0008 | 0.00003 | Royalties from many titles were swamping everything |
| Division prices | 20K, 300K, 4M, 55M, 800M | 120K, 1.8M, 24M, 330M, 4.8B | Divisions arrive mid-game, not minutes in |
| Division income per release | 25, 375, 5K, 70K, 1M | 15, 225, 3K, 42K, 600K | Roughly 2 hours to pay back the first release |
| Letter garden growth time | same on every desk | x1, 2, 5, 12, 30, 80 by desk | A plot would out-produce 150 high-band typists |
| Keeper default stack target | 3 | 0 | Default 3 wasted letters on words no title needs |

## Target arc and what the bot achieves
The target is a hook in the first session, a return visit for Blue, a day for Orchid, and days for Moonflower and the first Second Printing.

| Milestone | Idle (median of 2 seeds) | Active for 30 minutes (3 seeds) |
|---|---|---|
| First title | 10 min | 1.3 min |
| Hibiscus Ribbon | 12 min | 3 min |
| First 6 titles | 41 min | 29 min |
| Lagoon Sprint (25K) | 2.2 h | 2 h |
| All 16 authored titles | 3.4 h | 3.9 h |
| Honeycomb Ledger (312K) | 4.2 h | 3.3 h |
| First division | 4.6 h | 3.5 h |
| Orchid Imperial (3.9M) | beyond 10 h | beyond 6 h |
| Moonflower Grand (48.8M) | beyond 10 h | beyond 6 h |
| First Legacy star (500K earned) | 3.1 h | 2.9 h |

Active play is much faster early, then converges with idle once the later machines take over, because they are driven by typists and not by tapping.

## Things worth watching with real players
- The Hold-to-type speed (4 letters per second, up to 16 with upgrades) is still large next to a Bamboo typist (0.33 per second). If early active play feels too fast, lower `HOLD_BASE` first.
- Awards add 1% each, Muses and Legacy multiply on top, and the five publishing deals total about x18 on royalties. Check late-game income if players report runaway numbers.
- The market multiplier and golden bananas are not modelled, so real income runs a little higher than the bot's.

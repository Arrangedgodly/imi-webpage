# 08: Balance pass for the new economy

**Read `README.md` first, then `BALANCE.md` (how the harness works and the previous tuning).** Size: medium. Depends on **03** and **07** being merged.

## Why

Three changes shift the whole curve: keepers are free and automatic (03), all keepers chase one goal (03), and 300 cheap kids' titles exist for the first typewriter (07). Titles will be bought much faster early, and letters will be consumed by keepers instead of piling up. The owner wants:

- progression that **feels earned** and idle-friendly without pure click-spam, but tapping still a strong accelerator ("cookie clicker feel");
- purchases that **scale harder**, so the first minutes are quick and the later machines are real goals;
- a **tactical choice**: pausing keepers to **hoard letters** (to afford a typist hire or an upgrade, which cost *letters from that desk*) should be worth it sometimes, instead of "let keepers run and grind to buy everything as fast as possible". Letter pools stay separate per desk (see 03).

## Levers you may change (all at the top of `ops.js`, overridable through `window.__TUNE` for the harness)

- `PAW_BASE`, `PAW_COST`, `PAW_GROW` (typist speed per desk, letters for the first extra typist per desk, growth per typist). Add a **machine-count surcharge** for typist costs: later machines get steeper hire costs (e.g. cost x `1 + PAW_DESK_STEP * i`, knob `PAW_DESK_STEP`), so a new typewriter does not immediately get a big crew for cheap.
- Keeper speed. Today `keeperStep` banks up to one word per desk every 0.4 s (`keeperT` in `tick`, doubled by Muse "hemi"). Free keepers at that speed will drain letters instantly. Add a TUNE-able `KEEPER_PERIOD` (seconds per banked word per desk, e.g. 1.2s on the first desk and slower for later desks) and mirror it in `keeperBulk`/`simulateAway` (offline) so online and offline stay consistent. Consider making hoarding explicit: a per-desk "reserve" is **not** required; the Paused toggle is the lever.
- Title economy: kids' `KID_PAY_PER_WORD` (formula constant used by `tools/build-kids-readers.mjs`, task 07; if the pay is baked into `readers-kids.js`, add a runtime multiplier `KID_PAY` instead so no regeneration is needed), `KID_ROY` (royalty factor for kids' titles), `KID_LIST` (how many are visible), `PITCH_PAY`, `TITLE_SCALE`, `ROY_BASE`, `SHOP` prices, `DEALS`/`DIVS` costs, Muse costs, `GARDEN_*`.
- Also fine: costs of the first desks (`DESKS[i].price`), `HOLD_BASE`/`RAPID_STEP`.

## Harness work first

1. Update `tools/bot.js` to the new rules if task 03 only did the minimum: no keeper purchase, global focus (the bot should simply let auto focus pick), and read `KEEPER_PERIOD`. Add two **strategies** selectable from `Bot.start({ strategy })`: `collect` (keepers always on; spends letters opportunistically) and `hoard` (pauses a desk's keeper until it can afford the next typist/upgrade, then resumes). Report both in `balance.mjs`/`sweep.mjs` output.
2. Add milestones: first title, 3rd/6th/16th title, first 25/100 kids' titles, first typist hire, Hibiscus bought, Lagoon bought, first deal, first division, first Legacy star. (The harness already prints many; extend `marks`.)
3. Keep the harness fast (a 60 simulated-minute run takes ~2s).

## Targets (adjust with justification, record the final table in `BALANCE.md`)

| Milestone | Active player (taps ~30 min then idles) | Idle player |
|---|---|---|
| First typist hired | 1.5-3 min | 5-10 min |
| First title sold | 1-3 min | 6-12 min |
| 25 kids' titles | 12-20 min | 45-90 min |
| Hibiscus Ribbon (2,000) | 12-20 min | 40-90 min |
| First Muse slot (3 authored sold) | 5-12 min | 20-45 min |
| Lagoon Sprint (25K) | 1.5-3 h | 3-5 h |
| Honeycomb Ledger (312K) | 3.5-6 h | 6-10 h |
| First Legacy star | 4-8 h | 8-14 h |

Hoard vs collect: over the first hour, **hoard should beat collect on crew growth (typists/upgrades) by a visible but not huge margin (roughly 10-25%), and lose on titles sold**, so the choice is real. Document the numbers.

Early feel: with free keepers the very first minutes should still reward tapping hard (title completes noticeably faster when tapping), but a player who taps ~2 minutes then idles must still progress steadily.

## Method

Use `node tools/sweep.mjs` (see `BALANCE.md`: configs by `name={tuneJSON}`, medians over seeds) to compare configurations; change one knob family at a time; keep a table of runs in your handoff notes. Do not tune only to the bot: it does not play golden bananas, Muses, the garden, market timing or prestige (it is a floor for a human). Leave a 15-25% margin for those systems.

## Also update

- `BALANCE.md`: replace the keeper rows (Default stack target etc.), the milestone table, "what the bot achieves", and add a short "Keepers are free" section and the new knobs.
- In-game copy that states numbers (training/keeper tooltips, news lines) if any are now wrong.
- Do not change save format. If a knob changes how existing saves progress (e.g. typist costs), that is acceptable (the game is early), but note it.

## Acceptance checklist

- Harness runs both strategies for 8 simulated hours with no page errors; final table in `BALANCE.md` meets the targets (or the doc explains why a row moved).
- `KEEPER_PERIOD` used consistently online and offline (a plant-`lastSeen`-two-hours-back test gives words in the same ballpark as 2 hours of online play at `eff` 0.4-0.7 efficiency).
- A manual play check in a browser (1280x800 pixel): first 5 minutes with tapping feel good; nothing stalls with zero letters and no way forward.

## Status

DONE (with documented deviations, see `BALANCE.md`).

## Handoff notes
- Files: `ops.js` (knobs: `KEEPER_PERIOD`, `PAW_DESK_STEP`, `AUTH_PAY`, `KID_PAY`, `DIV_BASE` default, `SHOP` tune hook; per-desk keeper timers; `keeperBulk` scaled by `eff`/period; `pickAutoFocus` now ranks by effort per rights via `autoEffort`), `tools/bot.js` (collect/hoard strategies, no manual banking, idle = 1 tap/s until first typist, new milestones), `tools/sweep.mjs`, `tools/balance.mjs`, `BALANCE.md`.
- Misses against the target table: first Muse slot (2.4/6.9 min vs 5-12/20-45), Honeycomb active 7.0 h (target 3.5-6), first star idle 6.8 h (target 8-14), hoard's crew advantage is only +5% when tapping (+67% idle). Reasons in `BALANCE.md`.
- Offline vs online keeper banking checked (43% at eff 0.4). Browser check at 1280x800 pixel only, first ~20 s of hard tapping; the 5-minute feel and classic edition were not walked through by hand.
- 9 simulated-hour runs for both strategies and both profiles ended with no page errors. Not re-run after the last knob change: the active/idle hoard rows (only collect was run on the final `ROY_BASE`/`DIV_BASE`), and multiple seeds on the final set (one seed each; the 3-seed numbers are from the first hour).
- Old saves progress under new typist/pay numbers (no format change).
- The guided tutorial (task 09) overlay blocks Space/clicks in a fresh game; automation must click "Skip" first.

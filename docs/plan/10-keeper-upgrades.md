# 10: Keeper upgrades (faster keepers, bought with bananas)

**Read `README.md` first.** Size: M. Depends on 03 (free shared-goal keepers). Independent of 11-13.

## Why

Keepers are free and fixed: `KEEPER_PERIOD = [0.6, 1.2, 2, 3, 4, 5]` seconds per banked word per desk. Once a desk's crew makes letters faster than its keeper can turn them into words, letters pile up and the keeper is the bottleneck (see the notes in `BALANCE.md`). Today the only lever is the Muse "hemi" (x2). The owner wants **each keeper to be upgradeable on its own**, so a late desk is not stuck at 5 seconds a word.

## Design

- **State:** `S.desks[i].keeper.lv` (integer, default 0, saved with the desk; old saves load as 0 because desks merge `{...newDesk, ...saved}`).
- **Effect:** the keeper's period on desk `i` is `KEEPER_PERIOD[i] * KEEPER_UP_STEP ^ lv` seconds per word (the Muse multiplier stays separate). `KEEPER_UP_STEP = 0.9`, `KEEPER_UP_MAX = 6`, so a maxed keeper is about 1.9x faster. One helper, `keeperPeriod(i)`, is the single place the period is read: the tick loop, `keeperBulk` and `simulateAway` must all use it (away efficiency applies on top, as today).
- **Cost:** bananas, in the Shop under a new heading **Keepers** with one card per owned desk, like the Restorations cards (`mkCard`). `cost(i, lv) = KEEPER_UP_BASE[i] * KEEPER_UP_GROW ^ lv` with `KEEPER_UP_BASE = [150, 1500, 12000, 150000, 1.8e6, 2.2e7]` and `KEEPER_UP_GROW = 2.1` (about 5% of the next machine's price for the first level, much more for the last).
- **UI:** the card shows `Lv n/6`, the current and next seconds per word, and a Buy button. The Words page keeper strip shows each desk's level on its chip. The Shop tab badge counts a keeper upgrade you can afford.
- **Not in this task:** per-keeper "bank two words" perks, letters as currency.

## Files

`ops.js` (`keeperPeriod`, `buy('keeper')`, `renderShop`, `badgeFor('shop')`, `keeperStrip`, dev handle), `ops.css` (small), `tools/bot.js` (the bot buys keeper levels after desks), `BALANCE.md`.

## Acceptance

- A fresh game and every old save behave exactly as before (level 0). Offline progress uses the upgraded period.
- Balance bot (active/idle, collect): milestones stay inside the targets in `BALANCE.md`; report before/after in a table. If keepers make a milestone arrive early, retune `KEEPER_UP_*`, not the base periods.
- Both art styles, phone and desktop; no console errors; smoke tests pass.

## Status

Not started.

## Handoff notes

(none yet)

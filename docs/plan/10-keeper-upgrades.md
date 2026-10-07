# 10: Keeper upgrades (faster keepers, bought with bananas)

**Read `README.md` first.** Size: M. Depends on 03 (free shared-goal keepers). Independent of 11-13.

## Why

Keepers are free and fixed: `KEEPER_PERIOD = [0.6, 1.2, 2, 3, 4, 5]` seconds per banked word per desk. Once a desk's crew makes letters faster than its keeper can turn them into words, letters pile up and the keeper is the bottleneck (see the notes in `BALANCE.md`). Today the only lever is the Muse "hemi" (x2). The owner wants **each keeper to be upgradeable on its own**, so a late desk is not stuck at 5 seconds a word.

## Design

- **State:** `S.desks[i].keeper.lv` (integer, default 0, saved with the desk; old saves load as 0 because desks merge `{...newDesk, ...saved}`).
- **Effect:** the keeper's period on desk `i` is `KEEPER_PERIOD[i] * KEEPER_UP_STEP ^ lv` seconds per word (the Muse multiplier stays separate). `KEEPER_UP_STEP = 0.9`, `KEEPER_UP_MAX = 6`, so a maxed keeper is about 1.9x faster. One helper, `keeperPeriod(i)`, is the single place the period is read: the tick loop, `keeperBulk` and `simulateAway` must all use it (away efficiency applies on top, as today).
- **Cost:** bananas, in the Shop under a new heading **Keepers** with one card per owned desk, like the Restorations cards (`mkCard`). `cost(i, lv) = KEEPER_UP_BASE[i] * KEEPER_UP_GROW ^ lv` with `KEEPER_UP_BASE = [100, 600, 3000, 30000, 4e5, 5e6]` and `KEEPER_UP_GROW = 1.8`. (The first draft, base x1.5 and growth 2.1, made a fully tuned Lagoon keeper cost 925K bananas, three Honeycomb desks, and delayed the first division by an hour in the bot runs.)
- **UI:** the card shows `Lv n/6`, the current and next seconds per word, and a Buy button. The Words page keeper strip shows each desk's level on its chip. The Shop tab badge counts a keeper upgrade you can afford.
- **Not in this task:** per-keeper "bank two words" perks, letters as currency.

## Files

`ops.js` (`keeperPeriod`, `buy('keeper')`, `renderShop`, `badgeFor('shop')`, `keeperStrip`, dev handle), `ops.css` (small), `tools/bot.js` (the bot buys keeper levels after desks), `BALANCE.md`.

## Acceptance

- A fresh game and every old save behave exactly as before (level 0). Offline progress uses the upgraded period.
- Balance bot (active/idle, collect): milestones stay inside the targets in `BALANCE.md`; report before/after in a table. If keepers make a milestone arrive early, retune `KEEPER_UP_*`, not the base periods.
- Both art styles, phone and desktop; no console errors; smoke tests pass.

## Status

Done. Level 0 everywhere by default; the Shop has a **Keepers** section with one card per owned machine; the Words page chips show `Lv n`; the badge on Shop counts an affordable level.

## Handoff notes

- `keeperPeriod(i)` is the single reader of the period (tick loop and `simulateAway`/`keeperBulk`). Verified offline: 21, 30 and 39 words in a simulated minute at levels 0, 3 and 6 (the expected 1.37x and 1.88x).
- Balance (bot, one seed): keeper upgrades roughly **double early title throughput** (100 kids' titles at minute 71 instead of 134) and cost real bananas, so they trade against desks and divisions. Active milestones move a little later (Hibiscus 11.5 to 13.2, Honeycomb 338 to 364, first division 141 to 198); idle ones move earlier (Lagoon 196 to 172, Honeycomb 443 to 419). Table in `BALANCE.md`.
- The bot buys a keeper level only when it costs at most 15% of the next machine's price (otherwise it tuned Bamboo keepers instead of saving for Hibiscus: Hibiscus at 16 minutes and 78 idle).
- The upgrade is speed only. If keeper speed still feels weak late, the natural next lever is not a faster period but a letter-saving perk (e.g. a chance a banked word keeps its letters), which would change the letter economy and needs its own balance pass.

# 11: Auto-publisher (automate selling titles, like keepers do for words)

**Read `README.md` first.** Size: M. Depends on 04 (Titles page) and benefits from 10 (shop pattern). Independent of 12-13.

## Why

Keepers bank the words and auto focus picks the next goal, but a finished title still waits for the player to press **Write & sell**. The owner wants a shop purchase that automates that step so the loop (type, bank, sell, repeat) can run unattended, while still leaving the market-timing game available to players who want it.

## Design

- **Shop item "Publisher's assistant"** (bananas, gated by 3 sold titles; one-time purchase like the Literary agent). Once owned, the Titles page shows an **Auto-sell** switch (on/off, remembered in the save) next to Auto focus.
- **Behaviour:** every `PUB_PERIOD` seconds (default 12) the assistant sells **one** ready title (a title `canWrite` says is ready), choosing the highest `salePay`. It uses the real `writeTitle` path, so awards, royalties, the shelf, celebrations and the market all behave exactly as a manual sale.
- **Market rule (the player's lever):** a selector on the Titles page: **Any price** (sell as soon as ready), **Fair or better** (only when that title's band multiplier is at least 1.0), **Hot only** (at least 1.4). Default **Fair or better**. Titles that are held simply wait; the player can still sell by hand.
- **Upgrades, bananas, three tiers:** (1) the base assistant, period 12 s; (2) **Fast presses** period 6 s; (3) **Night shift** also sells while you are away (see below). Each tier is one Shop purchase.
- **Away:** only tier 3 acts during `simulateAway`: at return, sell ready titles in order of `salePay` at the *average* market (multiplier 1.0, never above), up to `awayCap`-limited count, with the existing away efficiency. Without tier 3 nothing sells offline (as today), so the idle economy only changes for players who buy it.
- **Safety:** it never sells the title the player has focused by hand (`S.autoFocus === false` and `S.focus === id`); that stays a manual decision. It skips while a modal or celebration is open, and respects Oulipo challenges (`chal`) that restrict selling.
- **UI:** a small status line on the Titles page ("Auto-sell on: next in 8s", "Holding 3 titles for a better price") and a toast/news line on each automatic sale.

## Files

`ops.js` (shop item, `S.pub`, tick hook, `simulateAway`, Titles goal card), `ops.css`, `tools/bot.js` (bot buys it and uses Fair or better), `BALANCE.md`, README feature list.

## Acceptance

- Bot comparison with and without the assistant (active and idle): sales per hour, milestones, and how much the "Fair or better" rule earns over "Any price" (it should be visibly better, otherwise the selector is pointless). Idle milestones with tier 3 may move earlier; report it and retune prices rather than the away efficiency.
- Manual selling still works with the assistant on. No double sales, no sale of an unready title, no console errors in both art styles.

## Status

Not started.

## Handoff notes

(none yet)

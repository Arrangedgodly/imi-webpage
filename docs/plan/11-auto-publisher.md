# 11: Auto-publisher (automate selling titles, like keepers do for words)

**Read `README.md` first.** Size: M. Depends on 04 (Titles page) and benefits from 10 (shop pattern). Independent of 12-13.

## Why

Keepers bank the words and auto focus picks the next goal, but a finished title still waits for the player to press **Write & sell**. The owner wants a shop purchase that automates that step so the loop (type, bank, sell, repeat) can run unattended, while still leaving the market-timing game available to players who want it.

## Design

- **Shop item "Publisher's assistant"** (bananas, 6,000, gated by 3 sold titles). Once owned, the Titles page shows an **Auto-sell** switch (on/off, remembered in the save) next to Auto focus.
- **Behaviour:** every `PUB_PERIOD` seconds (default 12) the assistant sells **one** ready title (a title `canWrite` says is ready), choosing the highest `salePay`. It uses the real `writeTitle` path, so awards, royalties, the shelf, celebrations and the market all behave exactly as a manual sale.
- **Market rule (the player's lever):** a selector on the Titles page: **Any price** (sell as soon as ready), **Fair or better** (only when that title's band multiplier is at least 1.0), **Hot only** (at least 1.4). Default **Any price** (changed after balance testing: holding for a fair price costs a lot early, when income is small and compounds fast). Titles that are held simply wait; the player can still sell by hand.
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

Done. Shop > Market tools has the three tiers (6,000 / 50,000 / 350,000 bananas); the Titles page shows the Auto-sell bar once tier 1 is owned.

## Handoff notes

- State is `S.pub = { tier, on, rule }` (`fresh()` default tier 0, rule `any`); it resets on a new printing like the other shop items. `pubSell()` runs from `tick()` every `pubPeriod()` seconds (12 s, 6 s from tier 2) and uses the real `writeTitle(id, null, { auto: true })`. `writeTitle` gained `opts`: `auto` (lighter fanfare: no flash, shake or vibration), `silent` (bulk sales away: no effects, no news, no save) and `mult` (price at a given market multiplier; `salePay(r, m)`). `pubStatus()` feeds the status line. Tier 3's `autoSellAway()` runs at the end of `simulateAway`, selling at market x1.0, and the welcome-back report gets a line for it.
- It never sells the title the player focused by hand, skips while a modal or celebration is open, and holds titles under the chosen market rule.
- **Balance (bot, active, one seed).** Selling only through the assistant (the bot stops selling by hand once it owns it) is slower than selling by hand instantly, which is the point of a tax on automation: Lagoon 83 min by hand; 111 with the assistant on Any at 12 s; 92 on Any at 6 s (tier 2); 173 on Fair at 12 s. Holding for a fair price is costly early, so the default is Any. Casual player (checks in for one minute every 10): Lagoon is **never reached in 8 hours** without the assistant and arrives at minute 371 with it; 100 kids' titles at 265 minutes instead of 311. A first price of 20,000 arrived too late for those players (about minute 80) and made the attentive bot's Honeycomb 40 minutes later.
- The bot's knobs: `BOT_SELL: 'pub'` (buy it and stop selling by hand), `BOT_PUB_RULE`, `BOT_VISIT: N` (only sell by hand for one minute every N). Numbers in `BALANCE.md`.
- Not done: the bot cannot judge market-timing skill (Fair vs Any measured about +1.5% by Honeycomb when bought late), and tier 3 (away sales) is only unit-tested, not simulated, because the harness has no away periods.

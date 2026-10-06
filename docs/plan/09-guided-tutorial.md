# 09: Guided tutorial and progressive reveal

**Read `README.md` first.** Size: large. Depends on **all previous tasks** (the flow it teaches must be final: global keeper goal, Titles sub-tabs, Legacy tab with gating, Settings "Replay tutorial" slot from 01).

## Why

A new player opens the game and sees a typewriter, nine department tabs, a machine bar, a news ticker and four header toys with no explanation. They cannot tell how progress works: tap -> letters -> (keepers bank) words -> titles -> bananas -> typists/typewriters. The owner wants a **guided tutorial that makes it clear how you move between screens**, so a first-time user understands what is going on. It must teach by doing (short, interactive, skippable), not by walls of text, and it should reuse progressive reveal so the first screen is simple.

## Deliverables

### A. Event bus (small, in `core.js`)
`IMI.on(name, fn)`, `IMI.off`, `IMI.emit(name, data)`; plain arrays, no dependencies. `ops.js` emits (add one-line `IMI.emit` calls at the existing code sites; do not restructure): `tap` (every manual `press`, with total letters), `letters` (desk letter total changed, throttle with the 4/s render), `hire` (typist bought), `bank` (word banked, by hand or keeper), `focus` (goal changed), `ready` (a title became writable), `sold` (title sold), `desk` (typewriter bought), `tab` (department/sub-tab shown), `toy` (header toy used), `daily`, `gold` (golden banana caught). The harness stub in `tools/balance.html` must also define `on/off/emit` as no-ops.

### B. `tour.js` (new file, loaded after `ops.js` in `index.html`, `classic.html`; not needed in the balance harness)
A tiny coach-mark engine plus the step script.

- **Persistence:** `localStorage['imi-tour'] = { step, done, tips: { id: true } }`. Players with an existing save (`S.stats.letters >= 200`) are marked `done` automatically and never see the tour (tips still allowed). `IMI.tour = { replay(), skip(), active() }`; Settings (task 01) shows "Replay tutorial" when `IMI.tour.replay` exists.
- **Visuals (both editions):** a pulsing ring around the target element (outline + `box-shadow`, no full-screen blocking overlay so the player can actually press the highlighted control), a speech-bubble card with the monkey, 1-2 short lines, a step counter ("3/8"), **Skip** and **Next** (when the step is not action-gated). Pixel: `border-image: var(--frame-paper-s)` bubble with `--font-px`; classic: cream rounded bubble with a tail. Keep text short (max ~18 words per step). Bubble placement: above or below the target, clamped inside the viewport, never covering the target; on phones it docks at the top (under the header) or just above the tab bar depending on where the target is. Re-measure on resize and on every `render` (the DOM is patched, targets may re-create; look them up by selector each time and tolerate absence by waiting).
- **Step engine:** data-driven array of `{ id, target, text, wait, done }` where `target` is a selector (or function), `wait` is an event name or predicate that completes the step, and `done` may be a condition checked on each `render`. A step whose target is not visible (wrong tab) first points at the tab button that gets the player there ("Open **Train**").
- **Respect reduced motion** (no pulse), add `role="status"`/`aria-live="polite"`, Esc skips.

### C. The script (suggested; the agent may tighten wording and order but must keep each concept once)

1. **Floor:** "Tap the typewriter (or press Space) to type letters." (wait: 15 letters)
2. **Letters tray:** "Letters collect here. Each typewriter keeps its own." (Next)
3. **Train tab:** "Spend letters to hire a typist who types for you." Highlight `Train`, then the Hire button (wait: `hire`).
4. **Floor again:** "Your typist works on its own. Keep tapping to go faster." (Next)
5. **Words tab:** "Keepers turn letters into words automatically. They work toward your current goal." Point at the goal strip (task 03) (Next).
6. **Titles tab:** "A goal is a title. When all its words are banked, press Write & sell." Highlight the Titles tab, then the goal bar (wait: `sold`; if the player is slow, offer a hint "Tap faster or hire more typists").
7. **After the first sale:** "Bananas! Spend them in the Shop on a new typewriter." Highlight `Shop` (wait: `tab` shop), then the first desk's Buy (it is cheap relative to progress; if unaffordable say "Save up 2,000 bananas").
8. **Header toys:** "Snack and coconut boost you; weather and night change what sells." Highlight the dock (Next). Finish: "More departments appear as you grow." and a closing line pointing at Settings > Replay tutorial.

### D. Progressive reveal (so the first screen is simple)
Reuse the tab-gating mechanism added in task 06 (`TAB_GATES`, `tabVisible(id)`, `hidden` on tab buttons; written generically there). Gates are based on **save progress, not on the tutorial flag**, so existing players see everything they already earned and the same rules apply with or without the tour:
- `training`: visible from the start (it is step 3) but badge-pulsing once letters >= 25.
- `lab` (Words): after the first hire or 60 letters typed.
- `press` (Titles): after the first banked word or when any title is ready.
- `shop`: after the first banana earned or 1 title sold.
- `studios`, `muses`, `legacy`, `records`: keep their existing unlock rules; show a **locked hint chip** in the More sheet or tab ("Sell 3 titles") instead of nothing where cheap to add.
- Desk bar: only shows locked machines after the first sale.
Everything stays reachable via save progress; never hide a tab that a loaded old save already uses.

### E. Contextual tips (after the tour; one-shot toasts/bubbles)
Reuse the bubble for single-line tips triggered once by an event/condition, remembered in `tips`: first `ready` title ("Ready! Open Titles and press Write & sell"), first HOT market (when the Market sub-tab unlocks), first golden banana appears ("Catch it!"), first pitch slot, first Muse slot, first Legacy star, first daily crate. Keep them rare (max one tip per 2 minutes) and dismissible; add a "Tips" on/off row in Settings.

## Where things are

- `ops.js`: `setTab(t)` (tab switching and `tab` event), `render()`/`renderChrome()` (4x/s; tabs are toggled there), `ACTIONS` (`up` for hiring: `ACTIONS.up` -> `buyUp('paw')`), `writeTitle`, `bankWord`/`keeperStep`, `buy('desk')`, `press`. Header toys are in `core.js` (`useToy`). Settings popover from task 01 in `core.js`/CSS.
- Selectors you can rely on: tabs `.o-tab[data-tab="..."]`, More button `#oMore`, hire button `.o-btn[data-act="up"][data-k="paw"]`, stage `#oStage`, letter tray `#oTray`, toys `#toyDock`, goal bar (added in 03/04; give it `id="oGoal"`), desk bar `#oDesks`.

## Acceptance checklist

- Fresh profile (`localStorage.clear()`): the tour starts on the floor, every step is completable by actually doing the thing, and it ends. Verify with `page.click` scripts and screenshots of each step (pixel + classic, 390x700 and 1280x800): bubble never covers its target or leaves the viewport.
- Skip works at any step and survives reload; `Replay tutorial` restarts it without wiping the save.
- A planted mid-game save never sees the tour; tabs it already uses are visible.
- No console errors; no per-frame layout thrash (the engine updates on `render`/resize, not every animation frame); the 4-minute soak from task 07 is unchanged.
- Fresh-profile first screen shows few tabs (progressive reveal) and the phone More sheet is not offered until it has something in it.

## Status

DONE (verified; see handoff for what was not built).

## Handoff notes

- Files: `tour.js` (new, loaded after `ops.js` in both pages), `core.js` (event bus `IMI.on/off/emit`, `toy` events, Settings rows "Tutorial: Replay" and "Tips: On/Off" are always built and shown only once `IMI.tour` exists), `ops.js` (emits, gates, `IMI.ops.snap()`, `#oGoal`, `#oKeepers`), `ops.css` (tour/tip styles, end of file), `styles.css`/`classic.css` (`.set-row[hidden]`), `tools/balance.html` (no-op bus stub).
- Events emitted: `tap letters hire bank focus ready sold desk tab(+sub) toy daily gold`, plus `goldspawn` (tip) and `render` (engine heartbeat, after each render).
- Tour = 9 steps (tap, tray, hire, work, words, sell, shop, toys, end). Steps carry `tab`; if the player is on another tab the bubble first points at that tab button ("Open Train"). `done(snap)` predicates complete steps from game state, so a head start or a reload skips what is already done. Replay shows Next on every step and never auto-completes. Esc skips; state in `localStorage['imi-tour']` = `{step, done, tips, tipsOff}`. Existing saves (>=200 letters typed) are marked done and tips they already outgrew are pre-marked.
- Step 1 waits for 30 typed letters (hire costs 25 and keepers may bank some). The words step is Next-only because keepers usually have banked a word by then.
- Progressive reveal (`TAB_GATES` in ops.js): lab (hire / 60 letters / a banked word), press (a banked word, sale or ready title), shop (any bananas or sale), studios and muses (3 non-kid sales or owned), records (any sale), legacy (task 06). More button is hidden until a tucked tab is visible. Locked desks appear in the desk bar only after the first sale.
- Tips: ready, hot market, golden banana, first pitch, muse seat, legacy star, daily crate; one per 2 minutes, never during the tour, dismissed by "Got it", Esc or 11s.
- Not built: locked-hint chips in the More sheet, and a dedicated pulse on the Train badge (the existing "!" badge already shows when the first typist is affordable).
- Verified with puppeteer: fresh profile full tour to the end on pixel + classic at 1280x800, 390x700, 360x560 (bubble inside viewport, zero overlap with the ring on every step); skip survives reload; Replay keeps the save; planted mid-game save sees no tour and all tabs it uses; tips fire; balance harness 60 min runs with no errors. Not run: the 4-minute soak from task 07.
- Test-only gotcha: puppeteer pages in one browser share localStorage; use `createBrowserContext()` for a fresh profile. A planted save needs `stats.byLetter` or `press()` throws (pre-existing).

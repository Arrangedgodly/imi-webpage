# 03: Keepers are free, automatic, and share one goal

**Read `README.md` first.** Size: large (touches state, logic, offline sim, four panels, awards). No dependencies. This is the core design change; later tasks assume it.

## Why (owner's words, condensed)

- Early game is too much manual word-buying and click-spamming. Word **keepers** (the automatic word-banking clerks) are a paid unlock today (`SHOP.keeper = 1000` bananas, per desk). They should be **a default unlock**: owning a typewriter means its keeper works from day one, so idle progression feels satisfying while tapping stays the "cookie clicker" accelerator.
- Each desk currently has its own title **focus** (`d.keeper.focus`), so keepers work towards *different* books. To change a focus you must switch desks on the Words page, then go to Titles. Confusing. **All keepers should work towards the same goal.**
- Letter pools stay **separate per desk** (letters never move between desks): that is what creates the tactical choice described in task 08 ("pause keepers and hoard letters to afford typists/upgrades"). Do not merge pools in this task.

## Design (implement exactly this)

1. **One global focus.** New state `S.focus` (title id or `null`) and `S.autoFocus` (boolean, default `true`). `focusRecipe(d)` (ops.js line ~258) ignores its argument and returns `RBY[S.focus]` if it exists and is unsold, else `null`. Keep the signature so call sites do not change (they are: `focusNeeds`, `roll`, `offlineDist`, `keeperBulk`, `keeperStep`, `museGift`, headline pool, `renderFloorInfo`, `renderLab`, `renderSecurity`, `renderPress` card text). Fix the two call sites that iterate desks to find "the" focused recipe (`museGift`: `S.desks.filter(...).map(focusRecipe)`; headline pool `S.desks.forEach(d => focusRecipe(d))`).
2. **Auto focus.** When `S.autoFocus` is true and there is no valid focus (none set, or it was just sold), choose the next one automatically: among unsold titles that are *reachable* (every word's band desk is owned, `S.desks[bandOf(len)].owned`), pick the one with the **fewest words still missing** (`r.total - progress(r)`), ties by lower `pay`. Implement as `pickAutoFocus()` called from `writeTitle` (after marking sold), from `tick` once a second when `!S.focus && S.autoFocus`, from the load block, and after buying a desk. A manual choice (`ACTIONS.focus`) sets `S.focus = id` and `S.autoFocus = false`; a "Let the keepers choose" control sets `S.autoFocus = true` and recomputes. `ACTIONS.unfocus` clears focus and turns auto on.
3. **Keepers are free and always present.** Delete the paid unlock: remove `keeper: 1000` from `SHOP`, the `what === 'keeper'` branch in `buy()`, the "Word keepers" section in `renderShop()`, the keeper terms in `badgeFor('shop')`/`badgeFor('security')`, and the "Needs this desk's word keeper" lock in `upLock` (`u.keeper` upgrades: Recipe practice, Stock-aware ink, Spare ribbon; remove their `keeper: 1` flags). Treat `d.keeper.owned` as `d.owned`: simplest is to keep the field, set `keeper.owned = true` in `newDesk(i)` when `i === 0`, set it whenever a desk is bought (`buy('desk')`), and **migrate old saves** (in the load block: every owned desk gets `keeper.owned = true`; a save whose desks had per-desk `keeper.focus` gets `S.focus` = the first non-sold focus found, `S.autoFocus = !that`). Players who already paid are not refunded (note it in the handoff).
4. **Pause switch instead of a purchase.** Keep `keeper.on` (Collecting / Paused) per desk. Surface it where it matters, not on a separate page: a small toggle on each desk card in the machine bar (`.o-desk`, rendered in `renderChrome()`; make it a real `<button data-act="ktoggle" data-i>` or an icon inside the card so taps don't also select the desk) and on the Training and Words headers. Tooltip/hint: "Paused keepers stop turning letters into words, so letters pile up for hiring and training." Default for new desks is Collecting.
5. **Keepers tab goes away; its useful bits move to Words (`lab`).** The `security` pane (`renderSecurity`) is mostly purchase UI that no longer exists. Remove the tab from `TABS` (also the `RENDER` map, `badgeFor`, `setTab` direction ordering uses TABS order, and the `[5]` "More" flags). In `renderLab()` add at the top a **Keeper strip**: current goal (title + progress bar `bar(progress(r), r.total)` + "Auto/Manual" switch + "Change" button that does `ACTIONS.go` to the Titles tab), and per-desk Collecting/Paused chips for owned desks. Move **per-word targets** and the **default stack target** (`kdef`, `ovrset`, `ovrdel`) into a collapsed "Advanced stock targets" `<details>` at the bottom of Words; default `def` stays 0 so keepers only bank what the goal needs.
6. **Offline and tick paths** use the same global focus (they already call `focusRecipe(d)`; verify `simulateAway` still banks the focused title's words: `keeperBulk` for each owned desk when `keeper.on`). The `Muse "hemi"` perk (keepers bank twice as fast) and `kon/koff/ovr*` actions keep working.
7. **Awards/news copy.** Award `'keep'` ("Hired Help", `ops.js` ~line 904) can no longer be earned by purchase: change it to *"Auto Clerk: have a keeper bank 25 words"* with test `S.stats.words >= 25`. Update `BALANCE.md` references later (task 08), not here. Update the two news lines that mention keepers if they now read wrong.
8. **Focus UI on the Titles page** (the "Focus" button on each title card, `ACTIONS.focus`) now sets the global focus, shows "Focused" on the single focused card, and no longer needs `d.keeper.owned` to be enabled. Keep this minimal here; task 04 redesigns the page. Also the card text `foc` ("focus: Bamboo Classic, ...") becomes a simple "current goal" tag.
9. Keys that glow for letters the focused title needs (`.o-key.want`) and the "Focus:" bar on the floor HUD (`#oFocus`) keep working for whichever desk is selected using the global focus. If the goal needs no words from the selected desk's band, show nothing special for that desk.

## Things that will bite you

- The selected-desk helpers (`cur()`, `S.sel`) are used by many UI paths; the global focus must not depend on them.
- `focusNeeds(d, i)` already filters the recipe's words to the desk's band (`bandOf(w.length) !== i`), so each desk's keeper automatically only banks its own band's words toward the shared goal. No change needed there.
- `ui` must not persist anything; new persisted fields go on `S` and into `fresh()`. `doPrint()` (prestige) builds a fresh state: decide that `S.autoFocus` resets to true and `S.focus` to null on a new printing.
- The balance harness drives the game through `IMI.ops.dev` (line ~1275): `buy('keeper')`, `focus` actions and `d.keeper.focus` are used by `tools/bot.js`. Update `tools/bot.js` minimally so it no longer buys keepers and no longer assigns per-desk focus (it should rely on auto focus). The full re-tune is task 08.

## Acceptance checklist

- New game: Bamboo's keeper is working immediately; tapping 25+ letters then waiting, words appear in the bank with no purchase; a title gets auto-focused and its letters are favoured.
- Old save (plant one with a bought keeper and per-desk focus): loads, migrates, no exceptions, focus preserved.
- Switching desks does not change the goal. Changing the goal from the Titles page affects every desk's keeper.
- Pause one desk's keeper: its letters accumulate, other desks keep banking.
- Offline: plant `lastSeen` two hours back, reload: welcome-back report shows banked words toward the goal.
- `tools/balance.mjs` still runs to completion with no page errors (numbers will have changed; that is task 08).
- Screenshots (pixel + classic, 390x700 and 1280x800) of Floor, Words (new keeper strip) and Shop (no keeper section).

## Status

Not started.

## Handoff notes

(none yet)

## Status: DONE

## Handoff notes
- Files: `ops.js`, `ops.css`, `tools/bot.js`. `S.focus`/`S.autoFocus` added (reset on a new printing via `fresh()`); `pickAutoFocus()` runs on load, desk purchase, `writeTitle` and once a second in `tick`.
- Keepers are free; `keeper.owned` kept as a field (true for every owned desk; old saves migrated, per-desk `keeper.focus` folded into `S.focus`). Players who already paid are not refunded.
- Keepers tab and `renderSecurity` removed; keeper strip + collapsed "Advanced stock targets" now live on Words. Pause toggle is on each desk card (`data-act="ktoggle"`, a span so it does not select the desk), Training and Words.
- Award `keep` is now "Auto Clerk" (25 words banked). `BALANCE.md` not updated (task 08). `tools/bot.js` no longer buys keepers or sets per-desk focus.
- Verified: new game banks words with no purchase; old save with per-desk focus migrates (focus kept, auto off) and welcome-back shows banked words; pause toggle; `balance.mjs 60 active` completes with no page errors; screenshots pixel/classic at 390x700 and 1280x800 for Floor/Words/Shop (spot-checked classic 390, pixel 1280). Not verified: multi-desk keeper pause with several desks, 360x560.
- Noticed, out of scope: at 390x700 classic the floor HUD (stats + Focus bar) overlays the typewriter canvas.

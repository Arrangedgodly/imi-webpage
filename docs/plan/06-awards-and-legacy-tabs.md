# 06: Awards page slimmed, Legacy gets its own tab

**Read `README.md` first.** Size: medium. Depends on **04** (reuse the `subTabs` helper and `ui.sub`).

## Why (owner's words, condensed)

- The Awards page (department `records`, "Hall of Records", `renderRecords()` in `ops.js`) now contains the awards grid, three stat cards, the Field log (added in the last pass) **and** the whole Second Printing/Legacy prestige UI (`printHTML()`: go-to-press, Oulipo challenges, Legacy upgrades). It is far too long, and nobody would look for prestige under "Awards". In an app game, prestige lives in its own menu.
- The owner likes the field log but it adds scrolling. **The Awards page should focus on awards.**

## What to build

1. **Awards department** = sub-tabs **Awards | Stats | Log** (use `subTabs('records', ...)` from 04):
   - **Awards** (default): a one-line summary ("12/65 awards, +12% income") and the awards grid (`.o-awards`, sorted unlocked-first as today). Optionally a small row of the latest 3 unlocked.
   - **Stats**: the three stat cards (Typing / Publishing / Luck & time) exactly as they are now, minus the prestige-only rows that move to Legacy (keep "Printings completed"/"Legacy stars" in Publishing too; they are cheap).
   - **Log**: the field log (`S.log`, the `<ol class="o-log">`; max 40 entries, newest first). Empty state kept.
   - `ui.unseen` (count of new awards) stays as the badge on the Awards department tab and on the **Awards** sub-tab; clear it when the Awards sub-tab is shown (today it clears in `setTab('records')`).
2. **New department tab "Legacy"** (tab id `legacy`; label "Legacy", sub "Second printing"; icon: reuse an existing key from `ICO_PX`/`ICO_CL`, e.g. `trophy1` or `leaf`; add a new one only if cheap). Add to `TABS` (tucked behind **More** on phones), `RENDER`, `badgeFor` (a "!" when `starsNow() >= 1` or Legacy stars are unspent and affordable). Its pane is `renderLegacy()` = the current `printHTML()` content, rearranged into sub-tabs **Press | Challenges | Upgrades**:
   - **Press**: explain in 3 short lines what a Second Printing does (keep your shelf as earlier editions, +35% sale price per printing, +2% income per Legacy star, you restart machines/typists/bananas), the stars you would earn now (`starsNow()`) and the next star threshold (`nextStarAt()`), and the **Go to press** button (`ACTIONS.printask` → modal `askPrint()`; modal copy unchanged).
   - **Challenges**: the optional Oulipo constraint chips for the next printing, the active challenge card with its progress and the Abandon button, and the list of completed perks.
   - **Upgrades**: the five `LEG` upgrade cards (`ACTIONS.legbuy`) with the unspent star count.
   - Keep every existing action name (`printask`, `chpick`, `chabandon`, `legbuy`) so `doPrint`, the harness and saves keep working.
3. **Visibility (progressive reveal).** Hide the Legacy tab until it makes sense: show it when `S.printing > 0 || S.legacy.total > 0 || (S.run.earned || 0) >= 100000` (about 20% of the way to the first star). The tab bar is currently static markup built once at startup (`root.innerHTML` in the wiring section, filtered by `TABS` flags); make visibility dynamic: add `tabVisible(id)` and set `hidden` on the tab button in `renderChrome()`. Also use this mechanism for nothing else yet; task 09 will reuse it for the tutorial's progressive reveal, so write it generically (`const TAB_GATES = { legacy: () => ... }`, default visible).
4. **Phone tab bar:** with Keepers removed (03) and Legacy added the "More" sheet should hold: Media, Muses, Awards, Legacy (4 tiles, matches the existing 4-column grid). Verify the `More` button badge logic in `renderChrome()` (`TABS.filter(t => t[5] ...)`) still works with hidden tabs (a hidden tab must not contribute a badge).
5. Copy: rename the department's long name "Hall of Records" only if you want; keep the short label "Awards". Update `IMI.banner`/`achieve()` click handler (`setTab('records')`) so clicking an award toast opens Awards > Awards.

## Acceptance checklist

- Awards page shows only the awards and a summary; Stats and Log are one tap away; nothing scrolls the page.
- Fresh game: no Legacy tab. Plant `S.run.earned = 150000`: tab appears (and More badge/sheet updates on phones). Plant a state with 5e5 earned: Press sub-tab shows 1 star and the Go to press button works end to end (confirm modal, celebration, new printing, challenge applied).
- Buy a Legacy upgrade, abandon a challenge: still works.
- Old saves with `S.challenge`, `S.chDone`, `S.legacy` load unchanged.
- Screenshots (both editions, 390x700 and 1280x800): Awards, Stats, Log, Legacy>Press, Legacy>Upgrades, phone More sheet with Legacy.

## Status

Not started.

## Handoff notes

(none yet)

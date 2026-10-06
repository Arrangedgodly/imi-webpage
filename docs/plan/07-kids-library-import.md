# 07: Import the 300 kids' books as early titles

**Read `README.md` first.** Size: large (data pipeline + gating + performance). Depends on **03** (global focus / auto focus) and **04** (paginated Titles list). Balance numbers are finalised in **08**; here you only wire the content and add the knobs.

## Why

The owner expanded the `monkey-library` GitHub repo (the content source this site syncs from) with **300 dedicated kids' books written only with words of three letters or fewer**. They fit the first typewriter (Bamboo Classic types 2-3 letter words, desk/band 0). Today the first desk has only **6 authored titles** (the first six entries of `readers.js`), so the opening game runs out of things to sell. With free auto keepers (03) the player needs a long, gentle ladder of early titles. These 300 books become that ladder.

## Current state you must know

- `readers.js` defines `window.READERS` = 16 authored short readers `{ id, title, pay, text }`. `ops.js` turns each into a recipe with `buildRecipe(r)` (~line 111): `tokens(text)` lowercases, strips apostrophes, **drops 1-letter words**, counts each word into `need{WORD: count}`, `total` = number of counted words, `band` = band of the longest word (`bandOf`). A title is writable when every `need` word is in the shared bank (`canWrite`).
- All recipe words are added to the vocabulary at load (`RECIPES.forEach(...VOCAB.add...)`), and `BAND_WORDS[band]` (sorted lists, ~line 120) is what keepers and typists scan, so **adding ~300 books enlarges `BAND_WORDS[0]`**. Loops over `BAND_WORDS[i]` run in `keeperStep` (every 0.4s per desk), `roll`/`completers`, `keeperBulk` (offline). Check they stay cheap (a few hundred words is fine; profile once).
- `BOOKS = RECIPES.length` is computed **right after** loading the authored readers (~line 118) and is used for: the shelf ghost slots, the "Complete Works" celebration (`authoredSold() === BOOKS`), award `s16`, the Titles lede, `R.stats`. `authoredSold()` counts any sold recipe that is not `gen` (pitched). `soldCount()` counts every sold recipe and **gates progression**: Muse slots (3/8/13 sold), publishing deals (`need`), media divisions (`need`), literary agent/analyst, awards `s4/s8/s12`, `dealMult`'s `clubs`. These must **not** be satisfied by 300 trivial kids' books.
- `library/` is synced by `node sync-library.mjs` (shallow-clones `https://github.com/Arrangedgodly/monkey-library`, copies `books.json`, `archives.json`, and the `stories/ songs/ tv-shows/ radio-plays/ sketches/ films/` folders). The local `library/` currently has 573 stories (phases R1-R4) and **does not yet contain the kids' books**.

## Steps

1. **Sync and inspect.** Run `node sync-library.mjs`. Look at what changed in `library/books.json` (new `phase` code? new folder?) and `library/` (git diff/untracked). If the kids' books live in a new folder, extend `SHELVES` in `sync-library.mjs`; if they are new rows in `books.json` with a new `phase`, note the phase code. Identify them reliably (phase or folder, not by guessing). Write what you found in Handoff notes. Also check the Library page (`library.js`: `SHELVES` list, `LABEL`) still works and, optionally, add a "Kids" shelf filter.
2. **Generate recipes.** Write `tools/build-kids-readers.mjs` (plain Node, no deps) that reads the kids' markdown from `library/`, strips markdown (headings, emphasis, tables), extracts the story text, and emits **`readers-kids.js`** (committed; the site has no build step): `window.READERS.push(...)` of entries `{ id: 'k-<slug>', title, pay, text, kid: true }`. Validate each: tokenise exactly like `tokens()` in `ops.js`; **reject/report any book containing a word longer than 3 letters** (it would need Hibiscus, not Bamboo); report word counts (min/median/max). Sort/emit in a stable difficulty order (shortest and most repetitive vocabulary first: e.g. by total words then distinct words). `pay` comes from a formula with a named constant, initially `pay = Math.round(total * 24)` (task 08 retunes it). Load `readers-kids.js` after `readers.js` in `index.html`, `classic.html` and `tools/balance.html`.
3. **Fix the count-based gates.** In `ops.js`:
   - Keep `BOOKS` meaning "authored non-kid readers" (compute it before kids are counted, or `RECIPES.filter(r => !r.kid).length`).
   - `authoredSold()` must ignore kids (`!r.gen && !r.kid`); add `kidsSold()`.
   - `soldCount()` (the **progression gate**) must not count kids. Keep it as authored + pitched sold. (Everything that reads `soldCount()` stays as is.)
   - Add awards for kids' titles (copy the `AW(...)` pattern near line 871): e.g. sell 10 / 50 / 150 / 300 kids' books, bronze/silver/gold, and make sure the existing `'s16'` "Complete Works" still means the 16 authored titles. New awards add +1% income each (existing rule), so keep the total small: **3** new awards.
4. **Reading list, not a wall.** Do not show all 300 at once. Define `kidsListed()` = the next `KID_LIST = 8` **unsold** kids' titles in difficulty order (a `TUNE`-overridable constant). The Titles list (04), auto focus (03), the harness, and `badgeFor('press')` consider only authored titles, pitched titles and **listed** kids' titles; sold kids' titles still appear on the shelf and under the Written filter. Selling one reveals the next. A line under the list: "Kids' reading list: 23 of 300 written".
5. **Performance for 300+ recipes.** Cache what is called every render/second: `RECIPES.filter(canWrite)` runs in `render()` and `badgeFor`; compute `readyIds()` once per render (or memoise keyed on a bank-version counter incremented in `bankWord`/`writeTitle`/`keeperBulk`/`museGift`). Shelf ghost slots capped (04). Sold kids' titles should not each cost a big royalty loop: `royBase()` iterates `S.written` every tick-second; 300 iterations is fine, but verify with the soak below.
6. **Royalties.** Kids' titles pay royalties like others today (`bookRoy` uses `r.pay`). Add `KID_ROY` (TUNE-overridable, default `0.5`) multiplying kids' royalties so a full shelf cannot dominate; task 08 tunes it.
7. **Persistence.** `S.written` keys for kids are `k-...` ids; nothing else to store. Old saves unaffected. `doPrint()` (prestige) keeps `editions` for all written ids: confirm the shelf with 300 old editions stays fast (cap rendered spines to ~120 with a "+N more" chip if needed).

## Acceptance checklist

- `node tools/build-kids-readers.mjs` runs, prints counts and any rejected books; `readers-kids.js` exists; the site loads with it in both editions; `window.READERS.length` is 16 + (kids count).
- Fresh game: first desk shows authored titles plus the first 8 kids' titles; selling a kid title unlocks the next; `soldCount()` and every gate (Muse slot 1 at 3 sold, deals, divisions, awards s4) still need the authored/pitched count, **not** kids.
- Plant a state with all 300 kids' titles sold: page responsive, Titles/shelf DOM small (check `document.querySelectorAll('#o-press *').length`), 4-minute soak (see below) shows stable heap/node counts.
- Balance harness runs without exceptions (numbers retuned in 08).
- Soak recipe: seed a mid-game state through `IMI.ops.dev.S()`, tap/tab-cycle for 4 minutes with `page.evaluate` timers, sample `document.getElementsByTagName('*').length` and `performance.memory.usedJSHeapSize` every 15s (launch Chrome with `--enable-precise-memory-info`). Nodes plateau, heap does not trend up.

## Status

Done (soak result below). Task 04 was not done yet, so the Titles list is still the old single list; kids are filtered via `inPlay()` there.

## Handoff notes

- Kids' books live in the library repo folder `kid-stories/` (300 files `kid-NNN-slug.md`, story text after `## Story`) plus `kids.json` (catalog). Not in `books.json`. `sync-library.mjs` now also copies `kid-stories/` and `kids.json`. Library page (`library.js`) is unchanged and does not list them (no "Kids" shelf added).
- `node tools/build-kids-readers.mjs` regenerates `readers-kids.js`: 300 books, 0 rejected, 39/56/71 words (min/median/max). `PAY_PER_WORD = 24` constant is in that script (task 08). Ids `k-NNN-slug`; sorted by total words then distinct words. Re-run after every sync.
- ops.js: `KIDS`, `BOOKS` (authored only), `KID_LIST` (8), `KID_ROY` (0.5), both TUNE-overridable. `kidsListed()`, `inPlay(r)` (non-kid or listed), `kidsSold()`, `readyList()` (250ms cache, also dropped by `mark()`/`writeTitle`). `canWrite` includes `inPlay`, so auto focus, muse gifts, badge, harness and the ready list only see listed kids. `soldCount()` excludes kids. Awards k10/k50/k300 added. Shelf caps at 120 spines (authored first) with a "+N more" chip.
- Dev handle exports `kidsSold, kidsListed, KIDS`. Bot (`tools/bot.js`) ignores unlisted kids.
- To run puppeteer scripts, install puppeteer-core in a temp dir (not in repo) and copy tools/*.mjs there.

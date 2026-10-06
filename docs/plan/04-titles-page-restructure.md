# 04: Titles page: sub-tabs, shelf first, market last

**Read `README.md` first.** Size: large (one big panel rewritten, plus a reusable sub-tab component). Depends on **03** (global focus). Task 05 and 06 reuse the sub-tab helper you build here.

## Why (owner's words, condensed)

The Titles page (department `press`, "Vine Infrastructure", `renderPress()` in `ops.js`) is one very long scroll: lede, rights market chart, pitch desk, bookshelf, trophy shelf, search, a long grid of title cards, then the Archive. The most important thing (the bookshelf of titles you are writing and selling) is in the middle. A new player sees a rights-market chart that means nothing to them. The owner loves the interactive bookshelf (spines you can pull out and read) and wants:
- the **bookshelf and the titles you are working on moved to the top**,
- the **rights market moved to the bottom / out of the way**,
- the page **broken into sub-tabs** so it needs far less scrolling, keeping the Archive,
- changing the goal to be obvious **without switching typewriters** (03 made the goal global; this page must show and change it).

## Build a reusable sub-tab component first

Add to `ops.js` (near the `pips`/`stat` helpers above `renderTraining`) a helper:

```js
// ui.sub = { press: 'titles', records: 'awards', ... } remembers the chosen sub-tab per department
const subTabs = (dept, items) => `<div class="o-subtabs" role="tablist">${items.map(([id, label, badge]) => `<button type="button" role="tab" data-act="sub" data-dept="${dept}" data-sub="${id}" aria-selected="${(ui.sub[dept] || items[0][0]) === id}">${label}${badge ? `<i class="o-subbadge">${badge}</i>` : ''}</button>`).join('')}</div>`;
```

plus `ACTIONS.sub` (sets `ui.sub[dept]`, `IMI.sfx.tick()`, `mark()`, scrolls the pane to top: `$('#o-' + dept).scrollTop = 0`). Add `sub: {}` to the `ui` object. CSS in `ops.css` (a new small block, both editions): a horizontally scrollable pill row, **sticky** at the top of the pane (`position: sticky; top: 0; z-index: 3`, with the panel background behind it so content does not show through), 44px tall touch targets, selected pill uses the same yellow/leaf look as `.o-seg button[aria-pressed="true"]`, optional small count badge (`.o-subbadge`). Because panes are patched by `morph()` and the sub-tab row is inside the pane, selection changes are just a re-render.

## New layout of the Titles department

Sub-tabs, in this order: **Titles | Pitches | Market | Archive**.

- **Titles** (default):
  1. **Goal bar** (compact card): "Now writing: *Title* · progress bar · N/M words" with buttons **Change** (jumps the page to the list below, scroll to `#oTitleList`) and an **Auto** switch (`S.autoFocus`). If nothing is focusable: "Pick a title below".
  2. **Bookshelf card** (existing `shelfHTML()` + the `.o-plate` reader that opens when a spine is pulled; behaviour unchanged). If no titles sold yet, replace the empty case with a friendly empty shelf and one line: "Sell a title to put it here." Show the royalty line as today. **Cap the ghost slots**: `shelfHTML()` renders `BOOKS - sold` empty `<i class="o-slot">`; task 07 will add hundreds of titles, so render at most 24 ghosts.
  3. **Title list**: search box, filter chips (`To write` default, `Ready`, `Pitched`, `Written`, `All`; `ui.libf` today has all/open/ready/written, add `pitched`), then the cards. **Sort**: Ready first, then the focused one, then by fewest missing words. **Paginate**: render the first 24 matches and a "Show more (N)" button (`ui.libLimit`, reset when filter/search changes). Each card keeps `Read`, `Focus`, `Write & sell`; `Focus` now sets the global goal (03) and the focused card shows a "NOW WRITING" tag. Add a one-line **"Needs"** row showing which typewriters supply its words (`bandOf(len)` for each word group → desk colour chips like `Bamboo` `Hibiscus`), and if a needed desk is not owned yet, show "Needs Lagoon Sprint" and disable `Focus`.
  4. Remove the **trophy shelf card** from this page (awards live on the Awards page; task 06).
- **Pitches**: move `pitchHTML()` here unchanged for now (task 05 redesigns it). Tab hidden until `soldCount() >= 1`.
- **Market**: move `marketHTML()` here. Add a two-sentence plain-language intro at the top ("Publishers pay more or less depending on demand. Sell when your title's band is HOT. Weather and night change demand."). Tab hidden until `soldCount() >= 1`.
- **Archive**: the existing archive search card (`#oArchNote`, `#oArchQ`, `#oArchF`, `#oArchRes` with `data-own` boxes filled by `renderArchive()`). Tab hidden until `soldCount() >= 3`. Archive fetching must still only happen when this sub-tab is visible (`loadArchive()` is called from `renderStudios` and `renderArchive`; keep that, and guard the 4x/s retry on failure: `archiveLoading` is reset in the `.catch`, which causes a refetch every render if the fetch fails; add a `ui.archFailed` flag so it retries at most every 30s).
- The lede paragraph at the top of the department shrinks to one sentence under the sub-tabs or disappears; do not keep the long explanation.

`badgeFor('press')` (the "!" with a count of ready titles) stays on the department tab; give the **Titles** sub-tab the same ready count as `.o-subbadge`, and put a "!" on Pitches when there is a free pitch slot and the player has never commissioned (task 05 refines this).

## Implementation notes

- `renderPress(force)` currently bails out while an `input` inside the pane is focused (so typing in the search box is not interrupted) and re-wires the search inputs after every `morph` (`inp._wired`). Keep that pattern for the search boxes that remain.
- Only render what the active sub-tab needs (do not build all four every 250ms).
- Preserve `ui.pulled` (the pulled-out spine) and the `ACTIONS.pull` behaviour that switches to the press tab; pulling a book while on another sub-tab should switch to Titles.
- `ui.fresh` / `.o-spine.drop` animation (a freshly sold book drops onto the shelf) must still play: after `writeTitle()` the player is usually looking at the Titles sub-tab; make sure `shelfHTML()` is rendered there.
- The desk bar (`.o-desks`) is hidden on the press tab by `.o-wrap[data-tab="press"]` in `ops.css`; keep it hidden (the goal is global now).
- Mobile: sub-tab row scrolls horizontally; shelf row wraps; cards single column.

## Acceptance checklist

- Fresh game (nothing sold): Titles page shows the goal bar, an empty-shelf hint and a short list; no Market/Pitches/Archive sub-tabs yet (or they are visibly hidden).
- After selling the first title (use `IMI.ops.dev.writeTitle(id)` after granting words, or a bot run): shelf shows the book (drop animation), Pitches and Market sub-tabs appear.
- With 40 sold pitched titles planted in `S.pitches`/`S.written`: Titles list stays fast (inspect `document.querySelectorAll('#o-press *').length` stays under ~1500) and "Show more" works.
- Clicking `Focus` on a card changes the goal bar and the floor HUD; no desk switching needed.
- Pull a spine: the reader plate opens; pulling a second closes the first.
- Screenshots (pixel + classic; 390x700 and 1280x800): each sub-tab, top of page. Page never scrolls; the pane scrolls internally and the sub-tab row stays visible.

## Status

Not started.

## Handoff notes

(none yet)

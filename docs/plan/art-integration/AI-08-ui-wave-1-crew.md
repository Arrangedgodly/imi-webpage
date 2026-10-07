# AI-08: UI wave 1: Train page and crew cards

**Read `README.md`, `coverage.md` (AI-00) and AI-07 handoff notes first.** Size: M. Needs vision: yes. Depends on: AI-00, AI-07. Touches `ops.js`: **yes (fourth in order).**

## Goal

Introduce the shared **animated-icon helper** and use it on the Train page, where the new monkeys are most visible after the Floor.

## Part A: the helper (reused by AI-09 and AI-10)

- `ico(name, size)` currently hydrates static sprites (`ops.js` `hydrate`, `ICO_PX` -> `PXA.spr`). Add `Atlas` support: `art/ui/<group>.png` + `.json` (cells with `frames`, `fps`, `size`, `staticFrame`) and an `<i class="o-ico art" data-art="group/id">` hydrated to a CSS sprite-sheet using `steps()` (no JS timer per icon). Fall back to the existing sprite when an art id is missing, and to the emoji in classic as today.
- Honour reduced motion (`staticFrame`) and Low (static).
- `tools/bake-art.mjs ui <group>` bakes any `gemini-art/art-v2/assets/<category>` set to `art/ui/<group>.png/.json` (reuses the lab's `resolve.js` and `png.js`).

## Part B: Train page

- Crew card (`renderTraining`, `ops.js` ~1975-2030): add the monkey's **portrait** (head crop from its `look` strip, `idle` first frame, with the worn hat overlaid), replacing any emoji.
- **Hat button and picker** (`data-act="hat"`): show the 7 `HATS` as art icons, locked ones greyed, using the best matching assets from the coverage matrix.
- **Trait chip** icons for the 7 `TRAITS`; **level rank** badge for levels 1-10 (`LVL_XP`); talent/coach/reroll/undo icons. Where the coverage matrix says `missing`, keep the current text chip and note the gap; do not improvise art.
- The crew list header can show the **role** of each member ("Key Stomper", "Carriage Slammer", ...) from `roleOf(p)`, as text only (this teaches the player the new layout).

## Acceptance

- Flag off or atlas missing: Train page identical to baseline.
- Flag on: portraits match the Floor sprites; hat picker previews the hat on the portrait; works at 390x700 with touch targets >= 40 px; no layout shift when icons load.
- Counts of animated `<i>` icons on a page stay bounded (< 60) and use no JS timers.
- `morph()`/`patchEl` keep hydrated icons (the existing `data-icoDone` guard) and do not re-create them every render.

## Do not

Change the cost, effect or text of coach/reroll/hat logic; add new traits or hats; edit `art-v2/assets` (gaps go to the Gemini backlog).

## Status

Not started.

## Handoff notes

(fill in: helper API, bake command, which slots remain text-only)

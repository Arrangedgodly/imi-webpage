# 02: Typewriter stage: stop clipping the machine and the streak counter

**Read `README.md` first.** Size: small. No dependencies.

## Why

The owner loves the tap-streak popup (the big `x90` number with a draining bar) but it is cut off: the stage (`.o-stage`) has `overflow: hidden`, and the combo counter sits at the top-right corner, so half the number and the bar get clipped when it appears. The typewriter itself can also get cut off at the left/right edges of the stage (the ribbon spools at `left/right: -50px` and the carriage end caps extend past the body). The owner offered two fixes: widen the viewing window, or let the effect render on top of the window so it can overflow. **Do both.**

## Where things are

- Stage markup is built by `buildStage()` in `ops.js` (search `class="o-stage"`): `.o-stage` > `.o-scene` (background art, absolute), `.o-combo#oCombo` (`#oComboN` number + `.o-meter > #oMeter`), `.o-hud` (stats/focus pills), `.o-dangle` (hanging typists), `.o-tw#oTw` (the typewriter: `.o-sheetwrap`, `.o-carriage`, `.o-bars`, `.o-body` with `.o-kbd`).
- `comboHit()` (ops.js, search `function comboHit`) toggles `#oCombo` classes and restarts its CSS animations. `ember()` appends `.o-ember` into `#oEmbers`.
- CSS in `ops.css`: layout block near the top (`.o-stage`, `.o-tw`, `.o-combo`, `.o-hud`; the stage uses `container-type: size` and the machine sizes itself with `cqh`/`cqw` units in `.o-tw`), the "combo heat" block (`.o-combo`, `.o-meter`, `.o-embers`), and the skin blocks. The pixel/classic stage frame comes from the shared `.o-card, .o-desk, .o-tab, .o-stage` rule (a 12px `border-image`; overflow hidden is needed to clip the room art, not the effects).
- Important: `container-type: size` also applies layout containment, so a child cannot paint outside the stage no matter what; the combo must move **out** of the stage's clipping context.

## What to do

1. **Give the stage an unclipped overlay layer.** Wrap it: `.o-stagewrap { position: relative; flex: 1 1 0; min-height: 0; width: 100%; max-width: ...; margin: 0 auto }` containing the existing `.o-stage` (clips the room) and a sibling `.o-fx` overlay (`position: absolute; inset: 0; pointer-events: none; overflow: visible; z-index: 6`). Move `#oCombo` (and its meter) into `.o-fx`. The wrapper, not the stage, is what `buildStage`/CSS treat as the flex child (the stage keeps its `container-type` and fills the wrapper). `#oStage` is looked up by id in many places (`$('#oStage')` in `comboHit`, `handsNag`, `ember`, `royCoins`, `renderBuffs`, pointer handler `root.addEventListener('pointerdown', ... closest('#oStage'))`): keep the `id` on `.o-stage` and make sure taps on the overlay still count (the overlay is `pointer-events: none`, so they fall through to the stage).
2. **Position the combo so it can never be clipped**: anchor it inside `.o-fx` at the top-right *inside* the wrapper with at least 12px margin, and let big streaks (`warm`/`hot` classes, which grow the font to 42/52px and add a jitter) scale from the right edge (`transform-origin: top right`) so they grow inward. Keep the stroke/shadow look. The streak bar (`.o-meter`) must always be fully visible.
3. **Widen the room and stop clipping the machine**: raise the stage `max-width` from 760px to about 880px on wide screens, and make `.o-tw` leave at least ~64px of room each side (spools sit 50px outside the body; carriage caps 16px). Adjust `--kw`/width math in `.o-tw` (`min(calc(100% - 24px), 600px)` and the `(100cqw - 64px) / 10.8` key-width formula) so the whole machine including spools fits at 360px wide. If it cannot fit with spools at tiny widths, hide spools below ~420px rather than clip them.
4. The combo milestone text (`award()` floaters), `.o-float`, `.o-shock` are already `position: fixed` on `body` and are fine.

## Acceptance checklist

- Script: tap the stage 100+ times quickly (`page.mouse.click` in a loop with ~30ms sleeps) and screenshot at x10, x20, x50, x100 streaks: the number and the full draining bar are visible, at 360x560, 390x700 and 1280x800, in **both** editions.
- With Quick Fingers, Fresh Ink (spools) and Rapid touch (bell) upgrades granted via `IMI.ops.dev.S().desks[0].up = {...}`, no part of the machine is cut at 360px width.
- Typists dangling from ropes and the `.o-hud` pills still render and nothing overlaps the combo badly.
- Reduced motion: no new animation added without a `prefers-reduced-motion` guard.

## Status

Not started.

## Handoff notes

(none yet)

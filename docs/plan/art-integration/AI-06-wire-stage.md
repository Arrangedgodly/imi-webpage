# AI-06: Wire `StageArt` into `ops.js` behind the flag

**Read `README.md`, AI-04 and AI-05 handoff notes first.** Size: M. Needs vision: yes. Depends on: AI-04, AI-05. Touches `ops.js`: **yes (second in order).** Also `index.html`, `sw.js`, `ops.css` (small).

## Goal

With the flag on, the Floor shows the new machine and crew; with it off, nothing changes. All game behaviour is identical in both states.

## Flag

`const ART2 = PX && (new URLSearchParams(location.search).get('art') === '2' || localStorage.getItem('imi-art2') === '1')`. If `StageArt.mount` fails or its atlas cannot load, log once and use the old path. A Settings row can come in AI-12.

## Changes in `ops.js` (each one a small, reviewable hunk)

| Existing code | Change when `ART2` |
| --- | --- |
| `buildStage()` builds `.o-tw`, `.o-dangle`, `.o-kbd` | Build `.o-stage` with the existing `.o-scene` (unchanged), then `StageArt.mount` into a host; keep `.o-focus`, `.o-fx`, `.o-combo`, `.o-info` markup exactly. `fx` gets `keys` from StageArt's hit elements; `fx.tw`, `fx.car`, `fx.sheet`, `fx.bars` become thin adapters or are skipped. |
| `syncTypists()`, `typists[]` | `StageArt.setCrew(views)` with `{ci, role, slot, look, hat, shiny, name}`; keep a `typists`-shaped array of `{ci, rect()}` only where other code reads `typists` (`say`, `kick`, `cheer`, `spawnGold`, golden-banana burst at line ~273 and ~1507). Remove the `Math.min(paws, 8)` cap on this path. |
| `animatePress(ch, auto, n, p)` | Same early-outs and rate limits; replace key/bar/carriage/sheet/fleck DOM work with `stage.press({ch, auto, p, col: r.col, ding})`. Keep: `IMI.sfx.key`, the `r.col`/`r.page` bookkeeping, `tearPage` call, `.o-pop` letter pops, `IMI.fall` leaf drops (anchor via `stage.rectOf`). |
| `kick(strong, ci)` | Calls `stage.reaction(ci, strong)` instead of the rope physics; the speech bubble `say` anchors to `stage.rectOf({crew: ci})`. |
| `cheer(ms, text)` / `cheerStep` | `stage.cheer(ms, text)`; the banana/spark `IMI.burst` throw stays, anchored through `rectOf`. |
| `stepTypists` loop | Skipped on this path; `loop()` still runs `countStep`. |
| `renderFloorInfo` `.want` toggling | Unchanged (works on the hit elements); also call `stage.setWanted(want)` so the canvas glow matches. |
| `tearPage(r)` | Use `stage.rectOf('sheet')` for the flying page; call `stage.tear()`. |
| `swapStage(dir)` | Keep the slide-out/in on the host element; `StageArt` re-mounts for the new desk. |
| `partsOf(d)` | Export; pass the result to `setMachine`. |

`index.html`: add `<script src="stage-art.js"></script>` after `pixel.js` (pixel edition only; **not** `classic.html`). `sw.js`: add `stage-art.js` to `SHELL`, bump `VERSION`, and let `art/**` be cached at runtime (do not precache the whole atlas). `tools/balance.html` must keep working without `StageArt` (guard `typeof StageArt`).

## Acceptance

- Flag off: screenshots and the balance harness output are **identical** to AI-00's baseline.
- Flag on, crew counts 0, 1, 3, 5, 8, 12 on desks 0, 2, 5: the role table in the README holds (screenshot per count, hoppers appear at 6-12, assistants at 2-5); hiring a typist drops it into its slot with the existing `drop` feel.
- Tapping, holding, Space/Enter, the key guide, `.want` hints, tour spotlights on `#oStage`, tab switching away and back, machine swapping, restoring a machine (mk change), buying keeper/spool/bell upgrades (parts appear), tearing a page: all work.
- No console errors; no new global listeners left after leaving the Floor tab; `touch-action` and the single-tap-one-letter behaviour unchanged.

## Do not

Change gameplay constants, remove the old stage, add a Settings control (AI-12), or touch moods/hats/buff visuals (AI-07).

## Status

Not started.

## Handoff notes

(fill in: hunks changed, adapters kept for compatibility)

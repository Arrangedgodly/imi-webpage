# AI-11: QA, performance, accessibility, old saves, harness proof

**Read `README.md` first.** Size: M. Needs vision: yes. Depends on: AI-07 and whichever of AI-08 to AI-10 are shipped. Touches `ops.js`: no (report bugs to the owning task; fix only trivial one-liners and say so).

**Use a different model from the implementers.** Independence is the point of this task.

## Checks

1. **Mechanics unchanged.** Re-run the balance harness with the same seeds as `evidence/AI-00/balance-before.txt`; output must be byte-identical with the flag on and off. Run the bot scenario from `BALANCE.md` once more. Any difference is a blocker.
2. **Old saves.** Load at least: an empty save, a mid-game save (several desks, mixed crew sizes), a save from before `look` existed, a Second Printing save with Legacy crew. No console errors; all typists get a stable `look`; reload twice and confirm `look` does not change.
3. **The role table.** On desks 0, 2, 5 with crew 1..12, confirm roles and slots (README table): one stomper first, four assistants next, hoppers after. Hire, then reload: same arrangement.
4. **Interaction parity (flag on vs off):** tap, hold, Space/Enter, key guide, `.want` hints, golden/rotten bananas, combo milestones, tab switching, desk switching and swap animation, restoring Mk II/III, buying each part upgrade, tear page, offline return report, settings toggles, tour steps targeting `#oStage`.
5. **Performance.** Chrome profile at 4x CPU throttle and a mid mobile profile: frame budget (30 fps normal, 15 fps Low), memory over 10 minutes with 12 crew (no growth), no long tasks > 50 ms during typing bursts, atlas bytes loaded for a worst-case save. Report numbers against the budgets in the README.
6. **Accessibility.** Reduced motion: static frames; Low: reduced decoration; keyboard-only play works; the stage keeps its `role="button"` label; no text only in canvas (names, speech and sheet text also exist in DOM or `aria-live` as today); contrast of overlays.
7. **Visual review.** Screenshots at 1280x800, 390x700, 360x560 across the matrix in the README; compare against `evidence/AI-00/baseline/`. List every visual defect (jaggies, clipped sprites, z-order errors, hoppers hiding keys, unreadable hats) with a screenshot and the task that owns it.
8. **Regression sweep:** classic edition, Library page, menu, settings, PWA offline load with the new `sw.js`.

## Deliverable

`docs/plan/art-integration/qa-report.md`: a pass/fail table per check, numbers, screenshot links, and an ordered defect list (blocker / major / minor) assigned to task owners. Final recommendation: ship, ship behind flag only, or hold.

## Do not

Rewrite the implementation, tune art, or weaken a budget to make a check pass.

## Status

Not started.

## Handoff notes

(fill in)

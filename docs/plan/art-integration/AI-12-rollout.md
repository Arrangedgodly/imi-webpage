# AI-12: Rollout, flag flip, cleanup, docs

**Read `README.md` and `qa-report.md` first.** Size: S. Needs vision: no. Depends on: AI-11 with no blockers, **and the owner's explicit sign-off.** Touches `ops.js`: yes (removal only).

## Steps

1. **Owner decision recorded here:** ship now, ship as an opt-in Settings toggle for a while, or hold.
2. Add a Settings row (pixel edition) "Stage art: New / Classic pixel" backed by `imi-art2`, default per the decision. Keep `?art=2` / `?art=1` URL overrides for testing.
3. Flip the default only if the owner said so. Bump `sw.js` `VERSION`; confirm a returning player on the old service worker gets the new files and a clean cache.
4. **Cleanup after one release cycle with no blockers** (separate commit, owner asks): remove the old DOM stage path (`.o-tw`, `.o-dangle`, rope physics in `stepTypists`, `.o-typist` pixel CSS), unused `pixel.js` sprites that were replaced, and the `ART2` conditionals. Keep the classic path untouched.
5. Update `README.md` (credits, "art" folder description), `docs/plan/README.md` file map (`stage-art.js`, `art/`, `tools/bake-art.mjs`), `ROADMAP.md`, and the lab's `GAME_ART_UPGRADE_PLAN.md` pointer. Add a short "how to re-bake art" section to `docs/plan/art-integration/README.md`.

## Acceptance

Owner-approved default; no console errors on a fresh and an old save; docs match reality; the lab (`gemini-art/`) still runs standalone.

## Do not

Commit or release without being asked; delete anything in `gemini-art/`.

## Status

Not started.

## Handoff notes

(fill in)

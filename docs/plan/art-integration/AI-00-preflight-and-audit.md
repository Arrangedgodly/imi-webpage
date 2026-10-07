# AI-00: Preflight, baseline evidence, asset coverage audit

**Read `README.md` (this folder) first.** Size: S. Needs vision: yes. Depends on: nothing. Touches `ops.js`: no.

## Why

The working tree currently holds an uncommitted playtest batch (`docs/plan/14-playtest-roadmap.md`), and `gemini-art/art-v2/REPORT.md` claims more coverage than the game can use. Before any code, freeze a baseline and find out exactly which art fits which game slot.

## Steps

1. **Owner step (an agent must not do this):** commit or stash the playtest batch, then create branch `art-integration`. If the owner declines, stop and report; do not build on a dirty tree.
2. **Baseline screenshots** of the current pixel Floor stage with `tools/shot.mjs`: 1280x800, 390x700, 360x560; desks 0, 2, 5; crew counts 0, 1, 3, 5, 8, 12 (use `IMI.ops.dev` to set state); day and night; clear and storm. Save to `evidence/AI-00/baseline/`. These are the "before" for every later review.
3. **Baseline numbers:** run the balance harness for two seeds and save the full output to `evidence/AI-00/balance-before.txt` (AI-11 diffs against it).
4. **Coverage matrix** `docs/plan/art-integration/coverage.md`. One row per *game art slot*, columns: slot, where used in the game (file/function), size it is shown at, current source (pixel.js sprite / CSS / emoji), best matching asset in `gemini-art/art-v2/assets/**` (or `none`), fit (`ok` / `rename` / `resize` / `wrong subject` / `missing`), notes. Slots to cover, from the code:
   - Stage: 6 typewriters x 3 `mk` tiers; upgrade parts `p-brass, p-spools, p-ribbon2, p-bell, p-vowels, p-led, p-ledon`; keys; carriage; bars; sheet.
   - Crew: 7 hats (`HATS`), 7 traits (`TRAITS`), level ranks 1-10, talent, coach, reroll, undo.
   - Department tabs (`TABS`, `ops.js` line 28: `floor, training, lab` (Words), `press` (Titles), `shop, studios` (Media), `muses, records` (Awards), `legacy` = 9 tabs) plus the mobile "More". Keepers are not a tab; they live on the Words page and in the Shop.
   - Shop (`SHOP`, `UPS`), keepers x6 and their upgrade levels, Publisher's assistant x3, literary agent, market analyst, barometer x2, deals x5 (`DEALS`).
   - Muses x9, media divisions (`DIVS`), awards (trophy tiers 0-2), challenge badges (`CHALLENGES`), legacy upgrades (`LEG`), second-printing stamp.
   - Toys (`snack`, `coconut`, `weather`, `night` in `core.js`), buffs (`buffs`, `BUFF_INFO`), streak milestones (`MILES`).
   - Menu: logo, hero monkey, Play and Continue buttons, motes; sky bands, drifters, parallax layers (`pixel.js` `farTile/midTile/nearTile`), stars, fireflies, rain.
   - Chrome: 9-slice frames, plank and vine tiles, buttons, chips, particles (`IMI.burst/fall` kinds).
5. **Look at the art, don't trust the report.** Open `gemini-art/art-v2/index.html` (`node gemini-art/serve.js`, `http://localhost:8192/gemini-art/art-v2/index.html`). For each `ok` row, confirm it by eye at 1x and 3x on the game's real background colours. Downgrade anything that is not clean. List the ten best and ten worst for the owner.
6. **Gap list** `docs/plan/art-integration/gap-list.md`: everything `missing`/`wrong subject`, grouped by Gemini sub-agent, written in the same per-asset specificity as `gemini-art/GEMINI_DIRECTIVE.md` section 9 so it can be pasted into a new art pass. Include the monkey **idle loop**, expression set and `headgear: none` render need (see README, "Known gaps"), and the typewriter **layer split** needs for AI-03.
7. **Owner review checkpoint:** present the ten best, ten worst, the open questions Q1-Q5 and the gap list. Record answers in the README's table.

## Acceptance

- Branch exists, tree clean at start, evidence folders populated.
- `coverage.md` has every slot above, each with a verdict that was checked by viewing the image.
- `gap-list.md` is directly usable as a Gemini directive.
- Q1-Q5 answered or explicitly left on default.

## Do not

Edit any game file, any `gemini-art/` file, or generate new art in this task.

## Status

Not started.

## Handoff notes

(fill in)

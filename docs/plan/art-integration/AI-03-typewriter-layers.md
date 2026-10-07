# AI-03: Typewriter layers and upgrade-part overlays

**Read `README.md` and `AI-01-decision.md` first.** Size: L. Needs vision: yes. Depends on: AI-01. Touches `ops.js`: no. Runs in parallel with AI-02 and AI-04.

## Goal

`gemini-art/typewriter-styles.js` draws six models x three restoration tiers, but only as one procedural scene redrawn per frame. Split it into baked **layers** the runtime can move independently, and re-express the game's "training shows on the machine" upgrades as overlays. No game mechanics change; the game's `mk` (0, 1, 2) and desk ids (`mint, rose, blue, amber, orchid, moon`) map straight onto the existing models and tiers.

## Files owned

The typewriter half of `tools/bake-art.mjs`, `art/typewriters/**`, and `gemini-art/art-v2/kit/typewriter-layers.js` (a wrapper around `TypewriterStyles` and `ProtoEngine`; do not edit those files).

## Layers to produce (all at the logical resolution chosen in AI-01)

| Layer | Per | Notes |
| --- | --- | --- |
| `body` | desk x mk (18) | Chassis, medallion with the machine name, static keyboard deck with **no letters pressed**, paper bail, platen housing. |
| `keycaps` | desk x mk (18) | Letters A-Z + space drawn on keycaps using the machine's lettering colours (Q4: no digit keys). Up and down state for each key as sprite cells, so a press swaps cell, no redraw. |
| `carriage` | desk x mk | Carriage with end knobs; moves in X as a sprite. Includes the margin-bell post. |
| `sheet` | shared | Paper strip; text is drawn by the runtime from `r.sheet.slice(-48)` with the 4x5 pixel font, **not** baked. |
| `platen` | desk | Roller, 6+ rotation frames. |
| `spools` | desk x mk | Ribbon spools, 6 rotation frames each, brass at Mk II, jewelled at Mk III. |
| `typebars` | desk | 24 bars as a fan; frames: rest, lift, strike. The runtime strikes `bars[ch.charCodeAt(0) % bars.length]` exactly as `animatePress` does today. |
| `lever`, `bell`, `cog` | desk | Return lever (3 poses), bell (rest, ring 4 frames), escapement cog (6 frames) + dog. |

## Upgrade-part overlays (map the game's `partsOf(d)` classes)

| Game class | Meaning (from `ops.js` `partsOf`) | Overlay |
| --- | --- | --- |
| `p-brass` | `fing >= 3` | brass key bezels |
| `p-spools` | `ink >= 1` | visible ribbon spools |
| `p-ribbon2` | `ribbon >= 1` | second ribbon, two-tone |
| `p-bell` | `rapid >= 1` | carriage bell fitted |
| `p-vowels` | `vowel >= 1` | tinted vowel keycaps |
| `p-led` / `p-ledon` | keeper owned / working | keeper lamp, off / lit (2-frame glow) |

Each is a transparent overlay aligned to the body, so any combination composes without 2^6 sprite sets. The runtime picks overlays from the same `partsOf` computation (AI-06 exports it).

## Steps

1. Read `typewriter-styles.js` (`drawTypewriterChassis`, `drawTypewriterMedallion`, `drawTypewriterSpool`, `renderTypewriterStyled`) and `proto-engine.js` (`TypewriterPixelStage`) to see what is drawn together; write `typewriter-layers.js` that draws each layer **alone** onto a transparent canvas using the same palette functions (`getTypewriterPalette(model, mk)`).
2. Bake to `art/typewriters/<desk>-mk<n>.png` + `.json` (cell table: layer, frame, x, y, w, h, origin) and `art/typewriters/parts.png` + `.json` for the shared layers and overlays.
3. Provide a **compose test**: `art/typewriters/_compose.html` that assembles a full machine from layers (desk x mk x any overlay combo) and diffs it against the lab's one-piece render; they should match except for deliberate separation seams. Fix seams.
4. Medallion text uses the game's names (`Bamboo Classic`, ...), and `MK_NAMES` ('', 'Mk II', 'Mk III') matches the in-game label (`.o-body[data-name]`).
5. Contact sheets for all 18 machines at 1x and 3x on the game's day/night/plank backgrounds. Look at them.

## Acceptance

- 18 body+keycap sheets and `parts` baked, deterministic across two runs, each machine sheet <= 60 KB, parts <= 120 KB.
- Compose test matches the lab render within seams for every desk x mk and for at least these overlay combos: none, all, brass+vowels, spools+ribbon2+bell.
- Letter keys A-Z and space exist at known cell coordinates; the manifest lists each key's hit rectangle in logical coordinates (AI-05/06 use it to place the invisible `.o-key` elements).

## Do not

Edit `typewriter-styles.js` or `proto-engine.js`; change `mk` meaning; add new machines; bake sprites for monkeys (AI-02).

## Status

Not started.

## Handoff notes

(fill in: cell table format, key hit rectangles, overlay anchors)

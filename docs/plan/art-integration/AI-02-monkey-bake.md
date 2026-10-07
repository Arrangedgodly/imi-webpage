# AI-02: Monkey bake pipeline (strips, manifests, anchors, idle loops)

**Read `README.md` and `AI-01-decision.md` first.** Size: L. Needs vision: yes. Depends on: AI-01. Touches `ops.js`: no. Runs in parallel with AI-03 and AI-04.

## Goal

Turn the 30 procedural monkey variants into small, lazily loadable PNG strips plus JSON manifests that `StageArt` (AI-05) can play with `drawImage`.

## Files owned

`tools/bake-art.mjs` (monkey part; AI-03 adds the typewriter part to the same script in a separate function, coordinate by exporting two entry points), `art/monkeys/**`, and a **forked render entry** `gemini-art/art-v2/kit/monkey-render.js` if renderer changes are needed (do not edit `gemini-art/monkey-variants.js` itself; wrap or copy it).

## Steps

1. `tools/bake-art.mjs monkeys` launches headless Chrome with `puppeteer-core` (same as `tools/shot.mjs`), loads `gemini-art/monkey-variants.js` in a blank page, renders every variant x clip to canvas, and writes `art/monkeys/<slug>.png` (one horizontal strip, 64x64 frames, transparent) and `<slug>.json`.
2. **Clips per variant:** `idle` (new, 8 frames, loop: breath, blink, one tail or cloth flutter; see step 3), `stomp` (16), `slam` (18), `roll` (16), `tap` (escapement), `tug` (16), `victory` (16), plus an expression row for the head: `blink`, `screech`, `scared`. Use the generators' existing frame lists (`generateKeyStomp64`, `generateCarriageLever64`, `generateRollerAcrobat64`, `generateEscapementMechanic64`, `generateRibbonMischief64`, `generateVictoryDance64`) unchanged.
3. **Idle loop (new art, not in the prototype).** Build it with `renderCustomMonkey64(variant, 'idle', params)` using small `headY`, `squashY` and arm offsets so the silhouette changes by 1-2 px across 8 frames; verify with the lab lint (`gemini-art/art-v2/kit/lint.js`) that it loops and has motion. Each role also needs its own rest pose (stomper crouched at the keys, slammer at the lever, inspector on the roller, mechanic at the cog, mischief at the spool): add a `rest` per role as a single held frame if `idle` cannot be posed there.
4. **`headgear: none` variant (Q3).** Render each variant's head without its costume headgear (second strip `<slug>-bare.png`, or a head-only overlay strip) so a game hat can be drawn on top. If the renderer cannot omit headgear cleanly, record that as a blocker and do the smallest wrapper that paints over it; do not hand-edit pixels.
5. **Manifest per variant:** `{ size:[64,64], clips:{ name:{ row, frames, fps, loop, contact:<frame index where the action "lands">, hold:<last frame> } }, anchors:{ clip: [ {head:[x,y], handL:[x,y], handR:[x,y], feet:[x,y]} per frame ] }, palette:{ fur, accent } }`. Anchors are measured from the render calls (the generators know head and hand positions), not guessed from pixels.
6. Group by archetype in a top-level `art/monkeys/index.json` listing slugs, archetype, `look` ids, and byte sizes.
7. Quantise: run a lossless PNG optimisation that does not need a dependency (palette PNG via the lab's own `png.js` encoder). Enforce the **byte budget**: each variant strip <= 80 KB, `index.json` <= 4 KB.

## Acceptance

- `node tools/bake-art.mjs monkeys` is deterministic: running it twice produces identical bytes.
- 30 strips + manifests exist; a contact sheet `art/monkeys/_contact.png` (all variants, first frame of each clip) was **looked at** and spot-fixed.
- Every manifest validates (frame counts match strip width, `contact` indexes inside range, anchors present for every frame of `stomp`, `slam`, `roll`, `tap`, `tug`, `victory`, `idle`).
- `idle` loops seamlessly (wrap difference <= 1.5x median step) and is not static (> 1.5% changed pixels).
- Byte budget met; report the total.

## Do not

Edit `gemini-art/monkey-variants.js` or `proto-engine.js`; touch the game; change timing of existing action animations.

## Status

Not started.

## Handoff notes

(fill in: clip names, fps table, anchor format, bare-head approach, byte totals)

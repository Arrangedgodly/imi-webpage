# AI-01: Stage rendering spike and decisions (GATE)

**Read `README.md` (this folder) first.** Size: M. Needs vision: yes. Depends on: AI-00. Touches `ops.js`: no. **No later build task starts until this one records its decisions.**

## Why

The prototype stage (`gemini-art/proto-engine.js`) is a 384x240 canvas redrawn procedurally every frame and shown at integer scale 1-4x. The game's stage is a fluid `container-type: size` box sized by the viewport, with art currently at 3 CSS px per art pixel (`styles.css --s: 3px`). A 64x64 monkey on a 360 px wide phone is very different from the same sprite on a 1280 px desktop. Decide the geometry on evidence before anything is baked.

## Deliverable

A throwaway standalone page `gemini-art/art-v2/spike/index.html` (inside the lab, not the game) plus `docs/plan/art-integration/AI-01-decision.md`. The spike uses the **existing** generators directly (no bake yet) to draw: one desk, 5 stations, and 1, 5 and 12 monkeys, inside a CSS box that behaves like `.o-stage` (use the same `container-type: size`, `clamp()` sizing, and the pixel-edition 8 px border).

## Questions the decision record must answer with numbers

1. **Logical size.** Which logical width x height (candidates: 320x200, 384x240, 256x160) and **integer scale rule** (in device pixels) at 1280x800, 390x700, 360x560? What is the on-screen CSS size of a 64 px monkey in each, and is it readable? Record screenshots.
2. **Fill vs letterbox.** What fills the space around the canvas (CSS extension of wall and desk)? Must not look like a framed picture inside the stage.
3. **Phone layout.** Does the whole machine fit, or does the phone need a different crop (keyboard + hoppers only) or a smaller hopper count? Test Q2 explicitly: 7 extra hoppers in two depth rows at 360x560.
4. **Slot map.** A table of logical (x, y, z, scale) positions for the 5 stations and 8 keyboard slots, plus which keys each hopper's lane covers, and how a hop to a distant key crosses others.
5. **Performance.** Frame time and dropped frames for 12 animated monkeys, full-scene redraw each frame vs layered dirty redraw, at 4x CPU throttle in Chrome DevTools (via `puppeteer-core`). Pick the redraw strategy and the Low-mode frame rate.
6. **Hat anchor.** How a hat overlay is aligned to a baked monkey head frame by frame (is a per-frame head anchor in the manifest enough, or does the head wobble need per-frame offsets).
7. **DOM overlay mapping.** Confirm names, speech bubbles and `.o-key` hit elements can be positioned from logical coordinates with `calc()` or a single CSS scale variable, with no layout reads in the frame loop.
8. **Memory.** Decoded size of the atlases for a worst-case save (6 desks, 12 crew each) and the lazy-load policy that keeps it small.

## Acceptance

- `AI-01-decision.md` states the chosen logical size, scale rule, fill approach, phone layout, slot map, redraw strategy, FPS targets, and the hat-anchor method, each with the screenshot or measurement that justifies it.
- The owner approves Q2 (hopper cap or not) with the screenshot in front of them.
- The spike page is left in `gemini-art/art-v2/spike/` as reference.

## Do not

Edit the game, edit existing lab files, or start baking.

## Status

Not started.

## Handoff notes

(fill in)

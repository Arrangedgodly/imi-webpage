# AI-05: `StageArt` runtime renderer

**Read `README.md`, `AI-01-decision.md`, and the handoff notes of AI-02 and AI-03 first.** Size: L. Needs vision: yes. Depends on: AI-01, 02, 03. Touches `ops.js`: no (AI-06 wires it).

## Goal

A self-contained `stage-art.js` exposing `window.StageArt` that draws the machine and its crew onto a canvas from the baked atlases. It knows nothing about the economy; the game feeds it events.

## API (keep it this small)

```js
const stage = StageArt.mount(hostEl, {
  desk: 'mint', mk: 0, parts: ['p-brass', ...],          // from partsOf(d)
  crew: [{ ci, role, slot, look, hat, shiny, name }],     // from ops.js, in crew order
  fx: { low, reduceMotion }, getMood: () => ({ wet, hat, scared })
});
stage.setMachine(desk, mk, parts);        // buy/restore/upgrade; swap look
stage.setCrew(crewViews);                 // hire, rename, hat change; diff, do not rebuild everything
stage.press({ ch, auto, p, col, ding });  // one call per letter typed; p is the crew index or undefined for taps
stage.tear();                             // page ripped (tearPage)
stage.cheer(ms, text); stage.setBuff({ frenzy, golden, sluggish });
stage.setWanted(setOfLetters);            // .want highlights
stage.setSheet(text);                     // paper text
stage.rectOf(what);                       // {sheet|crewMember|key} -> DOMRect for particles and tearPage
stage.visible(boolean);                   // pause when not on Floor
stage.destroy();
```

## Behaviour

1. **Layers (back to front):** body, platen, carriage + sheet text, spools, typebars, lever/bell/cog, side assistants, keycaps with press cells and `want` glow, hoppers by depth row, overlays (dust, ink prints, sparks), then DOM overlays (names, speech `.o-say`, hit keys).
2. **Per-actor state machine:** `rest -> reacting(clip) -> rest`, one-shot clips never interrupted but allowed one queued follow-up, so presses arriving 30 times a second do not stack animations. The rate is capped by the same rule as `animatePress` (auto presses drawn at most every 70 ms, 160 ms in Low).
3. **Hop to key:** parabola from current spot to the pressed key's stomp point using the manifest `contact` frame; position is integer-rounded each frame; arrival frame triggers the key-down cell, dust puff and typebar strike. Lane and depth rules come from AI-01's slot map so hoppers never fully hide each other.
4. **Assistants** act per the README table; unhired stations still animate their machine part from letters pressed.
5. **Motion modes:** normal 30 fps; Low 15 fps with fewer particles; reduced motion draws one static frame per actor and updates only on events. Canvas stops when `visible(false)` or `document.hidden`.
6. **Scaling:** integer device-pixel scale from AI-01's rule; recompute on `ResizeObserver` for the host only; `image-rendering: pixelated`; `ctx.imageSmoothingEnabled = false`; round every draw coordinate.
7. **Hit keys:** create invisible `<b class="o-key" data-k="Q">` elements (and the space bar) over the keycap rectangles from the manifest, so ops.js's existing `fx.keys` lookup, `.want` class toggling, tooltips, and tour targeting keep working. They must not intercept pointer events differently from today (the stage itself handles taps).
8. **Loading:** manifests fetched first, strips lazily as crew looks appear; draw a placeholder (cast-iron silhouette) for a monkey whose strip is still loading; `mount` resolves `ready` and reports failure so ops.js can fall back to the old stage.
9. **No allocation in the frame loop**, no layout reads, no `getBoundingClientRect` outside `rectOf`.

## Files owned

`stage-art.js`, a `/* stage-art */` section at the end of `ops.css` (host sizing, overlay positioning, `.o-key` hit area), and a lab page `gemini-art/art-v2/spike/stage.html` for driving it without the game (buttons: add crew, press random letters, press 30/s, ding, tear, cheer, toggle Low/reduced motion).

## Acceptance

- The lab driver page runs 12 crew at 30 fps on a 4x CPU throttle at 1280x800 and 360x560 with no frame over 33 ms for 60 s (report the numbers).
- Each role's clips fire from its own press; unhired stations animate; Low and reduced motion behave as above; `destroy()` leaves zero timers and listeners (check with a heap/listener count).
- Screenshots at three sizes x crew counts 0, 1, 5, 8, 12 reviewed against AI-01's slot map.

## Do not

Import anything from `ops.js`; read or write game state; fetch from `gemini-art/`.

## Status

Not started.

## Handoff notes

(fill in: final API, slot constants, perf numbers)

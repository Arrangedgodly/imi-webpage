# GEMINI DIRECTIVE: Art Pass 2 — Cleaner Animated Pixel Art

> **How to start:** open this repo in Gemini and say:
> *"Read `gemini-art/GEMINI_DIRECTIVE.md` completely, then execute it as the orchestrator. Spawn sub-agents exactly as described in section 8. Do not skip the lint gates in section 7. Report with the template in section 12."*

You are the **orchestrator**. You plan, spawn sub-agents, gate their output with the lint tools, and assemble a gallery. You do not draw everything yourself.

---

## 1. Mission

Produce a second, **cleaner and more hand-drawn-looking** set of animated pixel art for MonkeyOS v2 ("Infinite Monkey Industries"), in two parts:

- **Part A — Redo.** Every one of the 41 components in `gemini-art/index.html` → *"🧩 Complete Game Art Upgrade Suite & Component Lab"*, redrawn to the quality bar in section 5.
- **Part B — Gaps.** Game art that the Lab never covered and nobody has tried to upgrade yet (section 9).

The monkeys (`monkey-variants.js`, 30 variants) and typewriters (`typewriter-styles.js`, 6 models × 3 tiers) are **already liked and are out of scope**, except where Part B needs a monkey head anchor or a recolor.

## 2. Hard rules (isolation — read twice)

1. **Write only inside `gemini-art/art-v2/`.** Create it. Everything new lives there.
2. **Never edit, rename or delete** any existing file: not `game-components.js`, `generate-components.js`, `index.html`, `proto-engine.js`, `serve.js`, `monkey-variants.js`, `typewriter-styles.js`, and nothing outside `gemini-art/` (`ops.js`, `pixel.js`, `core.js`, `*.css` …). The existing Lab is the **"before"** for A/B comparison and must keep working.
3. **Do not integrate into the game.** No edits to the game's HTML/JS/CSS, no new `<script>` in `index.html`/`classic.html`. This pass produces *assets and a standalone gallery only*.
4. **No git commits, no pushes, no branch changes.** The working tree already has uncommitted edits in `gemini-art/` that belong to the owner. Leave them alone.
5. **No dependencies, no `npm install`, no build step.** Plain JS (works as `<script>` in a browser and `require()` in Node), Node's built-in `zlib`/`fs`/`http` only. The owner is on Windows 11; use `node` and forward-slash relative paths.
6. **Pixel purity is a rule, not a preference** (section 5): no anti-aliasing, no semi-transparent pixels, no blur, no rotation/scale of drawn sprites at runtime.
7. Reuse the dev server: `node gemini-art/serve.js` → `http://localhost:8192/gemini-art/art-v2/index.html`. Do not change `serve.js`; it already serves subfolders.

## 3. Read first (reference only, do not copy its mistakes)

| File | Why |
|---|---|
| `gemini-art/GAME_ART_UPGRADE_PLAN.md` | The inventory of the 41 Lab components and their intended look. |
| `gemini-art/game-components.js` | Current renderers + `*_DATA` arrays (ids, names, ramps, bios). Keep these **ids** so old/new can be paired. |
| `gemini-art/monkey-variants.js` (header comment + head/hat anchors) | How a 64×64 character is specified; where a hat sits on a head. |
| `pixel.js` (top ~40 lines, the `DEF` ramps) | **The game's real palette ramps.** Our new art must sit next to these without clashing. `S = 3` CSS px per art pixel. |
| `ops.js` lines ≈ 195–215 (`TRAITS`, `HATS`), ≈ 715 (`MUSES`, `MUSE_LOOK`), ≈ 628 (`DIVS`), ≈ 270 (`DEALS`), ≈ 804 (`CHALLENGES`), ≈ 797 (legacy upgrades), ≈ 1064 (`AWARDS`) | Names, tiers and rules for Part B assets. |
| `docs/plan/README.md` | What the game is, so props feel like they belong to it (parody-publishing monkey factory, warm jungle workshop). |

## 4. Why the current Lab art looks "off" (diagnosis from the code)

I read the code, not rendered frames — **confirm this by rendering a contact sheet of the existing Lab first** (section 7, step 0b) and tell me if you disagree.

1. **CG shading in pixel clothing.** `Px.sphere`, `Px.cylV`, `Px.cylH`, `Px.bevel` compute per-pixel lighting. That yields smooth, many-shade gradients with noisy edges. Real pixel art uses **few shades in deliberate clusters** with hand-chosen edge pixels.
2. **Animation is an overlay, not a drawing.** Most loops are one static render plus a moving effect (`sweepX` highlight line, a flicker, a bobbing dot). The silhouette barely changes, so it reads as a shimmer, not as motion.
3. **Too many colors per asset**, hues that don't shift between shadow and light, and outlines that are either missing or pure black.
4. **Same 8 frames @ 8 FPS for everything**, whether it's a pendulum or a sparkle.
5. **Procedural coordinates drift** (e.g. `Px.circle` with rounded radii) producing lumpy circles and orphan pixels.

The fix is not "better lighting math". It is **authored pixel data**: someone decided every pixel.

## 5. The Look Bible (applies to every asset)

**Palette**
- ≤ **16 colors per asset including the outline** (≤ 24 for 64×64 characters and scenes). Everything else is transparent.
- Build each material as a **5-step ramp** `[highlight, light, base, shadow, deep]` with **hue shifting**: shadows drift toward blue/purple, highlights toward warm yellow. Never just darken the base.
- Start from the game's own ramps in `pixel.js` `DEF` (fur, wood, banY, leaf, metal, paper, …) and extend them to 5 steps. Create `art-v2/kit/palette.js` once; every sub-agent imports from it and may add **at most 4 asset-specific colors** (declared in the asset file).
- Outline: **selective colored outline** — the darkest step of the neighbouring material, ~50% darker (the game does `outlineOf = shadow × 0.5`). No `#000000` anywhere. Interior outlines only where two same-value regions would merge.

**Light and shading**
- Light from the **top-left**. Cast shadows go bottom-right. Same for every asset, so a shelf of them looks coherent.
- Large flat areas get **2–3 shades**, not 5. The 5-step ramp is for the whole asset, not every surface.
- Dithering: only a **1-pixel checkerboard between two adjacent ramp steps**, only on large surfaces (velvet, wallpaper, sky). Never dither small objects. Never random noise.
- Highlights: single pixels or 2-pixel dashes on edges facing the light. Specular "glints" are the *brightest ramp step*, not new white.

**Pixel hygiene** (these are linted in section 7)
- Zero anti-aliased or semi-transparent pixels (alpha is 0 or 255).
- No **orphan pixels** (a lone pixel with no 4-neighbour of similar value) unless it is a deliberate sparkle/spark/droplet and is listed in the asset's `sparkles` list.
- No **jaggies**: diagonals follow consistent steps (1:1, 2:1, 3:1…), curves use runs that grow/shrink smoothly (e.g. 4-3-2-2-1-1-1 not 4-2-3-1).
- No doubled outlines, no 1-pixel "L-corner" bumps on straight edges.
- Silhouette must read at **1× scale** (the game shows art at 3×, but icons appear at 16×16). Squint test: fill the shape solid; is it still identifiable?

**Animation** (the part that makes it feel premium)
- Every loop must **loop seamlessly**: frame N-1 → frame 0 changes by the same small amount as any other step.
- Use **real animation principles**: anticipation → action → overshoot → settle. Swinging things (pendulum, tassel, cloth) use **ease in/out spacing**: more frames near the extremes, fewer in the middle. Don't space them linearly.
- **Hold frames** are fine and good (a blink is 1 frame closed, 1 half). Not every frame must move.
- **Secondary motion**: if a body part moves, the loose thing attached to it follows 1–2 frames later (ribbon tails, smoke, tassels, hair).
- **Squash/stretch** on elastic things (rubber, fruit, jelly): 1 pixel is enough.
- **Smears**: max 1 per loop, only on the fastest frame.
- **Frame budgets**, with the real intent:

| Class | Typical size | Frames | FPS | Loop style |
|---|---|---|---|---|
| Static icon with life | 16×16 / 24×24 | 4 | 6 | idle glint / wiggle |
| Prop / item | 32×32 | 8–12 | 8–10 | idle |
| Framed portrait / hero prop | 48×48 | 12 | 8 | idle with a "beat" |
| Hero scene / character | 64×64 | 12–16 | 10–12 | idle + one-shot reaction |
| One-shot (peel, crack, stamp, unlock) | any | 5–10 | 12 | plays once, ends on a hold frame |
| Seamless tile (sky, parallax) | 256×h | 1–8 | 4–8 | must tile in X |

- **Reduced motion:** every looping asset also declares `staticFrame` (the single best still frame, index) so the game can respect `prefers-reduced-motion` later.

## 6. Authoring format: draw with data, not with primitives

Sub-agents **do not call `Px.sphere`/`Px.cylV`/`Px.bevel`**. They author pixel data directly. Three accepted forms, pick the one that fits:

**(a) Full ASCII frames** — best for ≤ 32×32 props. One character = one palette key, `.` = transparent. A 32×32 frame is 32 strings of 32 characters. Draw frame 0 carefully as the master.

**(b) Master + row patches** — best for animation of a mostly-still object. Later frames list only the rows that changed:
```js
frames: [
  { rows: [ '................', /* …32 full strings… */ ] },          // frame 0 = master
  { base: 0, patch: { 12: '…new string for row 12…', 13: '…' } },     // only rows that differ
  { base: 0, px: [[10,4,'h'],[11,4,'h']] },                         // or individual pixels [x,y,key]
]
```

**(c) Parts + pose table** — for 48×48 / 64×64 characters and scenes. Each body/prop part is a small ASCII sprite; each frame is a table of `part → [dx, dy, flipX, variantIndex]`, composited back-to-front. **Parts are never rotated by code.** If something must rotate (an arm swing, a hat tilt), the artist authors 3–5 pre-drawn variants of that part and the pose table picks one. This is what keeps edges clean.

**File contract.** Each asset is one file `art-v2/assets/<category>/<id>.js`:
```js
(function (root) {
  const asset = {
    id: 'golden_banana',             // keep Lab ids for Part A
    category: 'shop',
    size: [32, 32], fps: 10, loop: true, staticFrame: 0,
    palette: { '.': null, 'o': '#5a3a06', 'a': '#b38004', 'b': '#e0a812', 'c': '#ffd23a', 'd': '#fff08c', 'w': '#fffbe0' },
    sparkles: [[6,5],[27,12]],        // allowed intentional lone pixels
    notes: 'one-line intent',
    frames: [ /* form (a), (b) or (c) */ ]
  };
  (root.ArtV2 = root.ArtV2 || { assets: {} }).assets[asset.id] = asset;
  if (typeof module === 'object' && module.exports) module.exports = asset;
})(typeof self !== 'undefined' ? self : this);
```
Palette keys: use the same letter for the same ramp step across assets where possible (`k` outline, `h` highlight …) — defined in `kit/palette.js`.

## 7. Phase 0 — build the kit and the gates (orchestrator does this first, alone)

Create `art-v2/kit/` with these Node/browser-compatible files. **No sub-agent starts until all gates exist and pass on a test asset.**

0a. **`resolve.js`** — turns any asset (forms a/b/c) into an array of flat `Uint8Array` RGBA frames. One source of truth for lint, PNG export and the gallery.

0b. **`render-baseline.js`** — renders the **existing** 41 Lab components from `../game-components.js` (read-only `require`) into `art-v2/baseline/<category>_<id>.png` strips, for before/after. Needs a canvas: run it inside the gallery page in the browser (headless Chrome/Edge via the preview or screenshot tooling you have), not in raw Node. Look at the result. Confirm or contradict section 4.

0c. **`png.js`** — a dependency-free PNG encoder (`zlib.deflateSync`, CRC32, RGBA 8-bit). Used to emit `art-v2/out/<category>/<id>.png` (horizontal strip, all frames) and `<id>@3x.png` (nearest-neighbour ×3), plus `<id>.json` (frame count, fps, size, staticFrame).

0d. **`lint.js <file|dir>`** — exits non-zero and prints a table if any of these fail. **Thresholds are gates, not suggestions:**
| Check | Fail when |
|---|---|
| `colors` | > 16 distinct colors in the asset (> 24 for sizes ≥ 64) |
| `alpha` | any pixel alpha ∉ {0,255} |
| `black` | any `#000000` |
| `orphans` | > 2 isolated pixels per frame not listed in `sparkles` |
| `loop` | looping asset where diff(frame N-1, frame 0) > 1.5 × the **median** adjacent-frame diff, or one-shot not ending on a hold |
| `motion` | median adjacent-frame changed-pixel ratio < 1.5% (it's a static picture) or > 45% (it's flicker, a repaint) |
| `silhouette` | the opaque mask is identical across all frames (nothing moves) — except tiles flagged `still: true` |
| `ramp` | a color used > 6 px that is not in the palette ramps (stray hex) |
| `bounds` | art touches the canvas edge on all 4 sides and is not a tile/frame (clipped sprite) |
| `tile` | `tile: true` asset whose left and right columns don't match (X seam) |
Also print per-asset **color count, frame count, median motion %**.

0e. **`sheet.js`** — writes a **contact sheet PNG per category** at 1× and 3×, on both a dark (`#1a0f14`) and a light (`#e4f9b0` sky green) background, labelled with asset id. The sub-agent and the critic **look at these images**. If you cannot view images, use `ascii-dump.js` (prints each frame with ramp-step digits) and rely on lint.

0f. **`gallery`** (see section 11) — scaffold now, fill later.

0g. Pick **one** small asset (Golden Banana), author it yourself end-to-end, push it through lint + sheet, and use it as the **reference example** you hand to every sub-agent.

## 8. Phase 1 — sub-agent roster (spawn in parallel, one asset family per agent)

Each sub-agent gets: the **Look Bible** (section 5), the **format** (section 6), the **lint tool**, the **reference example**, its **asset list with the per-asset specs below**, and the **brief template** (section 10). It writes only into `art-v2/assets/<its category>/` and may not touch other agents' folders.

| # | Agent | Category folder | Scope | Size / frames |
|---|---|---|---|---|
| A1 | muses | `muses` | 9 framed portraits | 48×48, 12 f |
| A2 | studios | `studios` | 5 media-division machines | 64×64, 12 f |
| A3 | garden | `garden` | 6 garden stages + letter glyph atlas | 32×32, 8–10 f |
| A4 | shop | `shop` | 6 artifacts | 32×32, 8–12 f |
| A5 | awards | `awards` | 5 trophies/ribbon/star | 32×32, 8–12 f |
| A6 | library | `library` | 6 book spines | 16×(28–48), 8 f |
| A7 | weather | `weather` | sun, drizzle, monsoon, thunderstorm | 32×32, 12 f |
| B1 | crew | `crew` | hats, traits, ranks, dice (G1–G3) | 16–32, 4–8 f |
| B2 | automation | `automation` | keepers, publisher, agent, analyst, barometer (G4–G5) | 48×48, 8–12 f |
| B3 | deals-upgrades | `deals` | rights deals, upgrade glyphs, hold/double-touch (G6–G7) | 24–32, 4–8 f |
| B4 | toys-sky | `sky` | side-rail toys, sky bands, clouds, rain, stars, fireflies, parallax (G8–G9) | tiles + 32×32 |
| B5 | menu-hud | `hud` | title logo, hero monkey, play button, tab icons, buffs, streak banners (G10–G12) | mixed |
| B6 | titles | `titles` | book covers, shelf, stamps, challenge & legacy badges, award toasts (G13–G14) | mixed |
| B7 | chrome-juice | `chrome` | 9-slice frames, tiles, buttons, particles (G15–G16) | mixed |

Run A1–A7 first (they have a baseline to beat), then B1–B7. After each agent finishes: **lint → contact sheet → critic (section 11)**; max **2 revision rounds** per asset. If an asset still fails lint after 2 rounds, ship it flagged `needs-human` rather than looping forever.

### Part A — per-asset specs (keep identity, fix quality, give each a signature animation)

**A1 Muses — 48×48.** Gilded frame (5-step gold, a 3-px molding with 4 distinct corner rosettes, inner velvet liner, dark wallpaper behind). The portrait inside is a **pixel monkey bust in the muse's signature hat** (see `MUSE_LOOK` in `ops.js` for hat id). Bio text for each is in `MUSES_DATA[i].bio`. Beat for the loop (frames 0-2 hold, blink at ~7, beat at 8–11):
- `seuss` Dr. Zoos — red/white stovepipe hat tips up 1 px and settles; bow-tie polka dots; one wink.
- `poe` Edgar Allan Chimp — violet raven quill dips and scribbles a tiny line; cravat folds.
- `dick` Emily Dickinsimian — lace bonnet ribbons sway; a rose petal falls 1 px per frame past the frame bottom.
- `hemi` Ernest Hemingwape — captain's cap, brass anchor glint travels across; beard shifts.
- `christie` Agatha Chrisbanana — monocle glint sweeps once; one raised eyebrow; pearls gleam in sequence.
- `woolf` Virginia Woolfkin — scarf flutters (2-frame secondary lag); cameo lighthouse pulses.
- `austen` Jane Apesten — amber bonnet frill flutters; scarlet wax seal glows; quill tip moves.
- `tolken` J.R.R. Tolkong — pipe ember pulses; smoke ring rises and fades over 6 frames.
- `twain` Mark Twainana — mane lifts in a breeze; mustache twitches; white suit highlight shifts.

**A2 Studios — 64×64** (props on a small shared mahogany plinth). Ids `records, tv, radio, sketch, film`.
- `records` Jungle Records — gramophone: record spins (**rotate by redrawing 6 pre-authored groove/label-notch states**, not by code), brass horn with scalloped rim, a tiny music-note glyph floats out of the horn and fades.
- `tv` Canopy TV — walnut CRT: screen alternates 3 pre-drawn "programs" (monkey sitcom silhouette, test pattern, static) with a rolling scanline; rabbit-ear antennae twitch on the static frames.
- `radio` Vine Radio — cathedral radio: tuning needle sweeps with ease; amber dial glow pulses; 3 signal arcs expand outward on a 4-frame cycle.
- `sketch` Monkey Business Troupe — proscenium: curtains part 1 px per frame and re-close; comedy/tragedy masks swap sides; footlight shells flicker alternately.
- `film` IMI Pictures — cine camera: both film reels rotate (pre-drawn spoke states); lens turret glints; clapperboard clacks once per loop.

**A3 Garden — 32×32.** Ids `seed_packet, soil_empty, sprout, budding, blooming, watering_can`. Must read as a **growth sequence** when placed side by side (same soil line, same pot position, same palette family).
- `seed_packet` — kraft packet gives a 2-frame shake and a sparkle.
- `soil_empty` — furrows; an earthworm pokes up then retracts.
- `sprout` — two cotyledon leaves unfurl/relax 2 px with a dewdrop slide.
- `budding` — bamboo stake, vine sways with 1-frame lag at the tip; calyx swells by 1 px.
- `blooming` — petals pulse in a 2-ring pattern; pollen sparkles; **the center holds a letter glyph slot** (draw the 'E' glyph here; the glyph atlas below supplies the rest).
- `watering_can` — tilts forward (3 pre-drawn tilt states), droplet arc falls in 4 frames, water splash on the last.
- **Also in this agent: `glyph_atlas`** — an A–Z + 0–9 chunky pixel alphabet (5×7 body, 1-px shadow, gold and cream variants), as an asset sheet, reusable in blooms, letter tiles, book spines, logos.

**A4 Shop — 32×32.** Ids `golden_banana, rotten_banana, hold_weight, metronome, double_hammer, publishing_contracts`.
- `golden_banana` — rotation illusion by 8 hand-drawn facet-sheen positions; 3 four-point sparkles pop at staggered frames; a faint radiating halo (1 ring of dither).
- `rotten_banana` — brown bruise spots, green mold specks; 2 flies orbit on a 6-frame loop (pre-drawn positions, not code); 2 wavy stink lines rise.
- `hold_weight` — cast iron "5KG", brass ring; a slow settle-bounce (1 px squash) on a 12-frame beat with a dust puff.
- `metronome` — rosewood pyramid; pendulum arm with **ease-in/out spacing** across 8–12 pre-drawn angles; weight slides.
- `double_hammer` — two typebar hammers striking alternately with a spark at impact, return springs coil.
- `publishing_contracts` — scroll; a quill signs a squiggle appearing 1 px at a time; wax seal presses on the last 3 frames.

**A5 Awards — 32×32.** Ids `trophy_bronze, trophy_silver, trophy_gold, ribbon_blue, legacy_star`. The three trophies must be **clearly the same cup, three materials** (ironwood / chrome / gold with ruby+emerald). One traveling shine pass + one sparkle per loop; the ribbon's two tails swing out of phase; the star rotates through 4 pre-drawn facet states and pulses.

**A6 Library spines — 8-frame loops, sizes from `BOOK_SPINES_DATA`** (`width × height`: 9×28 … 14×48). Ids `band1…band6`. Each spine: leather, raised ribs, gold-tooled title cartouche (use the glyph atlas for the actual words **APE, SONG, JUNGLE, ARCHIVES, TYPEWRITERS, ENCYCLOPEDIA** — if the word cannot legibly fit, use a decorative glyph row instead), headband, bookmark tassel. Loop: gold foil glint sweeps down the ribs; tassel sways 2 px. Add **`pulled`** variant: the same spine sliding 3 px out of a shelf (3 frames) for hover.

**A7 Weather — 32×32.** Ids `sun, drizzle, monsoon, thunderstorm`. These are the toys' faces: all four must share a cloud/sun language so they look like a set. `sun` has pre-drawn alternating ray states + a wink; `drizzle` small cloud + 3 staggered drops; `monsoon` heavy two-lobe cloud + diagonal sheets; `thunderstorm` indigo cloud, bolt flashes for 2 frames in the loop with a 1-frame lightening of the cloud.

## 9. Part B — gaps: game art the Lab never covered (none of it has been upgraded yet)

Cross-checked against `ops.js`, `core.js`, `pixel.js`, `index.html`. Do **not** redo anything already in `index.html` sections 1–4 (monkeys, typewriters, desk themes). Priority P1 = do first, P2 = if time, P3 = last.

**G1 Typist hats — P1 — 7 hats × (a) 24×24 inventory icon, 4 f idle glint; (b) 24×16 head overlay for the 64×64 monkey, aligned to the head anchor in `monkey-variants.js`, with a 2-frame bob.** Ids and sources from `HATS` in `ops.js`: `cap, beret, flower, party_cone, top_hat, grad_cap, crown`. Keep the existing trophy-unlock fantasy: crown = gold with small gems, party cone = confetti sparkle, grad cap = tassel swings.

**G2 Typist traits — P1 — 7 badges, 16×16, 4 f.** Ids from `TRAITS`: `vowel` (A-E-I-O-U in a heart), `wordsmith` (quill over ink pot), `speedy` (winged boot or stopwatch with speed lines), `owl` (owl face + crescent moon), `lucky` (clover/horseshoe + twinkle), `rainy` (umbrella with drops sliding off), `scout` (spyglass with a gold-banana glint in the lens).

**G3 Crew progression — P2.** 10 level badges (rank insignia that grows: 1 chevron … level 10 star-and-laurel; 16×16, still + 1 glint frame), `talent` (two dice), `coach` (whistle + clipboard), `reroll` (dice cup tipping), `undo` (curved arrow). Plus **monkey expression/state sheet** over the existing 64×64 heads: neutral, happy, screech, sleepy, rain-umbrella, dizzy (spoiled banana), star-eyed (golden keys) — 2 f each.

**G4 Keepers — P1 — 6 keepers, 48×48, 12 f.** One per machine, tinted to the machine color (`#78d9a0 #f08aa4 #5fa8f0 #f2b23a #b58cf0 #dfe3f2`). A tiny scribe-monkey/automaton at a lectern: a letter tile slides in, gets stamped into a **word tile**, tossed into the shared bank bin. Provide **three upgrade looks per keeper** (Lv 0 plain, Lv 3 brass-trimmed, Lv 6 gilded with glowing lamp) as palette + overlay variants, not 18 separate drawings.

**G5 Market automation — P1.** Each 48×48, 8–12 f: **Publisher's assistant ×3 tiers** (tier 1 suited assistant stamping "SOLD"; tier 2 "Fast presses" printing press with sheets flying out; tier 3 "Night shift" the same press under a lamp with a moon in the window), **Literary agent** (pinstripe-suit monkey with briefcase; haggle gesture), **Market analyst** (chalkboard with an arrow chart that ticks up/down), **Barometer ×2 tiers** (brass aneroid with needle sway; tier 2 adds a second dial and a small weather-flag).

**G6 Rights deals — P2 — 5 × 32×32, 8 f.** Ids from `DEALS`: `reprints` (stack of the same book, top one flips), `tour` (suitcase with travel stickers + microphone), `translations` (speech bubbles cycling scripts), `clubs` (3 monkeys' hands holding one book / reading circle), `option` (clapperboard + contract).

**G7 Upgrade & shop glyphs — P2 — 24×24, 4 f.** Desk upgrades from `UPS`: `fing` Quick fingers, `rapid` Rapid touch, `vowel` Vowel rhythm, `ink` Fresh ink, `practice` Recipe practice, `stock` Stock-aware ink, `ribbon` Spare ribbon; shop `hold` Hold to type (finger holding a key, glow), `dbl` Double touch (two fingers); and a **level-pip strip** 0–5 (6 states) plus a "locked" padlock variant.

**G8 Side-rail toys — P1.** The toys `snack` (banana peel, **7 f one-shot**, see `bananaFrame`), `coconut` (crack, **5 f one-shot** with letters spilling), `weather` gauge (clear / drizzle / rain / storm), `night` gauge (dawn / day / dusk / night). 32×32. Each with a **ready** pulse (2 f), a **cooling** desaturated frame, and a 1-px ring.

**G9 Sky & world — P1.** Tiles that **seamlessly repeat in X**: far/mid/near jungle layers (256×96 / 256×300 / 256×96, see `farTile/midTile/nearTile` in `pixel.js`) — redo them in the Look Bible with **fewer, bigger, cleaner leaf clusters** and hand-placed rim light; sky 8-step dither bands for **day, dusk, night, dawn** (same 8 steps as `SKY_DAY`/`SKY_NIGHT`, two more palettes); 3 cloud drifters (24×12, 32×16, 48×20) with 4 f edge wobble; rain sheet tile (diagonal, 6 f scroll); storm flash overlay (2 f); star field twinkle (3 pre-drawn states); firefly (4 f). Include a **day-weather matrix thumbnail** (4 times × 4 weathers) in the gallery.

**G10 Title screen — P1.** Logo "INFINITE MONKEY INDUSTRIES" in chunky pixel lettering with vine and leaf wrap (two lines, ~192×48, 8 f with a vine sway + one sparkle sweep); **hero monkey** 64×64 idle (blink, ooh-ooh bubble, scratch head, 12 f) plus a click reaction one-shot; **Play banana button** 100×30 in 3 states (idle, hover wiggle, pressed) + green "Continue" variant; leaf link; drifting motes.

**G11 Department icons — P1 — 10 icons × 16×16 × 2 states (inactive, active) with a 4 f hover wiggle.** Floor, Train (monkey), Words (letter tile), Titles (book), Shop (banana crate), Keepers (stamp/lectern), Media (film reel), Muses (quill), Awards (trophy), Legacy (star). Plus a mobile "More" (three dots as 3 banana-peel-ish bumps).

**G12 Buffs & streaks — P2.** 6 buff icons 16×16, 4 f (`frenzy`, `golden` keys, `snack`, `rush` ×7 royalty, `sluggish`/spoiled, `critic`) with a pill frame for the HUD; **streak banners** for the 5 tap-streak milestones in `MILES` (`ops.js` ≈ 445): `x10 WARM UP`, `x25 FRENZY`, `x50 GOLDEN KEYS`, `x100 BANANA BONUS`, `x200 MONKEY MANIA`, as 8-frame pop-in + shine, using the glyph atlas (MONKEY MANIA should be the biggest and loudest).

**G13 Titles & publishing — P2.** Book **cover** templates 32×44 for the six bands (same hue as the matching spine from A6) plus a kids'-book cover template and a library-book cover template (cream, stamped); wooden **shelf** tile with 4 books of varied heights; **SOLD** rubber-stamp (6 f one-shot, with ink splat); edition ribbon; pitch/commission card frame; rights-market band chips with sky glyphs (sun/rain/storm/night) in 16×16.

**G14 Prestige & challenges — P3.** Four **Oulipo challenge badges** from `CHALLENGES` (`vowel` drought: wilted vowels, `haiku` run: brush + 5-7-5 scroll, `hands` ("No Hands": crossed-out paw), `timed` "Deadline": alarm clock) 32×32 with a 5-star row (filled/empty). **Legacy upgrade icons** from `LEG` in `ops.js` (≈ 797): `seed` Seed Money (3 tiers of banana pile), `crew` Veteran Crew, `speed` Printing Press, `sales` Prestige Imprint, `golden` Golden Touch (24×24, 4 f). **Second Printing** stamp (a press + the stars rain). **Award toast**: "AWARD UNLOCKED" and gold "GOLD AWARD!" banners as 9-slice plates with shimmer (12 f).

**G15 Chrome — P2.** 9-slice 16×16 frames (slice 6) for `wood, dark, leaf, paper, yellow` and their small versions, matching `frames.*` in `pixel.js`; plank tile; vine tiles (vertical 16×48, thin 8×24, horizontal); chip; progress bar (empty/fill/end-cap, 4 f shine); disabled, cooldown ring (12 radial segments), scrollbar. **Must tile or 9-slice with zero seam** (lint `tile`).

**G16 Juice — P2.** Particle atlas, each 4–8 f one-shot: letter pop (a key-cap hop), sparkle (4-point), shockwave ring, paw print (ink), leaf spin, water drop, spark, star, banana floater (+ small `+1` glyph digits), confetti (4 colors), dust puff, ink splat, smoke puff, coin flip.

**G17 Icons — P3.** App icon / favicon in the new style from the masters in `icons/src/` (read only): 512, 192, 48, 32, 16, plus a maskable 512 with safe-zone. Output as PNG in `art-v2/out/icons/`, never overwriting `icons/`.

**Out of scope on purpose:** gameplay text, fonts, the 300 kids' book data, the Library page's text rendering, anything already in `index.html` sections 1–4.

## 10. Sub-agent brief template (every sub-agent prompt must contain all of these)

```
ROLE: You are a pixel artist for MonkeyOS v2 drawing <CATEGORY>. You author pixel DATA by hand. You do not use procedural shading primitives.

OUTPUT: One file per asset in gemini-art/art-v2/assets/<category>/<id>.js using the contract in section 6.
         Write ONLY there. Never edit any existing file. No commits. No dependencies.

ASSETS (id · size · frames · fps · loop/one-shot):
  <one line each>

PER-ASSET INTENT (the creative brief — follow it, don't reinterpret it):
  <the specific paragraph for each asset from sections 8/9, plus the game fact it represents (name, description, number)>

HARD LOOK RULES: ≤16 colors incl. outline · 5-step hue-shifted ramps from kit/palette.js · light top-left · selective colored outline,
  no #000 · no AA / no alpha · dither only 1-px checker on large surfaces · no code-rotation (pre-draw variants) · seamless loop · ease-in/out spacing for swings.

PROCESS (do it in this order, and show your work in notes):
  1. Silhouette first: draw frame 0's outer shape as a 1-color blob; check the squint test.
  2. Fill flat ramp base colors in clusters; add shadow cluster, then highlight edge pixels, then outline.
  3. Draw frame 0 completely. Only then write the keyframe list for animation (e.g. "f0 rest, f2 anticipation, f4 apex, f6 settle…").
  4. Animate with form (b) patches where possible so frames stay consistent; re-draw whole frames only where the silhouette changes.
  5. Run `node art-v2/kit/lint.js art-v2/assets/<category>/<id>.js` and fix until it prints PASS.
  6. Run `node art-v2/kit/sheet.js <category>` and LOOK at the 1× and 3× sheets. Fix the three ugliest things. Repeat once.

REFERENCE: art-v2/assets/shop/golden_banana.js (passes lint; imitate its density and cleanliness, not its subject).
BASELINE:  art-v2/baseline/<category>_<id>.png (the current Lab version — be better than this at 1× AND 3×).

DONE MEANS: lint PASS, sheet viewed, a 2-line self-critique per asset ("best pixel work", "weakest spot"), and no file outside your folder touched.
```

**Worked example of the specificity expected** (use this style for every asset line, it's the difference between good and mush):

> `golden_banana · 32×32 · 10 f @ 10 fps · loop`. A single ripe banana lying diagonally from lower-left to upper-right with a 3-pixel curve, stem nub at upper-right (dark brown `stem` ramp), tip nub at lower-left. Body is `banY` 5-step ramp: base `#ffd23a`, highlight `#fff08c`, shadow hue-shifted toward orange-brown `#c98f0e`/`#7a4a08`, deep `#422e02`. Highlight is a continuous 1-px rim along the **top-left** edge with a 2-px bright dash near the middle. Three vertical facet bands; the sheen is an extra-bright diagonal band that **moves one band per 2 frames** and wraps with 2 hold frames at the end. Exactly three 4-point sparkles (`sparkles` list) pop at frames 1, 4 and 7, each 3-frame life (1px → plus-shape → 1px). Faint halo: a single-pixel checkerboard ring 2 px outside the silhouette, frames 3–6 only. Outline is the deep brown of the ramp, no black. Fits in 28×26 leaving a 2-px margin so the halo is not clipped.

## 11. Phase 2 — critic pass, gallery, and A/B

**Critic agent (a separate agent per category, fresh context, did not draw it).** Input: the contact sheets at 1× and 3× + the baseline. It scores each asset 1–5 on each axis and **must name concrete pixel-level fixes** ("rows 10–14 left edge has a 1-px bump; the highlight on the cup bowl is two disconnected dashes"), not generic praise:

| Axis | 5 means |
|---|---|
| Silhouette & readability at 1× | recognizable in 1 second |
| Palette discipline | ramp hue-shifts, no stray colors, coherent with neighbours |
| Edge cleanliness | no jaggies, orphans, doubled outlines, lumpy curves |
| Animation | has anticipation/settle, eased, real silhouette motion, loops cleanly |
| Charm / personality | would make a player smile; matches parody-jungle-workshop tone |
| Better than baseline | clearly beats the existing Lab version |

Anything scoring ≤ 3 on any axis is returned to its sub-agent with the critic's list. Max 2 rounds.

**Gallery (`art-v2/index.html` + `art-v2/gallery.js`, standalone, no edits to the old page).** Dark page matching the owner's existing Lab look (`#121c15` panels, gold `#ffd23a` accents). For each asset: animated canvas at 1×/2×/3×/4× toggle (integer scaling, `image-rendering: pixelated`), play/pause, 0.5×/1×/2× speed, frame scrubber, onion-skin toggle, palette swatches with color count, lint result badge, critic scores, `needs-human` flag. For Part A: a **side-by-side Before (old renderer, loaded read-only from `../game-components.js`) vs After**. Tabs per category; a "reduced motion" toggle that shows `staticFrame`. A **Key Art test strip**: the new assets placed together on the game's real background colors (day and night sky, plank) to check they sit well beside each other. Include a **"copy asset JSON"** button per asset. Do **not** add approval buttons that mimic integration; the owner decides.

## 12. Deliverables and final report

1. `art-v2/assets/**` source files, `art-v2/out/**` PNG strips + `@3x` + JSON manifests, `art-v2/baseline/**`, `art-v2/kit/**`, `art-v2/index.html`.
2. `art-v2/REPORT.md`:
   - Table of every asset: id · category · size · frames · fps · colors · lint · critic min score · status (`ok` / `needs-human`).
   - **What changed vs the old Lab** in plain language: the 5 diagnosis points from section 4, confirmed or disputed after you looked at the baseline.
   - **Coverage:** Part A 41/41, Part B per group G1–G17 done / partial / skipped and why.
   - **Honest weak list:** the 5 assets you think are still worst, with what you'd try next.
   - **Integration notes for later** (not done now): which game file would consume which asset, frame/fps metadata, and anything that needs an engine change (e.g. reduced-motion `staticFrame`, tile seams).
3. A one-paragraph summary at the end of your chat reply, and the exact command to view it: `node gemini-art/serve.js` → `http://localhost:8192/gemini-art/art-v2/index.html`.

**Never claim an asset is done if lint did not PASS or you did not look at its sheet.** If you could not view images in this environment, say so in the report, say which assets were judged by lint and ASCII dump only, and mark them for human review.

# 🐒 MonkeyOS v2: High-FPS Art & Animation Design Proposal
**Location:** `gemini-art/`  
**Status:** Experimental Prototype Suite & Art Direction Evaluation  
**Target:** Pixel Edition (`html[data-style="pixel"]`)

---

## 1. Executive Summary & Vision

The current art implementation in MonkeyOS v2 uses procedurally generated pixel art with a 2-frame swinging animation (`ph = 0`, `ph = 1`), where typist monkeys dangle from static ropes at the top of the viewport (`.o-dangle`). The typewriter itself is a collection of flat CSS `div` elements at the bottom of the screen.

This prototype suite in `gemini-art` explores a **high-fidelity, 64x64 high-frame-rate artistic direction** with **Godot-style nearest integer scaling** and an **authentic mechanical retro typewriter**:
1. **64x64 Native Resolution:** Stepping up from 43x31 / 48x48 to native 64x64 allows for distinct anatomical features, expressive eyes with blink/wink/screech micro-expressions, multi-segmented finger paws, newsboy cap seams, and secondary physics on tails and clothing.
2. **Godot-Style Nearest Integer Scaling & Sub-Pixel Snapping:** Eliminates pixel shimmering, fractional warping, and blurring by enforcing whole-number canvas multipliers (`Math.floor(scale)`), `image-rendering: pixelated`, and snapping all sprite translation coordinates to whole integers (`Math.round(x)`).
3. **Fluid High Frame Count (14–18 frames per cycle):** Moving from a 2-phase pendulum swing to high-FPS animations with squash-and-stretch, anticipation, apex extensions, kinetic impact stomps, and springy recoveries.
4. **Authentic Mechanical Typewriter Architecture:**
   - **4-Tier Vintage Keyboard Deck:** 36 individual round keycaps with brass chrome bezels and vertical steel stems that compress by 3.5px on impact.
   - **Typebar Basket Linkage:** Semicircular cast iron frame radiating 24 steel typebar linkages that pivot up in real time to strike the platen ribbon guide.
   - **Moving Carriage & Rubber Platen:** Spring-loaded escapement chassis with knurled brass end knobs, ivory paper sheet with typed text lines that scroll, articulated brass return lever, and margin bell.
   - **Twin Exposed Ribbon Spools:** Brass 4-spoke wheels wound with dual-tone ink ribbons that rotate mechanically with every keystroke.
5. **Direct Monkey-to-Typewriter Physicality & Spatial Targeting:** Instead of hanging detached from vines overhead, monkeys physically inhabit the typewriter:
   - **Key Stomper (64x64):** Bounces from key to key with true parabolic trajectories. Clicking any keycap on the canvas causes him to leap through the air, land on that exact key, compress its spring, and spark the corresponding typebar.
   - **Carriage Return Rider (64x64):** Perched on the left carriage wing, pulls the brass carriage return lever with two hands and full body weight, sliding across as the margin bell dings.
   - **Platen Roller Acrobat (64x64):** Sits atop the rubber platen roller, spinning it underfoot like a circus acrobat when paper advances, and peeking over the manuscript with a magnifying glass to inspect freshly typed characters.
   - **Ribbon Spool Mischief Monkey (64x64):** Sits beside the twin ribbon spools, tugging the ink ribbon loop, playing with the spool, and leaving inky paw prints on the mahogany desk surface.
   - **Victory Dance Troupe (64x64):** Waves glowing golden bananas and kicks feet joyously with confetti bursts.

---

## 2. Godot-Style "Nearest Integer Scaling" Explained

In Godot Engine, achieving razor-sharp retro pixel art without distortion or shimmering relies on three core settings:

```gdscript
# Godot project settings equivalent:
display/window/stretch/mode = "viewport"        # 1. Low-res internal rendering buffer
display/window/stretch/scale_mode = "integer"   # 2. Only scale by 1x, 2x, 3x, 4x, etc.
rendering/2d/snap/snap_2d_transforms_to_pixel = true # 3. Snap translations to whole pixels
texture_filter = "nearest"                     # 4. Nearest Neighbor resampling
```

### Why Smaller Sprites Blur or Shimmer (And How We Fixed It)
- **Fractional Scaling Distortion:** If a low-res canvas is scaled by a decimal multiplier (e.g. `2.37x`) to fill a screen, some logical pixels are drawn 2 physical pixels wide while others are drawn 3 physical pixels wide. This causes uneven line weights and ugly "wobbly" pixels.
- **Sub-Pixel Shimmering:** When a sprite moves across the screen with float coordinates (e.g. `x = 104.3`), bilinear interpolation blurs the sprite edge across two screen pixels. If nearest-neighbor is used without snapping, the sprite "pops" irregularly.
- **The Fix in Our Web Prototype:**
  1. **Fixed Logical Resolution:** Game logic renders to a virtual `384 × 240` retro canvas (16:10 aspect ratio).
  2. **Integer Canvas Scaling:** `const scale = Math.floor(Math.min(screenW / 384, screenH / 240)); canvas.width = 384 * scale;`
  3. **CSS Nearest-Neighbor:** `canvas { image-rendering: pixelated; image-rendering: crisp-edges; }`
  4. **Coordinate Snapping:** In `render()`, all sprite draw calls round positions via `snap(x) = Math.round(x)`. This gives buttery-smooth motion with zero edge jitter or blur!

---

## 3. Visual Concept Studies

We have visual concept studies inside `gemini-art/concepts/`:

| Concept | Asset Path | Description |
| :--- | :--- | :--- |
| **Mechanical Typewriter Blueprint** | `gemini-art/concepts/typewriter_blueprint.jpg` | Elevated 3/4 mechanical cutaway blueprint showing the 6 interaction stations: moving carriage, paper feed, curved typebar basket, twin ribbon spools, 4-row keyboard, and return lever. |
| **64x64 High-Fidelity Sprite Sheet** | `gemini-art/concepts/monkey_64x64_spritesheet.jpg` | Grid study of the 64x64 monkey typist: Row 1 (Key Stomp & Dust Clouds), Row 2 (Two-Handed Lever Pull), Row 3 (Platen Roller Magnifying Glass Inspection), Row 4 (Ribbon Mischief & Inky Paw Prints), Row 5 (Victory Celebration). |
| **Integrated Jungle Workshop** | `gemini-art/concepts/scene-concept.jpg` | Full-scene composition showcasing warm brass, forest greens, mahogany desk, and monkeys physically working together on the machine. |
| **Typewriter Models Showcase** | `gemini-art/concepts/typewriter_models_showcase.jpg` | Side-by-side study of all 6 canonical typewriter models across restoration tiers. |

---

## 4. 64x64 High-FPS Animation Specifications

| Animation Name | Resolution | Frame Count | Target FPS | Timing / Motion Profile | Key Interaction Points |
| :--- | :---: | :---: | :---: | :--- | :--- |
| **Key Stomp** | 64x64 | 16 frames | 30–60 FPS | Frames 0–3: Crouch anticipation<br>Frames 4–7: Upward rocket launch & apex<br>Frames 8–11: Downward rocket slam<br>Frames 12–15: Impact squash & spring recovery | Dual-foot landing compresses typewriter key stem; emits dust clouds & metal sparks. |
| **Carriage Return Slam** | 64x64 | 18 frames | 30–60 FPS | Frames 0–4: Grip lever & lean back<br>Frames 5–8: Full exertion pull<br>Frames 9–13: Fling forward as carriage slides<br>Frames 14–17: Margin bell strike with brass mallet | Connects directly to carriage position; pulls lever bar, rings margin bell. |
| **Platen Roller Acrobat** | 64x64 | 16 frames | 24–60 FPS | Continuous rotating walk cycle with alternating feet, head bob, and magnifying glass inspection | Sits atop the rubber cylinder, spins the roller underfoot on paper line feed. |
| **Ribbon Spool Mischief** | 64x64 | 16 frames | 24–60 FPS | Perched by ribbon spools, tugging ink ribbon loop back and forth | Leaves persistent inky black paw prints on the mahogany desk surface! |
| **Victory Banana Celebration** | 64x64 | 16 frames | 24–60 FPS | Side-to-side joy hop holding golden banana aloft with spark bursts | Triggers on title completion, milestone achievements, or high tap combos. |

---

## 5. Interactive Prototype Sandbox

Live interactive sandbox:  
👉 **`http://localhost:8192/gemini-art/index.html`**

### Features:
- **Interactive Mouse Click-to-Stomp:** Hovering over any round key on the typewriter canvas highlights the key; clicking it commands the Key Stomper to compute a parabolic trajectory and leap directly onto that key!
- **Camera Focus Modes:** Smooth lerp camera toggles between:
  - 🌐 *Full Typewriter* (1.0x full machine overview)
  - ⌨️ *Keyboard Deck & Stomper* (1.45x close-up on keys & spring stems)
  - 📜 *Carriage & Roller Acrobat* (1.45x close-up on moving platen & typed paper)
  - ⚙️ *Escapement Ticker & Mechanic* (1.6x close-up on ratchet cogwheel)
  - 🎀 *Ribbon Spools & Mischief* (1.6x close-up on rotating spools & ink prints)
- **6 Canonical Hardware Models & 3 Restoration Tiers:** Live hardware switcher instantly repaints enamel coatings, keycap bezels, carriage rails, ribbon silk tones, and hand-cast medallions.
- **Integer Scaling Controls:** Switch between `1x`, `2x`, `3x`, and `Auto-Fit` (Godot-style integer scaling).
- **Pixel Snap & Grid Toggles:** Toggle sub-pixel snapping on/off and turn on the visual pixel grid overlay to inspect exact raster boundaries.
- **Physical Keyboard Input:** Tap keys A–Z, Spacebar, or Enter to watch the stomper leap, dust clouds burst, and inky paw prints appear.
- **Auto-Typer Mode:** Continuous typing loop at 2–15 words per second.
- **Spritesheet PNG Exporter:** Export individual 64x64 animation sheets with one click.

---

## 6. Canonical Typewriter Hardware Models & Restoration Tiers

Implemented in `gemini-art/typewriter-styles.js`, this theme engine supplies authentic 16-bit raster styling for all 6 canonical MonkeyOS typewriter models and their 3 restoration tiers:

### The 6 Canonical Hardware Models

| No. | Model Name | Primary Enamel Ramp | Trim & Metals | Keys & Lettering | Medallion Inscription | Lore & Desk |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Bamboo Classic** (`mint`) | Sage / Mint green enamel<br>`#78d9a0`, `#56b07c`, `#316d4c`, `#1a3d2a` | Polished bamboo brass<br>`#f5d76e`, `#d4af37`, `#9b7818` | Ivory keycaps with brass rings & dark green lettering | `BAMBOO CLASSIC NO. 1` | Naturalist field desk, bamboo grove workshop |
| **2** | **Hibiscus Ribbon** (`rose`) | Soft vintage rose pink lacquer<br>`#f08aa4`, `#c95c78`, `#822e44`, `#481423` | Crimson velvet & warm rose-gold<br>`#f7b2bd`, `#b02040`, `#5a1020` | Soft cream keycaps with crimson rings & deep ruby lettering | `HIBISCUS RIBBON NO. 2` | Salon poet salon, floral greenhouse studio |
| **3** | **Lagoon Sprint** (`blue`) | Oceanic aqua / lagoon blue<br>`#5fa8f0`, `#387ec4`, `#1d4d80`, `#0d2745` | Streamlined chrome & nautical brass<br>`#e2ebf5`, `#a3b9d0`, `#5c748c` | Cool ice-white keycaps with navy rings & electric cyan lettering | `LAGOON SPRINT NO. 3` | Seaside maritime office, coastal lighthouse tower |
| **4** | **Honeycomb Ledger** (`amber`) | Rich warm amber / honeycomb gold<br>`#f2b23a`, `#ba7f18`, `#754c06`, `#3b2401` | Aged bronze & dark polished mahogany<br>`#e0a020`, `#804010`, `#402008` | Warm parchment keycaps with antique bronze bezels & sepia lettering | `HONEYCOMB LEDGER NO. 4` | Guild merchant study, apiary master's chamber |
| **5** | **Orchid Imperial** (`orchid`) | Royal imperial purple / velvet violet<br>`#b58cf0`, `#8357c9`, `#4f2e87`, `#271447` | Ornate gilded 24K gold leafing<br>`#fff080`, `#ffd700`, `#ffae00` | Royal obsidian or regal violet keycaps with sparkling gold rims | `ORCHID IMPERIAL NO. 5` | Palace chancery, royal court scriptorium |
| **6** | **Moonflower Grand** (`moon`) | Iridescent pearlescent platinum white<br>`#dfe3f2`, `#b8c0d9`, `#7680a3`, `#394059` | Mirror-polished sterling silver & ice-cyan<br>`#c8f4f9`, `#ffffff`, `#88d4e4` | Polished mother-of-pearl keycaps with silver bezels & platinum lettering | `MOONFLOWER GRAND NO. 6` | Observatory peak, astronomical society archives |

### Restoration Tiers (Mk I, Mk II, Mk III)
- **Mk I (Clean Enamel):** Original cast iron chassis professionally stripped, primed, and enameled. Single brass perimeter pinstripes, clean rivet plate, polished platen end knobs.
- **Mk II (Gold Pinstripes & Medallion Scrolls):** Double-ring concentric gold leaf pinstripes, corner scroll brackets on the chassis chamfers, polished brass ribbon spool spokes, and ornate corner rosettes on the brass medallion plate.
- **Mk III (Crown Crest & Imperial Filigree):** Regal 5-spire crown crest with a radiant center gemstone mounted atop the medallion plate, luminous filigree scrollwork across the front apron, radiant carriage rails, and jeweled ribbon spool hubs.

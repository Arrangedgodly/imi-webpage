const fs = require('fs');

// We will construct the entire game-components.js code cleanly.
const code = `/* ============================================================================
   GAME COMPONENTS PIXEL ART SUITE - ANIMATED 16-BIT RETRO EDITION
   ----------------------------------------------------------------------------
   Custom 16-bit handcrafted procedural pixel art generators with full 8-frame
   animation loops for every subsystem of MonkeyOS / Typewriter Ops:
   
   1. The 9 Literary Muses Salon (32x32 framed oil portraits, eye blinks, frame gleams, smoke & steam)
   2. The 5 IMI Media Studio Divisions (48x48 studio hardware, spinning vinyl, CRT scanlines, radio arcs, marquee lights, cine reels)
   3. Botanical Letter Garden (32x32 plots, swaying sprouts, wriggling earthworm, bursting golden blooms, watering droplets)
   4. Banana Logistics & Shop Artifacts (32x32 24K banana gleams, buzzing fruit flies, swinging metronome, dual-action hammers)
   5. Hall of Records & Awards (32x32 rotating specular reflections, twinkling jewels, fluttering silk ribbon tails, pulsing cosmic star)
   6. Vine Infrastructure Library (16x54 tooled leather spines with sweeping gold leaf foil and swaying bookmark ribbon tassels)
   7. Weather & Celestial Header Toys (36x36 rotating sun flare corona with wink, rainfall sheets, thundercloud lightning strikes)
   ============================================================================ */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.GameComponents = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function makeCanvas(w, h) {
    let cv;
    if (typeof document !== 'undefined') {
      cv = document.createElement('canvas');
      cv.width = w;
      cv.height = h;
    } else {
      cv = { width: w, height: h, _mock: true };
    }
    return cv;
  }

  // ==========================================================================
  // HIGH-DEPTH PIXEL PRIMITIVES (Zero-Blur, Dithering, Multi-Tone Shading)
  // ==========================================================================
  const Px = {
    rect(ctx, x, y, w, h, col) {
      if (!col) return;
      ctx.fillStyle = col;
      ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
    },
    dot(ctx, x, y, col) {
      if (!col) return;
      ctx.fillStyle = col;
      ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
    },
    line(ctx, x0, y0, x1, y1, col) {
      if (!col) return;
      ctx.fillStyle = col;
      x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
      if (!Number.isFinite(x0) || !Number.isFinite(y0) || !Number.isFinite(x1) || !Number.isFinite(y1)) return;
      const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
      const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
      let err = dx - dy;
      let safety = Math.max(dx, dy) * 2 + 10;
      while (safety-- > 0) {
        ctx.fillRect(x0, y0, 1, 1);
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * err;
        if (e2 > -dy) { err -= dy; x0 += sx; }
        if (e2 < dx) { err += dx; y0 += sy; }
      }
    },
    circle(ctx, cx, cy, r, col) {
      if (!col || r <= 0) return;
      ctx.fillStyle = col;
      cx = Math.round(cx); cy = Math.round(cy); r = Math.round(r);
      for (let dy = -r; dy <= r; dy++) {
        const dx = Math.round(Math.sqrt(Math.max(0, r * r - dy * dy)));
        ctx.fillRect(cx - dx, cy + dy, dx * 2 + 1, 1);
      }
    },
    ring(ctx, cx, cy, r, thick, col) {
      if (!col || r <= 0) return;
      ctx.fillStyle = col;
      cx = Math.round(cx); cy = Math.round(cy); r = Math.round(r); thick = Math.max(1, Math.round(thick));
      const rInner = Math.max(0, r - thick);
      for (let dy = -r; dy <= r; dy++) {
        const dxOuter = Math.round(Math.sqrt(Math.max(0, r * r - dy * dy)));
        const dxInner = Math.abs(dy) <= rInner ? Math.round(Math.sqrt(Math.max(0, rInner * rInner - dy * dy))) : 0;
        if (dxOuter > dxInner) {
          ctx.fillRect(cx - dxOuter, cy + dy, dxOuter - dxInner, 1);
          ctx.fillRect(cx + dxInner + 1, cy + dy, dxOuter - dxInner, 1);
        }
      }
    },
    dither(ctx, x, y, w, h, col1, col2, pattern = 'check') {
      x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
      ctx.fillStyle = col1;
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = col2;
      for (let py = y; py < y + h; py++) {
        for (let px = x; px < x + w; px++) {
          if (pattern === 'check' && (px + py) % 2 === 0) {
            ctx.fillRect(px, py, 1, 1);
          } else if (pattern === 'sparse' && (px % 2 === 0 && py % 2 === 0)) {
            ctx.fillRect(px, py, 1, 1);
          } else if (pattern === 'lines' && py % 2 === 0) {
            ctx.fillRect(px, py, 1, 1);
          }
        }
      }
    },
    bevel(ctx, x, y, w, h, hiCol, baseCol, shadowCol, darkOutline) {
      x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
      if (darkOutline) {
        ctx.fillStyle = darkOutline;
        ctx.fillRect(x, y, w, h);
        x += 1; y += 1; w -= 2; h -= 2;
      }
      ctx.fillStyle = baseCol;
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = hiCol;
      ctx.fillRect(x, y, w - 1, 1);
      ctx.fillRect(x, y, 1, h - 1);
      ctx.fillStyle = shadowCol;
      ctx.fillRect(x + 1, y + h - 1, w - 1, 1);
      ctx.fillRect(x + w - 1, y + 1, 1, h - 1);
    },
    sphere(ctx, cx, cy, r, colors) {
      cx = Math.round(cx); cy = Math.round(cy); r = Math.round(r);
      const bands = colors.length;
      for (let dy = -r; dy <= r; dy++) {
        const dxMax = Math.round(Math.sqrt(Math.max(0, r * r - dy * dy)));
        for (let dx = -dxMax; dx <= dxMax; dx++) {
          const distFromLight = Math.sqrt((dx + r * 0.35) ** 2 + (dy + r * 0.35) ** 2);
          const normDist = Math.min(0.999, distFromLight / (r * 1.8));
          const bandIdx = Math.floor(normDist * bands);
          ctx.fillStyle = colors[bandIdx];
          ctx.fillRect(cx + dx, cy + dy, 1, 1);
        }
      }
    },
    cylV(ctx, x, y, w, h, colors) {
      x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
      const bands = colors.length;
      for (let px = 0; px < w; px++) {
        const norm = px / (w - 1 || 1);
        const idx = Math.min(bands - 1, Math.floor(norm * bands));
        ctx.fillStyle = colors[idx];
        ctx.fillRect(x + px, y, 1, h);
      }
    },
    cylH(ctx, x, y, w, h, colors) {
      x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
      const bands = colors.length;
      for (let py = 0; py < h; py++) {
        const norm = py / (h - 1 || 1);
        const idx = Math.min(bands - 1, Math.floor(norm * bands));
        ctx.fillStyle = colors[idx];
        ctx.fillRect(x, y + py, w, 1);
      }
    },
    discGrooved(ctx, cx, cy, r, colBase, colSheen, colDark, angleOffset = 0) {
      cx = Math.round(cx); cy = Math.round(cy); r = Math.round(r);
      for (let dy = -r; dy <= r; dy++) {
        const dxMax = Math.round(Math.sqrt(Math.max(0, r * r - dy * dy)));
        for (let dx = -dxMax; dx <= dxMax; dx++) {
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > r) continue;
          if (dist >= r - 1) {
            ctx.fillStyle = colDark;
          } else {
            const angle = Math.atan2(dy, dx) + angleOffset;
            const sheen = Math.abs(Math.sin(angle * 2));
            ctx.fillStyle = sheen > 0.65 ? colSheen : colBase;
          }
          ctx.fillRect(cx + dx, cy + dy, 1, 1);
        }
      }
    },
    star(ctx, cx, cy, r, colCore, colSpike) {
      cx = Math.round(cx); cy = Math.round(cy); r = Math.round(r);
      Px.line(ctx, cx - r, cy, cx + r, cy, colSpike);
      Px.line(ctx, cx, cy - r, cx, cy + r, colSpike);
      Px.dot(ctx, cx, cy, colCore);
    }
  };

  // ==========================================================================
  // SECTION 1: THE 9 LITERARY MUSES SALON (32x32 Deep Relief Oil Portraits)
  // ==========================================================================
  const MUSES_DATA = [
    {
      id: 'seuss',
      name: 'Dr. Zoos',
      archetype: 'The Rhyme Master',
      bonuses: 'Short-band titles (2-5 letters) sell for +20% more.',
      frameRamp: ['#fff4a0', '#e5b836', '#9b6c14', '#4a2e06', '#140c02'],
      wallBg: '#c93448',
      wallShadow: '#7a1524',
      furRamp: ['#ffd480', '#e09838', '#9e5e18', '#4d2a08'],
      skinRamp: ['#fff2dc', '#f6d6a8', '#c99b68', '#734c28'],
      bio: 'Wears a towering red-and-white stovepipe hat with curved shading and big polka-dot silk bowtie.'
    },
    {
      id: 'poe',
      name: 'Edgar Allan Chimp',
      archetype: 'The Gothic Mystery',
      bonuses: 'Typists work 25% faster at night.',
      frameRamp: ['#d5c8e8', '#8a74a8', '#4c3966', '#251738', '#0c0714'],
      wallBg: '#2a1e42',
      wallShadow: '#150d24',
      furRamp: ['#635c70', '#3b3447', '#201b2b', '#0c0912'],
      skinRamp: ['#ded1c5', '#bda897', '#7d695c', '#40332a'],
      bio: 'Midnight velvet coat with folded cravat, dark brooding gaze, and an iridescent black raven quill.'
    },
    {
      id: 'dick',
      name: 'Emily Dickinsimian',
      archetype: 'The Recluse Lyricist',
      bonuses: 'Every typist leans toward vowels after a consonant.',
      frameRamp: ['#ffd2e2', '#d982a0', '#8c3d57', '#421624', '#17060c'],
      wallBg: '#d66b88',
      wallShadow: '#853248',
      furRamp: ['#b88258', '#8a5a32', '#593418', '#2e1608'],
      skinRamp: ['#fff6ee', '#fed9b6', '#c99975', '#734a30'],
      bio: 'Exquisite openwork white lace bonnet with shaded lilac ribbons and a pressed dried rose petal.'
    },
    {
      id: 'hemi',
      name: 'Ernest Hemingwape',
      archetype: 'The Sea Adventurer',
      bonuses: 'Word keepers bank twice as fast.',
      frameRamp: ['#dceaf8', '#6fa3d8', '#345e8c', '#152d47', '#06111f'],
      wallBg: '#3b70a8',
      wallShadow: '#1e3e63',
      furRamp: ['#a6a0a3', '#6a6568', '#403d3f', '#1c1b1c'],
      skinRamp: ['#ffd8b3', '#e0aa76', '#a36d40', '#5e371b'],
      bio: 'Thick cream cable-knit fisherman sweater, salt-and-pepper dimensional beard, and rugged sea captain cap.'
    },
    {
      id: 'christie',
      name: 'Agatha Chrisbanana',
      archetype: 'The Poisoner Plotter',
      bonuses: 'Unlocks rare letter combos (+50% bonus).',
      frameRamp: ['#eedcc4', '#bda078', '#6e5434', '#382612', '#140c04'],
      wallBg: '#5a3d24',
      wallShadow: '#29180b',
      furRamp: ['#d9a05b', '#9c6628', '#5e3910', '#2b1704'],
      skinRamp: ['#ffeedb', '#e8c49e', '#ab7e54', '#59381c'],
      bio: 'Victorian houndstooth tweed, polished brass monocle, and a string of lustrous shaded pearls.'
    },
    {
      id: 'woolf',
      name: 'Virginia Woolfkin',
      archetype: 'Stream of Consciousness',
      bonuses: 'Flow state meter fills twice as fast.',
      frameRamp: ['#daf2e8', '#85c2a8', '#3d7860', '#183b2d', '#05140d'],
      wallBg: '#2d634e',
      wallShadow: '#133327',
      furRamp: ['#8a7b6b', '#5c4e40', '#362c22', '#17120c'],
      skinRamp: ['#faede1', '#dabfa8', '#9e7d64', '#543d2c'],
      bio: 'Draped sage silk scarf, distant visionary expression, and a miniature silver lighthouse brooch.'
    },
    {
      id: 'austen',
      name: 'Jane Apesten',
      archetype: 'The Wit Chronicler',
      bonuses: 'Romance & comedy letter genres yield double royalties.',
      frameRamp: ['#ffecd9', '#e0a975', '#8c5220', '#422005', '#140800'],
      wallBg: '#945b36',
      wallShadow: '#4a2610',
      furRamp: ['#c48b5a', '#8a5529', '#4d2b0e', '#211003'],
      skinRamp: ['#fff4ea', '#fcd2b3', '#c9946d', '#6e4527'],
      bio: 'Regency high-crowned bonnet with pleated lace ruff and an envelope sealed with red wax.'
    },
    {
      id: 'tolken',
      name: 'J.R.R. Tolkong',
      archetype: 'The Myth Weaver',
      bonuses: 'Unlocks ancient runic characters that multiply streak multipliers.',
      frameRamp: ['#e4f0dc', '#98ba82', '#4b6e36', '#223814', '#081204'],
      wallBg: '#3d5c2e',
      wallShadow: '#192b11',
      furRamp: ['#787268', '#4f4a43', '#2e2b26', '#12110f'],
      skinRamp: ['#faeedc', '#debfa0', '#a17e5c', '#543b24'],
      bio: 'Smoking a hand-carved briarwood pipe with glowing cherry ember and green woodland tweed vest.'
    },
    {
      id: 'twain',
      name: 'Mark Twainana',
      archetype: 'The Frontier Satirist',
      bonuses: 'Typing critical hits trigger cascading banana bursts.',
      frameRamp: ['#f2e8d5', '#bfab8a', '#736145', '#382c1a', '#140e06'],
      wallBg: '#615038',
      wallShadow: '#302618',
      furRamp: ['#ffffff', '#ded9cf', '#9c9587', '#47433c'],
      skinRamp: ['#ffebd4', '#e0bfa2', '#a67d5c', '#5e3f28'],
      bio: 'Crisp white linen three-piece suit, black string tie, and an unmistakable bushy white walrus mustache.'
    }
  ];

  function renderMusePortrait(museId, scale = 2, frame = 0) {
    const data = MUSES_DATA.find(m => m.id === museId) || MUSES_DATA[0];
    const w = 32, h = 32;
    const cv = makeCanvas(w * scale, h * scale);
    if (cv._mock) return cv;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const buf = makeCanvas(w, h);
    const bCtx = buf.getContext('2d');
    bCtx.imageSmoothingEnabled = false;

    const f = frame % 8;

    // 1. Ornate Multi-Tiered Gilded Frame with Moving Specular Gleam
    const fRamp = data.frameRamp;
    Px.rect(bCtx, 0, 0, 32, 32, fRamp[4]);
    Px.bevel(bCtx, 1, 1, 30, 30, fRamp[0], fRamp[1], fRamp[3]);
    Px.bevel(bCtx, 2, 2, 28, 28, fRamp[1], fRamp[2], fRamp[4]);
    Px.bevel(bCtx, 3, 3, 26, 26, fRamp[3], fRamp[4], fRamp[4]);

    // Diagonal Frame Specular Gleam Sweep (Moving highlight around frame)
    const gleamPos = (f * 4) % 28;
    Px.dot(bCtx, 2 + gleamPos, 2, '#ffffff');
    Px.dot(bCtx, 3 + gleamPos, 2, '#fffbe0');
    Px.dot(bCtx, 2, 2 + gleamPos, '#ffffff');

    // Salon Wallpaper Background
    Px.rect(bCtx, 4, 4, 24, 24, data.wallBg);
    Px.dither(bCtx, 4, 4, 24, 24, data.wallBg, data.wallShadow, 'check');

    // Ambient wallpaper light motes / candle flicker
    if (f % 2 === 0) {
      Px.dot(bCtx, 6, 8, '#ffffff18');
      Px.dot(bCtx, 25, 9, '#ffffff18');
    }

    // Shadow cast onto background from monkey head & shoulders
    Px.sphere(bCtx, 16, 17, 7, ['#00000033', '#00000055', '#00000088']);

    // 2. Monkey Torso & Garment with 3D Fold Shading
    Px.rect(bCtx, 9, 23, 14, 5, '#0d0705');
    Px.rect(bCtx, 10, 22, 12, 5, '#1e140d');
    Px.line(bCtx, 10, 22, 14, 22, '#3a2719');
    Px.line(bCtx, 18, 26, 22, 26, '#080402');

    // Shirt bib / collar
    Px.rect(bCtx, 14, 21, 4, 4, '#e6e4dc');
    Px.line(bCtx, 14, 21, 15, 24, '#ffffff');
    Px.line(bCtx, 16, 22, 16, 24, '#b0ada3');

    // 3. Sculpted Primate Head Anatomy (5-Tone Volumetric Fur & Skin)
    const fur = data.furRamp, skin = data.skinRamp;

    // Ears
    Px.sphere(bCtx, 10, 15, 2.5, [fur[0], fur[1], fur[2], fur[3]]);
    Px.sphere(bCtx, 22, 15, 2.5, [fur[1], fur[2], fur[2], fur[3]]);
    Px.dot(bCtx, 10, 15, skin[2]); Px.dot(bCtx, 9, 15, skin[0]);
    Px.dot(bCtx, 22, 15, skin[3]); Px.dot(bCtx, 21, 15, skin[1]);

    // Head Cranium Ball
    Px.sphere(bCtx, 16, 15, 5.5, [fur[0], fur[1], fur[2], fur[3]]);

    // Heart-Shaped Face Mask
    Px.sphere(bCtx, 14, 15, 3.2, [skin[0], skin[1], skin[2], skin[3]]);
    Px.sphere(bCtx, 18, 15, 3.2, [skin[1], skin[2], skin[2], skin[3]]);
    // Muzzle / Snout Projection
    Px.cylH(bCtx, 13, 17, 7, 3, [skin[0], skin[1], skin[2]]);
    Px.line(bCtx, 13, 19, 19, 19, skin[3]);

    // Expressive Eyes: Natural blink cycle on frame 4
    const isBlinking = (f === 4);
    if (isBlinking) {
      // Eyelid Closed Crease
      Px.line(bCtx, 13, 14, 15, 14, skin[3]);
      Px.line(bCtx, 17, 14, 19, 14, skin[3]);
      Px.dot(bCtx, 14, 15, skin[1]); Px.dot(bCtx, 18, 15, skin[1]);
    } else {
      // Eyes Open with Glistening Highlights
      Px.rect(bCtx, 13, 14, 2, 2, '#ffffff');
      Px.rect(bCtx, 17, 14, 2, 2, '#ffffff');
      Px.line(bCtx, 13, 14, 14, 14, '#1a100a');
      Px.line(bCtx, 17, 14, 18, 14, '#1a100a');
      Px.dot(bCtx, 14, 15, '#0a0502');
      Px.dot(bCtx, 18, 15, '#0a0502');
      Px.dot(bCtx, 13, 15, '#d4ecff');
      Px.dot(bCtx, 17, 15, '#d4ecff');
    }

    // Nose & Smile
    Px.dot(bCtx, 15, 17, skin[3]); Px.dot(bCtx, 16, 17, skin[3]);
    Px.line(bCtx, 14, 18, 17, 18, '#4a2012');
    Px.dot(bCtx, 15, 19, skin[1]);

    // 4. Muse-Specific Clothing & Animations
    if (data.id === 'seuss') {
      const hatSway = Math.round(Math.sin(f * Math.PI / 4) * 0.8);
      // Stovepipe Hat
      Px.cylV(bCtx, 13 + hatSway, 2, 6, 9, ['#ff5959', '#e02828', '#b51616', '#730b0b']);
      Px.cylV(bCtx, 13 + hatSway, 4, 6, 2, ['#ffffff', '#e8e8e8', '#b8b8b8', '#787878']);
      Px.cylV(bCtx, 13 + hatSway, 8, 6, 2, ['#ffffff', '#e8e8e8', '#b8b8b8', '#787878']);
      Px.bevel(bCtx, 11, 10, 10, 2, '#ff8080', '#e02828', '#730b0b');
      // Silk Bowtie (Pulsing bow wings)
      const bowWidth = (f % 2 === 0) ? 11 : 10;
      Px.bevel(bCtx, 16 - Math.floor(bowWidth/2), 21, bowWidth, 3, '#fff4a0', '#ffd23a', '#9e7408');
      Px.dot(bCtx, 16, 22, '#e02828'); Px.dot(bCtx, 13, 22, '#e02828'); Px.dot(bCtx, 18, 22, '#e02828');

    } else if (data.id === 'poe') {
      // Midnight velvet coat with lapels
      Px.bevel(bCtx, 11, 21, 10, 5, '#3d344a', '#1e1826', '#0a070e');
      Px.line(bCtx, 15, 21, 16, 25, '#ffffff');
      // Iridescent Raven on Shoulder Fluttering Wing
      const flutter = (f % 4 < 2) ? 1 : 0;
      Px.line(bCtx, 20, 21, 26, 13 - flutter, '#1a1824');
      Px.line(bCtx, 21, 19, 25, 14 - flutter, '#6b5ce7');
      Px.dot(bCtx, 25, 13 - flutter, '#dcd6f7');
      // Flickering Gothic Candle in Background
      const flameFlicker = (f % 3 === 0) ? 0 : (f % 3 === 1 ? -1 : 1);
      Px.rect(bCtx, 25, 8, 2, 4, '#ded9d5');
      Px.dot(bCtx, 26, 7 + flameFlicker, '#ffd23a');
      Px.dot(bCtx, 26, 6 + flameFlicker, '#ffffff');

    } else if (data.id === 'dick') {
      // Openwork lace bonnet with dither pattern
      Px.dither(bCtx, 11, 10, 10, 4, '#ffffff', '#e0d8df', 'check');
      Px.ring(bCtx, 16, 14, 6, 1.5, '#ffffff');
      // Silken ribbons swaying
      const ribSway = Math.round(Math.sin(f * Math.PI / 4) * 1.2);
      Px.line(bCtx, 11, 15, 10 + ribSway, 23, '#f08aa4');
      Px.line(bCtx, 21, 15, 22 + ribSway, 23, '#f08aa4');
      Px.dot(bCtx, 10 + ribSway, 23, '#ffc2d1'); Px.dot(bCtx, 22 + ribSway, 23, '#ffc2d1');
      // Pressed Rose Petal Glint
      if (f % 4 === 2) {
        Px.star(bCtx, 16, 23, 2, '#ffffff', '#ffd2e2');
      }

    } else if (data.id === 'hemi') {
      // Cable-knit fisherman sweater
      Px.dither(bCtx, 10, 21, 12, 6, '#f7f4ea', '#cfc8b6', 'lines');
      Px.line(bCtx, 13, 20, 19, 20, '#594d3d');
      // Salt-and-pepper dimensional mustache & beard
      Px.dither(bCtx, 13, 17, 7, 3, '#ffffff', '#615f5c', 'check');
      // Navy fisherman cap
      Px.bevel(bCtx, 12, 8, 8, 4, '#4a759c', '#2b4d6b', '#122536');
      Px.dot(bCtx, 16, 10, '#ffd23a');
      // Bilowing Sea Captain Pipe Smoke
      const smokeY = 16 - ((f * 2) % 12);
      const smokeX = 22 + Math.round(Math.sin(f * 0.7) * 2);
      Px.ring(bCtx, smokeX, smokeY, 2 + (f % 3), 1, '#ffffff66');
      Px.dot(bCtx, smokeX, smokeY, '#ffffff99');

    } else if (data.id === 'christie') {
      // Houndstooth tweed coat
      Px.dither(bCtx, 10, 21, 12, 6, '#473c2b', '#c2b39b', 'check');
      // Gleaming pearl necklace
      [13, 15, 17, 19].forEach(x => { Px.dot(bCtx, x, 22, '#ffffff'); Px.dot(bCtx, x, 23, '#a3a099'); });
      // Polished Monocle with Rotating Lens Glint
      Px.ring(bCtx, 18, 14, 2.5, 1, '#ffd23a');
      const glintX = 17 + Math.round(Math.cos(f * Math.PI / 4));
      const glintY = 14 + Math.round(Math.sin(f * Math.PI / 4));
      Px.dot(bCtx, glintX, glintY, '#ffffff');
      Px.line(bCtx, 20, 16, 21, 20, '#d4af37');

    } else if (data.id === 'woolf') {
      // Sage green draped silk scarf
      Px.bevel(bCtx, 11, 20, 10, 4, '#8ee0b2', '#4ea375', '#205237');
      // Carved silver lighthouse brooch with sweeping beam
      Px.bevel(bCtx, 15, 21, 3, 3, '#ffffff', '#cbd4de', '#57626e');
      Px.dot(bCtx, 16, 22, '#ffd23a');
      // Sweeping Lighthouse Beacon in Night Sky Background
      const beamAngle = f * (Math.PI / 4);
      const bx = 16 + Math.round(Math.cos(beamAngle) * 9);
      const by = 8 + Math.round(Math.sin(beamAngle) * 4);
      Px.line(bCtx, 16, 8, bx, by, '#ffffff44');
      Px.dot(bCtx, bx, by, '#fff7a8');

    } else if (data.id === 'austen') {
      // Regency bonnet with pleated lace frill
      Px.ring(bCtx, 16, 12, 6, 2, '#f2b23a');
      Px.dither(bCtx, 10, 11, 12, 2, '#fff4a0', '#c98f0e', 'check');
      // Sealed manuscript scroll with pulsing crimson seal
      Px.rect(bCtx, 13, 22, 5, 3, '#fff6d6');
      const sealGlint = (f % 2 === 0) ? '#ff3b30' : '#c91c1c';
      Px.dot(bCtx, 15, 23, sealGlint);
      // Delicate Steam from English Afternoon Tea
      const steamY = 22 - (f % 6);
      Px.dot(bCtx, 24 + Math.round(Math.sin(f * 0.8)), steamY, '#ffffff77');

    } else if (data.id === 'tolken') {
      // Herringbone tweed vest
      Px.dither(bCtx, 11, 21, 10, 6, '#5a3d24', '#8a623e', 'lines');
      // Carved briarwood pipe with glowing cherry ember & magical rune smoke
      Px.line(bCtx, 17, 18, 22, 19, '#42240c');
      Px.bevel(bCtx, 22, 17, 3, 4, '#8a4c19', '#42240c', '#1f0d02');
      const emberCol = (f % 2 === 0) ? '#ff6600' : '#ff2200';
      Px.dot(bCtx, 23, 17, emberCol);
      // Floating glowing elven rune sparkles
      const runeY = 15 - ((f * 2) % 10);
      const runeCol = (f % 2 === 0) ? '#ffd23a' : '#76e5d8';
      Px.dot(bCtx, 24 + (f % 3), runeY, runeCol);

    } else if (data.id === 'twain') {
      // White three-piece linen suit with black bow tie
      Px.bevel(bCtx, 10, 21, 12, 6, '#ffffff', '#e8eef5', '#8a9aa8');
      Px.dot(bCtx, 15, 21, '#100c14'); Px.dot(bCtx, 16, 21, '#100c14');
      // Voluminous white hair & walrus mustache
      Px.sphere(bCtx, 11, 13, 3.2, ['#ffffff', '#ffffff', '#e0e7f0', '#94a2b3']);
      Px.sphere(bCtx, 21, 13, 3.2, ['#ffffff', '#ffffff', '#e0e7f0', '#94a2b3']);
      const musShift = Math.round(Math.sin(f * Math.PI / 4) * 0.6);
      Px.bevel(bCtx, 13, 17 + musShift, 7, 3, '#ffffff', '#f0f4f8', '#9bb0c4');
      // Cigar Tip Glow and Puff
      const cigarTip = (f % 3 === 0) ? '#ff3b30' : (f % 3 === 1 ? '#ff9500' : '#8e8e93');
      Px.dot(bCtx, 20, 19, cigarTip);
      Px.dot(bCtx, 21, 18 - (f % 4), '#cfd8dc88');
    }

    ctx.drawImage(buf, 0, 0, w * scale, h * scale);
    return cv;
  }

  // ==========================================================================
  // SECTION 2: THE 5 IMI MEDIA STUDIO DIVISIONS (48x48 Volumetric Hardware)
  // ==========================================================================
  const STUDIOS_DATA = [
    {
      id: 'records',
      name: 'Jungle Records',
      unit: 'Vinyl Single',
      tagline: 'Vintage 45 RPM Vinyl, Gramophone Horn & Lyric Spools',
      color: '#ff5d73',
      hardware: 'phonograph'
    },
    {
      id: 'tv',
      name: 'Canopy TV',
      unit: 'Episode',
      tagline: 'Mid-Century Mahogany CRT Television & Broadcast Antennas',
      color: '#ffd23a',
      hardware: 'crt_tv'
    },
    {
      id: 'radio',
      name: 'Vine Radio',
      unit: 'Radio Play',
      tagline: 'Art Deco Cathedral Tube Radio with Amber Tuning Scale',
      color: '#7be05a',
      hardware: 'cathedral_radio'
    },
    {
      id: 'sketch',
      name: 'Monkey Business Troupe',
      unit: 'Stage Sketch',
      tagline: 'Vaudeville Proscenium Arch, Red Curtains & Theatrical Masks',
      color: '#4cc9f0',
      hardware: 'theater_stage'
    },
    {
      id: 'film',
      name: 'IMI Pictures',
      unit: 'Feature Film',
      tagline: 'Golden-Age 35mm Cine Camera on Tripod & Director Clapperboard',
      color: '#c39bff',
      hardware: 'cine_camera'
    }
  ];

  function renderStudioHardware(studioId, scale = 2, frame = 0) {
    const data = STUDIOS_DATA.find(s => s.id === studioId) || STUDIOS_DATA[0];
    const w = 48, h = 48;
    const cv = makeCanvas(w * scale, h * scale);
    if (cv._mock) return cv;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const buf = makeCanvas(w, h);
    const bCtx = buf.getContext('2d');
    bCtx.imageSmoothingEnabled = false;

    const f = frame % 8;

    // Cast Shadow
    Px.rect(bCtx, 6, 43, 36, 3, '#070a08');
    Px.dither(bCtx, 4, 44, 40, 2, '#070a08', '#00000000', 'check');

    if (data.hardware === 'phonograph') {
      // Plinth
      Px.bevel(bCtx, 7, 28, 34, 15, '#8a4b22', '#4a250e', '#1e0c04', '#0d0501');
      Px.bevel(bCtx, 11, 32, 26, 8, '#703b1a', '#3d1d09', '#170902');
      Px.dither(bCtx, 12, 33, 24, 6, '#47220c', '#301606', 'check');

      // Brass turn crank
      Px.line(bCtx, 4, 34, 7, 34, '#ffd23a');
      Px.bevel(bCtx, 3, 31, 3, 6, '#fff4a0', '#d4af37', '#73570c');

      // Turntable Felt Platen & Spinning 45 RPM Vinyl Disc!
      Px.bevel(bCtx, 13, 24, 24, 4, '#54545c', '#202026', '#0d0d12');
      // Concentric rotating vinyl reflection
      const rotAngle = f * (Math.PI / 4);
      Px.discGrooved(bCtx, 25, 25, 9, '#202026', '#737385', '#0d0d12', rotAngle);
      // Red record center label
      Px.circle(bCtx, 25, 25, 2.5, '#e02828');
      Px.dot(bCtx, 25, 25, '#ffd23a');

      // Vibrating needle head
      const needleJitter = (f % 2 === 0) ? 0 : 0.5;
      Px.cylH(bCtx, 33, 16, 3, 10, ['#fff4a0', '#ffd23a', '#9e7408', '#422f02']);
      Px.line(bCtx, 33, 17, 28, 23 + needleJitter, '#d4af37');
      Px.sphere(bCtx, 28, 23 + needleJitter, 2, ['#ffffff', '#ffd23a', '#9e7408', '#422f02']);

      // Fluted Morning-Glory Horn
      Px.sphere(bCtx, 18, 12, 11, ['#fffbe0', '#ffd23a', '#c78f16', '#614003', '#1f1300']);
      for (let k = 0; k < 8; k++) {
        const a = k * Math.PI / 4;
        const rx = 18 + Math.cos(a) * 10, ry = 12 + Math.sin(a) * 10;
        Px.dot(bCtx, rx, ry, '#fffbe0');
      }
      Px.sphere(bCtx, 18, 12, 6, ['#8a5e0b', '#3d2602', '#1a0f00', '#0a0500']);

      // Animated floating musical notes floating up from the horn!
      const noteColors = ['#ff5d73', '#ffd23a', '#4cc9f0', '#7be05a'];
      for (let ni = 0; ni < 3; ni++) {
        const noteProgress = ((f * 2 + ni * 6) % 16);
        const ny = 12 - noteProgress;
        const nx = 18 - 8 + Math.round(Math.sin((f + ni) * 0.8) * 4);
        if (ny > 1 && ny < 14) {
          const nc = noteColors[(f + ni) % 4];
          Px.dot(bCtx, nx, ny, nc);
          Px.line(bCtx, nx, ny, nx, ny - 2, nc);
          Px.dot(bCtx, nx + 1, ny - 2, nc);
        }
      }

    } else if (data.hardware === 'crt_tv') {
      // Walnut Console Cabinet
      Px.bevel(bCtx, 6, 10, 36, 30, '#8a5229', '#4d2b12', '#1f0e04', '#0d0501');
      Px.line(bCtx, 9, 40, 6, 45, '#2e1808'); Px.dot(bCtx, 6, 45, '#ffd23a');
      Px.line(bCtx, 38, 40, 41, 45, '#2e1808'); Px.dot(bCtx, 41, 45, '#ffd23a');

      // Rabbit-Ear Antennas with Electric Spark Flash on frame 2 & 6!
      Px.line(bCtx, 24, 10, 14, 2, '#d4d8e3'); Px.dot(bCtx, 14, 2, '#ffffff');
      Px.line(bCtx, 24, 10, 34, 2, '#d4d8e3'); Px.dot(bCtx, 34, 2, '#ffffff');
      if (f === 2 || f === 6) {
        Px.star(bCtx, 14, 2, 2, '#ffffff', '#76dbf7');
        Px.star(bCtx, 34, 2, 2, '#ffffff', '#76dbf7');
      }

      // Recessed CRT Bezel
      Px.bevel(bCtx, 9, 13, 23, 23, '#1a242e', '#0d131a', '#05070a');
      // Glass screen with phosphor flicker
      const screenBg = (f % 2 === 0) ? '#1a3347' : '#1d3a52';
      Px.rect(bCtx, 11, 15, 19, 19, screenBg);

      // Active Rolling Scanline Band!
      const scanY = 15 + ((f * 3) % 18);
      Px.line(bCtx, 11, scanY, 29, scanY, '#7cc4f788');
      Px.line(bCtx, 11, Math.min(33, scanY + 1), 29, Math.min(33, scanY + 1), '#ffffff55');

      // Test Broadcast Monkey Face on Screen
      Px.circle(bCtx, 20, 25, 4, '#e0aa76');
      Px.dot(bCtx, 19, 24, '#0f1a24'); Px.dot(bCtx, 21, 24, '#0f1a24');
      Px.line(bCtx, 19, 26, 21, 26, '#0f1a24');

      // Dials & Speaker Slats
      Px.bevel(bCtx, 33, 14, 7, 21, '#613b1c', '#381f0c', '#140902');
      Px.sphere(bCtx, 36, 18, 2.5, ['#fff4a0', '#ffd23a', '#9e7408', '#422f02']);
      Px.sphere(bCtx, 36, 24, 2.5, ['#fff4a0', '#ffd23a', '#9e7408', '#422f02']);
      Px.line(bCtx, 34, 29, 38, 29, '#140902');
      Px.line(bCtx, 34, 31, 38, 31, '#140902');

    } else if (data.hardware === 'cathedral_radio') {
      // Art Deco Cathedral Radio Cabinet
      Px.sphere(bCtx, 24, 18, 16, ['#96582a', '#613514', '#3b1d08', '#140701']);
      Px.bevel(bCtx, 8, 18, 32, 23, '#8a4e22', '#542d10', '#241003');

      // Speaker Grille Cloth
      Px.dither(bCtx, 13, 10, 22, 16, '#96784d', '#4d3a20', 'check');
      Px.line(bCtx, 24, 10, 24, 25, '#2e190a');
      Px.line(bCtx, 18, 15, 30, 15, '#2e190a');
      Px.ring(bCtx, 24, 14, 3, 1, '#2e190a');

      // Pulsing Amber Tuning Dial
      Px.bevel(bCtx, 15, 27, 18, 6, '#170c04', '#0a0501', '#000000');
      const amberHi = (f % 2 === 0) ? '#fff8b3' : '#fff4a0';
      Px.cylH(bCtx, 16, 28, 16, 4, [amberHi, '#ffaa2b', '#c7700e', '#592e02']);
      Px.line(bCtx, 17, 30, 31, 30, '#592e02');
      // Needle slight wobble
      const needleX = 23 + (f % 3);
      Px.line(bCtx, needleX, 28, needleX, 31, '#ff2222');

      // Bakelite Knobs
      [14, 24, 34].forEach(kx => {
        Px.sphere(bCtx, kx, 37, 2.5, ['#fff4a0', '#d4af37', '#73570c', '#2b1f02']);
      });

      // Animated Expanding Broadcast Radio Soundwaves!
      const waveR1 = 4 + (f % 4) * 2;
      const waveR2 = 4 + ((f + 2) % 4) * 2;
      Px.ring(bCtx, 24, 5, waveR1, 1, '#7be05a');
      Px.ring(bCtx, 24, 5, waveR2, 1, '#7be05a66');

    } else if (data.hardware === 'theater_stage') {
      // Proscenium Columns & Arch
      Px.bevel(bCtx, 4, 6, 7, 36, '#ffd23a', '#b58312', '#543b02');
      Px.bevel(bCtx, 37, 6, 7, 36, '#ffd23a', '#b58312', '#543b02');
      Px.bevel(bCtx, 4, 4, 40, 5, '#fff4a0', '#d4af37', '#73570c');

      // Stage Planks
      Px.bevel(bCtx, 7, 36, 34, 7, '#d49b5d', '#8c5a27', '#3d2209');
      for (let px = 11; px <= 37; px += 6) Px.line(bCtx, px, 36, px, 42, '#3d2209');

      // Alternating Chasing Footlight Marquee Bulbs!
      let lightIdx = 0;
      for (let fx = 11; fx <= 37; fx += 6) {
        const isOn = (lightIdx % 2 === f % 2);
        const bulbRamp = isOn
          ? ['#ffffff', '#fff4a0', '#ffd23a', '#e5b836']
          : ['#fff4a0', '#b38004', '#664700', '#2e1f00'];
        Px.sphere(bCtx, fx, 39, 1.8, bulbRamp);
        if (isOn) Px.dot(bCtx, fx, 38, '#ffffff');
        lightIdx++;
      }

      // Crimson Curtains with Gentle Velvet Sway
      const curtainShift = Math.round(Math.sin(f * Math.PI / 4) * 0.8);
      Px.dither(bCtx, 11 + curtainShift, 7, 9, 23, '#c91e3b', '#73091c', 'lines');
      Px.dither(bCtx, 28 - curtainShift, 7, 9, 23, '#c91e3b', '#73091c', 'lines');
      Px.line(bCtx, 11 + curtainShift, 30, 20 + curtainShift, 30, '#ffd23a');
      Px.line(bCtx, 28 - curtainShift, 30, 37 - curtainShift, 30, '#ffd23a');

      // Top Valance
      [16, 24, 32].forEach(vx => {
        Px.sphere(bCtx, vx, 9, 4.5, ['#ff4d6a', '#c91e3b', '#6b0819', '#2b0108']);
      });

      // Drama Masks with Alternating Wink
      Px.sphere(bCtx, 21, 21, 3.5, ['#fff4a0', '#ffd23a', '#9e7408', '#422f02']);
      Px.dot(bCtx, 20, 20, '#1a0e02'); Px.dot(bCtx, 22, 20, '#1a0e02');
      Px.line(bCtx, 20, 22, 22, 22, '#c91e3b');
      Px.sphere(bCtx, 27, 23, 3.5, ['#ffffff', '#b8c7d9', '#596d85', '#1a2838']);
      Px.dot(bCtx, 26, 22, '#0c1621'); Px.dot(bCtx, 28, 22, '#0c1621');
      Px.dot(bCtx, 27, 24, '#0c1621');

    } else if (data.hardware === 'cine_camera') {
      // Tripod Legs
      Px.line(bCtx, 24, 27, 11, 46, '#bf8243'); Px.line(bCtx, 24, 27, 10, 46, '#73461a');
      Px.line(bCtx, 24, 27, 24, 46, '#a66d33'); Px.line(bCtx, 25, 27, 25, 46, '#5e340e');
      Px.line(bCtx, 24, 27, 37, 46, '#bf8243'); Px.line(bCtx, 25, 27, 38, 46, '#73461a');

      // Camera Body
      Px.bevel(bCtx, 15, 14, 18, 14, '#474754', '#25252e', '#111117', '#08080a');
      Px.dither(bCtx, 16, 15, 16, 12, '#2d2d38', '#1c1c24', 'check');

      // Dual Film Magazine Circles with Rotating 3-Spoke Reels!
      const reelAngle = f * (Math.PI / 4);
      [20, 28].forEach(rx => {
        Px.sphere(bCtx, rx, 10, 5, ['#6b6b7a', '#3b3b47', '#1a1a21', '#0b0b0e']);
        for (let sp = 0; sp < 3; sp++) {
          const sa = reelAngle + sp * (Math.PI * 2 / 3);
          Px.line(bCtx, rx, 10, rx + Math.round(Math.cos(sa) * 3), 10 + Math.round(Math.sin(sa) * 3), '#ffffff');
        }
      });

      // Front Lens Projecting Pulsating Volumetric Light Beam!
      Px.cylH(bCtx, 7, 18, 8, 6, ['#fff4a0', '#d4af37', '#8a650c', '#3b2901']);
      Px.bevel(bCtx, 5, 17, 3, 8, '#ffffff', '#b8b8c4', '#42424d');
      Px.sphere(bCtx, 6, 21, 2.5, ['#ffffff', '#76dbf7', '#167a9e', '#062d3d']);

      // Light beam forward with animated dust motes
      const beamIntensity = (f % 2 === 0) ? '#fff8b344' : '#fff4a022';
      Px.line(bCtx, 5, 19, 0, 16, beamIntensity);
      Px.line(bCtx, 5, 23, 0, 26, beamIntensity);
      Px.dot(bCtx, 2, 20 + Math.round(Math.sin(f * 0.9)), '#ffffff88');

      // Rotating Hand Crank
      const crankAngle = f * (Math.PI / 4);
      const chX = 27 + Math.round(Math.cos(crankAngle) * 4);
      const chY = 20 + Math.round(Math.sin(crankAngle) * 4);
      Px.line(bCtx, 27, 20, chX, chY, '#d4af37');
      Px.dot(bCtx, chX, chY, '#bf8243');

      // Clapperboard
      Px.bevel(bCtx, 32, 29, 13, 11, '#ffffff', '#e8e8e3', '#73736b');
      Px.rect(bCtx, 32, 28, 13, 3, '#100c14');
      Px.line(bCtx, 33, 28, 35, 30, '#ffffff');
      Px.line(bCtx, 37, 28, 39, 30, '#ffffff');
      Px.line(bCtx, 41, 28, 43, 30, '#ffffff');
      Px.line(bCtx, 34, 33, 42, 33, '#242429');
      Px.line(bCtx, 34, 36, 40, 36, '#242429');
    }

    ctx.drawImage(buf, 0, 0, w * scale, h * scale);
    return cv;
  }

  // ==========================================================================
  // SECTION 3: BOTANICAL LETTER GARDEN (32x32 Deep Growth & Agricultural Tools)
  // ==========================================================================
  const GARDEN_STAGES = [
    { id: 'seed_packet', name: 'Letter Seed Packet', desc: 'Craft paper seed envelope containing rare phonetic spores' },
    { id: 'soil_empty', name: 'Tilled Furrow Plot', desc: 'Fertile loamy garden soil with carved wooden corner stakes' },
    { id: 'sprout', name: 'Sprouting Letter Cotyledon', desc: 'Young twin leaves uncurling from the dark humus' },
    { id: 'budding', name: 'Budding Alphabet Vine', desc: 'Tender twisting vine with alphabet calyx swelling' },
    { id: 'blooming', name: 'Ripe Alphabet Harvest Bloom', desc: 'Glistening golden letter flower ready to be plucked (+yield)' },
    { id: 'watering_can', name: 'Galvanized Watering Can', desc: 'Tin sprinkle vessel that nourishes growing letter plots' }
  ];

  function renderGardenAsset(assetId, char = 'E', scale = 2, frame = 0) {
    const w = 32, h = 32;
    const cv = makeCanvas(w * scale, h * scale);
    if (cv._mock) return cv;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const buf = makeCanvas(w, h);
    const bCtx = buf.getContext('2d');
    bCtx.imageSmoothingEnabled = false;

    const f = frame % 8;

    if (assetId === 'seed_packet') {
      // Kraft Paper Envelope
      Px.rect(bCtx, 8, 4, 18, 25, '#17120a');
      Px.bevel(bCtx, 7, 3, 18, 25, '#f0e2ba', '#c7b385', '#6b5c3b', '#261f12');
      Px.dither(bCtx, 8, 4, 16, 23, '#d4c294', '#baa77b', 'check');

      // Envelope flap
      Px.line(bCtx, 7, 3, 16, 10, '#8c774d');
      Px.line(bCtx, 24, 3, 16, 10, '#8c774d');
      Px.line(bCtx, 8, 11, 23, 11, '#54462a');

      // Botanical Seed Engraving Medallion
      Px.sphere(bCtx, 16, 17, 5, ['#88db8d', '#3ea645', '#1c6321', '#0b2b0e']);
      bCtx.fillStyle = '#ffffff';
      bCtx.font = 'bold 8px monospace';
      bCtx.textAlign = 'center';
      bCtx.textBaseline = 'middle';
      bCtx.fillText(char, 16, 17);

      Px.line(bCtx, 13, 24, 19, 24, '#c91c1c');

      // Sparkling Phonetic Seed Motes Floating from Envelope Opening!
      const sporeProgress = f % 8;
      const spY = 8 - sporeProgress;
      const spX = 16 + Math.round(Math.sin(f * 0.9) * 5);
      Px.star(bCtx, spX, spY, 1.5, '#ffffff', '#ffd23a');

    } else if (assetId === 'soil_empty') {
      // Cedar Timber Garden Bed
      Px.bevel(bCtx, 2, 2, 28, 28, '#a66b37', '#6b3f1c', '#2e1708', '#120701');
      Px.rect(bCtx, 5, 5, 22, 22, '#1a0d05');
      Px.dither(bCtx, 5, 5, 22, 22, '#2b160a', '#140a04', 'check');

      [10, 16, 22].forEach(fy => {
        Px.line(bCtx, 6, fy, 25, fy, '#0a0401');
        Px.line(bCtx, 6, fy + 1, 25, fy + 1, '#3b1f0f');
      });
      Px.dot(bCtx, 9, 8, '#706b63'); Px.dot(bCtx, 21, 13, '#706b63');
      Px.dot(bCtx, 14, 20, '#8f745d');

      // Corner Nails
      [[3,3], [27,3], [3,27], [27,27]].forEach(([nx, ny]) => {
        Px.dot(bCtx, nx, ny, '#ffffff'); Px.dot(bCtx, nx + 1, ny + 1, '#2e353d');
      });

      // Animated Cute Earthworm Poking Out on frames 2..5!
      if (f >= 2 && f <= 5) {
        const wormH = (f === 2 || f === 5) ? 2 : 4;
        Px.rect(bCtx, 15, 16 - wormH, 2, wormH, '#ff8fa3');
        Px.dot(bCtx, 15, 16 - wormH, '#000000'); // Worm eye
      }

      // Pulsing '+' Prompt
      const plusCol = (f % 2 === 0) ? '#fff4a0' : '#74c648';
      Px.bevel(bCtx, 15, 12, 3, 9, plusCol, '#74c648', '#2f6e16');
      Px.bevel(bCtx, 12, 15, 9, 3, plusCol, '#74c648', '#2f6e16');

    } else if (assetId === 'sprout') {
      Px.bevel(bCtx, 2, 2, 28, 28, '#a66b37', '#6b3f1c', '#2e1708', '#120701');
      Px.dither(bCtx, 5, 5, 22, 22, '#2b160a', '#140a04', 'check');

      // Gentle Breeze Swaying Stem
      const stemSway = Math.round(Math.sin(f * Math.PI / 4) * 1.5);
      Px.line(bCtx, 16, 25, 16 + stemSway, 16, '#246b29');
      Px.line(bCtx, 15, 25, 15 + stemSway, 17, '#59bf60');

      // Twin Leaves with Veins
      Px.sphere(bCtx, 12 + stemSway, 15, 3.5, ['#e5ff99', '#8ce645', '#3f9914', '#174705']);
      Px.sphere(bCtx, 20 + stemSway, 15, 3.5, ['#e5ff99', '#8ce645', '#3f9914', '#174705']);

      // Glistening Dewdrop Dripping Animation!
      if (f <= 4) {
        Px.dot(bCtx, 10 + stemSway, 14, '#ffffff');
        Px.dot(bCtx, 11 + stemSway, 15, '#c7f0ff');
      } else {
        const dropY = 15 + (f - 4) * 3;
        Px.dot(bCtx, 10, dropY, '#c7f0ff');
        if (f === 7) {
          Px.ring(bCtx, 10, 24, 2, 1, '#76d4ff'); // Splash ripple!
        }
      }

    } else if (assetId === 'budding') {
      Px.bevel(bCtx, 2, 2, 28, 28, '#a66b37', '#6b3f1c', '#2e1708', '#120701');
      Px.dither(bCtx, 5, 5, 22, 22, '#2b160a', '#140a04', 'check');

      // Coiling Living Vine Tendril
      const vineShift = Math.round(Math.sin(f * Math.PI / 4) * 1.2);
      Px.line(bCtx, 16, 25, 14 + vineShift, 18, '#1e5922');
      Px.line(bCtx, 14 + vineShift, 18, 18 - vineShift, 12, '#3ea645');

      // Swelling Calyx Pod
      Px.sphere(bCtx, 16, 11, 4.5, ['#e5ff99', '#8ce645', '#3f9914', '#174705']);
      Px.dot(bCtx, 16, 11, '#ffd23a'); // Letter bud glowing

    } else if (assetId === 'blooming') {
      Px.bevel(bCtx, 2, 2, 28, 28, '#a66b37', '#6b3f1c', '#2e1708', '#120701');
      Px.dither(bCtx, 5, 5, 22, 22, '#2b160a', '#140a04', 'check');

      Px.line(bCtx, 16, 26, 16, 16, '#174705');

      // Blooming Flower Petals Breathing
      const petalR = 7 + (f % 2 === 0 ? 0.8 : 0);
      Px.sphere(bCtx, 16, 14, petalR, ['#ffffff', '#fff7b8', '#ffd23a', '#b38004', '#422e02']);

      // Golden Center Core with Letter
      Px.circle(bCtx, 16, 14, 4, '#e02828');
      bCtx.fillStyle = '#ffffff';
      bCtx.font = 'bold 7px monospace';
      bCtx.textAlign = 'center';
      bCtx.textBaseline = 'middle';
      bCtx.fillText(char, 16, 14);

      // Radiating Golden Pollen Burst!
      for (let p = 0; p < 4; p++) {
        const pa = p * (Math.PI / 2) + f * (Math.PI / 8);
        const pd = 8 + (f % 4);
        Px.dot(bCtx, 16 + Math.round(Math.cos(pa) * pd), 14 + Math.round(Math.sin(pa) * pd), '#ffd23a');
      }

    } else if (assetId === 'watering_can') {
      // Galvanized Watering Can with Tilt
      const canTilt = (f >= 2 && f <= 5) ? 1 : 0;
      Px.bevel(bCtx, 6, 14 - canTilt, 14, 13, '#c9d7e8', '#7b8fa6', '#3d4d5e');
      Px.line(bCtx, 20, 19 - canTilt, 26, 13 - canTilt * 2, '#7b8fa6'); // Spout
      Px.sphere(bCtx, 27, 12 - canTilt * 2, 2.5, ['#ffffff', '#c9d7e8', '#7b8fa6']); // Rose head

      // Arched Handle
      Px.ring(bCtx, 12, 10 - canTilt, 5, 1.5, '#7b8fa6');

      // Continuous Streaming Water Droplets Arcing Downward!
      for (let di = 0; di < 3; di++) {
        const dropProgress = (f * 2 + di * 4) % 12;
        const dwX = 28 + dropProgress * 0.4;
        const dwY = 14 + dropProgress;
        Px.line(bCtx, dwX, dwY, dwX - 0.5, dwY + 1.5, '#76d4ff');
      }
      // Puddle Splash
      Px.ring(bCtx, 29, 26, 2 + (f % 3), 1, '#76d4ff88');
    }

    ctx.drawImage(buf, 0, 0, w * scale, h * scale);
    return cv;
  }

  // ==========================================================================
  // SECTION 4: BANANA LOGISTICS & SHOP ARTIFACTS (32x32)
  // ==========================================================================
  const SHOP_ITEMS_DATA = [
    {
      id: 'golden_banana',
      name: '24-Karat Golden Banana',
      desc: 'Legendary solid gold fruit reflecting brilliant specular glints with divine radiant aura'
    },
    {
      id: 'rotten_banana',
      name: 'Rotten Spotted Banana',
      desc: 'Mushy fermenting banana with buzzing flies, triggering sluggish typists and harsh critics'
    },
    {
      id: 'hold_weight',
      name: 'Machinist Hold-to-Type Weight',
      desc: 'Heavy cast-iron paperweight that keeps keys depressed for rapid continuous typing'
    },
    {
      id: 'metronome',
      name: 'Mahogany Tempo Metronome',
      desc: 'Precision pendulum clockwork that doubles the rhythmic typing cadence of all desks'
    },
    {
      id: 'double_hammer',
      name: 'Tandem Strike Typebar Linkage',
      desc: 'Dual-pawl escapement mechanism producing two crisp character strokes per press'
    },
    {
      id: 'publishing_contracts',
      name: 'Gilded Publishing Rights Contract',
      desc: 'Vellum legal scroll stamped with scarlet wax seal, guaranteeing syndicated royalties'
    }
  ];

  function renderShopItem(itemId, scale = 2, frame = 0) {
    const w = 32, h = 32;
    const cv = makeCanvas(w * scale, h * scale);
    if (cv._mock) return cv;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const buf = makeCanvas(w, h);
    const bCtx = buf.getContext('2d');
    bCtx.imageSmoothingEnabled = false;

    const f = frame % 8;

    if (itemId === 'golden_banana') {
      // Radiant Divine Aura Pulsing
      const auraColor = (f % 2 === 0) ? '#ffd23a33' : '#ffd23a55';
      Px.dither(bCtx, 3, 3, 26, 26, auraColor, '#00000000', 'check');
      Px.sphere(bCtx, 16, 16, 12, ['#ffffff44', '#ffd23a55', '#b8860b22', '#00000000']);

      // 24K Solid Gold Banana
      for (let i = 0; i < 9; i++) {
        const x = 12 + i * 1.1;
        const y = 20 - Math.sin(i * 0.38) * 9;
        Px.sphere(bCtx, x, y, 3.8, ['#ffffff', '#fff7b8', '#ffd23a', '#b38004', '#422e02']);
      }
      Px.sphere(bCtx, 11, 20, 2, ['#ffd23a', '#b38004', '#593f02', '#241901']);
      Px.sphere(bCtx, 22, 13, 2, ['#ffd23a', '#b38004', '#593f02', '#241901']);

      // Moving Specular Shine Sweep Across Curved Banana Body!
      const gleamI = f % 9;
      const gx = 12 + gleamI * 1.1;
      const gy = 20 - Math.sin(gleamI * 0.38) * 9;
      Px.star(bCtx, gx, gy, 2.5, '#ffffff', '#fffbe0');

      // Additional Diamond Sparkles
      if (f % 2 === 0) {
        Px.star(bCtx, 21, 6, 2, '#ffffff', '#ffd23a');
      } else {
        Px.star(bCtx, 9, 21, 2, '#ffffff', '#ffd23a');
      }

    } else if (itemId === 'rotten_banana') {
      // Bruised Banana
      for (let i = 0; i < 9; i++) {
        const x = 12 + i * 1.1;
        const y = 20 - Math.sin(i * 0.38) * 9;
        Px.sphere(bCtx, x, y, 3.8, ['#8c6e3b', '#543b18', '#2e1c07', '#120a02']);
      }
      // Penicillin mold patches
      Px.dither(bCtx, 14, 15, 4, 4, '#4f9e4b', '#1a4f17', 'check');
      Px.dither(bCtx, 19, 13, 3, 3, '#78c973', '#245921', 'check');

      // Buzzing Fruit Flies in Figure-8 Lissajous Orbits!
      const flies = [
        [16 + Math.round(Math.sin(f * 1.2) * 7), 13 + Math.round(Math.cos(f * 1.5) * 5)],
        [22 + Math.round(Math.cos(f * 1.0) * 6), 17 + Math.round(Math.sin(f * 1.4) * 4)],
        [12 + Math.round(Math.sin(f * 0.8 + 1) * 5), 18 + Math.round(Math.cos(f * 1.2) * 4)],
        [20 + Math.round(Math.cos(f * 1.3 + 2) * 7), 8 + Math.round(Math.sin(f * 1.0) * 3)]
      ];
      flies.forEach(([fx, fy]) => {
        Px.dot(bCtx, fx, fy, '#080504');
        Px.dot(bCtx, fx - 1, fy - 1, '#b0d9e8');
        Px.dot(bCtx, fx + 1, fy - 1, '#b0d9e8');
      });

    } else if (itemId === 'hold_weight') {
      // Cast-Iron Foundry Weight
      Px.bevel(bCtx, 5, 17, 22, 12, '#5e6873', '#2b333b', '#12161a', '#080a0d');
      Px.dither(bCtx, 6, 18, 20, 10, '#3a444f', '#242a30', 'check');
      Px.bevel(bCtx, 8, 15, 16, 3, '#7b8794', '#47535e', '#1c2226');

      // Polished Brass Ring Eyelet
      Px.ring(bCtx, 16, 10, 5, 2, '#ffd23a');
      Px.line(bCtx, 13, 8, 15, 6, '#ffffff');
      Px.bevel(bCtx, 14, 14, 4, 3, '#fff4a0', '#c29a27', '#594408');

      bCtx.fillStyle = '#7b8794';
      bCtx.font = 'bold 7px monospace';
      bCtx.fillText('5KG', 10, 25);

      // Downward Pressure Vibration Ripple Waves on desk
      const rippleR = 4 + (f % 4) * 3;
      Px.ring(bCtx, 16, 29, rippleR, 1, '#7b879444');

    } else if (itemId === 'metronome') {
      // Pyramidal Metronome Body
      Px.bevel(bCtx, 7, 27, 18, 4, '#733116', '#3b1506', '#140601', '#080200');
      for (let y = 5; y <= 27; y++) {
        const spread = (y - 5) * 0.38;
        const x0 = Math.round(16 - spread), x1 = Math.round(16 + spread);
        Px.line(bCtx, x0, y, x1, y, '#54210c');
        Px.dot(bCtx, x0, y, '#8c3d1b');
        Px.dot(bCtx, x1, y, '#1f0902');
      }

      Px.bevel(bCtx, 12, 9, 8, 17, '#1f0902', '#0d0401', '#000000');
      Px.cylV(bCtx, 13, 10, 6, 15, ['#fffae0', '#f2d89b', '#bda05e']);

      // Swinging Steel Pendulum Arm & Sliding Brass Counterweight!
      const penAngle = Math.sin(f * (Math.PI / 4)) * 0.45;
      const topX = 16 + Math.round(Math.sin(penAngle) * 14);
      const topY = 23 - Math.round(Math.cos(penAngle) * 14);
      Px.line(bCtx, 16, 23, topX, topY, '#5e6873');
      Px.line(bCtx, 15, 23, topX - 1, topY, '#ffffff');

      // Sliding Counterweight
      const cwX = 16 + Math.round(Math.sin(penAngle) * 8);
      const cwY = 23 - Math.round(Math.cos(penAngle) * 8);
      Px.bevel(bCtx, cwX - 2, cwY - 2, 5, 4, '#fff4a0', '#ffd23a', '#8a650c');

      // "TIC" spark at maximum swing (frame 2 & 6)
      if (f === 2 || f === 6) {
        Px.star(bCtx, topX, topY, 2, '#ffffff', '#ffd23a');
      }

    } else if (itemId === 'double_hammer') {
      // Alternating Tandem Strike Hammers Action!
      // Hammer 1 strikes on frames 0..3, Hammer 2 strikes on frames 4..7
      const h1Active = (f < 4);
      const h1Offset = h1Active ? Math.round(Math.sin(f * (Math.PI / 4)) * 3) : 0;
      const h2Offset = !h1Active ? Math.round(Math.sin((f - 4) * (Math.PI / 4)) * 3) : 0;

      // Typebars
      Px.line(bCtx, 7, 26, 15 - h1Offset, 10 - h1Offset, '#73879c');
      Px.line(bCtx, 11, 26, 19 - h2Offset, 10 - h2Offset, '#73879c');

      // Lead/Steel Slugs
      Px.bevel(bCtx, 13 - h1Offset, 6 - h1Offset, 5, 6, '#8fa4ba', '#4d5d6e', '#1c242e');
      Px.bevel(bCtx, 19 - h2Offset, 6 - h2Offset, 5, 6, '#8fa4ba', '#4d5d6e', '#1c242e');

      // Impact Mechanical Spark!
      if (f === 1 || f === 5) {
        const sx = (f === 1) ? 14 : 20;
        Px.star(bCtx, sx, 5, 2.5, '#ffffff', '#ffd23a');
      }

      // Tension Springs
      for (let y = 17; y <= 24; y += 2) {
        Px.line(bCtx, 13, y, 16, y + 1, '#ffd23a');
      }
      Px.sphere(bCtx, 9, 26, 2, ['#ffffff', '#73879c', '#2b343d']);

    } else if (itemId === 'publishing_contracts') {
      // Vellum Legal Scroll with Deckled Edges
      Px.rect(bCtx, 7, 7, 19, 19, '#1a140a');
      Px.bevel(bCtx, 6, 6, 19, 19, '#fffcf0', '#f2e5b8', '#baa874', '#3b321c');
      Px.dither(bCtx, 7, 7, 17, 17, '#f7edd2', '#e8d7a7', 'check');

      Px.cylH(bCtx, 5, 4, 21, 3, ['#ffffff', '#e8d7a7', '#8a7647']);
      Px.cylH(bCtx, 5, 24, 21, 3, ['#ffffff', '#e8d7a7', '#8a7647']);

      // Calligraphic text
      [9, 12, 15, 18].forEach(y => Px.line(bCtx, 9, y, 21, y, '#3b2f1c'));

      // Pulsing Scarlet Wax Seal with Golden Monogram Crest!
      Px.sphere(bCtx, 20, 20, 4, ['#ff4d4d', '#c91c1c', '#7a0b0b']);
      const crestCol = (f % 2 === 0) ? '#ffffff' : '#ffd23a';
      Px.dot(bCtx, 20, 20, crestCol);
      // Fluttering Ribbon Tails
      const ribWave = Math.round(Math.sin(f * Math.PI / 4) * 1.2);
      Px.line(bCtx, 20, 24, 18 + ribWave, 28, '#c91c1c');
      Px.line(bCtx, 21, 24, 23 + ribWave, 28, '#c91c1c');
    }

    ctx.drawImage(buf, 0, 0, w * scale, h * scale);
    return cv;
  }

  // ==========================================================================
  // SECTION 5: HALL OF RECORDS & AWARDS (32x32)
  // ==========================================================================
  const AWARDS_TIERS_DATA = [
    { id: 'trophy_bronze', name: 'Carved Ironwood Trophy (Tier 1)', col: '#8a5a2b', trim: '#b57d3e' },
    { id: 'trophy_silver', name: 'Chromium Metal Trophy (Tier 2)', col: '#94a5b8', trim: '#ffffff' },
    { id: 'trophy_gold', name: 'Golden Banana Crown Trophy (Tier 3)', col: '#ffd23a', trim: '#fff4a0' },
    { id: 'ribbon_blue', name: 'First Prize Blue Ribbon', col: '#2e44a8', trim: '#ffd23a' },
    { id: 'legacy_star', name: '8-Point Cosmic Legacy Star', col: '#ffc62a', trim: '#ffffff' }
  ];

  function renderAwardBadge(awardId, scale = 2, frame = 0) {
    const w = 32, h = 32;
    const cv = makeCanvas(w * scale, h * scale);
    if (cv._mock) return cv;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const buf = makeCanvas(w, h);
    const bCtx = buf.getContext('2d');
    bCtx.imageSmoothingEnabled = false;

    const f = frame % 8;

    if (awardId.startsWith('trophy_')) {
      const isGold = awardId.includes('gold');
      const isSilver = awardId.includes('silver');

      const ramp = isGold
        ? ['#ffffff', '#fff7b8', '#ffd23a', '#b38004', '#422e02']
        : isSilver
        ? ['#ffffff', '#e8f0f8', '#99abbd', '#49596b', '#19222c']
        : ['#ffeed4', '#c98a53', '#7d4a20', '#42230a', '#170a02'];

      Px.rect(bCtx, 7, 29, 18, 2, '#0a0a0d');
      Px.bevel(bCtx, 7, 24, 18, 5, ramp[1], ramp[2], ramp[3], ramp[4]);
      Px.bevel(bCtx, 9, 21, 14, 3, ramp[0], ramp[1], ramp[3]);

      // Stem
      Px.cylV(bCtx, 14, 17, 4, 4, ramp);

      // Chalice Bowl
      Px.sphere(bCtx, 16, 12, 7.5, ramp);

      // Handles
      Px.ring(bCtx, 8, 11, 4, 1.5, ramp[1]);
      Px.ring(bCtx, 24, 11, 4, 1.5, ramp[2]);

      // Specular Traveling Light Sweep!
      const sweepX = 11 + (f % 6) * 1.8;
      Px.line(bCtx, sweepX, 8, sweepX, 15, '#ffffff99');

      // Twinkling Jewels on Gold Crown Trophy!
      if (isGold) {
        const jewelCols = ['#ff3b30', '#34c759', '#007aff', '#ffd60a'];
        Px.dot(bCtx, 13, 8, jewelCols[f % 4]);
        Px.dot(bCtx, 16, 7, jewelCols[(f + 1) % 4]);
        Px.dot(bCtx, 19, 8, jewelCols[(f + 2) % 4]);
        if (f % 2 === 0) {
          Px.star(bCtx, 8, 8, 2, '#ffffff', ramp[1]);
        }
      }

    } else if (awardId === 'ribbon_blue') {
      // Rosette Head with Pleated Petals
      Px.circle(bCtx, 16, 12, 8, '#1e3ea8');
      Px.sphere(bCtx, 16, 12, 5.5, ['#ffd23a', '#b38004', '#422e02']);
      Px.dot(bCtx, 16, 12, '#ffffff');

      // Fluttering Silk Streamer Tails!
      const wave1 = Math.round(Math.sin(f * Math.PI / 4) * 1.5);
      const wave2 = Math.round(Math.cos(f * Math.PI / 4) * 1.5);
      Px.bevel(bCtx, 11 + wave1, 18, 4, 11, '#4268d6', '#1e3ea8', '#0b1d5c');
      Px.bevel(bCtx, 17 + wave2, 18, 4, 11, '#4268d6', '#1e3ea8', '#0b1d5c');

      // Rotating Rosette Sparkle
      if (f % 2 === 0) {
        Px.star(bCtx, 16, 12, 2.5, '#ffffff', '#ffd23a');
      }

    } else if (awardId === 'legacy_star') {
      // 8-Point Cosmic Star Rotating and Radiating Energy!
      const rotA = f * (Math.PI / 16);
      const pulseR = 12 + Math.sin(f * Math.PI / 4) * 2;

      for (let k = 0; k < 8; k++) {
        const a = rotA + k * (Math.PI / 4);
        Px.line(bCtx, 16, 16, 16 + Math.round(Math.cos(a) * pulseR), 16 + Math.round(Math.sin(a) * pulseR), '#ffd23a');
        Px.dot(bCtx, 16 + Math.round(Math.cos(a) * pulseR), 16 + Math.round(Math.sin(a) * pulseR), '#ffffff');
      }

      Px.sphere(bCtx, 16, 16, 7, ['#ffffff', '#fff7b8', '#ffd23a', '#b38004', '#422e02']);
      Px.line(bCtx, 16, 11, 16, 21, '#ffffff');
      Px.line(bCtx, 11, 16, 21, 16, '#ffffff');

      // Expanding Cosmic Aura Ring
      const auraR = 6 + (f % 4) * 2;
      Px.ring(bCtx, 16, 16, auraR, 1, '#ffffff66');
    }

    ctx.drawImage(buf, 0, 0, w * scale, h * scale);
    return cv;
  }

  // ==========================================================================
  // SECTION 6: VINE INFRASTRUCTURE LIBRARY (16x54 Book Spines)
  // ==========================================================================
  const BOOK_SPINES_DATA = [
    { id: 'band1', name: 'Novella Folio (2-3 letters)', color: '#316d4c', height: 28, width: 9, title: 'APE' },
    { id: 'band2', name: 'Poetry Chapbook (4-5 letters)', color: '#a82c48', height: 32, width: 10, title: 'SONG' },
    { id: 'band3', name: 'Adventure Chronicle (6-7 letters)', color: '#24568a', height: 36, width: 11, title: 'JUNGLE' },
    { id: 'band4', name: 'Ledger Compendium (8-9 letters)', color: '#8a5e1e', height: 40, width: 12, title: 'ARCHIVES' },
    { id: 'band5', name: 'Imperial Lexicon (10-11 letters)', color: '#56247d', height: 44, width: 13, title: 'TYPEWRITERS' },
    { id: 'band6', name: 'Grand Encyclopedia (12-13 letters)', color: '#1f2838', height: 48, width: 14, title: 'ENCYCLOPEDIA' }
  ];

  function renderBookSpine(bandIndex = 0, scale = 2, frame = 0) {
    const data = BOOK_SPINES_DATA[Math.min(5, Math.max(0, bandIndex))];
    const w = 16, h = 54;
    const cv = makeCanvas(w * scale, h * scale);
    if (cv._mock) return cv;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const buf = makeCanvas(w, h);
    const bCtx = buf.getContext('2d');
    bCtx.imageSmoothingEnabled = false;

    const f = frame % 8;

    const bw = data.width, bh = data.height;
    const bx = Math.round((w - bw) / 2);
    const by = 52 - bh;

    // Shelf Shadow Under Book
    Px.rect(bCtx, bx + 1, by + 1, bw, bh, '#070506');

    // Volumetric Cylindrical Leather Spine
    Px.cylV(bCtx, bx, by, bw, bh, ['#ffffff44', data.color, data.color, '#00000044', '#00000088']);

    // Headband & Tailband
    Px.dither(bCtx, bx, by, bw, 2, '#ffffff', '#c91c1c', 'lines');
    Px.dither(bCtx, bx, by + bh - 2, bw, 2, '#ffffff', '#c91c1c', 'lines');

    // Embossed Gilded Horizontal Raised Bands
    [by + 4, by + 7, by + bh - 9, by + bh - 6].forEach(ry => {
      Px.line(bCtx, bx, ry, bx + bw - 1, ry, '#ffd23a');
      Px.line(bCtx, bx, ry + 1, bx + bw - 1, ry + 1, '#8a6208');
    });

    // Gold-Bordered Title Cartouche Inset
    Px.bevel(bCtx, bx + 1, by + 11, bw - 2, bh - 23, '#ffd23a', '#0d0a08', '#4a370e');
    Px.rect(bCtx, bx + 2, by + 12, bw - 4, bh - 25, '#fffcf2');

    // Spine Typography
    for (let y = by + 14; y < by + bh - 15; y += 3) {
      Px.line(bCtx, bx + 3, y, bx + bw - 4, y, '#2e1c0c');
      Px.dot(bCtx, bx + 3, y, '#ffd23a');
    }

    // Moving Gold Leaf Foil Specular Sheen Down Spine!
    const gleamY = by + 12 + Math.round((f / 8) * (bh - 25));
    Px.line(bCtx, bx + 2, gleamY, bx + bw - 3, gleamY, '#ffffffcc');

    // Swaying Braided Silk Bookmark Ribbon Tassel!
    const tasselSway = Math.round(Math.sin(f * Math.PI / 4) * 2);
    Px.line(bCtx, bx + Math.round(bw / 2), by + bh - 1, bx + Math.round(bw / 2) + tasselSway, by + bh + 4, '#c91c1c');
    Px.dot(bCtx, bx + Math.round(bw / 2) + tasselSway, by + bh + 4, '#ffd23a');

    ctx.drawImage(buf, 0, 0, w * scale, h * scale);
    return cv;
  }

  // ==========================================================================
  // SECTION 7: WEATHER & CELESTIAL HEADER TOYS (36x36)
  // ==========================================================================
  function renderWeatherToy(stateIndex = 0, scale = 2, frame = 0) {
    const w = 36, h = 36;
    const cv = makeCanvas(w * scale, h * scale);
    if (cv._mock) return cv;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const buf = makeCanvas(w, h);
    const bCtx = buf.getContext('2d');
    bCtx.imageSmoothingEnabled = false;

    const f = frame % 8;

    if (stateIndex === 0) {
      // Rotating Solar Corona with Pulsing Flares!
      const rotAngle = f * (Math.PI / 24);
      for (let k = 0; k < 12; k++) {
        const a = rotAngle + k * Math.PI / 6;
        const flareLen = (k % 2 === f % 2) ? 16 : 14;
        const x1 = Math.round(18 + Math.cos(a) * 9);
        const y1 = Math.round(18 + Math.sin(a) * 9);
        const x2 = Math.round(18 + Math.cos(a) * flareLen);
        const y2 = Math.round(18 + Math.sin(a) * flareLen);
        Px.line(bCtx, x1, y1, x2, y2, '#ffd23a');
        Px.dot(bCtx, x2, y2, '#ffffff');
      }
      Px.sphere(bCtx, 18, 18, 9, ['#ffffff', '#fff7b8', '#ffc62a', '#e07604', '#6b3400']);

      // Primate Eyes & Grin with Wink on Frame 4!
      if (f === 4) {
        // Wink!
        Px.line(bCtx, 14, 16, 16, 16, '#421f00'); // Left wink line
        Px.rect(bCtx, 19, 16, 2, 2, '#421f00'); Px.dot(bCtx, 19, 16, '#ffffff'); // Right eye open
      } else {
        Px.rect(bCtx, 15, 16, 2, 2, '#421f00'); Px.dot(bCtx, 15, 16, '#ffffff');
        Px.rect(bCtx, 19, 16, 2, 2, '#421f00'); Px.dot(bCtx, 19, 16, '#ffffff');
      }
      Px.line(bCtx, 16, 20, 20, 20, '#421f00');
      Px.dot(bCtx, 15, 19, '#421f00'); Px.dot(bCtx, 21, 19, '#421f00');

    } else {
      const isStorm = stateIndex === 3;
      const isRain = stateIndex >= 2;

      const cBase = isStorm ? '#3b435c' : '#ffffff';
      const cMid = isStorm ? '#22283b' : '#c9d7e8';
      const cDark = isStorm ? '#101421' : '#768fa8';

      // Gentle Cloud Float Bob
      const cloudBob = Math.round(Math.sin(f * Math.PI / 4) * 0.8);

      Px.sphere(bCtx, 13, 16 + cloudBob, 7.5, [cBase, cBase, cMid, cDark]);
      Px.sphere(bCtx, 21, 12 + cloudBob, 8.5, [cBase, cBase, cMid, cDark]);
      Px.sphere(bCtx, 27, 16 + cloudBob, 6.5, [cBase, cBase, cMid, cDark]);
      Px.dither(bCtx, 9, 18 + cloudBob, 20, 5, cMid, cDark, 'check');

      if (isStorm) {
        // Lightning Strike on Frame 2 & 5!
        if (f === 2 || f === 5) {
          // Blinding Flash Illuminating Cloud Contours
          Px.ring(bCtx, 21, 12, 9, 1, '#ffffff');
          Px.line(bCtx, 21, 17, 17, 24, '#ffffff');
          Px.line(bCtx, 22, 17, 18, 24, '#c7f0ff');
          Px.line(bCtx, 17, 24, 21, 24, '#ffffff');
          Px.line(bCtx, 21, 24, 15, 33, '#ffffff');
          Px.line(bCtx, 22, 24, 16, 33, '#70d6ff');
          Px.line(bCtx, 19, 27, 24, 31, '#ffffff');
        } else {
          // Rain in dark storm
          for (let di = 0; di < 6; di++) {
            const ry = (20 + f * 2 + di * 4) % 16 + 18;
            const rx = 10 + di * 3;
            Px.line(bCtx, rx, ry, rx - 1, ry + 2, '#70d6ff');
          }
        }
      } else {
        // Cascading Raindrop Streaks
        const dropCount = isRain ? 8 : 4;
        for (let di = 0; di < dropCount; di++) {
          const ry = (22 + f * 3 + di * 5) % 15 + 18;
          const rx = 8 + di * 3;
          Px.line(bCtx, rx, ry, rx - 1, ry + 3, '#76d4ff');
          Px.dot(bCtx, rx, ry, '#ffffff');
        }
      }
    }

    ctx.drawImage(buf, 0, 0, w * scale, h * scale);
    return cv;
  }

  // ==========================================================================
  // ANIMATION GENERATOR & CONTROLLER HELPERS
  // ==========================================================================
  function getComponentAnimationFrames(category, idOrIdx, scale = 2, frameCount = 8) {
    const frames = [];
    for (let f = 0; f < frameCount; f++) {
      let cv;
      if (category === 'muses') cv = renderMusePortrait(idOrIdx, scale, f);
      else if (category === 'studios') cv = renderStudioHardware(idOrIdx, scale, f);
      else if (category === 'garden') cv = renderGardenAsset(idOrIdx, 'E', scale, f);
      else if (category === 'shop') cv = renderShopItem(idOrIdx, scale, f);
      else if (category === 'awards') cv = renderAwardBadge(idOrIdx, scale, f);
      else if (category === 'library') cv = renderBookSpine(idOrIdx, scale, f);
      else if (category === 'weather') cv = renderWeatherToy(idOrIdx, scale, f);
      frames.push(cv);
    }
    return frames;
  }

  function createAnimatedCanvas(category, idOrIdx, scale = 2, fps = 8) {
    const frames = getComponentAnimationFrames(category, idOrIdx, scale, 8);
    const first = frames[0];
    const cv = makeCanvas(first.width, first.height);

    let currentFrame = 0;
    let timer = 0;
    let isRunning = !cv._mock;
    let speed = 1.0;

    const ctx = cv.getContext ? cv.getContext('2d') : null;
    if (ctx) ctx.imageSmoothingEnabled = false;

    function renderCurrent() {
      if (!ctx || !ctx.drawImage) return;
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.drawImage(frames[currentFrame], 0, 0);
    }

    function loop() {
      if (!isRunning) return;
      const interval = Math.max(1, Math.round(60 / (fps * speed)));
      timer++;
      if (timer >= interval) {
        timer = 0;
        currentFrame = (currentFrame + 1) % frames.length;
        renderCurrent();
      }
      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(loop);
      }
    }

    renderCurrent();
    if (typeof requestAnimationFrame !== 'undefined' && !cv._mock) {
      requestAnimationFrame(loop);
    }

    cv._animController = {
      start() { if (!isRunning) { isRunning = true; requestAnimationFrame(loop); } },
      stop() { isRunning = false; },
      setSpeed(spd) { speed = Math.max(0.2, spd); },
      setFrame(fIdx) { currentFrame = fIdx % frames.length; renderCurrent(); },
      getFrames() { return frames; }
    };

    return cv;
  }

  return {
    MUSES_DATA,
    STUDIOS_DATA,
    GARDEN_STAGES,
    SHOP_ITEMS_DATA,
    AWARDS_TIERS_DATA,
    BOOK_SPINES_DATA,
    renderMusePortrait,
    renderStudioHardware,
    renderGardenAsset,
    renderShopItem,
    renderAwardBadge,
    renderBookSpine,
    renderWeatherToy,
    getComponentAnimationFrames,
    createAnimatedCanvas
  };
});
`;

fs.writeFileSync('gemini-art/game-components.js', code, 'utf8');
console.log('Successfully wrote animated game-components.js!');

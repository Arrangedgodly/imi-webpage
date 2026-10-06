/* ============================================================================
   GAME COMPONENTS PIXEL ART SUITE - ADVANCED DEPTH & SHADING EDITION
   ----------------------------------------------------------------------------
   Custom 16-bit handcrafted procedural pixel art generators for every
   remaining component and subsystem of MonkeyOS / Typewriter Ops:
   
   1. The 9 Literary Muses Salon (32x32 ornate framed portraits with deep relief)
   2. The 5 IMI Media Studio Divisions (48x48 retro studio hardware with volumetrics)
   3. Botanical Letter Garden (Seeds, plots, sprouts, blooms, watering tools)
   4. Banana Logistics & Shop Artifacts (24K golden banana, rotten fruit, weights)
   5. Hall of Records & Awards (Hand-carved ironwood, chromium, gold crown trophies)
   6. Vine Infrastructure Library & Book Spines (Deep tooled leather & gold leaf)
   7. Weather & Celestial Header Toys (Multi-layer sun, turbulent storm clouds, lightning)
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
      const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
      const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
      let err = dx - dy;
      while (true) {
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
    // 50% Checkerboard Dither between two colors
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
    // 3D Beveled Box (Embossed physical edge with directional lighting)
    bevel(ctx, x, y, w, h, hiCol, baseCol, shadowCol, darkOutline) {
      x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
      if (darkOutline) {
        ctx.fillStyle = darkOutline;
        ctx.fillRect(x, y, w, h);
        x += 1; y += 1; w -= 2; h -= 2;
      }
      ctx.fillStyle = baseCol;
      ctx.fillRect(x, y, w, h);
      // Top & Left Highlight edges
      ctx.fillStyle = hiCol;
      ctx.fillRect(x, y, w - 1, 1);
      ctx.fillRect(x, y, 1, h - 1);
      // Bottom & Right Deep Shadow edges
      ctx.fillStyle = shadowCol;
      ctx.fillRect(x + 1, y + h - 1, w - 1, 1);
      ctx.fillRect(x + w - 1, y + 1, 1, h - 1);
    },
    // Horizontal Cylindrical Gradient (Ideal for metal rollers, tubes, chalices)
    cylH(ctx, x, y, w, h, ramp) {
      // ramp: [darkShadow, coreShadow, midBase, highlight, specularPeak]
      x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
      if (!ramp || ramp.length < 3) return;
      const stepH = h / ramp.length;
      for (let i = 0; i < ramp.length; i++) {
        ctx.fillStyle = ramp[i];
        const sy = Math.round(y + i * stepH);
        const sh = Math.max(1, Math.round(stepH));
        ctx.fillRect(x, sy, w, sh);
      }
    },
    // Vertical Cylindrical Gradient (For upright pipes, pillars, canisters)
    cylV(ctx, x, y, w, h, ramp) {
      x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
      if (!ramp || ramp.length < 3) return;
      const stepW = w / ramp.length;
      for (let i = 0; i < ramp.length; i++) {
        ctx.fillStyle = ramp[i];
        const sx = Math.round(x + i * stepW);
        const sw = Math.max(1, Math.round(stepW));
        ctx.fillRect(sx, y, sw, h);
      }
    },
    // True Volumetric Shaded Sphere with top-left specular highlight & bottom bounce
    sphere(ctx, cx, cy, r, ramp) {
      // ramp: [specular, highlight, midBase, deepShadow, darkOutline]
      cx = Math.round(cx); cy = Math.round(cy); r = Math.round(r);
      if (!ramp || ramp.length < 4 || r <= 0) return;
      const spec = ramp[0], hi = ramp[1], mid = ramp[2], dark = ramp[3], outl = ramp[4] || ramp[3];

      for (let dy = -r; dy <= r; dy++) {
        const dxMax = Math.round(Math.sqrt(Math.max(0, r * r - dy * dy)));
        for (let dx = -dxMax; dx <= dxMax; dx++) {
          const px = cx + dx, py = cy + dy;
          // Normalized distance from center
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > r) continue;

          // Distance from top-left light source (-0.35r, -0.35r)
          const lx = dx + r * 0.35, ly = dy + r * 0.35;
          const lightDist = Math.sqrt(lx * lx + ly * ly);

          if (dist >= r - 0.7) {
            ctx.fillStyle = outl; // Rim outline
          } else if (lightDist < r * 0.32) {
            ctx.fillStyle = spec; // Specular glint
          } else if (lightDist < r * 0.65) {
            ctx.fillStyle = hi;   // High light
          } else if (dx > 0 && dy > 0 && dist > r * 0.68) {
            ctx.fillStyle = dark; // Core shadow
          } else {
            ctx.fillStyle = mid;  // Midtone base
          }
          ctx.fillRect(px, py, 1, 1);
        }
      }
    },
    // Disc with concentric grooved metallic reflection
    discGrooved(ctx, cx, cy, r, colBase, colSheen, colDark) {
      cx = Math.round(cx); cy = Math.round(cy); r = Math.round(r);
      for (let dy = -r; dy <= r; dy++) {
        const dxMax = Math.round(Math.sqrt(Math.max(0, r * r - dy * dy)));
        for (let dx = -dxMax; dx <= dxMax; dx++) {
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > r) continue;
          if (dist >= r - 1) {
            ctx.fillStyle = colDark;
          } else {
            // Radial quadrant shine bands
            const angle = Math.atan2(dy, dx);
            const sheen = Math.abs(Math.sin(angle * 2));
            ctx.fillStyle = sheen > 0.65 ? colSheen : colBase;
          }
          ctx.fillRect(cx + dx, cy + dy, 1, 1);
        }
      }
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
      archetype: 'The Manor Sleuth',
      bonuses: 'Golden bananas show up 30% sooner.',
      frameRamp: ['#ecd8ff', '#ab7fe8', '#603996', '#2b124d', '#0f041f'],
      wallBg: '#8c5cd6',
      wallShadow: '#4e2a87',
      furRamp: ['#c98a5d', '#96603a', '#5e371d', '#30180a'],
      skinRamp: ['#fff2dc', '#f6d6a8', '#c99b68', '#734c28'],
      bio: 'Houndstooth tweed jacket with lapels, iridescent pearl necklace, and a polished brass magnifying monocle.'
    },
    {
      id: 'woolf',
      name: 'Virginia Woolfkin',
      archetype: 'The Stream of Thought',
      bonuses: 'Away work is 15 points more efficient.',
      frameRamp: ['#dcfae5', '#76cca0', '#3b8560', '#174730', '#061c12'],
      wallBg: '#50a87a',
      wallShadow: '#266947',
      furRamp: ['#9c7553', '#704f32', '#452c18', '#211208'],
      skinRamp: ['#fff6ee', '#fed9b6', '#c99975', '#734a30'],
      bio: 'Sage green scarf with drape folds, silver hairpins, and a miniature carved cameo lighthouse pin.'
    },
    {
      id: 'austen',
      name: 'Jane Apesten',
      archetype: 'The Regency Satirist',
      bonuses: 'Royalties +25%.',
      frameRamp: ['#fff4a0', '#e5b836', '#9b6c14', '#4a2e06', '#140c02'],
      wallBg: '#d99726',
      wallShadow: '#805108',
      furRamp: ['#e09c48', '#b47323', '#73420e', '#3d2003'],
      skinRamp: ['#fff6ee', '#fed9b6', '#c99975', '#734a30'],
      bio: 'Regency amber bonnet with ruffled lace trim, yellow silk ribbons, and a sealed vellum manuscript.'
    },
    {
      id: 'tolken',
      name: 'J.R.R. Tolkong',
      archetype: 'The High Worldbuilder',
      bonuses: 'Long-band titles (8-13 letters) sell for 25% more.',
      frameRamp: ['#e0c4a4', '#a67b4b', '#694723', '#3b240e', '#170c03'],
      wallBg: '#7a4e24',
      wallShadow: '#45280d',
      furRamp: ['#8a5d33', '#5a3818', '#38200b', '#1a0e03'],
      skinRamp: ['#f2be94', '#d08853', '#96562b', '#572b10'],
      bio: 'Herringbone tweed vest, carved briar wood pipe with glowing orange ember and curling wisps of smoke.'
    },
    {
      id: 'twain',
      name: 'Mark Twainana',
      archetype: 'The River Pilot',
      bonuses: 'Media division income +20%.',
      frameRamp: ['#eef3fa', '#a8bccc', '#597085', '#2a3b4a', '#0d161f'],
      wallBg: '#b0c2db',
      wallShadow: '#576f8f',
      furRamp: ['#ffffff', '#e2e7ed', '#a9b5c2', '#677482'],
      skinRamp: ['#ffd8b3', '#e0aa76', '#a36d40', '#5e371b'],
      bio: 'Crisp white three-piece linen suit, voluminous sculpted mane, and sweeping walrus mustache.'
    }
  ];

  function renderMusePortrait(museId, scale = 2) {
    const data = MUSES_DATA.find(m => m.id === museId) || MUSES_DATA[0];
    const w = 32, h = 32;
    const cv = makeCanvas(w * scale, h * scale);
    if (cv._mock) return cv;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const buf = makeCanvas(w, h);
    const bCtx = buf.getContext('2d');
    bCtx.imageSmoothingEnabled = false;

    const fr = data.frameRamp;

    // 1. Heavy 3D Gilded Victorian Frame with Deep Moldings
    Px.rect(bCtx, 0, 0, 32, 32, fr[4]); // Deepest outer drop shadow
    Px.rect(bCtx, 1, 1, 30, 30, fr[3]); // Outer dark wood ridge
    Px.rect(bCtx, 2, 2, 28, 28, fr[2]); // Core gold molding
    Px.rect(bCtx, 3, 3, 26, 26, fr[1]); // Gold highlight ridge
    Px.rect(bCtx, 4, 4, 24, 24, fr[0]); // Specular gold inner lip

    // Embossed acanthus corner leaves & rosettes
    [[2,2], [29,2], [2,29], [29,29]].forEach(([cx, cy]) => {
      Px.dot(bCtx, cx, cy, '#ffffff');
      Px.dot(bCtx, cx + (cx < 16 ? 1 : -1), cy, fr[0]);
      Px.dot(bCtx, cx, cy + (cy < 16 ? 1 : -1), fr[0]);
      Px.dot(bCtx, cx + (cx < 16 ? 1 : -1), cy + (cy < 16 ? 1 : -1), fr[3]);
    });

    // Dark velvet liner with inner frame shadow cast onto canvas
    Px.rect(bCtx, 5, 5, 22, 22, '#140c06');
    Px.rect(bCtx, 6, 6, 20, 20, data.wallBg);

    // Wall Vignette & Damask Pattern (Darker top and corners)
    Px.dither(bCtx, 6, 6, 20, 3, data.wallShadow, data.wallBg, 'check');
    Px.dither(bCtx, 6, 6, 3, 20, data.wallShadow, data.wallBg, 'lines');
    for (let x = 8; x <= 24; x += 4) {
      Px.line(bCtx, x, 6, x, 25, data.wallShadow);
      Px.dot(bCtx, x + 1, 10, '#ffffff22');
      Px.dot(bCtx, x + 1, 18, '#ffffff22');
    }

    // 2. Monkey Torso & Garment with 3D Fold Shading
    // Deep shoulder silhouette
    Px.rect(bCtx, 9, 23, 14, 5, '#0d0705');
    // Garment base with directional light (light from left)
    Px.rect(bCtx, 10, 22, 12, 5, '#1e140d');
    Px.line(bCtx, 10, 22, 14, 22, '#3a2719'); // Left shoulder highlight
    Px.line(bCtx, 18, 26, 22, 26, '#080402'); // Right armpit shadow

    // White shirt bib / lace chemise with shadow crease
    Px.rect(bCtx, 14, 21, 4, 4, '#e6e4dc');
    Px.line(bCtx, 14, 21, 15, 24, '#ffffff'); // Left crisp collar
    Px.line(bCtx, 16, 22, 16, 24, '#b0ada3'); // Center placket shadow

    // 3. Sculpted Primate Head Anatomy (5-Tone Volumetric Fur & Skin)
    const fur = data.furRamp, skin = data.skinRamp;

    // Ears with deep concha recess and rim highlight
    Px.sphere(bCtx, 10, 15, 2.5, [fur[0], fur[1], fur[2], fur[3]]);
    Px.sphere(bCtx, 22, 15, 2.5, [fur[1], fur[2], fur[2], fur[3]]);
    Px.dot(bCtx, 10, 15, skin[2]); Px.dot(bCtx, 9, 15, skin[0]);
    Px.dot(bCtx, 22, 15, skin[3]); Px.dot(bCtx, 21, 15, skin[1]);

    // Head Cranium Ball (Volumetric Fur Sphere)
    Px.sphere(bCtx, 16, 15, 5.5, [fur[0], fur[1], fur[2], fur[3]]);

    // Primate Heart-Shaped Face Mask with Form Shading
    Px.sphere(bCtx, 14, 15, 3.2, [skin[0], skin[1], skin[2], skin[3]]);
    Px.sphere(bCtx, 18, 15, 3.2, [skin[1], skin[2], skin[2], skin[3]]);
    // Muzzle / Snout Projection (Gives genuine 3D snout overhang)
    Px.cylH(bCtx, 13, 17, 7, 3, [skin[0], skin[1], skin[2]]);
    Px.line(bCtx, 13, 19, 19, 19, skin[3]); // Snout drop shadow on chin

    // Expressive Eyes with Upper Eyelid Shade & Specular Reflection
    Px.rect(bCtx, 13, 14, 2, 2, '#ffffff');
    Px.rect(bCtx, 17, 14, 2, 2, '#ffffff');
    Px.line(bCtx, 13, 14, 14, 14, '#1a100a'); // Eyelid crease
    Px.line(bCtx, 17, 14, 18, 14, '#1a100a');
    Px.dot(bCtx, 14, 15, '#0a0502'); // Pupil
    Px.dot(bCtx, 18, 15, '#0a0502');
    Px.dot(bCtx, 13, 15, '#d4ecff'); // White glint
    Px.dot(bCtx, 17, 15, '#d4ecff');

    // Nose & Smile with depth
    Px.dot(bCtx, 15, 17, skin[3]); Px.dot(bCtx, 16, 17, skin[3]);
    Px.line(bCtx, 14, 18, 17, 18, '#4a2012');
    Px.dot(bCtx, 15, 19, skin[1]); // Chin highlight

    // 4. Muse-Specific Clothing & Master Artifacts with Deep Relief
    if (data.id === 'seuss') {
      // Stovepipe Hat with curved cylinder gradient
      Px.cylV(bCtx, 13, 2, 6, 9, ['#ff5959', '#e02828', '#b51616', '#730b0b']);
      // Shaded white horizontal stripes
      Px.cylV(bCtx, 13, 4, 6, 2, ['#ffffff', '#e8e8e8', '#b8b8b8', '#787878']);
      Px.cylV(bCtx, 13, 8, 6, 2, ['#ffffff', '#e8e8e8', '#b8b8b8', '#787878']);
      // Curved Hat Brim with bevel
      Px.bevel(bCtx, 11, 10, 10, 2, '#ff8080', '#e02828', '#730b0b');
      // Giant Silk Bowtie with center knot and drop shadow
      Px.bevel(bCtx, 11, 21, 10, 3, '#fff4a0', '#ffd23a', '#9e7408');
      Px.dot(bCtx, 16, 22, '#e02828'); Px.dot(bCtx, 13, 22, '#e02828'); Px.dot(bCtx, 18, 22, '#e02828');
    } else if (data.id === 'poe') {
      // Midnight velvet coat with lapels
      Px.bevel(bCtx, 11, 21, 10, 5, '#3d344a', '#1e1826', '#0a070e');
      Px.line(bCtx, 15, 21, 16, 25, '#ffffff'); // White collar peak
      // Raven feather with iridescent violet/blue spine
      Px.line(bCtx, 20, 21, 26, 13, '#1a1824');
      Px.line(bCtx, 21, 19, 25, 14, '#6b5ce7'); // Shimmering barb
      Px.dot(bCtx, 25, 13, '#dcd6f7'); // Feather tip
    } else if (data.id === 'dick') {
      // Intricate openwork lace bonnet with dither pattern
      Px.dither(bCtx, 11, 10, 10, 4, '#ffffff', '#e0d8df', 'check');
      Px.ring(bCtx, 16, 14, 6, 1.5, '#ffffff');
      // Silken pink ribbons cascading down shoulders
      Px.line(bCtx, 11, 15, 10, 23, '#f08aa4');
      Px.line(bCtx, 21, 15, 22, 23, '#f08aa4');
      Px.dot(bCtx, 10, 23, '#ffc2d1'); Px.dot(bCtx, 22, 23, '#ffc2d1');
    } else if (data.id === 'hemi') {
      // Ribbed cable-knit fisherman sweater
      Px.dither(bCtx, 10, 21, 12, 6, '#f7f4ea', '#cfc8b6', 'lines');
      Px.line(bCtx, 13, 20, 19, 20, '#594d3d'); // Collar welt
      // Salt-and-pepper dimensional mustache & beard
      Px.dither(bCtx, 13, 17, 7, 3, '#ffffff', '#615f5c', 'check');
      // Navy fisherman cap with brass badge
      Px.bevel(bCtx, 12, 8, 8, 4, '#4a759c', '#2b4d6b', '#122536');
      Px.dot(bCtx, 16, 10, '#ffd23a'); // Brass anchor badge
    } else if (data.id === 'christie') {
      // Houndstooth tweed pattern on coat
      Px.dither(bCtx, 10, 21, 12, 6, '#473c2b', '#c2b39b', 'check');
      // Pearl necklace with individual gleaming pearls
      [13, 15, 17, 19].forEach(x => { Px.dot(bCtx, x, 22, '#ffffff'); Px.dot(bCtx, x, 23, '#a3a099'); });
      // Polished Brass Monocle with glass lens reflection
      Px.ring(bCtx, 18, 14, 2.5, 1, '#ffd23a');
      Px.dot(bCtx, 17, 14, '#c9ffff'); // Glass shine
      Px.line(bCtx, 20, 16, 21, 20, '#d4af37'); // Gold chain
    } else if (data.id === 'woolf') {
      // Sage green draped silk scarf
      Px.bevel(bCtx, 11, 20, 10, 4, '#8ee0b2', '#4ea375', '#205237');
      // Carved silver lighthouse brooch
      Px.bevel(bCtx, 15, 21, 3, 3, '#ffffff', '#cbd4de', '#57626e');
      Px.dot(bCtx, 16, 22, '#ffd23a'); // Lighthouse beacon
    } else if (data.id === 'austen') {
      // Regency amber straw bonnet with pleated lace frill
      Px.ring(bCtx, 16, 12, 6, 2, '#f2b23a');
      Px.dither(bCtx, 10, 11, 12, 2, '#fff4a0', '#c98f0e', 'check');
      // Sealed manuscript scroll tucked in bodice
      Px.rect(bCtx, 13, 22, 5, 3, '#fff6d6');
      Px.dot(bCtx, 15, 23, '#c91c1c'); // Crimson wax seal
    } else if (data.id === 'tolken') {
      // Herringbone tweed vest
      Px.dither(bCtx, 11, 21, 10, 6, '#5a3d24', '#8a623e', 'lines');
      // Carved briarwood pipe with glowing cherry ember
      Px.line(bCtx, 17, 18, 22, 19, '#42240c');
      Px.bevel(bCtx, 22, 17, 3, 4, '#8a4c19', '#42240c', '#1f0d02');
      Px.dot(bCtx, 23, 17, '#ff4d00'); // Hot ember
      Px.dot(bCtx, 24, 15, '#c7c2bc'); // Smoke wisp
      Px.dot(bCtx, 25, 14, '#e6e2dc');
    } else if (data.id === 'twain') {
      // White three-piece linen suit with black bow tie
      Px.bevel(bCtx, 10, 21, 12, 6, '#ffffff', '#e8eef5', '#8a9aa8');
      Px.dot(bCtx, 15, 21, '#100c14'); Px.dot(bCtx, 16, 21, '#100c14');
      // Voluminous white hair & walrus mustache
      Px.sphere(bCtx, 11, 13, 3.2, ['#ffffff', '#ffffff', '#e0e7f0', '#94a2b3']);
      Px.sphere(bCtx, 21, 13, 3.2, ['#ffffff', '#ffffff', '#e0e7f0', '#94a2b3']);
      Px.bevel(bCtx, 13, 17, 7, 3, '#ffffff', '#f0f4f8', '#9bb0c4'); // Mustache
    }

    ctx.drawImage(buf, 0, 0, w * scale, h * scale);
    return cv;
  }

  // ==========================================================================
  // SECTION 2: THE 5 IMI MEDIA STUDIOS (48x48 Vintage Studio Hardware)
  // ==========================================================================
  const STUDIOS_DATA = [
    {
      id: 'songs',
      name: 'Jungle Records',
      unit: 'Song',
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

  function renderStudioHardware(studioId, scale = 2) {
    const data = STUDIOS_DATA.find(s => s.id === studioId) || STUDIOS_DATA[0];
    const w = 48, h = 48;
    const cv = makeCanvas(w * scale, h * scale);
    if (cv._mock) return cv;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const buf = makeCanvas(w, h);
    const bCtx = buf.getContext('2d');
    bCtx.imageSmoothingEnabled = false;

    // Ground cast shadow underneath hardware
    Px.rect(bCtx, 6, 43, 36, 3, '#070a08');
    Px.dither(bCtx, 4, 44, 40, 2, '#070a08', '#00000000', 'check');

    if (data.hardware === 'phonograph') {
      // 1. Gramophone / Phonograph with deep carved wood & flared brass horn
      // Polished dark mahogany plinth with 3D beveled moldings
      Px.bevel(bCtx, 7, 28, 34, 15, '#8a4b22', '#4a250e', '#1e0c04', '#0d0501');
      // Inset burl wood veneer panel with dither
      Px.bevel(bCtx, 11, 32, 26, 8, '#703b1a', '#3d1d09', '#170902');
      Px.dither(bCtx, 12, 33, 24, 6, '#47220c', '#301606', 'check');

      // Brass turn crank on left
      Px.line(bCtx, 4, 34, 7, 34, '#ffd23a');
      Px.bevel(bCtx, 3, 31, 3, 6, '#fff4a0', '#d4af37', '#73570c');

      // Turntable Felt Platen & 45 RPM Black Vinyl Disc with Grooves
      Px.bevel(bCtx, 13, 24, 24, 4, '#54545c', '#202026', '#0d0d12');
      // Concentric vinyl reflection sheen
      Px.line(bCtx, 15, 25, 22, 25, '#737385');
      Px.line(bCtx, 27, 26, 34, 26, '#737385');
      // Red record center label with spindle hole
      Px.dot(bCtx, 24, 25, '#e02828'); Px.dot(bCtx, 25, 25, '#e02828');
      Px.dot(bCtx, 24, 25, '#ffd23a');

      // Polished Brass Acoustic Soundbox & Tonearm
      Px.cylH(bCtx, 33, 16, 3, 10, ['#fff4a0', '#ffd23a', '#9e7408', '#422f02']);
      Px.line(bCtx, 33, 17, 28, 23, '#d4af37'); // Needle arm
      Px.sphere(bCtx, 28, 23, 2, ['#ffffff', '#ffd23a', '#9e7408', '#422f02']); // Soundbox head

      // Giant Fluted Brass Morning-Glory Horn with Deep Volumetric Shading
      // Outer horn bell (flares out top-left)
      Px.sphere(bCtx, 18, 12, 11, ['#fffbe0', '#ffd23a', '#c78f16', '#614003', '#1f1300']);
      // Fluted Petal Ribs (Scalloped flower edges)
      for (let k = 0; k < 8; k++) {
        const a = k * Math.PI / 4;
        const rx = 18 + Math.cos(a) * 10, ry = 12 + Math.sin(a) * 10;
        Px.dot(bCtx, rx, ry, '#fffbe0');
      }
      // Deep horn throat (Interior darkness)
      Px.sphere(bCtx, 18, 12, 6, ['#8a5e0b', '#3d2602', '#1a0f00', '#0a0500']);

      // Floating sparkling musical eighth notes
      Px.dot(bCtx, 8, 4, '#ff5d73'); Px.line(bCtx, 8, 4, 8, 1, '#ff5d73'); Px.dot(bCtx, 9, 1, '#ff5d73');
      Px.dot(bCtx, 36, 6, '#ffd23a'); Px.line(bCtx, 36, 6, 36, 3, '#ffd23a'); Px.dot(bCtx, 37, 3, '#ffd23a');

    } else if (data.hardware === 'crt_tv') {
      // 2. Vintage CRT Television with rounded walnut cabinet and scanlines
      // Curved Walnut Console Cabinet
      Px.bevel(bCtx, 6, 10, 36, 30, '#8a5229', '#4d2b12', '#1f0e04', '#0d0501');
      // Slanted tapered mid-century peg legs with brass ferrules
      Px.line(bCtx, 9, 40, 6, 45, '#2e1808'); Px.dot(bCtx, 6, 45, '#ffd23a');
      Px.line(bCtx, 38, 40, 41, 45, '#2e1808'); Px.dot(bCtx, 41, 45, '#ffd23a');

      // Telescoping Chrome Rabbit-Ear Antennas
      Px.line(bCtx, 24, 10, 14, 2, '#d4d8e3'); Px.dot(bCtx, 14, 2, '#ffffff');
      Px.line(bCtx, 24, 10, 34, 2, '#d4d8e3'); Px.dot(bCtx, 34, 2, '#ffffff');

      // Recessed CRT Bezel with dark shadow drop
      Px.bevel(bCtx, 9, 13, 23, 23, '#1a242e', '#0d131a', '#05070a');
      // Curved Glass Screen Phosphor Face
      Px.rect(bCtx, 11, 15, 19, 19, '#1a3347');
      // Phosphor scanline texture
      for (let y = 15; y <= 33; y += 2) {
        Px.line(bCtx, 11, y, 29, y, '#264b69');
      }
      // Glass Curved Specular Glint (Reflecting room window)
      Px.line(bCtx, 12, 16, 17, 16, '#7cc4f7');
      Px.line(bCtx, 12, 17, 14, 17, '#7cc4f7');

      // Test Broadcast Monkey Face on Screen
      Px.circle(bCtx, 20, 25, 4, '#e0aa76');
      Px.dot(bCtx, 19, 24, '#0f1a24'); Px.dot(bCtx, 21, 24, '#0f1a24');
      Px.line(bCtx, 19, 26, 21, 26, '#0f1a24');

      // Control Panel Cluster (Right Side)
      Px.bevel(bCtx, 33, 14, 7, 21, '#613b1c', '#381f0c', '#140902');
      // Gold Flanged Channel Selector Dials
      Px.sphere(bCtx, 36, 18, 2.5, ['#fff4a0', '#ffd23a', '#9e7408', '#422f02']);
      Px.sphere(bCtx, 36, 24, 2.5, ['#fff4a0', '#ffd23a', '#9e7408', '#422f02']);
      // Speaker Slats
      Px.line(bCtx, 34, 29, 38, 29, '#140902');
      Px.line(bCtx, 34, 31, 38, 31, '#140902');

    } else if (data.hardware === 'cathedral_radio') {
      // 3. Art Deco Cathedral Radio with woven grille cloth and amber glow
      // Gothic Pointed Arch Cabinet
      Px.sphere(bCtx, 24, 18, 16, ['#96582a', '#613514', '#3b1d08', '#140701']);
      Px.bevel(bCtx, 8, 18, 32, 23, '#8a4e22', '#542d10', '#241003');

      // Speaker Grille Cloth (Woven herringbone dither)
      Px.dither(bCtx, 13, 10, 22, 16, '#96784d', '#4d3a20', 'check');
      // Laser-cut Decorative Tree/Vine Fretwork
      Px.line(bCtx, 24, 10, 24, 25, '#2e190a');
      Px.line(bCtx, 18, 15, 30, 15, '#2e190a');
      Px.ring(bCtx, 24, 14, 3, 1, '#2e190a');

      // Illuminated Warm Amber Tuning Dial with Backlight
      Px.bevel(bCtx, 15, 27, 18, 6, '#170c04', '#0a0501', '#000000');
      Px.cylH(bCtx, 16, 28, 16, 4, ['#fff4a0', '#ffaa2b', '#c7700e', '#592e02']);
      // Frequency hash marks & red needle
      Px.line(bCtx, 17, 30, 31, 30, '#592e02');
      Px.line(bCtx, 24, 28, 24, 31, '#ff2222'); // Active red needle

      // Triple Bakelite Fluted Knobs
      [14, 24, 34].forEach(kx => {
        Px.sphere(bCtx, kx, 37, 2.5, ['#fff4a0', '#d4af37', '#73570c', '#2b1f02']);
      });

      // Broadcast electromagnetic radio wave arcs
      Px.ring(bCtx, 24, 5, 5, 1, '#7be05a');
      Px.ring(bCtx, 24, 5, 9, 1, '#7be05a88');

    } else if (data.hardware === 'theater_stage') {
      // 4. Vaudeville Stage with heavy draped crimson velvet & comedy/tragedy masks
      // Ornate Gilded Proscenium Columns & Arch
      Px.bevel(bCtx, 4, 6, 7, 36, '#ffd23a', '#b58312', '#543b02');
      Px.bevel(bCtx, 37, 6, 7, 36, '#ffd23a', '#b58312', '#543b02');
      Px.bevel(bCtx, 4, 4, 40, 5, '#fff4a0', '#d4af37', '#73570c');

      // Hardwood Plank Stage with Perspective Grain
      Px.bevel(bCtx, 7, 36, 34, 7, '#d49b5d', '#8c5a27', '#3d2209');
      for (let px = 11; px <= 37; px += 6) Px.line(bCtx, px, 36, px, 42, '#3d2209');

      // Glowing Footlight Shells with yellow halos
      for (let fx = 11; fx <= 37; fx += 6) {
        Px.sphere(bCtx, fx, 39, 1.8, ['#ffffff', '#fff4a0', '#e5b836', '#875d14']);
      }

      // Crimson Velvet Draped Curtains with Deep Fold Shading
      Px.dither(bCtx, 11, 7, 9, 23, '#c91e3b', '#73091c', 'lines');
      Px.dither(bCtx, 28, 7, 9, 23, '#c91e3b', '#73091c', 'lines');
      // Gold Bullion Tassel Fringe
      Px.line(bCtx, 11, 30, 20, 30, '#ffd23a');
      Px.line(bCtx, 28, 30, 37, 30, '#ffd23a');

      // Top Valance Swags
      [16, 24, 32].forEach(vx => {
        Px.sphere(bCtx, vx, 9, 4.5, ['#ff4d6a', '#c91e3b', '#6b0819', '#2b0108']);
      });

      // Shaded Comedy (Gold) & Tragedy (Silver) Theatrical Drama Masks
      // Comedy mask (Left)
      Px.sphere(bCtx, 21, 21, 3.5, ['#fff4a0', '#ffd23a', '#9e7408', '#422f02']);
      Px.dot(bCtx, 20, 20, '#1a0e02'); Px.dot(bCtx, 22, 20, '#1a0e02'); // Slanted happy eyes
      Px.line(bCtx, 20, 22, 22, 22, '#c91e3b'); // Smiling red mouth
      // Tragedy mask (Right)
      Px.sphere(bCtx, 27, 23, 3.5, ['#ffffff', '#b8c7d9', '#596d85', '#1a2838']);
      Px.dot(bCtx, 26, 22, '#0c1621'); Px.dot(bCtx, 28, 22, '#0c1621'); // Sad round eyes
      Px.dot(bCtx, 27, 24, '#0c1621'); // Open wailing mouth

    } else if (data.hardware === 'cine_camera') {
      // 5. 35mm Hand-Crank Cine Camera on wooden surveyor tripod
      // Solid Ashwood Tripod Legs with Steel Spikes & Braces
      Px.line(bCtx, 24, 27, 11, 46, '#bf8243'); Px.line(bCtx, 24, 27, 10, 46, '#73461a');
      Px.line(bCtx, 24, 27, 24, 46, '#a66d33'); Px.line(bCtx, 25, 27, 25, 46, '#5e340e');
      Px.line(bCtx, 24, 27, 37, 46, '#bf8243'); Px.line(bCtx, 25, 27, 38, 46, '#73461a');

      // Heavy Cast-Iron Camera Body with Wrinkle Finish
      Px.bevel(bCtx, 15, 14, 18, 14, '#474754', '#25252e', '#111117', '#08080a');
      Px.dither(bCtx, 16, 15, 16, 12, '#2d2d38', '#1c1c24', 'check');

      // Dual 35mm Film Mag Circles with Machined Screws
      Px.sphere(bCtx, 20, 10, 5, ['#6b6b7a', '#3b3b47', '#1a1a21', '#0b0b0e']);
      Px.sphere(bCtx, 28, 10, 5, ['#6b6b7a', '#3b3b47', '#1a1a21', '#0b0b0e']);
      Px.dot(bCtx, 20, 10, '#ffffff'); Px.dot(bCtx, 28, 10, '#ffffff');

      // Rotating Lens Turret with Anti-Reflective Optical Glass
      Px.cylH(bCtx, 7, 18, 8, 6, ['#fff4a0', '#d4af37', '#8a650c', '#3b2901']);
      Px.bevel(bCtx, 5, 17, 3, 8, '#ffffff', '#b8b8c4', '#42424d');
      // Blue coated lens reflection
      Px.sphere(bCtx, 6, 21, 2.5, ['#ffffff', '#76dbf7', '#167a9e', '#062d3d']);

      // Side Hand Crank with turned wooden handle
      Px.line(bCtx, 27, 20, 33, 20, '#d4af37');
      Px.bevel(bCtx, 33, 16, 3, 5, '#bf8243', '#73461a', '#2e1804');

      // Director's Clapperboard sitting propped on right
      Px.bevel(bCtx, 32, 29, 13, 11, '#ffffff', '#e8e8e3', '#73736b');
      Px.rect(bCtx, 32, 28, 13, 3, '#100c14');
      // Crisp Zebra Stripes
      Px.line(bCtx, 33, 28, 35, 30, '#ffffff');
      Px.line(bCtx, 37, 28, 39, 30, '#ffffff');
      Px.line(bCtx, 41, 28, 43, 30, '#ffffff');
      // Chalkboard text lines
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

  function renderGardenAsset(assetId, char = 'E', scale = 2) {
    const w = 32, h = 32;
    const cv = makeCanvas(w * scale, h * scale);
    if (cv._mock) return cv;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const buf = makeCanvas(w, h);
    const bCtx = buf.getContext('2d');
    bCtx.imageSmoothingEnabled = false;

    if (assetId === 'seed_packet') {
      // Textured Heavy Kraft Paper Envelope with 3D folded flap
      Px.rect(bCtx, 8, 4, 18, 25, '#17120a'); // Drop shadow
      Px.bevel(bCtx, 7, 3, 18, 25, '#f0e2ba', '#c7b385', '#6b5c3b', '#261f12');
      Px.dither(bCtx, 8, 4, 16, 23, '#d4c294', '#baa77b', 'check');

      // Top folded envelope flap with shadow crease
      Px.line(bCtx, 7, 3, 16, 10, '#8c774d');
      Px.line(bCtx, 24, 3, 16, 10, '#8c774d');
      Px.line(bCtx, 8, 11, 23, 11, '#54462a'); // Cast shadow from flap

      // Botanical Seed Engraving Medallion
      Px.sphere(bCtx, 16, 17, 5, ['#88db8d', '#3ea645', '#1c6321', '#0b2b0e']);
      bCtx.fillStyle = '#ffffff';
      bCtx.font = 'bold 8px monospace';
      bCtx.textAlign = 'center';
      bCtx.textBaseline = 'middle';
      bCtx.fillText(char, 16, 17);

      // Ribbon seal binding
      Px.line(bCtx, 13, 24, 19, 24, '#c91c1c');

    } else if (assetId === 'soil_empty') {
      // Cedar Timber Garden Bed Edging with Square Forged Nails
      Px.bevel(bCtx, 2, 2, 28, 28, '#a66b37', '#6b3f1c', '#2e1708', '#120701');
      // Rich, Dark Moist Loam Soil with Clods & Pebbles
      Px.rect(bCtx, 5, 5, 22, 22, '#1a0d05');
      Px.dither(bCtx, 5, 5, 22, 22, '#2b160a', '#140a04', 'check');

      // Furrow Trenches with Deep Shading
      [10, 16, 22].forEach(fy => {
        Px.line(bCtx, 6, fy, 25, fy, '#0a0401');
        Px.line(bCtx, 6, fy + 1, 25, fy + 1, '#3b1f0f');
      });
      // Mineral pebbles & earth crumbs
      Px.dot(bCtx, 9, 8, '#706b63'); Px.dot(bCtx, 21, 13, '#706b63');
      Px.dot(bCtx, 14, 20, '#8f745d');

      // Forged Square Corner Nails
      [[3,3], [27,3], [3,27], [27,27]].forEach(([nx, ny]) => {
        Px.dot(bCtx, nx, ny, '#ffffff'); Px.dot(bCtx, nx + 1, ny + 1, '#2e353d');
      });

      // Glowing Golden '+' Planting Prompt
      Px.bevel(bCtx, 15, 12, 3, 9, '#fff4a0', '#74c648', '#2f6e16');
      Px.bevel(bCtx, 12, 15, 9, 3, '#fff4a0', '#74c648', '#2f6e16');

    } else if (assetId === 'sprout') {
      // Dark Soil Base
      Px.bevel(bCtx, 2, 2, 28, 28, '#a66b37', '#6b3f1c', '#2e1708', '#120701');
      Px.dither(bCtx, 5, 5, 22, 22, '#2b160a', '#140a04', 'check');

      // Tender Seedling Stem with highlight
      Px.line(bCtx, 16, 25, 16, 16, '#246b29');
      Px.line(bCtx, 15, 25, 15, 17, '#59bf60');

      // Twin Volumetric Cotyledon Leaves with Veins
      Px.sphere(bCtx, 12, 15, 3.5, ['#e5ff99', '#8ce645', '#3f9914', '#174705']);
      Px.sphere(bCtx, 20, 15, 3.5, ['#e5ff99', '#8ce645', '#3f9914', '#174705']);
      // Glistening Dewdrop on Leaf Tip
      Px.dot(bCtx, 10, 14, '#ffffff'); Px.dot(bCtx, 11, 15, '#c7f0ff');

    } else if (assetId === 'budding') {
      Px.bevel(bCtx, 2, 2, 28, 28, '#a66b37', '#6b3f1c', '#2e1708', '#120701');
      Px.dither(bCtx, 5, 5, 22, 22, '#2b160a', '#140a04', 'check');

      // Bamboo Support Stake with notches
      Px.cylV(bCtx, 18, 5, 2, 22, ['#fff4a0', '#c2a84d', '#736124']);

      // Twisting Vine with leaf nodes
      Px.line(bCtx, 15, 25, 16, 18, '#3f9914');
      Px.line(bCtx, 16, 18, 14, 13, '#3f9914');
      Px.line(bCtx, 14, 13, 17, 9, '#59bf60');

      // Lush Side Foliage
      Px.sphere(bCtx, 10, 19, 3, ['#bbf268', '#59bf60', '#1c6321', '#0b2b0e']);
      Px.sphere(bCtx, 21, 16, 3, ['#bbf268', '#59bf60', '#1c6321', '#0b2b0e']);

      // Swelling Golden Alphabet Calyx Bud with light gradient
      Px.sphere(bCtx, 15, 9, 4.5, ['#fffbe0', '#ffd23a', '#c78f16', '#614003']);

    } else if (assetId === 'blooming') {
      Px.bevel(bCtx, 2, 2, 28, 28, '#a66b37', '#6b3f1c', '#2e1708', '#120701');
      Px.dither(bCtx, 5, 5, 22, 22, '#2b160a', '#140a04', 'check');

      // Flourishing Support Vine
      Px.line(bCtx, 16, 26, 16, 17, '#3f9914');
      Px.sphere(bCtx, 8, 20, 4, ['#bbf268', '#59bf60', '#1c6321', '#0b2b0e']);
      Px.sphere(bCtx, 24, 20, 4, ['#bbf268', '#59bf60', '#1c6321', '#0b2b0e']);

      // Giant Radiant Alphabet Bloom with Multi-Tier Petals
      Px.sphere(bCtx, 16, 11, 9, ['#fffbe0', '#ffd23a', '#e07d12', '#7a3902', '#240f00']);
      Px.sphere(bCtx, 16, 11, 6, ['#ffffff', '#fff4a0', '#ffd23a', '#b87c09']);

      // Diamond starlight glints on flower
      Px.line(bCtx, 7, 7, 7, 10, '#ffffff'); Px.line(bCtx, 6, 8, 9, 8, '#ffffff');
      Px.line(bCtx, 25, 6, 25, 9, '#ffffff'); Px.line(bCtx, 24, 7, 27, 7, '#ffffff');

      // Crisp 3D Plump Alphabet Letter
      bCtx.fillStyle = '#1e0c03';
      bCtx.font = 'bold 9px monospace';
      bCtx.textAlign = 'center';
      bCtx.textBaseline = 'middle';
      bCtx.fillText(char, 16, 12);
      bCtx.fillStyle = '#ffffff';
      bCtx.fillText(char, 15.5, 11.5);

    } else if (assetId === 'watering_can') {
      // Hammered Galvanized Tin Watering Can with Soldered Seams
      Px.bevel(bCtx, 10, 11, 13, 16, '#d6e1ed', '#8c9eb0', '#475666', '#1c242e');
      Px.dither(bCtx, 11, 12, 11, 14, '#9bb0c4', '#708396', 'check');

      // Rolled Rim & Base Flange
      Px.line(bCtx, 9, 11, 23, 11, '#ffffff');
      Px.line(bCtx, 9, 27, 23, 27, '#242f3b');

      // Tubular Top & Rear Handle
      Px.ring(bCtx, 7, 18, 5, 2, '#475666');
      Px.line(bCtx, 11, 11, 16, 7, '#8c9eb0'); // Top bridge

      // Angled Spout with Flanged Brass Rose Sprinkler
      Px.line(bCtx, 22, 22, 29, 13, '#b0c2d4');
      Px.line(bCtx, 23, 23, 30, 14, '#475666');
      Px.sphere(bCtx, 30, 12, 3, ['#fff4a0', '#ffd23a', '#9e7408', '#422f02']);

      // Refractive Glistening Water Droplets
      [[30,17], [27,21], [31,24]].forEach(([dx, dy]) => {
        Px.dot(bCtx, dx, dy, '#ffffff'); Px.dot(bCtx, dx, dy + 1, '#66c9ff');
      });
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
      name: 'Radiant Golden Banana',
      desc: 'Rare celestial banana that bursts with frenzy bonuses, royal rushes, and star rains'
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

  function renderShopItem(itemId, scale = 2) {
    const w = 32, h = 32;
    const cv = makeCanvas(w * scale, h * scale);
    if (cv._mock) return cv;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const buf = makeCanvas(w, h);
    const bCtx = buf.getContext('2d');
    bCtx.imageSmoothingEnabled = false;

    if (itemId === 'golden_banana') {
      // Radiant Multi-Layer Divine Aura with Dither
      Px.dither(bCtx, 3, 3, 26, 26, '#ffd23a33', '#00000000', 'check');
      Px.sphere(bCtx, 16, 16, 12, ['#ffffff44', '#ffd23a55', '#b8860b22', '#00000000']);

      // 24K Pure Solid Gold Banana with Volumetric Facets
      for (let i = 0; i < 9; i++) {
        const x = 12 + i * 1.1;
        const y = 20 - Math.sin(i * 0.38) * 9;
        Px.sphere(bCtx, x, y, 3.8, ['#ffffff', '#fff7b8', '#ffd23a', '#b38004', '#422e02']);
      }
      // Woody Golden Stem & Crown Tip
      Px.sphere(bCtx, 11, 20, 2, ['#ffd23a', '#b38004', '#593f02', '#241901']);
      Px.sphere(bCtx, 22, 13, 2, ['#ffd23a', '#b38004', '#593f02', '#241901']);

      // Specular Star Glints (Diamond Sparkles)
      [[21,6], [9,21], [24,18]].forEach(([gx, gy]) => {
        Px.line(bCtx, gx - 2, gy, gx + 2, gy, '#ffffff');
        Px.line(bCtx, gx, gy - 2, gx, gy + 2, '#ffffff');
        Px.dot(bCtx, gx, gy, '#fffbe0');
      });

    } else if (itemId === 'rotten_banana') {
      // Soft Bruised Mushy Banana with Mold Pockets
      for (let i = 0; i < 9; i++) {
        const x = 12 + i * 1.1;
        const y = 20 - Math.sin(i * 0.38) * 9;
        Px.sphere(bCtx, x, y, 3.8, ['#8c6e3b', '#543b18', '#2e1c07', '#120a02']);
      }
      // Toxic Green Penicillin Spore Patches with Dither
      Px.dither(bCtx, 14, 15, 4, 4, '#4f9e4b', '#1a4f17', 'check');
      Px.dither(bCtx, 19, 13, 3, 3, '#78c973', '#245921', 'check');

      // Buzzing Fruit Flies with Wing Translucency
      [[8,9], [24,8], [17,4], [25,23]].forEach(([fx, fy]) => {
        Px.dot(bCtx, fx, fy, '#080504');
        Px.dot(bCtx, fx - 1, fy - 1, '#b0d9e8'); // Wing shine
        Px.dot(bCtx, fx + 1, fy - 1, '#b0d9e8');
      });

    } else if (itemId === 'hold_weight') {
      // Cast-Iron Foundry Weight with Rough Sand-Casting Texture
      Px.bevel(bCtx, 5, 17, 22, 12, '#5e6873', '#2b333b', '#12161a', '#080a0d');
      Px.dither(bCtx, 6, 18, 20, 10, '#3a444f', '#242a30', 'check');

      // Machined Chamfer Step
      Px.bevel(bCtx, 8, 15, 16, 3, '#7b8794', '#47535e', '#1c2226');

      // Heavy Polished Brass Lifting Eyelet Ring
      Px.ring(bCtx, 16, 10, 5, 2, '#ffd23a');
      Px.line(bCtx, 13, 8, 15, 6, '#ffffff'); // Glint
      Px.bevel(bCtx, 14, 14, 4, 3, '#fff4a0', '#c29a27', '#594408');

      // Stamped Recessed "5 KG"
      bCtx.fillStyle = '#12161a';
      bCtx.font = 'bold 7px monospace';
      bCtx.fillText('5KG', 10.5, 25.5);
      bCtx.fillStyle = '#7b8794';
      bCtx.fillText('5KG', 10, 25);

    } else if (itemId === 'metronome') {
      // Pyramidal Polished Rosewood Metronome Body
      Px.bevel(bCtx, 7, 27, 18, 4, '#733116', '#3b1506', '#140601', '#080200');
      // Front Slanted Face
      for (let y = 5; y <= 27; y++) {
        const spread = (y - 5) * 0.38;
        const x0 = Math.round(16 - spread), x1 = Math.round(16 + spread);
        Px.line(bCtx, x0, y, x1, y, '#54210c');
        Px.dot(bCtx, x0, y, '#8c3d1b'); // Left highlight
        Px.dot(bCtx, x1, y, '#1f0902'); // Right shadow
      }

      // Cutout Pendulum Faceplate
      Px.bevel(bCtx, 12, 9, 8, 17, '#1f0902', '#0d0401', '#000000');
      Px.cylV(bCtx, 13, 10, 6, 15, ['#fffae0', '#f2d89b', '#bda05e']);

      // Spring Steel Pendulum Rod with Angled Motion
      Px.line(bCtx, 16, 23, 21, 9, '#5e6873');
      Px.line(bCtx, 15, 23, 20, 9, '#ffffff'); // Steel glint

      // Sliding Brass Counterweight
      Px.bevel(bCtx, 18, 12, 5, 4, '#fff4a0', '#ffd23a', '#8a650c');

    } else if (itemId === 'double_hammer') {
      // Twin Mechanical Typebars with Blued-Steel Finish
      Px.line(bCtx, 7, 26, 15, 10, '#38434f');
      Px.line(bCtx, 8, 26, 16, 10, '#73879c');
      Px.line(bCtx, 11, 26, 19, 10, '#38434f');
      Px.line(bCtx, 12, 26, 20, 10, '#73879c');

      // Hardened Machined Lead/Steel Hammer Slugs with Bevel
      Px.bevel(bCtx, 13, 6, 5, 6, '#8fa4ba', '#4d5d6e', '#1c242e');
      Px.bevel(bCtx, 19, 6, 5, 6, '#8fa4ba', '#4d5d6e', '#1c242e');

      // Tension Coil Springs
      for (let y = 17; y <= 24; y += 2) {
        Px.line(bCtx, 13, y, 16, y + 1, '#ffd23a');
      }

      // Hardened Steel Pivot Pin
      Px.sphere(bCtx, 9, 26, 2, ['#ffffff', '#73879c', '#2b343d']);

    } else if (itemId === 'publishing_contracts') {
      // Aged Yellowed Parchment Scroll with Deckled Edges & Dropped Shadow
      Px.rect(bCtx, 7, 7, 19, 19, '#1a140a');
      Px.bevel(bCtx, 6, 6, 19, 19, '#fffcf0', '#f2e5b8', '#baa874', '#3b321c');
      Px.dither(bCtx, 7, 7, 17, 17, '#f7edd2', '#e8d7a7', 'check');

      // Top and Bottom Curled Rolls
      Px.cylH(bCtx, 5, 4, 21, 3, ['#ffffff', '#e8d7a7', '#8a7647']);
      Px.cylH(bCtx, 5, 24, 21, 3, ['#ffffff', '#e8d7a7', '#8a7647']);

      // Calligraphic Law Lines
      [9, 12, 15, 18].forEach(ly => {
        Px.line(bCtx, 9, ly, 21, ly, '#59442a');
        Px.dot(bCtx, 9, ly - 1, '#7a5f3d');
      });

      // Vermilion Wax Seal with Ribbon Tails
      Px.sphere(bCtx, 16, 21, 4.5, ['#ff6e6e', '#d62222', '#820a0a', '#360202']);
      Px.sphere(bCtx, 16, 21, 2.5, ['#ffa6a6', '#ff2e2e', '#a30f0f']);
      // Silk Ribbon Tails
      Px.line(bCtx, 14, 24, 12, 29, '#a30f0f');
      Px.line(bCtx, 17, 24, 19, 29, '#a30f0f');
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

  function renderAwardBadge(awardId, scale = 2) {
    const w = 32, h = 32;
    const cv = makeCanvas(w * scale, h * scale);
    if (cv._mock) return cv;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const buf = makeCanvas(w, h);
    const bCtx = buf.getContext('2d');
    bCtx.imageSmoothingEnabled = false;

    if (awardId.startsWith('trophy_')) {
      const isGold = awardId.includes('gold');
      const isSilver = awardId.includes('silver');

      const ramp = isGold
        ? ['#ffffff', '#fff7b8', '#ffd23a', '#b38004', '#422e02']
        : isSilver
        ? ['#ffffff', '#e8f0f8', '#99abbd', '#49596b', '#19222c']
        : ['#ffeed4', '#c98a53', '#7d4a20', '#42230a', '#170a02'];

      // Ground Cast Shadow
      Px.rect(bCtx, 7, 29, 18, 2, '#0a0a0d');

      // Heavy Tiered Pedestal Base
      Px.bevel(bCtx, 7, 24, 18, 5, ramp[1], ramp[2], ramp[3], ramp[4]);
      Px.bevel(bCtx, 9, 21, 14, 3, ramp[0], ramp[1], ramp[3]);

      // Fluted Chalice Stem
      Px.cylV(bCtx, 14, 16, 4, 6, [ramp[0], ramp[1], ramp[2], ramp[3]]);

      // Massive Trophy Chalice Cup with Deep Volumetrics
      Px.sphere(bCtx, 16, 12, 7.5, ramp);
      Px.cylH(bCtx, 9, 6, 14, 3, [ramp[0], ramp[1], ramp[2], ramp[3]]);

      // Sculpted Handles on Both Sides
      Px.ring(bCtx, 8, 11, 4.5, 2, ramp[2]);
      Px.line(bCtx, 6, 9, 8, 8, ramp[0]); // Left highlight
      Px.ring(bCtx, 24, 11, 4.5, 2, ramp[2]);
      Px.line(bCtx, 24, 9, 26, 11, ramp[3]); // Right shadow

      if (isGold) {
        // Regal Crown Rim with Emerald & Ruby Jewels
        Px.dot(bCtx, 11, 5, '#e02828'); // Ruby
        Px.dot(bCtx, 16, 4, '#24b34b'); // Emerald
        Px.dot(bCtx, 21, 5, '#e02828');
        // Brilliant Star Glints
        Px.line(bCtx, 12, 10, 12, 12, '#ffffff'); Px.line(bCtx, 11, 11, 13, 11, '#ffffff');
      }

    } else if (awardId === 'ribbon_blue') {
      // Rosette Medal with Deep Pleated Ribbon Folds
      Px.sphere(bCtx, 16, 12, 8.5, ['#577ee8', '#264bb8', '#112975', '#071238']);
      // Scalloped Pleated Rosette Edge
      for (let i = 0; i < 12; i++) {
        const a = i * Math.PI / 6;
        Px.dot(bCtx, 16 + Math.cos(a) * 8, 12 + Math.sin(a) * 8, '#769bff');
      }

      // Gold Center Seal with Relief Star
      Px.sphere(bCtx, 16, 12, 4, ['#fff4a0', '#ffd23a', '#9e7408', '#422f02']);
      Px.dot(bCtx, 16, 12, '#ffffff');

      // V-Notched Silk Streamer Tails with Shaded Folds
      Px.bevel(bCtx, 11, 18, 4, 11, '#4268d6', '#1e3ea8', '#0b1d5c');
      Px.bevel(bCtx, 17, 18, 4, 11, '#4268d6', '#1e3ea8', '#0b1d5c');
      // V-Cut notch
      Px.dot(bCtx, 12, 28, '#00000000'); Px.dot(bCtx, 13, 27, '#00000000');
      Px.dot(bCtx, 18, 28, '#00000000'); Px.dot(bCtx, 19, 27, '#00000000');

    } else if (awardId === 'legacy_star') {
      // 8-Point Cosmic Prestige Star with Faceted Diamond Shading
      // Outer Radiant Starburst
      for (let k = 0; k < 8; k++) {
        const a = k * Math.PI / 4;
        Px.line(bCtx, 16, 16, 16 + Math.cos(a) * 14, 16 + Math.sin(a) * 14, '#ffd23a');
        Px.dot(bCtx, 16 + Math.cos(a) * 14, 16 + Math.sin(a) * 14, '#ffffff');
      }
      // Faceted Beveled Star Core
      Px.sphere(bCtx, 16, 16, 7, ['#ffffff', '#fff7b8', '#ffd23a', '#b38004', '#422e02']);
      // Diamond center facet
      Px.line(bCtx, 16, 11, 16, 21, '#ffffff');
      Px.line(bCtx, 11, 16, 21, 16, '#ffffff');
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

  function renderBookSpine(bandIndex = 0, scale = 2) {
    const data = BOOK_SPINES_DATA[Math.min(5, Math.max(0, bandIndex))];
    const w = 16, h = 54;
    const cv = makeCanvas(w * scale, h * scale);
    if (cv._mock) return cv;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const buf = makeCanvas(w, h);
    const bCtx = buf.getContext('2d');
    bCtx.imageSmoothingEnabled = false;

    const bw = data.width, bh = data.height;
    const bx = Math.round((w - bw) / 2);
    const by = 52 - bh;

    // Shelf Shadow Under Book
    Px.rect(bCtx, bx + 1, by + 1, bw, bh, '#070506');

    // Volumetric Cylindrical Leather Spine (Curved from left highlight to right shadow)
    Px.cylV(bCtx, bx, by, bw, bh, ['#ffffff44', data.color, data.color, '#00000044', '#00000088']);

    // Headband & Tailband (Woven cloth binding ribbon top & bottom)
    Px.dither(bCtx, bx, by, bw, 2, '#ffffff', '#c91c1c', 'lines');
    Px.dither(bCtx, bx, by + bh - 2, bw, 2, '#ffffff', '#c91c1c', 'lines');

    // Embossed Gilded Horizontal Raised Bands (Double Gold Tooling)
    [by + 4, by + 7, by + bh - 9, by + bh - 6].forEach(ry => {
      Px.line(bCtx, bx, ry, bx + bw - 1, ry, '#ffd23a');
      Px.line(bCtx, bx, ry + 1, bx + bw - 1, ry + 1, '#8a6208');
    });

    // Gold-Bordered Title Cartouche Inset with Shaded Borders
    Px.bevel(bCtx, bx + 1, by + 11, bw - 2, bh - 23, '#ffd23a', '#0d0a08', '#4a370e');
    Px.rect(bCtx, bx + 2, by + 12, bw - 4, bh - 25, '#fffcf2');

    // Embossed Vertical Gold Spine Typography Simulation
    for (let y = by + 14; y < by + bh - 15; y += 3) {
      Px.line(bCtx, bx + 3, y, bx + bw - 4, y, '#2e1c0c');
      Px.dot(bCtx, bx + 3, y, '#ffd23a');
    }

    // Braided Silk Bookmark Ribbon Tassel Hanging Out Bottom
    Px.line(bCtx, bx + Math.round(bw / 2), by + bh - 1, bx + Math.round(bw / 2) + 2, by + bh + 4, '#c91c1c');
    Px.dot(bCtx, bx + Math.round(bw / 2) + 2, by + bh + 4, '#ffd23a'); // Gold bead tip

    ctx.drawImage(buf, 0, 0, w * scale, h * scale);
    return cv;
  }

  // ==========================================================================
  // SECTION 7: WEATHER & CELESTIAL HEADER TOYS (36x36)
  // ==========================================================================
  function renderWeatherToy(stateIndex = 0, scale = 2) {
    // 0 = Clear Sun, 1 = Drizzle Cloud, 2 = Heavy Rain, 3 = Thunderstorm
    const w = 36, h = 36;
    const cv = makeCanvas(w * scale, h * scale);
    if (cv._mock) return cv;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const buf = makeCanvas(w, h);
    const bCtx = buf.getContext('2d');
    bCtx.imageSmoothingEnabled = false;

    if (stateIndex === 0) {
      // Radiant Multi-Layer Solar Corona with Pulsing Flares
      for (let k = 0; k < 12; k++) {
        const a = k * Math.PI / 6;
        const x1 = Math.round(18 + Math.cos(a) * 10);
        const y1 = Math.round(18 + Math.sin(a) * 10);
        const x2 = Math.round(18 + Math.cos(a) * 15);
        const y2 = Math.round(18 + Math.sin(a) * 15);
        Px.line(bCtx, x1, y1, x2, y2, '#ffd23a');
        Px.dot(bCtx, x2, y2, '#ffffff');
      }
      // Volumetric 3D Sun Sphere
      Px.sphere(bCtx, 18, 18, 9, ['#ffffff', '#fff7b8', '#ffc62a', '#e07604', '#6b3400']);

      // Cheerful Stepped Primate Eyes & Grin
      Px.rect(bCtx, 15, 16, 2, 2, '#421f00'); Px.dot(bCtx, 15, 16, '#ffffff');
      Px.rect(bCtx, 19, 16, 2, 2, '#421f00'); Px.dot(bCtx, 19, 16, '#ffffff');
      Px.line(bCtx, 16, 20, 20, 20, '#421f00');
      Px.dot(bCtx, 15, 19, '#421f00'); Px.dot(bCtx, 21, 19, '#421f00');

    } else {
      const isStorm = stateIndex === 3;
      const isRain = stateIndex >= 2;

      const cBase = isStorm ? '#3b435c' : '#ffffff';
      const cMid = isStorm ? '#22283b' : '#c9d7e8';
      const cDark = isStorm ? '#101421' : '#768fa8';

      // Volumetric Billowing Cloud Lobes with Rim Light & Underside Shadow
      Px.sphere(bCtx, 13, 16, 7.5, [cBase, cBase, cMid, cDark]);
      Px.sphere(bCtx, 21, 12, 8.5, [cBase, cBase, cMid, cDark]);
      Px.sphere(bCtx, 27, 16, 6.5, [cBase, cBase, cMid, cDark]);
      // Dense Underside Atmosphere
      Px.dither(bCtx, 9, 18, 20, 5, cMid, cDark, 'check');

      if (isStorm) {
        // Jagged Electric Blue-White Forked Lightning Bolt
        Px.line(bCtx, 21, 17, 17, 24, '#ffffff');
        Px.line(bCtx, 22, 17, 18, 24, '#c7f0ff');
        Px.line(bCtx, 17, 24, 21, 24, '#ffffff');
        Px.line(bCtx, 21, 24, 15, 33, '#ffffff');
        Px.line(bCtx, 22, 24, 16, 33, '#70d6ff');
        // Secondary fork
        Px.line(bCtx, 19, 27, 24, 31, '#ffffff');
      } else {
        // Cascading Diagonal Raindrop Streaks
        const drops = isRain
          ? [[9,24], [13,28], [17,25], [21,29], [25,24], [29,28], [15,31], [23,32]]
          : [[12,25], [20,27], [26,26]];
        drops.forEach(([dx, dy]) => {
          Px.line(bCtx, dx, dy, dx - 1, dy + 3, '#76d4ff');
          Px.dot(bCtx, dx, dy, '#ffffff'); // Water glint
        });
      }
    }

    ctx.drawImage(buf, 0, 0, w * scale, h * scale);
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
    renderWeatherToy
  };
});

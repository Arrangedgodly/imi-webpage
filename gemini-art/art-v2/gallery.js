/* ============================================================================
   MONKEYOS V2 - ART PASS 2 INTERACTIVE GALLERY
   Full integer scaling, frame scrubber, onion skin, A/B comparison,
   reduced motion, and copy asset JSON.
   ============================================================================ */
(function () {
  'use strict';

  let currentScale = 3;
  let currentSpeed = 1.0;
  let isGlobalPaused = false;
  let isReducedMotion = false;
  let currentCategory = 'all';

  const animControllers = [];

  function initGallery() {
    setupGlobalControls();
    renderCategory('all');
  }

  function setupGlobalControls() {
    // Scale buttons
    document.querySelectorAll('.scale-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        document.querySelectorAll('.scale-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentScale = parseInt(btn.dataset.scale, 10);
        updateAllScales();
      });
    });

    // Speed buttons
    document.querySelectorAll('.spd-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        document.querySelectorAll('.spd-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentSpeed = parseFloat(btn.dataset.speed);
      });
    });

    // Pause toggle
    const pauseCheck = document.getElementById('global-pause');
    if (pauseCheck) {
      pauseCheck.addEventListener('change', e => {
        isGlobalPaused = e.target.checked;
      });
    }

    // Reduced motion toggle
    const motionCheck = document.getElementById('reduced-motion');
    if (motionCheck) {
      motionCheck.addEventListener('change', e => {
        isReducedMotion = e.target.checked;
        animControllers.forEach(c => c.setReducedMotion(isReducedMotion));
      });
    }

    // Category tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.dataset.cat;
        if (currentCategory === 'keyart') {
          document.getElementById('gallery-container').style.display = 'none';
          document.getElementById('keyart-container').style.display = 'block';
          renderKeyArt();
        } else {
          document.getElementById('gallery-container').style.display = 'grid';
          document.getElementById('keyart-container').style.display = 'none';
          renderCategory(currentCategory);
        }
      });
    });
  }

  function renderCategory(cat) {
    const container = document.getElementById('gallery-container');
    container.innerHTML = '';
    animControllers.length = 0;

    const assets = window.ArtV2Manifest ? window.ArtV2Manifest.assets : [];
    const filtered = (cat === 'all') ? assets : assets.filter(a => a.category === cat);

    if (filtered.length === 0) {
      container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-dim);">No assets loaded in category "${cat}" yet.</div>`;
      return;
    }

    filtered.forEach(asset => {
      const card = createAssetCard(asset);
      container.appendChild(card);
    });
  }

  function createAssetCard(asset) {
    const card = document.createElement('div');
    card.className = 'asset-card';
    card.id = `card-${asset.id}`;

    const [w, h] = asset.size;
    const isPartA = ['muses', 'studios', 'garden', 'shop', 'awards', 'library', 'weather'].includes(asset.category);

    // Badges
    const lintBadge = asset.lintPass
      ? `<span class="badge badge-pass">✓ LINT PASS</span>`
      : `<span class="badge badge-human">⚠️ LINT FAIL</span>`;
    const humanBadge = asset.needsHuman ? `<span class="badge badge-human">NEEDS HUMAN</span>` : '';
    const criticScore = asset.criticMin ? `<span class="badge badge-critic">CRITIC: ${asset.criticMin}/5</span>` : '';

    // Color Swatches
    let swatchesHtml = '';
    let colorCount = 0;
    if (asset.palette) {
      for (const k in asset.palette) {
        const hex = asset.palette[k];
        if (hex) {
          colorCount++;
          swatchesHtml += `<div class="color-swatch" style="background: ${hex};" title="${k}: ${hex}"></div>`;
        }
      }
    }

    card.innerHTML = `
      <div class="card-header">
        <div>
          <div class="card-title">${asset.id}</div>
          <div class="card-meta">${asset.category} · ${w}×${h} · ${asset.framesCount}f @ ${asset.fps}fps · ${colorCount} cols · ${asset.motionPct || '0'}% motion</div>
        </div>
        <div class="badges">
          ${lintBadge}
          ${criticScore}
          ${humanBadge}
        </div>
      </div>
      <div class="views-container">
        ${isPartA ? `
          <div class="view-box">
            <span class="view-label">Before (Lab)</span>
            <canvas class="cv-before" width="${w * currentScale}" height="${h * currentScale}"></canvas>
          </div>
        ` : ''}
        <div class="view-box">
          <span class="view-label">${isPartA ? 'After (Pass 2)' : 'Pass 2 Art'}</span>
          <canvas class="cv-after" width="${w * currentScale}" height="${h * currentScale}"></canvas>
        </div>
      </div>
      <div class="card-notes">${asset.notes || 'Hand-drawn pixel art animation'}</div>
      <div class="palette-strip">
        <span style="font-size: 11px; color: var(--text-dim); margin-right: 4px;">Palette:</span>
        ${swatchesHtml}
      </div>
      <div class="card-controls">
        <button class="btn-play">Pause</button>
        <button class="btn-onion">Onion: Off</button>
        <input type="range" class="scrubber" min="0" max="${asset.framesCount - 1}" value="0">
        <span class="frame-indicator" style="font-size: 11px; min-width: 32px; font-family: monospace;">0/${asset.framesCount}</span>
        <button class="btn-copy">Copy JSON</button>
      </div>
    `;

    // Setup Canvas Animation Controller
    const cvAfter = card.querySelector('.cv-after');
    const cvBefore = card.querySelector('.cv-before');
    const btnPlay = card.querySelector('.btn-play');
    const btnOnion = card.querySelector('.btn-onion');
    const scrubber = card.querySelector('.scrubber');
    const frameInd = card.querySelector('.frame-indicator');
    const btnCopy = card.querySelector('.btn-copy');

    btnCopy.addEventListener('click', () => {
      const json = JSON.stringify(asset.rawAsset || asset, null, 2);
      navigator.clipboard.writeText(json).then(() => {
        btnCopy.textContent = 'Copied!';
        setTimeout(() => { btnCopy.textContent = 'Copy JSON'; }, 1500);
      });
    });

    const ctrl = initCardController({
      asset,
      cvAfter,
      cvBefore,
      btnPlay,
      btnOnion,
      scrubber,
      frameInd,
      w,
      h
    });

    animControllers.push(ctrl);
    return card;
  }

  function initCardController({ asset, cvAfter, cvBefore, btnPlay, btnOnion, scrubber, frameInd, w, h }) {
    const ctxAfter = cvAfter.getContext('2d');
    ctxAfter.imageSmoothingEnabled = false;

    let ctxBefore = null;
    let beforeFrames = null;
    if (cvBefore) {
      ctxBefore = cvBefore.getContext('2d');
      ctxBefore.imageSmoothingEnabled = false;
      // Load baseline frames if GameComponents exists
      if (window.GameComponents && window.GameComponents.getComponentAnimationFrames) {
        try {
          beforeFrames = window.GameComponents.getComponentAnimationFrames(asset.category, asset.id, 1, 8);
        } catch (e) {}
      }
    }

    const resolved = window.ArtV2 && window.ArtV2.Resolver
      ? window.ArtV2.Resolver.resolveAsset(asset.rawAsset || asset)
      : null;

    let isPlaying = true;
    let isOnion = false;
    let curFrame = 0;
    let lastTime = performance.now();
    let frameAccum = 0;

    function renderFrame(fIdx) {
      curFrame = fIdx % asset.framesCount;
      scrubber.value = curFrame;
      frameInd.textContent = `${curFrame}/${asset.framesCount}`;

      // Render After
      ctxAfter.clearRect(0, 0, cvAfter.width, cvAfter.height);
      if (resolved && resolved.frames[curFrame]) {
        // Onion skin previous frame
        if (isOnion && curFrame > 0 && resolved.frames[curFrame - 1]) {
          ctxAfter.globalAlpha = 0.3;
          drawRgbaToCanvas(ctxAfter, resolved.frames[curFrame - 1].rgba, w, h, currentScale);
          ctxAfter.globalAlpha = 1.0;
        }
        drawRgbaToCanvas(ctxAfter, resolved.frames[curFrame].rgba, w, h, currentScale);
      }

      // Render Before
      if (ctxBefore && beforeFrames && beforeFrames.length > 0) {
        ctxBefore.clearRect(0, 0, cvBefore.width, cvBefore.height);
        const bFrame = beforeFrames[curFrame % beforeFrames.length];
        if (bFrame) {
          ctxBefore.drawImage(bFrame, 0, 0, cvBefore.width, cvBefore.height);
        }
      }
    }

    function tick(now) {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (isPlaying && !isGlobalPaused && !isReducedMotion) {
        const frameInterval = 1 / ((asset.fps || 8) * currentSpeed);
        frameAccum += delta;
        if (frameAccum >= frameInterval) {
          const advance = Math.floor(frameAccum / frameInterval);
          frameAccum -= advance * frameInterval;
          renderFrame(curFrame + advance);
        }
      }
      requestAnimationFrame(tick);
    }

    btnPlay.addEventListener('click', () => {
      isPlaying = !isPlaying;
      btnPlay.textContent = isPlaying ? 'Pause' : 'Play';
    });

    btnOnion.addEventListener('click', () => {
      isOnion = !isOnion;
      btnOnion.textContent = isOnion ? 'Onion: ON' : 'Onion: Off';
      btnOnion.classList.toggle('active', isOnion);
      renderFrame(curFrame);
    });

    scrubber.addEventListener('input', e => {
      isPlaying = false;
      btnPlay.textContent = 'Play';
      renderFrame(parseInt(e.target.value, 10));
    });

    renderFrame(0);
    requestAnimationFrame(tick);

    return {
      setReducedMotion(reduced) {
        if (reduced) {
          renderFrame(asset.staticFrame || 0);
        }
      },
      updateScale(scale) {
        cvAfter.width = w * scale;
        cvAfter.height = h * scale;
        ctxAfter.imageSmoothingEnabled = false;
        if (cvBefore) {
          cvBefore.width = w * scale;
          cvBefore.height = h * scale;
          ctxBefore.imageSmoothingEnabled = false;
        }
        renderFrame(curFrame);
      }
    };
  }

  function drawRgbaToCanvas(ctx, rgba, w, h, scale) {
    // Create an offscreen buffer canvas of w, h
    const off = document.createElement('canvas');
    off.width = w;
    off.height = h;
    const offCtx = off.getContext('2d');
    const imgData = offCtx.createImageData(w, h);
    imgData.data.set(rgba);
    offCtx.putImageData(imgData, 0, 0);

    ctx.drawImage(off, 0, 0, w * scale, h * scale);
  }

  function updateAllScales() {
    animControllers.forEach(c => c.updateScale(currentScale));
  }

  function renderKeyArt() {
    const dayBox = document.getElementById('strip-day');
    const nightBox = document.getElementById('strip-night');
    const plankBox = document.getElementById('strip-plank');
    dayBox.innerHTML = ''; nightBox.innerHTML = ''; plankBox.innerHTML = '';

    const assets = window.ArtV2Manifest ? window.ArtV2Manifest.assets : [];
    assets.slice(0, 12).forEach(asset => {
      const resolved = window.ArtV2 && window.ArtV2.Resolver
        ? window.ArtV2.Resolver.resolveAsset(asset.rawAsset || asset)
        : null;
      if (!resolved) return;

      [dayBox, nightBox, plankBox].forEach(box => {
        const [w, h] = asset.size;
        const cv = document.createElement('canvas');
        cv.width = w * 3;
        cv.height = h * 3;
        const ctx = cv.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        const frame0 = resolved.frames[asset.staticFrame || 0];
        drawRgbaToCanvas(ctx, frame0.rgba, w, h, 3);
        box.appendChild(cv);
      });
    });
  }

  window.addEventListener('DOMContentLoaded', initGallery);
})();

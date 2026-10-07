/* ============================================================================
   MONKEYOS V2 - ART PASS 2 BASELINE RENDERER
   Renders the existing 41 Lab components from ../game-components.js
   into art-v2/baseline/<category>_<id>.png horizontal strips (scale 1).
   Works both in Node (via lightweight Canvas shim) and in browser.
   ============================================================================ */
const fs = require('fs');
const path = require('path');
const { encodePng, stitchHorizontalStrip } = require('./png.js');

// Lightweight RGBA Canvas Shim for Node
function parseColor(str) {
  if (!str) return [0, 0, 0, 0];
  str = str.trim();
  if (str.startsWith('#')) {
    const hex = str.slice(1);
    if (hex.length === 3) {
      return [parseInt(hex[0]+hex[0],16), parseInt(hex[1]+hex[1],16), parseInt(hex[2]+hex[2],16), 255];
    }
    if (hex.length === 6) {
      return [parseInt(hex.slice(0,2),16), parseInt(hex.slice(2,4),16), parseInt(hex.slice(4,6),16), 255];
    }
    if (hex.length === 8) {
      return [parseInt(hex.slice(0,2),16), parseInt(hex.slice(2,4),16), parseInt(hex.slice(4,6),16), parseInt(hex.slice(6,8),16)];
    }
  } else if (str.startsWith('rgba')) {
    const m = str.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/);
    if (m) {
      const a = m[4] !== undefined ? Math.round(parseFloat(m[4]) * 255) : 255;
      return [parseInt(m[1],10), parseInt(m[2],10), parseInt(m[3],10), a];
    }
  }
  return [0, 0, 0, 255];
}

class ShimContext2D {
  constructor(canvas) {
    this.canvas = canvas;
    this.fillStyle = '#000000';
    this._fillColor = [0, 0, 0, 255];
    this.imageSmoothingEnabled = false;
  }

  set fillStyle(val) {
    this._styleStr = val;
    this._fillColor = parseColor(val);
  }
  get fillStyle() { return this._styleStr; }

  clearRect(x, y, w, h) {
    const cw = this.canvas.width;
    const ch = this.canvas.height;
    const x0 = Math.max(0, Math.floor(x)), y0 = Math.max(0, Math.floor(y));
    const x1 = Math.min(cw, Math.ceil(x + w)), y1 = Math.min(ch, Math.ceil(y + h));
    for (let py = y0; py < y1; py++) {
      for (let px = x0; px < x1; px++) {
        const i = (py * cw + px) * 4;
        this.canvas.data[i] = 0;
        this.canvas.data[i + 1] = 0;
        this.canvas.data[i + 2] = 0;
        this.canvas.data[i + 3] = 0;
      }
    }
  }

  fillRect(x, y, w, h) {
    const cw = this.canvas.width;
    const ch = this.canvas.height;
    const [sr, sg, sb, sa] = this._fillColor;
    if (sa === 0) return;

    const x0 = Math.max(0, Math.floor(x)), y0 = Math.max(0, Math.floor(y));
    const x1 = Math.min(cw, Math.ceil(x + w)), y1 = Math.min(ch, Math.ceil(y + h));

    for (let py = y0; py < y1; py++) {
      for (let px = x0; px < x1; px++) {
        const i = (py * cw + px) * 4;
        if (sa === 255) {
          this.canvas.data[i] = sr;
          this.canvas.data[i + 1] = sg;
          this.canvas.data[i + 2] = sb;
          this.canvas.data[i + 3] = 255;
        } else {
          // Alpha blending
          const da = this.canvas.data[i + 3] / 255;
          const aNorm = sa / 255;
          const outA = aNorm + da * (1 - aNorm);
          if (outA > 0) {
            this.canvas.data[i] = Math.round((sr * aNorm + this.canvas.data[i] * da * (1 - aNorm)) / outA);
            this.canvas.data[i + 1] = Math.round((sg * aNorm + this.canvas.data[i + 1] * da * (1 - aNorm)) / outA);
            this.canvas.data[i + 2] = Math.round((sb * aNorm + this.canvas.data[i + 2] * da * (1 - aNorm)) / outA);
            this.canvas.data[i + 3] = Math.round(outA * 255);
          }
        }
      }
    }
  }

  drawImage(src, dx, dy, dw, dh) {
    const cw = this.canvas.width;
    const ch = this.canvas.height;
    const sw = src.width;
    const sh = src.height;
    const sData = src.data;
    if (!sData) return;

    dx = dx || 0; dy = dy || 0;
    dw = dw !== undefined ? dw : sw;
    dh = dh !== undefined ? dh : sh;

    const scaleX = dw / sw;
    const scaleY = dh / sh;

    for (let sy = 0; sy < sh; sy++) {
      for (let sx = 0; sx < sw; sx++) {
        const si = (sy * sw + sx) * 4;
        const sr = sData[si];
        const sg = sData[si + 1];
        const sb = sData[si + 2];
        const sa = sData[si + 3];
        if (sa === 0) continue;

        const tx0 = Math.floor(dx + sx * scaleX);
        const ty0 = Math.floor(dy + sy * scaleY);
        const tx1 = Math.floor(dx + (sx + 1) * scaleX);
        const ty1 = Math.floor(dy + (sy + 1) * scaleY);

        for (let py = ty0; py < ty1; py++) {
          if (py < 0 || py >= ch) continue;
          for (let px = tx0; px < tx1; px++) {
            if (px < 0 || px >= cw) continue;
            const di = (py * cw + px) * 4;
            if (sa === 255) {
              this.canvas.data[di] = sr;
              this.canvas.data[di + 1] = sg;
              this.canvas.data[di + 2] = sb;
              this.canvas.data[di + 3] = 255;
            } else {
              const da = this.canvas.data[di + 3] / 255;
              const aNorm = sa / 255;
              const outA = aNorm + da * (1 - aNorm);
              if (outA > 0) {
                this.canvas.data[di] = Math.round((sr * aNorm + this.canvas.data[di] * da * (1 - aNorm)) / outA);
                this.canvas.data[di + 1] = Math.round((sg * aNorm + this.canvas.data[di + 1] * da * (1 - aNorm)) / outA);
                this.canvas.data[di + 2] = Math.round((sb * aNorm + this.canvas.data[di + 2] * da * (1 - aNorm)) / outA);
                this.canvas.data[di + 3] = Math.round(outA * 255);
              }
            }
          }
        }
      }
    }
  }

  fillText() {} // Fallback for font calls
}

class ShimCanvas {
  constructor(w, h) {
    this.width = w;
    this.height = h;
    this.data = new Uint8Array(w * h * 4);
    this._ctx = new ShimContext2D(this);
  }
  getContext(type) {
    if (type === '2d') return this._ctx;
    return null;
  }
}

// Install Shim into global environment if in Node
if (typeof document === 'undefined') {
  global.document = {
    createElement(tag) {
      if (tag === 'canvas') return new ShimCanvas(32, 32);
      return {};
    }
  };
}

function renderBaseline() {
  const GC = require(path.resolve(__dirname, '../../game-components.js'));
  const baselineDir = path.resolve(__dirname, '../baseline');
  if (!fs.existsSync(baselineDir)) {
    fs.mkdirSync(baselineDir, { recursive: true });
  }

  console.log('Rendering 41 baseline components from game-components.js...');
  let count = 0;

  function renderAndSave(category, idOrIdx, saveId) {
    // Generate 8 animation frames at scale 1
    const frameCanvases = GC.getComponentAnimationFrames(category, idOrIdx, 1, 8);
    const frames = frameCanvases.map((cv, idx) => ({
      index: idx,
      width: cv.width,
      height: cv.height,
      rgba: cv.data
    }));

    const strip = stitchHorizontalStrip(frames);
    const png = encodePng(strip.width, strip.height, strip.rgba);
    const outPath = path.join(baselineDir, `${category}_${saveId}.png`);
    fs.writeFileSync(outPath, png);
    count++;
  }

  // 1. Muses (9)
  GC.MUSES_DATA.forEach(m => renderAndSave('muses', m.id, m.id));

  // 2. Studios (5)
  GC.STUDIOS_DATA.forEach(s => renderAndSave('studios', s.id, s.id));

  // 3. Garden (6)
  GC.GARDEN_STAGES.forEach(g => renderAndSave('garden', g.id, g.id));

  // 4. Shop (6)
  GC.SHOP_ITEMS_DATA.forEach(item => renderAndSave('shop', item.id, item.id));

  // 5. Awards (5)
  GC.AWARDS_TIERS_DATA.forEach(a => renderAndSave('awards', a.id, a.id));

  // 6. Library (6)
  for (let idx = 0; idx < 6; idx++) {
    renderAndSave('library', idx, `band${idx + 1}`);
  }

  // 7. Weather (4)
  const weatherIds = ['sun', 'drizzle', 'monsoon', 'thunderstorm'];
  weatherIds.forEach(id => renderAndSave('weather', id, id));

  console.log(`✓ Successfully rendered all ${count} baseline components into art-v2/baseline/`);
}

if (require.main === module) {
  renderBaseline();
}

module.exports = { renderBaseline };

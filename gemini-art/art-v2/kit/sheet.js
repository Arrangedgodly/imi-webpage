/* ============================================================================
   MONKEYOS V2 - ART PASS 2 CONTACT SHEET GENERATOR
   Renders contact sheets per category at 1x and 3x on both dark (#1a0f14)
   and light (#e4f9b0) backgrounds, labelled with asset IDs.
   Usage: node art-v2/kit/sheet.js [category | all]
   ============================================================================ */
const fs = require('fs');
const path = require('path');
const { resolveAsset, hexToRgba } = require('./resolve.js');
const { encodePng, scaleRgba } = require('./png.js');

// Simple 3x5 bitmap font for ASCII label rendering
const FONT3X5 = {
  ' ': [0, 0, 0, 0, 0],
  '-': [0, 0, 7, 0, 0],
  '_': [0, 0, 0, 0, 7],
  '.': [0, 0, 0, 0, 2],
  ':': [0, 2, 0, 2, 0],
  '0': [7, 5, 5, 5, 7],
  '1': [2, 6, 2, 2, 7],
  '2': [7, 1, 7, 4, 7],
  '3': [7, 1, 7, 1, 7],
  '4': [5, 5, 7, 1, 1],
  '5': [7, 4, 7, 1, 7],
  '6': [7, 4, 7, 5, 7],
  '7': [7, 1, 2, 2, 2],
  '8': [7, 5, 7, 5, 7],
  '9': [7, 5, 7, 1, 7],
  'a': [7, 5, 7, 5, 5],
  'b': [6, 5, 7, 5, 7],
  'c': [7, 4, 4, 4, 7],
  'd': [6, 5, 5, 5, 7],
  'e': [7, 4, 7, 4, 7],
  'f': [7, 4, 6, 4, 4],
  'g': [7, 4, 5, 5, 7],
  'h': [5, 5, 7, 5, 5],
  'i': [7, 2, 2, 2, 7],
  'j': [1, 1, 1, 5, 7],
  'k': [5, 5, 6, 5, 5],
  'l': [4, 4, 4, 4, 7],
  'm': [5, 7, 5, 5, 5],
  'n': [7, 5, 5, 5, 5],
  'o': [7, 5, 5, 5, 7],
  'p': [7, 5, 7, 4, 4],
  'q': [7, 5, 5, 7, 1],
  'r': [7, 5, 6, 5, 5],
  's': [7, 4, 7, 1, 7],
  't': [7, 2, 2, 2, 2],
  'u': [5, 5, 5, 5, 7],
  'v': [5, 5, 5, 5, 2],
  'w': [5, 5, 5, 7, 5],
  'x': [5, 5, 2, 5, 5],
  'y': [5, 5, 7, 1, 7],
  'z': [7, 1, 2, 4, 7]
};

function drawChar(buf, bufW, bufH, x, y, char, col) {
  const glyph = FONT3X5[char.toLowerCase()] || FONT3X5[' '];
  for (let r = 0; r < 5; r++) {
    const rowBits = glyph[r];
    for (let c = 0; c < 3; c++) {
      if ((rowBits & (4 >> c)) !== 0) {
        const px = x + c;
        const py = y + r;
        if (px >= 0 && px < bufW && py >= 0 && py < bufH) {
          const idx = (py * bufW + px) * 4;
          buf[idx] = col[0];
          buf[idx + 1] = col[1];
          buf[idx + 2] = col[2];
          buf[idx + 3] = 255;
        }
      }
    }
  }
}

function drawText(buf, bufW, bufH, x, y, text, col) {
  for (let i = 0; i < text.length; i++) {
    drawChar(buf, bufW, bufH, x + i * 4, y, text[i], col);
  }
}

function buildCategorySheet(category, assetList, bgHex, textColHex) {
  const bgCol = hexToRgba(bgHex);
  const textCol = hexToRgba(textColHex);

  const padding = 8;
  const labelHeight = 8;
  const assetSpacing = 8;

  // Compute row dimensions for each asset: label + frames strip
  const rows = assetList.map(asset => {
    const resolved = resolveAsset(asset);
    const fCount = resolved.frames.length;
    const [fw, fh] = resolved.size;
    const width = Math.max(resolved.id.length * 4 + 8, fCount * (fw + 2));
    const height = labelHeight + fh + 4;
    return { asset, resolved, width, height, fw, fh, fCount };
  });

  const maxRowWidth = Math.max(160, ...rows.map(r => r.width));
  const sheetW = padding * 2 + maxRowWidth;
  let totalH = padding;
  rows.forEach(r => { totalH += r.height + assetSpacing; });
  totalH += padding;

  const rgba = new Uint8Array(sheetW * totalH * 4);
  // Fill background
  for (let p = 0; p < sheetW * totalH; p++) {
    rgba[p * 4] = bgCol[0];
    rgba[p * 4 + 1] = bgCol[1];
    rgba[p * 4 + 2] = bgCol[2];
    rgba[p * 4 + 3] = 255;
  }

  // Draw header category label
  let curY = padding;

  rows.forEach(row => {
    // Draw label
    const label = `${row.resolved.id} (${row.fw}x${row.fh}, ${row.fCount}f)`;
    drawText(rgba, sheetW, totalH, padding, curY, label, textCol);

    // Draw frames horizontally
    const frameStartY = curY + labelHeight;
    for (let f = 0; f < row.fCount; f++) {
      const fObj = row.resolved.frames[f];
      const startX = padding + f * (row.fw + 2);

      // Checkered frame box border (subtle)
      for (let y = 0; y < row.fh; y++) {
        for (let x = 0; x < row.fw; x++) {
          const srcIdx = (y * row.fw + x) * 4;
          const a = fObj.rgba[srcIdx + 3];
          const dstX = startX + x;
          const dstY = frameStartY + y;
          if (dstX < sheetW && dstY < totalH) {
            const dstIdx = (dstY * sheetW + dstX) * 4;
            if (a > 0) {
              rgba[dstIdx] = fObj.rgba[srcIdx];
              rgba[dstIdx + 1] = fObj.rgba[srcIdx + 1];
              rgba[dstIdx + 2] = fObj.rgba[srcIdx + 2];
              rgba[dstIdx + 3] = 255;
            }
          }
        }
      }
    }

    curY += row.height + assetSpacing;
  });

  return { width: sheetW, height: totalH, rgba };
}

function generateSheets(categoryName = 'all') {
  const assetsRoot = path.join(__dirname, '..', 'assets');
  const sheetsOut = path.join(__dirname, '..', 'sheets');
  if (!fs.existsSync(sheetsOut)) fs.mkdirSync(sheetsOut, { recursive: true });

  const categories = fs.existsSync(assetsRoot)
    ? fs.readdirSync(assetsRoot).filter(c => fs.statSync(path.join(assetsRoot, c)).isDirectory())
    : [];

  const targets = (categoryName === 'all' || !categoryName) ? categories : [categoryName];

  targets.forEach(cat => {
    const catDir = path.join(assetsRoot, cat);
    if (!fs.existsSync(catDir)) return;
    const files = fs.readdirSync(catDir).filter(f => f.endsWith('.js') && !f.includes('test'));
    if (files.length === 0) return;

    const assets = files.map(f => require(path.join(catDir, f)));
    console.log(`Generating sheets for category '${cat}' (${assets.length} assets)...`);

    // 1. Dark Sheet (#1a0f14 background, gold text #ffd23a)
    const dark1x = buildCategorySheet(cat, assets, '#1a0f14', '#ffd23a');
    fs.writeFileSync(path.join(sheetsOut, `${cat}_dark_1x.png`), encodePng(dark1x.width, dark1x.height, dark1x.rgba));
    const dark3x = scaleRgba(dark1x.width, dark1x.height, dark1x.rgba, 3);
    fs.writeFileSync(path.join(sheetsOut, `${cat}_dark_3x.png`), encodePng(dark3x.width, dark3x.height, dark3x.rgba));

    // 2. Light Sheet (#e4f9b0 background, dark ink text #1a0f14)
    const light1x = buildCategorySheet(cat, assets, '#e4f9b0', '#1a0f14');
    fs.writeFileSync(path.join(sheetsOut, `${cat}_light_1x.png`), encodePng(light1x.width, light1x.height, light1x.rgba));
    const light3x = scaleRgba(light1x.width, light1x.height, light1x.rgba, 3);
    fs.writeFileSync(path.join(sheetsOut, `${cat}_light_3x.png`), encodePng(light3x.width, light3x.height, light3x.rgba));

    console.log(`  ✓ Written dark & light sheets for ${cat} (1x and 3x) in art-v2/sheets/`);
  });
}

if (require.main === module) {
  const catArg = process.argv[2] || 'all';
  generateSheets(catArg);
}

module.exports = {
  buildCategorySheet,
  generateSheets
};

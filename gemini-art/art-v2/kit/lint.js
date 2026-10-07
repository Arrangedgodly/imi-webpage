/* ============================================================================
   MONKEYOS V2 - ART PASS 2 LINT GATES
   Enforces the Look Bible quality bar and fails non-zero on any violation.
   Usage: node art-v2/kit/lint.js <file|dir>
   ============================================================================ */
const fs = require('fs');
const path = require('path');
const { resolveAsset } = require('./resolve.js');
const { RAMPS } = require('./palette.js');

// Collect all standard ramp hex colors in lowercase
const KNOWN_RAMP_HEX = new Set();
for (const k in RAMPS) {
  RAMPS[k].forEach(h => KNOWN_RAMP_HEX.add(h.toLowerCase()));
}

function hexFromRgb(r, g, b) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function lintAsset(asset) {
  const resolved = resolveAsset(asset);
  const [w, h] = resolved.size;
  const frames = resolved.frames;
  const frameCount = frames.length;
  const totalPx = w * h;
  const isLarge = w >= 64 || h >= 64;
  const maxColors = isLarge ? 24 : 16;
  const sparklesSet = new Set((resolved.sparkles || []).map(([x, y]) => `${x},${y}`));

  const failures = [];
  const warnings = [];

  // 1. Colors & Alpha & Black & Ramp Check
  const distinctColors = new Set();
  const colorPixelCounts = {};
  let alphaInvalid = 0;
  let pureBlackCount = 0;

  frames.forEach(f => {
    const rgba = f.rgba;
    for (let i = 0; i < rgba.length; i += 4) {
      const r = rgba[i];
      const g = rgba[i + 1];
      const b = rgba[i + 2];
      const a = rgba[i + 3];

      if (a !== 0 && a !== 255) {
        alphaInvalid++;
      }

      if (a === 255) {
        const hex = hexFromRgb(r, g, b);
        distinctColors.add(hex);
        colorPixelCounts[hex] = (colorPixelCounts[hex] || 0) + 1;
        if (r === 0 && g === 0 && b === 0) {
          pureBlackCount++;
        }
      }
    }
  });

  if (distinctColors.size > maxColors) {
    failures.push(`colors: found ${distinctColors.size} distinct colors, max allowed is ${maxColors}`);
  }

  if (alphaInvalid > 0) {
    failures.push(`alpha: found ${alphaInvalid} pixels with alpha not in {0, 255}`);
  }

  if (pureBlackCount > 0) {
    failures.push(`black: found ${pureBlackCount} pixels of pure #000000 (selective colored outline required)`);
  }

  // 2. Stray ramp color check (> 6 pixels not in palette or RAMPS)
  const allowedHex = new Set(KNOWN_RAMP_HEX);
  if (asset.palette) {
    for (const k in asset.palette) {
      if (asset.palette[k]) allowedHex.add(asset.palette[k].toLowerCase());
    }
  }
  for (const hex in colorPixelCounts) {
    if (colorPixelCounts[hex] > 6 && !allowedHex.has(hex.toLowerCase())) {
      failures.push(`ramp: color ${hex} used ${colorPixelCounts[hex]} times is not in approved ramps or declared palette`);
    }
  }

  // 3. Orphans check (isolated pixels per frame not in sparkles)
  let maxOrphansInFrame = 0;
  frames.forEach((f, fIdx) => {
    let orphans = 0;
    const grid = f.grid;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (grid[y][x] !== '.') {
          if (sparklesSet.has(`${x},${y}`)) continue;
          // Check 4 orthogonal neighbors
          const up = y > 0 && grid[y - 1][x] !== '.';
          const down = y < h - 1 && grid[y + 1][x] !== '.';
          const left = x > 0 && grid[y][x - 1] !== '.';
          const right = x < w - 1 && grid[y][x + 1] !== '.';
          if (!up && !down && !left && !right) {
            orphans++;
          }
        }
      }
    }
    if (orphans > maxOrphansInFrame) maxOrphansInFrame = orphans;
  });

  if (maxOrphansInFrame > 2) {
    failures.push(`orphans: max unlisted orphan pixels in a single frame is ${maxOrphansInFrame} (> 2 allowed)`);
  }

  // 4. Motion & Loop & Silhouette Checks
  const diffs = [];
  const masks = [];

  for (let f = 0; f < frameCount; f++) {
    const cur = frames[f].rgba;
    const nxt = frames[(f + 1) % frameCount].rgba;
    let diffCount = 0;
    const mask = new Uint8Array(totalPx);

    for (let p = 0; p < totalPx; p++) {
      const idx = p * 4;
      if (cur[idx + 3] > 0) mask[p] = 1;

      if (cur[idx] !== nxt[idx] || cur[idx + 1] !== nxt[idx + 1] ||
          cur[idx + 2] !== nxt[idx + 2] || cur[idx + 3] !== nxt[idx + 3]) {
        diffCount++;
      }
    }
    masks.push(mask);
    diffs.push(diffCount);
  }

  // Median adjacent diff (excluding wrap-around diffs[frameCount - 1])
  const adjDiffs = diffs.slice(0, frameCount - 1);
  const sortedAdj = adjDiffs.slice().sort((a, b) => a - b);
  const medianAdjDiff = sortedAdj.length > 0 ? sortedAdj[Math.floor(sortedAdj.length / 2)] : 0;
  const medianMotionPct = (medianAdjDiff / totalPx) * 100;

  // Loop seam check
  const wrapDiff = diffs[frameCount - 1]; // diff(N-1, 0)
  if (resolved.loop) {
    if (frameCount > 2 && medianAdjDiff >= 2 && wrapDiff > Math.max(3, 1.5 * medianAdjDiff)) {
      failures.push(`loop: wrap diff (frame N-1 -> 0) is ${wrapDiff} px, exceeding 1.5x median adjacent diff (${medianAdjDiff} px)`);
    }
  } else {
    // One shot: must end on hold
    const lastDiff = diffs[frameCount - 2];
    if (lastDiff !== 0) {
      failures.push(`loop: one-shot asset must end on a hold frame, but last 2 frames differ by ${lastDiff} px`);
    }
  }

  // Motion bounds check
  if (!asset.still) {
    if (medianMotionPct < 1.5) {
      failures.push(`motion: median motion ${medianMotionPct.toFixed(2)}% < 1.5% (static picture)`);
    }
    if (medianMotionPct > 45.0) {
      failures.push(`motion: median motion ${medianMotionPct.toFixed(2)}% > 45.0% (flicker/repaint)`);
    }
  }

  // Silhouette check
  if (!asset.still) {
    let silhouetteMoved = false;
    for (let f = 1; f < frameCount; f++) {
      for (let p = 0; p < totalPx; p++) {
        if (masks[f][p] !== masks[0][p]) {
          silhouetteMoved = true;
          break;
        }
      }
      if (silhouetteMoved) break;
    }
    if (!silhouetteMoved && frameCount > 1) {
      failures.push(`silhouette: opaque mask is identical across all frames (silhouette does not move)`);
    }
  }

  // 5. Bounds Check (art touching all 4 sides is clipped, unless tile or frame or chrome)
  if (!asset.tile && !asset.frame && asset.category !== 'chrome') {
    let touchesTop = false, touchesBottom = false, touchesLeft = false, touchesRight = false;
    frames.forEach(f => {
      const g = f.grid;
      for (let x = 0; x < w; x++) {
        if (g[0][x] !== '.') touchesTop = true;
        if (g[h - 1][x] !== '.') touchesBottom = true;
      }
      for (let y = 0; y < h; y++) {
        if (g[y][0] !== '.') touchesLeft = true;
        if (g[y][w - 1] !== '.') touchesRight = true;
      }
    });
    if (touchesTop && touchesBottom && touchesLeft && touchesRight) {
      failures.push(`bounds: art touches canvas edge on all 4 sides (likely clipped sprite)`);
    }
  }

  // 6. Tile Check (left and right columns must match if tile: true)
  if (asset.tile) {
    let seamErrors = 0;
    frames.forEach(f => {
      const g = f.grid;
      for (let y = 0; y < h; y++) {
        if (g[y][0] !== g[y][w - 1]) seamErrors++;
      }
    });
    if (seamErrors > 0) {
      failures.push(`tile: tile=true asset has ${seamErrors} mismatched seam pixels between left and right columns`);
    }
  }

  return {
    id: resolved.id,
    category: resolved.category,
    size: resolved.size,
    colorCount: distinctColors.size,
    maxColors,
    frameCount,
    medianMotionPct: Number(medianMotionPct.toFixed(2)),
    pass: failures.length === 0,
    failures,
    warnings
  };
}

function runCli() {
  const target = process.argv[2];
  if (!target) {
    console.error('Usage: node art-v2/kit/lint.js <file.js | dir>');
    process.exit(1);
  }

  const stat = fs.statSync(target);
  const files = [];
  if (stat.isDirectory()) {
    function walk(dir) {
      fs.readdirSync(dir).forEach(name => {
        const full = path.join(dir, name);
        if (fs.statSync(full).isDirectory()) walk(full);
        else if (name.endsWith('.js') && !name.includes('test')) files.push(full);
      });
    }
    walk(target);
  } else {
    files.push(target);
  }

  if (files.length === 0) {
    console.log('No asset JS files found to lint.');
    process.exit(0);
  }

  console.log(`\nLinting ${files.length} asset(s)...\n`);
  console.log('| Asset ID | Cat | Size | Colors | Frames | Motion % | Status |');
  console.log('|---|---|---|---|---|---|---|');

  let allPass = true;
  const failureDetails = [];

  files.forEach(file => {
    try {
      const asset = require(path.resolve(file));
      const res = lintAsset(asset);
      const status = res.pass ? '✓ PASS' : '✗ FAIL';
      if (!res.pass) {
        allPass = false;
        failureDetails.push({ file, id: res.id, failures: res.failures });
      }
      console.log(`| ${res.id.padEnd(16)} | ${(res.category || '').padEnd(8)} | ${res.size.join('x').padEnd(7)} | ${String(res.colorCount).padStart(2)}/${res.maxColors} | ${String(res.frameCount).padStart(2)} | ${String(res.medianMotionPct).padStart(5)}% | ${status} |`);
    } catch (err) {
      allPass = false;
      failureDetails.push({ file, id: path.basename(file, '.js'), failures: [`Exception: ${err.message}`] });
      console.log(`| ${path.basename(file, '.js').padEnd(16)} | ERR | ERROR | -- | -- | -- | ✗ ERROR |`);
    }
  });

  if (failureDetails.length > 0) {
    console.log('\n--- LINT FAILURES ---');
    failureDetails.forEach(f => {
      console.log(`\n[${f.id}] (${f.file}):`);
      f.failures.forEach(msg => console.log(`  - ${msg}`));
    });
    console.log('');
    process.exit(1);
  } else {
    console.log('\n✓ All assets PASSED lint gates!\n');
    process.exit(0);
  }
}

if (require.main === module) {
  runCli();
}

module.exports = {
  lintAsset
};

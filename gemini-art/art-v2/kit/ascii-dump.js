/* ============================================================================
   MONKEYOS V2 - ART PASS 2 ASCII DUMP UTILITY
   Prints frames of an asset with character glyphs for quick console inspection.
   Usage: node art-v2/kit/ascii-dump.js <asset-file.js> [frameIndex]
   ============================================================================ */
const path = require('path');
const { resolveAsset } = require('./resolve.js');

const file = process.argv[2];
if (!file) {
  console.log('Usage: node art-v2/kit/ascii-dump.js <asset-file.js> [frameIndex]');
  process.exit(1);
}

const targetFrame = process.argv[3] !== undefined ? parseInt(process.argv[3], 10) : null;
const asset = require(path.resolve(file));
const resolved = resolveAsset(asset);

console.log(`\n=== Asset: ${resolved.id} (${resolved.category}) [${resolved.size.join('x')}] ===`);
console.log(`Frames: ${resolved.frames.length} | FPS: ${resolved.fps} | Loop: ${resolved.loop} | Static: ${resolved.staticFrame}`);
console.log('Palette:');
for (const k in resolved.palette) {
  console.log(`  '${k}': ${resolved.palette[k] || 'transparent'}`);
}

resolved.frames.forEach((f, idx) => {
  if (targetFrame !== null && targetFrame !== idx) return;
  console.log(`\n--- Frame ${idx} ---`);
  f.rows.forEach(r => console.log(r));
});
console.log('\n');

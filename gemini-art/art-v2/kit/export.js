/* ============================================================================
   MONKEYOS V2 - ART PASS 2 EXPORT RUNNER
   Exports all assets to art-v2/out/<category>/<id>.png, @3x.png, and <id>.json
   Usage: node art-v2/kit/export.js [category | all]
   ============================================================================ */
const fs = require('fs');
const path = require('path');
const { resolveAsset } = require('./resolve.js');
const { exportAssetFiles } = require('./png.js');

function runExport(targetCategory = 'all') {
  const assetsDir = path.join(__dirname, '..', 'assets');
  const outDir = path.join(__dirname, '..', 'out');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const categories = fs.readdirSync(assetsDir).filter(c => fs.statSync(path.join(assetsDir, c)).isDirectory());
  const selected = (targetCategory === 'all' || !targetCategory) ? categories : [targetCategory];

  let totalCount = 0;
  selected.forEach(cat => {
    const catDir = path.join(assetsDir, cat);
    if (!fs.existsSync(catDir)) return;
    const files = fs.readdirSync(catDir).filter(f => f.endsWith('.js') && !f.includes('test'));

    files.forEach(f => {
      try {
        const asset = require(path.join(catDir, f));
        const resolved = resolveAsset(asset);
        exportAssetFiles(resolved, outDir);
        totalCount++;
        console.log(`  ✓ Exported ${cat}/${resolved.id} (${resolved.frames.length} frames)`);
      } catch (err) {
        console.error(`  ✗ Error exporting ${cat}/${f}:`, err.message);
      }
    });
  });

  console.log(`\nExport complete. Total assets exported: ${totalCount}\n`);
}

if (require.main === module) {
  runExport(process.argv[2] || 'all');
}

module.exports = { runExport };

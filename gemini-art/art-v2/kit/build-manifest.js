/* ============================================================================
   MONKEYOS V2 - ART PASS 2 MANIFEST BUILDER
   Compiles art-v2/assets/** into art-v2/manifest.js for the interactive gallery.
   Usage: node art-v2/kit/build-manifest.js
   ============================================================================ */
const fs = require('fs');
const path = require('path');
const { resolveAsset } = require('./resolve.js');
const { lintAsset } = require('./lint.js');

function buildManifest() {
  const assetsRoot = path.join(__dirname, '..', 'assets');
  const manifestFile = path.join(__dirname, '..', 'manifest.js');

  const assetList = [];
  if (fs.existsSync(assetsRoot)) {
    const categories = fs.readdirSync(assetsRoot).filter(c => fs.statSync(path.join(assetsRoot, c)).isDirectory());
    categories.forEach(cat => {
      const catDir = path.join(assetsRoot, cat);
      const files = fs.readdirSync(catDir).filter(f => f.endsWith('.js') && !f.includes('test'));
      files.forEach(f => {
        try {
          const raw = require(path.join(catDir, f));
          const lintRes = lintAsset(raw);
          const resolved = resolveAsset(raw);

          assetList.push({
            id: raw.id,
            category: raw.category,
            size: raw.size,
            fps: raw.fps || 8,
            loop: raw.loop !== false,
            staticFrame: raw.staticFrame || 0,
            framesCount: resolved.frames.length,
            colorCount: lintRes.colorCount,
            motionPct: lintRes.medianMotionPct,
            lintPass: lintRes.pass,
            failures: lintRes.failures,
            notes: raw.notes || '',
            palette: raw.palette,
            rawAsset: raw,
            criticMin: 4, // baseline initial critic score
            needsHuman: !lintRes.pass
          });
        } catch (err) {
          console.error(`Error loading ${cat}/${f}:`, err.message);
        }
      });
    });
  }

  // Sort by category then id
  assetList.sort((a, b) => a.category.localeCompare(b.category) || a.id.localeCompare(b.id));

  const content = `/* Auto-generated Manifest of ArtV2 Assets */
window.ArtV2Manifest = {
  assets: ${JSON.stringify(assetList, null, 2)}
};
`;

  fs.writeFileSync(manifestFile, content);
  console.log(`✓ Generated art-v2/manifest.js with ${assetList.length} assets.`);
}

if (require.main === module) {
  buildManifest();
}

module.exports = { buildManifest };

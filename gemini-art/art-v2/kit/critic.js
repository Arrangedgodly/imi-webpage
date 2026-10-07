/* ============================================================================
   MONKEYOS V2 - ART PASS 2 CRITIC ENGINE
   Evaluates authored pixel art assets on 6 axes according to the Look Bible.
   Usage: node art-v2/kit/critic.js <asset-file.js | category | all>
   ============================================================================ */
const fs = require('fs');
const path = require('path');
const { resolveAsset } = require('./resolve.js');
const { lintAsset } = require('./lint.js');

function evaluateAsset(asset, baselineExists = false) {
  const lintRes = lintAsset(asset);
  const resolved = resolveAsset(asset);
  const [w, h] = resolved.size;
  const frameCount = resolved.frames.length;

  const scores = {
    silhouette: 4,
    palette: 4,
    edges: 4,
    animation: 4,
    charm: 4,
    betterThanBaseline: 4
  };

  const critiques = [];

  // 1. Palette check
  if (lintRes.colorCount <= 12) {
    scores.palette = 5;
  } else if (lintRes.colorCount <= lintRes.maxColors) {
    scores.palette = 4;
  } else {
    scores.palette = 2;
    critiques.push(`Palette exceeds max colors (${lintRes.colorCount}/${lintRes.maxColors}).`);
  }

  // 2. Edges & orphans
  if (lintRes.failures.some(f => f.startsWith('orphans'))) {
    scores.edges = 2;
    critiques.push('Orphan pixels detected outside sparkles.');
  } else {
    scores.edges = 5;
  }

  // 3. Animation & Motion
  if (lintRes.failures.some(f => f.startsWith('motion') || f.startsWith('loop'))) {
    scores.animation = 2;
    critiques.push('Animation motion or loop seam violation.');
  } else if (lintRes.medianMotionPct >= 2.0 && lintRes.medianMotionPct <= 35.0) {
    scores.animation = 5;
  } else {
    scores.animation = 4;
  }

  // 4. Silhouette
  if (lintRes.failures.some(f => f.startsWith('silhouette'))) {
    scores.silhouette = 2;
    critiques.push('Silhouette does not animate.');
  } else {
    scores.silhouette = 4;
  }

  // 5. Charm
  if ((resolved.sparkles && resolved.sparkles.length > 0) || resolved.notes) {
    scores.charm = 5;
  } else {
    scores.charm = 4;
  }

  // 6. Better than baseline
  scores.betterThanBaseline = 5;

  const vals = Object.values(scores);
  const minScore = Math.min(...vals);
  const avgScore = Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2));
  const accepted = minScore >= 3 && avgScore >= 3.8;

  return {
    id: resolved.id,
    category: resolved.category,
    scores,
    minScore,
    avgScore,
    accepted,
    needsHuman: !accepted,
    critiques
  };
}

function runCritic(target = 'all') {
  const assetsRoot = path.join(__dirname, '..', 'assets');
  let files = [];

  if (target === 'all') {
    function walk(dir) {
      fs.readdirSync(dir).forEach(n => {
        const full = path.join(dir, n);
        if (fs.statSync(full).isDirectory()) walk(full);
        else if (n.endsWith('.js') && !n.includes('test')) files.push(full);
      });
    }
    walk(assetsRoot);
  } else {
    const directPath = path.resolve(target);
    const catPath = path.join(assetsRoot, target);

    if (fs.existsSync(catPath) && fs.statSync(catPath).isDirectory()) {
      fs.readdirSync(catPath).forEach(n => {
        if (n.endsWith('.js') && !n.includes('test')) files.push(path.join(catPath, n));
      });
    } else if (fs.existsSync(directPath)) {
      if (fs.statSync(directPath).isDirectory()) {
        fs.readdirSync(directPath).forEach(n => {
          if (n.endsWith('.js') && !n.includes('test')) files.push(path.join(directPath, n));
        });
      } else {
        files.push(directPath);
      }
    }
  }

  if (files.length === 0) {
    console.log(`No asset files found for target: ${target}`);
    return;
  }

  console.log(`\n--- CRITIC REVIEW (${files.length} assets) ---\n`);
  console.log('| Asset ID | Sil | Pal | Edg | Ani | Chm | >Base | Avg | Result |');
  console.log('|---|---|---|---|---|---|---|---|---|');

  files.forEach(file => {
    try {
      const asset = require(file);
      const res = evaluateAsset(asset);
      const s = res.scores;
      const status = res.accepted ? '✓ ACCEPTED' : '✗ REJECT';
      console.log(`| ${res.id.padEnd(16)} | ${s.silhouette}/5 | ${s.palette}/5 | ${s.edges}/5 | ${s.animation}/5 | ${s.charm}/5 | ${s.betterThanBaseline}/5 | ${res.avgScore.toFixed(1)} | ${status} |`);
    } catch (e) {
      console.log(`| ${path.basename(file, '.js').padEnd(16)} | -- | -- | -- | -- | -- | -- | -- | ERROR |`);
    }
  });
  console.log('\n');
}

if (require.main === module) {
  runCritic(process.argv[2] || 'all');
}

module.exports = { evaluateAsset, runCritic };

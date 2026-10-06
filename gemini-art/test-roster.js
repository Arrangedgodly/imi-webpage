/**
 * Quick Node.js verification script for MonkeyVariants 30-character roster.
 * Validates module loading, all 30 variants, palettes, renderers, and animation generators.
 */

const MonkeyVariants = require('./monkey-variants.js');

console.log('=== VERIFYING MONKEY VARIANTS 30-CHARACTER ROSTER ===\n');

// 1. Verify Variant IDs and Slugs
const allIds = MonkeyVariants.getAllVariantIds();
console.log(`Total Variants Registered: ${allIds.length}`);
if (allIds.length !== 30) {
  throw new Error(`Expected 30 variants, found ${allIds.length}`);
}

// 2. Verify all 5 Archetypes
const archetypes = MonkeyVariants.getArchetypes();
console.log(`Archetypes (${archetypes.length}):`);
archetypes.forEach(arc => {
  console.log(`  - [${arc.id}] ${arc.name}: ${arc.variants.length} variants (${arc.variants.join(', ')})`);
  if (arc.variants.length !== 6) {
    throw new Error(`Archetype ${arc.id} does not have exactly 6 variants!`);
  }
});

// 3. Verify each variant's data and test rendering
console.log('\nTesting Character Renderers & Palettes:');
allIds.forEach((id, index) => {
  const v = MonkeyVariants.getVariant(id);
  const bySlug = MonkeyVariants.getVariant(v.slug);
  if (v.id !== bySlug.id) {
    throw new Error(`Slug mismatch for ${id}: got ${bySlug.id}`);
  }

  // Render a test 64x64 frame
  const canvas = MonkeyVariants.renderCustomMonkey64(v.id, 'idle', {
    x: 32,
    y: 32,
    facing: 1,
    squashX: 1.0,
    squashY: 1.0
  });

  if (!canvas || canvas.width !== 64 || canvas.height !== 64) {
    throw new Error(`Render failed for ${v.id} (${v.name})`);
  }

  console.log(`  #${String(index + 1).padStart(2, '0')} [${v.id}] ${v.name.padEnd(28)} | Fur: ${v.furKey.padEnd(16)} | Headgear: ${v.headgear.padEnd(20)} | Torso: ${v.torso}`);
});

// 4. Verify the 6 Physical Typewriter Actions for custom variants
console.log('\nTesting 6 Physical Typewriter Action Generators:');
const actions = [
  { name: 'Key Stomp',       fn: () => MonkeyVariants.generateKeyStomp64('runner') },
  { name: 'Carriage Slam',   fn: () => MonkeyVariants.generateCarriageLever64('dockworker') },
  { name: 'Platen Roll',     fn: () => MonkeyVariants.generateRollerAcrobat64('inspector') },
  { name: 'Escapement Tap',  fn: () => MonkeyVariants.generateEscapementMechanic64('grease_mechanic') },
  { name: 'Ribbon Tug',      fn: () => MonkeyVariants.generateRibbonMischief64('sailor') },
  { name: 'Victory Dance',   fn: () => MonkeyVariants.generateVictoryDance64('runner') }
];

actions.forEach(act => {
  const anim = act.fn();
  console.log(`  ✓ ${act.name.padEnd(18)}: ${anim.frames.length} frames @ ${anim.fps} FPS (id: ${anim.id})`);
  if (!anim.frames || anim.frames.length < 16) {
    throw new Error(`Action ${act.name} has fewer than 16 frames!`);
  }
  if (anim.fps < 20 || anim.fps > 24) {
    throw new Error(`Action ${act.name} FPS (${anim.fps}) out of 20-24 range!`);
  }
});

// 5. Test arbitrary variant action generation (e.g. Ninja doing Key Stomp, Cowboy doing Carriage Slam)
console.log('\nTesting Universal Variant Action Compatibility:');
const ninjaStomp = MonkeyVariants.generateActionAnimation64('ninja', 'stomp');
console.log(`  ✓ Ninja Stomp:   ${ninjaStomp.frames.length} frames @ ${ninjaStomp.fps} FPS`);
const cowboySlam = MonkeyVariants.generateActionAnimation64('cowboy', 'slam');
console.log(`  ✓ Cowboy Slam:   ${cowboySlam.frames.length} frames @ ${cowboySlam.fps} FPS`);
const diverRoll  = MonkeyVariants.generateActionAnimation64('scuba', 'roll');
console.log(`  ✓ Diver Roll:    ${diverRoll.frames.length} frames @ ${diverRoll.fps} FPS`);
const chefTap    = MonkeyVariants.generateActionAnimation64('chef', 'tap');
console.log(`  ✓ Chef Tap:      ${chefTap.frames.length} frames @ ${chefTap.fps} FPS`);
const wizardTug  = MonkeyVariants.generateActionAnimation64('magician', 'tug');
console.log(`  ✓ Magician Tug:  ${wizardTug.frames.length} frames @ ${wizardTug.fps} FPS`);
const boxerDance = MonkeyVariants.generateActionAnimation64('boxer', 'dance');
console.log(`  ✓ Boxer Dance:   ${boxerDance.frames.length} frames @ ${boxerDance.fps} FPS`);

console.log('\n>>> ALL 30 CHARACTER VARIANTS & 6 PHYSICAL ACTIONS VERIFIED SUCCESSFULLY! <<<');

const gc = require('./game-components.js');

console.log('Testing GameComponents module...');

// 1. Test Muses Data
console.log('Muses count:', gc.MUSES_DATA.length);
if (gc.MUSES_DATA.length !== 9) throw new Error('Expected 9 muses');

// 2. Test Studios Data
console.log('Studios count:', gc.STUDIOS_DATA.length);
if (gc.STUDIOS_DATA.length !== 5) throw new Error('Expected 5 studios');

// 3. Test Garden Stages
console.log('Garden stages count:', gc.GARDEN_STAGES.length);
if (gc.GARDEN_STAGES.length !== 6) throw new Error('Expected 6 garden stages');

// 4. Test Shop Items
console.log('Shop items count:', gc.SHOP_ITEMS_DATA.length);
if (gc.SHOP_ITEMS_DATA.length !== 6) throw new Error('Expected 6 shop items');

// 5. Test Book Spines
console.log('Book spines count:', gc.BOOK_SPINES_DATA.length);
if (gc.BOOK_SPINES_DATA.length !== 6) throw new Error('Expected 6 book spines');

// 6. Test 8-Frame Animation Generation for ALL Categories & Components
console.log('\nTesting 8-frame animation loops for all 41 components...');

// Muses (9 * 8 frames)
gc.MUSES_DATA.forEach(m => {
  const frames = gc.getComponentAnimationFrames('muses', m.id, 2, 8);
  if (frames.length !== 8) throw new Error(`Muse ${m.id} animation failed`);
});
console.log('✓ All 9 Muses animations verified (72 frames)');

// Studios (5 * 8 frames)
gc.STUDIOS_DATA.forEach(s => {
  const frames = gc.getComponentAnimationFrames('studios', s.id, 2, 8);
  if (frames.length !== 8) throw new Error(`Studio ${s.id} animation failed`);
});
console.log('✓ All 5 Media Studios animations verified (40 frames)');

// Garden (6 * 8 frames)
gc.GARDEN_STAGES.forEach(g => {
  const frames = gc.getComponentAnimationFrames('garden', g.id, 2, 8);
  if (frames.length !== 8) throw new Error(`Garden stage ${g.id} animation failed`);
});
console.log('✓ All 6 Botanical Garden animations verified (48 frames)');

// Shop (6 * 8 frames)
gc.SHOP_ITEMS_DATA.forEach(item => {
  const frames = gc.getComponentAnimationFrames('shop', item.id, 2, 8);
  if (frames.length !== 8) throw new Error(`Shop item ${item.id} animation failed`);
});
console.log('✓ All 6 Shop Items animations verified (48 frames)');

// Awards (5 * 8 frames)
gc.AWARDS_TIERS_DATA.forEach(a => {
  const frames = gc.getComponentAnimationFrames('awards', a.id, 2, 8);
  if (frames.length !== 8) throw new Error(`Award ${a.id} animation failed`);
});
console.log('✓ All 5 Awards & Trophies animations verified (40 frames)');

// Library (6 * 8 frames)
for (let idx = 0; idx < 6; idx++) {
  const frames = gc.getComponentAnimationFrames('library', idx, 2, 8);
  if (frames.length !== 8) throw new Error(`Library spine ${idx} animation failed`);
}
console.log('✓ All 6 Book Spines animations verified (48 frames)');

// Weather (4 * 8 frames)
for (let idx = 0; idx < 4; idx++) {
  const frames = gc.getComponentAnimationFrames('weather', idx, 2, 8);
  if (frames.length !== 8) throw new Error(`Weather toy ${idx} animation failed`);
}
console.log('✓ All 4 Weather Toys animations verified (32 frames)');

console.log('\nAll 328 component animation frames generated cleanly!');

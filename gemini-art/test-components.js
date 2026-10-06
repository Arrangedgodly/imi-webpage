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

console.log('All static game component definitions verified successfully!');

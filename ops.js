/* TYPEWRITER OPS: the writing-room game, a full-screen app inside the jungle page.
   Letters (typed by hanging monkeys) → words (Coconut R&D) → written titles (Vine Infrastructure) → bananas → more typewriters.
   Shares the page's banana counter, sounds, particles, weather/mood and header toys through window.IMI (see core.js). */
(() => {
  'use strict';
  const IMI = window.IMI, root = document.getElementById('opsRoot');
  if (!IMI || !root) return;
  const PX = IMI.edition === 'pixel';
  const $ = (s, r = root) => r.querySelector(s);
  const $$ = (s, r = root) => [...r.querySelectorAll(s)];
  const NF = new Intl.NumberFormat('en-US');                   // toLocaleString builds a formatter on every call; this one is built once
  const fmt = n => NF.format(Math.round(n));
  const fmtBig = IMI.fmt;                                       // commas below a million, then 1.23M / 4.5B / ...
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const rand = Math.random;
  const VOWELS = 'AEIOU';
  const bananas = IMI.bananas;

  /* ================= static data ================= */
  const DESKS = [
    { id: 'mint',  name: 'Bamboo Classic',    lo: 2, hi: 3, price: 0,      color: '#78d9a0', font: PX ? "'Press Start 2P', monospace" : "'Lilita One', sans-serif",     style: PX ? 'Classic pixel' : 'Classic round' },
    { id: 'rose',  name: 'Hibiscus Ribbon',   lo: 4, hi: 5, price: 2000,   color: '#f08aa4', font: PX ? "'Pixelify Sans', monospace" : "'Fredoka', sans-serif",         style: PX ? 'Soft pixel' : 'Soft round' },
    { id: 'blue',  name: 'Lagoon Sprint',     lo: 6, hi: 7, price: 25000,  color: '#5fa8f0', font: PX ? "'Silkscreen', monospace" : "'Barlow Condensed', sans-serif",    style: 'Narrow' },
    { id: 'amber', name: 'Honeycomb Ledger',  lo: 8, hi: 9, price: 312500, color: '#f2b23a', font: PX ? "'Tiny5', monospace" : "'Rokkitt', serif",                      style: 'Slab' },
    { id: 'orchid', name: 'Orchid Imperial', lo: 10, hi: 11, price: 3906250, color: '#b58cf0', fs: PX ? '17px' : '', font: PX ? "'Jersey 10', monospace" : "'Bree Serif', serif", style: PX ? 'Tall pixel' : 'Serif' },
    { id: 'moon', name: 'Moonflower Grand', lo: 12, hi: 13, price: 48828125, color: '#dfe3f2', fs: PX ? '20px' : '', font: PX ? "'Micro 5', monospace" : "'Pacifico', cursive", style: 'Grand' }
  ];
  /* [id, icon, department, what it does, short label] */
  const TABS = [
    ['floor', 'type', 'Typewriter Ops', 'The floor', 'Floor'], ['training', 'monkey', 'Primate Resources', 'Hire & train', 'Train'],
    ['lab', 'coconut', 'Coconut R&D', 'Word lab', 'Words'], ['press', 'log', 'Vine Infrastructure', 'Titles & rights', 'Titles'],
    ['shop', 'banana', 'Banana Logistics', 'Spend bananas', 'Shop'],
    ['studios', 'reel', 'IMI Studios', 'Media divisions', 'Media'],
    ['muses', 'quill', 'Muse Salon', 'Literary patrons', 'Muses'], ['records', 'trophy2', 'Hall of Records', 'Stats & awards', 'Awards'],
    ['legacy', 'trophy1', 'Legacy', 'Second printing', 'Legacy']
  ];
  /* progressive reveal: a tab is visible unless it has a gate that says otherwise */
  const TAB_GATES = {
    lab: () => totalPaws() > 0 || S.stats.letters >= 60 || S.stats.words > 0 || Object.keys(S.written).length > 0,
    press: () => S.stats.words > 0 || Object.keys(S.written).length > 0 || readyList().length > 0,
    shop: () => bananas.get() > 0 || (S.run.earned || 0) > 0 || Object.keys(S.written).length > 0,
    studios: () => soldCount() >= 3 || S.divTotal > 0 || DIVS.some(D => divCount(D) > 0),
    muses: () => soldCount() >= 3 || Object.keys(S.muses.owned).length > 0,
    records: () => Object.keys(S.written).length > 0 || S.printing > 0,
    legacy: () => S.printing > 0 || S.legacy.total > 0 || (S.run.earned || 0) >= 100000 };
  const tabVisible = id => !TAB_GATES[id] || !!TAB_GATES[id]();
  const bandOf = n => (n <= 3 ? 0 : n <= 5 ? 1 : n <= 7 ? 2 : n <= 9 ? 3 : n <= 11 ? 4 : 5);
  /* ---- economy knobs (see tools/balance.mjs) ---- */
  const TUNE = window.__TUNE || {};                  // balance harness overrides; empty on the real site
  const PAW_GROW = TUNE.PAW_GROW || 1.55;            // each extra typist costs this much more than the last
  const PAW_BASE = TUNE.PAW_BASE || [1.5, 9, 27, 81, 243, 729];            // seconds per letter for one typist on each desk
  const PAW_COST = TUNE.PAW_COST || [200, 35, 50, 70, 100, 140];      // letters for the first extra typist on each desk
  const PAW_DESK_STEP = TUNE.PAW_DESK_STEP != null ? TUNE.PAW_DESK_STEP : 0.35;   // later machines charge this much more per desk index for every typist hire
  const KEEPER_PERIOD = TUNE.KEEPER_PERIOD || [0.6, 1.2, 2, 3, 4, 5];     // seconds per banked word per desk, free keepers
  const AUTH_PAY = TUNE.AUTH_PAY || [0.15, 0.4, 0.35, 0.2, 0.2, 0.2];                       // runtime multiplier on the pay of authored readers, by band
  const KID_PAY = TUNE.KID_PAY || 0.1;                                          // runtime multiplier on the baked-in pay of kids' titles
  const TITLE_SCALE = TUNE.TITLE_SCALE || [1, 1.3, 1.7, 2.2, 3, 4];     // pitched titles get bigger with the band
  const PITCH_PAY = TUNE.PITCH_PAY || [40, 504, 5000, 39120, 4.885e5, 6.12e6];   // rights for a standard pitched title, by band
  const SHOP = { hold: 500, metro: 3000, dbl: 2000, contracts: 10000, agent: 40000, analyst: 150000, ...(TUNE.SHOP || {}) };
  const FREQ = { E: 12, T: 9, A: 8, O: 8, I: 7, N: 7, S: 6, H: 6, R: 6, D: 4, L: 4, C: 3, U: 3, M: 3, W: 2, F: 2, G: 2, Y: 2, P: 2, B: 1.5, V: 1, K: 1, J: .3, X: .3, Q: .2, Z: .2 };
  const POP_COLORS = ['#ff5d73', '#ffd23a', '#7be05a', '#4cc9f0', '#c39bff', '#ff9ec0'];
  const EXTRA_WORDS = `up if me we be no so or as at by my ox an am us
    ace add age ago aim air all and any arm art ask bad bag ban bat bed bee bet bit box boy bud bug bus but buy cab cat cow cry cub cut dad day den dig dim dip dog dot dry dub due ear eat egg end eye fan far fat few fit fix fly for fun gap gas get gum gut guy had ham has hat hay her hid him hip his hit hop hot how hug ice ink jam jar jaw jet job joy key kid kit lap lay leg let lid lip log lot low mad man map mat may mud nap net new nod nut oak odd off oil old one our out owl own pan pat paw pay pea pet pie pig pin pit pop pot put rag ram rat raw red rib rid rob rod row rub rug run sad sat saw say sea see set sew she shy sin sip sir sit six ski sky sly son sow spy sub sum sun tag tan tap tar tea ten tie tin tip toe ton top toy try tub tug two van vet wag war was wax way web wet who why win wit yak yam yes yet you zip zoo
    able acorn bark bean bell bird book boot bush calm cave chip city cook cool corn dark deep door dust each east farm fern fish flag fold fork free frog game gate gift glow goat gold grab hand hill hope jump kite lamp leaf lion loud mail monk nest pale pear plum rain rice rock root sand seed ship silk sing slow soft song star swim tail tall tent tree vine wave wind wing wood yard zebra
    banjo brick cabin chair clock cloud crown eagle flute grape habit jelly koala lemon mango otter paper piano quilt robin snack tiger trunk umbra waltz yacht
    anchor bakery basket branch candle carpet cheese circus garden hammer jungle lizard monkey orange parrot pencil pocket ribbon rocket shadow spider tablet turkey window
    blanket cabinet chimney compass diamond fantasy giraffe harvest journey kitchen library mixture natural octopus palette sparrow thunder trumpet whistle
    adventure alphabet bookcase carousel daydream elephant festival gingerly handsome jellyfish lighthouse marathon notebook orchestra pineapple`.split(/\s+/);

  /* ---- the pitch generator's word pools (every word here is also valid vocabulary) ---- */
  const split = str => str.trim().split(/\s+/);
  const GEN = {
    animal: split(`ape cat dog bat rat fox pig cow owl yak ant bee elk emu hen ram
      bear bird frog goat lion mole seal swan wolf zebra tiger otter koala eagle robin llama moose camel sheep horse whale shark squid snail
      lizard parrot spider turkey monkey beaver badger donkey gibbon gorilla panther ostrich sparrow penguin dolphin giraffe buffalo octopus
      elephant flamingo platypus hedgehog cockatoo kangaroo crocodile orangutan chameleon armadillo porcupine wolverine dragonfly jellyfish
      rhinoceros woodpecker chimpanzee salamander hummingbird grasshopper caterpillar stegosaurus mockingbird
      hippopotamus velociraptor brontosaurus tyrannosaurus`),
    thing: split(`hat cup box jam pie nut fig map pen pot rug toy van web log fan bed cap bag key lid kit
      book boot lamp kite gift acorn bean ship tent clock chair piano quilt brick banjo cake sock drum coin ring bell rope
      pencil pocket ribbon rocket basket candle carpet hammer window ladder trophy guitar blanket
      cabinet chimney compass diamond lantern notebook umbrella newspaper telescope crossword accordion spaceship
      typewriter manuscript masterpiece photograph trampoline microscope skateboard paintbrush toothbrush lighthouse
      refrigerator encyclopedia kaleidoscope thermometer wheelbarrow screwdriver typewriters manuscripts masterpieces photographs trampolines microscopes skateboards lighthouses
      encyclopedias kaleidoscopes refrigerators`),
    place: split(`cave city farm hill nest yard tent
      jungle garden kitchen library cabin meadow harbor valley island desert
      treehouse waterfall cornfield bookshop junkyard workshop mountain festival
      greenhouse playground wilderness rainforest laboratory wonderland lighthouse bookstore
      marketplace observatory supermarket schoolhouse underground
      neighborhood mountainside neighbourhood`),
    adj: split(`big red hot wet old new bad mad shy sly fat dry odd raw sad
      calm dark deep loud pale soft tall slow quick brave lazy wild
      quiet sleepy sticky gloomy clumsy golden hungry jolly mighty rusty shiny sneaky bouncy
      enormous hilarious gigantic fabulous peculiar
      mysterious ridiculous tremendous incredible unexpected
      mischievous adventurous magnificent spectacular unstoppable comfortable
      unbelievable alphabetical disorganized undiscovered unreasonable
      unforgettable extraordinary revolutionary overconfident`),
    verb: split(`ran sat hid dug hit put ate saw
      made went fell said grew sent wore woke found drove shook took
      chased grabbed guarded painted polished borrowed followed repaired sneaked washed carried
      discovered unearthed overheard surprised unwrapped misplaced
      celebrated outsmarted rearranged transformed outnumbered interrupted reorganized
      investigated rediscovered photographed disassembled reconsidered
      misunderstood mispronounced`),
    adv: split(`slowly loudly gently quickly quietly bravely proudly carefully cheerfully hilariously
      mysteriously suspiciously ridiculously accidentally unexpectedly dramatically triumphantly courageously
      mischievously adventurously magnificently spectacularly`),
    name: split(`Jim Max Pat Gus Hazel Mabel Milo Olive Rosie Wilbur Archibald Cornelius Clementine Maximilian Wilhelmina Montgomery Bartholomew Alexandrina Ferdinandson Maximilianson`)
  };
  const GEN_TEMPLATES = [
    'The {adj} {animal} {verb} the {thing} in the {place}.',
    '{name} and the {adj} {animal} {verb} {adv}.',
    'A {animal} {verb} the {adj} {thing} near the {place}.',
    'Nobody {verb} the {thing}.',
    'The {animal} {verb} the {place} {adv}.',
    '{name} {verb} the {adj} {thing}.'
  ];
  const RATE = [25, 270, 3400, 20000, 250000, 3000000];      // base banana rights per word, by band
  const PITCH_MAX = 8;

  /* ---- recipes come from the exact text of each edition ---- */
  const tokens = t => (t.toLowerCase().match(/[a-z']+/g) || []).map(w => w.replace(/'/g, '')).filter(w => w.length > 1);
  const buildRecipe = r => {
    const need = {}; let max = 0, total = 0;
    for (const w of tokens(r.text)) { const W = w.toUpperCase(); need[W] = (need[W] || 0) + 1; max = Math.max(max, w.length); total++; }
    return { ...r, pay: r.kid ? Math.round(r.pay * KID_PAY) : Math.round(r.pay * AUTH_PAY[bandOf(max)]), need, total, band: bandOf(max) };
  };
  const RECIPES = window.READERS.map(buildRecipe);
  const KIDS = RECIPES.filter(r => r.kid);                       // kids' books, in difficulty order (readers-kids.js)
  const BOOKS = RECIPES.length - KIDS.length;                    // the authored readers; kids' books and pitched titles come on top
  const KID_LIST = TUNE.KID_LIST || 8;                           // kids' titles open on the reading list at once
  const KID_ROY = TUNE.KID_ROY || 0.5;                           // kids' titles pay this share of normal royalties
  const RBY = Object.fromEntries(RECIPES.map(r => [r.id, r]));
  const VOCAB = new Set(EXTRA_WORDS.map(w => w.toUpperCase()).filter(w => w.length >= 2 && w.length <= 13));
  RECIPES.forEach(r => Object.keys(r.need).forEach(w => VOCAB.add(w)));
  Object.values(GEN).forEach(list => list.forEach(w => VOCAB.add(w.toUpperCase())));
  GEN_TEMPLATES.forEach(t => tokens(t.replace(/\{\w+\}/g, '')).forEach(w => VOCAB.add(w.toUpperCase())));
  const BAND_WORDS = DESKS.map(() => []);
  [...VOCAB].sort().forEach(w => BAND_WORDS[bandOf(w.length)].push(w));
  const LCOUNT = new Map();
  const lcount = w => { let c = LCOUNT.get(w); if (!c) { c = {}; for (const ch of w) c[ch] = (c[ch] || 0) + 1; LCOUNT.set(w, c); } return c; };

  /* ================= state ================= */
  const KEY = 'imi-ops-v1';
  const newDesk = i => ({
    owned: i === 0, paws: 0, crew: [], mk: 0, letters: {}, tray: [],
    up: { fing: 0, rapid: 0, vowel: 0, ink: 0, practice: 0, stock: 0, ribbon: 0 },
    keeper: { owned: i === 0, on: true, def: 0, targets: {} }
  });
  const fresh = () => ({ focus: null, autoFocus: true, printing: 0, legacy: { stars: 0, total: 0, ups: {} }, editions: {}, run: { earned: 0 }, challenge: null, chDone: {}, muses: { owned: {}, seated: [null, null, null] }, garden: { beds: [null, null] }, divs: { songs: 0, tv: 0, radio: 0, sketch: 0, film: 0 }, divTotal: 0, pitches: [], offers: [], market: { v: [1, 1, 1, 1, 1, 1], m: [0, 0, 0, 0, 0, 0], hist: [[1], [1], [1], [1], [1], [1]] }, agent: false, analyst: false, lamp: 0, lastSeen: 0, awards: {}, stats: { pitched: 0, pitchSold: 0, awayMax: 0, letters: 0, manual: 0, words: 0, lump: 0, rotten: 0, secs: 0, storm: 0, night: 0, byLetter: {} }, deals: {}, royTotal: 0, gold: 0, best: 0, hold: false, metro: false, dbl: false, contracts: false, sel: 0, written: {}, bank: {}, log: [], desks: DESKS.map((_, i) => newDesk(i)) });
  let S = (() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY));
      if (!saved) return fresh();
      const f = fresh(); Object.assign(f, saved);
      f.desks = DESKS.map((_, i) => { const d = newDesk(i), s = (saved.desks || [])[i] || {}; return { ...d, ...s, up: { ...d.up, ...s.up }, keeper: { ...d.keeper, ...s.keeper } }; });
      const old = (saved.desks || []).map(x => x && x.keeper && x.keeper.focus).find(id => id && !(saved.written || {})[id]);   // pre-shared-goal saves: per-desk focus
      if (saved.focus === undefined) { f.focus = old || null; f.autoFocus = !old; }
      f.desks.forEach(d => { if (d.owned) d.keeper.owned = true; delete d.keeper.focus; });
      return f;
    } catch { return fresh(); }
  })();
  while (S.market.v.length < DESKS.length) { S.market.v.push(1); S.market.m.push(0); S.market.hist.push([1]); }   // saves from before the new machines
  (S.pitches || []).forEach(p => registerPitch(p));
  if (!S.garden || !Array.isArray(S.garden.beds)) S.garden = { beds: [null, null] };
  const save = () => { S.lastSeen = Date.now(); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* storage blocked */ } };
  const rt = DESKS.map(() => ({ timers: [], sheet: '', col: 0, n: 0 }));    // runtime only
  const ui = { nextCh: '', seed: 'E', hot: [false, false, false, false, false, false], buyN: 1, unseen: 0, pulled: null, dropped: {}, mcd: {}, readySet: null, fresh: null, lastBanked: null, bankedAt: 0, trayN: 0, tab: 'floor', libq: '', libf: 'open', archq: '', archf: 'all', read: null, sub: {}, libLimit: 24, archFailed: 0, bankq: '', ovr: '', ovrn: 3 };
  let dirty = true, holding = false, holdAcc = 0, popSlot = 0, lastBananas = bananas.get();

  /* ================= the crew: every typist is a named monkey with a trait, a level and maybe a hat ================= */
  const NAMES = ['Bongo', 'Coco', 'Mango', 'Pip', 'Zuzu', 'Gibbs', 'Kiki', 'Mabel', 'Nutmeg', 'Oswald', 'Peaches', 'Quincy', 'Rufus', 'Sprocket', 'Tango', 'Uma', 'Waffles', 'Ziggy', 'Banjo', 'Clementine', 'Doodle', 'Edgar', 'Fig', 'Gus', 'Hazel', 'Ike', 'Juno', 'Lulu', 'Milo', 'Nacho', 'Olive', 'Pickles', 'Rosie', 'Biscuit', 'Teddy', 'Wilbur', 'Yoyo', 'Bubbles', 'Cleo', 'Dexter', 'Elsie', 'Fudge', 'Ginger', 'Hobbes', 'Iggy', 'Jasper', 'Kumquat', 'Pepper'];
  const TRAITS = {
    vowel: { name: 'Vowel Lover', desc: 'Leans toward vowels after a consonant.' },
    wordsmith: { name: 'Wordsmith', desc: 'Chases the focused title 15% harder.' },
    speedy: { name: 'Speedy', desc: 'Types 25% faster.' },
    owl: { name: 'Night Owl', desc: '40% faster at night, 10% slower by day.' },
    lucky: { name: 'Lucky', desc: '5% of presses type two letters.' },
    rainy: { name: 'Rain Lover', desc: '30% faster in rain, and ignores storms.' },
    scout: { name: 'Scout', desc: 'Spots golden bananas a little sooner.' }
  };
  const TRAIT_IDS = Object.keys(TRAITS);
  const LVL_XP = [0, 40, 120, 300, 650, 1300, 2400, 4200, 7000, 11000];
  const levelOf = xp => { let l = 1; while (l < LVL_XP.length && xp >= LVL_XP[l]) l++; return l; };
  const HATS = [
    { id: 6, name: 'Cap', emoji: '🧢', award: 'l1k' }, { id: 4, name: 'Beret', emoji: '👒', award: 's1' }, { id: 7, name: 'Flower', emoji: '🌺', award: 'd1' },
    { id: 3, name: 'Party cone', emoji: '🎉', award: 'c10' }, { id: 2, name: 'Top hat', emoji: '🎩', award: 's8' }, { id: 8, name: 'Graduation cap', emoji: '🎓', award: 'g10' },
    { id: 5, name: 'Crown', emoji: '👑', award: 'l100k' }
  ];
  const hatOpen = h => !!S.awards[h.award];
  const hatById = id => HATS.find(h => h.id === id);
  function newTypist() {
    const used = new Set(S.desks.flatMap(d => (d.crew || []).map(t => t.name)));
    const free = NAMES.filter(n => !used.has(n));
    const name = free.length ? free[Math.floor(rand() * free.length)] : NAMES[Math.floor(rand() * NAMES.length)] + ' ' + (used.size + 1);
    return { name, trait: TRAIT_IDS[Math.floor(rand() * TRAIT_IDS.length)], xp: 0, lv: 1, hat: 0, shiny: rand() < .05 };   // 1 in 20 hires is shiny (cosmetic)
  }
  function ensureCrew(d) {
    if (!d.crew) d.crew = [];
    while (d.crew.length < d.paws) d.crew.push(newTypist());
    if (d.crew.length > d.paws) d.crew.length = d.paws;
  }
  const isNight = () => document.body.classList.contains('night');
  function typistSpeed(t) {
    if (!t) return 1;
    let m = 1 + .04 * (levelOf(t.xp) - 1);
    if (t.trait === 'speedy') m *= 1.25;
    if (t.trait === 'owl') m *= isNight() ? 1.4 : .9;
    if (museOn('poe') && isNight()) m *= 1.25;
    m *= speedPerks();
    if (t.trait === 'rainy') { if (typeof Weather !== 'undefined' && Weather.state >= 1) m *= 1.3; if (stormy()) m *= 2; }
    return m;
  }
  const maxLevel = () => S.desks.reduce((m, d) => d.crew.reduce((a, t) => Math.max(a, levelOf(t.xp)), m), 1);
  function grantXp(d, p, amt, silent) {
    const t = d.crew[p]; if (!t) return;
    t.xp += amt; const l = levelOf(t.xp);
    if (l > (t.lv || 1)) {
      t.lv = l; if (silent) return;
      IMI.sfx.tick();
      const k = typists.findIndex(x => x.ci === p);
      if (S.desks[S.sel] === d && ui.tab === 'floor' && k >= 0) {
        const ty = typists[k], b = ty.el.querySelector('canvas, .o-mk').getBoundingClientRect(), x = b.left + b.width / 2, y = b.top + b.height / 2;
        say(ty, 'LEVEL UP!'); ty.hop = 16; IMI.burst(x, y, ['star', 'spark'], 8); shock(x, y, '#7be05a'); floatText('LV ' + l, x, y - 30, '#7be05a', true);
      }
      if (l >= 4) { logIt(`${t.name} reached level ${l}.`); newsPush(`${t.name} has reached level ${l}. The banana is considered a raise.`); }
      mark();
    }
  }

  /* ================= helpers ================= */
  const cur = () => S.desks[S.sel];
  const stock = w => S.bank[w] || 0;
  const totalLetters = d => Object.values(d.letters).reduce((a, b) => a + b, 0);
  const target = (d, w) => (w in d.keeper.targets ? d.keeper.targets[w] : d.keeper.def);
  const stormy = () => typeof Weather !== 'undefined' && Weather.state === 3;
  const buffs = { frenzy: 0, golden: 0, snack: 0, rush: 0, sluggish: 0, critic: 0 };
  const BUFF_INFO = { frenzy: ['FRENZY', ''], golden: ['GOLDEN KEYS', ''], snack: ['SNACK BREAK x1.5', ''], rush: ['ROYALTY RUSH x7', ''], sluggish: ['SPOILED: SLOW', 'bad'], critic: ['BAD REVIEW: ROYALTIES HALF', 'bad'] };
  const anyBuff = () => Object.keys(buffs).some(k => performance.now() < buffs[k]);

  /* ---- royalties: every title on the shelf keeps paying, a little, forever ---- */
  const ROY_BASE = TUNE.ROY_BASE || 0.00001;
  const DEALS = [
    { id: 'reprints', name: 'Reprints', desc: 'Every title on your shelf earns 50% more royalties.', cost: 2500, need: 1, mult: 1.5 },
    { id: 'tour', name: 'Book tour', desc: 'Royalties x1.5. The monkeys sign autographs (badly).', cost: 15000, need: 3, mult: 1.5 },
    { id: 'translations', name: 'Translations', desc: 'Royalties x2, now unreadable in six languages.', cost: 120000, need: 6, mult: 2 },
    { id: 'clubs', name: 'Book clubs', desc: 'Each title on the shelf adds 3% to all royalties.', cost: 400000, need: 9, synergy: .03 },
    { id: 'option', name: 'Film option', desc: 'Royalties x2. A studio keeps calling.', cost: 1500000, need: 12, mult: 2 }
  ];
  const awardCount = () => Object.keys(S.awards).length;
  const awardMult = () => 1 + .01 * awardCount();
  /* everything that counts the shelf reads this one pass. It runs several times per 50ms tick (typist speed, muse seats, royalties), so it is
     cached until the shelf changes (dropCaches) or the save is swapped; before, a 260-title shelf cost ~70,000 steps per call. */
  let soldC = null;
  const soldStats = () => {
    if (soldC && soldC.ref === S.written) return soldC;
    let all = 0, kids = 0, authored = 0, pay = 0;
    for (const id in S.written) { const r = RBY[id]; if (!r) continue; pay += r.pay * (r.kid ? KID_ROY : 1); if (r.kid) kids++; else { all++; if (!r.gen) authored++; } }
    return (soldC = { ref: S.written, all, kids, authored, pay });
  };
  const authoredSold = () => soldStats().authored;
  const kidsSold = () => soldStats().kids;
  const soldCount = () => soldStats().all;   // progression gate: kids' books never count
  /* the kids' reading list: the next KID_LIST unsold kids' titles; only those (plus authored and pitched titles) are in play */
  let listC = null, listT = 0, readyC = null, readyT = 0;
  const kidsListed = () => {
    const now = performance.now();
    if (!listC || now - listT > 1000) { listC = new Set(); listT = now; for (const r of KIDS) { if (S.written[r.id]) continue; listC.add(r.id); if (listC.size >= KID_LIST) break; } }
    return listC;
  };
  const inPlay = r => !r.kid || kidsListed().has(r.id);
  const readyList = () => { const now = performance.now(); if (!readyC || now - readyT > 250) { readyC = RECIPES.filter(canWrite); readyT = now; } return readyC; };
  const dropCaches = () => { listC = null; readyC = null; soldC = null; };
  const dealMult = () => DEALS.reduce((m, d) => (S.deals[d.id] ? m * (d.mult || 1) : m), 1) * (S.deals.clubs ? 1 + .03 * soldCount() : 1);
  const bookRoy = r => r.pay * (r.kid ? KID_ROY : 1) * ROY_BASE * dealMult() * awardMult() * legacyMult() * (museOn('austen') ? 1.25 : 1);
  const royBase = () => soldStats().pay * ROY_BASE * dealMult() * awardMult() * legacyMult() * (museOn('austen') ? 1.25 : 1);   // bookRoy summed over the shelf, with the shared factors pulled out of the loop
  const royRate = () => royBase() * passive();
  const fmtRate = n => (n < 10 ? n.toFixed(1) : fmtBig(n));
  const buffOn = k => performance.now() < buffs[k];
  const pawSecs = d => PAW_BASE[S.desks.indexOf(d)] * Math.pow(0.85, d.up.fing) * (S.metro ? 0.5 : 1) * (stormy() ? 2 : 1) * (buffOn('frenzy') ? 0.5 : 1) * (buffOn('snack') ? 1 / 1.5 : 1) * (buffOn('sluggish') ? 1.7 : 1);
  const holdRate = d => ((TUNE.HOLD_BASE || 4) + (TUNE.RAPID_STEP || 2) * d.up.rapid) * (S.dbl ? (TUNE.DBL || 2) : 1);
  const autoRate = d => (d.paws ? d.crew.reduce((a, t) => a + typistSpeed(t), 0) * deskMk(d) / pawSecs(d) : 0);
  const canMake = (d, w) => { const c = lcount(w); for (const k in c) if ((d.letters[k] || 0) < c[k]) return false; return true; };
  const makeCopies = (d, w) => { const c = lcount(w); let n = Infinity; for (const k in c) n = Math.min(n, Math.floor((d.letters[k] || 0) / c[k])); return n; };
  const pick = map => {
    let t = 0; for (const k in map) t += map[k];
    if (t <= 0) return null;
    let r = rand() * t;
    for (const k in map) { r -= map[k]; if (r <= 0) return k; }
    return Object.keys(map)[0];
  };
  const addLetter = (d, ch) => { d.letters[ch] = (d.letters[ch] || 0) + 1; d.tray.push(ch); if (d.tray.length > 80) d.tray.shift(); };
  const takeLetter = (d, ch) => {
    if (!d.letters[ch]) return;
    if (--d.letters[ch] <= 0) delete d.letters[ch];
    const i = d.tray.lastIndexOf(ch); if (i >= 0) d.tray.splice(i, 1);
  };
  /* one goal for every keeper; the argument is kept so call sites read the same */
  const focusRecipe = () => (S.focus && !S.written[S.focus] ? RBY[S.focus] || null : null);
  /* auto focus picks the best return for the crews' time: missing letters, weighted by how slowly that desk's typists work, per banana of rights */
  function autoEffort(r) {
    let t = 0;
    for (const w in r.need) { const n = r.need[w] - stock(w); if (n > 0) { const b = bandOf(w.length); t += n * w.length * PAW_BASE[b] / Math.max(1, S.desks[b].paws); } }
    return t;
  }
  function pickAutoFocus() {
    if (!S.autoFocus || focusRecipe()) return;
    let best = null, bm = Infinity;
    for (const r of RECIPES) {
      if (S.written[r.id] || !inPlay(r) || !Object.keys(r.need).every(w => S.desks[bandOf(w.length)].owned)) continue;
      const miss = autoEffort(r) / r.pay;
      if (miss < bm || (miss === bm && best && r.pay < best.pay)) { best = r; bm = miss; }
    }
    const was = S.focus; S.focus = best ? best.id : null; if (S.focus !== was) IMI.emit('focus', { id: S.focus });
  }
  const mark = () => { dirty = true; dropCaches(); };
  const vib = p => { try { if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; navigator.vibrate && navigator.vibrate(p); } catch { /* unsupported */ } };
  const progress = r => { let have = 0; for (const w in r.need) have += Math.min(stock(w), r.need[w]); return have; };
  /* rolling numbers: cnt() renders a number that animates toward its new value (and counts up from zero when a tab opens) */
  const shownN = {}, cntAnim = {}; let cntWake = false;
  const cnt = (key, n, big) => {
    cntWake = true;
    if (ui.cntZero && !IMI.reduceMotion) { shownN[key] = 0; delete cntAnim[key]; }
    if (!(key in shownN) || IMI.reduceMotion) shownN[key] = n;
    return `<span class="o-cnt" data-cnt="${key}" data-v="${n}"${big ? ' data-big' : ''}>${(big ? fmtBig : fmt)(shownN[key])}</span>`;
  };
  function countStep(now) {
    if (!cntWake) return;                                          // numbers only move after a render has handed them a new value
    let live = false;
    for (const el of document.querySelectorAll('.o-cnt')) {
      const k = el.dataset.cnt, t = +el.dataset.v; let a = cntAnim[k];
      if ((shownN[k] ?? t) === t && !a) { if (el.classList.contains('up')) el.classList.remove('up'); continue; }
      if (!a || a.to !== t) a = cntAnim[k] = { from: shownN[k] ?? t, to: t, t0: now, dur: Math.min(1100, 350 + Math.abs(t - (shownN[k] ?? t)) * 40) };
      const p = Math.min(1, (now - a.t0) / a.dur), e = 1 - Math.pow(1 - p, 3);
      shownN[k] = p >= 1 ? t : a.from + (t - a.from) * e; if (p >= 1) delete cntAnim[k]; else live = true;
      el.textContent = (el.hasAttribute('data-big') ? fmtBig : fmt)(shownN[k]); el.classList.toggle('up', p < 1);
    }
    cntWake = live;
  }
  const bar = (have, total) => `<span class="o-prog" role="img" aria-label="${have} of ${total} words"><i style="width:${Math.round(100 * have / total)}%"></i></span>`;
  /* floating text that rises from a point (page coordinates, so it survives re-renders) */
  function floatText(text, x, y, color, big) {
    if (IMI.reduceMotion) return;
    const el = document.createElement('div'); el.className = 'o-float' + (big ? ' big' : ''); el.textContent = text;
    el.style.cssText = `left:${x}px;top:${y}px;--pc:${color || DESKS[S.sel].color};font-family:${DESKS[S.sel].font}`;
    el.addEventListener('animationend', () => el.remove()); document.body.appendChild(el);
  }
  const logIt = text => { S.log.unshift(text); S.log.length = Math.min(S.log.length, 40); };

  function focusNeeds(d, i) {
    const r = focusRecipe(d), required = {}, oneCopy = {};
    if (!r) return { required, missing: {}, oneCopy };
    for (const w in r.need) {
      if (bandOf(w.length) !== i) continue;
      const left = r.need[w] - stock(w); if (left <= 0) continue;
      const c = lcount(w);
      for (const ch in c) { required[ch] = (required[ch] || 0) + c[ch] * left; oneCopy[ch] = (oneCopy[ch] || 0) + c[ch]; }
    }
    const missing = {};
    for (const ch in required) { const m = required[ch] - (d.letters[ch] || 0); if (m > 0) missing[ch] = m; }
    return { required, missing, oneCopy };
  }
  function completers(d, i, ok) {
    const out = {};
    for (const w of BAND_WORDS[i]) {
      if (!ok(w)) continue;
      const c = lcount(w); let miss = 0, which = null;
      for (const ch in c) { const m = c[ch] - (d.letters[ch] || 0); if (m > 0) { miss += m; which = ch; if (miss > 1) break; } }
      if (miss === 1) out[which] = (out[which] || 0) + 1;
    }
    return out;
  }

  /* ================= typing ================= */
  function roll(d, i, auto, ty) {
    const up = d.up, k = d.keeper; let ch = null;
    if (auto && focusRecipe(d) && rand() < Math.min(.98, [.65, .75, .85, .95][up.practice] + (ty && ty.trait === 'wordsmith' ? .15 : 0))) ch = pick(focusNeeds(d, i).missing);
    if (!ch && auto && k.owned && up.stock && rand() < [0, .2, .4, .6][up.stock]) ch = pick(completers(d, i, w => target(d, w) > 0 && stock(w) < target(d, w)));
    if (!ch && up.ink && rand() < [0, .25, .45, .65][up.ink]) ch = pick(completers(d, i, w => !stock(w)));
    if (!ch) {
      const last = rt[i].sheet.slice(-1).toUpperCase();
      const lastCons = last && /[A-Z]/.test(last) && !VOWELS.includes(last);
      if (lastCons && !chal('vowel') && (up.vowel || (ty && ty.trait === 'vowel') || museOn('dick')) && rand() < Math.max([0, .45, .65, .8][up.vowel], ty && ty.trait === 'vowel' ? .3 : 0, museOn('dick') ? .3 : 0)) ch = pick(Object.fromEntries([...VOWELS].map(v => [v, FREQ[v]])));
      else ch = pick(freqNow());
    }
    return ch;
  }
  function press(i, auto, p) {
    const d = S.desks[i]; if (!d.owned) return;
    const ty = auto && p != null ? d.crew[p] : null;
    if (!auto && chal('hands')) { handsNag(); return; }
    if (!auto && i === S.sel) comboHit();
    const ch = roll(d, i, auto, ty);
    addLetter(d, ch);
    if (ty) { grantXp(d, p, 1); if (ty.trait === 'lucky' && rand() < .05) addLetter(d, roll(d, i, true, ty)); }
    const st = S.stats; st.letters++; if (!auto) { st.manual++; IMI.emit('tap', { letters: st.letters }); } st.byLetter[ch] = (st.byLetter[ch] || 0) + 1;
    if (stormy()) st.storm++; if (document.body.classList.contains('night')) st.night++;
    if (!auto && buffOn('golden')) addLetter(d, roll(d, i, false));
    if (auto && d.up.ribbon && d.keeper.owned && rand() < [0, .1, .2, .3][d.up.ribbon]) {
      const { required, missing } = focusNeeds(d, i), want = pick(missing);
      const spare = Object.keys(d.letters).filter(l => d.letters[l] > (required[l] || 0));
      if (want && spare.length) { takeLetter(d, spare[Math.floor(rand() * spare.length)]); addLetter(d, want); }
    }
    rt[i].sheet = (rt[i].sheet + ch).slice(-120); rt[i].n++;
    if (i === S.sel) animatePress(ch, auto, rt[i].n, p);
    mark();
  }

  /* tapping streaks: keep tapping and the milestones pay out real (if small) bonuses */
  const MILES = [
    { n: 10, name: 'WARM UP', desc: '+3 bonus letters' },
    { n: 25, name: 'FRENZY', desc: 'All typists work twice as fast for 15s' },
    { n: 50, name: 'GOLDEN KEYS', desc: 'Every tap types two letters for 12s' },
    { n: 100, name: 'BANANA BONUS', desc: '50 bananas per title written, plus 50' },
    { n: 200, name: 'MONKEY MANIA', desc: '30s of Frenzy and Golden Keys, plus 10 letters' }
  ];
  const combo = { n: 0, t: 0, timer: 0 };
  function award(m, cx, cy) {
    const d = cur(), now = performance.now();
    if (now < (ui.mcd[m.n] || 0)) { floatText('cooling down', cx, cy + 40, '#cfd8dc'); return; }
    ui.mcd[m.n] = now + 45000;
    if (m.n === 10) for (let k = 0; k < 3; k++) addLetter(d, roll(d, S.sel, true));
    if (m.n === 25) buffs.frenzy = now + 15000;
    if (m.n === 50) buffs.golden = now + 12000;
    if (m.n === 100) bananas.earn(50 * (1 + Object.keys(S.written).length), [cx, cy]);
    if (m.n === 200) { buffs.frenzy = now + 30000; buffs.golden = now + 30000; for (let k = 0; k < 10; k++) addLetter(d, roll(d, S.sel, true)); }
    floatText(m.name + '!', cx, cy, '#ffd23a', true); floatText(m.desc, cx, cy + 46, '#fff6d6');
    IMI.burst(cx, cy, ['spark', 'banana', 'star', 'leaf'], 12 + Math.min(14, m.n / 8)); shock(cx, cy, m.n >= 100 ? '#ff5d73' : '#ffd23a', m.n >= 50); if (m.n >= 50) flash('#fff08c'); if (m.n >= 100) vignette(m.n >= 200 ? '#ff5d73' : '#ffd23a'); shake(m.n >= 100 ? 2 : 1); IMI.sfx.ding(); vib([12, 30, 12]);
    cheer(m.n >= 100 ? 2600 : 1400, m.n >= 100 ? 'WOW!' : 'YAY!');
    mark();
  }
  function comboHit() {
    const now = performance.now(); combo.n = now - combo.t < 650 ? combo.n + 1 : 1; combo.t = now;
    if (combo.n > S.best) { S.best = combo.n; }
    vib(6);
    if (!fx) return; const el = fx.combo, stage = fx.stage;
    const heat = combo.n >= 50 ? 3 : combo.n >= 20 ? 2 : combo.n >= 10 ? 1 : 0;
    if (stage.dataset.heat !== String(heat)) stage.dataset.heat = heat;
    if (combo.n < 5) { if (el.className !== 'o-combo') el.className = 'o-combo'; return; }
    IMI.sfx.combo && IMI.sfx.combo(combo.n);
    fx.comboN.textContent = `x${combo.n}`; const cls = 'o-combo show' + (combo.n >= 50 ? ' hot' : combo.n >= 20 ? ' warm' : ''); if (el.className !== cls) el.className = cls;
    if (!IMI.reduceMotion) {                                         // the number pops on every tap and the streak timer drains from full: Web Animations restart without forcing a layout
      el.animate([{ transform: 'scale(1.8) rotate(-8deg)' }, { transform: 'none' }], { duration: 220, easing: PX ? 'steps(4)' : 'ease-out' });
      if (fx.meterAnim) fx.meterAnim.cancel();
      fx.meterAnim = fx.meter.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], { duration: 900, easing: PX ? 'steps(9)' : 'linear', fill: 'forwards' });
    }
    if (heat) ember(heat);
    const m = MILES.find(x => x.n === combo.n);
    if (m) { const b = stage.getBoundingClientRect(); award(m, b.left + b.width / 2, b.top + 150); }
    clearTimeout(combo.timer); combo.timer = setTimeout(() => { el.className = 'o-combo'; stage.dataset.heat = 0; combo.n = 0; if (fx && fx.meterAnim) fx.meterAnim.cancel(); mark(); }, 900);
    mark();
  }
  /* a hot streak throws sparks up off the keyboard */
  function ember(heat) {
    const box = fx && fx.embers; if (!box || IMI.reduceMotion) return;
    for (let k = 0; k < heat; k++) {
      const e = document.createElement('i'); e.className = 'o-ember';
      e.style.cssText = `left:${15 + rand() * 70}%;--dx:${(rand() - .5) * 60}px;--rise:${-90 - rand() * 120}px;--ec:${['#ffd23a', '#ff9a3a', '#ff5d73'][Math.min(2, Math.floor(rand() * (heat + 1)))]}`;
      e.addEventListener('animationend', () => e.remove()); box.appendChild(e);
    }
    while (box.childElementCount > 40) box.firstElementChild.remove();
  }
  /* a pixel shockwave ring (page coordinates) plus an optional full-screen flash */
  function shock(x, y, color, big, tiny) {
    if (IMI.reduceMotion) return;
    const r = document.createElement('i'); r.className = 'o-shock' + (big ? ' big' : tiny ? ' tiny' : '');
    r.style.cssText = `left:${x}px;top:${y}px;--sc:${color || '#ffd23a'}`;
    r.addEventListener('animationend', () => r.remove()); document.body.appendChild(r);
  }
  function flash(color) {
    if (IMI.reduceMotion) return;
    const f = document.createElement('i'); f.className = 'o-flash'; f.style.setProperty('--fc', color || '#fff6d6');
    f.addEventListener('animationend', () => f.remove()); document.body.appendChild(f);
  }
  /* royalties as visible income: little bananas hop off the shelf (or the typewriter room) into the counter */
  let coinBank = 0;
  function royCoins() {
    const amt = coinBank; coinBank = 0;
    const hud = document.getElementById('hud'); if (!amt || !hud || document.hidden || IMI.reduceMotion || IMI.screen() !== 'game') return;
    const srcs = [...document.querySelectorAll('.o-spine:not(.old)'), document.getElementById('oStage')].filter(e => {
      if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.bottom > 70 && r.top < innerHeight;
    });
    if (!srcs.length) return;
    const h = hud.getBoundingClientRect(), hx = h.left + h.width * .3, hy = h.top + h.height / 2, n = Math.min(3, 1 + Math.floor(Math.log10(amt + 1) / 2));
    for (let k = 0; k < n; k++) setTimeout(() => {
      const src = srcs[Math.floor(rand() * srcs.length)], r = src.getBoundingClientRect(), x = r.left + r.width * (src.id === 'oStage' ? .2 + rand() * .6 : .5), y = r.top + 8;
      if (src.classList.contains('o-spine')) src.animate([{ translate: '0 0' }, { translate: '0 -7px' }, { translate: '0 0' }], { duration: 260, easing: PX ? 'steps(3)' : 'ease-out' });
      let c; if (PX) c = PXA.el('banana', 1); else { c = document.createElement('div'); c.textContent = '🍌'; }
      c.classList.add('o-coin'); c.style.left = x + 'px'; c.style.top = y + 'px'; document.body.appendChild(c);
      const mx = (x + hx) / 2 + (rand() - .5) * 140, my = Math.min(y, hy) - 60 - rand() * 70;
      c.animate([
        { transform: 'translate(-50%,-50%) scale(.3)', opacity: 0 },
        { transform: `translate(calc(-50% + ${mx - x}px), calc(-50% + ${my - y}px)) scale(1.15)`, opacity: 1, offset: .42 },
        { transform: `translate(calc(-50% + ${hx - x}px), calc(-50% + ${hy - y}px)) scale(.6)`, opacity: 1 }
      ], { duration: 620 + rand() * 220, easing: PX ? 'steps(12)' : 'cubic-bezier(.45,0,.6,1)' }).onfinish = () => {
        c.remove(); hud.classList.remove('sip'); void hud.offsetWidth; hud.classList.add('sip'); IMI.sfx.coinlet && IMI.sfx.coinlet();
      };
    }, k * 120);
  }
  /* full-screen moments: a sunburst, a title card, fireworks */
  function celebrate(title, sub, extra) {
    if (document.querySelector('.o-celebrate')) return;
    const el = document.createElement('div'); el.className = 'o-celebrate'; el.setAttribute('role', 'status');
    el.innerHTML = `<i class="o-cel-burst"></i><div class="o-cel-card"><small>${esc(sub)}</small><b>${esc(title)}</b>${extra || ''}<em>Tap to continue</em></div>`;
    document.body.appendChild(el); IMI.sfx.triumph && IMI.sfx.triumph(); vib([30, 40, 30, 40, 90]); flash('#fff6d6');
    const close = () => { if (!el.isConnected || el.classList.contains('out')) return; el.classList.add('out'); setTimeout(() => el.remove(), IMI.reduceMotion ? 0 : 420); };
    el.addEventListener('click', close); setTimeout(close, 5600);
    if (!IMI.reduceMotion) for (let k = 0; k < 7; k++) setTimeout(() => {
      if (!el.isConnected) return; const x = innerWidth * (.1 + rand() * .8), y = innerHeight * (k % 2 ? .08 + rand() * .14 : .76 + rand() * .14);   // above and below the card, never over it
      IMI.burst(x, y, ['banana', 'star', 'spark', 'leaf'], 14); shock(x, y, ['#ffd23a', '#7be05a', '#ff9ec0', '#4cc9f0'][k % 4], true); IMI.sfx.coinlet && IMI.sfx.coinlet();
    }, 300 + k * 280);
  }
  function vignette(color) {
    if (IMI.reduceMotion) return;
    const v = document.createElement('i'); v.className = 'o-vig'; v.style.setProperty('--vc', color);
    v.addEventListener('animationend', () => v.remove()); document.body.appendChild(v);
  }
  function shake(strength) {
    const w = $('.o-panel'); if (!w || IMI.reduceMotion) return;
    w.classList.remove('o-shake', 'o-shake2'); void w.offsetWidth; w.classList.add(strength > 1 ? 'o-shake2' : 'o-shake');
  }

  /* ================= endless titles: the pitch desk ================= */
  const cap1 = w => w.charAt(0).toUpperCase() + w.slice(1);
  const roundSig = n => { const p = Math.pow(10, Math.floor(Math.log10(Math.max(1, n))) - 1); return Math.round(n / p) * p; };
  const shuffled = a => { const o = a.slice(); for (let i = o.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; } return o; };
  function addRecipeWords(r) {
    for (const w of Object.keys(r.need)) if (!VOCAB.has(w)) { VOCAB.add(w); BAND_WORDS[bandOf(w.length)].push(w); BAND_WORDS[bandOf(w.length)].sort(); }
  }
  function registerPitch(p) {
    if (RBY[p.id]) return RBY[p.id];
    const r = buildRecipe({ ...p, gen: true }); RECIPES.push(r); RBY[r.id] = r; addRecipeWords(r); return r;
  }
  function genPitch(band) {
    let best = null;
    for (let attempt = 0; attempt < 60; attempt++) {
      const used = {};
      const choose = cat => {
        const pool = GEN[cat], anchors = pool.filter(w => bandOf(w.length) === band), lows = pool.filter(w => bandOf(w.length) <= band);
        const src = anchors.length && (band === 0 || rand() < .5) ? anchors : lows;
        const w = src[Math.floor(rand() * src.length)]; (used[cat] = used[cat] || []).push(w); return w;
      };
      const fits = t => [...t.matchAll(/\{(\w+)\}/g)].every(m => GEN[m[1]].some(w => bandOf(w.length) <= band));
      const allowed = GEN_TEMPLATES.filter(fits), goal = 22 * TITLE_SCALE[band], n = Math.max(3, Math.round(goal / 6.2)) + (rand() < .4 ? 1 : 0) + (band === 0 ? 2 : 0);
      const ts = Array.from({ length: n }, (_, k) => (band === 0 ? allowed[k % allowed.length] : shuffled(allowed)[k % allowed.length]));
      const text = ts.map(t => cap1(t.replace(/\{(\w+)\}/g, (_, c) => choose(c)))).join(' ');
      const r = buildRecipe({ id: 'tmp', title: '', pay: 0, text });
      const anchors = Object.keys(r.need).filter(w => bandOf(w.length) === band).reduce((a, w) => a + r.need[w], 0);
      if (!best || (r.band === band && anchors > best.anchors)) best = { text, r, used, anchors };
      if (r.band === band && (band === 0 || anchors >= 2) && r.total >= goal * .7 && r.total <= goal * 1.4) break;
    }
    const { text, r, used } = best;
    const A = (used.adj || [])[0], N = (used.animal || [])[0], T = (used.thing || [])[0], P = (used.place || [])[0], M = (used.name || [])[0];
    const forms = [];
    if (A && N) forms.push(`The ${cap1(A)} ${cap1(N)}`);
    if (M && A && T) forms.push(`${cap1(M)} and the ${cap1(A)} ${cap1(T)}`);
    if (N && P) forms.push(`A ${cap1(N)} in the ${cap1(P)}`);
    if (T && P) forms.push(`The ${cap1(T)} of the ${cap1(P)}`);
    const title = forms.length ? forms[Math.floor(rand() * forms.length)] : `The ${cap1((A || N || T || 'Story'))}`;
    const pay = roundSig(PITCH_PAY[band] * (r.total / (22 * TITLE_SCALE[band])) * (.85 + rand() * .3) * (1 + .02 * Math.min(25, S.stats.pitchSold || 0)));
    return { id: 'p-' + Math.random().toString(36).slice(2, 9), title, pay, text };
  }
  const topBand = () => S.desks.reduce((m, d, i) => (d.owned ? i : m), 0);
  function pickPitchBand(taken) {
    const top = topBand();
    for (let k = 0; k < 8; k++) { const roll = rand(), b = roll < .5 ? top : roll < .8 ? Math.max(0, top - 1) : Math.max(0, top - 2); if (!taken.includes(b) || top === 0) return b; }
    return top;
  }
  function newOffers() { const bands = []; for (let k = 0; k < 3; k++) bands.push(pickPitchBand(bands)); return bands.map(b => genPitch(b)); }
  const pitchActive = () => RECIPES.filter(r => r.gen && !S.written[r.id]).length;
  const repitchCost = () => Math.max(25, Math.round(royBase() * 20));
  function pitchHTML() {
    if (!S.offers || !S.offers.length) S.offers = newOffers();
    const act = pitchActive(), full = act >= PITCH_MAX, cost = repitchCost();
    const mine = RECIPES.filter(r => r.gen && !S.written[r.id]);
    return `<div class="o-card o-pitch"><p class="o-dim">Agents pitch endless parody titles built from words your typewriters can type. Commission one, then bank its words and write it to sell the rights. Each pitched title you sell makes the next ones pay 2% more.</p></div>
      <div class="o-card o-pitch"><div class="o-row"><h3>Your commissions</h3><span class="o-dim">${act}/${PITCH_MAX} commissions open</span></div>
      ${mine.length ? `<div class="o-grid">${mine.map(bookCard).join('')}</div>` : '<p class="o-dim">No commissions yet. Pick a pitch below; it will show up here, and in Titles under the Pitched filter.</p>'}</div>
      <div class="o-card o-pitch"><div class="o-row"><h3>New pitches</h3></div>
      <div class="o-grid">${S.offers.map((p, i) => {
        const r = buildRecipe({ ...p, gen: true }), lock = lockedDesk(r);
        return `<div class="o-card sub"><div class="o-row"><h3>${esc(p.title)}</h3><span class="o-tag b${r.band}">${DESKS[r.band].lo}–${DESKS[r.band].hi}</span></div>
          <p class="o-dim">${r.total} words · rights ${price(p.pay)}</p><p class="o-pitchtext">${esc(p.text.split('. ')[0])}…</p>
          ${lock !== undefined ? `<p class="o-warn">Needs ${DESKS[lock].name}</p>` : ''}
          <button type="button" class="o-btn sm gold" data-act="commission" data-i="${i}" ${full ? 'disabled' : ''}>${full ? 'Sell some titles first' : lock !== undefined ? 'Commission anyway' : 'Commission'}</button></div>`;
      }).join('')}</div>
      <div class="o-row o-left"><button type="button" class="o-btn sm" data-act="repitch" ${bananas.get() < cost ? 'disabled' : ''}>New pitches · ${price(cost)}</button></div></div>`;
  }

  /* ================= media divisions =================
     Each release turns a real manuscript from the Archive into a passive income stream. Every division has a quirk tied to something else in the game. */
  const DIVS = [
    { id: 'songs', shelf: 'songs', name: 'Jungle Records', unit: 'song', base: 15, cost: 120000, need: 3,
      quirk: 'Lyrics from the word bank: +1% income per 100 words banked.', mult: () => 1 + .01 * Math.floor(S.stats.words / 100),
      status: () => `Now x${(1 + .01 * Math.floor(S.stats.words / 100)).toFixed(2)} (${fmt(S.stats.words)} words banked).` },
    { id: 'tv', shelf: 'tv-shows', name: 'Canopy TV', unit: 'episode', base: 225, cost: 1.8e6, need: 6,
      quirk: 'Primetime: x1.5 income at night.', mult: () => (isNight() ? 1.5 : 1),
      status: () => (isNight() ? 'Primetime is on: x1.5.' : 'Waiting for night: x1.0.') },
    { id: 'radio', shelf: 'radio-plays', name: 'Vine Radio', unit: 'play', base: 3000, cost: 24e6, need: 9,
      quirk: 'Listeners stay in when it rains: x1.5 in rain or storms.', mult: () => (typeof Weather !== 'undefined' && Weather.state >= 1 ? 1.5 : 1),
      status: () => (typeof Weather !== 'undefined' && Weather.state >= 1 ? 'Rainy-day listening: x1.5.' : 'Clear skies: x1.0. Try the weather toy.') },
    { id: 'sketch', shelf: 'sketches', name: 'Monkey Business Troupe', unit: 'sketch', base: 42000, cost: 3.3e8, need: 12,
      quirk: 'Improv energy: x1.5 while a tap streak of 10 or more is running.', mult: () => (combo.n >= 10 ? 1.5 : 1),
      status: () => (combo.n >= 10 ? `Improv is on (streak x${combo.n}): x1.5.` : 'Tap the typewriter fast to get the troupe going.') },
    { id: 'film', shelf: 'films', name: 'IMI Pictures', unit: 'film', base: 6e5, cost: 4.8e9, need: 16,
      quirk: 'Premieres: every 5 minutes a film opens and pays 2 minutes of its income at once.', mult: () => 1,
      status: () => `Next premiere in ${Math.floor(Math.max(0, 300 - premiereClock) / 60)}:${String(Math.floor(Math.max(0, 300 - premiereClock) % 60)).padStart(2, '0')}.` }
  ];
  const divCount = D => S.divs[D.id] || 0;
  const divOrder = {}, divPrefix = {};
  const totalReleased = () => DIVS.reduce((a, D) => a + divCount(D), 0);
  function buildDivOrder() {
    if (!archive) return;
    for (const D of DIVS) {
      const items = archive.filter(a => a.shelf === D.shelf);
      const avg = items.reduce((a, x) => a + x.words, 0) / Math.max(1, items.length);
      items.sort((a, b) => hashOf(a.title + D.id) - hashOf(b.title + D.id));
      divOrder[D.id] = items;
      const pre = [0]; items.forEach((x, k) => pre.push(pre[k] + Math.max(.7, Math.min(1.4, x.words / avg))));
      divPrefix[D.id] = pre;
    }
  }
  const divCap = D => (divOrder[D.id] ? divOrder[D.id].length : 600);
  const divFactor = D => { const n = Math.min(divCount(D), divCap(D)), p = divPrefix[D.id]; return p ? p[n] : n; };
  const divUnlocked = D => soldCount() >= D.need;
  const divUnit = D => D.base * (TUNE.DIV_BASE || 0.35) * D.mult();
  const divBase = () => DIVS.reduce((a, D) => a + (divCount(D) ? divUnit(D) * divFactor(D) : 0), 0) * (museOn('twain') ? 1.2 : 1) * legacyMult();
  const passive = () => (buffOn('rush') ? 7 : 1) * (buffOn('critic') ? .5 : 1);
  const divRate = () => divBase() * passive();
  let premiereClock = 0;
  function divPlan(D, want) {
    const have = bananas.get(), own = divCount(D), room = divCap(D) - own; let n = 0, cost = 0;
    while (n < want && n < room) { const c = D.cost * (TUNE.DIV_COST || 1) * Math.pow(1.15, own + n); if (want === Infinity && n > 0 && cost + c > have) break; cost += c; n++; }
    return { n, cost: Math.round(cost) };
  }
  function releaseDiv(id) {
    const D = DIVS.find(x => x.id === id); if (!D || !divUnlocked(D)) return;
    loadArchive();
    const plan = divPlan(D, buyWant()); if (plan.n <= 0 || !bananas.spend(plan.cost)) return;
    const before = divCount(D); S.divs[D.id] = before + plan.n;
    const ord = divOrder[D.id], last = ord && ord[Math.min(before + plan.n, ord.length) - 1];
    logIt(`${D.name} released ${plan.n > 1 ? plan.n + ' ' + D.unit + 's' : (/^[aeiou]/.test(D.unit) ? 'an ' : 'a ') + D.unit}${last ? `, latest: “${last.title}”` : ''}.`);
    newsPush(last ? `NEW RELEASE from ${D.name}: “${last.title}”. Critics are baffled; the monkeys are delighted.` : `${D.name} releases ${plan.n} new ${D.unit}${plan.n > 1 ? 's' : ''}.`);
    IMI.sfx.ding(); vib(25);
    const btn = $(`.o-btn[data-act="release"][data-id="${D.id}"]`);
    if (btn) { const [x, y] = IMI.centerOf(btn); IMI.burst(x, y, ['star', 'spark', 'banana'], 12); shock(x, y, '#ffd23a'); if (last) floatText('NEW: ' + last.title, x, y - 50, '#fff6d6'); const card = btn.closest('.o-card'); if (card && !IMI.reduceMotion) card.animate([{ transform: 'none' }, { transform: 'translateY(-6px) scale(1.02)' }, { transform: 'none' }], { duration: 320, easing: PX ? 'steps(4)' : 'ease-out' }); }
    mark(); save();
  }
  function premiere() {
    const F = DIVS[4]; if (!divCount(F)) return;
    const lump = Math.round(divUnit(F) * divFactor(F) * passive() * 120); S.divTotal += lump;
    bananas.earn(lump); floatText(`PREMIERE! +${fmtBig(lump)}`, innerWidth / 2, 190, '#ffd23a', true);
    const ord = divOrder[F.id], pick1 = ord && ord[Math.floor(rand() * Math.min(ord.length, divCount(F)))];
    newsPush(pick1 ? `PREMIERE: “${pick1.title}” opens to a standing ovation from three monkeys and a pigeon.` : 'PREMIERE: a new IMI Picture opens to a standing ovation.');
    IMI.sfx.ding(); mark();
  }
  function renderStudios() {
    loadArchive();
    const want = buyWant(), total = totalReleased(), pool = archive ? archive.filter(a => a.shelf !== 'stories').length : 3000;
    const cards = DIVS.map(D => {
      if (!divUnlocked(D)) return `<div class="o-card locked"><h3>${D.name}</h3><p class="o-dim">Locked: sell ${D.need} titles (you have ${soldCount()}).</p><p class="o-dim">${D.quirk}</p></div>`;
      const n = divCount(D), plan = divPlan(D, want), unit = divUnit(D), ord = divOrder[D.id], full = n >= divCap(D);
      const recent = ord ? ord.slice(Math.max(0, Math.min(n, ord.length) - 3), Math.min(n, ord.length)).reverse().map(x => `<span class="o-chip">${esc(x.title)}</span>`).join('') : '';
      return `<div class="o-card o-div${n ? ' live' : ''}"><div class="o-row"><h3><i class="o-emb e-${D.id}" aria-hidden="true"><b></b><b></b><b></b><b></b></i>${D.name}</h3><span class="o-lvl">${n}/${divCap(D)}</span></div>
        <p>${fmtRate(unit)}/s per release now · total <b>${fmtRate(unit * divFactor(D) * passive())}/s</b></p>
        <p class="o-quirk">${D.quirk}</p><p class="o-dim">${D.status()}</p>
        ${recent ? `<div class="o-chips">${recent}</div>` : ''}
        <button type="button" class="o-btn gold" data-act="release" data-id="${D.id}" ${full || bananas.get() < plan.cost ? 'disabled' : ''}>${full ? 'Catalogue complete' : `${plan.n > 1 ? `Release x${plan.n}` : `Release ${/^[aeiou]/.test(D.unit) ? 'an' : 'a'} ${D.unit}`} · ${price(plan.cost)}`}</button></div>`;
    }).join('');
    morph($('#o-studios'), `
      <p class="o-lede">IMI Studios turn your Archive into passive income. Each release picks a real manuscript from the monkey library and earns bananas every second; longer manuscripts earn a little more. Selling titles unlocks new divisions.</p>
      <div class="o-row o-left"><span>Division income <b>${fmtRate(divRate())}/s</b> · ${fmt(total)} of ${fmt(pool)} manuscripts released</span></div>
      <div class="o-row o-left"><span class="o-dim">Release</span><span class="o-seg">${[1, 10, 100, 'max'].map(n => `<button type="button" data-act="buyn" data-n="${n}" aria-pressed="${String(ui.buyN) === String(n)}">${n === 'max' ? 'Max' : 'x' + n}</button>`).join('')}</span></div>
      <div class="o-grid">${cards}</div>`);
    hydrate($('#o-studios'));
  }

  /* ================= muses: literary patrons seated in up to three slots ================= */
  const MUSES = [
    { id: 'seuss', name: 'Dr. Zoos', cost: 8000, desc: 'Titles in the two shortest bands (2-5 letters) sell for 20% more.' },
    { id: 'poe', name: 'Edgar Allan Chimp', cost: 15000, desc: 'Typists work 25% faster at night.' },
    { id: 'dick', name: 'Emily Dickinsimian', cost: 20000, desc: 'Every typist leans toward vowels after a consonant.' },
    { id: 'hemi', name: 'Ernest Hemingwape', cost: 30000, desc: 'Word keepers bank twice as fast.' },
    { id: 'christie', name: 'Agatha Chrisbanana', cost: 40000, desc: 'Golden bananas show up 30% sooner.' },
    { id: 'woolf', name: 'Virginia Woolfkin', cost: 60000, desc: 'Away work is 15 points more efficient.' },
    { id: 'austen', name: 'Jane Apesten', cost: 120000, desc: 'Royalties +25%.' },
    { id: 'tolken', name: 'J.R.R. Tolkong', cost: 200000, desc: 'Titles in the 8-13 letter bands sell for 25% more.' },
    { id: 'twain', name: 'Mark Twainana', cost: 500000, desc: 'Division income +20%.' }
  ];
  const museSlots = () => (soldCount() >= 13 ? 3 : soldCount() >= 8 ? 2 : soldCount() >= 3 ? 1 : 0);
  const museOn = id => { const seat = S.muses.seated, n = museSlots(); for (let i = 0; i < n; i++) if (seat[i] === id) return true; return false; };
  const museSale = band => (museOn('seuss') && band <= 1 ? 1.2 : 1) * (museOn('tolken') && band >= 3 ? 1.25 : 1);
  /* every muse sits for a portrait: a pixel monkey in their signature hat, in a gilt frame */
  const MUSE_LOOK = { seuss: [3, '#ff5d73'], poe: [0, '#3a2a5a'], dick: [7, '#f08aa4'], hemi: [6, '#5fa8f0'], christie: [2, '#b58cf0'], woolf: [8, '#78d9a0'], austen: [4, '#f2b23a'], tolken: [5, '#9a6a3a'], twain: [2, '#dfe3f2'] };
  const museArt = {};
  function portrait(id, owned) {
    const [hat, bg] = MUSE_LOOK[id] || [0, '#3a2a10'];
    let art;
    if (PX) art = `<img alt="" src="${museArt[id] || (museArt[id] = PXA.monkeyFrame('desk', 'normal', 0, false, 0, hat).cv.toDataURL())}">`;
    else art = `<span class="o-pt-mk">🐒</span>${hat ? `<span class="o-pt-hat">${(hatById(hat) || {}).emoji || ''}</span>` : ''}`;
    return `<span class="o-portrait${owned ? '' : ' veiled'}" style="--mc:${bg}" aria-hidden="true">${art}</span>`;
  }
  function renderMuses() {
    const slots = museSlots(), M = S.muses, have = bananas.get();
    const seatedCards = [0, 1, 2].map(k => {
      const id = M.seated[k], mu = MUSES.find(x => x.id === id);
      if (k >= slots) return `<div class="o-card locked"><h3>Slot ${k + 1}</h3><p class="o-dim">Locked: sell ${[3, 8, 13][k]} titles (you have ${soldCount()}).</p></div>`;
      return mu ? `<div class="o-card o-seat on">${portrait(mu.id, true)}<div class="o-row"><h3>${mu.name}</h3><span class="o-lvl">SLOT ${k + 1}</span></div><p>${mu.desc}</p><button type="button" class="o-btn sm" data-act="museout" data-slot="${k}">Send home</button></div>`
        : `<div class="o-card o-seat"><h3>Slot ${k + 1}</h3><p class="o-dim">Empty. Seat a patron below.</p></div>`;
    }).join('');
    const cards = MUSES.map(mu => {
      const owned = !!M.owned[mu.id], seated = M.seated.includes(mu.id);
      const seatBtns = owned && !seated ? [0, 1, 2].filter(k => k < slots).map(k => `<button type="button" class="o-btn sm" data-act="museseat" data-id="${mu.id}" data-slot="${k}">${M.seated[k] ? 'Swap into' : 'Seat in'} slot ${k + 1}</button>`).join('') : '';
      return `<div class="o-card o-muse">${portrait(mu.id, owned)}<div class="o-row"><h3>${mu.name}</h3>${owned ? `<span class="o-lvl">${seated ? 'SEATED' : 'INVITED'}</span>` : price(mu.cost)}</div><p>${mu.desc}</p>
        ${owned ? (seatBtns || (seated ? '' : '<p class="o-dim">Unlock a slot by selling more titles.</p>')) : `<button type="button" class="o-btn gold" data-act="museinvite" data-id="${mu.id}" ${have < mu.cost ? 'disabled' : ''}>Invite</button>`}</div>`;
    }).join('');
    morph($('#o-muses'), `
      <p class="o-lede">The Muse Salon hosts literary patrons. Invite a Muse once, then seat up to three of them (slots open as you sell titles) and swap them whenever you like. A seated Muse works for you passively.</p>
      <h3 class="o-h">Seated (${M.seated.slice(0, slots).filter(Boolean).length}/${slots})</h3><div class="o-grid">${seatedCards}</div>
      <h3 class="o-h">The guest list</h3><div class="o-grid">${cards}</div>`);
    hydrate($('#o-muses'));
  }

  /* ================= letter garden: grow the exact letters you need ================= */
  const GARDEN_COSTS = [1500, 6000, 25000, 100000];                 // plots 3 to 6
  const GARDEN_SLOW = [1, 2, 5, 12, 30, 80];                        // higher desks grow slower, like their typists
  const gardenTime = (ch, desk) => Math.round((30 + (12 - FREQ[ch]) * 8) * GARDEN_SLOW[desk == null ? S.sel : desk]);   // seconds: rare letters take longer
  const fmtSecs = n => (n >= 3600 ? `${Math.floor(n / 3600)}h ${Math.round(n % 3600 / 60)}m` : n >= 120 ? `${Math.round(n / 60)}m` : `${n}s`);
  const gardenYield = ch => Math.round(6 + (12 - FREQ[ch]) * 1.2);  // ...and give more
  function plant(i, ch) {
    const g = S.garden; if (g.beds[i] || !FREQ[ch]) return;
    g.beds[i] = { ch, desk: S.sel, ready: Date.now() + gardenTime(ch, S.sel) * 1000 }; IMI.sfx.tick(); mark(); save();
  }
  function harvest(i) {
    const g = S.garden, b = g.beds[i]; if (!b || Date.now() < b.ready) return 0;
    const d = S.desks[b.desk] || cur(), y = gardenYield(b.ch);
    d.letters[b.ch] = (d.letters[b.ch] || 0) + y; for (let k = 0; k < Math.min(y, 8); k++) d.tray.push(b.ch); if (d.tray.length > 80) d.tray.splice(0, d.tray.length - 80);
    S.stats.harvested = (S.stats.harvested || 0) + y; g.beds[i] = null; return y;
  }
  function gardenHTML() {
    const g = S.garden, D = DESKS[S.sel], need = focusNeeds(cur(), S.sel).missing, now = Date.now();
    const seeds = Object.keys(FREQ).sort().map(ch => `<button type="button" class="o-seed${ui.seed === ch ? ' on' : ''}${need[ch] ? ' need' : ''}" data-act="seed" data-ch="${ch}" aria-label="Seed ${ch}">${ch}</button>`).join('');
    const plots = g.beds.map((b, i) => {
      if (!b) return `<button type="button" class="o-plot empty" data-act="plant" data-i="${i}"><span class="o-pl-ch">+</span><small>Plant ${ui.seed}</small></button>`;
      const left = Math.max(0, Math.ceil((b.ready - now) / 1000)), total = gardenTime(b.ch, b.desk), pct = Math.min(100, Math.round(100 * (1 - (b.ready - now) / (total * 1000))));
      if (left <= 0) return `<button type="button" class="o-plot ripe" data-act="harvest" data-i="${i}"><span class="o-pl-ch">${b.ch}</span><small>Harvest +${gardenYield(b.ch)}</small></button>`;
      return `<div class="o-plot grow"><span class="o-pl-ch">${b.ch}</span><span class="o-prog" role="img" aria-label="${pct}% grown"><i style="width:${pct}%"></i></span><small>${fmtSecs(left)} · for ${DESKS[b.desk] ? DESKS[b.desk].name.split(' ')[0] : ''}</small></div>`;
    }).join('');
    const ripe = g.beds.filter(b => b && now >= b.ready).length;
    return `<div class="o-card o-garden"><div class="o-row"><h3>Letter garden</h3><span class="o-dim">${g.beds.length} plots · harvests go to ${D.name}</span></div>
      <p class="o-dim">Pick a letter, then tap an empty plot. Rare letters take longer but yield more. Gold keys are needed by the title ${D.name.split(' ')[0]} is focused on.</p>
      <div class="o-seeds">${seeds}</div>
      <p class="o-dim">${ui.seed}: grows in ${fmtSecs(gardenTime(ui.seed))}, yields ${gardenYield(ui.seed)} letters.</p>
      <div class="o-plots">${plots}</div>
      <div class="o-row o-left"><button type="button" class="o-btn sm gold" data-act="harvestall" ${ripe ? '' : 'disabled'}>Harvest all ripe${ripe ? ' (' + ripe + ')' : ''}</button></div></div>`;
  }

  /* ================= second printing (prestige) + oulipo challenges =================
     Retire the room, keep the shelf as earlier editions, and print again. Legacy stars make every printing stronger.
     Before printing you may pick an Oulipo constraint for the new run; finishing it pays stars and a permanent perk. */
  const LEG = [
    { id: 'seed', name: 'Seed Money', max: 3, costs: [1, 3, 8], desc: 'Start each printing with 1,000 / 10,000 / 100,000 bananas.' },
    { id: 'crew', name: 'Veteran Crew', max: 1, costs: [2], desc: 'Start each printing with Hold to type and two typists on Bamboo.' },
    { id: 'speed', name: 'Printing Press', max: 5, costs: [2, 4, 6, 8, 10], desc: 'All typists work 10% faster per level.' },
    { id: 'sales', name: 'Prestige Imprint', max: 5, costs: [3, 5, 7, 9, 11], desc: 'All banana income (sales, royalties, divisions) +10% per level.' },
    { id: 'golden', name: 'Golden Touch', max: 3, costs: [2, 4, 6], desc: 'Golden bananas show up 25% more often per level.' }
  ];
  const CHALLENGES = [
    { id: 'vowel', name: 'Vowel Drought', stars: 3, goalN: 6, desc: 'Vowels are 65% rarer and vowel boosts are off. Sell 6 titles.', perk: 'Typists work 5% faster, forever.' },
    { id: 'haiku', name: 'Haiku Run', stars: 4, goalN: 10, desc: 'Only Bamboo and Hibiscus may be bought. Sell 10 titles.', perk: 'Restorations cost 20% less, forever.' },
    { id: 'hands', name: 'No Hands', stars: 4, goalN: 8, desc: 'Tapping and holding are disabled; only the typists type. Sell 8 titles.', perk: 'Typists work 10% faster, forever.' },
    { id: 'timed', name: 'Deadline', stars: 5, goalN: 8, minutes: 20, desc: 'Sell 8 titles within 20 minutes.', perk: 'Golden banana "Lucky" bonuses are 25% bigger, forever.' }
  ];
  const legLvl = id => S.legacy.ups[id] || 0;
  const legacyMult = () => (1 + .02 * S.legacy.total) * (1 + .1 * legLvl('sales'));
  const editionMult = () => 1 + .35 * S.printing;
  const chal = id => !!S.challenge && S.challenge.id === id;
  const chDef = id => CHALLENGES.find(c => c.id === id);
  const chPerk = id => !!S.chDone[id];
  const speedPerks = () => (1 + .1 * legLvl('speed')) * (chPerk('vowel') ? 1.05 : 1) * (chPerk('hands') ? 1.1 : 1);
  const starsNow = () => Math.floor(Math.sqrt((S.run.earned || 0) / 5e5));
  const nextStarAt = () => Math.pow(starsNow() + 1, 2) * 5e5;
  let freqCache = null;
  const freqNow = () => {
    if (!chal('vowel')) return FREQ;
    return freqCache || (freqCache = Object.fromEntries(Object.entries(FREQ).map(([k, v]) => [k, VOWELS.includes(k) ? v * .35 : v])));
  };
  const chProgress = () => {
    if (!S.challenge) return '';
    const C = chDef(S.challenge.id), left = C.minutes ? Math.max(0, C.minutes * 60 - (Date.now() - S.challenge.start) / 1000) : null;
    return `${soldCount()}/${C.goalN}${left !== null ? ` · ${Math.floor(left / 60)}:${String(Math.floor(left % 60)).padStart(2, '0')}` : ''}`;
  };
  function endChallenge(kind) {
    const C = chDef(S.challenge.id); S.challenge = null;
    if (kind === 'done') {
      const first = !S.chDone[C.id]; S.chDone[C.id] = true;
      if (first) { S.legacy.stars += C.stars; S.legacy.total += C.stars; }
      IMI.sfx.ding(); IMI.banner(PX ? 'OULIPO COMPLETE!' : 'Oulipo Complete!');
      logIt(`Oulipo challenge complete: ${C.name}.${first ? ` +${C.stars} Legacy stars and a permanent perk.` : ''}`);
      newsPush(`${C.name} conquered. Constraint-loving monkeys are smug about it.`);
    } else if (kind === 'fail') { logIt(`The ${C.name} challenge ran out of time. The constraint is lifted.`); newsPush(`${C.name} failed. The monkeys promise they were just warming up.`); }
    else logIt(`Abandoned the ${C.name} challenge.`);
    mark(); save();
  }
  function checkChallenge() {
    if (!S.challenge) return;
    const C = chDef(S.challenge.id);
    if (soldCount() >= C.goalN) endChallenge('done');
    else if (C.minutes && Date.now() - S.challenge.start > C.minutes * 60000) endChallenge('fail');
  }
  let handsNagAt = 0;
  function handsNag() { const n = performance.now(); if (n - handsNagAt < 1200) return; handsNagAt = n; const b = $('#oStage'); if (b) { const r = b.getBoundingClientRect(); floatText('NO HANDS!', r.left + r.width / 2, r.top + 120, '#ff8a70', true); } }

  function doPrint(chId) {
    const gain = starsNow(); if (gain < 1) return;
    const old = S, f = fresh();
    Object.assign(f, { daily: old.daily, awards: old.awards, stats: old.stats, best: old.best, gold: old.gold, royTotal: old.royTotal, divTotal: old.divTotal, pitches: old.pitches, chDone: old.chDone, printing: old.printing + 1 });
    f.editions = { ...old.editions }; Object.keys(old.written).forEach(id => { f.editions[id] = (f.editions[id] || 0) + 1; });
    f.legacy = { ...old.legacy, ups: { ...old.legacy.ups }, stars: old.legacy.stars + gain, total: old.legacy.total + gain };
    f.run = { earned: 0 }; f.challenge = chId ? { id: chId, start: Date.now() } : null;
    S = f; freqCache = null;
    S.desks.forEach(ensureCrew);
    bananas.spend(bananas.get());
    const seed = [0, 1000, 10000, 100000][legLvl('seed')]; if (seed) bananas.add(seed);
    if (legLvl('crew')) { S.hold = true; S.desks[0].paws = 2; ensureCrew(S.desks[0]); }
    S.run.earned = 0; lastBananas = bananas.get();
    rt.forEach(r => { r.timers = []; r.sheet = ''; r.col = 0; r.n = 0; });
    ui.hot = DESKS.map(() => false); ui.readySet = null; ui.pulled = null; ui.fresh = null; ui.dropped = {}; ui.mcd = {}; ui.tab = 'floor';
    Object.keys(buffs).forEach(k => { buffs[k] = 0; });
    S.sel = 0; typists = [];
    logIt(`Printing ${S.printing + 1} begins. Legacy stars: ${S.legacy.stars}.${S.challenge ? ' Challenge: ' + chDef(S.challenge.id).name + '.' : ''}`);
    newsPush(`SECOND PRINTING: the room is reborn with ${S.legacy.total} Legacy stars. Titles can be sold again.`);
    shownN['cel-st'] = 0;
    celebrate(PX ? `PRINTING ${S.printing + 1}` : `Printing ${S.printing + 1}`, PX ? 'THE PRESSES ROLL AGAIN' : 'The presses roll again',
      `<p class="o-cel-stars">+${cnt('cel-st', gain)} Legacy star${gain > 1 ? 's' : ''}</p><p class="o-cel-sub">Every title can be sold again. Income x${(legacyMult() * editionMult()).toFixed(2)}.</p>`);
    buildStage(); render(); save();
  }
  function askPrint() {
    const gain = starsNow(); if (gain < 1) return;
    document.querySelectorAll('.o-modal').forEach(m => m.remove());
    const el = document.createElement('div'); el.className = 'o-modal'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-labelledby', 'oPrT');
    const C = ui.nextCh && chDef(ui.nextCh);
    el.innerHTML = `<div class="o-modal-card"><h3 id="oPrT">Go to press?</h3>
      <p>You will earn <b>${gain}</b> Legacy star${gain > 1 ? 's' : ''} and start printing ${S.printing + 2}.${C ? ` The <b>${C.name}</b> constraint will apply.` : ''}</p>
      <p class="o-dim">You keep awards, stats, pitched titles, Legacy and your bookshelf (as earlier editions). You lose bananas, machines, typists, upgrades, deals, divisions, Muses, the garden and the word bank.</p>
      <div class="o-row"><button type="button" class="o-btn" data-cancel>Not yet</button><button type="button" class="o-btn gold" data-ok>Print it</button></div></div>`;
    document.body.appendChild(el);
    const close = () => el.remove();
    el.querySelector('[data-cancel]').addEventListener('click', close);
    el.querySelector('[data-ok]').addEventListener('click', () => { close(); doPrint(ui.nextCh); });
    el.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    el.querySelector('[data-cancel]').focus();
  }
  function renderLegacy() {
    const earned = S.run.earned || 0, gain = starsNow(), L = S.legacy;
    const chips = [['', 'No constraint']].concat(CHALLENGES.map(c => [c.id, c.name + (S.chDone[c.id] ? ' ✓' : '')]))
      .map(([id, name]) => `<button type="button" data-act="chpick" data-id="${id}" aria-pressed="${(ui.nextCh || '') === id}">${esc(name)}</button>`).join('');
    const picked = ui.nextCh && chDef(ui.nextCh);
    const active = S.challenge ? `<div class="o-card o-seat on"><div class="o-row"><h3>Oulipo: ${chDef(S.challenge.id).name}</h3><span class="o-lvl">${chProgress()}</span></div><p>${chDef(S.challenge.id).desc}</p><button type="button" class="o-btn sm" data-act="chabandon">Abandon (no reward)</button></div>` : '';
    const legCards = LEG.map(u => {
      const lv = legLvl(u.id), cost = u.costs[lv];
      return `<div class="o-card"><div class="o-row"><h3>${u.name}</h3><span class="o-lvl">${lv}/${u.max}</span></div>${pips(lv, u.max)}<p>${u.desc}</p>
        ${lv >= u.max ? '<span class="o-lvl">MAXED</span>' : `<button type="button" class="o-btn gold" data-act="legbuy" data-id="${u.id}" ${L.stars < cost ? 'disabled' : ''}>${cost} star${cost > 1 ? 's' : ''}</button>`}</div>`;
    }).join('');
    const tabs = [['press', 'Press'], ['challenges', 'Challenges'], ['upgrades', 'Upgrades', L.stars ? L.stars : 0]];
    if (!tabs.some(t => t[0] === ui.sub.legacy)) ui.sub.legacy = 'press';
    const sub = ui.sub.legacy, done = CHALLENGES.filter(c => S.chDone[c.id]);
    let body;
    if (sub === 'press') body = `<div class="o-card o-print"><div class="o-row"><h3>Second Printing</h3><span class="o-lvl">Printing ${S.printing + 1}</span></div>
        <p>Keep your shelf as earlier editions: every title sells again for <b>+${35 * (S.printing + 1)}%</b> more (now +${35 * S.printing}%).</p>
        <p>Each Legacy star adds <b>2%</b> to all banana income.</p>
        <p>You restart machines, typists and bananas.</p>
        <p>This run has earned <b>${fmtBig(earned)}</b> bananas: <b>${gain}</b> Legacy star${gain === 1 ? '' : 's'} if you print now.${gain >= 1 ? '' : ' (The first star needs 500K.)'} The next star arrives at ${fmtBig(nextStarAt())}.</p>
        <p class="o-dim">Legacy: <b>${L.stars}</b> unspent of ${L.total} earned (+${2 * L.total}% income).</p>
        <button type="button" class="o-btn gold" data-act="printask" ${gain >= 1 ? '' : 'disabled'}>Go to press</button></div>`;
    else if (sub === 'challenges') body = `<h3 class="o-h">Challenge for the next printing (optional)</h3>
        <div class="o-filters"><span class="o-seg">${chips}</span></div>
        ${picked ? `<p>${picked.desc} Reward: <b>+${picked.stars} stars</b> and a perk: ${picked.perk}${S.chDone[picked.id] ? ' <span class="o-dim">(already earned; replaying pays nothing)</span>' : ''}</p>` : '<p class="o-dim">Constraints make a run harder in a literary way. Each is worth stars and a permanent perk the first time you finish it.</p>'}
        ${active}
        ${done.length ? `<h3 class="o-h">Completed perks</h3><div class="o-grid">${done.map(c => `<div class="o-card"><h3>${c.name} ✓</h3><p>${c.perk}</p></div>`).join('')}</div>` : ''}`;
    else body = `<p class="o-dim">Legacy stars unspent: <b>${L.stars}</b></p><div class="o-grid">${legCards}</div>`;
    morph($('#o-legacy'), subTabs('legacy', tabs) + body);
    hydrate($('#o-legacy'));
  }

  /* ================= restorations ================= */
  const MK_BASE = [5000, 40000, 500000, 6e6, 8e7, 1e9], MK_NAMES = ['', 'Mk II', 'Mk III'];
  const deskMk = d => 1 + .25 * (d.mk || 0);
  const mkCost = i => Math.round(MK_BASE[i] * (S.desks[i].mk ? 12 : 1) * (chPerk('haiku') ? .8 : 1));
  function mkCard(i, have) {
    const D = DESKS[i], d = S.desks[i], next = MK_NAMES[d.mk + 1];
    return `<div class="o-card" style="--c:${D.color}"><div class="o-row"><h3>${D.name}${d.mk ? ' ' + MK_NAMES[d.mk] : ''}</h3>${d.mk >= 2 ? '<span class="o-lvl">MAXED</span>' : price(mkCost(i))}</div>
      <p>${d.mk >= 2 ? 'Fully restored: typists work 50% faster here and titles in this band sell for 10% more.' : `Restore to ${next}: typists here work ${d.mk ? '50' : '25'}% faster and titles in this band sell for ${d.mk ? '10' : '5'}% more.`}</p>
      ${d.mk >= 2 ? '' : `<button type="button" class="o-btn gold" data-act="buy" data-what="mk" data-i="${i}" ${have < mkCost(i) ? 'disabled' : ''}>Restore</button>`}</div>`;
  }

  /* ================= rights market =================
     Every band has a demand multiplier that drifts. A sale pays base x demand, so you can sit on a ready title and wait for a hot market.
     Night, rain, storms and clear days each push a different band, which makes the weather and sun/moon toys matter. */
  const MK_MIN = 0.5, MK_MAX = 2.0;
  const marketFloor = () => (S.agent ? .85 : MK_MIN);
  const marketMult = b => Math.max(marketFloor(), Math.round(S.market.v[b] * 100) / 100);
  const salePay = r => Math.round(r.pay * (S.contracts ? 1.25 : 1) * awardMult() * marketMult(r.band) * (1 + .05 * (S.desks[r.band].mk || 0)) * museSale(r.band) * legacyMult() * editionMult());
  function marketBias(b) {
    const wx = typeof Weather !== 'undefined' ? Weather.state : 0, night = document.body.classList.contains('night');
    if (b === 0) return night ? .3 : 0;                       // bedtime books sell at night
    if (b === 1) return wx === 1 || wx === 2 ? .3 : 0;        // cosy reading weather
    if (b === 2) return wx === 3 ? .45 : 0;                   // dramatic stories sell in a storm
    if (b === 3) return wx === 0 && !night ? .2 : 0;          // gift books sell on sunny days
    if (b === 4) return wx === 0 && night ? .3 : 0;           // stargazing on clear nights
    return wx === 3 || (wx >= 2 && night) ? .45 : 0;          // gothic epics sell in heavy night weather
  }
  const marketNext = b => { const M = S.market; return M.v[b] + (1 + marketBias(b) - M.v[b]) * .12 + M.m[b] * .55; };
  function gardenTick() {
    const g = S.garden; if (!g.beds.some(Boolean)) return;
    const now = Date.now(); g.beds.forEach((b, i) => { if (b && now >= b.ready && !b.told) { b.told = true; if (!document.hidden) { IMI.sfx.tick(); newsPush(`A plot of ${b.ch} is ripe in the Coconut R&D garden.`); } } });
    if (ui.tab === 'lab' || ui.tab === 'muses') mark(); else dirty = true;
  }
  function marketStep(silent) {
    const M = S.market;
    for (let b = 0; b < DESKS.length; b++) {
      M.m[b] = M.m[b] * .55 + (rand() - .5) * 2 * .07;
      M.v[b] = Math.max(marketFloor(), Math.min(MK_MAX, M.v[b] + (1 + marketBias(b) - M.v[b]) * .12 + M.m[b]));
      M.hist[b].push(Math.round(M.v[b] * 1000) / 1000); if (M.hist[b].length > 40) M.hist[b].shift();
      if (M.v[b] >= 1.5 && !ui.hot[b]) {
        ui.hot[b] = true;
        if (!silent && RECIPES.some(r => r.band === b && !S.written[r.id])) newsPush(`MARKET: ${DESKS[b].lo}-${DESKS[b].hi} letter titles are hot (x${M.v[b].toFixed(2)}). Publishers are throwing bananas.`);
      } else if (M.v[b] < 1.3) ui.hot[b] = false;
    }
    mark();
  }
  function marketHTML() {
    const M = S.market, rows = DESKS.map((D, b) => {
      const v = marketMult(b), h = M.hist[b], prev = h.length > 1 ? h[h.length - 2] : v, dir = v > prev + .004 ? 'up' : v < prev - .004 ? 'down' : 'flat';
      const bars = h.slice(-24).map(x => `<i style="height:${Math.round(Math.max(6, Math.min(100, (x - .4) / 1.7 * 100)))}%"></i>`).join('');
      const nx = S.analyst ? marketNext(b) : null, fc = nx === null ? '' : `<span class="o-dim o-fc">soon: ${nx > v + .01 ? 'rising' : nx < v - .01 ? 'falling' : 'steady'}</span>`;
      const tag = v >= 1.5 ? '<span class="o-mtag hot">HOT</span>' : v <= .8 ? '<span class="o-mtag cold">COLD</span>' : '';
      const any = RECIPES.some(r => r.band === b), left = any ? RECIPES.filter(r => r.band === b && !S.written[r.id] && inPlay(r)).length : 1;
      return `<div class="o-mrow${left ? '' : ' done'}" style="--bc:${D.color}"><span class="o-mname"><b>${D.name.split(' ')[0]}</b><small>${D.lo}–${D.hi} letters${any ? (left ? '' : ' · all sold') : ' · pitch to unlock'}</small></span><span class="o-spark" aria-hidden="true">${bars}</span><span class="o-mval"><i class="o-arr ${dir}"></i>x${v.toFixed(2)}</span><span class="o-mextra">${tag}${fc}</span></div>`;
    }).join('');
    return `<div class="o-card o-market"><div class="o-row"><h3>Rights market</h3><span class="o-dim">sales pay base x demand</span></div>${rows}
      <p class="o-dim">Demand drivers: night lifts Bamboo, rain lifts Hibiscus, storms lift Lagoon, a clear day lifts Honeycomb, a clear night lifts Orchid, and a stormy night lifts Moonflower. Flip the weather and day/night buttons in the header to steer it.</p></div>`;
  }

  /* ================= awards ================= */
  const AW = (id, tier, name, desc, test) => ({ id, tier, name, desc, test });
  const totalPaws = () => S.desks.reduce((a, d) => a + d.paws, 0);
  const AWARDS = [
    AW('l100', 0, 'Warming Up', 'Type 100 letters', () => S.stats.letters >= 100),
    AW('l1k', 0, 'Ink Fingers', 'Type 1,000 letters', () => S.stats.letters >= 1000),
    AW('l10k', 1, 'Ribbon Burner', 'Type 10,000 letters', () => S.stats.letters >= 10000),
    AW('l100k', 2, 'Infinite Monkey', 'Type 100,000 letters', () => S.stats.letters >= 100000),
    AW('c10', 0, 'Tap Dancer', 'Reach a x10 tap streak', () => S.best >= 10),
    AW('c50', 1, 'Key Storm', 'Reach a x50 tap streak', () => S.best >= 50),
    AW('c100', 1, 'Thumb Marathon', 'Reach a x100 tap streak', () => S.best >= 100),
    AW('c200', 2, 'Monkey Mania', 'Reach a x200 tap streak', () => S.best >= 200),
    AW('w10', 0, 'Word Hoarder', 'Bank 10 words', () => S.stats.words >= 10),
    AW('w100', 1, 'Lexicon', 'Bank 100 words', () => S.stats.words >= 100),
    AW('w1k', 2, 'Thesaurus', 'Bank 1,000 words', () => S.stats.words >= 1000),
    AW('s1', 0, 'First Printing', 'Sell your first title', () => soldCount() >= 1),
    AW('s4', 0, 'Back List', 'Sell 4 titles', () => soldCount() >= 4),
    AW('s8', 1, 'Prolific', 'Sell 8 titles', () => soldCount() >= 8),
    AW('s12', 1, 'Bestselling Author', 'Sell 12 titles', () => soldCount() >= 12),
    AW('s16', 2, 'The Complete Works', 'Sell every authored title', () => authoredSold() >= BOOKS),
    AW('k10', 0, 'Story Time', 'Sell 10 kids’ books', () => kidsSold() >= 10),
    AW('k50', 1, 'Reading Corner', 'Sell 50 kids’ books', () => kidsSold() >= 50),
    AW('k300', 2, 'Library Card', 'Sell all ' + KIDS.length + ' kids’ books', () => KIDS.length > 0 && kidsSold() >= KIDS.length),
    AW('d1', 0, 'In the Pink', 'Install Hibiscus Ribbon', () => S.desks[1].owned),
    AW('d2', 1, 'Making Waves', 'Install Lagoon Sprint', () => S.desks[2].owned),
    AW('d3', 2, 'Sweet as Honey', 'Install Honeycomb Ledger', () => S.desks[3].owned),
    AW('p8', 0, 'Typing Pool', 'Employ 8 typists', () => totalPaws() >= 8),
    AW('p20', 1, 'Open-Plan Office', 'Employ 20 typists', () => totalPaws() >= 20),
    AW('p40', 2, 'Monkey Business', 'Employ 40 typists', () => totalPaws() >= 40),
    AW('g1', 0, 'Shiny!', 'Catch a golden banana', () => S.gold >= 1),
    AW('g10', 1, 'Banana Spotter', 'Catch 10 golden bananas', () => S.gold >= 10),
    AW('g25', 2, 'Gold Rush', 'Catch 25 golden bananas', () => S.gold >= 25),
    AW('r1', 0, 'Rotten Luck', 'Touch a rotten banana', () => S.stats.rotten >= 1),
    AW('deal', 2, 'Mogul', 'Sign every publishing deal', () => DEALS.every(x => S.deals[x.id])),
    AW('storm', 1, 'Stormy Weather', 'Type 50 letters during a storm', () => S.stats.storm >= 50),
    AW('night', 0, 'Night Owl', 'Type 100 letters at night', () => S.stats.night >= 100),
    AW('b10k', 0, 'Banana Stand', 'Hold 10,000 bananas', () => bananas.get() >= 1e4),
    AW('b1m', 1, 'Banana Republic', 'Hold 1 million bananas', () => bananas.get() >= 1e6),
    AW('b1b', 2, 'Banana Empire', 'Hold 1 billion bananas', () => bananas.get() >= 1e9),
    AW('keep', 0, 'Auto Clerk', 'Have a keeper bank 25 words', () => S.stats.words >= 25),
    AW('hold', 0, 'Heavy Hitter', 'Buy Hold to type', () => S.hold),
    AW('away1', 0, 'Welcome Back', 'Return after an hour away', () => (S.stats.awayMax || 0) >= 3600),
    AW('lamp3', 1, 'Night Light', 'Fully upgrade the Night Lamp', () => S.lamp >= 3),
    AW('mk15', 1, 'Market Timing', 'Sell a title at x1.5 or better', () => (S.stats.bestMult || 0) >= 1.5),
    AW('mk19', 2, 'Perfect Pitch', 'Sell a title at x1.9 or better', () => (S.stats.bestMult || 0) >= 1.9),
    AW('lv5', 0, 'Promotion', 'Get a typist to level 5', () => maxLevel() >= 5),
    AW('lv10', 1, 'Master Typist', 'Get a typist to level 10', () => maxLevel() >= 10),
    AW('hat1', 0, 'Dapper', 'Put a hat on a typist', () => S.desks.some(d => d.crew.some(t => t.hat))),
    AW('d4', 2, 'Orchid Season', 'Install Orchid Imperial', () => S.desks[4].owned),
    AW('d5', 2, 'Moonstruck', 'Install Moonflower Grand', () => S.desks[5].owned),
    AW('p1', 0, 'Pitch Perfect', 'Commission a pitched title', () => (S.stats.pitched || 0) >= 1),
    AW('p10', 1, 'Idea Factory', 'Sell 10 pitched titles', () => (S.stats.pitchSold || 0) >= 10),
    AW('p50', 2, 'Literary Empire', 'Sell 50 pitched titles', () => (S.stats.pitchSold || 0) >= 50),
    AW('mk1', 0, 'Restoration Drama', 'Restore a typewriter to Mk II', () => S.desks.some(d => d.mk >= 1)),
    AW('mk3', 1, 'Concours d\'Elegance', 'Restore a typewriter to Mk III', () => S.desks.some(d => d.mk >= 2)),
    AW('dv1', 0, 'On Air', 'Release your first manuscript', () => totalReleased() >= 1),
    AW('dv100', 1, 'Back Catalogue', 'Release 100 manuscripts', () => totalReleased() >= 100),
    AW('dv5', 2, 'Media Mogul', 'Run all five divisions', () => DIVS.every(D => divCount(D) > 0)),
    AW('dvall', 2, 'The Whole Catalogue', 'Release every manuscript of one format', () => DIVS.some(D => divOrder[D.id] && divCount(D) >= divOrder[D.id].length)),
    AW('mu1', 0, 'Patron of the Arts', 'Invite your first Muse', () => MUSES.some(m => S.muses.owned[m.id])),
    AW('mu3', 1, 'Full Salon', 'Seat three Muses at once', () => S.muses.seated.slice(0, 3).filter(Boolean).length >= 3),
    AW('gar1', 0, 'Green Thumb', 'Harvest your first letters', () => (S.stats.harvested || 0) >= 1),
    AW('gar500', 1, 'Letter Farmer', 'Harvest 500 letters', () => (S.stats.harvested || 0) >= 500),
    AW('pr1', 1, 'Second Printing', 'Complete a printing', () => S.printing >= 1),
    AW('pr3', 2, 'Collector\'s Edition', 'Complete three printings', () => S.printing >= 3),
    AW('ch1', 1, 'Constraint Satisfied', 'Finish an Oulipo challenge', () => Object.keys(S.chDone).length >= 1),
    AW('ch4', 2, 'Oulipian', 'Finish all four Oulipo challenges', () => CHALLENGES.every(c => S.chDone[c.id])),
    AW('roy100', 1, 'Passive Income', 'Earn 100 bananas per second in royalties', () => royBase() >= 100),
    AW('roy1m', 1, 'Mailbox Money', 'Earn 1 million bananas in royalties', () => S.royTotal >= 1e6)
  ];
  /* app-style achievement cards slide in under the top bar and stack */
  function achieve(a) {
    if (document.querySelector('.o-celebrate, .o-modal')) return void setTimeout(() => achieve(a), 700);   // wait for the big moment to finish
    let box = document.querySelector('.o-achs');
    if (!box) { box = document.createElement('div'); box.className = 'o-achs'; box.setAttribute('aria-live', 'polite'); document.body.appendChild(box); }
    const el = document.createElement('button'); el.type = 'button'; el.className = `o-ach t${a.tier}`;
    el.innerHTML = `${ico('trophy' + a.tier, 40)}<span><small>${a.tier === 2 ? 'GOLD AWARD' : 'AWARD UNLOCKED'}</small><b>${esc(a.name)}</b><em>${esc(a.desc)} · +1% income</em></span>`;
    hydrate(el); box.appendChild(el);
    while (box.children.length > 3) box.firstElementChild.remove();
    el.addEventListener('click', () => { el.remove(); ui.sub.records = 'awards'; setTab('records'); });
    const r = el.getBoundingClientRect(); setTimeout(() => { if (!el.isConnected) return; IMI.burst(r.left + 30, r.top + r.height / 2, ['star', 'spark'], 8); }, 380);
    setTimeout(() => { if (IMI.reduceMotion) return el.remove(); el.classList.add('out'); el.addEventListener('animationend', () => el.remove(), { once: true }); }, 4200);
  }
  function unlockAward(a, silent) {
    S.awards[a.id] = true;
    if (silent) return;
    ui.unseen++; IMI.sfx.ding(); vib([10, 20, 10]);
    logIt(`Award unlocked: ${a.name} (${a.desc.toLowerCase()}).`);
    newsPush(`AWARD: “${a.name}” goes to the monkeys. Income up 1%; modesty down 100%.`);
    achieve(a);
    if (a.tier === 2) IMI.banner(PX ? 'GOLD AWARD!' : 'Gold Award!');
    mark(); save();
  }
  function checkAwards(silent) { for (const a of AWARDS) if (!S.awards[a.id] && a.test()) unlockAward(a, silent); }
  const trophyHTML = () => {
    const got = AWARDS.filter(a => S.awards[a.id]);
    return `<div class="o-trophies">${got.map(a => `<span class="o-trophy" title="${esc(a.name)}: ${esc(a.desc)}">${ico('trophy' + a.tier, 30)}</span>`).join('') || '<span class="o-dim">No awards yet. Keep typing.</span>'}</div>`;
  };

  function renderRecords() {
    const st = S.stats, top = Object.entries(st.byLetter).sort((a, b) => b[1] - a[1])[0];
    const mins = Math.floor(st.secs / 60), played = mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m ${Math.floor(st.secs % 60)}s`;
    const row = (k, v) => `<div class="o-row"><span>${k}</span><b>${v}</b></div>`;
    const sorted = [...AWARDS].sort((a, b) => (!!S.awards[b.id] - !!S.awards[a.id]));
    const tabs = [['awards', 'Awards'], ['stats', 'Stats'], ['log', 'Log']];
    if (!tabs.some(t => t[0] === ui.sub.records)) ui.sub.records = 'awards';
    const sub = ui.sub.records;
    tabs[0].push(sub !== 'awards' && ui.unseen ? ui.unseen : 0);
    if (sub === 'awards') ui.unseen = 0;
    const awardsHTML = `<p class="o-lede"><b>${cnt('r-aw', awardCount())}/${AWARDS.length}</b> awards, <b>+${cnt('r-aw2', awardCount())}%</b> income (each adds 1%).</p>
      <div class="o-awards">${sorted.map((a, n) => { const on = !!S.awards[a.id]; return `<div class="o-award t${a.tier}${on ? '' : ' locked'}" style="--n:${n}">${ico(on ? 'trophy' + a.tier : 'trophy0', 36)}<span><b>${esc(a.name)}</b><small>${esc(a.desc)}</small></span></div>`; }).join('')}</div>`;
    const logHTML = `<ol class="o-log">${S.log.map(t => `<li>${esc(t)}</li>`).join('') || '<li class="o-dim">Nothing yet. Go type something.</li>'}</ol>`;
    const statsHTML = `
      <div class="o-grid">
        <div class="o-card"><h3>Typing</h3>${row('Letters typed', cnt('r-let', st.letters))}${row('By hand', cnt('r-man', st.manual))}${row('By typists', cnt('r-aut', st.letters - st.manual))}${row('Favourite letter', top ? `${top[0]} (${fmt(top[1])})` : '-')}${row('Best tap streak', 'x' + cnt('r-best', S.best))}${row('Words banked', cnt('r-wds', st.words))}${row('Letters harvested', cnt('r-hv', st.harvested || 0))}</div>
        <div class="o-card"><h3>Publishing</h3>${row('Titles sold', `${authoredSold()}/${BOOKS}${S.stats.pitchSold ? ' + ' + S.stats.pitchSold + ' pitched' : ''}`)}${row('Rights sales', cnt('r-lump', st.lump, true))}${row('Royalties earned', cnt('r-roy', S.royTotal, true))}${row('Royalties now', fmtRate(royRate()) + '/s')}${row('Deals signed', `${DEALS.filter(x => S.deals[x.id]).length}/${DEALS.length}`)}${row('Division income', fmtRate(divRate()) + '/s')}${row('Manuscripts released', cnt('r-man2', totalReleased()))}${row('Printings completed', S.printing)}${row('Legacy stars', `${S.legacy.stars} (${S.legacy.total} earned)`)}${row('Best sale price', 'x' + (st.bestMult || 1).toFixed(2))}</div>
        <div class="o-card"><h3>Luck &amp; time</h3>${row('Golden bananas caught', cnt('r-gold', S.gold))}${row('Rotten bananas touched', cnt('r-rot', st.rotten))}${row('Typed in storms', cnt('r-storm', st.storm))}${row('Typed at night', cnt('r-night', st.night))}${row('Time on the floor', played)}</div>
      </div>`;
    morph($('#o-records'), subTabs('records', tabs) + (sub === 'awards' ? awardsHTML : sub === 'stats' ? statsHTML : logHTML));
    hydrate($('#o-records'));
  }

  /* ================= news ticker ================= */
  const NEWS = [
    'Local monkey demands better ribbon. Management offers a banana.',
    'BREAKING: Typist spotted napping on the Q key. Q is fine.',
    'The letter E reports a record workload and requests a day off.',
    'Jungle Press confirms every word is a real word, probably.',
    'Study: 9 out of 10 monkeys prefer typing to Shakespeare. The tenth is on a break.',
    'Banana prices steady as demand for fiction holds.',
    'Scientists confirm infinite monkeys remain infinitely busy.',
    'Typewriter ribbons unionize. Talks stall over ink.',
    'Vine inspector finds the vines “mostly vine-like”.',
    'Coconut R&D denies rumours of a coconut-powered typewriter. For now.',
    'Letter Z feels left out again. A committee has been formed.',
    'Tip line: if a monkey types “ape”, it is probably an ape.'
  ];
  const ticker = { q: [], anim: null, recent: [], timer: 0 };
  function headlinePool() {
    const out = NEWS.slice(), sold = Object.keys(S.written).filter(id => RBY[id]).map(id => RBY[id]), n = sold.length, paws = totalPaws();
    if (n) { const r = sold[Math.floor(rand() * n)]; out.push(`Critics call “${r.title}” “a bold reimagining” and also “short”.`, `Readers demand a sequel to “${r.title}”. The rights are sold; readers are told to cope.`); }
    const allCrew = S.desks.flatMap(d => d.crew || []);
    if (allCrew.length) { const t = allCrew[Math.floor(rand() * allCrew.length)]; out.push(`${t.name} (${TRAITS[t.trait].name}) was seen reorganizing the ribbon drawer.`); if (levelOf(t.xp) >= 3) out.push(`${t.name} is level ${levelOf(t.xp)} and has started giving other monkeys advice.`); }
    if (paws === 0) out.push('The Bamboo Classic sits idle. Experts recommend a monkey. Or a finger.');
    if (paws >= 5) out.push(`The typing pool reaches ${paws} monkeys. HR is overwhelmed.`);
    if (paws >= 20) out.push(`${paws} typists now employed; the break room is mostly banana peels.`);
    if (stormy()) out.push('Storm warning: typists clinging to vines. Spelling affected.');
    else if (typeof Weather !== 'undefined' && Weather.state > 0) out.push('Rain delays typing. Monkeys in leaf hats report improved morale.');
    if (document.body.classList.contains('night')) out.push('Night shift begins. Fireflies file for overtime.');
    if (royBase() > 0) out.push(`Royalties reach ${fmtRate(royRate())} bananas per second. Accountants dizzy.`);
    out.push('Word keepers keep words. Experts call this “keeping”.');
    if (S.hold) out.push('New study: holding a key is also a kind of typing.');
    const bankN = Object.values(S.bank).reduce((a, b) => a + b, 0); if (bankN > 30) out.push(`The word bank holds ${bankN} words. Several are lonely.`);
    if (S.best >= 50) out.push(`Tap champion reaches x${S.best}. Thumbs have filed for appeal.`);
    if (S.gold) out.push(`Golden banana sightings reach ${S.gold}. Authorities remain baffled.`);
    S.market.v.forEach((v, b) => { if (v >= 1.4) out.push(`Publishers scramble for ${DESKS[b].lo}-${DESKS[b].hi} letter titles (x${v.toFixed(2)}).`); else if (v <= .8) out.push(`Bookshops overstocked with ${DESKS[b].lo}-${DESKS[b].hi} letter titles; prices sag.`); });
    if (totalReleased() > 0) out.push(`IMI Studios has released ${fmt(totalReleased())} manuscripts. Nobody has read them all, including the authors.`);
    if (S.muses.seated.some(Boolean)) out.push('The Muse Salon reports record attendance. Snacks are running low.');
    if (S.garden.beds.some(Boolean)) out.push('Coconut R&D confirms letters grow better when you talk to them. Kindly.');
    if (S.printing > 0) out.push(`Printing ${S.printing + 1} is under way. The first editions have been moved to the good shelf.`);
    if (S.challenge) out.push(`The ${chDef(S.challenge.id).name} constraint has the monkeys writing with one hand tied behind their back. They have four.`);
    if (S.desks[1].owned) out.push('Hibiscus Ribbon installed. Pink is now a typing speed.');
    if (S.desks[2].owned) out.push('Lagoon Sprint reportedly “very sprinty”.');
    if (S.desks[3].owned) out.push('Honeycomb Ledger arrives. Bees demand royalties.');
    if (S.desks[4].owned) out.push('Orchid Imperial installed. It types words so long the paper needs a sequel.');
    if (S.desks[5].owned) out.push('Moonflower Grand arrives. Nobody dares to type a short word on it.');
    if (awardCount() >= 5) out.push(`The trophy shelf holds ${awardCount()} awards and has begun to wobble.`);
    if (authoredSold() >= BOOKS) out.push('THE COMPLETE WORKS are complete. Monkeys request a longer shelf.');
    { const f = focusRecipe(); if (f) out.push(`Typists heard whispering words from “${f.title}”.`); }
    return out;
  }
  function nextHeadline() {
    const pool = headlinePool().filter(h => !ticker.recent.includes(h)), h = pool[Math.floor(rand() * pool.length)] || NEWS[0];
    ticker.recent.push(h); if (ticker.recent.length > 8) ticker.recent.shift(); return h;
  }
  function startNews(text) {
    const el = $('#oTkrText'); if (!el) return;
    clearTimeout(ticker.timer); if (ticker.anim) { ticker.anim.onfinish = null; ticker.anim.cancel(); ticker.anim = null; }
    el.textContent = text || ticker.q.shift() || nextHeadline();
    $('#oTicker').classList.toggle('hot', /^(EXTRA|AWARD|GOLDEN|SECOND|A SHINY|A banana crate)/i.test(el.textContent));   // breaking news gets a red tag
    if (IMI.reduceMotion) { el.style.transform = 'none'; ticker.timer = setTimeout(() => startNews(), 9000); return; }
    const vw = el.parentElement.clientWidth || 600, tw = el.scrollWidth, speed = vw < 500 ? 55 : 80;
    ticker.anim = el.animate([{ transform: `translateX(${vw}px)` }, { transform: `translateX(${-tw}px)` }], { duration: (vw + tw) / speed * 1000, easing: 'linear' });
    ticker.anim.onfinish = () => startNews();
  }
  function newsPush(text) { ticker.q.push(text); if (ticker.q.length > 3) ticker.q.shift(); startNews(); }
  IMI.news = newsPush;

  /* ================= offline progress =================
     While the page is closed or hidden the typists nap at reduced effort, keepers keep banking, and royalties keep trickling in.
     The Night Lamp raises how long and how hard they work. */
  const LAMP = [{ cost: 5000, cap: 4, eff: .5 }, { cost: 60000, cap: 8, eff: .6 }, { cost: 750000, cap: 16, eff: .7 }];
  const awayCap = () => (S.lamp ? LAMP[S.lamp - 1].cap : 2) * 3600;
  const awayEff = () => (S.lamp ? LAMP[S.lamp - 1].eff : .4) + (museOn('woolf') ? .15 : 0);
  const dur = sec => { const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60); return h ? `${h}h ${m}m` : `${Math.max(1, m)}m`; };
  /* Offline work is simulated in bulk, not letter by letter: sample the letter mix once per step, add whole batches, bank words in bulk. */
  function offlineDist(d, i) {
    const up = d.up, k = d.keeper, mix = []; let r = 1;
    const fr = focusRecipe(d) ? focusNeeds(d, i).missing : null;
    if (fr && Object.keys(fr).length) { const p = [.65, .75, .85, .95][up.practice] * r; mix.push([fr, p]); r -= p; }
    if (k.owned && up.stock) { const m = completers(d, i, w => target(d, w) > 0 && stock(w) < target(d, w)); if (Object.keys(m).length) { const p = [0, .2, .4, .6][up.stock] * r; mix.push([m, p]); r -= p; } }
    if (up.ink) { const m = completers(d, i, w => !stock(w)); if (Object.keys(m).length) { const p = [0, .25, .45, .65][up.ink] * r; mix.push([m, p]); r -= p; } }
    const q = chal('vowel') ? 0 : Math.max([0, .45, .65, .8][up.vowel], museOn('dick') ? .3 : 0), base = {}, F = freqNow();
    for (const ch in F) base[ch] = F[ch] * (VOWELS.includes(ch) ? 1 + 1.5 * q : 1);
    mix.push([base, r]);
    const out = {};
    for (const [m, p] of mix) { let t = 0; for (const ch in m) t += m[ch]; for (const ch in m) out[ch] = (out[ch] || 0) + p * m[ch] / t; }
    return out;
  }
  function keeperBulk(d, i, lim) {
    let banked = 0; const words = BAND_WORDS[i], r = focusRecipe(d);
    const bankN = (w, c) => {
      const cn = lcount(w);
      for (const ch in cn) { d.letters[ch] -= cn[ch] * c; if (d.letters[ch] <= 0) delete d.letters[ch]; }
      S.bank[w] = stock(w) + c; S.stats.words += c; banked += c;
    };
    if (r) for (const w of words) {
      if (!r.need[w]) continue;
      const c = Math.min(makeCopies(d, w), r.need[w] - stock(w), lim - banked); if (c > 0) bankN(w, c);
      if (banked >= lim) return banked;
    }
    const reserved = r ? focusNeeds(d, i).oneCopy : {};
    for (let pass = 0; pass < 12 && banked < lim; pass++) {
      let any = false;
      for (const w of words) {
        if (banked >= lim) break;
        const t = target(d, w); if (t <= 0 || stock(w) >= t || !canMake(d, w)) continue;
        const c = lcount(w); let safe = true;
        for (const ch in c) { const have = d.letters[ch] || 0; if (have - c[ch] < Math.min(have, reserved[ch] || 0)) { safe = false; break; } }
        if (!safe) continue;
        bankN(w, 1); any = true;
      }
      if (!any) break;
    }
    return banked;
  }
  function simulateAway(awaySec) {
    S.desks.forEach(ensureCrew);
    const cap = awayCap(), eff = awayEff(), sec = Math.min(awaySec, cap);
    const rep = { away: awaySec, counted: sec, capped: awaySec > cap, letters: 0, words: 0, roy: 0, ready: 0 };
    const steps = Math.max(1, Math.min(300, Math.ceil(sec / 20))), dt = sec / steps, words0 = S.stats.words;
    for (let st = 0; st < steps; st++) {
      S.desks.forEach((d, i) => {
        if (!d.owned || !d.paws) return;
        const speedSum = d.crew.reduce((a, t) => a + (1 + .04 * (levelOf(t.xp) - 1)) * (t.trait === 'speedy' ? 1.25 : 1), 0) * deskMk(d) || d.paws;
        const n = Math.round(speedSum / (PAW_BASE[i] * Math.pow(.85, d.up.fing) * (S.metro ? .5 : 1)) * dt * eff);
        if (n > 0) {
          const dist = offlineDist(d, i);
          for (const ch in dist) {
            const exp = n * dist[ch], c = Math.floor(exp) + (rand() < exp % 1 ? 1 : 0);
            if (c > 0) { d.letters[ch] = (d.letters[ch] || 0) + c; S.stats.byLetter[ch] = (S.stats.byLetter[ch] || 0) + c; }
          }
          S.stats.letters += n; rep.letters += n;
          if (d.crew.length) { const each = n / d.crew.length; for (let q = 0; q < d.crew.length; q++) grantXp(d, q, each, true); }
        }
        if (d.keeper.owned && d.keeper.on) keeperBulk(d, i, Math.max(2, Math.ceil(dt * eff * (museOn('hemi') ? 2 : 1) / KEEPER_PERIOD[i])));
      });
    }
    S.desks.forEach((d, i) => {                                   // rebuild the tray from what is left in the drawers
      const bag = []; for (const ch in d.letters) for (let q = 0; q < Math.min(d.letters[ch], 8); q++) bag.push(ch);
      for (let q = bag.length - 1; q > 0; q--) { const j = Math.floor(rand() * (q + 1)); [bag[q], bag[j]] = [bag[j], bag[q]]; }
      d.tray = bag.slice(-80); rt[i].sheet = d.tray.join('').slice(-120);
    });
    for (let q = 0, m = Math.min(200, Math.floor(sec / 6)); q < m; q++) marketStep(true);
    rep.words = S.stats.words - words0;
    rep.roy = Math.floor(royBase() * sec * eff);
    if (rep.roy > 0) { S.royTotal += rep.roy; bananas.add(rep.roy); }
    rep.div = Math.floor(divBase() * sec * eff); if (rep.div > 0) { S.divTotal += rep.div; bananas.add(rep.div); }
    S.stats.awayMax = Math.max(S.stats.awayMax || 0, awaySec);
    rep.ready = readyList().length;
    return rep;
  }
  function showWelcome(rep) {
    document.querySelectorAll('.o-modal').forEach(m => m.remove());
    const el = document.createElement('div'); el.className = 'o-modal'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-labelledby', 'oWbT');
    const row = (k, v) => `<div class="o-row"><span>${k}</span><b>${v}</b></div>`, next = LAMP[S.lamp];
    ['wb-let', 'wb-wds', 'wb-roy', 'wb-div'].forEach(k => { shownN[k] = 0; delete cntAnim[k]; });   // the report counts up as it opens
    el.innerHTML = `<div class="o-modal-card"><h3 id="oWbT">Welcome back!</h3>
      <p>You were away <b>${dur(rep.away)}</b>.${rep.capped ? ` The typists only worked ${dur(rep.counted)}, the most they will do unsupervised.` : ' The typists pretended to work the whole time.'}</p>
      <div class="o-modal-rows">${row('Letters typed', cnt('wb-let', rep.letters))}${row('Words banked by keepers', cnt('wb-wds', rep.words))}${row('Royalties', `${ico('banana', 22)} ${cnt('wb-roy', rep.roy, true)}`)}${rep.div ? row('Division income', `${ico('banana', 22)} ${cnt('wb-div', rep.div, true)}`) : ''}${rep.ready ? row('Titles ready to write', rep.ready) : ''}</div>
      ${rep.capped && next ? '<p class="o-dim">A Night Lamp from Banana Logistics keeps them working longer.</p>' : ''}
      <button type="button" class="o-btn gold" data-close>Collect</button></div>`;
    document.body.appendChild(el); hydrate(el);
    const close = () => { const b = el.querySelector('[data-close]').getBoundingClientRect(); el.remove(); IMI.sfx.ding(); if (rep.roy || rep.div) IMI.burst(b.left + b.width / 2, b.top, ['banana', 'spark', 'star'], 14); checkAwards(); mark(); };
    el.querySelector('[data-close]').addEventListener('click', close);
    el.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    el.querySelector('[data-close]').focus();
  }
  /* ================= the daily banana crate: come back each day, the streak grows the prize ================= */
  const DAILY_MULT = [1, 1.25, 1.5, 1.75, 2, 2.5, 3];
  const dayKey = t => new Date(t).toDateString();
  function dailyState() {
    const d = S.daily || {}, today = dayKey(Date.now());
    if (d.last === today) return null;
    return { streak: d.last === dayKey(Date.now() - 864e5) ? (d.streak || 0) + 1 : 1, today };
  }
  const dailyPrize = streak => Math.round(Math.max(250, (royRate() + divRate()) * 600, bananas.get() * .02) * DAILY_MULT[Math.min(streak, 7) - 1]);
  function dailyCrate() {
    if (window.__OPS_HEADLESS || !S.stats.letters) return;
    const ds = dailyState(); if (!ds) return;
    if (document.querySelector('.o-modal, .o-celebrate')) return void setTimeout(dailyCrate, 900);   // wait for the welcome-back report
    const prize = dailyPrize(ds.streak), day = Math.min(ds.streak, 7), big = day === 7;
    const el = document.createElement('div'); el.className = 'o-modal o-daily'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-labelledby', 'oDyT');
    el.innerHTML = `<div class="o-modal-card"><h3 id="oDyT">Daily banana crate</h3>
      <p>${ds.streak > 1 ? `Day <b>${ds.streak}</b> in a row. The crates get bigger every day for a week.` : 'A crate turned up on the loading dock. Come back tomorrow for a bigger one.'}</p>
      <div class="o-days">${DAILY_MULT.map((m, k) => `<span class="o-day${k + 1 < day ? ' done' : k + 1 === day ? ' now' : ''}"><small>DAY ${k + 1}</small><b>x${m}</b></span>`).join('')}</div>
      <button type="button" class="o-chest${big ? ' big' : ''}" data-open aria-label="Open the crate"><i class="o-chest-rays"></i><i class="o-chest-base"></i><i class="o-chest-lid"></i><i class="o-chest-lock"></i></button>
      <p class="o-chest-prize" aria-live="polite"></p>
      <button type="button" class="o-btn gold" data-open>Open the crate</button></div>`;
    document.body.appendChild(el);
    let opened = false;
    const btn = el.querySelector('.o-btn'), chest = el.querySelector('.o-chest');
    const open = () => {
      if (opened) return; opened = true;
      S.daily = { last: ds.today, streak: ds.streak }; save();                                   // claim first, so a refresh can't re-open it
      chest.classList.add('shake'); IMI.sfx.shake(); btn.disabled = true;
      setTimeout(() => {
        chest.classList.remove('shake'); chest.classList.add('open'); IMI.sfx.chest && IMI.sfx.chest(); IMI.sfx.fanfare(); vib([20, 30, 60]);
        for (let k = 0; k < 9; k++) {
          const b = document.createElement('i'); b.className = 'o-chest-pop'; b.style.cssText = `--dx:${(rand() - .5) * 260}px;--dy:${-90 - rand() * 120}px;--dl:${k * 40}ms`;
          if (PX) b.appendChild(PXA.el('banana', 1)); else b.textContent = '🍌';
          chest.appendChild(b);
        }
        shownN['daily'] = 0;
        el.querySelector('.o-chest-prize').innerHTML = `+${cnt('daily', prize, true)} bananas${big ? '<br><small>and a 30 second typing party</small>' : ''}`;
        btn.textContent = 'Collect'; btn.disabled = false; btn.focus();
      }, IMI.reduceMotion ? 0 : 700);
    };
    const collect = () => {
      const at = IMI.centerOf(btn); el.remove();
      bananas.earn(prize, at); IMI.burst(at[0], at[1], ['banana', 'spark', 'star'], 16);
      if (big) { const now = performance.now(); buffs.frenzy = now + 30000; buffs.golden = now + 30000; cheer(2400, 'PARTY!'); }
      logIt(`Opened the day ${ds.streak} banana crate: ${fmtBig(prize)} bananas.`); newsPush(`A banana crate arrives on day ${ds.streak} of the streak. Loyalty is rewarded, mostly with fruit.`);
      mark(); save(); IMI.emit('daily', { streak: ds.streak });
    };
    chest.addEventListener('click', open);
    btn.addEventListener('click', () => (opened ? (btn.textContent === 'Collect' && collect()) : open()));
    el.addEventListener('keydown', e => { if (e.key === 'Escape' && opened && btn.textContent === 'Collect') collect(); });
    btn.focus();
  }
  let dailyQ = false;
  const dailyLater = () => { if (dailyQ) return; dailyQ = true; IMI.whenPlaying(() => { dailyQ = false; dailyCrate(); }); };
  function welcomeBack(minSec) {
    const away = (Date.now() - (S.lastSeen || Date.now())) / 1000;
    if (away < minSec) return;
    const rep = simulateAway(away); S.lastSeen = Date.now(); save();
    logIt(`Back after ${dur(away)}: typists typed ${fmt(rep.letters)} letters, keepers banked ${fmt(rep.words)} words, royalties paid ${fmtBig(rep.roy)} and divisions ${fmtBig(rep.div || 0)} bananas.`);
    newsPush('Welcome back. The typists pretended to work the whole time.');
    if (rep.letters || rep.roy || rep.words) IMI.whenPlaying(() => showWelcome(rep));
    mark();
  }

  /* ================= golden & rotten bananas =================
     A banana drifts across the page now and then. Golden ones are worth catching; rotten ones are best left alone. */
  const GOLD_FX = [['lucky', 35], ['rush', 25], ['shower', 20], ['muse', 12], ['party', 8]];
  const ROT_FX = [['sluggish', 60], ['critic', 40]];
  const roulette = list => { let r = rand() * list.reduce((a, [, w]) => a + w, 0); for (const [id, w] of list) { r -= w; if (r <= 0) return id; } return list[0][0]; };
  function museGift(n) {
    const top = S.desks.reduce((m, d, i) => (d.owned ? i : m), 0);
    const focused = focusRecipe() ? [focusRecipe()] : [];
    const pool = focused.length ? focused : RECIPES.filter(r => !S.written[r.id] && inPlay(r) && r.band <= top);
    const needs = [];
    for (const r of pool) for (const w in r.need) for (let k = stock(w); k < r.need[w]; k++) needs.push(w);
    const got = [];
    for (let k = 0; k < n && needs.length; k++) { const w = needs.splice(Math.floor(rand() * needs.length), 1)[0]; S.bank[w] = stock(w) + 1; got.push(w); }
    return got;
  }
  function goldEffect(fx, x, y) {
    const now = performance.now(), d = cur(); let msg = '', good = true;
    if (fx === 'lucky') { const gain = Math.round(Math.max(100, Math.min(bananas.get() * .12, royBase() * 900)) * (chPerk('timed') ? 1.25 : 1)); bananas.earn(gain, [x, y]); msg = `LUCKY! +${fmt(gain)} bananas`; }
    else if (fx === 'rush') { buffs.rush = now + 15000; msg = 'ROYALTY RUSH! x7 for 15s'; }
    else if (fx === 'shower') { for (let k = 0; k < 25; k++) addLetter(d, roll(d, S.sel, true)); msg = 'LETTER SHOWER! +25 letters'; }
    else if (fx === 'muse') { const got = museGift(3); msg = got.length ? `THE MUSE! +${got.join(' ')}` : 'THE MUSE smiles at you'; }
    else if (fx === 'party') { buffs.golden = now + 15000; buffs.frenzy = now + 15000; msg = 'TYPING PARTY! Frenzy + Golden Keys'; cheer(2400, 'PARTY!'); }
    else if (fx === 'sluggish') { buffs.sluggish = now + 20000; msg = 'SPOILED! The typists are queasy'; good = false; }
    else if (fx === 'critic') { buffs.critic = now + 20000; msg = 'BAD REVIEW! Royalties halved for 20s'; good = false; }
    floatText(msg, x, y - 20, good ? '#ffd23a' : '#ff8a70', true);
    logIt(good ? `Caught a golden banana: ${msg.toLowerCase()}.` : `Touched a rotten banana: ${msg.toLowerCase()}.`);
    shock(x, y, good ? '#ffd23a' : '#9bd16a', good);
    if (good) { S.gold++; IMI.emit('gold', { n: S.gold }); flash('#ffe98a'); IMI.sfx.ding(); IMI.burst(x, y, ['banana', 'spark', 'star'], 16); vib([15, 30, 15]); cheer(1200, 'OOH!'); }
    else { S.stats.rotten++; IMI.sfx.shake(); IMI.burst(x, y, ['drop', 'leaf'], 10); vib(60); }
    newsPush(good ? 'GOLDEN BANANA caught. Witnesses say it was “extremely shiny”.' : 'Rotten banana touched. Witnesses recoil; one files a complaint.');
    mark(); save();
  }
  function spawnGold(rotten) {
    if (document.querySelector('.o-gold')) return;
    if (rotten === undefined) rotten = rand() < .22 && soldCount() > 0;
    const el = document.createElement('button'); el.type = 'button'; el.className = 'o-gold' + (rotten ? ' rotten' : '');
    el.setAttribute('aria-label', rotten ? 'A rotten banana drifts past. Leave it.' : 'A golden banana drifts past. Catch it!');
    if (PX) { const sp = PXA.el('banana', 1.4); sp.style.pointerEvents = 'none'; el.appendChild(sp); } else el.textContent = '🍌';
    document.body.appendChild(el);
    const W = innerWidth, H = innerHeight, dir = rand() < .5 ? 1 : -1, base = H * (.25 + rand() * .45), dur = (W < 700 ? 12000 : 9500) + rand() * 2500;
    const pts = Array.from({ length: 9 }, (_, k) => { const t = k / 8; return { transform: `translate(${dir > 0 ? -90 + t * (W + 180) : W + 90 - t * (W + 180)}px, ${base + Math.sin(t * 6.3 + rand()) * 70}px)` }; });
    let trail = 0, done = false;
    const end = () => { if (done) return; done = true; clearInterval(trail); el.remove(); };
    if (IMI.reduceMotion) { el.style.cssText += `left:${W * (.2 + rand() * .6)}px;top:${base}px`; setTimeout(end, 9000); }
    else {
      const anim = el.animate(pts, { duration: dur, easing: 'linear' }); anim.onfinish = end;
      trail = setInterval(() => { const r = el.getBoundingClientRect(); IMI.fall(r.left + r.width / 2, r.top + r.height / 2, rotten ? 'drop' : 'spark', 700); }, 220);
      el.addEventListener('pointerenter', () => { try { anim.playbackRate = .4; } catch { /* ignore */ } });
      el.addEventListener('pointerleave', () => { try { anim.playbackRate = 1; } catch { /* ignore */ } });
    }
    el.addEventListener('click', e => {
      e.stopPropagation(); const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
      end(); goldEffect(roulette(rotten ? ROT_FX : GOLD_FX), x, y);
    });
    IMI.sfx.tick(); if (!rotten) IMI.emit('goldspawn');
    if (!rotten && ui.tab === 'floor' && typists.length) { const t = typists[Math.floor(rand() * typists.length)]; say(t, 'GOLD!'); t.hop = 12; }
  }
  /* the header toys: core.js owns the buttons and their recharge, these are what they do */
  function perk(id, at) {
    if (id === 'snack') { buffs.snack = performance.now() + 20000; cheer(1600, 'YUM!'); shock(at[0], at[1], '#ffd23a'); mark(); return 'SNACK BREAK! Typists work 50% faster for 20s.'; }
    const d = cur(), n = 8 + Math.min(32, totalPaws());                        // coconut: a pile of letters for the machine you are on
    for (let k = 0; k < n; k++) addLetter(d, roll(d, S.sel, true));
    floatText(`+${n} letters`, at[0], at[1] + 50, '#7be05a', true); shock(at[0], at[1], '#7be05a'); mark();
    return `COCONUT CRACKED! +${n} letters for ${DESKS[S.sel].name}.`;
  }
  /* a cheap read-only view for the tutorial */
  const snap = () => ({ typed: S.stats.letters, letters: totalLetters(cur()), words: S.stats.words, paws: totalPaws(), sold: Object.keys(S.written).length, bananas: bananas.get(), ready: readyList().length, tab: ui.tab, sub: ui.sub, desk: S.sel, owned: S.desks.filter(d => d.owned).length, deskPrice: DESKS[1].price, gold: S.gold, printing: S.printing, stars: starsNow(), hireCost: PAW_COST[0], hot: S.market.v.some((v, b) => S.desks[b] && S.desks[b].owned && marketMult(b) >= 1.4), pitch: !!firstPitch(), museSlots: museSlots() });
  IMI.ops = { snap, spawnGold, royRate, simulateAway, genPitch, newOffers, perk, reset: () => ACTIONS.reset() };
  /* Balance harness hook (tools/balance.html): lets a bot drive the real game logic. Not used by the site itself. */
  Object.defineProperty(IMI.ops, 'dev', { configurable: true, get: () => ({
    S: () => S, holdRate, ui, tick, press, genPitch, newOffers, buyUp, buy, writeTitle, bankWord, keeperStep, canWrite, RECIPES, RBY, DESKS, KEEPER_PERIOD, UPS, upPlan, upLock, DIVS, divPlan, releaseDiv, DEALS, SHOP, LAMP, MUSES, MK_BASE, mkCost,
    GARDEN_COSTS, MILES, focusNeeds, focusRecipe, stock, totalLetters, soldCount, kidsSold, kidsListed, KIDS, royBase, divBase, salePay, marketMult, checkAwards, starsNow, museSlots, registerPitch, pitchActive, PITCH_MAX, buffs, makeCopies,
    plant, harvest, gardenTime, gardenYield, BAND_WORDS, target, ensureCrew, doPrint, awayCap, awayEff, LEG, legLvl, ROY_BASE, RATE, comboHit: () => comboHit(), setSel: i => { S.sel = i; }
   }) });

  /* ================= banking & writing ================= */
  function bankWord(d, w) {
    const c = lcount(w);
    for (const k in c) if ((d.letters[k] || 0) < c[k]) return false;
    for (const k in c) for (let n = 0; n < c[k]; n++) takeLetter(d, k);
    S.stats.words++; S.bank[w] = stock(w) + 1; ui.lastBanked = w; ui.bankedAt = performance.now(); mark(); IMI.emit('bank', { word: w }); return true;
  }
  function keeperStep(d, i) {
    const k = d.keeper; if (!k.owned || !k.on) return;
    const r = focusRecipe(d), words = BAND_WORDS[i];
    if (r) for (const w of words) if (r.need[w] && stock(w) < r.need[w] && canMake(d, w)) { bankWord(d, w); keeperFloat(i, w); return; }
    const reserved = r ? focusNeeds(d, i).oneCopy : {};
    let best = null, bestStock = Infinity;
    for (const w of words) {
      const t = target(d, w), s = stock(w);
      if (t <= 0 || s >= t || s >= bestStock || !canMake(d, w)) continue;
      const c = lcount(w); let safe = true;
      for (const ch in c) { const have = d.letters[ch] || 0; if (have - c[ch] < Math.min(have, reserved[ch] || 0)) { safe = false; break; } }
      if (safe) { best = w; bestStock = s; }
    }
    if (best) { bankWord(d, best); keeperFloat(i, best); }
  }
  function keeperFloat(i, w) {
    if (i !== S.sel || ui.tab !== 'floor') return;
    const t = $('#oTray'); if (!t) return; const b = t.getBoundingClientRect();
    floatText('+' + w, b.left + 20 + rand() * Math.max(10, b.width - 80), b.top); if (typists.length) kick(false);
  }
  const canWrite = r => !S.written[r.id] && inPlay(r) && Object.keys(r.need).every(w => stock(w) >= r.need[w]);
  /* the title's word chips lift off the card and pour into the sell button, like pages into a binding */
  function gatherWords(btn) {
    const card = btn.closest('.o-card'); if (!card || IMI.reduceMotion) return;
    const [tx, ty] = IMI.centerOf(btn), chips = [...card.querySelectorAll('.o-chip')].slice(0, 18);
    chips.forEach((c, k) => {
      const r = c.getBoundingClientRect(), f = c.cloneNode(true); f.classList.add('o-fly');
      f.style.cssText = `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px`; document.body.appendChild(f);
      const dx = tx - r.left - r.width / 2, dy = ty - r.top - r.height / 2;
      f.animate([{ transform: 'none' }, { transform: `translate(${dx * .3}px, ${dy * .3 - 40}px) rotate(${(rand() - .5) * 30}deg) scale(1.1)`, offset: .35 }, { transform: `translate(${dx}px, ${dy}px) scale(.2)`, opacity: .2 }],
        { duration: 520, delay: k * 28, easing: PX ? 'steps(9)' : 'cubic-bezier(.5,0,.7,1)', fill: 'both' }).onfinish = () => { f.remove(); if (k === chips.length - 1) { shock(tx, ty, '#7be05a'); IMI.sfx.key(); } };
    });
  }
  function writeTitle(id, fromEl) {
    const r = RBY[id]; if (!r || !canWrite(r)) return;
    if (fromEl) gatherWords(fromEl);
    for (const w in r.need) { S.bank[w] -= r.need[w]; if (S.bank[w] <= 0) delete S.bank[w]; }
    const mk = marketMult(r.band), pay = salePay(r); S.stats.lump += pay; S.stats.bestMult = Math.max(S.stats.bestMult || 0, mk);
    dropCaches(); S.written[id] = true; if (r.gen) S.stats.pitchSold = (S.stats.pitchSold || 0) + 1;
    if (S.focus === id) S.focus = null;
    pickAutoFocus();
    const at = fromEl ? IMI.centerOf(fromEl) : undefined;
    bananas.earn(pay, at);
    if (at) { IMI.burst(at[0], at[1], ['banana', 'spark', 'leaf'], 14); shock(at[0], at[1], '#ffd23a', true); }
    flash('#fff6d6'); shake(2);
    ui.fresh = id; setTimeout(() => { ui.fresh = null; mark(); }, 2200);
    if (at) { const big = pay >= 50000 ? 3 : pay >= 5000 ? 2 : 1; for (let k = 1; k < big + 1; k++) setTimeout(() => IMI.burst(at[0] + (k % 2 ? -1 : 1) * k * 40, at[1] - k * 20, ['banana', 'banana', 'spark', 'star'], 14), k * 220); }
    vib([20, 40, 70]); cheer(3000, 'SOLD!');
    IMI.sfx.ding();
    logIt(`The Jungle Press bought the rights to “${r.title}”: ${fmtBig(pay)} bananas${mk !== 1 ? ` (market x${mk.toFixed(2)})` : ''}. It will not be reprinted.`);
    newsPush(`EXTRA: The Jungle Press buys “${r.title}” for ${fmtBig(pay)} bananas${mk >= 1.3 ? ', cashing in on a hot market' : mk <= .8 ? ', in a cold market. Ouch' : ''}.`);
    const n = Object.keys(S.written).length;
    if (authoredSold() === BOOKS && !r.gen) celebrate(PX ? 'THE COMPLETE WORKS' : 'The Complete Works', PX ? 'EVERY TITLE SOLD' : 'Every title sold', `<p class="o-cel-sub">${BOOKS} parodies, written by monkeys. The shelf is full.</p>`);
    else if (n === 1) IMI.banner(PX ? 'FIRST PRINTING!' : 'First Printing!');
    else if (n % 4 === 0) IMI.banner(PX ? 'BESTSELLER!' : 'Bestseller!');
    mark(); save();
    IMI.emit('sold', { id, pay });
  }

  /* ================= training upgrades (spend this desk's letters) ================= */
  const TIER = [1, 2.5, 6];
  const UPS = [
    { k: 'paw',      ico: 'monkey', name: 'Hire a typist', base: 25, max: 12, desc: 'Another junior monkey swings in and types letters on its own.' },
    { k: 'fing',     name: 'Quick fingers', base: 40, grow: 1.6, max: 10, desc: "Speeds up this desk's typists by about 18% per level." },
    { k: 'rapid',    name: 'Rapid touch', base: 75, grow: 1.7, max: 8, desc: 'Held typing here gains +2 letters per second per level.', needs: 'hold' },
    { k: 'vowel',    name: 'Vowel rhythm', base: 30, tier: 1, desc: 'After a consonant, a vowel comes up 45%, 65%, then 80% of the time.' },
    { k: 'ink',      name: 'Fresh ink', base: 40, tier: 1, desc: 'Leans 25%, 45%, then 65% toward the letter that finishes a word you have never banked.' },
    { k: 'practice', name: 'Recipe practice', base: 100, tier: 1, desc: 'Typists chase the focused title harder: 75%, 85%, then 95% (base 65%).' },
    { k: 'stock',    name: 'Stock-aware ink', base: 80, tier: 1, desc: 'Leans 20%, 40%, then 60% toward words below the keeper’s targets, duplicates included.' },
    { k: 'ribbon',   name: 'Spare ribbon', base: 150, tier: 1, desc: 'Each typist press has a 10%, 20%, then 30% chance to swap a surplus letter for a missing ingredient.' }
  ];
  const upLevel = (u, d, i) => (u.k === 'paw' ? Math.max(0, d.paws - (i ? 1 : 0)) : d.up[u.k]);
  const upMax = u => (u.k === 'paw' ? u.max : u.tier ? 3 : u.max);
  const upCost = (u, d, i) => { const l = upLevel(u, d, i), bs = u.k === 'paw' ? PAW_COST[i] * (1 + PAW_DESK_STEP * i) : u.base; return Math.round(u.tier ? bs * TIER[l] : bs * Math.pow((u.k === 'paw' ? PAW_GROW : u.grow || 1.7), l)); };
  const upLock = (u, d) => (u.needs === 'hold' && !S.hold ? 'Needs Hold to type (Banana Logistics)' : '');
  /* how many levels a purchase of `want` covers and what it costs (Max stops where your letters run out) */
  function upPlan(u, d, i, want) {
    const max = upMax(u), have = totalLetters(d); let lv = u.k === 'paw' ? d.paws : d.up[u.k], n = 0, cost = 0;
    while (n < want && lv + n < max) {
      const l = u.k === 'paw' ? Math.max(0, lv + n - (i ? 1 : 0)) : lv + n;
      const bs = u.k === 'paw' ? PAW_COST[i] * (1 + PAW_DESK_STEP * i) : u.base, c = Math.round(u.tier ? bs * TIER[l] : bs * Math.pow((u.k === 'paw' ? PAW_GROW : u.grow || 1.7), l));
      if (want === Infinity && n > 0 && cost + c > have) break;
      cost += c; n++;
    }
    return { n, cost };
  }
  const buyWant = () => (ui.buyN === 'max' ? Infinity : +ui.buyN || 1);
  function buyUp(k) {
    const i = S.sel, d = cur(), u = UPS.find(x => x.k === k); if (!u) return;
    if (upLock(u, d)) return;
    const plan = upPlan(u, d, i, buyWant()); if (plan.n <= 0 || totalLetters(d) < plan.cost) return;
    let left = plan.cost;                               // spend from the biggest piles first
    while (left-- > 0) { const top = Object.keys(d.letters).sort((a, b) => d.letters[b] - d.letters[a])[0]; takeLetter(d, top); }
    if (u.k === 'paw') { d.paws += plan.n; ensureCrew(d); } else d.up[u.k] += plan.n;
    IMI.sfx.ding(); mark(); save();
    if (u.k === 'paw') IMI.emit('hire', { n: plan.n, desk: i });
  }

  /* ================= shop (spend bananas) ================= */
  function buy(what, arg) {
    const i = +arg;
    if (what === 'desk') {
      const d = S.desks[i], p = DESKS[i].price;
      if (chal('haiku') && i >= 2) return;
      if (d.owned || !S.desks[i - 1]?.owned || !bananas.spend(p)) return;
      d.owned = true; d.keeper.owned = true; d.paws = 1; ensureCrew(d); pickAutoFocus(); S.sel = i; ui.dropIn = true; cheer(2000, 'NEW!'); newsPush(`${DESKS[i].name} installed. The monkeys argue over who touches it first.`); IMI.banner(PX ? 'NEW TYPEWRITER!' : 'New Typewriter!'); buildStage(); IMI.emit('desk', { i });
      logIt(`${DESKS[i].name} installed on the canopy. It types ${DESKS[i].lo}–${DESKS[i].hi} letter words.`);
    } else if (what === 'plot') {
      const nx = GARDEN_COSTS[S.garden.beds.length - 2]; if (!nx || !bananas.spend(nx)) return;
      S.garden.beds.push(null); logIt('Cleared another plot in the Coconut R&D garden.');
    } else if (what === 'mk') {
      const d = S.desks[i]; if (!d || !d.owned || d.mk >= 2 || !bananas.spend(mkCost(i))) return;
      d.mk++; logIt(`${DESKS[i].name} restored to ${MK_NAMES[d.mk]}. It gleams.`);
    } else if (what === 'lamp') {
      const nx = LAMP[S.lamp]; if (!nx || !bananas.spend(nx.cost)) return;
      S.lamp++; logIt(`Lit a bigger Night Lamp: typists now work up to ${nx.cap}h while you are away.`);
    } else if (what === 'deal') {
      const x = DEALS.find(q => q.id === arg); if (!x || S.deals[x.id] || soldCount() < x.need || !bananas.spend(x.cost)) return;
      S.deals[x.id] = true; logIt(`Signed a publishing deal: ${x.name}.`);
    } else if (SHOP[what] && !S[what]) {
      if (what === 'dbl' && !S.hold) return;
      if ((what === 'agent' || what === 'analyst') && soldCount() < 2) return;
      if ((what === 'metro' || what === 'dbl' || what === 'contracts') && !S.desks[2].owned) return;
      if (!bananas.spend(SHOP[what])) return;
      S[what] = true;
    } else return;
    IMI.sfx.ding(); mark(); save();
  }

  /* ================= icons ================= */
  const ICO_PX = { quill: 'i-quill', reel: 'i-reel', trophy0: 'trophy-0', trophy1: 'trophy-1', trophy2: 'trophy-2', type: 'i-type', monkey: 'i-monkey', coconut: 'i-coconut', palm: 'i-palm', log: 'i-log', banana: 'banana', leaf: 'leaf' };
  const ICO_CL = { quill: '🪶', reel: '🎬', trophy0: '🥉', trophy1: '🥈', trophy2: '🏆', type: '⌨️', monkey: '🐒', coconut: '🥥', palm: '🌴', log: '🪵', banana: '🍌', leaf: '🍃' };
  /* panes re-render several times a second; patching the live DOM instead of replacing it keeps hover states,
     running CSS animations (shines, glints, stripes) and sprites intact. data-own marks a box another renderer fills. */
  const tpl = document.createElement('template');
  function morph(el, html) {
    if (!el) return;
    tpl.innerHTML = html; patchKids(el, tpl.content);
  }
  function patchKids(a, b) {
    const an = [...a.childNodes], bn = [...b.childNodes];
    bn.forEach((y, i) => {
      const x = an[i];
      if (!x) a.appendChild(y);
      else if (x.nodeType !== y.nodeType || x.nodeName !== y.nodeName) a.replaceChild(y, x);
      else if (x.nodeType !== 1) { if (x.nodeValue !== y.nodeValue) x.nodeValue = y.nodeValue; }
      else patchEl(x, y);
    });
    for (let i = an.length - 1; i >= bn.length; i--) an[i].remove();
  }
  function patchEl(x, y) {
    const ic = y.getAttribute('data-ico');
    if (ic && x.dataset.icoDone === ic + ':' + y.getAttribute('data-sz')) return;      // already hydrated into a sprite
    for (const { name } of [...x.attributes]) if (!y.hasAttribute(name)) x.removeAttribute(name);
    for (const { name, value } of [...y.attributes]) if (x.getAttribute(name) !== value) x.setAttribute(name, value);
    if (x.tagName === 'INPUT' && x !== document.activeElement && x.value !== y.value) x.value = y.value;
    if (!y.hasAttribute('data-own')) patchKids(x, y);
  }
  const ico = (n, sz = 0) => `<i class="o-ico" data-ico="${n}" data-sz="${sz}"></i>`;
  const price = n => `<span class="o-price">${ico('banana', 24)}${fmtBig(n)}</span>`;
  function hydrate(scope) {
    $$('[data-ico]', scope).forEach(el => {
      const n = el.dataset.ico, sz = +el.dataset.sz;
      if (PX) {
        const sp = PXA.spr[ICO_PX[n]]; if (!sp) return;
        const w = sz || sp.w * PXA.S, h = Math.round(w * sp.h / sp.w);
        el.classList.add('spr'); el.style.width = w + 'px'; el.style.height = h + 'px';
        el.style.backgroundImage = `url(${sp.url})`; el.style.backgroundSize = '100% 100%';
      } else { el.textContent = ICO_CL[n]; if (sz) el.style.fontSize = sz * .9 + 'px'; }
      el.dataset.icoDone = n + ':' + el.dataset.sz; el.removeAttribute('data-ico');
    });
  }

  /* ================= typewriter stage ================= */
  const ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
  let typists = [], fx = null;                                     // fx: the live stage's elements, looked up once per build instead of on every keystroke
  /* training shows on the machine itself: brass then gold keys, ribbon spools, a carriage bell, tinted vowels, a keeper light */
  const partsOf = d => { const u = d.up; return [u.fing >= 3 && 'p-brass', u.fing >= 7 && 'p-gold', u.ink && 'p-spools', u.ribbon && 'p-ribbon2', u.rapid && 'p-bell', u.vowel && 'p-vowels', d.keeper.owned && 'p-led', d.keeper.owned && d.keeper.on && 'p-ledon'].filter(Boolean).join(' '); };
  function buildStage() {
    const i = S.sel, D = DESKS[i];
    const pane = $('#o-floor');
    pane.innerHTML = `
      <button type="button" class="o-focus" id="oFocus" data-act="go" data-tab="press" title="Your keepers are working on this title. Tap to change it."></button>
      <div class="o-stagewrap">
      <div class="o-stage" id="oStage" data-desk="${D.id}" tabindex="0" role="button" aria-label="${esc(D.name)} typewriter. Tap, click, or press Space to type a letter.">
        <div class="o-scene" aria-hidden="true">
          <div class="o-wall"></div><div class="o-prop"></div>
          <div class="o-window" id="oWin"><i class="o-win-sky"></i><i class="o-win-rain"></i><i class="o-win-bolt"></i></div>
          <div class="o-lamp"><i class="o-lamp-shade"></i><i class="o-lamp-cone"></i></div>
          <div class="o-desktop"></div>
          <div class="o-speed"></div>
          <div class="o-embers" id="oEmbers"></div>
          <div class="o-drips">${Array.from({ length: 6 }, (_, k) => `<i style="left:${8 + k * 16 + rand() * 8}%;--d:${1.1 + rand() * .9}s;--dl:${-rand() * 2}s"></i>`).join('')}</div>
          <div class="o-flies">${Array.from({ length: 7 }, () => `<i style="left:${5 + rand() * 90}%;top:${10 + rand() * 50}%;--d:${5 + rand() * 5}s;--dl:${-rand() * 8}s"></i>`).join('')}</div>
        </div>
        <div class="o-dangle" id="oDangle" aria-hidden="true"></div>
        <div class="o-tw mk${cur().mk || 0} ${partsOf(cur())}" id="oTw">
          <div class="o-sheetwrap"><div class="o-sheet"><span id="oSheet"></span></div></div>
          <div class="o-carriage" id="oCar"><i class="o-bell"></i></div>
          <div class="o-bars" id="oBars"><i class="o-spool l"></i><i class="o-spool r"></i>${Array.from({ length: 9 }, (_, n) => `<i class="o-bar" style="--a:${-48 + n * 12}deg"></i>`).join('')}</div>
          <div class="o-body" data-name="${esc(D.name.toUpperCase() + (cur().mk ? ' ' + MK_NAMES[cur().mk].toUpperCase() : ''))}"><i class="o-led"></i>
            <div class="o-kbd">${ROWS.map(r => `<div class="o-krow">${[...r].map(c => `<b class="o-key" data-k="${c}">${c}</b>`).join('')}</div>`).join('')}
              <div class="o-krow"><b class="o-key o-space" data-k=" "></b></div></div>
          </div>
        </div>
      </div>
      <div class="o-fx">
        <div class="o-combo" id="oCombo" aria-hidden="true"><span id="oComboN"></span><i class="o-meter"><i id="oMeter"></i></i></div>
      </div>
      </div>
      <div class="o-info">
        <div class="o-tray" id="oTray" aria-label="Recent letters"></div>
        <div class="o-stats" id="oStats"></div>
        <div class="o-miles" id="oMiles"></div>
        <p class="o-guide" id="oGuide"></p>
      </div>`;
    fx = { stage: $('#oStage'), tw: $('#oTw'), car: $('#oCar'), sheet: $('#oSheet'), combo: $('#oCombo'), comboN: $('#oComboN'), meter: $('#oMeter'), embers: $('#oEmbers'),
      bars: $$('.o-bar', pane), keys: {}, pops: [], richAt: 0, meterAnim: null };
    $$('.o-key[data-k]', pane).forEach(k => { fx.keys[k.dataset.k] = k; });
    rt[i].col = 0; typists = []; syncTypists(true);
    if (ui.dropIn) { ui.dropIn = false; const st = $('#oStage'); st.classList.add('drop'); st.addEventListener('animationend', () => st.classList.remove('drop'), { once: true }); }
    $('#oSheet').textContent = rt[i].sheet.slice(-48);
    paintWindow();
  }
  /* switching machines: the old typewriter slides off the desk and the next one slides on */
  let swapT = 0;
  function swapStage(dir) {
    const tw = $('#oTw'); clearTimeout(swapT);
    if (!dir || !tw || IMI.reduceMotion) return buildStage();
    tw.style.setProperty('--dir', dir); tw.classList.add('swap-out'); IMI.sfx.tick();
    swapT = setTimeout(() => {
      buildStage(); const n = $('#oTw'), st = $('#oStage'); if (!n) return;
      n.style.setProperty('--dir', dir); n.classList.add('swap-in'); st.classList.add('swapping');
      n.addEventListener('animationend', () => { n.classList.remove('swap-in'); st.classList.remove('swapping'); }, { once: true });
      IMI.sfx.key();
    }, 190);
  }
  /* the little window behind the typewriter shows the page's real weather and time of day */
  function paintWindow() {
    const w = $('#oWin'); if (!w) return;
    w.dataset.wx = typeof Weather !== 'undefined' ? Weather.state : 0;
  }
  function syncTypists(initial) {
    const box = $('#oDangle'); if (!box) return;
    const n = Math.min(cur().paws, 8), had = typists.length;
    if (had === n) return;
    typists = []; box.innerHTML = '';
    for (let k = 0; k < n; k++) {
      const el = document.createElement('div'); el.className = 'o-typist' + ((cur().crew[k] || {}).shiny ? ' shiny' : '');
      el.style.left = (100 / (n + 1)) * (k + 1) + '%'; el.style.setProperty('--rope', 16 + (k * 37) % 46 + 'px');
      const nm = esc((cur().crew[k] || {}).name || '');
      el.innerHTML = (PX ? '<i class="o-rope"></i><canvas></canvas>' : '<i class="o-rope"></i><span class="o-mk">🐒</span><span class="o-hat">🍃</span>') + `<span class="o-nm">${nm}</span>`;
      if (!initial && n > had && k >= had) el.classList.add('drop');
      box.appendChild(el);
      typists.push({ ci: k, el, cv: el.querySelector('canvas'), a: 0, v: (k % 2 ? 1 : -1) * .05, seed: k * 1.7, ph: k % 2, expr: 'normal', until: 0, frame: null });
    }
    if (IMI.reduceMotion) stepTypists(performance.now());
  }
  function kick(strong, ci) {
    if (!typists.length) return;
    const t = (ci != null && typists.find(x => x.ci === ci)) || typists[Math.floor(rand() * typists.length)];
    t.v += (rand() < .5 ? -1 : 1) * (strong ? .13 : .06); t.ph ^= 1; t.expr = 'screech'; t.until = performance.now() + 170;
    if (!IMI.reduceMotion) { const nm = t.nm || (t.nm = t.el.querySelector('.o-nm')); if (nm && performance.now() > (t.nmAt || 0)) { t.nmAt = performance.now() + 230; nm.animate([{ transform: 'none' }, { transform: 'translateY(-6px) scale(1.18)', color: '#ffd23a' }, { transform: 'none' }], { duration: 220, easing: PX ? 'steps(3)' : 'ease-out' }); } }
    if (!strong && rand() < .012) say(t);
  }
  function stepTypists(now) {
    const hat = typeof Mood !== 'undefined' && Mood.hat, scared = typeof Mood !== 'undefined' && Mood.scared, crew = cur().crew, wild = buffOn('frenzy');
    for (const t of typists) {
      if (wild && !IMI.reduceMotion) { t.v += Math.sin(now / 130 + t.seed * 3) * .016; if (rand() < .03) { t.hop = 10 + rand() * 8; t.ph ^= 1; t.expr = 'screech'; t.until = now + 160; } }
      const worn = (crew[t.ci] || {}).hat || 0, hc = worn || (hat ? 1 : 0);
      if (!IMI.reduceMotion) {
        t.v += -t.a * .045 + Math.sin(now / 900 + t.seed) * .0011 + (scared ? Math.sin(now / 60) * .004 : 0); t.v *= .955; t.a = Math.max(-.7, Math.min(.7, t.a + t.v));
      }
      t.hop = (t.hop || 0) * .84;
      if ((crew[t.ci] || {}).shiny && now > (t.sparkAt || 0) && !IMI.reduceMotion) { t.sparkAt = now + 380 + rand() * 300; const b = t.cv ? t.cv.getBoundingClientRect() : t.el.getBoundingClientRect(); IMI.fall(b.left + b.width * (.2 + rand() * .6), b.top + b.height * (.3 + rand() * .5), 'spark', 900); }
      t.el.classList.toggle('wild', wild); const hp = t.hop.toFixed(1); if (hp !== t.hopS) { t.hopS = hp; t.el.style.setProperty('--hop', hp); }
      if (now > (t.blinkAt || 0)) { t.blinkAt = now + 2200 + rand() * 4200; t.blinkUntil = now + 150; }
      const ex = now < t.until ? 'screech' : scared ? 'scared' : now < t.blinkUntil ? 'blink' : 'normal';
      if (PX) {
        const f = PXA.monkeyFrame('desk', ex, t.a, false, t.ph, hc);
        if (f !== t.frame) { PXA.blit(t.cv, f); t.cv.style.marginLeft = -(f.W * PXA.S / 2) + 'px'; t.frame = f; }
      } else {
        const ag = Math.round(t.a * 250) / 250; if (ag !== t.angS) { t.angS = ag; t.el.style.setProperty('--ang', ag + 'rad'); }     // 0.004 rad steps: invisible, but the sway no longer dirties a typist every frame
        if (t.hk !== hc) { t.hk = hc; const he = t.el.querySelector('.o-hat'); if (he) he.textContent = worn ? (hatById(worn) || {}).emoji : '🍃'; }
        t.el.classList.toggle('rainy', !!hc); t.el.classList.toggle('scared', !!scared); t.el.classList.toggle('shout', ex === 'screech');
      }
    }
  }
  const CHATTER = ['OOK!', 'EEK!', 'TAP TAP', 'BANANA?', 'HOO HOO', 'NICE WORD'];
  function say(t, text) {
    if (t.el.querySelector('.o-say')) return;
    const b = document.createElement('i'); b.className = 'o-say'; b.textContent = text || CHATTER[Math.floor(rand() * CHATTER.length)];
    b.addEventListener('animationend', () => b.remove()); t.el.appendChild(b);
  }
  /* group reactions: the whole crew jumps, shouts and throws bananas */
  const cheerState = { until: 0, next: 0, said: true, text: '', throwAt: 0 };
  function cheer(ms, text) { const now = performance.now(); cheerState.until = Math.max(cheerState.until, now + ms); cheerState.text = text || ''; cheerState.said = !text; }
  function cheerStep(now) {
    if (now >= cheerState.until || !typists.length) return;
    if (now >= cheerState.next) {
      cheerState.next = now + 160;
      typists.forEach((t, i) => { t.v += (i % 2 ? 1 : -1) * .09; t.hop = 13; t.expr = 'screech'; t.until = now + 220; t.ph ^= 1; });
    }
    if (!cheerState.said) { cheerState.said = true; typists.slice(0, 3).forEach(t => say(t, cheerState.text)); }
    if (now >= cheerState.throwAt) {
      cheerState.throwAt = now + 520;
      const t = typists[Math.floor(rand() * typists.length)], b = t.el.getBoundingClientRect(); IMI.burst(b.left + b.width / 2, b.bottom - 30, ['banana', 'spark'], 3);
    }
  }
  function loop(now) {
    if (ui.tab === 'floor' && typists.length && !IMI.reduceMotion) { cheerStep(now); stepTypists(now); }
    countStep(now);
    requestAnimationFrame(loop);
  }
  function animatePress(ch, auto, n, p) {
    if (ui.tab !== 'floor' || !fx || !fx.stage.isConnected) return;
    const now = performance.now(), r = rt[S.sel];
    r.col++; r.page = (r.page || 0) + 1;
    if (r.page >= 48 && now - (ui.tearAt || 0) > 1400) { r.page = 0; ui.tearAt = now; tearPage(r); }
    /* a big crew can press dozens of times a second: tapping always gets the full show, auto-typing is drawn at most ~14 times a second */
    if (auto) { if (now - fx.richAt < 70) { kick(false, p); return; } fx.richAt = now; }
    IMI.sfx.key(1 + S.sel * .14);                                   // each machine has its own clack, higher up the range
    const key = fx.keys[ch];
    if (key) { key.classList.add('down'); setTimeout(() => key.classList.remove('down'), 90); }
    const bar = fx.bars[ch.charCodeAt(0) % fx.bars.length];
    bar.classList.add('hit'); setTimeout(() => bar.classList.remove('hit'), 70);
    const car = fx.car;
    car.style.transform = `translateX(${-(r.col % 9) * 2}px)`;
    if (r.col % 9 === 0) { car.classList.remove('ding'); void car.offsetWidth; car.classList.add('ding'); }
    kick(!auto, auto ? p : undefined);
    if (auto && n % 6 === 0 && typists.length) { const t = typists[Math.floor(rand() * typists.length)], b = t.el.getBoundingClientRect(); IMI.fall(b.left + b.width / 2, b.bottom - 10, 'leaf', 1200); }
    fx.sheet.textContent = r.sheet.slice(-48);
    const tw = fx.tw;
    if (!IMI.reduceMotion) {
      if (!auto) tw.animate([{ translate: '0 0' }, { translate: '0 3px', offset: .35 }, { translate: '0 0' }], { duration: 140, easing: PX ? 'steps(2)' : 'ease-out' });   // the strike thumps the machine
      const k = auto ? (rand() < .35 ? 1 : 0) : 2 + (rand() < .5 ? 1 : 0);
      for (let j = 0; j < k; j++) {                                  // ink flecks spit from the platen
        const f = document.createElement('i'); f.className = 'o-fleck';
        f.style.cssText = `--fx:${(rand() - .5) * 70}px;--fy:${-10 - rand() * 34}px;--fc:${rand() < .7 ? '#1a0f14' : POP_COLORS[Math.floor(rand() * POP_COLORS.length)]}`;
        f.addEventListener('animationend', () => f.remove()); tw.appendChild(f);
      }
    }
    const el = document.createElement('i'); el.className = 'o-pop'; el.textContent = ch;
    const slot = popSlot++ % 9;
    el.style.cssText = `left:${12 + slot * 9.5}%;top:${30 + (slot % 3) * 9}%;--pc:${POP_COLORS[popSlot % POP_COLORS.length]}`;
    el.addEventListener('animationend', () => { el.remove(); const k = fx.pops.indexOf(el); if (k >= 0) fx.pops.splice(k, 1); });
    fx.stage.appendChild(el); fx.pops.push(el);
    if (fx.pops.length > 14) fx.pops.shift().remove();
  }
  /* a full sheet rips off the platen and flutters away; a fresh one rolls in */
  function tearPage(r) {
    const sheet = $('.o-sheet'); if (!sheet) return;
    if (!IMI.reduceMotion) {
      const b = sheet.getBoundingClientRect(), pg = document.createElement('div'); pg.className = 'o-page'; pg.textContent = r.sheet.slice(-48);
      pg.style.cssText = `left:${b.left}px;top:${b.top}px;width:${b.width}px;height:${b.height}px;--tx:${(rand() < .5 ? -1 : 1) * (160 + rand() * 160)}px;--pr:${(rand() - .5) * 70}deg`;
      pg.addEventListener('animationend', () => pg.remove()); document.body.appendChild(pg);
      sheet.classList.remove('fresh'); void sheet.offsetWidth; sheet.classList.add('fresh');
    }
    IMI.sfx.rip && IMI.sfx.rip(); r.sheet = r.sheet.slice(-1);
    const sp = $('#oSheet'); if (sp) sp.textContent = '';
  }
  function royPing() {
    if (!['floor', 'press'].includes(ui.tab) || document.hidden || IMI.reduceMotion) return;
    const sp = $$('.o-spine'); if (!sp.length) return;
    const el = sp[Math.floor(rand() * sp.length)], r = el.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
    const book = RBY[el.dataset.id]; if (!book) return;
    floatText('+' + fmtRate(bookRoy(book) * 2.4), r.left + r.width / 2, r.top - 6, '#ffd23a');
  }

  /* ---- the bookshelf: one spine per title you have sold, ghost slots for the rest ---- */
  const hashOf = str => { let h = 0; for (const c of str) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
  const SHELF_MAX = 120;
  function shelfHTML() {
    const all = [...new Set([...Object.keys(S.editions || {}), ...Object.keys(S.written)])].filter(id => RBY[id]);
    const ids = all.length > SHELF_MAX ? [...all.filter(id => !RBY[id].kid), ...all.filter(id => RBY[id].kid)].slice(0, SHELF_MAX) : all;   // authored spines first; the kids' shelf is capped
    const more = all.length - ids.length;
    const books = ids.map(id => {
      const r = RBY[id], h = hashOf(id), w = Math.round(24 + Math.min(r.total, 40) * .5);
      const ht = 78 + r.band * 12 + h % 14, hue = [150, 345, 215, 40, 275, 210][r.band] + (h % 30) - 15;
      const drop = ui.fresh === id && !ui.dropped[id]; if (drop) ui.dropped[id] = true;
      return `<button type="button" class="o-spine b${r.band}${drop ? ' drop' : ''}${ui.pulled === id ? ' pulled' : ''}${S.written[id] ? '' : ' old'}" data-act="pull" data-id="${id}" style="--bw:${w}px;--bh:${ht}px;--hue:${hue};--tilt:${(h % 5) - 2}deg;--sd:${(h % 50) / 10}s" title="${esc(r.title)}" aria-label="${esc(r.title)}"><span>${esc(r.title)}</span></button>`;
    }).join('');
    const ghosts = Array.from({ length: Math.min(24, Math.max(0, BOOKS - ids.filter(id => !RBY[id].gen && !RBY[id].kid).length)) }, () => '<i class="o-slot"></i>').join('') + (more ? `<span class="o-chip">+${more} more</span>` : '');
    const plate = ui.pulled && (S.written[ui.pulled] || (S.editions || {})[ui.pulled]) ? (() => { const r = RBY[ui.pulled]; return `<div class="o-plate"><div class="o-row"><h3>${esc(r.title)}</h3><span class="o-tag b${r.band}">${DESKS[r.band].lo}–${DESKS[r.band].hi}</span></div><p class="o-dim">${r.total} words · rights sold for ${price(r.pay)} · ${S.written[ui.pulled] ? `pays <b>${fmtRate(bookRoy(r))}/s</b> in royalties` : '<b>out of print</b>: sell it again in this printing'}${(S.editions || {})[ui.pulled] ? ` · ${(S.editions || {})[ui.pulled]} earlier edition${(S.editions || {})[ui.pulled] > 1 ? 's' : ''}` : ''}</p><div class="o-read">${esc(r.text)}</div></div>`; })() : '';
    return `<div class="o-shelfrow">${books}${ghosts}</div>${plate}`;
  }
  function renderFloorInfo() {
    const d = cur(), D = DESKS[S.sel]; if (!$('#oTray')) return;
    const fresh = Math.min(3, Math.max(0, rt[S.sel].n - ui.trayN)); ui.trayN = rt[S.sel].n;
    const shown = d.tray.slice(-12);
    $('#oTray').innerHTML = shown.map((c, k) => `<span class="o-tile${k >= shown.length - fresh ? ' new' : ''}">${c}</span>`).join('') || '<span class="o-dim">Tap to type!</span>';
    const fr = focusRecipe(d), ft = $('#oFocus');
    const want = fr ? focusNeeds(d, S.sel).missing : {};               // keys glow for letters the focused title still needs
    $$('.o-key[data-k]').forEach(k => k.classList.toggle('want', !!want[k.dataset.k]));
    if (ft) morph(ft, fr ? `<span class="o-fgoal">Goal</span><b class="o-ftitle">${esc(fr.title)}</b>${bar(progress(fr), fr.total)}<span class="o-fn">${progress(fr)}/${fr.total}</span>` : '');
    morph($('#oStats'), `<span class="o-s1"><b>${cnt('f-let' + S.sel, totalLetters(d))}</b> letters</span><span class="o-s2"><b>${d.paws}</b> typists · <b>${autoRate(d).toFixed(2)}</b>/s</span>` +
      (S.hold ? `<span class="o-sx"><b>${holdRate(d)}</b>/s held</span>` : '') + `<span class="o-sx o-dim">${D.lo}–${D.hi} letter words</span>` +
      (stormy() ? '<span class="o-sx o-warn">Storm! Half speed.</span>' : ''));
    const now = performance.now();
    morph($('#oMiles'), `<span class="o-dim">Tap streak goals${S.best ? ` (best x${S.best})` : ''}:</span>` + MILES.map(m => `<span class="o-mile${combo.n >= m.n ? ' hit' : ''}${now < (ui.mcd[m.n] || 0) ? ' cd' : ''}" title="${esc(m.desc)}">x${m.n} ${m.name}</span>`).join(''));
    $('#oGuide').textContent = !d.paws ? 'Nobody is typing yet. Collect a few letters by hand, then hire a first typist at Primate Resources.' : S.hold ? 'Hold a finger, the mouse, or Space on the machine to type fast. Spend letters at Primate Resources or turn them into words at Coconut R&D.'
      : 'Tap or click the typewriter (focus it and press Space too). Spend letters at Primate Resources or make words at Coconut R&D.';
    syncTypists();
  }

  /* ================= panes ================= */
  const pips = (n, max) => `<span class="o-pips">${Array.from({ length: Math.min(max, 12) }, (_, k) => `<i class="${k < n ? 'on' : ''}"></i>`).join('')}</span>`;
  const stat = (label, v) => `<span class="o-stat"><b>${v}</b> ${label}</span>`;

  function renderTraining() {
    const d = cur(), i = S.sel, have = totalLetters(d), want = buyWant();
    morph($('#o-training'), `
      <p class="o-lede">Primate Resources hires and trains the monkeys on <b>${esc(DESKS[i].name)}</b>. Training costs <b>letters from this desk</b> (the biggest piles go first). You hold ${fmt(have)}.</p>
      <div class="o-row o-left"><span class="o-dim">Keeper</span>${keeperSeg(i)}</div>
      <div class="o-row o-left"><span class="o-dim">Buy</span><span class="o-seg">${[1, 10, 100, 'max'].map(n => `<button type="button" data-act="buyn" data-n="${n}" aria-pressed="${String(ui.buyN) === String(n)}">${n === 'max' ? 'Max' : 'x' + n}</button>`).join('')}</span></div>
      <div class="o-grid">${UPS.map(u => {
        const lvl = u.k === 'paw' ? d.paws : d.up[u.k], max = upMax(u), lock = upLock(u, d), done = lvl >= max, plan = upPlan(u, d, i, want);
        const first = u.k === 'paw' && i === 0 && d.paws === 0 && plan.n === 1;
        return `<div class="o-card"><div class="o-row"><h3>${u.name}</h3><span class="o-lvl">${lvl}/${max}</span></div>
          ${pips(lvl, max)}<p>${u.desc}</p>${lock ? `<p class="o-warn">${lock}</p>` : ''}
          <button type="button" class="o-btn" data-act="up" data-k="${u.k}" ${done || lock || have < plan.cost ? 'disabled' : ''}>${done ? 'Maxed' : `${first ? 'Hire first typist · ' : ''}${plan.n > 1 ? `x${plan.n} · ` : ''}${fmt(plan.cost)} letters`}</button></div>`;
      }).join('')}</div>
      <h3 class="o-h">The crew <span class="o-dim">(${d.crew.length})</span></h3>
      ${d.crew.length ? `<div class="o-grid o-crew">${d.crew.map((t, p) => {
        const l = levelOf(t.xp), nx = LVL_XP[l], pv = LVL_XP[l - 1], pct = nx ? Math.round(100 * (t.xp - pv) / (nx - pv)) : 100, hh = hatById(t.hat);
        return `<div class="o-card o-crewcard${t.shiny ? ' shiny' : ''}"><div class="o-row"><button type="button" class="o-name" data-act="rename" data-p="${p}" title="Rename">${t.shiny ? '✦ ' : ''}${esc(t.name)}</button><span class="o-lvl">Lv ${l}</span></div>
          <span class="o-chip trait">${TRAITS[t.trait].name}</span><p class="o-dim">${TRAITS[t.trait].desc}</p>
          <span class="o-prog" role="img" aria-label="${pct}% to the next level"><i style="width:${pct}%"></i></span>
          <div class="o-row"><span class="o-dim">${fmt(t.xp)} xp${nx ? ' / ' + fmt(nx) : ' (max)'}</span><button type="button" class="o-btn sm" data-act="hat" data-p="${p}" ${HATS.some(hatOpen) ? '' : 'disabled'} title="${HATS.some(hatOpen) ? 'Change hat' : 'Earn awards to unlock hats'}">${hh ? hh.name : 'No hat'}</button></div></div>`;
      }).join('')}</div>` : '<p class="o-dim">Nobody works here yet. Hire a typist above.</p>'}`);
    hydrate($('#o-training'));
  }

  function keeperStrip() {
    const f = focusRecipe();
    return `<div class="o-card o-kstrip" id="oKeepers"><div class="o-row"><h3>Keepers’ goal</h3><span class="o-seg"><button type="button" data-act="autofocus" aria-pressed="${S.autoFocus}">Auto</button><button type="button" data-act="go" data-tab="press" aria-pressed="${!S.autoFocus}">Manual</button></span></div>
      ${f ? `<p><b>${esc(f.title)}</b> <span class="o-dim">${progress(f)}/${f.total} words</span></p><div class="o-progrow">${bar(progress(f), f.total)}</div>` : '<p class="o-dim">No goal yet.</p>'}
      <div class="o-row o-left"><button type="button" class="o-btn sm" data-act="go" data-tab="press">Change</button></div>
      <div class="o-chips">${DESKS.map((X, n) => S.desks[n].owned ? `<button type="button" class="o-chip o-kchip${S.desks[n].keeper.on ? '' : ' off'}" data-act="ktoggle" data-i="${n}" title="${KPAUSE}">${X.name.split(' ')[0]}: ${S.desks[n].keeper.on ? 'Collecting' : 'Paused'}</button>` : '').join('')}</div></div>`;
  }
  function renderLab(force) {
    const pane = $('#o-lab'); if (!force && pane.contains(document.activeElement) && document.activeElement.matches('input')) return;
    const d = cur(), i = S.sel, D = DESKS[i], f = focusRecipe(d);
    const q = ui.bankq.trim().toUpperCase(), needed = f ? f.need : {};
    let words = BAND_WORDS[i].map(w => ({ w, n: makeCopies(d, w) }));
    words = q ? words.filter(x => x.w.includes(q)) : words.filter(x => x.n > 0);
    words.sort((a, b) => ((stock(a.w) === 0) !== (stock(b.w) === 0) ? (stock(a.w) === 0 ? -1 : 1) : (needed[b.w] ? 1 : 0) - (needed[a.w] ? 1 : 0) || a.w.localeCompare(b.w)));
    const ownedBank = Object.keys(S.bank).sort((a, b) => a.length - b.length || a.localeCompare(b));
    morph(pane, `
      ${keeperStrip()}
      <p class="o-lede">Coconut R&amp;D turns <b>${esc(D.name)}</b> letters into words. Any letters on this desk can combine; letters never move between desks, but finished words go to the shared bank.</p>
      ${gardenHTML()}
      <div class="o-card"><h3>Letters</h3>
        <div class="o-letters">${Object.keys(FREQ).sort().map(c => `<div class="o-lcell${d.letters[c] ? '' : ' zero'}"><b>${c}</b>${d.letters[c] || 0}</div>`).join('')}</div></div>
      <div class="o-card"><h3>Make a ${D.lo}–${D.hi} letter word</h3>
        <input class="o-search" id="oBankQ" placeholder="Search words…" value="${esc(ui.bankq)}" autocomplete="off" aria-label="Search words">
        <div class="o-words">${words.slice(0, 60).map(({ w, n }) => `<button type="button" class="o-word${!stock(w) ? ' new' : ''}${needed[w] && stock(w) < needed[w] ? ' need' : ''}" data-act="bankword" data-w="${w}" ${n > 0 ? '' : 'disabled'}><span>${w}</span><i>${n > 0 ? 'x' + n : ''}${stock(w) ? ' · ' + stock(w) + ' banked' : ''}</i></button>`).join('') || '<p class="o-dim">No words can be made from these letters yet.</p>'}</div>
        <p class="o-dim">Green: never banked. Gold: needed by this desk’s focused title.</p></div>
      <div class="o-card"><h3>Shared word bank</h3>
        <div class="o-chips">${ownedBank.map(w => `<span class="o-chip b${bandOf(w.length)}${w === ui.lastBanked && performance.now() - ui.bankedAt < 800 ? ' pop' : ''}">${w} x${S.bank[w]}</span>`).join('') || '<span class="o-dim">Empty. Bank a word above.</span>'}</div></div>
      <details class="o-card o-adv"><summary><h3 style="display:inline">Advanced stock targets</h3></summary>
        <div class="o-row"><label for="oKdef">${esc(D.name)} default stack target (0–9999, 0 skips)</label><input class="o-num" id="oKdef" type="number" min="0" max="9999" value="${d.keeper.def}" data-in="kdef"></div>
        <div class="o-chips">${Object.entries(d.keeper.targets).map(([w, t]) => `<span class="o-chip">${w} → ${t} <button type="button" class="o-x" data-act="ovrdel" data-w="${w}" aria-label="Remove override for ${w}">x</button></span>`).join('') || '<span class="o-dim">No per-word targets.</span>'}</div>
        <div class="o-row o-left"><input class="o-num wide" id="oOvrW" placeholder="word" value="${esc(ui.ovr)}" autocomplete="off" data-in="ovrw" aria-label="Word"><input class="o-num" id="oOvrN" type="number" min="0" max="9999" value="${ui.ovrn}" data-in="ovrn" aria-label="Target"><button type="button" class="o-btn" data-act="ovrset">Set</button></div>
        <p class="o-dim">Keepers only bank what the goal needs unless you set targets. Lowering a target keeps stock.</p></details>`);
    hydrate(pane);
    const inp = $('#oBankQ'); if (!inp._wired) inp._wired = 1, inp.addEventListener('input', () => { ui.bankq = inp.value; renderLab(true); const n = $('#oBankQ'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); });
  }

  const chipsFor = r => Object.entries(r.need).sort((a, b) => a[0].length - b[0].length || a[0].localeCompare(b[0]))
    .map(([w, n]) => `<span class="o-chip b${bandOf(w.length)}${stock(w) >= n ? ' ok' : ''}">${w} ${Math.min(stock(w), n)}/${n}</span>`).join('');
  const subTabs = (dept, items) => `<div class="o-subtabs" role="tablist">${items.map(([id, label, badge]) => `<button type="button" role="tab" data-act="sub" data-dept="${dept}" data-sub="${id}" aria-selected="${(ui.sub[dept] || items[0][0]) === id}">${label}${badge ? `<i class="o-subbadge">${badge}</i>` : ''}</button>`).join('')}</div>`;
  const firstPitch = () => !(S.stats.pitched || 0) && soldCount() >= 1 && pitchActive() < PITCH_MAX;
  const needDesks = r => [...new Set(Object.keys(r.need).map(w => bandOf(w.length)))].sort((a, b) => a - b);
  const lockedDesk = r => needDesks(r).find(b => !S.desks[b].owned);
  function bookCard(r) {
        const done = S.written[r.id], ready = canWrite(r), foc = S.focus === r.id, lock = lockedDesk(r);
    return `<div class="o-card o-book${done ? ' done' : ''}${ui.fresh === r.id ? ' fresh' : ''}${ready ? ' ready' : ''}"><div class="o-row"><h3>${esc(r.title)}${r.gen && !done ? ' <small class="o-pit">COMMISSIONED</small>' : ''}</h3><span class="o-tag b${r.band}">${DESKS[r.band].lo}–${DESKS[r.band].hi}</span></div>
          <p class="o-dim">${r.total} words · rights ${price(done ? r.pay : salePay(r))}${!done && marketMult(r.band) !== 1 ? ` <span class="o-dim">(x${marketMult(r.band).toFixed(2)})</span>` : ''}${foc ? ' <span class="o-tag o-now">NOW WRITING</span>' : ''}</p>
          <div class="o-progrow">${bar(done ? r.total : progress(r), r.total)}<span class="o-dim">${done ? r.total : progress(r)}/${r.total}</span></div>
          <div class="o-chips">${chipsFor(r)}</div>
          ${done ? '' : `<div class="o-chips o-needs"><span class="o-dim">Needs</span>${needDesks(r).map(b => `<span class="o-chip b${b}${S.desks[b].owned ? ' ok' : ''}">${DESKS[b].name.split(' ')[0]}</span>`).join('')}${lock !== undefined ? `<span class="o-warn">Needs ${DESKS[lock].name}</span>` : ''}</div>`}
          ${done ? `<i class="o-stamp${ui.fresh === r.id ? ' slam' : ''}">SOLD!</i>` : ''}
          ${ui.read === r.id ? `<div class="o-read">${esc(r.text)}</div>` : ''}
          <div class="o-row"><button type="button" class="o-btn sm" data-act="read" data-id="${r.id}">${ui.read === r.id ? 'Close' : 'Read'}</button>
            ${done ? '<span class="o-lvl">WRITTEN &amp; SOLD</span>' : `<button type="button" class="o-btn sm" data-act="focus" data-id="${r.id}" ${foc || lock !== undefined ? 'disabled' : ''}>${foc ? 'Focused' : 'Focus'}</button>
            <button type="button" class="o-btn sm gold" data-act="write" data-id="${r.id}" ${ready ? '' : 'disabled'}>${ready && marketMult(r.band) >= 1.4 ? 'Sell now!' : 'Write &amp; sell'}</button>`}</div></div>`;
  }
  function pressList() {
    const q = ui.libq.trim().toLowerCase();
    const list = RECIPES.filter(r => inPlay(r) || S.written[r.id]).filter(r => (!q || r.title.toLowerCase().includes(q)) &&
      (ui.libf === 'all' || (ui.libf === 'written' ? S.written[r.id] : ui.libf === 'ready' ? canWrite(r) : ui.libf === 'pitched' ? r.gen && !S.written[r.id] : !S.written[r.id])));
    const key = r => [canWrite(r) ? 0 : 1, S.focus === r.id ? 0 : 1, r.total - progress(r)];
    list.sort((a, b) => { const x = key(a), y = key(b); return x[0] - y[0] || x[1] - y[1] || x[2] - y[2]; });
    const shown = list.slice(0, ui.libLimit);
    return `<input class="o-search" id="oLibQ" placeholder="Search titles…" value="${esc(ui.libq)}" autocomplete="off" aria-label="Search titles">
      <div class="o-filters"><span class="o-seg">${[['open', 'To write'], ['ready', 'Ready'], ['pitched', 'Pitched'], ['written', 'Written'], ['all', 'All']].map(([k, n]) => `<button type="button" data-act="libf" data-f="${k}" aria-pressed="${ui.libf === k}">${n}</button>`).join('')}</span></div>
      <div class="o-grid">${shown.map(bookCard).join('') || '<p class="o-dim">No titles match.</p>'}</div>
      ${list.length > shown.length ? `<div class="o-row"><button type="button" class="o-btn sm" data-act="libmore">Show more (${list.length - shown.length})</button></div>` : ''}`;
  }
  function renderPress(force) {
    const pane = $('#o-press'); if (!force && pane.contains(document.activeElement) && document.activeElement.matches('input')) return;
    const sold = soldCount(), ready = readyList().length;
    const tabs = [['titles', 'Titles', ready || ''], ...(sold >= 1 ? [['pitches', 'Pitches', firstPitch() ? '!' : ''], ['market', 'Market']] : []), ...(sold >= 3 ? [['archive', 'Archive']] : [])];
    if (!tabs.some(t => t[0] === ui.sub.press)) ui.sub.press = 'titles';
    const sub = ui.sub.press;
    let body = '';
    if (sub === 'titles') {
      const fr = focusRecipe(), written = Object.keys(S.written).length;
      body = `<div class="o-card o-goalbar" id="oGoal"><div class="o-row">${fr ? `<span>Now writing: <b>${esc(fr.title)}</b></span><span class="o-dim">${progress(fr)}/${fr.total} words</span>` : '<span>Pick a title below</span>'}</div>${fr ? bar(progress(fr), fr.total) : ''}
          <div class="o-row o-left"><button type="button" class="o-btn sm" data-act="golist">Change</button><span class="o-seg"><button type="button" data-act="autotoggle" aria-pressed="${S.autoFocus}">Auto</button></span></div></div>
        <div class="o-card o-shelf"><div class="o-row"><h3>Your bookshelf</h3><span class="o-dim">${written} sold · royalties ${fmtRate(royRate())}/s</span></div>${sold ? '<p class="o-dim">Tap a spine to read it.</p>' : '<p class="o-dim">Sell a title to put it here.</p>'}${shelfHTML()}</div>
        <div id="oTitleList">${pressList()}</div>${KIDS.length ? `<p class="o-dim o-kidsline">Kids' reading list: ${kidsSold()} of ${KIDS.length} written</p>` : ''}`;
    } else if (sub === 'pitches') body = pitchHTML();
    else if (sub === 'market') body = `<p class="o-lede">Publishers pay more or less depending on demand. Sell when your title’s band is HOT. Weather and night change demand.</p>${marketHTML()}`;
    else body = `<div class="o-card o-archive"><h3>The Archive</h3>
        <p class="o-dim" id="oArchNote" data-own>Loading the stacks…</p>
        <input class="o-search" id="oArchQ" placeholder="Search the complete manuscripts…" value="${esc(ui.archq)}" autocomplete="off" aria-label="Search the archive">
        <div class="o-filters" id="oArchF" data-own></div><div class="o-grid" id="oArchRes" data-own></div></div>`;
    morph(pane, subTabs('press', tabs) + body);
    const lq = $('#oLibQ'); if (lq && !lq._wired) lq._wired = 1, lq.addEventListener('input', e => { ui.libq = e.target.value; ui.libLimit = 24; renderPress(true); const n = $('#oLibQ'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); });
    const aq = $('#oArchQ'); if (aq && !aq._wired) aq._wired = 1, aq.addEventListener('input', e => { ui.archq = e.target.value; renderArchive(); });
    hydrate(pane); if (sub === 'archive') renderArchive();
  }

  /* ---- archive: the 3,573 full manuscripts, locked until longer machines exist ---- */
  let archive = null, archiveLoading = false;
  const SHELVES = [['all', 'All'], ['stories', 'Stories'], ['songs', 'Songs'], ['tv-shows', 'TV'], ['radio-plays', 'Radio'], ['sketches', 'Sketches'], ['films', 'Films']];
  function loadArchive() {
    if (archive || archiveLoading || Date.now() - ui.archFailed < 30000) return; archiveLoading = true;
    Promise.all(['library/books.json', 'library/archives.json'].map(u => fetch(u).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })))
      .then(([books, arch]) => {
        archive = [...books.map(b => ({ shelf: 'stories', title: b.parody, sub: 'A parody of “' + b.original + '”', words: b.words })),
          ...arch.map(a => ({ shelf: a.archive, title: a.title, sub: a.target, words: a.words }))];
        buildDivOrder(); mark();
        if (ui.tab === 'press') renderArchive();
      })
      .catch(() => { archiveLoading = false; ui.archFailed = Date.now(); const n = $('#oArchNote'); if (n) n.textContent = 'The stacks are locked. Run node sync-library.mjs and serve the site over http.'; });
  }
  function renderArchive() {
    const note = $('#oArchNote'), res = $('#oArchRes'); if (!note || !res) return;
    if (!archive) { loadArchive(); return; }
    morph(note, `${archive.length.toLocaleString()} complete manuscripts are catalogued. Their full-length recipes need longer machines, punctuation rules and a bigger vocabulary, so they stay locked for now. <a href="library.html">Read them in the Library</a>.`);
    morph($('#oArchF'), `<span class="o-seg">${SHELVES.map(([k, n]) => `<button type="button" data-act="archf" data-f="${k}" aria-pressed="${ui.archf === k}">${n}</button>`).join('')}</span>`);
    const q = ui.archq.trim().toLowerCase();
    const hits = archive.filter(a => (ui.archf === 'all' || a.shelf === ui.archf) && (!q || (a.title + ' ' + a.sub).toLowerCase().includes(q)));
    morph(res, hits.slice(0, 18).map(a => `<div class="o-card sub"><div class="o-row"><h3>${esc(a.title)}</h3><span class="o-tag">LOCKED</span></div><p class="o-dim">${esc(a.sub)} · ${a.words} words</p></div>`).join('') +
      (hits.length > 18 ? `<p class="o-dim">…and ${(hits.length - 18).toLocaleString()} more.</p>` : '') || '<p class="o-dim">Nothing matches.</p>');
  }

  function gardenCard(have) {
    const n = S.garden.beds.length, nx = GARDEN_COSTS[n - 2];
    return `<div class="o-card"><div class="o-row"><h3>Garden plots</h3><span class="o-lvl">${n}/6</span></div>${pips(n - 2, 4)}
      <p>More plots in the Coconut R&amp;D letter garden, so you can grow more letters at once.</p>
      ${nx ? `<button type="button" class="o-btn gold" data-act="buy" data-what="plot" ${have < nx ? 'disabled' : ''}>Add a plot · ${price(nx)}</button>` : '<span class="o-lvl">MAXED</span>'}</div>`;
  }
  function lampCard(have) {
    const nx = LAMP[S.lamp], capH = awayCap() / 3600, eff = Math.round(awayEff() * 100);
    return `<div class="o-card"><div class="o-row"><h3>Night Lamp</h3><span class="o-lvl">${S.lamp}/${LAMP.length}</span></div>${pips(S.lamp, LAMP.length)}
      <p>Keeps typists, keepers and royalties going while you are away. Now: up to ${capH}h at ${eff}% effort.${nx ? ` Next: ${nx.cap}h at ${Math.round(nx.eff * 100)}%.` : ''}</p>
      ${nx ? `<button type="button" class="o-btn gold" data-act="buy" data-what="lamp" ${have < nx.cost ? 'disabled' : ''}>Upgrade · ${price(nx.cost)}</button>` : '<span class="o-lvl">MAXED</span>'}</div>`;
  }
  function renderShop() {
    const blue = S.desks[2].owned, have = bananas.get();
    const item = (name, desc, cost, owned, lock, act, i) => `<div class="o-card"><div class="o-row"><h3>${name}</h3>${owned ? '<span class="o-lvl">OWNED</span>' : price(cost)}</div><p>${desc}</p>${lock && !owned ? `<p class="o-warn">${lock}</p>` : ''}
      ${owned ? '' : `<button type="button" class="o-btn gold" data-act="buy" data-what="${act}" ${i != null ? `data-i="${i}"` : ''} ${lock || have < cost ? 'disabled' : ''}>Buy</button>`}</div>`;
    morph($('#o-shop'), `
      <p class="o-lede">Banana Logistics spends the bananas the Jungle Press pays you. Typewriters and room-wide upgrades are bought here.</p>
      <h3 class="o-h">Typewriters</h3><div class="o-grid">${DESKS.slice(1).map((D, n) => {
        const i = n + 1, d = S.desks[i];
        return item(D.name, `Specialises in ${D.lo}–${D.hi} letter words (${D.style} lettering). Starts with one typist.`, D.price, d.owned, chal('haiku') && i >= 2 ? 'Blocked by the Haiku Run' : !S.desks[i - 1].owned ? 'Buy ' + DESKS[i - 1].name + ' first' : '', 'desk', i);
      }).join('')}</div>
      <h3 class="o-h">Publishing deals <span class="o-dim">(royalties ${fmtRate(royBase())}/s now)</span></h3><div class="o-grid">${DEALS.map(x => item(x.name, x.desc, x.cost, !!S.deals[x.id], soldCount() < x.need ? `Needs ${x.need} sold title${x.need > 1 ? 's' : ''}` : '', 'deal', x.id)).join('')}</div>
      <h3 class="o-h">Restorations</h3><div class="o-grid">${DESKS.map((D, i) => S.desks[i].owned ? mkCard(i, have) : '').join('')}</div>
      <h3 class="o-h">Garden</h3><div class="o-grid">${gardenCard(have)}</div>
      <h3 class="o-h">Market tools</h3><div class="o-grid">
        ${item('Literary agent', 'Haggles: the market can never push your sale prices below x0.85.', SHOP.agent, S.agent, soldCount() < 2 ? 'Needs 2 sold titles' : '', 'agent')}
        ${item('Market analyst', 'Shows which way each band is heading next.', SHOP.analyst, S.analyst, soldCount() < 2 ? 'Needs 2 sold titles' : '', 'analyst')}
      </div>
      <h3 class="o-h">Room-wide upgrades</h3><div class="o-grid">
        ${item('Hold to type', 'Hold a finger, cursor or Space to type on every current and future machine.', SHOP.hold, S.hold, '', 'hold')}
        ${item('Paw metronome', 'Doubles every typist’s speed across the room.', SHOP.metro, S.metro, blue ? '' : 'Unlocks with Lagoon Sprint', 'metro')}
        ${item('Double touch', 'Doubles held typing speed across the room.', SHOP.dbl, S.dbl, !blue ? 'Unlocks with Lagoon Sprint' : !S.hold ? 'Needs Hold to type' : '', 'dbl')}
        ${item('Writing contracts', 'Adds 25% to future title rights income.', SHOP.contracts, S.contracts, blue ? '' : 'Unlocks with Lagoon Sprint', 'contracts')}
        ${lampCard(have)}
      </div>
      `);
    hydrate($('#o-shop'));
  }

  const RENDER = { training: renderTraining, lab: renderLab, press: renderPress, studios: renderStudios, muses: renderMuses, shop: renderShop, records: renderRecords, legacy: renderLegacy };
  const KPAUSE = 'Paused keepers stop turning letters into words, so letters pile up for hiring and training.';
  const keeperSeg = i => `<span class="o-seg" title="${KPAUSE}"><button type="button" data-act="ktoggle" data-i="${i}" aria-pressed="${S.desks[i].keeper.on}">Collecting</button><button type="button" data-act="ktoggle" data-i="${i}" aria-pressed="${!S.desks[i].keeper.on}">Paused</button></span>`;
  const dn = D => { const [a, ...r] = D.name.split(' '); return `<b>${a}<em class="o-rest"> ${r.join(' ')}</em></b>`; };
  /* little dots on the department tabs when something there is worth doing */
  function badgeFor(k) {
    const d = cur(), i = S.sel;
    if (k === 'training') return UPS.some(u => { const lvl = u.k === 'paw' ? d.paws : d.up[u.k]; return d.owned && lvl < upMax(u) && !upLock(u, d) && totalLetters(d) >= upCost(u, d, i); }) ? '!' : '';
    if (k === 'lab') return d.owned && BAND_WORDS[i].some(w => !stock(w) && canMake(d, w)) ? '!' : '';
    if (k === 'lab' && S.garden.beds.some(b => b && Date.now() >= b.ready)) return '!';
    if (k === 'muses') { const slots = museSlots(); return slots && S.muses.seated.slice(0, slots).some(x => !x) && MUSES.some(m => S.muses.owned[m.id] && !S.muses.seated.includes(m.id)) ? '!' : (slots && MUSES.some(m => !S.muses.owned[m.id] && bananas.get() >= m.cost) ? '!' : ''); }
    if (k === 'studios') return DIVS.some(D => divUnlocked(D) && divCount(D) < divCap(D) && bananas.get() >= divPlan(D, 1).cost) ? '!' : '';
    if (k === 'records') return ui.unseen ? String(ui.unseen) : '';
    if (k === 'legacy') return starsNow() >= 1 || LEG.some(u => legLvl(u.id) < u.max && S.legacy.stars >= u.costs[legLvl(u.id)]) ? '!' : '';
    if (k === 'press') { const rl = readyList(), n = rl.length, hot = rl.some(r => marketMult(r.band) >= 1.5); return n ? n + (hot ? '!' : '') : firstPitch() ? '!' : ''; }
    if (k === 'shop') {
      const have = bananas.get(), blue = S.desks[2].owned;
      const next = S.desks.findIndex(x => !x.owned);
      const can = (next > 0 && S.desks[next - 1].owned && have >= DESKS[next].price) ||
        (!S.hold && have >= SHOP.hold) || (blue && !S.metro && have >= SHOP.metro) || (blue && S.hold && !S.dbl && have >= SHOP.dbl) || (blue && !S.contracts && have >= SHOP.contracts);
      const plots = GARDEN_COSTS[S.garden.beds.length - 2] && have >= GARDEN_COSTS[S.garden.beds.length - 2];
      const mks = plots || S.desks.some((d, i) => d.owned && d.mk < 2 && have >= mkCost(i));
      const tools = mks || (!S.agent && soldCount() >= 2 && have >= SHOP.agent) || (!S.analyst && soldCount() >= 2 && have >= SHOP.analyst);
      const deal = tools || DEALS.some(x => !S.deals[x.id] && soldCount() >= x.need && have >= x.cost);
      return can || deal || (LAMP[S.lamp] && have >= LAMP[S.lamp].cost) ? '!' : '';
    }
    return '';
  }
  /* ---- header readout + the always-visible buff bar ---- */
  const hudEl = document.getElementById('hud');
  const hudRate = document.createElement('small'); hudRate.className = 'hud-rate'; hudRate.id = 'hudRate'; hudRate.title = 'Royalties from your bookshelf, per second';
  if (hudEl) {                                   // stack the rate under the banana count so the header stays one row
    const col = document.createElement('span'); col.className = 'hud-col'; const sc = hudEl.querySelector('#score');
    hudEl.insertBefore(col, sc); col.appendChild(sc); col.appendChild(hudRate);
  }
  const buffBar = document.createElement('div'); buffBar.className = 'o-buffbar'; buffBar.setAttribute('aria-live', 'polite'); document.body.appendChild(buffBar);
  function renderBuffs() {
    const now = performance.now(), on = Object.keys(buffs).filter(buffOn);
    morph(buffBar, on.map(k => `<span class="o-buff ${k} ${BUFF_INFO[k][1]}">${BUFF_INFO[k][0]} ${Math.ceil((buffs[k] - now) / 1000)}s</span>`).join('') + (S.challenge ? `<span class="o-buff chal">OULIPO: ${esc(chDef(S.challenge.id).name)} ${chProgress()}</span>` : ''));
    if (buffBar.childElementCount) {                                 // float the chips over the room (under its stats), or at the top of the panel
      const st = ui.tab === 'floor' && $('#oStage');
      buffBar.style.top = Math.round(st ? st.getBoundingClientRect().top + 10 : $('.o-panel').getBoundingClientRect().top + 8) + 'px';
    }
    const st = $('#oStage'); if (st) { st.classList.toggle('frenzy', buffOn('frenzy')); st.classList.toggle('golden', buffOn('golden')); }
    const r = royRate() + divRate(); hudRate.textContent = r > 0 ? `+${fmtRate(r)}/s` : ''; hudRate.hidden = r <= 0;
  }
  /* the title screen: a live board of the floor, and PLAY turns into CONTINUE once you have started */
  const menuLive = document.getElementById('heroLive'), playLabel = document.getElementById('playLabel');
  function renderMenu() {
    const started = S.stats.letters > 0, rate = royRate() + divRate();
    if (playLabel) playLabel.textContent = playLabel.dataset[started ? 'cont' : 'new'];
    if (!menuLive || !started) return;
    menuLive.hidden = false;
    morph(menuLive, `<i class="hl-dot"></i><span class="hl-tag">LIVE</span><span><b>${fmtBig(bananas.get())}</b> bananas</span><span><b>${totalPaws()}</b> typists</span><span><b>${fmtBig(S.stats.letters)}</b> letters</span><span><b>${soldCount()}</b> titles</span>${rate > 0 ? `<span class="hl-rate">+${fmtRate(rate)}/s</span>` : ''}`);
  }
  function renderChrome() {
    renderBuffs();
    const firstLocked = S.desks.findIndex(x => !x.owned);
    morph($('#oDesks'), DESKS.map((D, i) => {
      const d = S.desks[i]; if (firstLocked >= 0 && i > firstLocked) return '';
      if (!d.owned && !Object.keys(S.written).length) return '';     // locked machines are a spoiler until the first sale
      if (!d.owned) { const pc = Math.min(100, Math.floor(100 * bananas.get() / D.price)); return `<button type="button" class="o-desk locked${pc >= 100 ? ' can' : ''}" style="--tw:${D.color}" data-act="go" data-tab="shop">${dn(D)}<span class="o-d1">${D.lo}–${D.hi} letters</span><span class="o-d2">${price(D.price)}</span><span class="o-dbar" aria-hidden="true"><i style="width:${pc}%"></i></span></button>`; }
      const ar = autoRate(d); return `<button type="button" class="o-desk" style="--tw:${D.color}" data-act="sel" data-i="${i}" aria-pressed="${i === S.sel}">${ar > 0 ? `<i class="o-dact" style="--spd:${Math.max(.12, Math.min(2, 1 / ar)).toFixed(2)}s" aria-hidden="true"></i>` : ''}${dn(D)}<span class="o-d1">${D.lo}–${D.hi} letters · ${totalLetters(d)} held</span><span class="o-d2">${d.paws} typists · ${autoRate(d).toFixed(2)}/s</span><span class="o-d3">${totalLetters(d)} held</span><span class="o-ktog${d.keeper.on ? '' : ' off'}" role="button" tabindex="0" data-act="ktoggle" data-i="${i}" title="${KPAUSE}" aria-label="Keeper ${d.keeper.on ? 'collecting' : 'paused'}: click to toggle"><i class="o-kdot"></i><span class="o-kw">Keeper</span><span class="o-kst">${d.keeper.on ? ' on' : ' paused'}</span></span></button>`;
    }).join(''));
    hydrate($('#oDesks'));
    const badge = (b, bd) => { if (bd) b.dataset.badge = bd; else delete b.dataset.badge; };
    document.querySelectorAll('.o-tab[data-tab]').forEach(b => { b.setAttribute('aria-selected', String(b.dataset.tab === ui.tab)); b.hidden = !tabVisible(b.dataset.tab); badge(b, b.hidden || b.dataset.tab === ui.tab ? '' : badgeFor(b.dataset.tab)); });
    $$('.o-pane').forEach(p => { p.hidden = p.id !== 'o-' + ui.tab; });
    const D = DESKS[S.sel];
    const wrap = $('.o-wrap');                                       // on .o-wrap itself: its own defaults would otherwise shadow these
    wrap.dataset.tab = ui.tab;
    wrap.style.setProperty('--tw', D.color); wrap.style.setProperty('--tw-font', D.font); wrap.style.setProperty('--tw-fs', D.fs || '');
  }
  let lastLetters = -1;
  function render() {
    if (window.__OPS_HEADLESS) return;
    if (IMI.screen() !== 'game') return renderMenu();                // nothing below is on screen from the title menu
    const ready = readyList().map(r => r.id);
    if (ui.readySet) { const fresh = ready.filter(id => !ui.readySet.includes(id)); if (fresh.length) { cheer(1100, 'READY!'); IMI.sfx.ding(); IMI.emit('ready', { ids: fresh }); } }
    ui.readySet = ready;
    renderChrome();
    if (ui.tab === 'floor') renderFloorInfo(); else RENDER[ui.tab]();
    const lt = totalLetters(cur()); if (lt !== lastLetters) { lastLetters = lt; IMI.emit('letters', { total: lt, typed: S.stats.letters }); }
    IMI.emit('render');
  }

  /* ================= wiring ================= */
  const tabBtn = ([k, ic, name, sub, short]) => `<button type="button" role="tab" class="o-tab" data-tab="${k}" aria-label="${name}" title="${name}: ${sub}"><span class="o-tabico">${ico(ic)}</span><em class="o-short">${short}</em><em class="o-long">${name}</em></button>`;
  root.innerHTML = `<div class="o-wrap" data-tab="floor">
    <div class="o-ticker" id="oTicker" role="marquee" aria-label="News" title="Tap for the next headline"><b class="o-tkr-tag">NEWS</b><div class="o-tkr-view"><span class="o-tkr-text" id="oTkrText"></span></div></div>
    <div class="o-desks" id="oDesks"></div>
    <div class="o-panel">${TABS.map(([k]) => `<section class="o-pane" id="o-${k}" role="tabpanel" ${k === 'floor' ? '' : 'hidden'}></section>`).join('')}</div>
  </div>`;
  document.getElementById('oTabs').innerHTML = TABS.map(tabBtn).join('');                  // the departments live in the side rail (index.html / classic.html)
  hydrate(root); hydrate(document.getElementById('oTabs'));

  function setTab(t) {
    const changed = ui.tab !== t, order = TABS.map(x => x[0]), dir = Math.sign(order.indexOf(t) - order.indexOf(ui.tab)); ui.tab = t;
    $('#o-' + t).style.setProperty('--edir', dir);
    if (t === 'floor') buildStage(); ui.cntZero = changed; render(); ui.cntZero = false;
    IMI.emit('tab', { tab: t });
    if (changed) { const p = $('#o-' + t); p.classList.remove('enter'); void p.offsetWidth; p.classList.add('enter'); p.addEventListener('animationend', () => p.classList.remove('enter'), { once: true }); IMI.sfx.tick(); }
  }
  /* the side rail: icons only until the menu button opens it into a labelled drawer (toys, settings, title screen) */
  const rail = document.getElementById('rail'), railBtn = document.getElementById('railToggle');
  const setRail = open => { rail.classList.toggle('open', open); railBtn.setAttribute('aria-expanded', String(open)); railBtn.setAttribute('aria-label', open ? 'Close the menu' : 'Open the menu'); };
  railBtn.addEventListener('click', () => { IMI.sfx.tick(); setRail(!rail.classList.contains('open')); });
  document.addEventListener('pointerdown', e => { if (rail.classList.contains('open') && !e.target.closest('#rail, .set-pop')) setRail(false); });
  rail.addEventListener('click', e => { if (rail.classList.contains('open') && e.target.closest('.o-tab, #menuBtn, #settingsBtn')) setRail(false); }, true);   // capture: the settings button stops propagation
  rail.addEventListener('click', e => { const tab = e.target.closest('.o-tab'); if (tab) setTab(tab.dataset.tab); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && rail.classList.contains('open')) { e.stopImmediatePropagation(); setRail(false); railBtn.focus(); } }, true);
  const tap = () => { press(S.sel, false); };
  root.addEventListener('pointerdown', e => {
    if (!e.target.closest('#oStage')) return;
    e.preventDefault(); $('#oStage').focus({ preventScroll: true }); tap(); if (!chal('hands')) shock(e.clientX, e.clientY, combo.n >= 20 ? '#ff9a3a' : '#fff6d6', false, true); if (S.hold) holding = true;
  });
  ['pointerup', 'pointercancel', 'blur'].forEach(ev => window.addEventListener(ev, () => { holding = false; }));
  root.addEventListener('keydown', e => {
    if (!e.target.closest('#oStage') || (e.code !== 'Space' && e.code !== 'Enter')) return;
    e.preventDefault(); if (e.repeat) return; tap(); if (S.hold) holding = true;
  });
  root.addEventListener('keyup', e => { if (e.code === 'Space' || e.code === 'Enter') holding = false; });

  const ACTIONS = {
    go: el => setTab(el.dataset.tab),
    sel: el => { const to = +el.dataset.i, from = S.sel; S.sel = to; el.scrollIntoView({ inline: 'nearest', block: 'nearest' }); if (ui.tab === 'floor') swapStage(to === from ? 0 : to > from ? 1 : -1); mark(); save(); },
    hat: el => {
      const t = cur().crew[+el.dataset.p]; if (!t) return;
      const open = [0, ...HATS.filter(hatOpen).map(h => h.id)], at = open.indexOf(t.hat || 0);
      t.hat = open[(at + 1) % open.length] || 0; IMI.sfx.tick(); S.stats.hatsWorn = Math.max(S.stats.hatsWorn || 0, cur().crew.filter(x => x.hat).length); mark(); save();
    },
    rename: el => {
      const t = cur().crew[+el.dataset.p]; if (!t) return;
      const nm = window.prompt('Name this typist', t.name); if (nm && nm.trim()) { t.name = nm.trim().slice(0, 16); typists = []; syncTypists(true); mark(); save(); }
    },
    commission: el => {
      const i = +el.dataset.i, p = S.offers[i]; if (!p || pitchActive() >= PITCH_MAX) return;
      S.pitches.push(p); registerPitch(p); S.stats.pitched = (S.stats.pitched || 0) + 1; S.offers[i] = genPitch(buildRecipe({ ...p, text: p.text }).band);
      ui.fresh = p.id; setTimeout(() => { if (ui.fresh === p.id) ui.fresh = null; mark(); }, 2200);
      pickAutoFocus();
      const at = IMI.centerOf(el); floatText('+1 COMMISSION', at[0], at[1] - 20, '#ffd23a', true);
      IMI.say(`Commissioned “${p.title}”. Find it under Pitches > Your commissions.`);
      IMI.sfx.ding(); logIt(`Commissioned a new title: “${p.title}”.`); newsPush(`Agents confirm a new pitch: “${p.title}”. Monkeys hurry to the typewriters.`); mark(); save();
      setTimeout(() => { const c = document.querySelector('#o-press .o-book.fresh'); if (c) c.scrollIntoView({ behavior: IMI.reduceMotion ? 'auto' : 'smooth', block: 'nearest' }); }, 60);
    },
    repitch: () => { const c = repitchCost(); if (!bananas.spend(c)) return; S.offers = newOffers(); IMI.sfx.tick(); mark(); save(); },
    release: el => releaseDiv(el.dataset.id),
    seed: el => { ui.seed = el.dataset.ch; IMI.sfx.tick(); mark(); },
    plant: el => plant(+el.dataset.i, ui.seed),
    harvest: el => {
      const at = IMI.centerOf(el), ch = S.garden.beds[+el.dataset.i] && S.garden.beds[+el.dataset.i].ch, y = harvest(+el.dataset.i);
      if (y) { IMI.sfx.key(); IMI.burst(at[0], at[1], ['leaf', 'spark'], 8); floatText(`+${y} ${ch}`, at[0], at[1] - 10); vib(12); mark(); save(); }
    },
    harvestall: () => {
      let got = 0; S.garden.beds.forEach((b, i) => { got += harvest(i) || 0; });
      if (got) { IMI.sfx.ding(); floatText(`+${got} letters`, innerWidth / 2, 200, '#7be05a', true); mark(); save(); }
    },
    museinvite: el => { const mu = MUSES.find(x => x.id === el.dataset.id); if (!mu || S.muses.owned[mu.id] || !bananas.spend(mu.cost)) return; S.muses.owned[mu.id] = true; IMI.sfx.ding(); logIt(`${mu.name} accepted your invitation to the Muse Salon.`); newsPush(`${mu.name} arrives at the Muse Salon. The monkeys pretend to have read the books.`); mark(); save(); },
    museseat: el => { const id = el.dataset.id, k = +el.dataset.slot; if (!S.muses.owned[id] || k >= museSlots()) return; const M = S.muses; const old = M.seated.indexOf(id); if (old >= 0) M.seated[old] = null; M.seated[k] = id; IMI.sfx.ding(); mark(); save(); },
    museout: el => { S.muses.seated[+el.dataset.slot] = null; IMI.sfx.tick(); mark(); save(); },
    chpick: el => { ui.nextCh = el.dataset.id; IMI.sfx.tick(); mark(); },
    printask: () => askPrint(),
    chabandon: () => { if (S.challenge) endChallenge('abandon'); },
    legbuy: el => {
      const u = LEG.find(x => x.id === el.dataset.id); if (!u) return; const lv = legLvl(u.id), cost = u.costs[lv];
      if (lv >= u.max || S.legacy.stars < cost) return; S.legacy.stars -= cost; S.legacy.ups[u.id] = lv + 1;
      IMI.sfx.ding(); logIt(`Legacy upgrade: ${u.name} level ${lv + 1}.`); mark(); save();
    },
    buyn: el => { ui.buyN = el.dataset.n === 'max' ? 'max' : +el.dataset.n; mark(); },
    up: el => { const at = IMI.centerOf(el), had = JSON.stringify(cur().up) + cur().paws; buyUp(el.dataset.k); if (JSON.stringify(cur().up) + cur().paws !== had) { IMI.burst(at[0], at[1], ['spark', 'leaf', 'star'], 10); vib(25); if (el.dataset.k === 'paw') { const nt = cur().crew[cur().crew.length - 1]; if (nt && nt.shiny) { floatText(`SHINY ${nt.name.toUpperCase()}!`, at[0], at[1] - 40, '#ffe680', true); shock(at[0], at[1], '#ffe680', true); flash('#fff6a0'); newsPush(`A SHINY typist joins the crew: ${nt.name} glitters faintly and refuses to explain why.`); } cheer(900, 'HI!'); newsPush('A new typist swings in. HR hands over a name tag and a banana.'); } } },
    bankword: el => { const at = IMI.centerOf(el); if (bankWord(cur(), el.dataset.w)) { IMI.sfx.key(); vib(8); shock(at[0], at[1], '#7be05a'); floatText('+' + el.dataset.w, at[0], at[1] - 10); } },
    buy: el => { const at = IMI.centerOf(el), before = bananas.get(); buy(el.dataset.what, el.dataset.i); if (bananas.get() < before) { IMI.burst(at[0], at[1], ['banana', 'spark', 'star'], 12); vib(25); } },
    write: el => writeTitle(el.dataset.id, el),
    focus: el => { const r = RBY[el.dataset.id]; if (!r || lockedDesk(r) !== undefined) return; S.focus = el.dataset.id; S.autoFocus = false; mark(); save(); IMI.emit('focus', { id: S.focus }); },
    unfocus: () => { S.focus = null; S.autoFocus = true; pickAutoFocus(); mark(); save(); },
    autofocus: () => { S.autoFocus = true; S.focus = null; pickAutoFocus(); mark(); save(); },
    ktoggle: el => { const k = S.desks[+el.dataset.i].keeper; k.on = !k.on; IMI.sfx.tick(); mark(); save(); },
    kon: () => { cur().keeper.on = true; mark(); save(); },
    koff: () => { cur().keeper.on = false; mark(); save(); },
    ovrset: () => {
      const w = ui.ovr.trim().toUpperCase();
      if (!VOCAB.has(w) || bandOf(w.length) !== S.sel) return IMI.say(`“${w || '…'}” isn’t a ${DESKS[S.sel].lo}–${DESKS[S.sel].hi} letter word here.`);
      cur().keeper.targets[w] = Math.max(0, Math.min(9999, ui.ovrn | 0)); ui.ovr = ''; mark(); save();
    },
    ovrdel: el => { delete cur().keeper.targets[el.dataset.w]; mark(); save(); },
    libf: el => { ui.libf = el.dataset.f; ui.libLimit = 24; mark(); },
    libmore: () => { ui.libLimit += 24; mark(); },
    sub: el => { ui.sub[el.dataset.dept] = el.dataset.sub; IMI.sfx.tick(); mark(); IMI.emit('tab', { tab: el.dataset.dept, sub: el.dataset.sub }); const p = $('#o-' + el.dataset.dept); if (p) p.scrollTop = 0; },
    golist: () => { const n = $('#oTitleList'); if (n) n.scrollIntoView({ behavior: IMI.reduceMotion ? 'auto' : 'smooth', block: 'start' }); },
    autotoggle: () => { if (S.autoFocus) S.autoFocus = false; else { S.autoFocus = true; S.focus = null; pickAutoFocus(); } IMI.sfx.tick(); mark(); save(); },
    archf: el => { ui.archf = el.dataset.f; renderArchive(); },
    pull: el => { ui.pulled = ui.pulled === el.dataset.id ? null : el.dataset.id; ui.sub.press = 'titles'; IMI.sfx.tick(); if (ui.tab !== 'press') setTab('press'); else mark(); },
    read: el => { ui.read = ui.read === el.dataset.id ? null : el.dataset.id; mark(); },
    reset: () => { if (confirm('Reset Typewriter Ops? Your bananas are kept.')) { S = fresh(); save(); buildStage(); mark(); } }
  };
  root.addEventListener('click', e => {
    const el = e.target.closest('[data-act]'); if (!el || el.disabled) return;
    ACTIONS[el.dataset.act]?.(el);
  });
  root.addEventListener('change', e => {
    const el = e.target.closest('[data-in]');
    if (el && el.dataset.in === 'kdef') { cur().keeper.def = Math.max(0, Math.min(9999, el.value | 0)); save(); mark(); }
  });
  root.addEventListener('input', e => {
    const el = e.target.closest('[data-in]'); if (!el) return;
    if (el.dataset.in === 'ovrw') ui.ovr = el.value; else if (el.dataset.in === 'ovrn') ui.ovrn = el.value | 0;
  });
  const tk = $('#oTicker');
  tk.addEventListener('click', () => startNews());
  tk.addEventListener('pointerenter', () => { try { ticker.anim && ticker.anim.pause(); } catch { /* ignore */ } });
  tk.addEventListener('pointerleave', () => { try { ticker.anim && ticker.anim.play(); } catch { /* ignore */ } });
  bananas.watch(b => { if (b !== lastBananas) { if (b > lastBananas) S.run.earned = (S.run.earned || 0) + (b - lastBananas); lastBananas = b; mark(); } });

  /* ================= main loop ================= */
  let coinClock = 0, chalClock = 0, gardenClock = 0, marketClock = 0, awardClock = 0, royAcc = 0, royClock = 0, royFloat = 2.4, goldIn = 25 + rand() * 25, buffWas = false, last = performance.now(), keeperT = [], focusClock = 0, saveT = 0, renderT = 0;
  function tick() {
    const now = performance.now(), dt = Math.min(0.25, (now - last) / 1000); last = now;
    S.desks.forEach(ensureCrew);
    gardenClock += dt; if (gardenClock >= 1) { gardenClock = 0; gardenTick(); }
    if (document.hidden) return;                                   // hidden time is paid out as offline progress when you come back
    S.desks.forEach((d, i) => {
      if (!d.owned || !d.paws) return;
      const T = rt[i].timers, base = pawSecs(d);
      while (T.length < d.paws) T.push(rand() * base);
      for (let p = 0; p < d.paws; p++) { const secs = base / typistSpeed(d.crew[p]) / deskMk(d); T[p] -= dt; let guard = 0; while (T[p] <= 0 && guard++ < 8) { T[p] += secs; press(i, true, p); } }
    });
    const stH = $('#oStage'); if (stH) stH.classList.toggle('holding', !!(holding && S.hold));
    if (holding && S.hold) { holdAcc += holdRate(cur()) * dt; let g = 0; while (holdAcc >= 1 && g++ < 12) { holdAcc -= 1; press(S.sel, false); } } else holdAcc = 0;
    focusClock += dt; if (focusClock >= 1) { focusClock = 0; if (!S.focus && S.autoFocus) pickAutoFocus(); }
    S.desks.forEach((d, i) => { if (!d.owned) return; keeperT[i] = (keeperT[i] || 0) + dt * (museOn('hemi') ? 2 : 1); let g = 0; while (keeperT[i] >= KEEPER_PERIOD[i] && g++ < 4) { keeperT[i] -= KEEPER_PERIOD[i]; keeperStep(d, i); } if (g >= 4) keeperT[i] = 0; });
    if (S.challenge) { chalClock += dt; if (chalClock >= 1) { chalClock = 0; checkChallenge(); dirty = true; } }
    const buffNow = anyBuff(); if (buffNow || buffWas) dirty = true; buffWas = buffNow;
    marketClock += dt; if (marketClock >= 6) { marketClock = 0; marketStep(); }
    S.stats.secs += dt; awardClock += dt; if (awardClock >= 1) { awardClock = 0; checkAwards(); }
    const rr = royRate(), dr = divRate(); royAcc += (rr + dr) * dt; royClock += dt;
    if (royClock >= .25 && royAcc >= 1) { const n = Math.floor(royAcc), share = dr / ((rr + dr) || 1); royAcc -= n; royClock = 0; S.royTotal += n * (1 - share); S.divTotal += n * share; bananas.add(n); coinBank += n; }
    coinClock += dt; if (coinClock >= 1.1) { coinClock = 0; royCoins(); }
    if (divCount(DIVS[4])) { premiereClock += dt; if (premiereClock >= 300) { premiereClock = 0; premiere(); } }
    royFloat -= dt; if (royFloat <= 0) { royFloat = 2.4; royPing(); }
    if (!document.hidden) { goldIn -= dt * (museOn('christie') ? 1.3 : 1) * (1 + .25 * legLvl('golden')) * (1 + .03 * S.desks.reduce((a, d) => a + d.crew.filter(t => t.trait === 'scout').length, 0)); if (goldIn <= 0) { goldIn = 55 + rand() * 80; spawnGold(); } }
    renderT += dt; if (renderT >= 0.25 && dirty) { renderT = 0; dirty = false; render(); }
    saveT += dt; if (saveT >= 5) { saveT = 0; save(); }
  }
  window.addEventListener('beforeunload', save);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); else { last = performance.now(); welcomeBack(30); setTimeout(dailyLater, 1200); } });
  if (typeof Weather !== 'undefined') Weather.on('change', () => { paintWindow(); mark(); });

  pickAutoFocus(); S.desks.forEach(ensureCrew); if (totalReleased() > 0) loadArchive(); checkAwards(true); buildStage(); render(); startNews(); welcomeBack(60); setTimeout(dailyLater, 1800);
  IMI.onScreen(name => { if (name === 'game') { mark(); buildStage(); startNews(); render(); } else render(); });
  setInterval(tick, 50);
  requestAnimationFrame(loop);
})();

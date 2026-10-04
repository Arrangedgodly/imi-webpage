/* TYPEWRITER OPS — the writing-room game that lives inside the jungle page.
   Letters (typed by hanging monkeys) → words (Coconut R&D) → written titles (Vine Infrastructure) → bananas → more typewriters.
   Shares the page's banana counter, sounds, particles, weather/mood, hero monkey and field log through window.IMI. */
(() => {
  'use strict';
  const IMI = window.IMI, root = document.getElementById('opsRoot');
  if (!IMI || !root) return;
  const PX = IMI.edition === 'pixel';
  const $ = (s, r = root) => r.querySelector(s);
  const $$ = (s, r = root) => [...r.querySelectorAll(s)];
  const fmt = n => Math.round(n).toLocaleString('en-US');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const rand = Math.random;
  const VOWELS = 'AEIOU';
  const bananas = IMI.bananas;

  /* ================= static data ================= */
  const DESKS = [
    { id: 'mint',  name: 'Bamboo Classic',    lo: 2, hi: 3, price: 0,      color: '#78d9a0', font: PX ? "'Press Start 2P', monospace" : "'Lilita One', sans-serif",     style: PX ? 'Classic pixel' : 'Classic round' },
    { id: 'rose',  name: 'Hibiscus Ribbon',   lo: 4, hi: 5, price: 2000,   color: '#f08aa4', font: PX ? "'Pixelify Sans', monospace" : "'Fredoka', sans-serif",         style: PX ? 'Soft pixel' : 'Soft round' },
    { id: 'blue',  name: 'Lagoon Sprint',     lo: 6, hi: 7, price: 25000,  color: '#5fa8f0', font: PX ? "'Silkscreen', monospace" : "'Barlow Condensed', sans-serif",    style: 'Narrow' },
    { id: 'amber', name: 'Honeycomb Ledger',  lo: 8, hi: 9, price: 312500, color: '#f2b23a', font: PX ? "'Tiny5', monospace" : "'Rokkitt', serif",                      style: 'Slab' }
  ];
  const TABS = [
    ['floor', 'type', 'Typewriter Ops', 'The floor'], ['training', 'monkey', 'Primate Resources', 'Hire & train'],
    ['lab', 'coconut', 'Coconut R&D', 'Word lab'], ['security', 'palm', 'Canopy Security', 'Word keepers'],
    ['press', 'log', 'Vine Infrastructure', 'Titles & rights'], ['shop', 'banana', 'Banana Logistics', 'Spend bananas']
  ];
  const bandOf = n => (n <= 3 ? 0 : n <= 5 ? 1 : n <= 7 ? 2 : 3);
  const SHOP = { keeper: 1000, hold: 500, metro: 3000, dbl: 2000, contracts: 10000 };
  const FREQ = { E: 12, T: 9, A: 8, O: 8, I: 7, N: 7, S: 6, H: 6, R: 6, D: 4, L: 4, C: 3, U: 3, M: 3, W: 2, F: 2, G: 2, Y: 2, P: 2, B: 1.5, V: 1, K: 1, J: .3, X: .3, Q: .2, Z: .2 };
  const POP_COLORS = ['#ff5d73', '#ffd23a', '#7be05a', '#4cc9f0', '#c39bff', '#ff9ec0'];
  const EXTRA_WORDS = `up if me we be no so or as at by my ox an am us
    ace add age ago aim air all and any arm art ask bad bag ban bat bed bee bet bit box boy bud bug bus but buy cab cat cow cry cub cut dad day den dig dim dip dog dot dry dub due ear eat egg end eye fan far fat few fit fix fly for fun gap gas get gum gut guy had ham has hat hay her hid him hip his hit hop hot how hug ice ink jam jar jaw jet job joy key kid kit lap lay leg let lid lip log lot low mad man map mat may mud nap net new nod nut oak odd off oil old one our out owl own pan pat paw pay pea pet pie pig pin pit pop pot put rag ram rat raw red rib rid rob rod row rub rug run sad sat saw say sea see set sew she shy sin sip sir sit six ski sky sly son sow spy sub sum sun tag tan tap tar tea ten tie tin tip toe ton top toy try tub tug two van vet wag war was wax way web wet who why win wit yak yam yes yet you zip zoo
    able acorn bark bean bell bird book boot bush calm cave chip city cook cool corn dark deep door dust each east farm fern fish flag fold fork free frog game gate gift glow goat gold grab hand hill hope jump kite lamp leaf lion loud mail monk nest pale pear plum rain rice rock root sand seed ship silk sing slow soft song star swim tail tall tent tree vine wave wind wing wood yard zebra
    banjo brick cabin chair clock cloud crown eagle flute grape habit jelly koala lemon mango otter paper piano quilt robin snack tiger trunk umbra waltz yacht
    anchor bakery basket branch candle carpet cheese circus garden hammer jungle lizard monkey orange parrot pencil pocket ribbon rocket shadow spider tablet turkey window
    blanket cabinet chimney compass diamond fantasy giraffe harvest journey kitchen library mixture natural octopus palette sparrow thunder trumpet whistle
    adventure alphabet bookcase carousel daydream elephant festival gingerly handsome jellyfish lighthouse marathon notebook orchestra pineapple`.split(/\s+/);

  /* ---- recipes come from the exact text of each edition ---- */
  const tokens = t => (t.toLowerCase().match(/[a-z']+/g) || []).map(w => w.replace(/'/g, '')).filter(w => w.length > 1);
  const RECIPES = window.READERS.map(r => {
    const need = {}; let max = 0, total = 0;
    for (const w of tokens(r.text)) { const W = w.toUpperCase(); need[W] = (need[W] || 0) + 1; max = Math.max(max, w.length); total++; }
    return { ...r, need, total, band: bandOf(max) };
  });
  const RBY = Object.fromEntries(RECIPES.map(r => [r.id, r]));
  const VOCAB = new Set(EXTRA_WORDS.map(w => w.toUpperCase()).filter(w => w.length >= 2 && w.length <= 9));
  RECIPES.forEach(r => Object.keys(r.need).forEach(w => VOCAB.add(w)));
  const BAND_WORDS = [[], [], [], []];
  [...VOCAB].sort().forEach(w => BAND_WORDS[bandOf(w.length)].push(w));
  const LCOUNT = new Map();
  const lcount = w => { let c = LCOUNT.get(w); if (!c) { c = {}; for (const ch of w) c[ch] = (c[ch] || 0) + 1; LCOUNT.set(w, c); } return c; };

  /* ================= state ================= */
  const KEY = 'imi-ops-v1';
  const newDesk = i => ({
    owned: i === 0, paws: 0, letters: {}, tray: [],
    up: { fing: 0, rapid: 0, vowel: 0, ink: 0, practice: 0, stock: 0, ribbon: 0 },
    keeper: { owned: false, on: true, def: 3, targets: {}, focus: null }
  });
  const fresh = () => ({ hold: false, metro: false, dbl: false, contracts: false, sel: 0, written: {}, bank: {}, log: [], desks: DESKS.map((_, i) => newDesk(i)) });
  let S = (() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY));
      if (!saved) return fresh();
      const f = fresh(); Object.assign(f, saved);
      f.desks = DESKS.map((_, i) => { const d = newDesk(i), s = (saved.desks || [])[i] || {}; return { ...d, ...s, up: { ...d.up, ...s.up }, keeper: { ...d.keeper, ...s.keeper } }; });
      return f;
    } catch { return fresh(); }
  })();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* storage blocked */ } };
  const rt = DESKS.map(() => ({ timers: [], sheet: '', col: 0, n: 0 }));    // runtime only
  const ui = { tab: 'floor', libq: '', libf: 'all', archq: '', archf: 'all', read: null, bankq: '', ovr: '', ovrn: 3 };
  let dirty = true, holding = false, holdAcc = 0, popSlot = 0, lastBananas = bananas.get();

  /* ================= helpers ================= */
  const cur = () => S.desks[S.sel];
  const stock = w => S.bank[w] || 0;
  const totalLetters = d => Object.values(d.letters).reduce((a, b) => a + b, 0);
  const target = (d, w) => (w in d.keeper.targets ? d.keeper.targets[w] : d.keeper.def);
  const stormy = () => typeof Weather !== 'undefined' && Weather.state === 3;
  const pawSecs = d => 2 * Math.pow(0.85, d.up.fing) * (S.metro ? 0.5 : 1) * (stormy() ? 2 : 1);
  const holdRate = d => (4 + 2 * d.up.rapid) * (S.dbl ? 2 : 1);
  const autoRate = d => (d.paws ? d.paws / pawSecs(d) : 0);
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
  const focusRecipe = d => { const k = d.keeper; return k.owned && k.focus && !S.written[k.focus] ? RBY[k.focus] : null; };
  const mark = () => { dirty = true; };
  const logIt = text => { S.log.unshift(text); S.log.length = Math.min(S.log.length, 40); IMI.log(text); };

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
  function roll(d, i, auto) {
    const up = d.up, k = d.keeper; let ch = null;
    if (auto && focusRecipe(d) && rand() < [.65, .75, .85, .95][up.practice]) ch = pick(focusNeeds(d, i).missing);
    if (!ch && auto && k.owned && up.stock && rand() < [0, .2, .4, .6][up.stock]) ch = pick(completers(d, i, w => target(d, w) > 0 && stock(w) < target(d, w)));
    if (!ch && up.ink && rand() < [0, .25, .45, .65][up.ink]) ch = pick(completers(d, i, w => !stock(w)));
    if (!ch) {
      const last = rt[i].sheet.slice(-1).toUpperCase();
      const lastCons = last && /[A-Z]/.test(last) && !VOWELS.includes(last);
      if (lastCons && up.vowel && rand() < [0, .45, .65, .8][up.vowel]) ch = pick(Object.fromEntries([...VOWELS].map(v => [v, FREQ[v]])));
      else ch = pick(FREQ);
    }
    return ch;
  }
  function press(i, auto) {
    const d = S.desks[i]; if (!d.owned) return;
    const ch = roll(d, i, auto);
    addLetter(d, ch);
    if (auto && d.up.ribbon && d.keeper.owned && rand() < [0, .1, .2, .3][d.up.ribbon]) {
      const { required, missing } = focusNeeds(d, i), want = pick(missing);
      const spare = Object.keys(d.letters).filter(l => d.letters[l] > (required[l] || 0));
      if (want && spare.length) { takeLetter(d, spare[Math.floor(rand() * spare.length)]); addLetter(d, want); }
    }
    rt[i].sheet = (rt[i].sheet + ch).slice(-120); rt[i].n++;
    if (i === S.sel) animatePress(ch, auto, rt[i].n);
    mark();
  }

  /* ================= banking & writing ================= */
  function bankWord(d, w) {
    const c = lcount(w);
    for (const k in c) if ((d.letters[k] || 0) < c[k]) return false;
    for (const k in c) for (let n = 0; n < c[k]; n++) takeLetter(d, k);
    S.bank[w] = stock(w) + 1; mark(); return true;
  }
  function keeperStep(d, i) {
    const k = d.keeper; if (!k.owned || !k.on) return;
    const r = focusRecipe(d), words = BAND_WORDS[i];
    if (r) for (const w of words) if (r.need[w] && stock(w) < r.need[w] && canMake(d, w)) { bankWord(d, w); return; }
    const reserved = r ? focusNeeds(d, i).oneCopy : {};
    let best = null, bestStock = Infinity;
    for (const w of words) {
      const t = target(d, w), s = stock(w);
      if (t <= 0 || s >= t || s >= bestStock || !canMake(d, w)) continue;
      const c = lcount(w); let safe = true;
      for (const ch in c) { const have = d.letters[ch] || 0; if (have - c[ch] < Math.min(have, reserved[ch] || 0)) { safe = false; break; } }
      if (safe) { best = w; bestStock = s; }
    }
    if (best) bankWord(d, best);
  }
  const canWrite = r => !S.written[r.id] && Object.keys(r.need).every(w => stock(w) >= r.need[w]);
  function writeTitle(id, fromEl) {
    const r = RBY[id]; if (!r || !canWrite(r)) return;
    for (const w in r.need) { S.bank[w] -= r.need[w]; if (S.bank[w] <= 0) delete S.bank[w]; }
    const pay = Math.round(r.pay * (S.contracts ? 1.25 : 1));
    S.written[id] = true;
    S.desks.forEach(d => { if (d.keeper.focus === id) d.keeper.focus = null; });
    const at = fromEl ? IMI.centerOf(fromEl) : undefined;
    bananas.earn(pay, at);
    if (at) IMI.burst(at[0], at[1], ['banana', 'spark', 'leaf'], 14);
    IMI.sfx.ding(); IMI.heroSay('PUBLISHED!', 1800);
    logIt(`The Jungle Press bought the rights to “${r.title}”: ${fmt(pay)} bananas. It will not be reprinted.`);
    const n = Object.keys(S.written).length;
    if (n === RECIPES.length) IMI.banner(PX ? 'THE COMPLETE WORKS!' : 'The Complete Works!');
    else if (n === 1) IMI.banner(PX ? 'FIRST PRINTING!' : 'First Printing!');
    else if (n % 4 === 0) IMI.banner(PX ? 'BESTSELLER!' : 'Bestseller!');
    mark(); save();
  }

  /* ================= training upgrades (spend this desk's letters) ================= */
  const TIER = [1, 2.5, 6];
  const UPS = [
    { k: 'paw',      ico: 'monkey', name: 'Hire a typist', base: 25, max: 12, desc: 'Another junior monkey swings in and types a letter every two seconds.' },
    { k: 'fing',     name: 'Quick fingers', base: 40, grow: 1.6, max: 10, desc: "Speeds up this desk's typists by about 18% per level." },
    { k: 'rapid',    name: 'Rapid touch', base: 75, grow: 1.7, max: 8, desc: 'Held typing here gains +2 letters per second per level.', needs: 'hold' },
    { k: 'vowel',    name: 'Vowel rhythm', base: 30, tier: 1, desc: 'After a consonant, a vowel comes up 45%, 65%, then 80% of the time.' },
    { k: 'ink',      name: 'Fresh ink', base: 40, tier: 1, desc: 'Leans 25%, 45%, then 65% toward the letter that finishes a word you have never banked.' },
    { k: 'practice', name: 'Recipe practice', base: 100, tier: 1, keeper: 1, desc: 'Typists chase the focused title harder: 75%, 85%, then 95% (base 65%).' },
    { k: 'stock',    name: 'Stock-aware ink', base: 80, tier: 1, keeper: 1, desc: 'Leans 20%, 40%, then 60% toward words below the keeper’s targets, duplicates included.' },
    { k: 'ribbon',   name: 'Spare ribbon', base: 150, tier: 1, keeper: 1, desc: 'Each typist press has a 10%, 20%, then 30% chance to swap a surplus letter for a missing ingredient.' }
  ];
  const upLevel = (u, d, i) => (u.k === 'paw' ? Math.max(0, d.paws - (i ? 1 : 0)) : d.up[u.k]);
  const upMax = u => (u.k === 'paw' ? u.max : u.tier ? 3 : u.max);
  const upCost = (u, d, i) => { const l = upLevel(u, d, i); return Math.round(u.tier ? u.base * TIER[l] : u.base * Math.pow(u.grow || 1.7, l)); };
  const upLock = (u, d) => (u.needs === 'hold' && !S.hold ? 'Needs Hold to type (Banana Logistics)' : u.keeper && !d.keeper.owned ? 'Needs this desk’s word keeper' : '');
  function buyUp(k) {
    const i = S.sel, d = cur(), u = UPS.find(x => x.k === k); if (!u) return;
    const lvl = u.k === 'paw' ? d.paws : d.up[u.k];
    if (lvl >= upMax(u) || upLock(u, d)) return;
    const cost = upCost(u, d, i); if (totalLetters(d) < cost) return;
    let left = cost;                                    // spend from the biggest piles first
    while (left-- > 0) { const top = Object.keys(d.letters).sort((a, b) => d.letters[b] - d.letters[a])[0]; takeLetter(d, top); }
    if (u.k === 'paw') d.paws++; else d.up[u.k]++;
    IMI.sfx.ding(); mark(); save();
  }

  /* ================= shop (spend bananas) ================= */
  function buy(what, arg) {
    const i = +arg;
    if (what === 'desk') {
      const d = S.desks[i], p = DESKS[i].price;
      if (d.owned || !S.desks[i - 1]?.owned || !bananas.spend(p)) return;
      d.owned = true; d.paws = 1; S.sel = i; buildStage();
      logIt(`${DESKS[i].name} installed on the canopy. It types ${DESKS[i].lo}–${DESKS[i].hi} letter words.`);
    } else if (what === 'keeper') {
      const d = S.desks[i]; if (!d.owned || d.keeper.owned || !bananas.spend(SHOP.keeper)) return;
      d.keeper.owned = true; logIt(`A word keeper took over the ${DESKS[i].name} stockroom.`);
    } else if (SHOP[what] && !S[what]) {
      if (what === 'dbl' && !S.hold) return;
      if ((what === 'metro' || what === 'dbl' || what === 'contracts') && !S.desks[2].owned) return;
      if (!bananas.spend(SHOP[what])) return;
      S[what] = true;
    } else return;
    IMI.sfx.ding(); mark(); save();
  }

  /* ================= icons ================= */
  const ICO_PX = { type: 'i-type', monkey: 'i-monkey', coconut: 'i-coconut', palm: 'i-palm', log: 'i-log', banana: 'banana', leaf: 'leaf' };
  const ICO_CL = { type: '⌨️', monkey: '🐒', coconut: '🥥', palm: '🌴', log: '🪵', banana: '🍌', leaf: '🍃' };
  const ico = (n, sz = 0) => `<i class="o-ico" data-ico="${n}" data-sz="${sz}"></i>`;
  const price = n => `<span class="o-price">${ico('banana', 24)}${fmt(n)}</span>`;
  function hydrate(scope) {
    $$('[data-ico]', scope).forEach(el => {
      const n = el.dataset.ico, sz = +el.dataset.sz;
      if (PX) {
        const sp = PXA.spr[ICO_PX[n]]; if (!sp) return;
        const w = sz || sp.w * PXA.S, h = Math.round(w * sp.h / sp.w);
        el.classList.add('spr'); el.style.width = w + 'px'; el.style.height = h + 'px';
        el.style.backgroundImage = `url(${sp.url})`; el.style.backgroundSize = '100% 100%';
      } else { el.textContent = ICO_CL[n]; if (sz) el.style.fontSize = sz * .9 + 'px'; }
      el.removeAttribute('data-ico');
    });
  }

  /* ================= typewriter stage ================= */
  const ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
  let typists = [];
  function buildStage() {
    const i = S.sel, D = DESKS[i];
    const pane = $('#o-floor');
    pane.innerHTML = `
      <div class="o-stage" id="oStage" tabindex="0" role="button" aria-label="${esc(D.name)} typewriter. Tap, click, or press Space to type a letter.">
        <div class="o-dangle" id="oDangle" aria-hidden="true"></div>
        <div class="o-tw" id="oTw">
          <div class="o-sheetwrap"><div class="o-sheet" id="oSheet"></div></div>
          <div class="o-carriage" id="oCar"></div>
          <div class="o-bars" id="oBars">${Array.from({ length: 9 }, (_, n) => `<i class="o-bar" style="--a:${-48 + n * 12}deg"></i>`).join('')}</div>
          <div class="o-body" data-name="${esc(D.name.toUpperCase())}">
            <div class="o-kbd">${ROWS.map(r => `<div class="o-krow">${[...r].map(c => `<b class="o-key" data-k="${c}">${c}</b>`).join('')}</div>`).join('')}
              <div class="o-krow"><b class="o-key o-space" data-k=" "></b></div></div>
          </div>
        </div>
      </div>
      <div class="o-info">
        <div class="o-tray" id="oTray" aria-label="Recent letters"></div>
        <div class="o-stats" id="oStats"></div>
        <p class="o-guide" id="oGuide"></p>
      </div>`;
    rt[i].col = 0; typists = []; syncTypists();
    $('#oSheet').textContent = rt[i].sheet.slice(-48);
  }
  function syncTypists() {
    const box = $('#oDangle'); if (!box) return;
    const n = Math.min(cur().paws, 8);
    if (typists.length === n) return;
    typists = []; box.innerHTML = '';
    for (let k = 0; k < n; k++) {
      const el = document.createElement('div'); el.className = 'o-typist';
      el.style.left = (100 / (n + 1)) * (k + 1) + '%'; el.style.setProperty('--rope', 16 + (k * 37) % 46 + 'px');
      el.innerHTML = PX ? '<i class="o-rope"></i><canvas></canvas>' : '<i class="o-rope"></i><span class="o-mk">🐒</span><span class="o-hat">🍃</span>';
      box.appendChild(el);
      typists.push({ el, cv: el.querySelector('canvas'), a: 0, v: (k % 2 ? 1 : -1) * .05, seed: k * 1.7, ph: k % 2, expr: 'normal', until: 0, frame: null });
    }
    if (IMI.reduceMotion) stepTypists(performance.now());
  }
  function kick(strong) {
    if (!typists.length) return;
    const t = typists[Math.floor(rand() * typists.length)];
    t.v += (rand() < .5 ? -1 : 1) * (strong ? .13 : .06); t.ph ^= 1; t.expr = 'screech'; t.until = performance.now() + 170;
  }
  function stepTypists(now) {
    const hat = typeof Mood !== 'undefined' && Mood.hat, scared = typeof Mood !== 'undefined' && Mood.scared;
    for (const t of typists) {
      if (!IMI.reduceMotion) {
        t.v += -t.a * .045 + Math.sin(now / 900 + t.seed) * .0011 + (scared ? Math.sin(now / 60) * .004 : 0); t.v *= .955; t.a = Math.max(-.7, Math.min(.7, t.a + t.v));
      }
      const ex = now < t.until ? 'screech' : scared ? 'scared' : 'normal';
      if (PX) {
        const f = PXA.monkeyFrame('desk', ex, t.a, false, t.ph, hat ? 1 : 0);
        if (f !== t.frame) { PXA.blit(t.cv, f); t.cv.style.marginLeft = -(f.W * PXA.S / 2) + 'px'; t.frame = f; }
      } else {
        t.el.style.setProperty('--ang', t.a + 'rad');
        t.el.classList.toggle('rainy', !!hat); t.el.classList.toggle('scared', !!scared); t.el.classList.toggle('shout', ex === 'screech');
      }
    }
  }
  function loop(now) {
    if (ui.tab === 'floor' && typists.length && !IMI.reduceMotion) stepTypists(now);
    requestAnimationFrame(loop);
  }
  function animatePress(ch, auto, n) {
    if (ui.tab !== 'floor') return;
    const stage = $('#oStage'); if (!stage) return;
    IMI.sfx.key();
    const key = $(`.o-key[data-k="${ch}"]`, stage);
    if (key) { key.classList.add('down'); setTimeout(() => key.classList.remove('down'), 90); }
    const bars = $$('.o-bar', stage), bar = bars[ch.charCodeAt(0) % bars.length];
    bar.classList.add('hit'); setTimeout(() => bar.classList.remove('hit'), 70);
    const car = $('#oCar'), r = rt[S.sel]; r.col++;
    car.style.transform = `translateX(${-(r.col % 9) * 2}px)`;
    if (r.col % 9 === 0) { car.classList.remove('ding'); void car.offsetWidth; car.classList.add('ding'); }
    kick(!auto);
    if (auto && n % 6 === 0 && typists.length) { const t = typists[Math.floor(rand() * typists.length)], b = t.el.getBoundingClientRect(); IMI.fall(b.left + b.width / 2, b.bottom - 10, 'leaf', 1200); }
    const sheet = $('#oSheet'); if (sheet) sheet.textContent = r.sheet.slice(-48);
    const el = document.createElement('i'); el.className = 'o-pop'; el.textContent = ch;
    const slot = popSlot++ % 9;
    el.style.cssText = `left:${12 + slot * 9.5}%;top:${30 + (slot % 3) * 9}%;--pc:${POP_COLORS[popSlot % POP_COLORS.length]}`;
    el.addEventListener('animationend', () => el.remove());
    stage.appendChild(el);
    while ($$('.o-pop', stage).length > 14) $('.o-pop', stage).remove();
  }
  function renderFloorInfo() {
    const d = cur(), D = DESKS[S.sel]; if (!$('#oTray')) return;
    $('#oTray').innerHTML = d.tray.slice(-12).map(c => `<span class="o-tile">${c}</span>`).join('') || '<span class="o-dim">No letters yet. Tap the typewriter!</span>';
    $('#oStats').innerHTML = `<span><b>${totalLetters(d)}</b> letters</span><span><b>${d.paws}</b> typists</span><span><b>${autoRate(d).toFixed(2)}</b>/s auto</span>` +
      (S.hold ? `<span><b>${holdRate(d)}</b>/s held</span>` : '') + `<span class="o-dim">${D.lo}–${D.hi} letter words</span>` +
      (stormy() ? '<span class="o-warn">Storm! The typists are clinging to their vines (half speed).</span>' : '');
    $('#oGuide').textContent = !d.paws ? 'Nobody is typing yet. Collect a few letters by hand, then hire a first typist at Primate Resources.' : S.hold ? 'Hold a finger, the mouse, or Space on the machine to type fast. Spend letters at Primate Resources or turn them into words at Coconut R&D.'
      : 'Tap or click the typewriter (focus it and press Space too). Spend letters at Primate Resources or make words at Coconut R&D.';
    syncTypists();
  }

  /* ================= panes ================= */
  const pips = (n, max) => `<span class="o-pips">${Array.from({ length: Math.min(max, 12) }, (_, k) => `<i class="${k < n ? 'on' : ''}"></i>`).join('')}</span>`;
  const stat = (label, v) => `<span class="o-stat"><b>${v}</b> ${label}</span>`;

  function renderTraining() {
    const d = cur(), i = S.sel, have = totalLetters(d);
    $('#o-training').innerHTML = `
      <p class="o-lede">Primate Resources hires and trains the monkeys on <b>${esc(DESKS[i].name)}</b>. Training costs <b>letters from this desk</b> (the biggest piles go first). You hold ${have}.</p>
      <div class="o-grid">${UPS.map(u => {
        const lvl = u.k === 'paw' ? d.paws : d.up[u.k], max = upMax(u), lock = upLock(u, d), done = lvl >= max, cost = upCost(u, d, i);
        const first = u.k === 'paw' && i === 0 && d.paws === 0;
        return `<div class="o-card"><div class="o-row"><h3>${u.name}</h3><span class="o-lvl">${lvl}/${max}</span></div>
          ${pips(lvl, max)}<p>${u.desc}</p>${lock ? `<p class="o-warn">${lock}</p>` : ''}
          <button type="button" class="o-btn" data-act="up" data-k="${u.k}" ${done || lock || have < cost ? 'disabled' : ''}>${done ? 'Maxed' : `${first ? 'Hire first typist · ' : ''}${cost} letters`}</button></div>`;
      }).join('')}</div>`;
    hydrate($('#o-training'));
  }

  function renderLab(force) {
    const pane = $('#o-lab'); if (!force && pane.contains(document.activeElement) && document.activeElement.matches('input')) return;
    const d = cur(), i = S.sel, D = DESKS[i], f = focusRecipe(d);
    const q = ui.bankq.trim().toUpperCase(), needed = f ? f.need : {};
    let words = BAND_WORDS[i].map(w => ({ w, n: makeCopies(d, w) }));
    words = q ? words.filter(x => x.w.includes(q)) : words.filter(x => x.n > 0);
    words.sort((a, b) => ((stock(a.w) === 0) !== (stock(b.w) === 0) ? (stock(a.w) === 0 ? -1 : 1) : (needed[b.w] ? 1 : 0) - (needed[a.w] ? 1 : 0) || a.w.localeCompare(b.w)));
    const ownedBank = Object.keys(S.bank).sort((a, b) => a.length - b.length || a.localeCompare(b));
    pane.innerHTML = `
      <p class="o-lede">Coconut R&amp;D turns <b>${esc(D.name)}</b> letters into words. Any letters on this desk can combine; letters never move between desks, but finished words go to the shared bank.</p>
      <div class="o-card"><h3>Letters</h3>
        <div class="o-letters">${Object.keys(FREQ).sort().map(c => `<div class="o-lcell${d.letters[c] ? '' : ' zero'}"><b>${c}</b>${d.letters[c] || 0}</div>`).join('')}</div></div>
      <div class="o-card"><h3>Make a ${D.lo}–${D.hi} letter word</h3>
        <input class="o-search" id="oBankQ" placeholder="Search words…" value="${esc(ui.bankq)}" autocomplete="off" aria-label="Search words">
        <div class="o-words">${words.slice(0, 60).map(({ w, n }) => `<button type="button" class="o-word${!stock(w) ? ' new' : ''}${needed[w] && stock(w) < needed[w] ? ' need' : ''}" data-act="bankword" data-w="${w}" ${n > 0 ? '' : 'disabled'}><span>${w}</span><i>${n > 0 ? '×' + n : ''}${stock(w) ? ' · ' + stock(w) + ' banked' : ''}</i></button>`).join('') || '<p class="o-dim">No words can be made from these letters yet.</p>'}</div>
        <p class="o-dim">Green: never banked. Gold: needed by this desk’s focused title.</p></div>
      <div class="o-card"><h3>Shared word bank</h3>
        <div class="o-chips">${ownedBank.map(w => `<span class="o-chip b${bandOf(w.length)}">${w} ×${S.bank[w]}</span>`).join('') || '<span class="o-dim">Empty. Bank a word above.</span>'}</div></div>`;
    const inp = $('#oBankQ'); inp.addEventListener('input', () => { ui.bankq = inp.value; renderLab(true); const n = $('#oBankQ'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); });
  }

  function renderSecurity(force) {
    const pane = $('#o-security'); if (!force && pane.contains(document.activeElement) && document.activeElement.matches('input')) return;
    const d = cur(), D = DESKS[S.sel], k = d.keeper, f = focusRecipe(d), ovr = Object.entries(k.targets);
    pane.innerHTML = `
      <p class="o-lede">Canopy Security keeps a word keeper on each desk. A keeper turns its desk’s letters into shared word stock while you are away, up to the targets you set.</p>
      <div class="o-grid">
        <div class="o-card"><h3>${esc(D.name)} keeper</h3>${!k.owned ? `<p>A watchful clerk who banks words from this desk’s letters.</p>
          <button type="button" class="o-btn gold" data-act="buy" data-what="keeper" data-i="${S.sel}" ${bananas.get() < SHOP.keeper ? 'disabled' : ''}>Hire · ${price(SHOP.keeper)}</button>` : `
          <div class="o-row"><span>State</span><span class="o-seg"><button type="button" data-act="kon" aria-pressed="${k.on}">Collecting</button><button type="button" data-act="koff" aria-pressed="${!k.on}">Paused</button></span></div>
          <div class="o-row"><label for="oKdef">Default stack target (0–9999, 0 skips)</label><input class="o-num" id="oKdef" type="number" min="0" max="9999" value="${k.def}" data-in="kdef"></div>
          <p class="o-dim">Lowering a target keeps stock. Banking by hand can exceed it.</p>`}</div>
        ${k.owned ? `<div class="o-card"><h3>Title focus</h3><p>${f ? `Working on <b>${esc(f.title)}</b>. The keeper banks its words first and reserves incomplete ingredients; typists lean toward its letters.` : 'No title selected. Pick one from Vine Infrastructure.'}</p>
          ${f ? '<button type="button" class="o-btn" data-act="unfocus">Clear focus</button>' : `<button type="button" class="o-btn" data-act="go" data-tab="press">Choose a title</button>`}</div>
        <div class="o-card"><h3>Per-word targets</h3>
          <div class="o-chips">${ovr.map(([w, t]) => `<span class="o-chip">${w} → ${t} <button type="button" class="o-x" data-act="ovrdel" data-w="${w}" aria-label="Remove override for ${w}">×</button></span>`).join('') || '<span class="o-dim">No overrides.</span>'}</div>
          <div class="o-row o-left"><input class="o-num wide" id="oOvrW" placeholder="word" value="${esc(ui.ovr)}" autocomplete="off" data-in="ovrw" aria-label="Word"><input class="o-num" id="oOvrN" type="number" min="0" max="9999" value="${ui.ovrn}" data-in="ovrn" aria-label="Target"><button type="button" class="o-btn" data-act="ovrset">Set</button></div></div>` : ''}
      </div>
      <div class="o-card"><h3>All keepers</h3><div class="o-chips">${DESKS.map((X, n) => { const o = S.desks[n]; return `<span class="o-chip">${X.name}: ${!o.owned ? 'no machine' : !o.keeper.owned ? 'no keeper' : o.keeper.on ? 'collecting' : 'paused'}${o.keeper.owned && focusRecipe(o) ? ' · ' + esc(focusRecipe(o).title) : ''}</span>`; }).join('')}</div></div>`;
    hydrate(pane);
  }

  const chipsFor = r => Object.entries(r.need).sort((a, b) => a[0].length - b[0].length || a[0].localeCompare(b[0]))
    .map(([w, n]) => `<span class="o-chip b${bandOf(w.length)}${stock(w) >= n ? ' ok' : ''}">${w} ${Math.min(stock(w), n)}/${n}</span>`).join('');
  function renderPress(force) {
    const pane = $('#o-press'); if (!force && pane.contains(document.activeElement) && document.activeElement.matches('input')) return;
    const q = ui.libq.trim().toLowerCase();
    const list = RECIPES.filter(r => (!q || r.title.toLowerCase().includes(q)) &&
      (ui.libf === 'all' || (ui.libf === 'written' ? S.written[r.id] : ui.libf === 'ready' ? canWrite(r) : !S.written[r.id])));
    const written = Object.keys(S.written).length;
    pane.innerHTML = `
      <p class="o-lede">Vine Infrastructure carries finished titles to the Jungle Press. Write a title and its rights are sold <b>once</b>, for good. ${written}/${RECIPES.length} written. Each recipe is the exact word count of the short edition.</p>
      <input class="o-search" id="oLibQ" placeholder="Search titles…" value="${esc(ui.libq)}" autocomplete="off" aria-label="Search titles">
      <div class="o-filters"><span class="o-seg">${[['all', 'All'], ['open', 'To write'], ['ready', 'Ready'], ['written', 'Written']].map(([k, n]) => `<button type="button" data-act="libf" data-f="${k}" aria-pressed="${ui.libf === k}">${n}</button>`).join('')}</span></div>
      <div class="o-grid">${list.map(r => {
        const done = S.written[r.id], ready = canWrite(r), d = cur(), foc = DESKS.filter((_, i) => focusRecipe(S.desks[i])?.id === r.id).map(x => x.name);
        return `<div class="o-card o-book${done ? ' done' : ''}"><div class="o-row"><h3>${esc(r.title)}</h3><span class="o-tag b${r.band}">${DESKS[r.band].lo}–${DESKS[r.band].hi}</span></div>
          <p class="o-dim">${r.total} words · rights ${price(r.pay * (S.contracts ? 1.25 : 1))}${foc.length ? ' · focus: ' + foc.join(', ') : ''}</p>
          <div class="o-chips">${chipsFor(r)}</div>
          ${ui.read === r.id ? `<div class="o-read">${esc(r.text)}</div>` : ''}
          <div class="o-row"><button type="button" class="o-btn sm" data-act="read" data-id="${r.id}">${ui.read === r.id ? 'Close' : 'Read'}</button>
            ${done ? '<span class="o-lvl">WRITTEN &amp; SOLD</span>' : `<button type="button" class="o-btn sm" data-act="focus" data-id="${r.id}" ${d.keeper.owned && d.keeper.focus !== r.id ? '' : 'disabled'} title="${d.keeper.owned ? '' : 'Needs a word keeper on the selected desk'}">${d.keeper.focus === r.id ? 'Focused' : 'Focus'}</button>
            <button type="button" class="o-btn sm gold" data-act="write" data-id="${r.id}" ${ready ? '' : 'disabled'}>Write &amp; sell</button>`}</div></div>`;
      }).join('') || '<p class="o-dim">No titles match.</p>'}</div>
      <div class="o-card o-archive"><h3>The Archive</h3>
        <p class="o-dim" id="oArchNote">Loading the stacks…</p>
        <input class="o-search" id="oArchQ" placeholder="Search the complete manuscripts…" value="${esc(ui.archq)}" autocomplete="off" aria-label="Search the archive">
        <div class="o-filters" id="oArchF"></div><div class="o-grid" id="oArchRes"></div></div>`;
    $('#oLibQ').addEventListener('input', e => { ui.libq = e.target.value; renderPress(true); const n = $('#oLibQ'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); });
    $('#oArchQ').addEventListener('input', e => { ui.archq = e.target.value; renderArchive(); });
    hydrate(pane); renderArchive();
  }

  /* ---- archive: the 3,573 full manuscripts, locked until longer machines exist ---- */
  let archive = null, archiveLoading = false;
  const SHELVES = [['all', 'All'], ['stories', 'Stories'], ['songs', 'Songs'], ['tv-shows', 'TV'], ['radio-plays', 'Radio'], ['sketches', 'Sketches'], ['films', 'Films']];
  function loadArchive() {
    if (archive || archiveLoading) return; archiveLoading = true;
    Promise.all(['library/books.json', 'library/archives.json'].map(u => fetch(u).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })))
      .then(([books, arch]) => {
        archive = [...books.map(b => ({ shelf: 'stories', title: b.parody, sub: 'A parody of “' + b.original + '”', words: b.words })),
          ...arch.map(a => ({ shelf: a.archive, title: a.title, sub: a.target, words: a.words }))];
        if (ui.tab === 'press') renderArchive();
      })
      .catch(() => { archiveLoading = false; const n = $('#oArchNote'); if (n) n.textContent = 'The stacks are locked. Run node sync-library.mjs and serve the site over http.'; });
  }
  function renderArchive() {
    const note = $('#oArchNote'), res = $('#oArchRes'); if (!note || !res) return;
    if (!archive) { loadArchive(); return; }
    note.innerHTML = `${archive.length.toLocaleString()} complete manuscripts are catalogued. Their full-length recipes need longer machines, punctuation rules and a bigger vocabulary, so they stay locked for now. <a href="library.html">Read them in the Library</a>.`;
    $('#oArchF').innerHTML = `<span class="o-seg">${SHELVES.map(([k, n]) => `<button type="button" data-act="archf" data-f="${k}" aria-pressed="${ui.archf === k}">${n}</button>`).join('')}</span>`;
    const q = ui.archq.trim().toLowerCase();
    const hits = archive.filter(a => (ui.archf === 'all' || a.shelf === ui.archf) && (!q || (a.title + ' ' + a.sub).toLowerCase().includes(q)));
    res.innerHTML = hits.slice(0, 18).map(a => `<div class="o-card sub"><div class="o-row"><h3>${esc(a.title)}</h3><span class="o-tag">LOCKED</span></div><p class="o-dim">${esc(a.sub)} · ${a.words} words</p></div>`).join('') +
      (hits.length > 18 ? `<p class="o-dim">…and ${(hits.length - 18).toLocaleString()} more.</p>` : '') || '<p class="o-dim">Nothing matches.</p>';
  }

  function renderShop() {
    const blue = S.desks[2].owned, have = bananas.get();
    const item = (name, desc, cost, owned, lock, act, i) => `<div class="o-card"><div class="o-row"><h3>${name}</h3>${owned ? '<span class="o-lvl">OWNED</span>' : price(cost)}</div><p>${desc}</p>${lock && !owned ? `<p class="o-warn">${lock}</p>` : ''}
      ${owned ? '' : `<button type="button" class="o-btn gold" data-act="buy" data-what="${act}" ${i != null ? `data-i="${i}"` : ''} ${lock || have < cost ? 'disabled' : ''}>Buy</button>`}</div>`;
    $('#o-shop').innerHTML = `
      <p class="o-lede">Banana Logistics spends the bananas the Jungle Press pays you. Typewriters, keepers and room-wide upgrades are bought here.</p>
      <h3 class="o-h">Typewriters</h3><div class="o-grid">${DESKS.slice(1).map((D, n) => {
        const i = n + 1, d = S.desks[i];
        return item(D.name, `Specialises in ${D.lo}–${D.hi} letter words (${D.style} lettering). Starts with one typist.`, D.price, d.owned, !S.desks[i - 1].owned ? 'Buy ' + DESKS[i - 1].name + ' first' : '', 'desk', i);
      }).join('')}</div>
      <h3 class="o-h">Word keepers</h3><div class="o-grid">${DESKS.map((D, i) => S.desks[i].owned ? item(D.name + ' keeper', 'Banks words from this desk’s letters on its own, up to your targets.', SHOP.keeper, S.desks[i].keeper.owned, '', 'keeper', i) : '').join('')}</div>
      <h3 class="o-h">Room-wide upgrades</h3><div class="o-grid">
        ${item('Hold to type', 'Hold a finger, cursor or Space to type on every current and future machine.', SHOP.hold, S.hold, '', 'hold')}
        ${item('Paw metronome', 'Doubles every typist’s speed across the room.', SHOP.metro, S.metro, blue ? '' : 'Unlocks with Lagoon Sprint', 'metro')}
        ${item('Double touch', 'Doubles held typing speed across the room.', SHOP.dbl, S.dbl, !blue ? 'Unlocks with Lagoon Sprint' : !S.hold ? 'Needs Hold to type' : '', 'dbl')}
        ${item('Writing contracts', 'Adds 25% to future title rights income.', SHOP.contracts, S.contracts, blue ? '' : 'Unlocks with Lagoon Sprint', 'contracts')}
      </div>
      <p class="o-row o-left"><button type="button" class="o-btn sm" data-act="reset">Reset Typewriter Ops</button><span class="o-dim">Clears the floor, not your bananas.</span></p>`;
    hydrate($('#o-shop'));
  }

  const RENDER = { training: renderTraining, lab: renderLab, security: renderSecurity, press: renderPress, shop: renderShop };
  function renderChrome() {
    $('#oDesks').innerHTML = DESKS.map((D, i) => {
      const d = S.desks[i];
      if (!d.owned) return `<button type="button" class="o-desk locked" style="--tw:${D.color}" data-act="go" data-tab="shop"><b>${D.name}</b><span>${D.lo}–${D.hi} letters</span><span>${price(D.price)}</span></button>`;
      return `<button type="button" class="o-desk" style="--tw:${D.color}" data-act="sel" data-i="${i}" aria-pressed="${i === S.sel}"><b>${D.name}</b><span>${D.lo}–${D.hi} letters · ${totalLetters(d)} held</span><span>${d.paws} typists · ${autoRate(d).toFixed(2)}/s</span></button>`;
    }).join('');
    hydrate($('#oDesks'));
    $$('.o-tab').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === ui.tab)));
    $$('.o-pane').forEach(p => { p.hidden = p.id !== 'o-' + ui.tab; });
    const D = DESKS[S.sel];
    root.style.setProperty('--tw', D.color); root.style.setProperty('--tw-font', D.font);
  }
  function render() {
    renderChrome();
    if (ui.tab === 'floor') renderFloorInfo(); else RENDER[ui.tab]();
  }

  /* ================= wiring ================= */
  root.innerHTML = `<div class="o-wrap">
    <div class="o-desks" id="oDesks"></div>
    <div class="o-tabs" id="oTabs" role="tablist" aria-label="Departments">${TABS.map(([k, ic, name, sub]) => `<button type="button" role="tab" class="o-tab" data-tab="${k}"><span class="o-tabico">${ico(ic)}</span><span class="o-tabtxt"><b>${name}</b><small>${sub}</small></span></button>`).join('')}</div>
    <div class="o-panel">${TABS.map(([k]) => `<section class="o-pane" id="o-${k}" role="tabpanel" ${k === 'floor' ? '' : 'hidden'}></section>`).join('')}</div>
  </div>`;
  hydrate(root);

  function setTab(t) { ui.tab = t; if (t === 'floor') buildStage(); render(); }
  const tap = () => { press(S.sel, false); };
  root.addEventListener('pointerdown', e => {
    if (!e.target.closest('#oStage')) return;
    e.preventDefault(); $('#oStage').focus({ preventScroll: true }); tap(); if (S.hold) holding = true;
  });
  ['pointerup', 'pointercancel', 'blur'].forEach(ev => window.addEventListener(ev, () => { holding = false; }));
  root.addEventListener('keydown', e => {
    if (!e.target.closest('#oStage') || (e.code !== 'Space' && e.code !== 'Enter')) return;
    e.preventDefault(); if (e.repeat) return; tap(); if (S.hold) holding = true;
  });
  root.addEventListener('keyup', e => { if (e.code === 'Space' || e.code === 'Enter') holding = false; });

  const ACTIONS = {
    go: el => setTab(el.dataset.tab),
    sel: el => { S.sel = +el.dataset.i; if (ui.tab === 'floor') buildStage(); mark(); save(); },
    up: el => buyUp(el.dataset.k),
    bankword: el => { if (bankWord(cur(), el.dataset.w)) IMI.sfx.key(); },
    buy: el => buy(el.dataset.what, el.dataset.i),
    write: el => writeTitle(el.dataset.id, el),
    focus: el => { cur().keeper.focus = el.dataset.id; mark(); save(); },
    unfocus: () => { cur().keeper.focus = null; mark(); save(); },
    kon: () => { cur().keeper.on = true; mark(); save(); },
    koff: () => { cur().keeper.on = false; mark(); save(); },
    ovrset: () => {
      const w = ui.ovr.trim().toUpperCase();
      if (!VOCAB.has(w) || bandOf(w.length) !== S.sel) return IMI.say(`“${w || '…'}” isn’t a ${DESKS[S.sel].lo}–${DESKS[S.sel].hi} letter word here.`);
      cur().keeper.targets[w] = Math.max(0, Math.min(9999, ui.ovrn | 0)); ui.ovr = ''; mark(); save();
    },
    ovrdel: el => { delete cur().keeper.targets[el.dataset.w]; mark(); save(); },
    libf: el => { ui.libf = el.dataset.f; mark(); },
    archf: el => { ui.archf = el.dataset.f; renderArchive(); },
    read: el => { ui.read = ui.read === el.dataset.id ? null : el.dataset.id; mark(); },
    reset: () => { if (confirm('Reset Typewriter Ops? Your bananas are kept.')) { S = fresh(); save(); buildStage(); mark(); } }
  };
  root.addEventListener('click', e => {
    const tab = e.target.closest('.o-tab'); if (tab) return setTab(tab.dataset.tab);
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
  bananas.watch(b => { if (b !== lastBananas) { lastBananas = b; mark(); } });

  /* ================= main loop ================= */
  let last = performance.now(), keeperT = 0, saveT = 0, renderT = 0;
  function tick() {
    const now = performance.now(), dt = Math.min(0.25, (now - last) / 1000); last = now;
    S.desks.forEach((d, i) => {
      if (!d.owned || !d.paws) return;
      const T = rt[i].timers, secs = pawSecs(d);
      while (T.length < d.paws) T.push(rand() * secs);
      for (let p = 0; p < d.paws; p++) { T[p] -= dt; let guard = 0; while (T[p] <= 0 && guard++ < 8) { T[p] += secs; press(i, true); } }
    });
    if (holding && S.hold) { holdAcc += holdRate(cur()) * dt; let g = 0; while (holdAcc >= 1 && g++ < 12) { holdAcc -= 1; press(S.sel, false); } } else holdAcc = 0;
    keeperT += dt; if (keeperT >= 0.4) { keeperT = 0; S.desks.forEach((d, i) => d.owned && keeperStep(d, i)); }
    renderT += dt; if (renderT >= 0.25 && dirty) { renderT = 0; dirty = false; render(); }
    saveT += dt; if (saveT >= 5) { saveT = 0; save(); }
  }
  window.addEventListener('beforeunload', save);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); last = performance.now(); });
  if (typeof Weather !== 'undefined') Weather.on('change', () => mark());

  [...S.log].reverse().forEach(t => IMI.log(t));
  buildStage(); render();
  setInterval(tick, 50);
  requestAnimationFrame(loop);
})();

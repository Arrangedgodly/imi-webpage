/* The Writing Room — letters → words → written titles → money → more typewriters. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fmt = n => Math.round(n).toLocaleString('en-US');
  const money = n => '$' + fmt(n);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const rand = Math.random;
  const VOWELS = 'AEIOU';

  /* ================= static data ================= */
  const DESKS = [
    { id: 'mint',  name: 'Mint Classic', lo: 2, hi: 3, price: 0,      color: '#6fd6a8', font: "'Press Start 2P', monospace", style: 'Classic pixel' },
    { id: 'rose',  name: 'Rose Ribbon',  lo: 4, hi: 5, price: 2000,   color: '#ef8fa6', font: "'Pixelify Sans', monospace",  style: 'Soft pixel' },
    { id: 'blue',  name: 'Blue Sprint',  lo: 6, hi: 7, price: 25000,  color: '#6aa7ee', font: "'Silkscreen', monospace",     style: 'Narrow pixel' },
    { id: 'amber', name: 'Amber Ledger', lo: 8, hi: 9, price: 312500, color: '#f0b13c', font: "'Tiny5', monospace",          style: 'Slab pixel' }
  ];
  const bandOf = n => (n <= 3 ? 0 : n <= 5 ? 1 : n <= 7 ? 2 : 3);
  const SHOP = { keeper: 1000, hold: 500, metro: 3000, dbl: 2000, contracts: 10000 };
  const FREQ = { E: 12, T: 9, A: 8, O: 8, I: 7, N: 7, S: 6, H: 6, R: 6, D: 4, L: 4, C: 3, U: 3, M: 3, W: 2, F: 2, G: 2, Y: 2, P: 2, B: 1.5, V: 1, K: 1, J: .3, X: .3, Q: .2, Z: .2 };
  const POP_COLORS = ['#ff5d73', '#ffb627', '#3ddc97', '#4cc9f0', '#b388ff', '#ff8fab'];
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
    for (const w of tokens(r.text)) { need[w.toUpperCase()] = (need[w.toUpperCase()] || 0) + 1; max = Math.max(max, w.length); total++; }
    return { ...r, need, total, band: bandOf(max) };
  });
  const RBY = Object.fromEntries(RECIPES.map(r => [r.id, r]));
  const VOCAB = new Set(EXTRA_WORDS.map(w => w.toUpperCase()).filter(w => w.length >= 2 && w.length <= 9));
  RECIPES.forEach(r => Object.keys(r.need).forEach(w => VOCAB.add(w)));
  const BAND_WORDS = [[], [], [], []];
  [...VOCAB].sort().forEach(w => BAND_WORDS[bandOf(w.length)].push(w));
  const LCOUNT = new Map();
  const lcount = w => {
    let c = LCOUNT.get(w);
    if (!c) { c = {}; for (const ch of w) c[ch] = (c[ch] || 0) + 1; LCOUNT.set(w, c); }
    return c;
  };

  /* ================= state ================= */
  const KEY = 'imi-room-v1';
  const newDesk = i => ({
    owned: i === 0, paws: 0, letters: {}, tray: [],
    up: { fing: 0, rapid: 0, vowel: 0, ink: 0, practice: 0, stock: 0, ribbon: 0 },
    keeper: { owned: false, on: true, def: 3, targets: {}, focus: null }
  });
  const fresh = () => ({ money: 0, hold: false, metro: false, dbl: false, contracts: false, sound: true, sel: 0, written: {}, bank: {}, desks: DESKS.map((_, i) => newDesk(i)) });
  let S = (() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY));
      if (!saved) return fresh();
      const f = fresh(); Object.assign(f, saved);
      f.desks = DESKS.map((_, i) => { const d = newDesk(i), s = (saved.desks || [])[i] || {}; return { ...d, ...s, up: { ...d.up, ...s.up }, keeper: { ...d.keeper, ...s.keeper } }; });
      return f;
    } catch { return fresh(); }
  })();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* storage full or blocked */ } };
  const rt = DESKS.map(() => ({ timers: [], sheet: '', col: 0 }));   // runtime-only, never saved
  const ui = { tab: 'type', libq: '', libf: 'all', archq: '', archf: 'all', read: null, bankq: '', ovr: '', ovrn: 3 };
  let dirty = true, holding = false, holdAcc = 0, popSlot = 0;

  /* ================= helpers ================= */
  const cur = () => S.desks[S.sel];
  const stock = w => S.bank[w] || 0;
  const totalLetters = d => Object.values(d.letters).reduce((a, b) => a + b, 0);
  const target = (d, w) => (w in d.keeper.targets ? d.keeper.targets[w] : d.keeper.def);
  const pawSecs = d => 2 * Math.pow(0.85, d.up.fing) * (S.metro ? 0.5 : 1);
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

  /* ---- what a desk still needs for its focused recipe ---- */
  function focusNeeds(d, i) {
    const r = focusRecipe(d), required = {}, oneCopy = {};
    if (!r) return { required, missing: {}, oneCopy };
    for (const w in r.need) {
      if (bandOf(w.length) !== i) continue;
      const left = r.need[w] - stock(w);
      if (left <= 0) continue;
      const c = lcount(w);
      for (const ch in c) { required[ch] = (required[ch] || 0) + c[ch] * left; oneCopy[ch] = (oneCopy[ch] || 0) + c[ch]; }
    }
    const missing = {};
    for (const ch in required) { const m = required[ch] - (d.letters[ch] || 0); if (m > 0) missing[ch] = m; }
    return { required, missing, oneCopy };
  }
  /* letters that would finish a qualifying word with exactly one letter missing */
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
    rt[i].sheet = (rt[i].sheet + ch).slice(-120);
    if (i === S.sel) animatePress(ch, auto);
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
  function writeTitle(id) {
    const r = RBY[id]; if (!r || !canWrite(r)) return;
    for (const w in r.need) { S.bank[w] -= r.need[w]; if (S.bank[w] <= 0) delete S.bank[w]; }
    const pay = Math.round(r.pay * (S.contracts ? 1.25 : 1));
    S.money += pay; S.written[id] = true;
    S.desks.forEach(d => { if (d.keeper.focus === id) d.keeper.focus = null; });
    sfx('ding'); toast(`Rights sold: “${r.title}” ${money(pay)}`); mark(); save();
  }

  /* ================= upgrades (spend this desk's letters) ================= */
  const TIER = [1, 2.5, 6];
  const UPS = [
    { k: 'paw',      name: 'Monkey paw',   base: 25,  max: 12, desc: 'Adds another monkey that types a letter by itself every two seconds.' },
    { k: 'fing',     name: 'Quick fingers', base: 40, grow: 1.6, max: 10, desc: "Speeds up this desk's paws by about 18% per level." },
    { k: 'rapid',    name: 'Rapid touch',  base: 75,  grow: 1.7, max: 8, desc: 'Held typing here gains +2 letters per second per level.', needs: 'hold' },
    { k: 'vowel',    name: 'Vowel rhythm', base: 30,  tier: 1, desc: 'After a consonant, a vowel comes up 45%, 65%, then 80% of the time.' },
    { k: 'ink',      name: 'Fresh ink',    base: 40,  tier: 1, desc: 'Weights 25%, 45%, then 65% toward the letter that finishes a word you have never banked.' },
    { k: 'practice', name: 'Recipe practice', base: 100, tier: 1, keeper: 1, desc: 'Paws chase the focused recipe harder: 75%, 85%, then 95% (base 65%).' },
    { k: 'stock',    name: 'Stock-aware ink', base: 80, tier: 1, keeper: 1, desc: 'Weights 20%, 40%, then 60% toward words below the keeper’s targets, duplicates included.' },
    { k: 'ribbon',   name: 'Spare ribbon', base: 150, tier: 1, keeper: 1, desc: 'Each paw press has a 10%, 20%, then 30% chance to swap a surplus letter for a missing recipe ingredient.' }
  ];
  const upLevel = (u, d, i) => (u.k === 'paw' ? Math.max(0, d.paws - (i ? 1 : 0)) : d.up[u.k]);
  const upMax = (u, d, i) => (u.k === 'paw' ? u.max - 0 : u.tier ? 3 : u.max);
  const upCost = (u, d, i) => { const l = upLevel(u, d, i); return Math.round(u.tier ? u.base * TIER[l] : u.base * Math.pow(u.grow || 1.7, l)); };
  function upLock(u, d) {
    if (u.needs === 'hold' && !S.hold) return 'Needs Hold to type (Shop)';
    if (u.keeper && !d.keeper.owned) return 'Needs this desk’s word keeper';
    return '';
  }
  function buyUp(k) {
    const i = S.sel, d = cur(), u = UPS.find(x => x.k === k); if (!u) return;
    const lvl = u.k === 'paw' ? d.paws : d.up[u.k], max = u.k === 'paw' ? u.max : upMax(u, d, i);
    if (lvl >= max || upLock(u, d)) return;
    const cost = upCost(u, d, i); if (totalLetters(d) < cost) return;
    let left = cost;                                    // spend from the biggest piles first
    while (left-- > 0) { const top = Object.keys(d.letters).sort((a, b) => d.letters[b] - d.letters[a])[0]; takeLetter(d, top); }
    if (u.k === 'paw') d.paws++; else d.up[u.k]++;
    sfx('ding'); mark(); save();
  }

  /* ================= shop ================= */
  function buy(what, arg) {
    const i = +arg;
    if (what === 'desk') {
      const d = S.desks[i], p = DESKS[i].price;
      if (d.owned || S.money < p || !S.desks[i - 1]?.owned) return;
      S.money -= p; d.owned = true; d.paws = 1; S.sel = i; buildStage();
    } else if (what === 'keeper') {
      const d = S.desks[i]; if (!d.owned || d.keeper.owned || S.money < SHOP.keeper) return;
      S.money -= SHOP.keeper; d.keeper.owned = true;
    } else if (SHOP[what] && !S[what] && S.money >= SHOP[what]) {
      if (what === 'dbl' && !S.hold) return;
      if ((what === 'metro' || what === 'dbl' || what === 'contracts') && !S.desks[2].owned) return;
      S.money -= SHOP[what]; S[what] = true;
    } else return;
    sfx('ding'); mark(); save();
  }

  /* ================= sound / toast ================= */
  let actx = null;
  function sfx(kind) {
    if (!S.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const t = actx.currentTime, o = actx.createOscillator(), g = actx.createGain();
      o.type = kind === 'ding' ? 'triangle' : 'square';
      o.frequency.setValueAtTime(kind === 'ding' ? 1320 : 150 + rand() * 70, t);
      if (kind !== 'ding') o.frequency.exponentialRampToValueAtTime(60, t + .05);
      g.gain.setValueAtTime(kind === 'ding' ? .06 : .035, t);
      g.gain.exponentialRampToValueAtTime(.0001, t + (kind === 'ding' ? .35 : .06));
      o.connect(g).connect(actx.destination); o.start(t); o.stop(t + .4);
    } catch { /* audio unavailable */ }
  }
  let toastT;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600);
  }

  /* ================= typewriter stage ================= */
  const ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
  const PAW_SLOTS = [[7, 60], [93, 60], [20, 74], [80, 74], [33, 52], [67, 52], [13, 88], [87, 88]];
  const PAW_SVG = '<svg viewBox="0 0 11 10"><path fill="#5a3822" d="M1 4h2V1h1v3h1V0h1v4h1V1h1v3h2v5H1z"/><path fill="#8a5a3a" d="M2 4h1V2h1v2h1V1h1v3h1V2h1v2h1v4H2z"/><path fill="#e6a99a" d="M4 6h3v2H4z"/></svg>';
  function buildStage() {
    const i = S.sel, D = DESKS[i], d = cur();
    const pane = $('#pane-type');
    pane.style.setProperty('--c', D.color); pane.style.setProperty('--tw-font', D.font);
    pane.innerHTML = `
      <div class="stage" id="stage" aria-label="Typewriter. Tap or click to type.">
        <div class="tw" id="tw">
          <div class="sheet-wrap"><div class="sheet" id="sheet"></div></div>
          <div class="carriage" id="carriage"></div>
          <div class="bars" id="bars">${Array.from({ length: 9 }, (_, n) => `<div class="bar" style="--a:${-48 + n * 12}deg"></div>`).join('')}</div>
          <div class="body" data-name="${esc(D.name.toUpperCase())}">
            <div class="kbd">${ROWS.map(r => `<div class="krow">${[...r].map(c => `<div class="key" data-k="${c}">${c}</div>`).join('')}</div>`).join('')}
              <div class="krow"><div class="key space" data-k=" "></div></div></div>
          </div>
          <div class="paws" id="paws"></div>
        </div>
      </div>
      <div class="type-info">
        <div class="tray" id="tray" aria-label="Recent letters"></div>
        <div class="stats" id="tstats"></div>
        <div class="guide" id="guide"></div>
      </div>`;
    syncPaws();
    rt[i].col = 0; $('#sheet').textContent = rt[i].sheet.slice(-48);
  }
  function syncPaws() {
    const box = $('#paws'); if (!box) return;
    const n = Math.min(cur().paws, PAW_SLOTS.length);
    if (box.children.length === n) return;
    box.innerHTML = PAW_SLOTS.slice(0, n).map(([x, y]) => `<div class="paw" style="left:calc(${x}% - 17px);top:${y}%">${PAW_SVG}</div>`).join('');
  }
  function animatePress(ch, auto) {
    if (ui.tab !== 'type') return;
    const stage = $('#stage'); if (!stage) return;
    sfx('key');
    const key = $(`.key[data-k="${ch}"]`, stage);
    if (key) { key.classList.add('down'); setTimeout(() => key.classList.remove('down'), 90); }
    const bars = $$('.bar', stage), bar = bars[ch.charCodeAt(0) % bars.length];
    bar.classList.add('hit'); setTimeout(() => bar.classList.remove('hit'), 70);
    const car = $('#carriage'), r = rt[S.sel]; r.col++;
    car.style.transform = `translateX(${-(r.col % 9) * 2}px)`;
    if (r.col % 9 === 0) { car.classList.remove('ding'); void car.offsetWidth; car.classList.add('ding'); }
    if (auto) {
      const paws = $$('.paw', stage);
      if (paws.length) { const p = paws[Math.floor(rand() * paws.length)]; p.classList.add('press'); setTimeout(() => p.classList.remove('press'), 110); }
    }
    const sheet = $('#sheet'); if (sheet) sheet.textContent = r.sheet.slice(-48);
    const el = document.createElement('div'); el.className = 'pop'; el.textContent = ch;
    const slot = popSlot++ % 9;
    el.style.cssText = `left:${12 + slot * 9.5}%;top:${6 + (slot % 3) * 12}%;--pc:${POP_COLORS[popSlot % POP_COLORS.length]}`;
    el.addEventListener('animationend', () => el.remove());
    stage.appendChild(el);
    while ($$('.pop', stage).length > 14) $('.pop', stage).remove();
  }
  function renderTypeInfo() {
    const d = cur(), D = DESKS[S.sel]; if (!$('#tray')) return;
    $('#tray').innerHTML = d.tray.slice(-12).map(c => `<span class="tile">${c}</span>`).join('') || '<span class="dim">No letters yet. Tap the typewriter!</span>';
    $('#tstats').innerHTML = `<span><b>${totalLetters(d)}</b> letters</span><span><b>${d.paws}</b> paws</span><span><b>${autoRate(d).toFixed(2)}</b>/s auto</span>` +
      (S.hold ? `<span><b>${holdRate(d)}</b>/s held</span>` : '') + `<span class="dim">words ${D.lo}–${D.hi} letters</span>`;
    $('#guide').textContent = S.hold ? 'Hold a finger, the mouse, or Space to type fast. Spend letters in Upgrades or turn them into words in Bank.'
      : 'Tap or click the typewriter (Space works too). Collect letters, then spend them in Upgrades or make words in Bank.';
    syncPaws();
  }

  /* ================= rendering: shared chrome ================= */
  function renderHud() {
    $('#money').textContent = money(S.money);
    const n = Object.keys(S.written).length;
    $('#hudMid').textContent = `Titles written ${n}/${RECIPES.length}`;
    $('#soundBtn').setAttribute('aria-pressed', String(S.sound));
  }
  function renderRoom() {
    $('#room').innerHTML = DESKS.map((D, i) => {
      const d = S.desks[i];
      if (!d.owned) return `<button type="button" class="desk locked" style="--c:${D.color}" data-act="tab" data-tab="shop" title="Buy in the Shop"><b>${D.name}</b><span>${D.lo}–${D.hi} letters</span><span>${money(D.price)}</span></button>`;
      return `<button type="button" class="desk" style="--c:${D.color}" data-act="sel" data-i="${i}" aria-pressed="${i === S.sel}"><b>${D.name}</b><span>${D.lo}–${D.hi} letters · ${totalLetters(d)} held</span><span>${d.paws} paws · ${autoRate(d).toFixed(2)}/s</span></button>`;
    }).join('');
  }
  function renderTabs() {
    $$('#tabs button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === ui.tab)));
    $$('.pane').forEach(p => { p.hidden = p.id !== 'pane-' + ui.tab; });
    const D = DESKS[S.sel];
    document.documentElement.style.setProperty('--c', D.color);
    document.documentElement.style.setProperty('--tw-font', D.font);
  }

  /* ================= rendering: panes ================= */
  const pips = (n, max) => `<span class="pips">${Array.from({ length: Math.min(max, 12) }, (_, k) => `<i class="pip${k < n ? ' on' : ''}"></i>`).join('')}</span>`;

  function renderUpgrades() {
    const d = cur(), i = S.sel, have = totalLetters(d);
    $('#pane-upgrades').innerHTML = `
      <div class="section"><h2>${DESKS[i].name} upgrades</h2>
        <p class="dim">These cost <b>letters from this desk</b> (taken from your biggest piles). You hold ${have}.</p></div>
      <div class="grid">${UPS.map(u => {
        const lvl = u.k === 'paw' ? d.paws : d.up[u.k], max = u.k === 'paw' ? u.max : upMax(u, d, i);
        const lock = upLock(u, d), done = lvl >= max, cost = upCost(u, d, i);
        const first = u.k === 'paw' && i === 0 && d.paws === 0;
        return `<div class="card px"><div class="row"><h3>${u.name}</h3><span class="lvl">${lvl}/${max}</span></div>
          ${pips(lvl, max)}<p>${u.desc}</p>${lock ? `<p class="note">${lock}</p>` : ''}
          <button type="button" class="btn" data-act="up" data-k="${u.k}" ${done || lock || have < cost ? 'disabled' : ''}>${done ? 'Maxed' : `${first ? 'Hire first paw · ' : ''}${cost} letters`}</button></div>`;
      }).join('')}</div>`;
  }

  function renderBank(force) {
    const pane = $('#pane-bank'); if (!force && pane.contains(document.activeElement) && document.activeElement.matches('input')) return;
    const d = cur(), i = S.sel, D = DESKS[i], k = d.keeper, f = focusRecipe(d);
    const q = ui.bankq.trim().toUpperCase();
    const needed = f ? f.need : {};
    let words = BAND_WORDS[i].map(w => ({ w, n: makeCopies(d, w) }));
    words = q ? words.filter(x => x.w.includes(q)) : words.filter(x => x.n > 0);
    words.sort((a, b) => ((stock(a.w) === 0) !== (stock(b.w) === 0) ? (stock(a.w) === 0 ? -1 : 1) : (needed[b.w] ? 1 : 0) - (needed[a.w] ? 1 : 0) || a.w.localeCompare(b.w)));
    const letterKeys = Object.keys(FREQ).sort();
    const ownedBank = Object.keys(S.bank).sort((a, b) => a.length - b.length || a.localeCompare(b));
    const ovr = Object.entries(k.targets);
    pane.innerHTML = `
      <div class="section"><h2>${D.name} letters</h2>
        <div class="lettergrid">${letterKeys.map(c => `<div class="lcell${d.letters[c] ? '' : ' zero'}"><b>${c}</b>${d.letters[c] || 0}</div>`).join('')}</div></div>
      <div class="section"><h2>Make a word (${D.lo}–${D.hi} letters)</h2>
        <input class="search" id="bankq" placeholder="Search words…" value="${esc(ui.bankq)}" autocomplete="off" aria-label="Search words">
        <div class="wordlist">${words.slice(0, 60).map(({ w, n }) => `<button type="button" class="wbtn${!stock(w) ? ' new' : ''}${needed[w] && stock(w) < needed[w] ? ' need' : ''}" data-act="bankword" data-w="${w}" ${n > 0 ? '' : 'disabled'}><span>${w}</span><i>${n > 0 ? '×' + n : ''}${stock(w) ? ' · ' + stock(w) + ' in bank' : ''}</i></button>`).join('') || '<p class="empty">No words can be made from these letters yet.</p>'}</div>
        <p class="dim">Green = a word you have not banked yet. Gold = needed by the focused recipe. Any letters in this desk can combine; letters never move between desks.</p></div>
      <div class="section"><h2>Shared word bank</h2>
        <div class="chips">${ownedBank.map(w => `<span class="chip b${bandOf(w.length)}">${w} ×${S.bank[w]}</span>`).join('') || '<span class="dim">Empty. Bank a word above.</span>'}</div></div>
      <div class="section"><h2>${D.name} word keeper</h2>${!k.owned ? `<div class="card px"><p>Automatically banks words from this desk’s letters. Buy it in the Shop for ${money(SHOP.keeper)}.</p><button type="button" class="btn" data-act="tab" data-tab="shop">Go to Shop</button></div>` : `
        <div class="card px keeperbox">
          <div class="row"><span>State</span><span class="seg"><button type="button" data-act="kon" aria-pressed="${k.on}">Collecting</button><button type="button" data-act="koff" aria-pressed="${!k.on}">Paused</button></span></div>
          <div class="row"><label for="kdef">Default stack target (0–9999; 0 skips)</label><input class="numin" id="kdef" type="number" min="0" max="9999" value="${k.def}" data-in="kdef"></div>
          <div><span class="dim">Per-word overrides</span>
            <div class="ovr">${ovr.map(([w, t]) => `<span class="chip">${w} → ${t} <button type="button" class="btn sm alt" data-act="ovrdel" data-w="${w}" aria-label="Remove override for ${w}">×</button></span>`).join('') || '<span class="dim">None.</span>'}</div>
            <div class="row" style="justify-content:flex-start;margin-top:6px"><input class="numin" style="width:120px" id="ovrw" placeholder="word" value="${esc(ui.ovr)}" autocomplete="off" data-in="ovrw"><input class="numin" id="ovrn" type="number" min="0" max="9999" value="${ui.ovrn}" data-in="ovrn"><button type="button" class="btn sm" data-act="ovrset">Set</button></div></div>
          <div class="row"><span>Recipe focus: <b>${f ? esc(f.title) : 'none'}</b></span>${f ? '<button type="button" class="btn sm alt" data-act="unfocus">Clear</button>' : '<span class="dim">Choose one in Library</span>'}</div>
          <p class="dim">Lowering a target keeps existing stock. Manual banking can exceed targets.</p>
        </div>`}</div>`;
    const inp = $('#bankq'); if (inp) inp.addEventListener('input', () => { ui.bankq = inp.value; renderBank(true); const n = $('#bankq'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); });
  }

  const chipsFor = r => Object.entries(r.need).sort((a, b) => a[0].length - b[0].length || a[0].localeCompare(b[0]))
    .map(([w, n]) => `<span class="chip b${bandOf(w.length)}${stock(w) >= n ? ' ok' : ''}">${w} ${Math.min(stock(w), n)}/${n}</span>`).join('');
  function renderLibrary(force) {
    const pane = $('#pane-library'); if (!force && pane.contains(document.activeElement) && document.activeElement.matches('input')) return;
    const q = ui.libq.trim().toLowerCase();
    let list = RECIPES.filter(r => (!q || r.title.toLowerCase().includes(q)) &&
      (ui.libf === 'all' || (ui.libf === 'written' ? S.written[r.id] : ui.libf === 'ready' ? canWrite(r) : !S.written[r.id])));
    const written = Object.keys(S.written).length;
    pane.innerHTML = `
      <div class="section"><h2>Library</h2>
        <p class="dim">Write a title once and its rights are sold for good. ${written}/${RECIPES.length} written. Each recipe is the exact word count of the short edition.</p>
        <input class="search" id="libq" placeholder="Search titles…" value="${esc(ui.libq)}" autocomplete="off" aria-label="Search titles">
        <div class="filters"><span class="seg">${[['all', 'All'], ['open', 'To write'], ['ready', 'Ready'], ['written', 'Written']].map(([k, n]) => `<button type="button" data-act="libf" data-f="${k}" aria-pressed="${ui.libf === k}">${n}</button>`).join('')}</span></div>
        <div class="grid">${list.map(r => {
          const done = S.written[r.id], ready = canWrite(r), d = cur(), foc = DESKS.filter((_, i) => S.desks[i].keeper.focus === r.id).map(x => x.name);
          return `<div class="card px book${done ? ' done' : ''}"><div class="row"><span class="name">${esc(r.title)}</span><span class="tag" style="--bc:var(--${['mint', 'rose', 'blue', 'amber'][r.band]})">${DESKS[r.band].lo}–${DESKS[r.band].hi}</span></div>
            <p class="dim">${r.total} words · rights ${money(r.pay * (S.contracts ? 1.25 : 1))}${foc.length ? ' · focus: ' + foc.join(', ') : ''}</p>
            <div class="chips">${chipsFor(r)}</div>
            ${ui.read === r.id ? `<div class="read">${esc(r.text)}</div>` : ''}
            <div class="row"><button type="button" class="btn sm alt" data-act="read" data-id="${r.id}">${ui.read === r.id ? 'Close' : 'Read'}</button>
              ${done ? '<span class="lvl">WRITTEN & SOLD</span>' : `<button type="button" class="btn sm alt" data-act="focus" data-id="${r.id}" ${d.keeper.owned && !(d.keeper.focus === r.id) ? '' : 'disabled'} title="${d.keeper.owned ? '' : 'Needs a word keeper on the selected desk'}">${d.keeper.focus === r.id ? 'Focused' : 'Focus'}</button>
              <button type="button" class="btn sm" data-act="write" data-id="${r.id}" ${ready ? '' : 'disabled'}>Write & sell</button>`}</div></div>`;
        }).join('') || '<p class="empty">No titles match.</p>'}</div></div>
      <div class="section"><h2>The Archive</h2>
        <p class="dim" id="archnote">Loading the stacks…</p>
        <input class="search" id="archq" placeholder="Search the complete manuscripts…" value="${esc(ui.archq)}" autocomplete="off" aria-label="Search the archive">
        <div class="filters" id="archf"></div>
        <div class="grid" id="archres"></div></div>`;
    const inp = $('#libq'); inp.addEventListener('input', () => { ui.libq = inp.value; renderLibrary(true); const n = $('#libq'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); });
    const aq = $('#archq'); aq.addEventListener('input', () => { ui.archq = aq.value; renderArchive(); });
    renderArchive();
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
        if (ui.tab === 'library') renderArchive();
      })
      .catch(() => { archiveLoading = false; const n = $('#archnote'); if (n) n.textContent = 'The stacks are locked. Run node sync-library.mjs and serve the site over http.'; });
  }
  function renderArchive() {
    const note = $('#archnote'), res = $('#archres'); if (!note || !res) return;
    if (!archive) { loadArchive(); return; }
    note.innerHTML = `${archive.length.toLocaleString()} complete manuscripts are catalogued. Their full-length recipes need longer machines, punctuation rules and a bigger vocabulary — locked for now. <a href="library.html">Read them in the Library</a>.`;
    $('#archf').innerHTML = `<span class="seg">${SHELVES.map(([k, n]) => `<button type="button" data-act="archf" data-f="${k}" aria-pressed="${ui.archf === k}">${n}</button>`).join('')}</span>`;
    const q = ui.archq.trim().toLowerCase();
    const hits = archive.filter(a => (ui.archf === 'all' || a.shelf === ui.archf) && (!q || (a.title + ' ' + a.sub).toLowerCase().includes(q)));
    res.innerHTML = hits.slice(0, 24).map(a => `<div class="card px"><div class="row"><span class="name" style="font-size:10px;font-family:var(--font-px);line-height:1.5">${esc(a.title)}</span><span class="tag">LOCKED</span></div><p class="dim">${esc(a.sub)} · ${a.words} words</p></div>`).join('') +
      (hits.length > 24 ? `<p class="dim">…and ${(hits.length - 24).toLocaleString()} more.</p>` : '') || '<p class="empty">Nothing matches.</p>';
  }

  function renderShop() {
    const blue = S.desks[2].owned;
    const item = (name, desc, price, owned, lock, act, extra = '') => `<div class="card px"><div class="row"><h3>${name}</h3><span>${owned ? '<span class="lvl">OWNED</span>' : money(price)}</span></div><p>${desc}</p>${lock ? `<p class="note">${lock}</p>` : ''}
      ${owned ? '' : `<button type="button" class="btn" ${extra} data-act="buy" data-what="${act}" ${lock || S.money < price ? 'disabled' : ''}>Buy</button>`}</div>`;
    $('#pane-shop').innerHTML = `
      <div class="section"><h2>Typewriters</h2><div class="grid">${DESKS.slice(1).map((D, n) => {
        const i = n + 1, d = S.desks[i], lock = !S.desks[i - 1].owned ? 'Buy ' + DESKS[i - 1].name + ' first' : '';
        return `<div class="card px" style="--c:${D.color}"><div class="row"><h3>${D.name}</h3><span>${d.owned ? '<span class="lvl">OWNED</span>' : money(D.price)}</span></div>
          <p>Specialises in ${D.lo}–${D.hi} letter words (${D.style}). Starts with one paw.</p>${lock && !d.owned ? `<p class="note">${lock}</p>` : ''}
          ${d.owned ? '' : `<button type="button" class="btn" data-act="buy" data-what="desk" data-i="${i}" ${lock || S.money < D.price ? 'disabled' : ''}>Buy</button>`}</div>`;
      }).join('')}</div></div>
      <div class="section"><h2>Word keepers</h2><div class="grid">${DESKS.map((D, i) => {
        const d = S.desks[i]; if (!d.owned) return '';
        return `<div class="card px" style="--c:${D.color}"><div class="row"><h3>${D.name} keeper</h3><span>${d.keeper.owned ? '<span class="lvl">OWNED</span>' : money(SHOP.keeper)}</span></div><p>Banks words from this desk’s letters on its own, up to your targets.</p>
          ${d.keeper.owned ? '' : `<button type="button" class="btn" data-act="buy" data-what="keeper" data-i="${i}" ${S.money < SHOP.keeper ? 'disabled' : ''}>Buy</button>`}</div>`;
      }).join('')}</div></div>
      <div class="section"><h2>Permanent upgrades</h2><div class="grid">
        ${item('Hold to type', 'Hold a finger, cursor or Space to type on every current and future machine.', SHOP.hold, S.hold, '', 'hold')}
        ${item('Paw metronome', 'Doubles every paw’s speed across the room.', SHOP.metro, S.metro, blue ? '' : 'Unlocks with Blue Sprint', 'metro')}
        ${item('Double touch', 'Doubles held typing speed across the room.', SHOP.dbl, S.dbl, !blue ? 'Unlocks with Blue Sprint' : !S.hold ? 'Needs Hold to type' : '', 'dbl')}
        ${item('Writing contracts', 'Adds 25% to future title rights income.', SHOP.contracts, S.contracts, blue ? '' : 'Unlocks with Blue Sprint', 'contracts')}
      </div></div>
      <div class="section"><button type="button" class="btn alt sm" data-act="reset">Reset all progress</button></div>`;
  }

  const RENDER = { upgrades: renderUpgrades, bank: renderBank, library: renderLibrary, shop: renderShop };
  function render() {
    renderHud(); renderRoom(); renderTabs();
    if (ui.tab === 'type') renderTypeInfo(); else RENDER[ui.tab]();
  }

  /* ================= input ================= */
  function setTab(t) { ui.tab = t; if (t === 'type') buildStage(); render(); }
  function tapType() { press(S.sel, false); }
  document.addEventListener('pointerdown', e => {
    if (!e.target.closest('#stage')) return;
    e.preventDefault(); tapType(); if (S.hold) holding = true;
  });
  ['pointerup', 'pointercancel', 'blur'].forEach(ev => window.addEventListener(ev, () => { holding = false; }));
  document.addEventListener('keydown', e => {
    if (e.code !== 'Space' || e.target.closest('input,button,select,a,textarea') || ui.tab !== 'type') return;
    e.preventDefault(); if (e.repeat) return; tapType(); if (S.hold) holding = true;
  });
  document.addEventListener('keyup', e => { if (e.code === 'Space') holding = false; });

  const ACTIONS = {
    tab: el => setTab(el.dataset.tab),
    sel: el => { S.sel = +el.dataset.i; if (ui.tab === 'type') buildStage(); mark(); save(); },
    up: el => buyUp(el.dataset.k),
    bankword: el => { if (bankWord(cur(), el.dataset.w)) sfx('key'); },
    buy: el => buy(el.dataset.what, el.dataset.i),
    write: el => writeTitle(el.dataset.id),
    focus: el => { cur().keeper.focus = el.dataset.id; mark(); save(); },
    unfocus: () => { cur().keeper.focus = null; mark(); save(); },
    kon: () => { cur().keeper.on = true; mark(); save(); },
    koff: () => { cur().keeper.on = false; mark(); save(); },
    ovrset: () => {
      const w = ui.ovr.trim().toUpperCase();
      if (!VOCAB.has(w) || bandOf(w.length) !== S.sel) return toast(`“${w || '…'}” isn’t a ${DESKS[S.sel].lo}–${DESKS[S.sel].hi} letter word in the vocabulary`);
      cur().keeper.targets[w] = Math.max(0, Math.min(9999, ui.ovrn | 0)); ui.ovr = ''; mark(); save();
    },
    ovrdel: el => { delete cur().keeper.targets[el.dataset.w]; mark(); save(); },
    libf: el => { ui.libf = el.dataset.f; mark(); },
    archf: el => { ui.archf = el.dataset.f; renderArchive(); },
    read: el => { ui.read = ui.read === el.dataset.id ? null : el.dataset.id; mark(); },
    reset: () => { if (confirm('Reset the whole writing room?')) { S = fresh(); localStorage.removeItem(KEY); buildStage(); mark(); } }
  };
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-act]'); if (!el || el.disabled) return;
    ACTIONS[el.dataset.act]?.(el);
  });
  document.addEventListener('change', e => {
    const el = e.target.closest('[data-in]'); if (!el) return;
    if (el.dataset.in === 'kdef') { cur().keeper.def = Math.max(0, Math.min(9999, el.value | 0)); save(); mark(); }
  });
  document.addEventListener('input', e => {
    const el = e.target.closest('[data-in]'); if (!el) return;
    if (el.dataset.in === 'ovrw') ui.ovr = el.value; else if (el.dataset.in === 'ovrn') ui.ovrn = el.value | 0;
  });
  $('#tabs').addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (b) setTab(b.dataset.tab); });
  $('#soundBtn').addEventListener('click', () => { S.sound = !S.sound; save(); mark(); });

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

  buildStage(); render();
  setInterval(tick, 50);
})();

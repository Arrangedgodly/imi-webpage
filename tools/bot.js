/* A simple player bot for the balance harness. It is deliberately competent but not perfect:
   it sells titles as soon as they are ready, focuses keepers on the cheapest remaining title, spends letters on training,
   spends bananas in a fixed priority order, and (in the "active" profile) taps the typewriter for the first few hours. */
(function () {
  const D = IMI.ops.dev, bn = IMI.bananas;
  const bandOf = n => (n <= 3 ? 0 : n <= 5 ? 1 : n <= 7 ? 2 : n <= 9 ? 3 : n <= 11 ? 4 : 5);
  const st = { t0: null, marks: [], seen: {}, samples: [], sec: 0, opts: {} };
  const S = () => D.S();
  const topBand = () => S().desks.reduce((m, d, i) => (d.owned ? i : m), 0);
  const mark = k => { if (!st.seen[k]) { st.seen[k] = true; st.marks.push([k, Math.round(st.sec / 6) / 10]); } };   // minutes, 1 decimal
  const deficit = r => Object.entries(r.need).reduce((a, [w, n]) => a + Math.max(0, n - D.stock(w)) * w.length, 0);

  function chooseTarget() {
    let best = null, bs = -1;
    for (const r of D.RECIPES) {
      if (S().written[r.id] || r.band > topBand()) continue;
      const sc = r.pay / (1 + deficit(r)); if (sc > bs) { bs = sc; best = r; }
    }
    return best;
  }
  function manualBank(target) {
    if (!target) return;
    for (const [w, n] of Object.entries(target.need)) {
      if (D.stock(w) >= n) continue;
      const d = S().desks[bandOf(w.length)]; if (!d || !d.owned) continue;
      while (D.stock(w) < n && D.makeCopies(d, w) > 0) D.bankWord(d, w);
    }
  }
  function trainDesk(i) {
    const d = S().desks[i]; if (!d.owned) return;
    const order = ['paw', 'fing', 'vowel', 'ink', 'paw', 'fing', 'practice', 'stock', 'ribbon', 'paw', 'fing', 'rapid'];
    const want = [4, 3, 1, 1, 8, 6, 1, 1, 1, 12, 10, 2];
    const prev = D.ui.buyN; D.ui.buyN = 1;
    for (const [k, key] of order.map((key, n) => [n, key])) {
      const u = D.UPS.find(x => x.k === key), lvl = key === 'paw' ? d.paws : d.up[key];
      if (lvl >= want[k] || D.upLock(u, d)) continue;
      const plan = D.upPlan(u, d, i, 1);
      if (D.totalLetters(d) >= plan.cost + 20) { const sel = S().sel; S().sel = i; D.buyUp(key); S().sel = sel; }
      break;                                                       // one purchase per desk per second, in priority order
    }
    D.ui.buyN = prev;
  }
  function shop() {
    const s = S(), have = bn.get(), nextDesk = s.desks.findIndex(d => !d.owned), price = nextDesk >= 0 ? D.DESKS[nextDesk].price : Infinity;
    if (!s.hold && have >= D.SHOP.hold) D.buy('hold');
    s.desks.forEach((d, i) => { if (d.owned && d.paws >= 1 && !d.keeper.owned && bn.get() >= D.SHOP.keeper) D.buy('keeper', i); });
    if (nextDesk >= 0 && bn.get() >= price) {
      const open = D.RECIPES.filter(r => !s.written[r.id] && r.band === topBand() && !r.gen).length;
      if (open <= 2 || topBand() >= 3) D.buy('desk', nextDesk);
    }
    const blue = s.desks[2].owned;
    const tryBuy = (what, arg, cost, mult) => { if (bn.get() >= cost * mult) D.buy(what, arg); };
    if (blue) { tryBuy('contracts', undefined, D.SHOP.contracts, 1.2); tryBuy('metro', undefined, D.SHOP.metro, 1.2); if (s.hold) tryBuy('dbl', undefined, D.SHOP.dbl, 1.2); }
    for (const x of D.DEALS) if (!s.deals[x.id] && D.soldCount() >= x.need) tryBuy('deal', x.id, x.cost, 1.5);
    s.desks.forEach((d, i) => { if (d.owned && d.mk < 2) tryBuy('mk', i, D.mkCost(i), 4); });
    if (D.soldCount() >= 2) { tryBuy('agent', undefined, D.SHOP.agent, 3); tryBuy('analyst', undefined, D.SHOP.analyst, 3); }
    if (s.lamp < 3) tryBuy('lamp', undefined, D.LAMP[s.lamp].cost, 5);
    // divisions: best ROI first, but never ahead of a desk we can nearly afford
    const reserve = nextDesk >= 0 && bn.get() > price * 0.5 ? price : 0;
    const opts = D.DIVS.filter(x => D.soldCount() >= x.need).map(x => ({ x, plan: D.divPlan(x, 1) })).sort((a, b) => (b.x.base / b.plan.cost) - (a.x.base / a.plan.cost));
    for (const { x, plan } of opts) { if (bn.get() - plan.cost >= reserve && bn.get() >= plan.cost * 1.1) { D.ui.buyN = 1; D.releaseDiv(x.id); break; } }
  }
  function pitches() {
    const s = S(); if (!s.offers || !s.offers.length) s.offers = D.newOffers();
    const open = D.RECIPES.filter(r => !s.written[r.id] && r.band <= topBand()).length;
    if (open >= 3 || D.pitchActive() >= D.PITCH_MAX) return;
    let best = -1; s.offers.forEach((p, i) => { if (best < 0 || p.pay > s.offers[best].pay) best = i; });
    const p = s.offers[best]; if (!p) return;
    s.pitches.push(p); D.registerPitch(p); s.stats.pitched = (s.stats.pitched || 0) + 1;
    s.offers[best] = D.genPitch(Math.min(topBand(), 5));
  }
  function taps(n, target) {
    const s = S(); let deskIdx = 0, most = -1;
    s.desks.forEach((d, i) => { if (!d.owned) return; const m = Object.keys(D.focusNeeds(d, i).missing).length; if (m > most) { most = m; deskIdx = i; } });
    for (let k = 0; k < n; k++) D.press(deskIdx, false);
  }
  function act() {
    const s = S(), target = chooseTarget();
    for (const r of D.RECIPES) if (!s.written[r.id] && D.canWrite(r)) D.writeTitle(r.id);
    s.desks.forEach(d => { if (d.keeper.owned) { d.keeper.def = st.opts.keeperDef == null ? 0 : st.opts.keeperDef; if (target) d.keeper.focus = target.id; } });
    s.desks.forEach((d, i) => trainDesk(i));
    if (s.desks[0].paws >= 1) manualBank(target);
    shop(); pitches();
    const activeMin = st.opts.activeMinutes == null ? 180 : st.opts.activeMinutes;
    const boot = st.opts.bootTaps == null ? 80 : st.opts.bootTaps;
    if (st.opts.profile === 'idle' && st.sec < 60 && s.stats.manual < boot) taps(3, target);   // just enough taps to hire the first typist
    if (st.opts.profile === 'active' && st.sec / 60 < activeMin) taps(s.hold ? Math.max(1, Math.round(D.holdRate(s.desks[0]))) : 3, target);
    // milestones
    const sold = D.soldCount(); [1, 3, 6, 10, 16, 24].forEach(n => { if (sold >= n) mark('titles_' + n); });
    ['rose', 'blue', 'amber', 'orchid', 'moon'].forEach((nm, k) => { if (s.desks[k + 1].owned) mark('desk_' + nm); });
    if (s.hold) mark('hold'); if (s.desks[0].keeper.owned) mark('keeper_bamboo');
    if (D.DIVS.some(x => (s.divs[x.id] || 0) > 0)) mark('first_division'); if (D.DIVS.every(x => (s.divs[x.id] || 0) > 0)) mark('all_divisions');
    if (s.run.earned >= 5e5) mark('first_star'); if (D.starsNow() >= 10) mark('stars_10');
    if (s.deals.reprints) mark('deal_reprints'); if (s.lamp) mark('lamp1');
  }
  window.Bot = {
    start(opts) { st.opts = opts || {}; st.sec = 0; st.marks = []; st.seen = {}; st.samples = []; D.ui.tab = 'shop'; if (st.opts.seed) window.__seed(st.opts.seed); },
    run(minutes) {
      for (let k = 0; k < minutes * 60; k++) {
        __advance(1000); st.sec++; act();
        if (st.sec % 600 === 0) st.samples.push({ min: st.sec / 60, bananas: Math.round(bn.get()), sold: D.soldCount(), roy: +D.royBase().toFixed(1), div: +D.divBase().toFixed(1), earned: Math.round(S().run.earned), lump: Math.round(S().stats.lump), royT: Math.round(S().royTotal), divT: Math.round(S().divTotal), desks: S().desks.filter(d => d.owned).length, paws: S().desks.reduce((a, d) => a + d.paws, 0) });
      }
      return { marks: st.marks, samples: st.samples.slice(-6) };
    },
    report() { return { marks: st.marks, samples: st.samples }; }
  };
})();

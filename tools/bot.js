/* A simple player bot for the balance harness. It is deliberately competent but not perfect:
   it sells titles as soon as they are ready, lets the free keepers (global auto focus) bank the words, spends letters on training,
   spends bananas in a fixed priority order, and (in the "active" profile) taps 3 a second, or Hold speed, for `activeMinutes`.
   The "idle" profile taps once a second until the first typist is hired and then never again.
   Strategies (Bot.start({ strategy })): "collect" keeps every keeper on and buys with whatever letters pile up;
   "hoard" pauses a desk's keeper once it holds `hoardAt` (default 0.5) of the next typist/upgrade cost, then buys and resumes.
   There is no manual word banking, so the keepers' own pace (KEEPER_PERIOD) is what gets measured. */
(function () {
  const D = IMI.ops.dev, bn = IMI.bananas;
  const bandOf = n => (n <= 3 ? 0 : n <= 5 ? 1 : n <= 7 ? 2 : n <= 9 ? 3 : n <= 11 ? 4 : 5);
  const st = { t0: null, marks: [], seen: {}, samples: [], sec: 0, opts: {} };
  const S = () => D.S();
  const topBand = () => S().desks.reduce((m, d, i) => (d.owned ? i : m), 0);
  const mark = k => { if (!st.seen[k]) { st.seen[k] = true; st.marks.push([k, Math.round(st.sec / 6) / 10]); } };   // minutes, 1 decimal
  function trainDesk(i) {
    const d = S().desks[i]; if (!d.owned) return;
    const order = ['paw', 'fing', 'vowel', 'ink', 'paw', 'fing', 'practice', 'stock', 'ribbon', 'paw', 'fing', 'rapid', 'practice', 'vowel', 'ink', 'stock', 'ribbon'];
    const want = [4, 3, 1, 1, 8, 6, 1, 1, 1, 12, 10, 2, (window.__TUNE || {}).BOT_TIERS3 ? 3 : 5, (window.__TUNE || {}).BOT_TIERS3 ? 3 : 5, (window.__TUNE || {}).BOT_TIERS3 ? 3 : 5, (window.__TUNE || {}).BOT_TIERS3 ? 3 : 5, (window.__TUNE || {}).BOT_TIERS3 ? 3 : 5];
    const prev = D.ui.buyN; D.ui.buyN = 1; let on = true;
    for (const [k, key] of order.map((key, n) => [n, key])) {
      const u = D.UPS.find(x => x.k === key), lvl = key === 'paw' ? d.paws : d.up[key];
      if (lvl >= want[k] || D.upLock(u, d)) continue;
      const plan = D.upPlan(u, d, i, 1), have = D.totalLetters(d);
      if (have >= plan.cost + 20) { const sel = S().sel; S().sel = i; D.buyUp(key); S().sel = sel; }
      else if (st.opts.strategy === 'hoard' && (key === 'paw' || key === 'fing') && have >= plan.cost * (st.opts.hoardAt == null ? 0.5 : st.opts.hoardAt)) on = false;
      break;                                                       // one purchase per desk per second, in priority order
    }
    d.keeper.on = on; D.ui.buyN = prev;
  }
  const BT = () => window.__TUNE || {};
  function shop() {
    const s = S(), have = bn.get(), nextDesk = s.desks.findIndex(d => !d.owned), price = nextDesk >= 0 ? D.DESKS[nextDesk].price : Infinity;
    if (!s.hold && have >= D.SHOP.hold) D.buy('hold');
    if (nextDesk >= 0 && bn.get() >= price) {
      D.buy('desk', nextDesk);
    }
    const blue = s.desks[2].owned;
    const tryBuy = (what, arg, cost, mult) => { if (bn.get() >= cost * mult) D.buy(what, arg); };
    if (blue) { tryBuy('contracts', undefined, D.SHOP.contracts, 1.2); tryBuy('metro', undefined, D.SHOP.metro, 1.2); if (s.hold) tryBuy('dbl', undefined, D.SHOP.dbl, 1.2); }
    for (const x of D.DEALS) if (!s.deals[x.id] && D.soldCount() >= x.need) tryBuy('deal', x.id, x.cost, 1.5);
    s.desks.forEach((d, i) => { if (d.owned && d.mk < 2) tryBuy('mk', i, D.mkCost(i), 4); });
    // keeper levels only while they are small next to the machine being saved for (a sensible player does not tune a keeper instead of buying the next desk)
    if (BT().BOT_SELL === 'pub' && D.PUB_COST && s.pub.tier < 3 && D.soldCount() >= 3) tryBuy('pub', undefined, D.PUB_COST[s.pub.tier], 2);
    // coaching is a surplus purchase: only when the bot holds four times the next machine's price (it is a poor investment next to machines and divisions) (the typists with the weakest roll first), when the run asks for it
    if (BT().BOT_COACH && D.coachCost) s.desks.forEach((d, i) => { if (!d.owned) return; let w = null; d.crew.forEach((t, p) => { if ((t.coach || 0) < D.COACH_MAX && (!w || (t.talent || 0) + (t.coach || 0) * D.COACH_STEP < (w.t.talent || 0) + (w.t.coach || 0) * D.COACH_STEP)) w = { t, p }; }); if (w && bn.get() >= Math.min(price * 4, 1e15) && bn.get() >= D.coachCost(i, w.t) * 3) D.coachTypist(i, w.p); });
    if (D.keeperUpCost) s.desks.forEach((d, i) => { if (d.owned && D.keeperLv(i) < D.KEEPER_UP_MAX && D.keeperUpCost(i) <= .15 * price) tryBuy('keeper', i, D.keeperUpCost(i), 3); });
    if (D.soldCount() >= 2) { tryBuy('agent', undefined, D.SHOP.agent, 3); tryBuy('analyst', undefined, D.SHOP.analyst, 3); }
    if (s.lamp < 3) tryBuy('lamp', undefined, D.LAMP[s.lamp].cost, 5);
    // divisions: best ROI first, but never ahead of a desk we can nearly afford
    const reserve = nextDesk >= 0 && bn.get() > price * 0.5 ? price : 0;
    const opts = D.DIVS.filter(x => D.soldCount() >= x.need).map(x => ({ x, plan: D.divPlan(x, 1) })).sort((a, b) => (b.x.base / b.plan.cost) - (a.x.base / a.plan.cost));
    for (const { x, plan } of opts) { if (bn.get() - plan.cost >= reserve && bn.get() >= plan.cost * 1.1) { D.ui.buyN = 1; D.releaseDiv(x.id); break; } }
  }
  function pitches() {
    const s = S(); if (!s.offers || !s.offers.length) s.offers = D.newOffers();
    const open = D.RECIPES.filter(r => !s.written[r.id] && !r.kid && !r.lib && r.band <= topBand()).length;      // library stories are extra supply, not a reason to stop pitching
    if (open >= 3 || D.pitchActive() >= D.PITCH_MAX) return;
    // the reading list (kids' titles) covers band 0, so only commissions that need a bigger machine are worth pitching
    const bandOfPitch = p => bandOf(Math.max(...(p.text.toLowerCase().match(/[a-z']+/g) || []).map(w => w.replace(/'/g, '').length)));
    let best = -1; s.offers.forEach((p, i) => { if (bandOfPitch(p) >= 1 && (best < 0 || p.pay > s.offers[best].pay)) best = i; });
    if (best < 0) return;
    const p = s.offers[best]; if (!p) return;
    s.pitches.push(p); D.registerPitch(p); s.stats.pitched = (s.stats.pitched || 0) + 1;
    s.offers[best] = D.genPitch(Math.min(topBand(), 5));
  }
  function taps(n) {
    const s = S(); let deskIdx = 0, most = -1;
    s.desks.forEach((d, i) => { if (!d.owned) return; const m = Object.keys(D.focusNeeds(d, i).missing).length; if (m > most) { most = m; deskIdx = i; } });
    for (let k = 0; k < n; k++) D.press(deskIdx, false);
  }
  function act() {
    const s = S();
    const BT = window.__TUNE || {};                              // BOT_SELL: 'pub' = buy the assistant and let it sell (rule BOT_PUB_RULE); default is the bot selling by hand at any price
    const viaPub = BT.BOT_SELL === 'pub' && s.pub && s.pub.tier > 0;
    if (viaPub) s.pub.rule = BT.BOT_PUB_RULE || 'fair';
    else if (!BT.BOT_VISIT || Math.floor(st.sec / 60) % BT.BOT_VISIT === 0) for (const r of D.RECIPES) if (!s.written[r.id] && D.canWrite(r)) D.writeTitle(r.id);   // BOT_VISIT = N: a casual player who only checks in for one minute every N minutes
    s.desks.forEach((d, i) => trainDesk(i));
    shop(); pitches();
    const activeMin = st.opts.activeMinutes == null ? 180 : st.opts.activeMinutes;
    // idle = a casual finger: 1 tap a second until the first typist is hired, then walks away (opts.idleTps changes the rate)
    if (st.opts.profile === 'idle' && s.desks[0].paws < 1 && st.sec < 1800) taps(st.opts.idleTps || 1);
    if (st.opts.profile === 'active' && st.sec / 60 < activeMin) taps(s.hold ? Math.max(1, Math.round(D.holdRate(s.desks[0]))) : 3);
    // milestones
    const sold = D.soldCount(), kids = D.kidsSold(); [1, 3, 6, 10, 16, 24].forEach(n => { if (sold >= n) mark('titles_' + n); });
    [1, 25, 100].forEach(n => { if (kids >= n) mark('kids_' + n); });
    if (D.libSold) [1, 25, 100, 300].forEach(n => { if (D.libSold() >= n) mark('lib_' + n); });
    if (s.desks[0].paws >= 1) mark('typist_1');
    if (s.desks[1].owned) mark('hibiscus'); if (s.desks[2].owned) mark('lagoon'); if (s.desks[3].owned) mark('honeycomb');
    if (Object.keys(s.deals).some(k => s.deals[k])) mark('first_deal');
    if (D.museSlots() >= 1) mark('muse_slot');
    ['rose', 'blue', 'amber', 'orchid', 'moon'].forEach((nm, k) => { if (s.desks[k + 1].owned) mark('desk_' + nm); });
    if (s.hold) mark('hold'); if (s.desks[0].keeper.owned) mark('keeper_bamboo');
    if (D.DIVS.some(x => (s.divs[x.id] || 0) > 0)) mark('first_division'); if (D.DIVS.every(x => (s.divs[x.id] || 0) > 0)) mark('all_divisions');
    if (s.run.earned >= 5e5) mark('first_star'); if (D.starsNow() >= 10) mark('stars_10');
    if (s.deals.reprints) mark('deal_reprints'); if (s.lamp) mark('lamp1');
  }
  window.Bot = {
    start(opts) { st.opts = opts || {}; if (!st.opts.strategy) st.opts.strategy = 'collect'; st.sec = 0; st.marks = []; st.seen = {}; st.samples = []; D.ui.tab = 'shop'; if (st.opts.seed) window.__seed(st.opts.seed); },
    run(minutes) {
      for (let k = 0; k < minutes * 60; k++) {
        __advance(1000); st.sec++; act();
        if (st.sec % 600 === 0) st.samples.push({ min: st.sec / 60, bananas: Math.round(bn.get()), sold: D.soldCount(), roy: +D.royBase().toFixed(1), div: +D.divBase().toFixed(1), earned: Math.round(S().run.earned), lump: Math.round(S().stats.lump), royT: Math.round(S().royTotal), divT: Math.round(S().divTotal), desks: S().desks.filter(d => d.owned).length, paws: S().desks.reduce((a, d) => a + d.paws, 0), ups: S().desks.reduce((a, d) => a + Object.values(d.up).reduce((x, y) => x + y, 0), 0), kids: D.kidsSold() });
      }
      return { marks: st.marks, samples: st.samples.slice(-6) };
    },
    report() { return { marks: st.marks, samples: st.samples }; }
  };
})();

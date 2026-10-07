const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const source = readFileSync(require('node:path').join(__dirname, '..', 'economy.js'), 'utf8');

function load(records = {}, reject = () => false) {
  const data = new Map(Object.entries(records));
  const context = { Intl, localStorage: {
    getItem: key => data.get(key) ?? null,
    setItem: (key, value) => { if (reject(key)) throw new Error('Storage unavailable'); data.set(key, value); }
  } };
  context.window = context;
  vm.runInNewContext(source, context);
  return { economy: context.Economy, data };
}

test('compact formatting promotes rounded suffix boundaries and keeps small rates', () => {
  const { economy: e } = load();
  for (const [value, expected] of [[0, '0'], [999, '999'], [1000, '1K'], [999999, '1M'],
    [12500, '12.5K'], [1e15, '1Qa'], [9.999e17, '1e18'], [1.25e21, '1.25e21'], [-12500, '-12.5K']]) {
    assert.equal(e.fmt(value), expected);
  }
  assert.equal(e.rate(.025), '0.025');
  assert.equal(e.rate(.0000125), '1.25e-5');
  assert.equal(e.rate(1.25), '1.25');
  assert.equal(e.exact(12500), '12,500');
});

test('wallet and monetary game fields migrate once without changing counts', () => {
  const old = { run: { earned: 500000 }, stats: { lump: 1000, letters: 300, bestMult: 1.4 },
    royTotal: 200, divTotal: 50, pitches: [{ pay: 400 }], offers: [{ pay: 20 }], legacy: { stars: 3 }, best: 50 };
  const raw = JSON.stringify(old);
  const { economy: e, data } = load({ 'imi-score': '2000', 'imi-ops-v1': raw });
  assert.equal(e.loadScore(), 50000);
  const state = e.loadState();
  assert.equal(state.run.earned, 12500000);
  assert.equal(state.stats.lump, 25000);
  assert.equal(state.royTotal, 5000);
  assert.equal(state.divTotal, 1250);
  assert.equal(state.pitches[0].pay, 10000);
  assert.equal(state.offers[0].pay, 500);
  assert.equal(state.stats.letters, 300);
  assert.equal(state.stats.bestMult, 1.4);
  assert.equal(state.legacy.stars, 3);
  assert.equal(state.best, 50);
  assert.equal(e.loadScore(), 50000);
  assert.equal(e.loadState().run.earned, 12500000);
  const backup = JSON.parse(data.get('imi-economy-v1-backup'));
  assert.equal(backup.score, '2000');
  assert.equal(backup.state, raw);
});

test('interruption after either saved record leaves only the other record to migrate', () => {
  for (const failKey of ['imi-score', 'imi-ops-v1']) {
    const first = load({ 'imi-score': '100', 'imi-ops-v1': '{"run":{"earned":200}}' }, key => key === failKey);
    assert.equal(first.economy.loadScore(), 2500);
    assert.equal(first.economy.loadState().run.earned, 5000);
    const resumed = load(Object.fromEntries(first.data));
    assert.equal(resumed.economy.loadScore(), 2500);
    assert.equal(resumed.economy.loadState().run.earned, 5000);
    assert.equal(resumed.economy.loadScore(), 2500);
    assert.equal(resumed.economy.loadState().run.earned, 5000);
  }
});

test('malformed and missing records recover without invalid values or invented game state', () => {
  for (const score of ['not JSON', '-50', 'null', '{"economyVersion":1,"score":"oops"}']) {
    const { economy: e } = load({ 'imi-score': score, 'imi-ops-v1': '[]' });
    assert.equal(e.loadScore(), 0);
    assert.equal(e.loadState(), null);
  }
  const { economy: e } = load();
  assert.equal(e.loadScore(), 0);
  assert.equal(e.loadState(), null);
});

test('storage failures retain usable converted values and denomination rounding', () => {
  const { economy: e } = load({ 'imi-score': '10', 'imi-ops-v1': '{"royTotal":20}' }, () => true);
  assert.equal(e.loadScore(), 250);
  assert.equal(e.loadState().royTotal, 500);
  assert.equal(e.floor(49), 25);
  assert.equal(e.round(49), 50);
  assert.equal(e.cash(5), 125);
});

/* Shared banana units, compact values, and one-time conversion of older local saves. */
window.Economy = (() => {
  'use strict';
  const version = 1, scale = 25;
  const cash = n => n * scale;
  const round = n => Math.round(n / scale) * scale;
  const floor = n => Math.floor(n / scale) * scale;
  const nf = new Intl.NumberFormat('en-US', { maximumFractionDigits: 6 });
  const units = [[1e15, 'Qa'], [1e12, 'T'], [1e9, 'B'], [1e6, 'M'], [1e3, 'K']];
  function format(value, fractional = false) {
    let n = fractional ? value : Math.round(value);
    if (!Number.isFinite(n)) return '0';
    const sign = n < 0 ? '-' : ''; n = Math.abs(n);
    const rounded = Number(n.toPrecision(3));
    if (rounded >= 1e18 || (fractional && n > 0 && n < .001)) return sign + rounded.toExponential(2).replace(/\.?0+e/, 'e').replace('e+', 'e');
    for (const [unit, suffix] of units) if (rounded >= unit) return sign + Number((rounded / unit).toPrecision(3)) + suffix;
    return sign + nf.format(fractional ? rounded : n);
  }
  const fmt = n => format(n);
  const rate = n => format(n, true);
  const exact = n => nf.format(n);
  const read = key => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };
  const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Keep playing when storage is unavailable. */ } };
  function backup() {
    try {
      if (localStorage.getItem('imi-economy-v1-backup') === null) write('imi-economy-v1-backup', {
        score: localStorage.getItem('imi-score'), state: localStorage.getItem('imi-ops-v1')
      });
    } catch { /* Storage may be unavailable. */ }
  }
  const saveScore = score => write('imi-score', { economyVersion: version, score });
  function loadScore() {
    const saved = read('imi-score');
    const current = saved && typeof saved === 'object' && saved.economyVersion >= version;
    const score = current ? saved.score : cash(typeof saved === 'number' ? saved : 0);
    const valid = Number.isFinite(score) && score >= 0 ? score : 0;
    if (!current) { if (saved !== null) backup(); saveScore(valid); }
    return valid;
  }
  function loadState() {
    const state = read('imi-ops-v1');
    if (!state || typeof state !== 'object' || Array.isArray(state)) return null;
    if (state.economyVersion >= version) return state;
    backup();
    const convert = (object, key) => { if (object && Number.isFinite(object[key])) object[key] = cash(object[key]); };
    convert(state.run, 'earned'); convert(state.stats, 'lump');
    convert(state, 'royTotal'); convert(state, 'divTotal');
    for (const list of [state.pitches, state.offers]) if (Array.isArray(list)) for (const pitch of list) convert(pitch, 'pay');
    state.economyVersion = version;
    write('imi-ops-v1', state);
    return state;
  }
  return Object.freeze({ version, scale, cash, round, floor, fmt, rate, exact, loadScore, saveScore, loadState });
})();

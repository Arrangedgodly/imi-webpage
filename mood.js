/* ============================================================
   MOOD — how the monkeys feel about the weather (shared by both art styles).
   Computes wetness, leaf-hat, fear, startle and shake-off timing from Weather,
   and emits events ('shake', 'startle', 'weather', 'drip') that each page turns into visuals.
   ============================================================ */
(() => {
  'use strict';
  const WET_CAP = [0, .45, .8, 1], WET_RISE = .15, WET_DRY = .22, SHAKE_MS = 1500;
  const M = { wet: 0, hat: false, scared: false, startleUntil: 0, shakeStart: 0, shakeUntil: 0, _t: 0, _drip: 0, _h: {} };
  M.on = (evt, fn) => { (M._h[evt] = M._h[evt] || []).push(fn); };
  const emit = (evt, ...a) => (M._h[evt] || []).forEach(f => f(...a));

  M.startle = now => now < M.startleUntil;
  M.shaking = now => now < M.shakeUntil;
  M.shakeAmp = now => (now < M.shakeUntil ? 1 - (now - M.shakeStart) / SHAKE_MS : 0);

  Weather.on('change', (n, lv, prev, quiet) => {
    M.hat = n >= 2; M.scared = n === 3;
    if (quiet) { M.wet = WET_CAP[n] * .8; return; }                          // page loaded mid-weather: already damp
    const now = performance.now();
    if (prev > 0 && n === 0) { M.shakeStart = now; M.shakeUntil = now + SHAKE_MS; emit('shake'); }
    else emit('weather', n, prev);
  });
  Weather.on('bolt', () => { M.startleUntil = performance.now() + 900; emit('startle'); });

  let shown = -1;
  M.update = now => {
    const dt = Math.min(.1, (now - (M._t || now)) / 1000); M._t = now;
    const cap = WET_CAP[Weather.state];
    if (M.wet < cap) M.wet = Math.min(cap, M.wet + WET_RISE * dt);
    else if (M.wet > cap) M.wet = Math.max(cap, M.wet - WET_DRY * dt);
    const q = Math.round(M.wet * 50) / 50;
    if (q !== shown) { shown = q; document.documentElement.style.setProperty('--wet', q); }     // CSS dims/desaturates the monkeys
    if (M.wet > .3 && now - M._drip > 800 / M.wet) { M._drip = now; emit('drip'); }
  };
  window.Mood = M;
})();

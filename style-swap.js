/* Shared art-style swapper. Loaded in <head> of both pages (index.html = pixel, classic.html = classic).
   Remembers the choice, keeps scroll position, and plays a bar-wipe between styles.
   Score / sound / night mode already live in localStorage, so they carry over untouched. */
(() => {
  const cur = document.documentElement.dataset.style;                 // 'pixel' | 'classic'
  const pages = { pixel: 'index.html', classic: 'classic.html' };
  const forced = new URLSearchParams(location.search).get('s');
  const pref = localStorage.getItem('imi-style');

  // root URL honours the last style you picked; direct visits to classic.html never redirect
  if (cur === 'pixel' && !forced && pref === 'classic') { location.replace(pages.classic + location.hash); return; }
  localStorage.setItem('imi-style', cur);

  const css = document.createElement('style');
  css.textContent = `
    .swap-wipe { position: fixed; inset: 0; z-index: 99999; display: flex; pointer-events: all; }
    .swap-wipe b { flex: 1; transform: translateY(-101%); }
    .swap-wipe[data-style="pixel"] b { background: #1f6a2a; box-shadow: inset -6px 0 0 #17481f, inset 6px 0 0 #2f8a35; animation-timing-function: steps(8); }
    .swap-wipe[data-style="pixel"] b:nth-child(even) { background: #2f8a35; }
    .swap-wipe[data-style="classic"] b { background: linear-gradient(180deg, #ffe566, #ffd93b); animation-timing-function: cubic-bezier(.34, 1.3, .64, 1); }
    .swap-wipe[data-style="classic"] b:nth-child(even) { background: linear-gradient(180deg, #7cc34a, #3a8a2e); }
    .swap-wipe.in b  { animation: swap-in .55s both; animation-delay: calc(var(--i) * 38ms); }
    .swap-wipe.out b { animation: swap-out .55s both; animation-delay: calc(var(--i) * 38ms); transform: translateY(0); }
    @keyframes swap-in  { from { transform: translateY(-101%); } to { transform: translateY(0); } }
    @keyframes swap-out { from { transform: translateY(0); } to { transform: translateY(101%); } }`;
  document.head.appendChild(css);

  const incoming = sessionStorage.getItem('imi-wipe');
  if (incoming) {        // hide the page until the bars are up, so there is no flash between styles
    const cover = document.createElement('style');
    cover.id = 'swapcover'; cover.textContent = `html { background: ${cur === 'pixel' ? '#1f6a2a' : '#7cc34a'}; } body { visibility: hidden; }`;
    document.head.appendChild(cover);
  }

  function bars(style, mode) {
    const w = document.createElement('div'); w.className = 'swap-wipe ' + mode; w.dataset.style = style;
    for (let i = 0; i < 14; i++) { const b = document.createElement('b'); b.style.setProperty('--i', i); w.appendChild(b); }
    document.body.appendChild(w); return w;
  }

  addEventListener('DOMContentLoaded', () => {
    if (incoming) {
      sessionStorage.removeItem('imi-wipe');
      const w = bars(cur, 'out'); document.getElementById('swapcover')?.remove();
      setTimeout(() => w.remove(), 1400);
    }
    const btn = document.getElementById('styleSwap');
    if (btn) btn.addEventListener('click', swap);
  });

  addEventListener('load', () => {
    const f = parseFloat(sessionStorage.getItem('imi-scroll'));
    if (!isNaN(f)) {
      sessionStorage.removeItem('imi-scroll');
      requestAnimationFrame(() => scrollTo({ top: f * Math.max(1, document.documentElement.scrollHeight - innerHeight), behavior: 'instant' }));
    }
  });

  let swapping = false;
  function swap() {
    if (swapping) return; swapping = true;
    const target = cur === 'pixel' ? 'classic' : 'pixel';
    const sh = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    sessionStorage.setItem('imi-scroll', String(scrollY / sh));
    sessionStorage.setItem('imi-wipe', target);
    localStorage.setItem('imi-style', target);
    bars(target, 'in');
    setTimeout(() => { location.href = pages[target] + '?s=' + target + location.hash; }, 1000);
  }
})();

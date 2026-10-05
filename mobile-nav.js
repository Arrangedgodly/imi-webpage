/* Phone header: the full nav collapses behind a MENU button (CSS decides when it is visible, <=720px). */
(() => {
  const bar = document.querySelector('.topbar'), nav = bar && bar.querySelector('nav');
  if (!bar || !nav || bar.hasAttribute('data-simple')) return;
  const px = document.documentElement.dataset.style === 'pixel';
  const css = document.createElement('style');
  css.textContent = '.menu-btn{display:none}@media(max-width:720px){.menu-btn{display:block}}';
  document.head.appendChild(css);
  const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'leaf-link menu-btn'; btn.textContent = px ? 'MENU' : 'Menu';
  btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-label', 'Open the menu');
  bar.insertBefore(btn, nav);
  const set = open => { bar.classList.toggle('menu-open', open); btn.setAttribute('aria-expanded', String(open)); btn.textContent = open ? (px ? 'CLOSE' : 'Close') : (px ? 'MENU' : 'Menu'); };
  btn.addEventListener('click', e => { e.stopPropagation(); set(!bar.classList.contains('menu-open')); });
  nav.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
  document.addEventListener('click', e => { if (!bar.contains(e.target)) set(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
  addEventListener('resize', () => { if (innerWidth > 720) set(false); });
})();

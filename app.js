(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const centerOf = el => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };

  PXA.install();
  const S = PXA.S;
  addEventListener('resize', (() => { let t; return () => { clearTimeout(t); t = setTimeout(() => PXA.paintSky(), 200); }; })());
  const setSpr = (el, name) => { const s = PXA.spr[name]; el.style.width = s.w * S + 'px'; el.style.height = s.h * S + 'px'; el.style.backgroundImage = `url(${s.url})`; el.style.backgroundSize = '100% 100%'; };

  /* =====================  SOUND (synthesized, no assets)  ===================== */
  const audio = { ctx: null, on: localStorage.getItem('imi-sound') !== 'off' };
  function ac() {
    if (!audio.ctx) { const C = window.AudioContext || window.webkitAudioContext; if (C) audio.ctx = new C(); }
    if (audio.ctx && audio.ctx.state === 'suspended') audio.ctx.resume();
    return audio.ctx;
  }
  function tone(f0, dur, { type = 'sine', vol = 0.16, f1 = f0, delay = 0, vibrato = 0 } = {}) {
    if (!audio.on) return; const c = ac(); if (!c) return;
    const t = c.currentTime + delay, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    if (vibrato) { const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = 28; lg.gain.value = vibrato; l.connect(lg).connect(o.frequency); l.start(t); l.stop(t + dur); }
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(dur, { vol = 0.2, freq = 1800, delay = 0 } = {}) {
    if (!audio.on) return; const c = ac(); if (!c) return;
    const len = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(), t = c.currentTime + delay;
    s.buffer = buf; f.type = 'bandpass'; f.frequency.value = freq; g.gain.value = vol;
    s.connect(f).connect(g).connect(c.destination); s.start(t);
  }
  /* chiptune flavour: square/triangle voices */
  const sfx = {
    peel()    { noise(.25, { freq: 3000, vol: .18 }); tone(300, .22, { type: 'square', f1: 800, vol: .07 }); tone(600, .18, { type: 'square', f1: 1200, delay: .12, vol: .05 }); },
    unpeel()  { tone(700, .25, { type: 'square', f1: 240, vol: .07 }); },
    crack()   { noise(.12, { freq: 900, vol: .5 }); tone(140, .18, { type: 'square', f1: 50, vol: .22 }); noise(.35, { freq: 5000, vol: .15, delay: .08 }); },
    shake()   { for (let i = 0; i < 4; i++) noise(.05, { freq: 700, vol: .25, delay: i * .1 }); },
    boing()   { tone(180, .3, { type: 'square', f1: 520, vol: .08 }); tone(520, .25, { type: 'square', f1: 220, delay: .12, vol: .05 }); },
    monkey()  { tone(520, .2, { type: 'sawtooth', f1: 380, vibrato: 90, vol: .08 }); tone(600, .2, { type: 'sawtooth', f1: 400, delay: .24, vibrato: 90, vol: .08 }); tone(760, .4, { type: 'sawtooth', f1: 300, delay: .5, vibrato: 140, vol: .08 }); },
    coin()    { tone(988, .08, { type: 'square', vol: .06 }); tone(1319, .22, { type: 'square', delay: .08, vol: .06 }); },
    drum()    { tone(220, .2, { f1: 70, vol: .35 }); noise(.05, { freq: 300, vol: .3 }); },
    day()     { tone(523, .14, { type: 'square', vol: .06 }); tone(659, .14, { type: 'square', delay: .1, vol: .06 }); tone(784, .26, { type: 'square', delay: .2, vol: .06 }); },
    night()   { tone(784, .16, { type: 'square', vol: .06 }); tone(587, .16, { type: 'square', delay: .12, vol: .06 }); tone(392, .36, { type: 'square', delay: .24, vol: .06 }); },
    tick()    { tone(1200, .03, { type: 'square', vol: .03 }); },
    key()     { noise(.03, { freq: 2600, vol: .1 }); tone(170 + Math.random() * 60, .04, { type: 'square', f1: 70, vol: .04 }); },
    ding()    { tone(1568, .32, { type: 'triangle', vol: .07 }); },
    fanfare() { [523, 659, 784, 1047].forEach((f, i) => tone(f, .2, { type: 'square', delay: i * .1, vol: .07 })); },
  };
  const soundBtn = $('#soundBtn'), drumSpr = $('#drumSpr');
  function paintSound() { soundBtn.setAttribute('aria-pressed', String(audio.on)); setSpr(drumSpr, audio.on ? 'drum-on' : 'drum-off'); }
  paintSound();
  soundBtn.addEventListener('click', () => {
    audio.on = !audio.on; localStorage.setItem('imi-sound', audio.on ? 'on' : 'off'); paintSound();
    soundBtn.classList.remove('hit'); void soundBtn.offsetWidth; soundBtn.classList.add('hit');
    if (audio.on) sfx.drum();
  });

  /* =====================  TITLE LETTERS  ===================== */
  let idx = 0;
  document.querySelectorAll('.word').forEach(word => {
    for (const ch of word.dataset.text) {
      const s = document.createElement('span');
      s.className = 'letter'; s.textContent = ch; s.setAttribute('aria-hidden', 'true'); s.style.setProperty('--i', idx++);
      s.addEventListener('mouseenter', () => sfx.tick());
      word.appendChild(s);
    }
  });

  /* vines hang from the top of the hero behind the title (positioned from layout, not transforms) */
  const title = $('#title');
  function placeVines() {
    title.querySelectorAll('.lv').forEach(v => v.remove());
    title.querySelectorAll('.letter').forEach(l => {
      const v = document.createElement('span'); v.className = 'lv'; v.style.setProperty('--i', l.style.getPropertyValue('--i'));
      const lw = l.parentElement; // .word is not positioned, so letter offsets are relative to .title
      v.style.left = (l.offsetLeft + l.offsetWidth / 2) + 'px'; v.style.top = -title.offsetTop + 'px';
      v.style.height = (title.offsetTop + l.offsetTop + 6) + 'px';
      title.prepend(v);
    });
  }
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => requestAnimationFrame(placeVines));
  addEventListener('resize', (() => { let t; return () => { clearTimeout(t); t = setTimeout(placeVines, 250); }; })());

  /* =====================  AMBIENT  ===================== */
  if (!reduceMotion) {
    const box = $('#drifters'), names = ['leaf', 'leaf2', 'leaf', 'banana', 'coco-s', 'leaf2'];
    for (let i = 0; i < 14; i++) {
      const e = PXA.el(names[i % names.length], pick([1, 1, 2]));
      e.style.left = rand(0, 100) + '%'; e.style.animationDuration = rand(14, 30) + 's'; e.style.animationDelay = -rand(0, 30) + 's';
      box.appendChild(e);
    }
  }
  const flies = $('#fireflies');
  for (let i = 0; i < 26; i++) {
    const s = document.createElement('span');
    s.style.left = rand(2, 96) + '%'; s.style.top = rand(15, 95) + '%';
    s.style.setProperty('--d', rand(5, 11) + 's'); s.style.setProperty('--dl', -rand(0, 10) + 's');
    flies.appendChild(s);
  }

  /* =====================  REVEAL ON SCROLL  ===================== */
  const revealEls = document.querySelectorAll('.section-title, .section-sub, .crate, .log-scroll');
  revealEls.forEach(el => el.classList.add('reveal'));
  const io = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 });
  revealEls.forEach((el, i) => { el.style.transitionDelay = (i % 3) * 90 + 'ms'; io.observe(el); });

  /* =====================  PIXEL PARTICLES  ===================== */
  function pfx(name, x, y, mult = 1) {
    const e = PXA.el(name, mult); e.classList.add('pfx'); e.style.left = x + 'px'; e.style.top = y + 'px'; document.body.appendChild(e); return e;
  }
  function burst(x, y, names, n = 12) {
    if (reduceMotion) return;
    for (let i = 0; i < n; i++) {
      const p = pfx(names[i % names.length], x, y, pick([1, 1, 2]));
      const ang = rand(0, Math.PI * 2), dist = rand(60, 150), dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist - 40;
      p.animate([
        { transform: 'translate(-50%,-50%)', opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`, opacity: 1, offset: .55 },
        { transform: `translate(calc(-50% + ${dx * 1.1}px), calc(-50% + ${dy + 100}px))`, opacity: 0 }
      ], { duration: rand(800, 1200), easing: 'steps(12)' }).onfinish = () => p.remove();
    }
  }
  function fall(x, y, name, life = 1100) {
    if (reduceMotion) return;
    const p = pfx(name, x, y, 1), dx = pick([-1, 1]) * rand(6, 30);
    p.animate([{ transform: 'translate(-50%,-50%)', opacity: .95 }, { transform: `translate(calc(-50% + ${dx}px), calc(-50% + 66px))`, opacity: 0 }], { duration: life, easing: 'steps(8)' }).onfinish = () => p.remove();
  }
  if (!reduceMotion && matchMedia('(pointer: fine)').matches) {
    let lx = 0, ly = 0, n = 0; const trail = ['leaf', 'banana', 'leaf2', 'coco-s'];
    addEventListener('pointermove', e => {
      if (Math.hypot(e.clientX - lx, e.clientY - ly) < 48) return;
      lx = e.clientX; ly = e.clientY; fall(lx, ly, trail[n++ % trail.length], 1000);
    });
    addEventListener('pointerdown', e => { if (!e.target.closest('button, a, .vine, .hm-hit')) fall(e.clientX, e.clientY, 'paw', 900); });
  }

  /* =====================  BANANA SCORE  ===================== */
  const hud = $('#hud'), scoreEl = $('#score');
  let score = +localStorage.getItem('imi-score') || 0;
  const fmt = n => Math.round(n).toLocaleString('en-US');
  scoreEl.textContent = fmt(score);
  const bananaWatchers = [];
  const milestones = { 10: 'BANANA HOARDER!', 25: 'CERTIFIED PRIMATE!', 50: 'CHIEF BANANA OFFICER', 100: 'INFINITE MONKEY!' };
  function banner(text) {
    sfx.fanfare();
    const b = document.createElement('div'); b.className = 'banner'; b.textContent = '>> ' + text + ' <<'; document.body.appendChild(b);
    b.animate([
      { transform: 'translate(-50%, -140px)', opacity: 0 }, { transform: 'translate(-50%, 0)', opacity: 1, offset: .2 },
      { transform: 'translate(-50%, 0)', opacity: 1, offset: .8 }, { transform: 'translate(-50%, -80px)', opacity: 0 }
    ], { duration: 2600, easing: 'steps(10)' }).onfinish = () => b.remove();
    const [x, y] = centerOf(hud); burst(x, y + 60, ['banana', 'spark', 'star'], 16);
  }
  function paintScore(bump) {
    scoreEl.textContent = fmt(score); localStorage.setItem('imi-score', score);
    if (bump) { hud.classList.remove('bump'); void hud.offsetWidth; hud.classList.add('bump'); }
    bananaWatchers.forEach(f => f(score));
  }
  function addScore(n, from, quiet) {
    const [fx, fy] = from || [innerWidth / 2, innerHeight / 2], [hx, hy] = centerOf(hud);
    const f = document.createElement('div'); f.className = 'fly-plus'; f.textContent = `+${fmt(n)}`; f.style.left = fx + 'px'; f.style.top = fy + 'px';
    const b = PXA.el('banana'); b.style.marginLeft = '6px'; b.style.verticalAlign = 'middle'; f.appendChild(b); document.body.appendChild(f);
    const done = () => {
      f.remove(); score += n; paintScore(true); sfx.coin();
      if (!quiet) Object.keys(milestones).forEach(m => { if (score - n < +m && score >= +m) banner(milestones[m]); });
    };
    if (reduceMotion) return done();
    f.animate([
      { transform: 'translate(-50%,-50%)', opacity: 0 }, { transform: 'translate(-50%,-90px)', opacity: 1, offset: .3 },
      { transform: `translate(${hx - fx - f.offsetWidth / 2}px, ${hy - fy}px)`, opacity: .9 }
    ], { duration: 900, easing: 'steps(14)' }).onfinish = done;
  }

  /* =====================  TOAST  ===================== */
  const toast = $('#toast');
  function say(msg) { toast.textContent = msg; toast.classList.remove('pop'); void toast.offsetWidth; toast.classList.add('pop'); }

  /* =====================  FRAME PLAYER (sprite sheets)  ===================== */
  function play(el, sheet, from, to, ms, done) {
    const dir = Math.sign(to - from) || 1; let i = from; PXA.frame(el, sheet, i);
    if (reduceMotion || from === to) { PXA.frame(el, sheet, to); done && done(); return; }
    const t = setInterval(() => { i += dir; PXA.frame(el, sheet, i); if (i === to) { clearInterval(t); done && done(); } }, ms);
  }

  /* =====================  BANANA TOGGLE  ===================== */
  const banana = $('#bananaToggle'), bananaState = $('#bananaState'), bSpr = $('#bananaSpr');
  PXA.frame(bSpr, PXA.banana, 0);
  const lastB = PXA.banana.n - 1; let bBusy = false;
  banana.addEventListener('click', () => {
    if (bBusy) return;
    const on = banana.getAttribute('aria-checked') !== 'true';
    banana.setAttribute('aria-checked', String(on)); bananaState.textContent = on ? 'PEELED' : 'UNPEELED';
    bBusy = true; bSpr.classList.remove('hop'); void bSpr.offsetWidth; bSpr.classList.add('hop');
    play(bSpr, PXA.banana, on ? 0 : lastB, on ? lastB : 0, on ? 75 : 45, () => { bBusy = false; });
    if (on) { sfx.peel(); burst(...centerOf(bSpr), ['leaf', 'spark', 'banana'], 9); addScore(1, centerOf(bSpr)); } else sfx.unpeel();
    say(on ? 'PEELED! READY TO EAT.' : 'GOOD AS NEW. SOMEHOW.');
  });

  /* =====================  COCONUT  ===================== */
  const coco = $('#coconutBtn'), cSpr = $('#cocoSpr'); PXA.frame(cSpr, PXA.coconut, 0);
  let cocoBusy = false;
  coco.addEventListener('click', () => {
    if (cocoBusy) return; cocoBusy = true; coco.classList.add('shaking'); sfx.shake();
    setTimeout(() => {
      coco.classList.remove('shaking'); sfx.crack();
      play(cSpr, PXA.coconut, 1, PXA.coconut.n - 1, 80);
      burst(...centerOf(cSpr), ['drop', 'coco-s', 'drop'], 14); addScore(3, centerOf(cSpr)); say('COCONUT CRACKED. HYDRATE.');
    }, 500);
    setTimeout(() => play(cSpr, PXA.coconut, PXA.coconut.n - 1, 0, 70, () => { cocoBusy = false; }), 2700);
  });

  /* =====================  SUN / MOON  ===================== */
  const nightBtn = $('#nightToggle'), nightHint = $('#nightHint');
  function setNight(on, announce) {
    document.body.classList.toggle('night', on); nightBtn.setAttribute('aria-checked', String(on));
    nightHint.textContent = on ? 'Night. Fireflies on shift.' : 'Daytime. Monkeys are loud.';
    if (announce) { (on ? sfx.night : sfx.day)(); say(on ? 'LIGHTS OUT.' : 'RISE AND SHINE.'); }
    localStorage.setItem('imi-night', on ? '1' : '0');
  }
  nightBtn.addEventListener('click', () => setNight(nightBtn.getAttribute('aria-checked') !== 'true', true));
  if (localStorage.getItem('imi-night') === '1') setNight(true, false);

  /* =====================  WEATHER (shared module)  ===================== */
  const wxBtn = $('#weatherBtn'), wxSpr = $('#wxSpr'), wxLabel = $('#wxState'), wxHint = $('#wxHint');
  const wxHints = ['Click to make it rain.', 'A light drizzle. Cozy.', 'Proper rain. Water is rising.', 'STORM! Hold on to your vines.'];
  Weather.onChange = (n, lv) => { wxBtn.dataset.state = n; PXA.frame(wxSpr, PXA.weather, n); wxLabel.textContent = lv.name; wxHint.textContent = wxHints[n]; };
  Weather.init({ style: 'pixel', S });
  wxBtn.addEventListener('click', () => { sfx.tick(); wxSpr.classList.remove('hop'); void wxSpr.offsetWidth; wxSpr.classList.add('hop'); Weather.next(); say(Weather.levels[Weather.state].name + '.'); });

  /* =====================  BANANA BUTTONS + SLIDER  =====================
  const sounds = ['OOH OOH!', 'AHH AHH!', 'EEEEK!', 'HOO HOO HOO!', '*CHEST DRUMMING*'];
  let si = 0;
  $('#honkBtn').addEventListener('click', e => { sfx.boing(); burst(...centerOf(e.currentTarget), ['banana', 'i-monkey'], 8); say(sounds[si++ % sounds.length]); addScore(1, centerOf(e.currentTarget)); });
  $('#greenBtn').addEventListener('click', e => { sfx.boing(); burst(...centerOf(e.currentTarget), ['leaf', 'leaf2'], 8); say('NOT RIPE YET. PATIENCE.'); });
  const ripe = $('#ripeness'), ripeVal = $('#ripeVal'); let lastTick = -1;
  ripe.addEventListener('input', () => {
    ripeVal.textContent = ripe.value; const v = +ripe.value;
    if (Math.floor(v / 5) !== lastTick) { lastTick = Math.floor(v / 5); sfx.tick(); }
    say(v < 25 ? 'GREEN AS A LEAF.' : v < 60 ? 'GETTING THERE.' : v < 90 ? 'PERFECT.' : 'SPOTTY. BANANA BREAD.');
  });
  document.querySelectorAll('.crate.tilt').forEach(c => c.addEventListener('click', e => {
    e.preventDefault(); sfx.boing(); burst(...centerOf(c), [$('.crate-icon', c).dataset.spr], 6); addScore(1, centerOf(c));
  }));

  /* =====================  FIELD LOG FILLER  ===================== */
  const entries = ['Typed "To be or" before getting distracted by a beetle.', 'Banana inventory: unreliable.', 'Coconut #4 has opinions.',
    'Vine tension nominal. Monkey tension high.', 'Typewriter jammed. Blamed the intern.', 'Produced seven pages of the letter "q".',
    'Snack break ran 3 hours over.', 'Discovered a very good stick.', 'Canopy meeting adjourned (everyone left).', 'Accidentally wrote a sonnet. Edited out.',
    'Rain delay. Rain was loud.', 'New hire swung in from the east wing.'];
  const list = $('#logList');
  for (let i = 0; i < 24; i++) { const li = document.createElement('li'); li.textContent = `Day ${i + 1}: ${entries[i % entries.length]}`; list.appendChild(li); }

  /* =====================  HERO MONKEY  ===================== */
  const vine = $('#vine'), monkey = $('#monkey'), mCv = $('#monkeyCv');
  const hero = $('#heroMonkey'), hCv = $('#heroCv'), bubble = $('#hmBubble'), hit = $('#hmHit');
  const pupils = [$('#hmPL'), $('#hmPR')];
  const H = { a: 0, wild: null, busy: false, look: [0, 0], frame: null, expr: 'normal', t: 0 };
  hit.addEventListener('click', () => {
    if (H.busy) return; H.busy = true; H.expr = 'screech'; H.wild = { t: performance.now() };
    bubble.textContent = pick(['OOH OOH!', 'AHH AHH!', 'EEEK!', 'BANANA?!']); bubble.classList.add('show');
    sfx.monkey(); addScore(2, centerOf(hit));
    setTimeout(() => { H.busy = false; H.expr = 'normal'; bubble.classList.remove('show'); }, 1300);
  });
  addEventListener('pointermove', e => {
    if (hero.offsetParent === null) return;
    const r = hCv.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + 120;
    H.look = [Math.max(-1, Math.min(1, Math.round((e.clientX - cx) / 160))), Math.max(-1, Math.min(1, Math.round((e.clientY - cy) / 160)))];
  });
  function updateHero(now) {
    if (hero.offsetParent === null) return;
    let a = reduceMotion ? 0 : 0.2 * Math.sin(now / 1100);
    if (H.wild) { const dt = now - H.wild.t; a += 0.55 * Math.exp(-dt / 800) * Math.sin(dt / 120); if (dt > 4000) H.wild = null; }
    const shakeA = Mood.shakeAmp(now);
    if (shakeA > 0) a += 0.5 * shakeA * Math.sin(now / 55);
    a = Math.max(-0.6, Math.min(0.6, a));
    let ex = H.expr;
    if (ex === 'normal') { if (Mood.startle(now) || shakeA > 0) ex = 'screech'; else if (Mood.scared) ex = 'scared'; }
    const f = PXA.monkeyFrame('hero', ex, a, ex === 'normal', ex === 'screech' || H.wild ? Math.floor(now / 130) % 2 : Math.floor(now / 900) % 2, Mood.hat ? 1 : 0);
    if (f !== H.frame) { PXA.blit(hCv, f); H.frame = f; }
    hCv.style.transform = ex === 'scared' && !reduceMotion ? `translateX(${Math.floor(now / 70) % 2 ? S : 0}px)` : '';
    if (ex === 'normal') {
      const eyes = PXA.monkeyEyes('hero', a);
      pupils.forEach((p, i) => { p.style.display = 'block'; p.style.left = Math.round(hCv.offsetLeft + eyes[i][0] * S - 3 + H.look[0] * S) + 'px'; p.style.top = Math.round(hCv.offsetTop + eyes[i][1] * S - 5 + H.look[1] * S) + 'px'; });
    } else pupils.forEach(p => { p.style.display = 'none'; });
  }

  /* =====================  VINE SCROLLBAR + SWINGING MONKEY  ===================== */
  const state = { y: 0, angle: 0, vel: 0, lastY: 0, dragging: false, leafT: 0, blinkAt: 3000, blinkUntil: 0, frame: null, expr: 'normal' };
  const maxScroll = () => Math.max(1, root.scrollHeight - innerHeight);
  const travel = () => vine.clientHeight - (state.frame ? state.frame.H * S : 150);

  function frame(now) {
    const p = Math.min(1, Math.max(0, scrollY / maxScroll()));
    root.style.setProperty('--scroll', p.toFixed(4));
    const target = p * Math.max(0, travel());
    state.y += (target - state.y) * 0.18;
    const dy = state.y - state.lastY; state.lastY = state.y;

    state.vel += -dy * 0.012 + Math.sin(now / 700) * 0.0009;
    state.vel += -state.angle * 0.035; state.vel *= 0.94;
    state.angle = Math.max(-0.87, Math.min(0.87, state.angle + state.vel));

    Mood.update(now);
    if (now > state.blinkAt) { state.blinkUntil = now + 140; state.blinkAt = now + rand(2500, 5500); }
    const shakeA = Mood.shakeAmp(now), react = state.dragging || Mood.startle(now) || shakeA > 0;
    const angle = Math.max(-0.87, Math.min(0.87, state.angle + (shakeA > 0 ? 0.5 * shakeA * Math.sin(now / 55) : 0)));
    const expr = react ? 'screech' : Mood.scared ? 'scared' : now < state.blinkUntil ? 'blink' : 'normal';
    const moving = Math.abs(dy) > 0.5 || state.dragging || shakeA > 0, ph = moving ? Math.floor(now / 140) % 2 : Math.floor(now / 850) % 2;
    const f = PXA.monkeyFrame('vine', expr, angle, false, ph, Mood.hat ? 1 : 0);
    if (f !== state.frame) { PXA.blit(mCv, f); monkey.style.marginLeft = -(f.W * S / 2) + 'px'; state.frame = f; }
    const sx = Mood.scared && !react && !reduceMotion ? (Math.floor(now / 70) % 2 ? S : 0) : 0;
    monkey.style.transform = `translate(${sx}px, ${Math.round(state.y)}px)`;
    const wt = Weather.waterTop();                                   // dip his feet in the flood
    if (wt !== null) {
      const r = mCv.getBoundingClientRect(), inWater = r.bottom - 14 > wt;
      if (inWater && !state.inWater) { Weather.disturb(r.left + r.width / 2, 10); sfx.tick(); }
      state.inWater = inWater;
    } else state.inWater = false;

    if (Math.abs(dy) > 5 && now - state.leafT > 150) {
      state.leafT = now; const r = vine.getBoundingClientRect();
      fall(r.left + r.width / 2 + rand(-36, 36), r.top + state.y + 90, pick(['leaf', 'leaf2']), 1300);
    }
    updateHero(now);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---------- weather reactions (events come from mood.js) ---------- */
  let sayT = 0;
  function heroSay(text, ms = 1600) {
    if (hero.offsetParent === null || H.busy) return;
    bubble.textContent = text; bubble.classList.add('show'); clearTimeout(sayT); sayT = setTimeout(() => bubble.classList.remove('show'), ms);
  }
  const heroBox = () => hCv.getBoundingClientRect();
  Mood.on('weather', (n, prev) => heroSay(['SUNNY!', 'DRIZZLE...', 'IT\'S RAINING!', 'STORM!! EEK!'][n]));
  Mood.on('startle', () => {
    sfx.monkey(); if (hero.offsetParent !== null && !H.busy) { H.wild = { t: performance.now() }; heroSay('EEEK!', 1100); }
  });
  Mood.on('shake', () => {
    sfx.shake(); heroSay('SHAKE IT OFF!', 1500); if (hero.offsetParent !== null) H.wild = { t: performance.now() };
    const mr = mCv.getBoundingClientRect(); burst(mr.left + mr.width / 2, mr.top + mr.height * .5, ['drop', 'drop', 'coco-s'], 12);
    if (hero.offsetParent !== null) { const hr = heroBox(); burst(hr.left + hr.width / 2, hr.top + 150, ['drop', 'drop'], 14); }
  });
  Mood.on('drip', () => {
    const mr = mCv.getBoundingClientRect(); fall(mr.left + mr.width / 2 + rand(-24, 24), mr.bottom - 24, 'drop', 900);
    if (hero.offsetParent !== null && Math.random() < .6) { const hr = heroBox(); fall(hr.left + hr.width / 2 + rand(-36, 36), hr.top + 260, 'drop', 900); }
  });

  function scrollToPointer(clientY, smooth) {
    const rect = vine.getBoundingClientRect(), mh = state.frame ? state.frame.H * S : 150;
    const p = Math.min(1, Math.max(0, (clientY - rect.top - 20) / (rect.height - mh)));
    scrollTo({ top: p * maxScroll(), behavior: smooth ? 'smooth' : 'instant' });
  }
  vine.addEventListener('pointerdown', e => {
    vine.setPointerCapture(e.pointerId); state.dragging = true; root.style.scrollBehavior = 'auto';
    const onMonkey = monkey.contains(e.target);
    if (onMonkey) sfx.monkey();
    scrollToPointer(e.clientY, !onMonkey);
  });
  vine.addEventListener('pointermove', e => { if (state.dragging) scrollToPointer(e.clientY, false); });
  const stopDrag = () => { state.dragging = false; root.style.scrollBehavior = ''; };
  vine.addEventListener('pointerup', stopDrag); vine.addEventListener('pointercancel', stopDrag);

  /* =====================  EASTER EGG: type "banana"  ===================== */
  let typed = '';
  addEventListener('keydown', e => {
    if (e.target.matches('input, textarea') || e.key.length !== 1) return;
    typed = (typed + e.key.toLowerCase()).slice(-6);
    if (typed !== 'banana') return;
    typed = ''; banner('BANANA RAIN!'); addScore(5);
    if (reduceMotion) return;
    for (let i = 0; i < 40; i++) setTimeout(() => {
      const b = pfx('banana', rand(0, innerWidth), -60, pick([2, 3, 4])); b.style.zIndex = 250;
      b.animate([{ transform: 'translateY(0)' }, { transform: `translateY(${innerHeight + 160}px)` }], { duration: rand(1800, 3200), easing: 'steps(24)' }).onfinish = () => b.remove();
    }, i * 70);
  });

  /* =====================  TYPEWRITER OPS BRIDGE  =====================
     ops.js (the game) lives inside this page. It spends and earns the same bananas shown in the HUD,
     borrows the synth sounds, particles, banners and the hero monkey's speech bubble, and writes to the field log. */
  function spend(n) { if (n > score) return false; score -= n; paintScore(true); sfx.tick(); return true; }
  function logEntry(text) {
    const li = document.createElement('li'); li.className = 'real'; li.textContent = text;
    list.prepend(li); while (list.querySelectorAll('li.real').length > 40) list.querySelector('li.real:last-of-type')?.remove();
    return li;
  }
  const FX = { leaf: 'leaf', banana: 'banana', spark: 'spark', star: 'star', drop: 'drop', coco: 'coco-s', paw: 'paw' };
  window.IMI = {
    edition: 'pixel', S, reduceMotion, sfx, centerOf, say, banner, heroSay, log: logEntry,
    burst: (x, y, names, n) => burst(x, y, names.map(k => FX[k] || k), n),
    fall: (x, y, name, life) => fall(x, y, FX[name] || name, life),
    bananas: { get: () => score, spend, earn: (n, from) => addScore(n, from, true), watch: f => bananaWatchers.push(f) },
  };
})();

(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const rand = (a, b) => a + Math.random() * (b - a);
  const centerOf = el => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };

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
  const sfx = {
    peel()    { noise(.25, { freq: 3000, vol: .18 }); tone(300, .22, { type: 'triangle', f1: 800 }); tone(600, .18, { f1: 1200, delay: .12, vol: .1 }); },
    unpeel()  { tone(700, .25, { type: 'triangle', f1: 240 }); },
    crack()   { noise(.12, { freq: 900, vol: .5 }); tone(140, .18, { type: 'square', f1: 50, vol: .22 }); noise(.35, { freq: 5000, vol: .15, delay: .08 }); },
    shake()   { for (let i = 0; i < 4; i++) noise(.05, { freq: 700, vol: .25, delay: i * .1 }); },
    boing()   { tone(180, .35, { f1: 520, vol: .2 }); tone(520, .3, { f1: 220, delay: .12, vol: .12 }); },
    monkey()  { tone(520, .22, { type: 'sawtooth', f1: 380, vibrato: 90, vol: .09 }); tone(600, .22, { type: 'sawtooth', f1: 400, delay: .24, vibrato: 90, vol: .09 }); tone(760, .4, { type: 'sawtooth', f1: 300, delay: .5, vibrato: 140, vol: .09 }); },
    coin()    { tone(880, .09, { type: 'square', vol: .07 }); tone(1320, .2, { type: 'square', delay: .08, vol: .07 }); },
    drum()    { tone(220, .2, { type: 'sine', f1: 70, vol: .35 }); noise(.05, { freq: 300, vol: .3 }); },
    day()     { tone(523, .18, { type: 'triangle' }); tone(659, .18, { type: 'triangle', delay: .1 }); tone(784, .3, { type: 'triangle', delay: .2 }); },
    night()   { tone(784, .2, { type: 'triangle' }); tone(587, .2, { type: 'triangle', delay: .12 }); tone(392, .4, { type: 'triangle', delay: .24 }); },
    tick()    { tone(1200, .03, { type: 'square', vol: .03 }); },
    fanfare() { [523, 659, 784, 1047].forEach((f, i) => tone(f, .2, { type: 'square', delay: i * .1, vol: .08 })); },
  };
  const soundBtn = $('#soundBtn'), soundLabel = $('.drum-label', soundBtn);
  function paintSound() { soundBtn.setAttribute('aria-pressed', String(audio.on)); soundLabel.textContent = audio.on ? 'ON' : 'OFF'; }
  paintSound();
  soundBtn.addEventListener('click', () => { audio.on = !audio.on; localStorage.setItem('imi-sound', audio.on ? 'on' : 'off'); paintSound(); if (audio.on) sfx.drum(); });

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

  /* =====================  AMBIENT  ===================== */
  if (!reduceMotion) {
    const icons = ['🍃', '🍌', '🌿', '🥥', '🍃'], box = $('#drifters');
    for (let i = 0; i < 14; i++) {
      const s = document.createElement('span');
      s.textContent = icons[i % icons.length]; s.style.left = rand(0, 100) + '%'; s.style.fontSize = rand(18, 40) + 'px';
      s.style.animationDuration = rand(14, 30) + 's'; s.style.animationDelay = -rand(0, 30) + 's'; box.appendChild(s);
    }
  }
  const flies = $('#fireflies');
  for (let i = 0; i < 26; i++) {
    const s = document.createElement('span');
    s.style.left = rand(2, 96) + '%'; s.style.top = rand(15, 95) + '%';
    s.style.setProperty('--d', rand(5, 11) + 's'); s.style.setProperty('--dl', -rand(0, 10) + 's'); flies.appendChild(s);
  }

  /* =====================  REVEAL ON SCROLL  ===================== */
  const revealEls = document.querySelectorAll('.section-title, .section-sub, .crate, .log-scroll');
  revealEls.forEach(el => el.classList.add('reveal'));
  const io = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.15 });
  revealEls.forEach((el, i) => { el.style.transitionDelay = (i % 3) * 80 + 'ms'; io.observe(el); });

  /* =====================  PARTICLES  ===================== */
  function burst(x, y, glyphs, n = 12) {
    if (reduceMotion) return;
    for (let i = 0; i < n; i++) {
      const p = document.createElement('span');
      p.textContent = glyphs[i % glyphs.length];
      Object.assign(p.style, { position: 'fixed', left: x + 'px', top: y + 'px', fontSize: rand(16, 30) + 'px', pointerEvents: 'none', zIndex: 100 });
      document.body.appendChild(p);
      const ang = rand(0, Math.PI * 2), dist = rand(60, 150), dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist - 40;
      p.animate([
        { transform: 'translate(-50%,-50%) scale(.3) rotate(0)', opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1) rotate(${rand(0, 360)}deg)`, opacity: 1, offset: .6 },
        { transform: `translate(calc(-50% + ${dx * 1.1}px), calc(-50% + ${dy + 90}px)) scale(.8) rotate(540deg)`, opacity: 0 }
      ], { duration: rand(900, 1300), easing: 'cubic-bezier(.2,.7,.4,1)' }).onfinish = () => p.remove();
    }
  }
  function fall(x, y, glyph, size = 16, life = 1200) {
    if (reduceMotion) return;
    const p = document.createElement('span'); p.textContent = glyph;
    Object.assign(p.style, { position: 'fixed', left: x + 'px', top: y + 'px', fontSize: size + 'px', pointerEvents: 'none', zIndex: 90 });
    document.body.appendChild(p);
    const dx = rand(-30, 30);
    p.animate([{ transform: 'translate(-50%,-50%) rotate(0) scale(1)', opacity: .9 }, { transform: `translate(calc(-50% + ${dx}px), calc(-50% + 70px)) rotate(${rand(-200, 200)}deg) scale(.6)`, opacity: 0 }], { duration: life, easing: 'ease-in' }).onfinish = () => p.remove();
  }
  if (!reduceMotion && matchMedia('(pointer: fine)').matches) {
    let lx = 0, ly = 0, n = 0; const trail = ['🍃', '🍌', '🌿', '🥥'];
    addEventListener('pointermove', e => {
      if (Math.hypot(e.clientX - lx, e.clientY - ly) < 46) return;
      lx = e.clientX; ly = e.clientY; fall(lx, ly, trail[n++ % trail.length], rand(12, 20), 1100);
    });
    addEventListener('pointerdown', e => { if (!e.target.closest('button, a, .vine, .hero-monkey')) fall(e.clientX, e.clientY, '🐾', 26, 900); });
  }

  /* =====================  BANANA SCORE  ===================== */
  const hud = $('#hud'), scoreEl = $('#score');
  let score = +localStorage.getItem('imi-score') || 0;
  scoreEl.textContent = score;
  const milestones = { 10: 'Banana Hoarder!', 25: 'Certified Primate!', 50: 'Chief Banana Officer', 100: 'Infinite Monkey!' };
  function banner(text) {
    sfx.fanfare();
    const b = document.createElement('div'); b.className = 'banner'; b.textContent = '🍌 ' + text + ' 🍌'; document.body.appendChild(b);
    b.animate([
      { transform: 'translate(-50%, -140px) scale(.6) rotate(-6deg)', opacity: 0 }, { transform: 'translate(-50%, 0) scale(1.1) rotate(2deg)', opacity: 1, offset: .2 },
      { transform: 'translate(-50%, 0) scale(1) rotate(0)', opacity: 1, offset: .8 }, { transform: 'translate(-50%, -80px) scale(.9)', opacity: 0 }
    ], { duration: 2600, easing: 'ease-out' }).onfinish = () => b.remove();
    const [x, y] = centerOf(hud); burst(x, y + 60, ['🍌', '✨', '🎉'], 16);
  }
  function addScore(n, from) {
    const [fx, fy] = from || [innerWidth / 2, innerHeight / 2], [hx, hy] = centerOf(hud);
    const f = document.createElement('div'); f.className = 'fly-plus'; f.textContent = `+${n} 🍌`; f.style.left = fx + 'px'; f.style.top = fy + 'px'; document.body.appendChild(f);
    const done = () => {
      f.remove(); score += n; scoreEl.textContent = score; localStorage.setItem('imi-score', score);
      hud.classList.remove('bump'); void hud.offsetWidth; hud.classList.add('bump'); sfx.coin();
      Object.keys(milestones).forEach(m => { if (score - n < +m && score >= +m) banner(milestones[m]); });
    };
    if (reduceMotion) return done();
    f.animate([
      { transform: 'translate(-50%,-50%) scale(.5)', opacity: 0 }, { transform: 'translate(-50%,-90px) scale(1.3)', opacity: 1, offset: .3 },
      { transform: `translate(${hx - fx - f.offsetWidth / 2}px, ${hy - fy}px) scale(.6)`, opacity: .9 }
    ], { duration: 900, easing: 'cubic-bezier(.5,0,.3,1)' }).onfinish = done;
  }

  /* =====================  TOAST  ===================== */
  const toast = $('#toast');
  function say(msg) { toast.textContent = msg; toast.classList.remove('pop'); void toast.offsetWidth; toast.classList.add('pop'); }

  /* =====================  CONTROLS  ===================== */
  const banana = $('#bananaToggle'), bananaState = $('#bananaState');
  banana.addEventListener('click', () => {
    const on = banana.getAttribute('aria-checked') !== 'true';
    banana.setAttribute('aria-checked', String(on)); bananaState.textContent = on ? 'PEELED' : 'UNPEELED';
    if (on) { sfx.peel(); burst(...centerOf(banana), ['🍃', '✨', '🍌'], 9); addScore(1, centerOf(banana)); } else sfx.unpeel();
    say(on ? 'Peeled! Ready to eat.' : 'Good as new. Somehow.');
  });

  const coco = $('#coconutBtn'); let cocoBusy = false;
  coco.addEventListener('click', () => {
    if (cocoBusy) return; cocoBusy = true; coco.classList.add('shaking'); sfx.shake();
    setTimeout(() => {
      coco.classList.remove('shaking'); coco.classList.add('open'); sfx.crack();
      burst(...centerOf(coco), ['💧', '🥥', '💦'], 14); addScore(3, centerOf(coco)); say('Coconut cracked. Hydrate.');
    }, 480);
    setTimeout(() => { coco.classList.remove('open'); cocoBusy = false; }, 2600);
  });

  const nightBtn = $('#nightToggle'), nightHint = $('#nightHint');
  function setNight(on, announce) {
    document.body.classList.toggle('night', on); nightBtn.setAttribute('aria-checked', String(on));
    nightHint.textContent = on ? 'Night. Fireflies on shift.' : 'Daytime. Monkeys are loud.';
    if (announce) { (on ? sfx.night : sfx.day)(); say(on ? 'Lights out.' : 'Rise and shine.'); }
    localStorage.setItem('imi-night', on ? '1' : '0');
  }
  nightBtn.addEventListener('click', () => setNight(nightBtn.getAttribute('aria-checked') !== 'true', true));
  if (localStorage.getItem('imi-night') === '1') setNight(true, false);

  /* =====================  WEATHER (shared module)  ===================== */
  const wxBtn = $('#weatherBtn'), wxLabel = $('#wxState'), wxHint = $('#wxHint');
  const wxHints = ['Click to make it rain.', 'A light drizzle. Cozy.', 'Proper rain. Water is rising.', 'STORM! Hold on to your vines.'];
  const wxSay = ['Clear skies.', 'Drizzle…', 'Rain!', 'STORM!'];
  Weather.onChange = (n, lv) => { wxBtn.dataset.state = n; wxLabel.textContent = lv.name; wxHint.textContent = wxHints[n]; };
  Weather.init({ style: 'classic' });
  wxBtn.addEventListener('click', () => { sfx.tick(); Weather.next(); say(wxSay[Weather.state]); });

  const sounds = ['Ooh ooh!', 'Ahh ahh!', 'EEEEK!', 'Hoo hoo hoo!', '*chest drumming*']; let si = 0;
  $('#honkBtn').addEventListener('click', e => { sfx.boing(); burst(...centerOf(e.currentTarget), ['🍌', '🐵'], 8); say(sounds[si++ % sounds.length]); addScore(1, centerOf(e.currentTarget)); });
  $('#greenBtn').addEventListener('click', e => { sfx.boing(); burst(...centerOf(e.currentTarget), ['🍃', '🌿'], 8); say('Not ripe yet. Patience.'); });
  const ripe = $('#ripeness'), ripeVal = $('#ripeVal'); let lastTick = -1;
  ripe.addEventListener('input', () => {
    ripeVal.textContent = ripe.value; const v = +ripe.value;
    if (Math.floor(v / 5) !== lastTick) { lastTick = Math.floor(v / 5); sfx.tick(); }
    say(v < 25 ? 'Green as a leaf.' : v < 60 ? 'Getting there.' : v < 90 ? 'Perfect.' : 'Spotty. Banana bread time.');
  });
  document.querySelectorAll('.crate.tilt').forEach(c => c.addEventListener('click', e => {
    e.preventDefault(); sfx.boing(); burst(...centerOf(c), [$('.crate-icon', c).textContent], 6); addScore(1, centerOf(c));
  }));

  const entries = ['Typed "To be or" before getting distracted by a beetle.', 'Banana inventory: unreliable.', 'Coconut #4 has opinions.',
    'Vine tension nominal. Monkey tension high.', 'Typewriter jammed. Blamed the intern.', 'Produced seven pages of the letter "q".',
    'Snack break ran 3 hours over.', 'Discovered a very good stick.', 'Canopy meeting adjourned (everyone left).', 'Accidentally wrote a sonnet. Edited out.',
    'Rain delay. Rain was loud.', 'New hire swung in from the east wing.'];
  const list = $('#logList');
  for (let i = 0; i < 24; i++) { const li = document.createElement('li'); li.textContent = `Day ${i + 1}: ${entries[i % entries.length]}`; list.appendChild(li); }

  /* =====================  HERO MONKEY (eyes follow cursor)  ===================== */
  const vine = $('#vine'), monkey = $('#monkey'), hero = $('#heroMonkey'), bubble = $('#hmBubble');
  hero.insertAdjacentHTML('beforeend', $('svg', monkey).outerHTML.replace(/width="64" height="88"/, ''));
  let bubbleTimer = 0, heroBusy = false;
  hero.addEventListener('click', () => {
    if (heroBusy) return; heroBusy = true;
    hero.classList.add('wild', 'screech'); bubble.textContent = ['OOH OOH!', 'AHH AHH!', 'EEEK!', 'BANANA?!'][Math.floor(Math.random() * 4)];
    bubble.classList.add('show'); sfx.monkey(); addScore(2, centerOf(hero));
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => { hero.classList.remove('wild', 'screech'); bubble.classList.remove('show'); heroBusy = false; }, 1200);
  });
  const pupils = [...hero.querySelectorAll('.m-pupil')];
  addEventListener('pointermove', e => {
    if (hero.offsetParent === null) return;
    const [cx, cy] = centerOf($('svg', hero));
    const a = Math.atan2(e.clientY - (cy - 20), e.clientX - cx), d = Math.min(1.6, Math.hypot(e.clientX - cx, e.clientY - cy) / 150);
    pupils.forEach(p => { p.style.transform = `translate(${(Math.cos(a) * d).toFixed(2)}px, ${(Math.sin(a) * d).toFixed(2)}px)`; });
  });

  /* =====================  VINE SCROLLBAR + SWINGING MONKEY  ===================== */
  const state = { y: 0, angle: 0, vel: 0, lastY: 0, dragging: false, movingTimer: 0, leafT: 0 };
  const maxScroll = () => Math.max(1, root.scrollHeight - innerHeight);
  const travel = () => vine.clientHeight - monkey.offsetHeight;
  function frame(now) {
    const p = Math.min(1, Math.max(0, scrollY / maxScroll()));
    root.style.setProperty('--scroll', p.toFixed(4));
    state.y += (p * travel() - state.y) * 0.18;
    const dy = state.y - state.lastY; state.lastY = state.y;
    state.vel += -dy * 0.012 + Math.sin(now / 700) * 0.0009; state.vel += -state.angle * 0.035; state.vel *= 0.94;
    state.angle = Math.max(-0.95, Math.min(0.95, state.angle + state.vel));
    Mood.update(now);
    const shakeA = Mood.shakeAmp(now), startle = Mood.startle(now) || shakeA > 0;
    const ang = state.angle + (shakeA > 0 ? 0.5 * shakeA * Math.sin(now / 55) : 0);
    monkey.style.transform = `translateY(${state.y.toFixed(1)}px) rotate(${(ang * 57.3).toFixed(2)}deg)`;
    monkey.classList.toggle('rainy', Mood.hat); monkey.classList.toggle('startle', startle);
    monkey.classList.toggle('scared', Mood.scared && !startle && !state.dragging); monkey.classList.toggle('shiver', Mood.scared && !reduceMotion);
    hero.classList.toggle('rainy', Mood.hat); hero.classList.toggle('startle', startle);
    hero.classList.toggle('scared', Mood.scared && !startle && !heroBusy); hero.classList.toggle('shiver', Mood.scared && !reduceMotion && !hero.classList.contains('shake') && !hero.classList.contains('wild'));
    const wt = Weather.waterTop();                                     // dip his feet in the flood
    if (wt !== null) {
      const r = monkey.getBoundingClientRect(), inWater = r.bottom - 10 > wt;
      if (inWater && !state.inWater) { Weather.disturb(r.left + r.width / 2, 10); sfx.tick(); }
      state.inWater = inWater;
    } else state.inWater = false;
    if (Math.abs(dy) > 0.4) { monkey.classList.add('moving'); clearTimeout(state.movingTimer); state.movingTimer = setTimeout(() => monkey.classList.remove('moving'), 250); }
    if (Math.abs(dy) > 5 && now - state.leafT > 140) { state.leafT = now; const r = vine.getBoundingClientRect(); fall(r.left + r.width / 2 + rand(-18, 18), r.top + state.y + 40, '🍃', rand(12, 20), 1300); }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---------- weather reactions (events come from mood.js) ---------- */
  let sayT = 0;
  function heroSay(text, ms = 1600) {
    if (hero.offsetParent === null || heroBusy) return;
    bubble.textContent = text; bubble.classList.add('show'); clearTimeout(sayT); sayT = setTimeout(() => bubble.classList.remove('show'), ms);
  }
  Mood.on('weather', n => heroSay(['Sunny!', 'Drizzle…', "It's raining!", 'STORM!! EEK!'][n]));
  Mood.on('startle', () => {
    sfx.monkey(); if (hero.offsetParent !== null && !heroBusy) { hero.classList.add('wild'); setTimeout(() => hero.classList.remove('wild'), 1100); heroSay('EEEEK!', 1100); }
  });
  Mood.on('shake', () => {
    sfx.shake(); heroSay('Shake it off!', 1500);
    hero.classList.add('shake'); setTimeout(() => hero.classList.remove('shake'), 1500);
    const mr = monkey.getBoundingClientRect(); burst(mr.left + mr.width / 2, mr.top + mr.height * .5, ['💧', '💦', '💧'], 12);
    if (hero.offsetParent !== null) { const hr = hero.getBoundingClientRect(); burst(hr.left + hr.width / 2, hr.top + 260, ['💧', '💦'], 14); }
  });
  Mood.on('drip', () => {
    const mr = monkey.getBoundingClientRect(); fall(mr.left + mr.width / 2 + rand(-18, 18), mr.bottom - 14, '💧', 16, 900);
    if (hero.offsetParent !== null && Math.random() < .6) { const hr = hero.getBoundingClientRect(); fall(hr.left + hr.width / 2 + rand(-30, 30), hr.top + 300, '💧', 18, 900); }
  });

  function scrollToPointer(clientY, smooth) {
    const rect = vine.getBoundingClientRect(), mh = monkey.offsetHeight;
    const p = Math.min(1, Math.max(0, (clientY - rect.top - mh * 0.1) / (rect.height - mh)));
    scrollTo({ top: p * maxScroll(), behavior: smooth ? 'smooth' : 'instant' });
  }
  vine.addEventListener('pointerdown', e => {
    vine.setPointerCapture(e.pointerId); state.dragging = true; root.style.scrollBehavior = 'auto';
    const onMonkey = monkey.contains(e.target);
    if (onMonkey) { monkey.classList.add('screech'); sfx.monkey(); }
    scrollToPointer(e.clientY, !onMonkey);
  });
  vine.addEventListener('pointermove', e => { if (state.dragging) scrollToPointer(e.clientY, false); });
  const stopDrag = () => { state.dragging = false; root.style.scrollBehavior = ''; monkey.classList.remove('screech'); };
  vine.addEventListener('pointerup', stopDrag); vine.addEventListener('pointercancel', stopDrag);

  /* =====================  EASTER EGG: type "banana"  ===================== */
  let typed = '';
  addEventListener('keydown', e => {
    if (e.target.matches('input, textarea') || e.key.length !== 1) return;
    typed = (typed + e.key.toLowerCase()).slice(-6);
    if (typed !== 'banana') return;
    typed = ''; banner('BANANA RAIN!'); addScore(5);
    if (reduceMotion) return;
    for (let i = 0; i < 45; i++) setTimeout(() => {
      const b = document.createElement('span'); b.textContent = '🍌';
      Object.assign(b.style, { position: 'fixed', left: rand(0, 100) + 'vw', top: '-60px', fontSize: rand(28, 60) + 'px', zIndex: 250, pointerEvents: 'none' });
      document.body.appendChild(b);
      b.animate([{ transform: 'translateY(0) rotate(0)' }, { transform: `translateY(${innerHeight + 140}px) rotate(${rand(-540, 540)}deg)` }], { duration: rand(1800, 3200), easing: 'cubic-bezier(.4,0,.9,.6)' }).onfinish = () => b.remove();
    }, i * 60);
  });
})();

// Usage: node tools/balance.mjs [minutes=480] [profile=active|idle] [strategy=collect|hoard] [seed=1] [activeMinutes=180] ['tuneJSON']
// Serves nothing itself: start `python -m http.server 8123` in the repo root first. Needs puppeteer-core and a local Chrome.
import puppeteer from 'puppeteer-core';
const [, , minutes = '480', profile = 'active', strategy = 'collect', seed = '1', activeMinutes = '180', tune = '{}'] = process.argv;
const chrome = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const b = await puppeteer.launch({ executablePath: chrome, headless: 'new', args: ['--no-sandbox'], protocolTimeout: 0 });
const p = await b.newPage();
await p.evaluateOnNewDocument(t => { window.__TUNE = JSON.parse(t); }, tune);
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('http://localhost:8123/tools/balance.html', { waitUntil: 'load' });
await p.evaluate(o => Bot.start(o), { profile, strategy, seed: +seed, activeMinutes: +activeMinutes });
const t0 = Date.now(); let last;
for (let m = 0; m < +minutes; m += 30) { last = await p.evaluate(n => Bot.run(n), Math.min(30, +minutes - m)); if (Date.now() - t0 > +(process.env.GUARD || 60) * 1000) { console.log('(stopped early: wall-clock guard, economy is probably exploding)'); break; } }
const rep = await p.evaluate(() => Bot.report());
console.log(`profile=${profile} strategy=${strategy} seed=${seed} simulated ${minutes} min in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
console.log('MILESTONES (minutes):'); for (const [k, v] of rep.marks) console.log('  ' + k.padEnd(18) + v);
console.log('SAMPLES every 10 min (last):'); for (const s of rep.samples.filter((_, i) => i % 6 === 5 || i === rep.samples.length - 1).slice(-12)) console.log('  ' + JSON.stringify(s));
if (errs.length) console.log('ERRORS', errs.slice(0, 5));
await b.close();

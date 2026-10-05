// Usage: node tools/sweep.mjs <profile> <minutes> <activeMinutes> <seeds> '<name>=<tuneJSON>' ['<name>=<tuneJSON>' ...]
// Runs each tuning config over several seeds and prints the median minute each milestone was reached ("-" = not reached).
// Start `python -m http.server 8123` in the repo root first.
import puppeteer from 'puppeteer-core';
const [, , profile, minutes, activeMinutes, seedCount, ...cfgs] = process.argv;
const chrome = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const KEYS = ['titles_1', 'titles_6', 'desk_rose', 'desk_blue', 'titles_16', 'desk_amber', 'first_division', 'first_star', 'desk_orchid', 'desk_moon'];
const guard = +(process.env.GUARD || 40) * 1000;
const b = await puppeteer.launch({ executablePath: chrome, headless: 'new', args: ['--no-sandbox'], protocolTimeout: 0 });
async function one(tune, seed) {
  const p = await b.newPage();
  await p.evaluateOnNewDocument(t => { window.__TUNE = JSON.parse(t); }, JSON.stringify(tune));
  await p.goto('http://localhost:8123/tools/balance.html', { waitUntil: 'load' });
  await p.evaluate(o => Bot.start(o), { profile, keeperDef: 0, seed, activeMinutes: +activeMinutes });
  const t0 = Date.now(); let early = false;
  for (let m = 0; m < +minutes; m += 30) { await p.evaluate(n => Bot.run(n), Math.min(30, +minutes - m)); if (Date.now() - t0 > guard) { early = true; break; } }
  const rep = await p.evaluate(() => Bot.report()); await p.close();
  const map = Object.fromEntries(rep.marks); const last = rep.samples[rep.samples.length - 1] || {};
  return { map, early, last };
}
const med = a => { const v = a.filter(x => x != null).sort((x, y) => x - y); return v.length < a.length / 2 ? '-' : v[Math.floor(v.length / 2)]; };
console.log(`profile=${profile} minutes=${minutes} active=${activeMinutes}m seeds=${seedCount}`);
console.log('config'.padEnd(14) + KEYS.map(k => k.replace('titles_', 't').replace('desk_', 'd_').replace('first_', 'f_').padStart(9)).join('') + '   (earned@end)');
for (const c of cfgs) {
  const i = c.indexOf('='), name = c.slice(0, i), tune = JSON.parse(c.slice(i + 1) || '{}');
  const rs = []; for (let s = 1; s <= +seedCount; s++) rs.push(await one(tune, s));
  const row = KEYS.map(k => String(med(rs.map(r => r.map[k]))).padStart(9)).join('');
  const earned = med(rs.map(r => r.last.earned ? Math.round(Math.log10(r.last.earned) * 10) / 10 : null));
  console.log(name.padEnd(14) + row + `   10^${earned}${rs.some(r => r.early) ? '  (guard hit)' : ''}`);
}
await b.close();

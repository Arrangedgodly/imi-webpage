// Usage: node tools/sweep.mjs <profile> <minutes> <activeMinutes> <seeds> '<name>=<tuneJSON>' ['<name>=<tuneJSON>' ...]
// Runs each tuning config over several seeds and prints the median minute each milestone was reached ("-" = not reached).
// HOARD_AT=0.5 sets the hoard strategy's pause threshold (share of the next hire/upgrade cost already held).
// Each config runs under both bot strategies (STRATS=collect,hoard by default; e.g. STRATS=collect to run one).
// Start `python -m http.server 8123` in the repo root first.
import puppeteer from 'puppeteer-core';
const [, , profile, minutes, activeMinutes, seedCount, ...cfgs] = process.argv;
const chrome = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const KEYS = (process.env.KEYS || 'typist_1,titles_1,titles_3,kids_25,hibiscus,titles_16,lagoon,honeycomb,first_division,first_star').split(',');
const STRATS = (process.env.STRATS || 'collect,hoard').split(',');
const guard = +(process.env.GUARD || 40) * 1000;
const b = await puppeteer.launch({ executablePath: chrome, headless: 'new', args: ['--no-sandbox'], protocolTimeout: 0 });
const errs = [];
async function one(tune, seed, strategy) {
  const p = await b.newPage();
  await p.evaluateOnNewDocument(t => { window.__TUNE = JSON.parse(t); }, JSON.stringify(tune));
  p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8123/tools/balance.html', { waitUntil: 'load' });
  await p.evaluate(o => Bot.start(o), { profile, strategy, seed, activeMinutes: +activeMinutes, hoardAt: process.env.HOARD_AT == null ? undefined : +process.env.HOARD_AT });
  const t0 = Date.now(); let early = false;
  for (let m = 0; m < +minutes; m += 30) { await p.evaluate(n => Bot.run(n), Math.min(30, +minutes - m)); if (process.env.PROGRESS) console.error(strategy, profile, 'seed', seed, 'at', m + 30, 'min', Math.round((Date.now() - t0) / 1000) + 's'); if (Date.now() - t0 > guard) { early = true; break; } }
  const rep = await p.evaluate(() => Bot.report()); await p.close();
  const map = Object.fromEntries(rep.marks); const last = rep.samples[rep.samples.length - 1] || {};
  return { map, early, last };
}
const med = a => { const v = a.filter(x => x != null).sort((x, y) => x - y); return v.length < a.length / 2 ? '-' : v[Math.floor(v.length / 2)]; };
console.log(`profile=${profile} minutes=${minutes} active=${activeMinutes}m seeds=${seedCount}`);
console.log('config'.padEnd(22) + KEYS.map(k => k.replace('titles_', 't').replace('first_', 'f_').replace('typist_', 'typ').replace('honeycomb', 'honey').replace('first_division','f_div').padStart(9)).join('') + '   (earned@end)');
const LASTKEYS = ['paws', 'ups', 'sold', 'kids'];
for (const c of cfgs) {
  const i = c.indexOf('='), name = c.slice(0, i), tune = JSON.parse(c.slice(i + 1) || '{}');
  for (const strat of STRATS) {
    const rs = []; for (let s = 1; s <= +seedCount; s++) rs.push(await one(tune, s, strat));
    const row = KEYS.map(k => String(med(rs.map(r => r.map[k]))).padStart(9)).join('');
    const earned = med(rs.map(r => r.last.earned ? Math.round(Math.log10(r.last.earned) * 10) / 10 : null));
    const end = LASTKEYS.map(k => k + '=' + med(rs.map(r => r.last[k] == null ? null : r.last[k]))).join(' ');
    console.log((name + ':' + strat).padEnd(22) + row + `   10^${earned} ${end}${rs.some(r => r.early) ? '  (guard hit)' : ''}`);
  }
}
if (errs.length) console.log('PAGE ERRORS', errs.slice(0, 5)); else console.log('no page errors');
await b.close();

// node tools/balance.mjs [minutes=480] [active|idle] [collect|hoard] [seed=1] [activeMinutes=180] [tuneJSON]
// Optional pairs: --url URL --output report.json --commit SHA --session 15 --away 480.
// Overnight: --session is the initial session within minutes; --away adds offline time before the remaining online minutes.
import { writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { setTimeout as wait } from 'node:timers/promises';
import { createHash } from 'node:crypto';
const args = process.argv.slice(2), positional = [], flags = {};
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--')) {
    const key = args[i].slice(2);
    if (!['url', 'output', 'commit', 'session', 'away'].includes(key) || args[i + 1] == null) throw new Error('Invalid option ' + args[i]);
    flags[key] = args[++i];
  } else positional.push(args[i]);
}
const [minutesArg = '480', profile = 'active', strategyArg = 'collect', seedArg = '1', activeArg = '180', tuneArg = '{}'] = positional;
const minutes = +minutesArg, seed = +seedArg, activeMinutes = +activeArg, awayMinutes = +(flags.away || 0), sessionMinutes = flags.session == null ? minutes : +flags.session;
const strategy = strategyArg === '0' ? 'collect' : strategyArg === '1' ? 'hoard' : strategyArg;
const guardMs = +(process.env.GUARD || 60) * 1000, tune = JSON.parse(process.env.BALANCE_TUNE || tuneArg);
if (!tune || typeof tune !== 'object' || Array.isArray(tune) || positional.length > 6 || ['BOT_PICKUP_EVERY', 'BOT_GOLD_EVERY'].some(key => tune[key] != null && (!Number.isInteger(+tune[key]) || +tune[key] < 0))) throw new Error('Invalid tuning or reward cadence');
if (![minutes, activeMinutes, awayMinutes, sessionMinutes].every(n => Number.isFinite(n) && n >= 0) || sessionMinutes > minutes || !Number.isInteger(seed) || !['active', 'idle'].includes(profile) || !['collect', 'hoard'].includes(strategy) || !Number.isFinite(guardMs) || guardMs <= 0) throw new Error('Invalid balance run arguments');
const url = flags.url || 'http://localhost:8123/tools/balance.html';
const { default: puppeteer } = await import(process.env.PUPPETEER_MODULE ? pathToFileURL(process.env.PUPPETEER_MODULE).href : 'puppeteer-core');
const browser = await puppeteer.launch({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'], protocolTimeout: 0 });
const errors = [], httpErrors = [], sourceHashes = {}, hashReads = [], t0 = Date.now(); let page, report, overnight, timer, stopped = null;
try {
  page = await browser.newPage();
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', response => {
    const path = new URL(response.url()).pathname;
    if (response.status() >= 400 && path !== '/favicon.ico') httpErrors.push({ url: response.url(), status: response.status() });
    if (response.ok() && /\/(?:ops|economy|world|bot)\.js$|\/tools\/balance\.html$|\/library\/(?:books|archives)\.json$/.test(path)) hashReads.push(response.buffer().then(body => { sourceHashes[path] = createHash('sha256').update(body).digest('hex'); }).catch(error => errors.push('Source hash: ' + error.message)));
  });
  page.on('requestfailed', request => errors.push(request.url() + ': ' + request.failure().errorText));
  await page.evaluateOnNewDocument(t => { window.__TUNE = t; }, tune);
  await page.goto(url, { waitUntil: 'load' });
  // Concurrent Chrome starts can deliver a stale load event. Poll outside the virtual timers.
  for (let attempt = 0; attempt < 100 && !await page.evaluate(() => !!window.Bot); attempt++) await wait(100);
  await page.evaluate(opts => Bot.start(opts), { profile, strategy, seed, activeMinutes });
  const client = await page.createCDPSession();
  timer = setTimeout(() => { stopped = 'wall-clock guard'; void client.send('Runtime.terminateExecution').catch(() => {}); }, Math.max(1, guardMs - (Date.now() - t0)));
  let actual = 0;
  for (const end of awayMinutes ? [sessionMinutes, minutes] : [minutes]) {
    while (actual < end) {
      if (Date.now() - t0 >= guardMs) { stopped = 'wall-clock guard'; break; }
      // One minute bounds how far the next guard check can overshoot.
      actual = await page.evaluate(n => Bot.run(n), Math.min(1, end - actual));
    }
    if (stopped) break;
    if (awayMinutes && !overnight) overnight = await page.evaluate(n => Bot.away(n), awayMinutes);
  }
  report = await page.evaluate(() => Bot.report());
} catch (error) {
  if (!stopped) { stopped = 'simulation error'; errors.push(error.message); }
  if (page) report = await page.evaluate(() => window.Bot && Bot.report()).catch(() => null);
} finally {
  clearTimeout(timer);
  await Promise.all(hashReads);
  await browser.close();
}
const result = { capturedAt: new Date().toISOString(), sourceCommit: flags.commit || null, sourceHashes, url, profile, strategy, seed, activeMinutes, tune, requestedMinutes: minutes, requestedAwayMinutes: awayMinutes, sessionMinutes,
  actualMinutes: report ? report.actualMinutes : 0, complete: !!report && report.actualMinutes >= minutes && (!awayMinutes || !!overnight) && !stopped && !errors.length && !httpErrors.length,
  stopped, wallSeconds: +(Date.now() - t0).toFixed(3) / 1000, errors, httpErrors, overnight, report,
  pickupEverySeconds: +tune.BOT_PICKUP_EVERY || 0, goldCheckEverySeconds: +tune.BOT_GOLD_EVERY || 0,
  omittedSystems: ['Muses', 'garden', ...(+tune.BOT_GOLD_EVERY > 0 ? ['rotten catches'] : ['golden and rotten catches']), 'daily crates', ...(+tune.BOT_PICKUP_EVERY > 0 ? [] : ['ordinary pickups']), 'continuous tap streaks', 'market timing decisions', 'challenges', 'prestige action', 'manual word banking', 'interactive onboarding'] };
if (flags.output) await writeFile(flags.output, JSON.stringify(result, null, 2) + '\n');
console.log(`profile=${profile} strategy=${strategy} seed=${seed} simulated ${result.actualMinutes}/${minutes} online min, ${report ? report.awayMinutes : 0} away min in ${result.wallSeconds.toFixed(1)}s${stopped ? ' (' + stopped + ')' : ''}`);
if (report) {
  console.log('MILESTONES (online minutes):'); for (const [key, value] of report.marks) console.log('  ' + key.padEnd(18) + value);
  console.log('FINAL:', JSON.stringify(report.final));
}
if (errors.length) console.log('ERRORS', errors);
if (httpErrors.length) console.log('HTTP ERRORS', httpErrors);
if (!result.complete) process.exitCode = 1;

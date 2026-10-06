// Dev helper (needs puppeteer-core + Chrome; see docs/plan/README.md). node shot.mjs <url> <w> <h> <out.png> [script.js] [mobile=1]
import puppeteer from 'puppeteer-core';
import fs from 'fs';
const [, , url, w = '1280', h = '800', out = 'shot.png', script, mobile] = process.argv;
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox', '--enable-precise-memory-info'], protocolTimeout: 120000 });
const page = await b.newPage();
await page.setViewport({ width: +w, height: +h, deviceScaleFactor: mobile ? 2 : 1, isMobile: !!mobile, hasTouch: !!mobile });
const errs = [];
page.on('pageerror', e => errs.push('PAGEERR ' + e.message));
page.on('console', m => { if (['error', 'warning'].includes(m.type())) errs.push(m.type() + ' ' + m.text()); });
page.on('response', r => { if (r.status() >= 400) errs.push('HTTP ' + r.status() + ' ' + r.url()); });
page.on('requestfailed', r => { if (!/fonts\.g/.test(r.url())) errs.push('REQFAIL ' + r.url()); });
await page.goto(url, { waitUntil: 'load' });
await new Promise(r => setTimeout(r, 3500));
let res;
if (script) { const fn = new (Object.getPrototypeOf(async function () {}).constructor)('page', 'sleep', fs.readFileSync(script, 'utf8')); res = await fn(page, ms => new Promise(r => setTimeout(r, ms))); }
await page.screenshot({ path: out });
if (res !== undefined) console.log(JSON.stringify(res, null, 1));
if (errs.length) console.log('ERRORS:\n' + [...new Set(errs)].slice(0, 20).join('\n'));
await b.close();

// Dev helper (needs puppeteer-core + Chrome; see docs/plan/README.md). node tools/make-icons.mjs
// Renders icons/favicon.svg and icons/maskable.svg into the PNGs and favicon.ico the site and the web manifest point at.
import puppeteer from 'puppeteer-core';
import fs from 'fs';
const here = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const svg = f => fs.readFileSync(here + 'icons/' + f, 'utf8');
const JOBS = [['favicon.svg', 'favicon-32.png', 32], ['favicon.svg', 'icon-192.png', 192], ['favicon.svg', 'icon-512.png', 512], ['maskable.svg', 'icon-maskable-512.png', 512], ['maskable.svg', 'apple-touch-icon.png', 180]];
const b = await puppeteer.launch({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'] });
const page = await b.newPage();
for (const [src, out, n] of JOBS) {
  await page.setViewport({ width: n, height: n, deviceScaleFactor: 1 });
  await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:${n}px;height:${n}px}</style>${svg(src)}`);
  await page.screenshot({ path: here + 'icons/' + out, omitBackground: true, clip: { x: 0, y: 0, width: n, height: n } });
}
await b.close();
// favicon.ico: one 32px PNG inside an ICO container (every current browser reads this)
const png = fs.readFileSync(here + 'icons/favicon-32.png'), h = Buffer.alloc(22);
h.writeUInt16LE(0, 0); h.writeUInt16LE(1, 2); h.writeUInt16LE(1, 4); h[6] = 32; h[7] = 32; h.writeUInt16LE(1, 10); h.writeUInt16LE(32, 12); h.writeUInt32LE(png.length, 14); h.writeUInt32LE(22, 18);
fs.writeFileSync(here + 'favicon.ico', Buffer.concat([h, png]));
console.log('icons written');

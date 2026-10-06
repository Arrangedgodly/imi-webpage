// Pulls the Infinite Monkey Industries library into ./library for the site.
// Usage: node sync-library.mjs [path-to-monkey-library-checkout]
// With no argument it shallow-clones https://github.com/Arrangedgodly/monkey-library to a temp dir.
import { cpSync, rmSync, mkdirSync, mkdtempSync, readdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, 'library');
const SHELVES = ['stories', 'songs', 'tv-shows', 'radio-plays', 'sketches', 'films', 'kid-stories'];

let src = process.argv[2];
if (!src) {
  src = mkdtempSync(join(tmpdir(), 'monkey-library-'));
  execFileSync('git', ['clone', '--depth', '1', 'https://github.com/Arrangedgodly/monkey-library', src], { stdio: 'inherit' });
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const f of ['books.json', 'archives.json', 'kids.json']) cpSync(join(src, f), join(out, f));
let n = 0;
for (const shelf of SHELVES) {
  mkdirSync(join(out, shelf));
  for (const f of readdirSync(join(src, shelf))) {
    if (!f.endsWith('.md') || f === 'README.md') continue;
    cpSync(join(src, shelf, f), join(out, shelf, f)); n++;
  }
}
console.log(`Synced ${n} manuscripts into ${out}`);

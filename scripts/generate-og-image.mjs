/**
 * Generates public/images/brand/og-share.jpg — the 1200x630 picture that
 * WhatsApp, Facebook and X show when a page of the site is shared.
 *
 * It is only the existing logo and the site's own wordmark (same fonts and
 * colours as the header) centred on plain white, matching the logo intro. No
 * new artwork. Re-run if the logo or wordmark changes:
 *
 *   npm install --no-save playwright && npx playwright install chromium
 *   node scripts/generate-og-image.mjs
 */
import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT } from './lib/loadSrc.mjs';

const font = (pkg, file) => pathToFileURL(path.join(ROOT, 'node_modules', '@fontsource', pkg, 'files', file)).href;
const logo = pathToFileURL(path.join(ROOT, 'public/images/brand/shivdev-holidays-logo.png')).href;

const html = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:PF;font-weight:700;src:url(${font('playfair-display', 'playfair-display-latin-700-normal.woff2')})}
@font-face{font-family:PF;font-weight:500;src:url(${font('playfair-display', 'playfair-display-latin-500-normal.woff2')})}
html,body{margin:0;background:#fff}
.c{width:1200px;height:630px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:26px}
img{width:330px;height:330px;object-fit:contain;display:block}
.w{display:flex;flex-direction:column;align-items:center;gap:14px;line-height:1;white-space:nowrap}
.m{font:700 84px PF;letter-spacing:.083em;margin-right:-.083em;color:#1e293b}
.s{font:500 52px PF;letter-spacing:.235em;margin-right:-.235em;text-transform:uppercase;color:#1e293b}
</style><div class="c"><img src="${logo}"><div class="w"><span class="m">Shivdev</span><span class="s">Holidays</span></div></div>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
// A file:// page (not setContent) so the local logo and font files may load.
const htmlFile = path.join(os.tmpdir(), 'shivdev-og-share.html');
await writeFile(htmlFile, html, 'utf8');
await page.goto(pathToFileURL(htmlFile).href, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0));
await page.screenshot({ path: path.join(ROOT, 'public/images/brand/og-share.jpg'), type: 'jpeg', quality: 90 });
await browser.close();
console.log('wrote public/images/brand/og-share.jpg (1200x630)');

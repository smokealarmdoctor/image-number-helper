// Drives the real extension in Chromium and saves raw shots to marketing/.raw/
// Usage: node marketing/capture.cjs   (needs Playwright + Chromium)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const http = require('http');

const ROOT = path.resolve(__dirname, '..');
const EXT = path.join(ROOT, 'extension');
const OUT = path.join(__dirname, '.raw');
const SITE = path.join(__dirname, 'demo-site');
fs.mkdirSync(OUT, { recursive: true });

function serve(dir, port) {
  const types = { '.html': 'text/html', '.svg': 'image/svg+xml' };
  const srv = http.createServer((req, res) => {
    const f = path.join(dir, decodeURIComponent(req.url.split('?')[0]).replace(/\/$/, '/index.html'));
    if (!f.startsWith(dir) || !fs.existsSync(f)) return res.writeHead(404).end();
    res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  });
  return new Promise((r) => srv.listen(port, '127.0.0.1', () => r(srv)));
}

(async () => {
  const srv = await serve(SITE, 8790);
  const profile = fs.mkdtempSync(path.join(require('os').tmpdir(), 'inh-'));
  const ctx = await chromium.launchPersistentContext(profile, {
    channel: 'chromium',
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
    args: [`--disable-extensions-except=${EXT}`, `--load-extension=${EXT}`],
  });
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  try {
    let [sw] = ctx.serviceWorkers();
    if (!sw) sw = await ctx.waitForEvent('serviceworker');
    const extId = sw.url().split('/')[2];
    await wait(600);
    for (const p of ctx.pages()) if (p.url().includes('welcome')) await p.close();

    const page = await ctx.newPage();
    await page.goto('http://127.0.0.1:8790/');
    await page.evaluate(() => document.fonts.ready);
    await wait(300);
    const tabId = await sw.evaluate(async () => (await chrome.tabs.query({ url: 'http://127.0.0.1:8790/*' }))[0].id);
    const send = (msg) => sw.evaluate(([id, m]) => chrome.tabs.sendMessage(id, m), [tabId, msg]);
    const set = (o) => sw.evaluate((o) => chrome.storage.sync.set(o), o);
    const setPro = (on) => sw.evaluate((on) => chrome.storage.local.set({ pro: on ? { email: 'you@studio.com', iat: 1 } : null }), on);
    const shot = async (name) => {
      await wait(250);
      await page.screenshot({ path: path.join(OUT, `${name}.png`) });
    };
    const scroll = async (y) => {
      await page.evaluate((y) => scrollTo(0, y), y);
      await wait(250);
    };

    // ---- page shots ----
    await setPro(false);
    await set({ color: 'red', position: 'tl', size: 'm', minSize: 24, startAt: 1 });
    await shot('page-off');
    await scroll(470);
    await shot('page-off-grid');
    await scroll(0);
    await send({ type: 'toggle', on: true });
    await shot('page-free');
    await scroll(470);
    await shot('page-free-grid');
    await scroll(0);

    await setPro(true);
    await set({ size: 'l' });
    await shot('page-pro');
    await scroll(470);
    await shot('page-pro-grid');

    // click-to-copy on badge #3
    const r = await page.evaluate(() => {
      const img = document.querySelectorAll('.card img')[1].getBoundingClientRect();
      return { x: img.left + 26, y: img.top + 26 };
    });
    await page.mouse.move(r.x, r.y);
    await page.mouse.down();
    await page.mouse.up();
    await wait(80);
    await page.screenshot({ path: path.join(OUT, 'page-copied.png') });
    await page.mouse.move(5, 790);
    await wait(900);

    // jump to #11 with highlight ring
    await scroll(0);
    await send({ type: 'jump', n: 11 });
    await wait(900);
    await page.screenshot({ path: path.join(OUT, 'page-jump.png') });
    await wait(1400);

    // style variants on the grid
    const variants = [
      ['yellow', 'br', 'l'],
      ['black', 'tl', 'l'],
      ['purple', 'tr', 'l'],
      ['blue', 'center', 'l'],
      ['green', 'bl', 'l'],
    ];
    for (const [color, position, size] of variants) {
      await set({ color, position, size });
      await scroll(470);
      await shot(`page-${color}-${position}`);
    }
    await set({ color: 'red', position: 'tl', size: 'l' });
    await scroll(0);

    // report text
    for (const f of ['markdown', 'text', 'csv']) {
      const rep = await send({ type: 'report', format: f });
      fs.writeFileSync(path.join(OUT, `report.${f === 'markdown' ? 'md' : f}`), rep.text.replace(/http:\/\/127\.0\.0\.1:8790\//g, 'https://lumenhome.shop/spring'));
    }

    // ---- popup shots ----
    const pop = await ctx.newPage();
    await pop.setViewportSize({ width: 340, height: 640 });
    const popUrl = `chrome-extension://${extId}/src/popup.html?tabId=${tabId}`;
    const popShot = async (name) => {
      await wait(250);
      const h = await pop.evaluate(() => document.body.scrollHeight);
      await pop.screenshot({ path: path.join(OUT, `${name}.png`), clip: { x: 0, y: 0, width: 340, height: h } });
    };
    const hostFix = () => pop.evaluate(() => document.querySelectorAll('#host,#auto-host').forEach((e) => (e.textContent = e.textContent.replace('127.0.0.1', 'lumenhome.shop'))));

    await setPro(false);
    await set({ size: 'm' });
    await pop.goto(popUrl);
    await wait(400);
    await hostFix();
    await popShot('popup-free');
    await pop.click('#copy-report');
    await popShot('popup-upgrade');

    await setPro(true);
    await set({ size: 'l' });
    await pop.goto(popUrl);
    await wait(400);
    await hostFix();
    await popShot('popup-pro');
    await pop.fill('#jump-n', '11');
    await popShot('popup-jump');
    await pop.fill('#jump-n', '');
    await pop.click('#copy-report');
    await wait(100);
    await popShot('popup-report-toast');
    await pop.goto(popUrl);
    await wait(400);
    await hostFix();
    await pop.click('#appearance summary');
    await popShot('popup-appearance');

    // dark mode popup
    await pop.emulateMedia({ colorScheme: 'dark' });
    await pop.goto(popUrl);
    await wait(400);
    await hostFix();
    await popShot('popup-dark');
    console.log('raw shots →', OUT);
  } finally {
    await ctx.close();
    srv.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

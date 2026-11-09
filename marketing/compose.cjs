// Builds Chrome Web Store graphics from the raw shots in marketing/.raw
// (run marketing/capture.cjs first). Output → marketing/store/
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const RAW = path.join(__dirname, '.raw');
const OUT = path.join(__dirname, 'store');
fs.mkdirSync(OUT, { recursive: true });
const ICON = path.join(__dirname, '..', 'extension', 'icons', 'icon512.png');
const img = (n) => `file://${path.join(RAW, n)}`;

const CSS = `
*{box-sizing:border-box;margin:0}
body{width:var(--w);height:var(--h);overflow:hidden;font-family:Inter,system-ui,sans-serif;color:#111418;
  background:radial-gradient(1200px 700px at 85% -10%,#ffe3e6 0,transparent 60%),radial-gradient(900px 600px at -10% 110%,#e3ebff 0,transparent 60%),#fbfaf8;position:relative}
.h{position:absolute;left:64px;top:52px;width:470px}
.h .eyebrow{display:inline-flex;align-items:center;gap:8px;font-weight:700;font-size:15px;color:#e5243b;letter-spacing:.02em;text-transform:uppercase}
.h .eyebrow img{width:26px;height:26px}
.h h1{font-size:48px;line-height:1.04;letter-spacing:-.035em;font-weight:800;margin-top:12px}
.h p{font-size:19px;line-height:1.4;color:#4b5563;margin-top:14px;max-width:430px}
.win{position:absolute;border-radius:14px;overflow:hidden;background:#fff;box-shadow:0 30px 80px rgba(17,20,24,.18),0 0 0 1px rgba(17,20,24,.08)}
.bar{height:38px;background:#f1f2f4;display:flex;align-items:center;gap:7px;padding:0 14px;border-bottom:1px solid #e4e7ec}
.bar i{width:11px;height:11px;border-radius:50%;background:#d0d4da}
.bar .url{margin-left:14px;flex:1;height:24px;border-radius:7px;background:#fff;font:500 12.5px/24px Inter,sans-serif;color:#5d6673;padding-left:12px}
.bar .ext{width:24px;height:24px;border-radius:6px;display:grid;place-items:center;background:#ffe3e6}
.bar .ext img{width:18px;height:18px}
.win .shot{display:block;width:100%}
.pop{position:absolute;border-radius:14px;overflow:hidden;box-shadow:0 30px 70px rgba(17,20,24,.28),0 0 0 1px rgba(17,20,24,.1);background:#fff}
.pop img{display:block;width:100%}
.chip{position:absolute;background:#111418;color:#fff;font-weight:700;font-size:18px;padding:10px 16px;border-radius:999px;box-shadow:0 10px 30px rgba(0,0,0,.25)}
.chip b{color:#ffd60a}
`;

function win(x, y, w, shot, url = 'lumenhome.shop/spring', crop) {
  const inner = crop
    ? `<div style="height:${crop.h}px;overflow:hidden"><img class="shot" src="${img(shot)}" style="margin-top:-${crop.top}px"></div>`
    : `<img class="shot" src="${img(shot)}">`;
  return `<div class="win" style="left:${x}px;top:${y}px;width:${w}px"><div class="bar"><i></i><i></i><i></i><div class="url">${url}</div><div class="ext"><img src="file://${ICON}"></div></div>${inner}</div>`;
}
const pop = (x, y, w, shot) => `<div class="pop" style="left:${x}px;top:${y}px;width:${w}px"><img src="${img(shot)}"></div>`;
const head = (eyebrow, h1, p) =>
  `<div class="h"><div class="eyebrow"><img src="file://${ICON}">${eyebrow}</div><h1>${h1}</h1><p>${p}</p></div>`;

function mdTable(md) {
  const lines = md.split('\n');
  const rows = lines.filter((l) => l.startsWith('| ') && !l.startsWith('| #')).map((l) => l.slice(2, -2).split(' | '));
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  return `<table>${'<tr><th>#</th><th>Alt text</th><th>Size</th><th>File</th></tr>'}${rows
    .slice(0, 13)
    .map(([n, alt, size, , file]) => `<tr><td><span class="n">${n}</span></td><td class="${alt.includes('missing') ? 'miss' : ''}">${esc(alt.replace('⚠️ ', '⚠ '))}</td><td>${size}</td><td class="f">${esc(file)}</td></tr>`)
    .join('')}</table>`;
}

const md = fs.readFileSync(path.join(RAW, 'report.md'), 'utf8');

const scenes = {
  // ---------- 1280×800 screenshots ----------
  '01-say-image-7': {
    w: 1280, h: 800,
    html: head('Image Number Helper', 'Say “image 7”.<br>Not “the one on the left.”', 'Number every image on any page in one click. Reviews, QA and meetings finally point at the same thing.') +
      win(560, 200, 760, 'page-pro.png') + pop(64, 380, 290, 'popup-pro.png'),
  },
  '02-jump-to-any-image': {
    w: 1280, h: 800,
    html: head('Find it fast', 'Jump straight to<br>any image.', 'Type a number — the page scrolls to it and spotlights it. Perfect for “can we look at 11 again?”') +
      win(540, 210, 800, 'page-jump.png') + pop(64, 380, 290, 'popup-jump.png') + `<div class="chip" style="left:910px;top:150px">Image <b>#11</b> ↓</div>`,
  },
  '03-meeting-report': {
    w: 1280, h: 800,
    html: head('Pro · Meeting report', 'A meeting-ready<br>report in one click.', 'Every number with its alt text, size and file — as Markdown, plain text or CSV. Missing alt text is flagged for you.') +
      `<style>.doc{position:absolute;left:600px;top:60px;width:620px;height:680px;background:#fff;border-radius:16px;box-shadow:0 30px 80px rgba(17,20,24,.18),0 0 0 1px rgba(17,20,24,.08);padding:28px 30px;overflow:hidden}
      .doc h3{font-size:22px;letter-spacing:-.01em}.doc .meta{color:#5d6673;font-size:14px;margin:4px 0 16px}
      table{border-collapse:collapse;width:100%;font-size:14px}th{text-align:left;color:#5d6673;font-weight:600;border-bottom:1px solid #e4e7ec;padding:7px 6px}
      td{border-bottom:1px solid #f0f1f3;padding:7px 6px;vertical-align:middle}.n{display:inline-grid;place-items:center;min-width:24px;height:24px;border-radius:12px;background:#e5243b;color:#fff;font-weight:700;font-size:12.5px;padding:0 6px}
      td.miss{color:#c2410c;font-weight:600}td.f{color:#5d6673;font-family:"JetBrains Mono",monospace;font-size:12.5px}
      .paste{position:absolute;left:600px;top:28px;background:#111418;color:#fff;font-weight:600;font-size:14px;padding:7px 12px;border-radius:8px;z-index:2}</style>
      <div class="paste">⌘V — pasted into your notes</div>
      <div class="doc"><h3>Lumen Home — Spring Collection</h3><div class="meta">lumenhome.shop/spring · 13 images · <b style="color:#c2410c">2 missing alt text</b></div>${mdTable(md)}</div>` +
      pop(250, 420, 290, 'popup-pro.png'),
  },
  '04-click-to-copy': {
    w: 1280, h: 800,
    html: head('Click to copy', 'Click a number,<br>paste the reference.', 'Every badge copies “Image 3” to your clipboard — drop it into chat, tickets or design comments. Right-click any image works too.') +
      win(600, 70, 640, 'page-copied.png', 'lumenhome.shop/spring', null) +
      `<svg style="position:absolute;left:${600 + 640 * (585 / 1280) - 2}px;top:${70 + 38 + 640 * (150 / 800) - 4}px;width:34px;height:34px;filter:drop-shadow(0 3px 4px rgba(0,0,0,.35))" viewBox="0 0 24 24"><path d="M5 3l14 8-6 2-3 6z" fill="#111418" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>` +
      `<div class="chip" style="left:64px;top:470px;font-size:22px">📋 Image 3</div>` +
      `<style>.feat{position:absolute;left:64px;top:560px;display:grid;gap:12px;font-size:18px;color:#374151}.feat div::before{content:"✓";display:inline-grid;place-items:center;width:24px;height:24px;border-radius:50%;background:#e5243b;color:#fff;font-weight:800;font-size:13px;margin-right:10px;vertical-align:1px}</style>
      <div class="feat"><div>Numbers never block clicks on the page</div><div>Stay stable while lazy images load</div><div>Shortcut: Alt + Shift + N</div></div>`,
  },
  '05-make-it-yours': {
    w: 1280, h: 800,
    html: head('Pro · Make it yours', '6 colors. 5 positions.<br>Any page.', 'Pick a badge that stands out on light or dark photos, move it out of the way, and start counting from any number.') +
      `<style>.g{position:absolute;left:560px;top:60px;display:grid;grid-template-columns:repeat(2,320px);gap:18px}.g div{border-radius:12px;overflow:hidden;box-shadow:0 14px 40px rgba(17,20,24,.16),0 0 0 1px rgba(17,20,24,.07);height:330px;background:#fbfaf8}.g img{width:200%;margin:-20px 0 0 -56px}</style>
      <div class="g"><div><img src="${img('page-yellow-br.png')}"></div><div><img src="${img('page-black-tl.png')}"></div><div><img src="${img('page-purple-tr.png')}"></div><div><img src="${img('page-blue-center.png')}"></div></div>` +
      `<div class="pop" style="left:64px;top:360px;width:330px;height:400px"><img src="${img('popup-appearance.png')}" style="position:absolute;bottom:0"></div>`,
  },
  '06-free-and-pro': {
    w: 1280, h: 800,
    html: head('Free forever · Pro once', 'Free for 8 images.<br>Pro is $4.99, once.', 'No account, no subscription, no tracking. Pro unlocks unlimited numbers, the report, numbered screenshots and styling.') +
      pop(64, 360, 290, 'popup-free.png') + pop(560, 90, 330, 'popup-upgrade.png') + `<div class="chip" style="left:920px;top:300px">Pay once · <b>$4.99</b></div><div class="chip" style="left:920px;top:370px;background:#fff;color:#111418">No account needed</div><div class="chip" style="left:920px;top:440px;background:#fff;color:#111418">30-day refund</div>`,
  },

  // ---------- promo tiles ----------
  'tile-small-440x280': {
    w: 440, h: 280,
    html: `<style>.t{position:absolute;inset:0;background:linear-gradient(135deg,#e5243b,#b8122a);color:#fff;padding:30px}
      .t img{width:84px;height:84px;background:#fff;border-radius:22px;padding:8px}.t h1{font-size:34px;line-height:1.02;letter-spacing:-.03em;margin-top:18px;font-weight:800}.t p{font-size:16px;opacity:.9;margin-top:8px}</style>
      <div class="t"><img src="file://${ICON}"><h1>Image Number<br>Helper</h1><p>Say “image 7”, not “the one on the left.”</p></div>`,
  },
  'marquee-1400x560': {
    w: 1400, h: 560,
    html: `<style>.m{position:absolute;left:72px;top:110px;width:560px}.m img{width:88px}.m h1{font-size:60px;line-height:1.02;letter-spacing:-.035em;font-weight:800;margin-top:18px}.m p{font-size:22px;color:#4b5563;margin-top:14px}</style>
      <div class="m"><img src="file://${ICON}"><h1>Number every<br>image on the page.</h1><p>Clearer reviews, faster QA, shorter meetings.</p></div>` +
      win(700, 60, 760, 'page-pro.png') + pop(640, 210, 250, 'popup-pro.png'),
  },
};

(async () => {
  const browser = await chromium.launch();
  for (const [name, s] of Object.entries(scenes)) {
    const page = await browser.newPage({ viewport: { width: s.w, height: s.h }, deviceScaleFactor: 1 });
    const file = path.join(RAW, `_${name}.html`);
    fs.writeFileSync(file, `<!doctype html><meta charset="utf-8"><style>:root{--w:${s.w}px;--h:${s.h}px}${CSS}</style><body>${s.html}</body>`);
    await page.goto(`file://${file}`);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(150);
    await page.screenshot({ path: path.join(OUT, `${name}.png`) });
    await page.close();
    console.log('✓', name);
  }
  await browser.close();
})();

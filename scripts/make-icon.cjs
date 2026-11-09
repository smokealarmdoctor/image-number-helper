// Renders extension/icons/*.png from an SVG: four photo tiles (2x2) numbered
// 1-4 in the outer corners. 16/32 px use plain red dots (digits can't be read
// at that size). Usage: node scripts/make-icon.cjs
const { chromium } = require('playwright');
const path = require('path');
const OUT = path.join(__dirname, '..', 'extension', 'icons');
const TILES = [['#ffb3a3', '#ff6a88', '#ffe1c2'], ['#b9d3ff', '#3b82f6', '#e6efff'], ['#a7f3c9', '#16b36a', '#e0fbea'], ['#fde68a', '#f59e0b', '#fff6d6']];

function svg({ digits }) {
  const S = 100, m = digits ? 9 : 4, gap = digits ? 5 : 6;
  const t = (S - 2 * m - gap) / 2;
  const pos = [[m, m], [m + t + gap, m], [m, m + t + gap], [m + t + gap, m + t + gap]];
  const r = digits ? 12 : 11;
  const corners = [[m + 4, m + 4], [S - m - 4, m + 4], [m + 4, S - m - 4], [S - m - 4, S - m - 4]].map(([x, y]) =>
    digits ? [x, y] : [x + (x < 50 ? 1 : -1), y + (y < 50 ? 1 : -1)]);
  const tiles = pos.map(([x, y], i) => {
    const [a, b, h] = TILES[i];
    return `<defs><linearGradient id="g${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${digits ? a : b}"/><stop offset="1" stop-color="${b}"/></linearGradient>
      <clipPath id="c${i}"><rect x="${x}" y="${y}" width="${t}" height="${t}" rx="${t * 0.22}"/></clipPath></defs>
      <g clip-path="url(#c${i})"><rect x="${x}" y="${y}" width="${t}" height="${t}" fill="url(#g${i})"/>
      ${digits || true ? `<path d="M${x} ${y + t * .8} L${x + t * .34} ${y + t * .48} L${x + t * .56} ${y + t * .68} L${x + t * .76} ${y + t * .54} L${x + t} ${y + t * .74} V${y + t} H${x}Z" fill="${h}"/>` : ''}
      ${digits ? `<circle cx="${x + t * .68}" cy="${y + t * .3}" r="${t * .12}" fill="#fff" opacity=".9"/>` : ''}</g>`;
  }).join('');
  const badges = corners.map(([x, y], i) =>
    `<circle cx="${x}" cy="${y}" r="${r + (digits ? 2.6 : 3)}" fill="#fff"/><circle cx="${x}" cy="${y}" r="${r}" fill="#e5243b"/>` +
    (digits ? `<text x="${x}" y="${y + 0.5}" text-anchor="middle" dominant-baseline="central" font-family="Inter" font-weight="800" font-size="${r * 1.45}" fill="#fff">${i + 1}</text>` : '')).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${tiles}${badges}</svg>`;
}

(async () => {
  const browser = await chromium.launch();
  for (const n of [16, 32, 48, 128, 512]) {
    const page = await browser.newPage({ viewport: { width: n, height: n }, deviceScaleFactor: 1 });
    await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:${n}px;height:${n}px}</style>${svg({ digits: n >= 48 })}`);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(OUT, `icon${n}.png`), omitBackground: true });
    await page.close();
  }
  await browser.close();
  console.log('icons written');
})();

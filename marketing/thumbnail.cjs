// YouTube thumbnail (1280x720) → marketing/video/thumbnail.jpg. Needs marketing/.raw from capture.cjs.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const RAW = path.join(__dirname, '.raw');
const ICON = path.join(__dirname, '..', 'extension', 'icons', 'icon512.png');
const html = `<!doctype html><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0}
body{width:1280px;height:720px;overflow:hidden;font-family:Inter,system-ui,sans-serif;position:relative;
 background:radial-gradient(900px 600px at 95% 0%,#ffd9de 0,transparent 60%),radial-gradient(700px 500px at 0% 110%,#d9e6ff 0,transparent 60%),#fbfaf8}
.t{position:absolute;left:64px;top:70px;width:620px}
.t img{width:110px}
h1{white-space:nowrap;font-size:100px;line-height:.98;letter-spacing:-.045em;font-weight:800;color:#111418;margin-top:26px}
h1 em{font-style:normal;color:#e5243b}
p{font-size:38px;color:#3d4653;margin-top:20px;font-weight:600;letter-spacing:-.01em}
.shot{position:absolute;left:700px;top:80px;width:640px;height:560px;border-radius:26px;overflow:hidden;
 box-shadow:0 40px 100px rgba(17,20,24,.28),0 0 0 2px rgba(17,20,24,.08);transform:rotate(2.5deg)}
.shot img{width:1180px;margin:-30px 0 0 -20px;display:block}
.pill{position:absolute;left:64px;bottom:58px;background:#111418;color:#fff;font-weight:800;font-size:34px;padding:16px 30px;border-radius:999px}
.pill b{color:#ffd60a}
</style>
<div class="t"><img src="file://${ICON}"><h1>Say<br><em>“image 7”.</em></h1><p>Not “the one on the left.”</p></div>
<div class="shot"><img src="file://${path.join(RAW, 'page-pro-grid.png')}"></div>
<div class="pill">Free Chrome extension · <b>$0</b></div>`;
(async () => {
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const f = path.join(RAW, '_thumb.html'); fs.writeFileSync(f, html);
  await pg.goto('file://' + f); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(200);
  const out = path.join(__dirname, 'video', 'thumbnail.jpg');
  await pg.screenshot({ path: out, type: 'jpeg', quality: 90 });
  await b.close(); console.log(out, fs.statSync(out).size, 'bytes');
})();

// Renders the ~34s helper video from the raw shots (run capture.cjs first).
// Each frame is rendered deterministically by render(t) and piped into ffmpeg.
// Output → marketing/video/image-number-helper-demo.mp4 (+ poster.png)
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const RAW = path.join(__dirname, '.raw');
const OUT = path.join(__dirname, 'video');
fs.mkdirSync(OUT, { recursive: true });
const ICON = path.join(__dirname, '..', 'extension', 'icons', 'icon512.png');
const FPS = 30;
const DURATION = 34;
const W = 1280;
const H = 720;
const img = (n) => `file://${path.join(RAW, n)}`;

const layers = ['page-off', 'page-pro', 'page-pro-grid', 'page-copied', 'page-jump', 'page-yellow-br', 'page-black-tl', 'page-purple-tr', 'page-blue-center', 'page-green-bl'];
const md = fs.readFileSync(path.join(RAW, 'report.md'), 'utf8');
const rows = md.split('\n').filter((l) => l.startsWith('| ') && !l.startsWith('| #')).map((l) => l.slice(2, -2).split(' | '));

const html = `<!doctype html><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0}
body{width:${W}px;height:${H}px;overflow:hidden;font-family:Inter,system-ui,sans-serif;color:#111418;
 background:radial-gradient(900px 600px at 90% -10%,#ffe0e4 0,transparent 60%),radial-gradient(800px 500px at -10% 110%,#dfe8ff 0,transparent 60%),#fbfaf8}
.abs{position:absolute}
#title{left:0;right:0;top:220px;text-align:center}
#title img{width:120px}#title h1{font-size:56px;letter-spacing:-.035em;font-weight:800;margin-top:14px}#title p{font-size:24px;color:#4b5563;margin-top:8px}
#win{width:960px;border-radius:14px;overflow:hidden;background:#fff;box-shadow:0 30px 80px rgba(17,20,24,.2),0 0 0 1px rgba(17,20,24,.08)}
.bar{height:38px;background:#f1f2f4;display:flex;align-items:center;gap:7px;padding:0 14px;border-bottom:1px solid #e4e7ec}
.bar i{width:11px;height:11px;border-radius:50%;background:#d0d4da}
.bar .url{margin-left:14px;flex:1;height:24px;border-radius:7px;background:#fff;font:500 12.5px/24px Inter,sans-serif;color:#5d6673;padding-left:12px}
.bar .ext{width:24px;height:24px;border-radius:6px;display:grid;place-items:center;background:#ffe3e6}.bar .ext img{width:18px}
.stage{position:relative;height:600px}.stage img{position:absolute;inset:0;width:100%;opacity:0}
#pop{width:300px;border-radius:14px;overflow:hidden;box-shadow:0 30px 70px rgba(17,20,24,.3),0 0 0 1px rgba(17,20,24,.1);background:#fff}
#pop img{display:block;width:100%}#pop img+img{position:absolute;top:0;left:0;opacity:0}
#cap{left:50%;bottom:26px;transform:translateX(-50%);background:#111418;color:#fff;font-size:24px;font-weight:600;padding:14px 24px;border-radius:999px;white-space:nowrap;box-shadow:0 10px 30px rgba(0,0,0,.25)}
#cap b{color:#ffd60a}
#keys{left:0;right:0;top:300px;display:flex;justify-content:center;gap:14px}
#keys span{font:700 34px/1 "JetBrains Mono",monospace;background:#fff;border:2px solid #d0d4da;border-bottom-width:6px;border-radius:12px;padding:16px 22px;box-shadow:0 12px 30px rgba(0,0,0,.18)}
#cursor{width:34px;height:34px;filter:drop-shadow(0 3px 4px rgba(0,0,0,.35));z-index:9}
#ripple{width:60px;height:60px;border-radius:50%;border:3px solid #e5243b;z-index:8}
#chip{background:#111418;color:#fff;font-weight:700;font-size:22px;padding:11px 18px;border-radius:999px;box-shadow:0 10px 30px rgba(0,0,0,.25)}#chip b{color:#ffd60a}
#doc{left:600px;top:60px;width:600px;background:#fff;border-radius:16px;box-shadow:0 30px 80px rgba(17,20,24,.22),0 0 0 1px rgba(17,20,24,.08);padding:24px 26px}
#doc h3{font-size:20px}#doc .meta{color:#5d6673;font-size:13.5px;margin:3px 0 12px}
#doc table{border-collapse:collapse;width:100%;font-size:13.5px}#doc td{border-bottom:1px solid #f0f1f3;padding:5.5px 5px}
#doc .n{display:inline-grid;place-items:center;min-width:22px;height:22px;border-radius:11px;background:#e5243b;color:#fff;font-weight:700;font-size:12px;padding:0 5px}
#doc .miss{color:#c2410c;font-weight:600}#doc .f{color:#5d6673;font-family:"JetBrains Mono",monospace;font-size:12px}
#end{left:0;right:0;top:170px;text-align:center}
#end img{width:110px}#end h1{font-size:52px;letter-spacing:-.035em;font-weight:800;margin-top:12px}
#end p{font-size:24px;color:#4b5563;margin-top:10px}#end .cta{display:inline-block;margin-top:28px;background:#e5243b;color:#fff;font-weight:700;font-size:24px;padding:16px 30px;border-radius:999px;box-shadow:0 14px 34px rgba(229,36,59,.35)}
#end .sub{font-size:17px;margin-top:16px}
</style>
<div id="title" class="abs"><img src="file://${ICON}"><h1>Image Number Helper</h1><p>Say “image 7” — not “the one on the left.”</p></div>
<div id="win" class="abs"><div class="bar"><i></i><i></i><i></i><div class="url">lumenhome.shop/spring</div><div class="ext"><img src="file://${ICON}"></div></div>
<div class="stage">${layers.map((l) => `<img id="${l}" src="${img(l + '.png')}">`).join('')}</div></div>
<div id="pop" class="abs"><img src="${img('popup-pro.png')}"><img id="pop2" src="${img('popup-jump.png')}"></div>
<div id="doc" class="abs"><h3>Lumen Home — Spring Collection</h3><div class="meta">lumenhome.shop/spring · 13 images · <b style="color:#c2410c">2 missing alt text</b></div>
<table>${rows.map(([n, alt, size, , file]) => `<tr class="row"><td><span class="n">${n}</span></td><td class="${alt.includes('missing') ? 'miss' : ''}">${alt.replace('⚠️ ', '⚠ ')}</td><td>${size}</td><td class="f">${file}</td></tr>`).join('')}</table></div>
<div id="keys" class="abs"><span>Alt</span><span>Shift</span><span>N</span></div>
<div id="ripple" class="abs"></div>
<div id="chip" class="abs">Copied: <b>Image 3</b></div>
<svg id="cursor" class="abs" viewBox="0 0 24 24"><path d="M5 3l14 8-6 2-3 6z" fill="#111418" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>
<div id="cap" class="abs"></div>
<div id="end" class="abs"><img src="file://${ICON}"><h1>Number every image. Free.</h1><p>First 8 images free on every page · Pro unlocks everything for <b>$2.99 once</b></p>
<div class="cta">Add to Chrome — it’s free</div><p class="sub">Image Number Helper · Chrome Web Store</p></div>
<script>
const $=id=>document.getElementById(id);
const clamp=v=>Math.max(0,Math.min(1,v));
const seg=(t,a,b)=>clamp((t-a)/(b-a));
const io=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
const back=x=>{const c=1.7;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2)};
const lerp=(a,b,x)=>a+(b-a)*x;
const fade=(t,a,b,fi=.35,fo=.35)=>Math.min(seg(t,a,a+fi),1-seg(t,b-fo,b));
// keyframe path [[t,x,y],...]
const path=(t,k)=>{if(t<=k[0][0])return k[0].slice(1);for(let i=1;i<k.length;i++){if(t<=k[i][0]){const x=io(seg(t,k[i-1][0],k[i][0]));return[lerp(k[i-1][1],k[i][1],x),lerp(k[i-1][2],k[i][2],x)]}}return k[k.length-1].slice(1)};
const CAPS=[[3.3,7.9,'Open any page and press <b>Alt + Shift + N</b>'],[8.1,12.4,'Click a number to <b>copy</b> it'],[12.7,17.9,'Type a number to <b>jump</b> straight to it'],[18.1,23.4,'Copy a <b>meeting-ready report</b> (Pro)'],[23.6,28.4,'<b>6 colors, 5 positions</b>, any page (Pro)']];
const LAYER=[['page-off',3,6.0],['page-pro',5.6,8.4],['page-pro-grid',8.0,10.05],['page-copied',10.0,12.9],['page-pro',12.5,15.6],['page-jump',15.2,18.4],['page-pro-grid',18.0,23.9],
 ['page-yellow-br',23.5,24.75],['page-black-tl',24.5,25.75],['page-purple-tr',25.5,26.75],['page-blue-center',26.5,27.75],['page-green-bl',27.5,28.9]];
window.render=t=>{
  $('title').style.opacity=fade(t,.15,3.1,.6,.5);
  $('title').style.transform='translateY('+(1-io(seg(t,.15,.9)))*20+'px) scale('+lerp(.96,1,io(seg(t,.15,.9)))+')';
  // window
  const winIn=fade(t,3.0,28.9,.5,.5);
  const wx=lerp(lerp(160,30,io(seg(t,12.5,13.1))),160,io(seg(t,23.3,23.9)));
  const win=$('win');win.style.opacity=winIn;win.style.left=wx+'px';win.style.top=(40+(1-io(seg(t,3,3.5)))*30)+'px';
  const op={};for(const [id,a,b] of LAYER){const v=fade(t,a,b,.3,.3);op[id]=Math.max(op[id]||0,v)}
  document.querySelectorAll('.stage img').forEach(i=>{i.style.opacity=op[i.id]||0});
  // badges pop: slight zoom when numbers appear
  const pop=back(seg(t,5.6,6.1));$('page-pro').style.transform='scale('+(t<8?lerp(1.015,1,pop):1)+')';
  // keys
  const k=fade(t,4.0,5.9,.25,.3);$('keys').style.opacity=k;
  [...$('keys').children].forEach((s,i)=>{const p=seg(t,4.7+i*.08,4.85+i*.08)-seg(t,5.2,5.35);s.style.transform='translateY('+p*5+'px)';s.style.borderBottomWidth=(6-p*4)+'px'});
  // popup
  const pin=fade(t,12.6,19.2,.5,.5);const p=$('pop');p.style.opacity=pin;p.style.left=lerp(1100,950,io(seg(t,12.6,13.2)))+'px';p.style.top='70px';
  $('pop2').style.opacity=seg(t,14.1,14.2)-seg(t,17.4,17.5);
  // doc panel
  const d=$('doc');d.style.opacity=fade(t,18.8,23.4,.4,.4);d.style.left=lerp(700,560,io(seg(t,18.8,19.4)))+'px';
  document.querySelectorAll('.row').forEach((r,i)=>{r.style.opacity=seg(t,19.1+i*.12,19.4+i*.12)});
  // cursor
  const S=960/1280;
  const cur=[[7.9,700,640],[8.6,700,500],[9.6,160+370*S-6,78+92*S-6],[11.5,160+370*S-6,78+92*S-6],[12.2,620,500],
    [13.4,1010,420],[14.6,950+253-8,70+182-8],[15.6,950+253-8,70+182-8],[17.6,950+57-8,70+240-8],[19.2,950+57-8,70+240-8],[20.2,900,620]];
  const [cx,cy]=path(t,cur);const c=$('cursor');c.style.left=cx+'px';c.style.top=cy+'px';
  c.style.opacity=fade(t,8.0,20.3,.3,.3);
  const clickT=[9.95,15.0,18.6].find(x=>t>=x&&t<x+.5);const rp=$('ripple');
  if(clickT!==undefined){const q=seg(t,clickT,clickT+.5);rp.style.opacity=1-q;rp.style.left=(cx-30+8)+'px';rp.style.top=(cy-30+8)+'px';rp.style.transform='scale('+lerp(.3,1.3,q)+')'}else rp.style.opacity=0;
  c.style.transform=clickT!==undefined&&t<clickT+.12?'scale(.85)':'';
  // chip
  const ch=$('chip');const cq=back(seg(t,10.1,10.5));ch.style.opacity=fade(t,10.1,12.3,.2,.4);
  ch.style.left='465px';ch.style.top=(lerp(215,200,seg(t,10.1,12.3)))+'px';ch.style.transform='scale('+cq+')';
  // caption
  const cap=$('cap');const cur2=CAPS.find(([a,b])=>t>=a&&t<b);
  if(cur2){cap.innerHTML=cur2[2];cap.style.opacity=fade(t,cur2[0],cur2[1],.3,.3)}else cap.style.opacity=0;
  // end
  const e=$('end');const ei=seg(t,29.0,29.7);e.style.opacity=ei;e.style.transform='translateY('+(1-io(ei))*20+'px)';
  e.querySelector('.cta').style.transform='scale('+(1+Math.sin(Math.max(0,t-30.5)*4)*.025*seg(t,30.5,31))+')';
};
render(0);
</script>`;

(async () => {
  const file = path.join(RAW, '_video.html');
  fs.writeFileSync(file, html);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await page.goto(`file://${file}`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  const out = path.join(OUT, 'image-number-helper-demo.mp4');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const total = DURATION * FPS;
  for (let f = 0; f < total; f++) {
    const t = f / FPS;
    await page.evaluate((t) => window.render(t), t);
    const buf = await page.screenshot({ type: 'png' });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (Math.abs(t - 6.5) < 1e-6) fs.writeFileSync(path.join(OUT, 'poster.png'), buf);
    if (f % 150 === 0) process.stdout.write(`${Math.round((f / total) * 100)}% `);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  await browser.close();
  console.log(`\n✓ ${out}`);
})();

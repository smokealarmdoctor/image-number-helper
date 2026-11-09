// Image Number Helper — content script.
// Draws numbered badges over <img> elements in a shadow-DOM overlay so page CSS
// can't break them and they never intercept clicks on the page underneath.
(() => {
  if (window.__inhLoaded) return;
  window.__inhLoaded = true;

  const FREE_LIMIT = 8;
  const DEFAULTS = {
    color: 'red',
    position: 'tl',
    size: 'm',
    minSize: 48,
    startAt: 1,
    style: 'numbers',
    autoAll: false,
    autoSites: [],
  };
  const PALETTES = {
    red: ['#e5243b', '#ffffff'],
    blue: ['#1f6feb', '#ffffff'],
    black: ['#111418', '#ffffff'],
    yellow: ['#ffd60a', '#111418'],
    green: ['#12b76a', '#ffffff'],
    purple: ['#7a5af8', '#ffffff'],
  };
  const SIZES = { s: 18, m: 24, l: 32 };
  const PRO_KEYS = new Set(['position', 'startAt']);

  let settings = { ...DEFAULTS };
  let pro = false;
  let enabled = false;

  // Stable numbering: an image keeps its number until the user hits "Renumber",
  // so "image 7" means the same thing for the whole meeting even as lazy
  // images load in.
  let numbers = new WeakMap();
  let ordered = []; // images in number order
  let host = null;
  let root = null;
  let layer = null;
  let moreChip = null;
  let badges = new Map(); // img -> badge element
  let frame = 0;
  let mo = null;
  let lastContextImg = null;

  // Number styles carried over from v1: 1 2 3 · A B C · 01 02 03 · I II III
  function label(n) {
    const style = settings.style;
    if (style === 'letters') {
      let s = '';
      for (let x = n; x > 0; x = Math.floor((x - 1) / 26)) s = String.fromCharCode(65 + ((x - 1) % 26)) + s;
      return s || '0';
    }
    if (style === 'padded') return String(n).padStart(2, '0');
    if (style === 'roman' && n > 0 && n < 4000) {
      const map = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
      let out = '';
      for (const [v, r] of map) while (n >= v) (out += r), (n -= v);
      return out;
    }
    return String(n);
  }

  const eff = (k) => (!pro && PRO_KEYS.has(k) ? DEFAULTS[k] : settings[k]);
  const effColor = () => (pro || settings.color === 'red' || settings.color === 'blue' ? settings.color : 'red');

  // ---------- image discovery ----------
  function qualifies(img) {
    if (!img.isConnected || host?.contains(img) || img.closest('[data-inh-skip]')) return false;
    const r = img.getBoundingClientRect();
    const min = Number(settings.minSize) || 0;
    if (r.width < min || r.height < min) return false;
    const cs = getComputedStyle(img);
    return cs.visibility !== 'hidden' && cs.display !== 'none' && Number(cs.opacity) > 0.05;
  }

  function scan() {
    const fresh = [];
    for (const img of document.images) {
      if (numbers.has(img)) continue;
      if (qualifies(img)) fresh.push(img);
    }
    if (!fresh.length) return false;
    let next = ordered.length + (Number(eff('startAt')) || 1);
    for (const img of fresh) {
      numbers.set(img, next++);
      ordered.push(img);
    }
    return true;
  }

  function renumber() {
    numbers = new WeakMap();
    ordered = [];
    for (const b of badges.values()) b.remove();
    badges.clear();
    scan();
    schedule();
  }

  // ---------- overlay ----------
  function ensureHost() {
    if (host) return;
    host = document.createElement('inh-overlay');
    host.style.cssText =
      'all:initial;position:fixed;inset:0;pointer-events:none;z-index:2147483646;contain:strict;';
    root = host.attachShadow({ mode: 'closed' });
    root.innerHTML = `<style>
      :host{all:initial}
      .b{position:fixed;display:flex;align-items:center;justify-content:center;
        font:700 var(--fs) / 1 Inter,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
        min-width:var(--h);height:var(--h);padding:0 calc(var(--h) * .28);box-sizing:border-box;
        border-radius:calc(var(--h) / 2);background:var(--bg);color:var(--fg);
        box-shadow:0 0 0 2px var(--fg),0 2px 8px rgba(0,0,0,.35);
        pointer-events:auto;cursor:copy;user-select:none;transition:transform .12s ease;
        font-variant-numeric:tabular-nums;letter-spacing:-.01em}
      .b:hover{transform:scale(1.12)}
      .b.copied::after{content:var(--copied);position:absolute;top:calc(100% + 6px);left:50%;
        transform:translateX(-50%);font:600 11px/1 system-ui,sans-serif;background:#111418;color:#fff;
        padding:5px 7px;border-radius:6px;white-space:nowrap}
      .ring{position:fixed;border:3px solid var(--bg);border-radius:6px;pointer-events:none;
        box-shadow:0 0 0 9999px rgba(10,12,16,.45);transition:opacity .3s ease}
      .more{position:fixed;right:16px;bottom:16px;pointer-events:auto;cursor:pointer;
        font:600 13px/1.2 Inter,system-ui,sans-serif;background:#111418;color:#fff;border-radius:999px;
        padding:10px 14px;box-shadow:0 6px 20px rgba(0,0,0,.3)}
      .more b{color:#ffd60a}
    </style><div class="layer"></div>`;
    layer = root.querySelector('.layer');
    document.documentElement.appendChild(host);
    applyTheme();
  }

  function applyTheme() {
    if (!host) return;
    const [bg, fg] = PALETTES[effColor()] || PALETTES.red;
    const h = SIZES[settings.size] || SIZES.m;
    host.style.setProperty('--bg', bg);
    host.style.setProperty('--fg', fg);
    host.style.setProperty('--h', `${h}px`);
    host.style.setProperty('--fs', `${Math.round(h * 0.55)}px`);
    host.style.setProperty('--copied', JSON.stringify(chrome.i18n.getMessage('copied') || 'Copied'));
  }

  function badgeFor(img) {
    let b = badges.get(img);
    if (!b) {
      b = document.createElement('div');
      b.className = 'b';
      b.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        copyText(chrome.i18n.getMessage('refImage', [label(numbers.get(img))]));
        b.classList.add('copied');
        setTimeout(() => b.classList.remove('copied'), 900);
      });
      layer.appendChild(b);
      badges.set(img, b);
    }
    return b;
  }

  function place(b, r, w, h) {
    const pad = 6;
    const pos = eff('position');
    let x = r.left + pad;
    let y = r.top + pad;
    if (pos === 'tr' || pos === 'br') x = r.right - w - pad;
    if (pos === 'bl' || pos === 'br') y = r.bottom - h - pad;
    if (pos === 'center') {
      x = r.left + (r.width - w) / 2;
      y = r.top + (r.height - h) / 2;
    }
    // Keep the badge on the visible part of the image (half-scrolled images
    // still show their number).
    const minX = Math.max(r.left, 0) + pad;
    const maxX = Math.min(r.right, innerWidth) - w - pad;
    const minY = Math.max(r.top, 0) + pad;
    const maxY = Math.min(r.bottom, innerHeight) - h - pad;
    if (maxX >= minX) x = Math.min(Math.max(x, minX), maxX);
    if (maxY >= minY) y = Math.min(Math.max(y, minY), maxY);
    b.style.left = `${Math.round(x)}px`;
    b.style.top = `${Math.round(y)}px`;
  }

  function render() {
    frame = 0;
    if (!enabled) return;
    const vw = innerWidth;
    const vh = innerHeight;
    const h = SIZES[settings.size] || SIZES.m;
    const limit = pro ? Infinity : FREE_LIMIT;
    let shown = 0;
    ordered.forEach((img, i) => {
      const b = badges.get(img);
      const r = img.isConnected ? img.getBoundingClientRect() : null;
      const visible = r && r.width > 0 && r.bottom > 0 && r.right > 0 && r.top < vh && r.left < vw;
      if (i >= limit || !visible) {
        if (b) b.style.display = 'none';
        return;
      }
      const el = badgeFor(img);
      const n = label(numbers.get(img));
      if (el.textContent !== n) el.textContent = n;
      el.style.display = '';
      place(el, r, Math.max(h, el.offsetWidth || h), h);
      shown++;
    });
    const hidden = Math.max(0, ordered.length - limit);
    if (hidden && !moreChip) {
      moreChip = document.createElement('div');
      moreChip.className = 'more';
      moreChip.addEventListener('click', () => chrome.runtime.sendMessage({ type: 'open-upgrade' }));
      layer.appendChild(moreChip);
    }
    if (moreChip) {
      moreChip.style.display = hidden ? '' : 'none';
      moreChip.innerHTML = chrome.i18n.getMessage('moreImages_html', [String(hidden)]);
    }
    reportCount();
    return shown;
  }

  function schedule() {
    if (enabled && !frame) frame = requestAnimationFrame(render);
  }

  let lastCount = -1;
  function reportCount() {
    const c = enabled ? ordered.length : 0;
    if (c === lastCount) return;
    lastCount = c;
    chrome.runtime.sendMessage({ type: 'count', count: c }).catch(() => {});
  }

  // ---------- lifecycle ----------
  let scanTimer = 0;
  function rescanSoon() {
    clearTimeout(scanTimer);
    scanTimer = setTimeout(() => {
      if (enabled && scan()) schedule();
    }, 150);
  }

  function onLoadEvent(e) {
    if (e.target instanceof HTMLImageElement) rescanSoon();
  }

  function enable() {
    if (enabled) return;
    enabled = true;
    ensureHost();
    host.style.display = '';
    scan();
    addEventListener('scroll', schedule, { capture: true, passive: true });
    addEventListener('resize', schedule, { passive: true });
    document.addEventListener('load', onLoadEvent, true);
    mo = new MutationObserver(() => {
      rescanSoon();
      schedule();
    });
    mo.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src', 'srcset', 'style', 'class', 'hidden'],
    });
    schedule();
  }

  function disable() {
    if (!enabled) return;
    enabled = false;
    removeEventListener('scroll', schedule, { capture: true });
    removeEventListener('resize', schedule);
    document.removeEventListener('load', onLoadEvent, true);
    mo?.disconnect();
    mo = null;
    if (host) host.style.display = 'none';
    reportCount();
  }

  function jump(n) {
    const img = ordered.find((i) => numbers.get(i) === Number(n));
    if (!img) return false;
    const idx = ordered.indexOf(img);
    if (!pro && idx >= FREE_LIMIT) return 'locked';
    img.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
      const r = img.getBoundingClientRect();
      const ring = document.createElement('div');
      ring.className = 'ring';
      Object.assign(ring.style, {
        left: `${r.left - 4}px`,
        top: `${r.top - 4}px`,
        width: `${r.width + 8}px`,
        height: `${r.height + 8}px`,
      });
      layer.appendChild(ring);
      setTimeout(() => (ring.style.opacity = '0'), 1200);
      setTimeout(() => ring.remove(), 1600);
    }, 450);
    return true;
  }

  // ---------- report ----------
  function fileName(src) {
    try {
      const u = new URL(src, location.href);
      if (u.protocol === 'data:') return '(inline data)';
      return decodeURIComponent(u.pathname.split('/').filter(Boolean).pop() || u.hostname);
    } catch {
      return '';
    }
  }

  function buildReport(format) {
    const rows = ordered
      .filter((img) => img.isConnected)
      .map((img) => ({
        n: label(numbers.get(img)),
        alt: (img.alt || '').replace(/\s+/g, ' ').trim(),
        size: `${img.naturalWidth}×${img.naturalHeight}`,
        shown: `${Math.round(img.width)}×${Math.round(img.height)}`,
        file: fileName(img.currentSrc || img.src),
        src: img.currentSrc || img.src,
      }));
    const title = document.title || location.hostname;
    const missingAlt = rows.filter((r) => !r.alt).length;
    if (format === 'csv') {
      const q = (v) => `"${String(v).replace(/"/g, '""')}"`;
      return [
        'number,alt,natural_size,displayed_size,file,url',
        ...rows.map((r) => [r.n, q(r.alt), r.size, r.shown, q(r.file), q(r.src)].join(',')),
      ].join('\n');
    }
    if (format === 'text') {
      return [
        `${title} — ${rows.length} images (${location.href})`,
        ...rows.map((r) => `Image ${r.n}: ${r.alt || '[no alt text]'} · ${r.size} · ${r.file}`),
      ].join('\n');
    }
    const esc = (v) => String(v).replace(/\|/g, '\\|');
    return [
      `### ${esc(title)}`,
      `${location.href}  `,
      `${rows.length} images · ${missingAlt} missing alt text`,
      '',
      '| # | Alt text | Natural size | Shown at | File |',
      '|---|---|---|---|---|',
      ...rows.map((r) => `| ${r.n} | ${esc(r.alt) || '⚠️ missing'} | ${r.size} | ${r.shown} | ${esc(r.file)} |`),
    ].join('\n');
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    }
  }

  // Used by the extension's own welcome page, where tabs.sendMessage can't reach.
  if (location.protocol === 'chrome-extension:') window.__inh = { enable, disable, jump, renumber };

  // ---------- messaging ----------
  addEventListener(
    'contextmenu',
    (e) => {
      lastContextImg = e.target instanceof HTMLImageElement ? e.target : null;
    },
    true
  );

  chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
    switch (msg?.type) {
      case 'state':
        reply({
          enabled,
          total: ordered.length,
          limit: pro ? null : FREE_LIMIT,
          host: location.hostname,
          pageImages: document.images.length,
        });
        break;
      case 'toggle':
        (msg.on ?? !enabled) ? enable() : disable();
        reply({ enabled, total: ordered.length });
        break;
      case 'renumber':
        if (!enabled) enable();
        renumber();
        reply({ total: ordered.length });
        break;
      case 'jump':
        if (!enabled) enable();
        reply({ result: jump(msg.n) });
        break;
      case 'report':
        reply({ text: buildReport(msg.format), total: ordered.length });
        break;
      case 'context-number': {
        if (!lastContextImg) return reply({ ok: false });
        if (!enabled) enable();
        else if (!numbers.has(lastContextImg)) scan();
        const n = numbers.get(lastContextImg);
        if (n) copyText(chrome.i18n.getMessage('refImage', [label(n)]));
        reply({ ok: Boolean(n), n });
        break;
      }
      case 'prepare-capture':
        if (moreChip) moreChip.style.visibility = msg.hide ? 'hidden' : '';
        reply({ ok: true });
        break;
      default:
        return false;
    }
    return false;
  });

  // ---------- settings ----------
  function refreshAll() {
    applyTheme();
    for (const b of badges.values()) b.style.display = 'none';
    schedule();
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync') {
      for (const [k, v] of Object.entries(changes)) if (k in DEFAULTS) settings[k] = v.newValue ?? DEFAULTS[k];
      if (changes.autoAll?.newValue && !enabled && location.protocol !== 'chrome-extension:') enable();
      if (changes.minSize || changes.startAt) {
        if (enabled) renumber();
      } else refreshAll();
    }
    if (area === 'local' && changes.pro) {
      pro = Boolean(changes.pro.newValue);
      refreshAll();
    }
  });

  // Hand-off from the license Worker's success page: the background script
  // checks the origin and the signature before accepting anything.
  function offerLicense() {
    const el = document.querySelector('[data-inh-license]');
    if (!el) return;
    chrome.runtime.sendMessage({ type: 'activate-from-page', key: el.dataset.inhLicense }, (res) => {
      if (res?.ok) el.dispatchEvent(new CustomEvent('inh-activated', { bubbles: true }));
    });
  }

  Promise.all([chrome.storage.sync.get(DEFAULTS), chrome.storage.local.get({ pro: null })]).then(
    ([s, l]) => {
      settings = { ...DEFAULTS, ...s };
      pro = Boolean(l.pro);
      const own = location.protocol === 'chrome-extension:';
      if (!own && (settings.autoAll || (settings.autoSites || []).includes(location.hostname))) enable();
      offerLicense();
    }
  );
})();

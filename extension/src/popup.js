import { CHECKOUT_URL, FREE_LIMIT, LICENSE_ORIGIN, PRICE_LABEL } from './config.js';

const $ = (s) => document.querySelector(s);
const params = new URLSearchParams(location.search);
const asTab = params.get('tab') === '1';
if (asTab) document.body.classList.add('tab');

const DEFAULTS = { color: 'red', position: 'tl', size: 'm', minSize: 24, startAt: 1, autoSites: [], reportFormat: 'markdown' };
let settings = { ...DEFAULTS };
let pro = null;
let tab = null;
let pageState = null;

// ---------- helpers ----------
let toastTimer;
function toast(text) {
  const t = $('#toast');
  t.textContent = text;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

async function send(msg) {
  if (!tab?.id) return null;
  try {
    return await chrome.tabs.sendMessage(tab.id, msg);
  } catch {
    // Page was open before the extension loaded — inject and retry once.
    try {
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['src/content.js'] });
      return await chrome.tabs.sendMessage(tab.id, msg);
    } catch {
      return null;
    }
  }
}

function save(patch) {
  Object.assign(settings, patch);
  return chrome.storage.sync.set(patch);
}

function show(view) {
  $('#view-main').hidden = view !== 'main';
  $('#view-upgrade').hidden = view !== 'upgrade';
  if (view === 'upgrade') renderUpgrade();
}

function requirePro(feature) {
  if (pro) return true;
  show('upgrade');
  $('#buy-block h1').innerHTML = `${feature} is a Pro feature.<br/>Pay once, keep it forever.`;
  return false;
}

// ---------- main view ----------
function renderPlan() {
  document.body.classList.toggle('free', !pro);
  const pill = $('#plan-pill');
  pill.textContent = pro ? 'Pro' : 'Free';
  pill.classList.toggle('pro', Boolean(pro));
  $('#foot-cta').textContent = pro ? 'Pro ✓' : `Upgrade · ${PRICE_LABEL}`;
}

function renderStatus() {
  const s = pageState;
  if (!s) {
    $('#unsupported').hidden = false;
    $('#status').hidden = true;
    $('#controls').hidden = true;
    $('#toggle').disabled = true;
    return;
  }
  $('#toggle').checked = s.enabled;
  const total = s.enabled ? s.total : 0;
  $('#count').textContent = s.enabled ? total : '—';
  $('#count-label').textContent = s.enabled ? (total === 1 ? 'image numbered' : 'images numbered') : 'numbers are off';
  $('#host').textContent = s.enabled ? `on ${s.host}` : `${s.pageImages} images on ${s.host} · press the switch`;
  const capped = !pro && s.enabled && total > FREE_LIMIT;
  $('#meter').hidden = !capped;
  if (capped) {
    $('#meter-fill').style.width = `${Math.round((FREE_LIMIT / total) * 100)}%`;
    $('#meter-cta').textContent = `Showing ${FREE_LIMIT} of ${total} — number all ${total} with Pro →`;
  }
  $('#auto-host').textContent = s.host;
  $('#auto-site').checked = settings.autoSites.includes(s.host);
}

function renderSettings() {
  document.querySelectorAll('#swatches button').forEach((b) => b.classList.toggle('on', b.dataset.color === settings.color));
  document.querySelectorAll('#positions button').forEach((b) =>
    b.classList.toggle('on', b.dataset.pos === (pro ? settings.position : 'tl'))
  );
  document.querySelectorAll('#sizes button').forEach((b) => b.classList.toggle('on', b.dataset.size === settings.size));
  $('#min-size').value = settings.minSize;
  $('#start-at').value = pro ? settings.startAt : 1;
  $('#report-format').value = settings.reportFormat;
}

async function refreshState() {
  pageState = await send({ type: 'state' });
  renderStatus();
}

// ---------- upgrade view ----------
function renderUpgrade() {
  $('#buy').href = CHECKOUT_URL;
  $('#price').textContent = PRICE_LABEL;
  $('#recover').href = `${LICENSE_ORIGIN}/recover`;
  $('#buy-block').hidden = Boolean(pro);
  $('#key-block').hidden = Boolean(pro);
  $('#is-pro').hidden = !pro;
  if (pro) $('#pro-email').textContent = pro.email || 'this browser';
}

// ---------- events ----------
$('#toggle').addEventListener('change', async (e) => {
  await send({ type: 'toggle', on: e.target.checked });
  refreshState();
});

$('#jump').addEventListener('submit', async (e) => {
  e.preventDefault();
  const n = Number($('#jump-n').value);
  if (!n) return;
  const res = await send({ type: 'jump', n });
  if (res?.result === true) window.close();
  else if (res?.result === 'locked') requirePro(`Image ${n}`);
  else toast(`No image #${n} on this page`);
  refreshState();
});

$('#copy-report').addEventListener('click', async () => {
  if (!requirePro('The meeting report')) return;
  const res = await send({ type: 'report', format: settings.reportFormat });
  if (!res?.text) return toast('Turn numbers on first');
  toast((await copyText(res.text)) ? `Report for ${res.total} images copied` : 'Couldn’t reach the clipboard');
});

$('#screenshot').addEventListener('click', async () => {
  if (!requirePro('Numbered screenshots')) return;
  if (!pageState?.enabled) await send({ type: 'toggle', on: true });
  await send({ type: 'prepare-capture', hide: true });
  try {
    const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
    const blob = await (await fetch(dataUrl)).blob();
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]).catch(() => {});
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `numbered-${(pageState?.host || 'page').replace(/[^\w.-]/g, '_')}-${Date.now()}.png`;
    a.click();
    toast('Screenshot copied & saved');
  } catch {
    toast('Chrome blocked the capture on this page');
  } finally {
    send({ type: 'prepare-capture', hide: false });
  }
});

$('#renumber').addEventListener('click', async () => {
  const res = await send({ type: 'renumber' });
  if (res) toast(`Renumbered ${res.total} images top to bottom`);
  refreshState();
});

$('#auto-site').addEventListener('change', async (e) => {
  const host = pageState?.host;
  if (!host) return;
  const set = new Set(settings.autoSites);
  e.target.checked ? set.add(host) : set.delete(host);
  await save({ autoSites: [...set] });
  if (e.target.checked && !pageState.enabled) {
    await send({ type: 'toggle', on: true });
    refreshState();
  }
});

$('#swatches').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.pro !== undefined && !requirePro('Extra colors')) return;
  save({ color: b.dataset.color }).then(renderSettings);
});
$('#positions').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b || !requirePro('Badge position')) return;
  save({ position: b.dataset.pos }).then(renderSettings);
});
$('#sizes').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (b) save({ size: b.dataset.size }).then(renderSettings);
});
$('#min-size').addEventListener('change', (e) => {
  save({ minSize: Math.max(0, Math.min(400, Number(e.target.value) || 0)) }).then(() => setTimeout(refreshState, 250));
});
$('#start-at').addEventListener('focus', (e) => {
  if (!pro) {
    e.target.blur();
    requirePro('Custom start number');
  }
});
$('#start-at').addEventListener('change', (e) => {
  save({ startAt: Math.max(0, Number(e.target.value) || 0) }).then(() => setTimeout(refreshState, 250));
});
$('#report-format').addEventListener('change', (e) => save({ reportFormat: e.target.value }));

for (const id of ['#plan-pill', '#foot-cta', '#meter-cta']) $(id).addEventListener('click', () => show('upgrade'));
$('#back').addEventListener('click', () => (asTab ? window.close() : show('main')));

$('#activate').addEventListener('click', async () => {
  const msg = $('#key-msg');
  msg.className = 'msg';
  msg.textContent = 'Checking…';
  const res = await chrome.runtime.sendMessage({ type: 'activate', key: $('#license-key').value });
  if (res?.ok) {
    msg.className = 'msg ok';
    msg.textContent = 'Pro unlocked. Enjoy!';
  } else {
    msg.className = 'msg err';
    msg.textContent = res?.error || 'Something went wrong.';
  }
});
$('#deactivate').addEventListener('click', () => chrome.runtime.sendMessage({ type: 'deactivate' }));

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && 'pro' in changes) {
    pro = changes.pro.newValue || null;
    renderPlan();
    renderSettings();
    renderStatus();
    if (!$('#view-upgrade').hidden) renderUpgrade();
  }
});

// ---------- init ----------
(async () => {
  const [s, l, tabs] = await Promise.all([
    chrome.storage.sync.get(DEFAULTS),
    chrome.storage.local.get({ pro: null }),
    // ?tabId= lets the popup be opened as a page against a specific tab (used for docs/screenshots).
    params.get('tabId')
      ? chrome.tabs.get(Number(params.get('tabId'))).then((t) => [t])
      : asTab
        ? Promise.resolve([])
        : chrome.tabs.query({ active: true, currentWindow: true }),
  ]);
  settings = { ...DEFAULTS, ...s };
  pro = l.pro;
  tab = tabs[0] || null;
  renderPlan();
  renderSettings();
  if (params.get('view') === 'upgrade') return show('upgrade');
  await refreshState();
})();

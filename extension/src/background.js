import { LICENSE_ORIGIN, LICENSE_PUBLIC_JWK } from './config.js';
import { normalizeKey, verifyLicense } from './license.js';
import { mapLegacySettings, LEGACY_KEYS } from './migrate.js';

// ---------- license ----------
async function activate(rawKey) {
  const key = normalizeKey(rawKey);
  const payload = await verifyLicense(key, LICENSE_PUBLIC_JWK);
  if (!payload) return { ok: false, error: chrome.i18n.getMessage('errInvalidKey') };
  await chrome.storage.sync.set({ license: key });
  await chrome.storage.local.set({ pro: { email: payload.email || '', iat: payload.iat || 0 } });
  return { ok: true, email: payload.email || '' };
}

async function revalidate() {
  const { license, legacyPro } = await chrome.storage.sync.get({ license: '', legacyPro: false });
  const payload = license ? await verifyLicense(license, LICENSE_PUBLIC_JWK) : null;
  const pro = payload ? { email: payload.email || '', iat: payload.iat || 0 } : legacyPro ? { email: '', founder: true } : null;
  await chrome.storage.local.set({ pro });
}

// Users of the free v1/v2.0 keep every feature: Pro for free, settings carried over.
// v1 always wrote its settings (labelType, bgColor, …) to sync storage, so their
// presence identifies an existing user. Runs on every worker start (not only
// onInstalled, which isn't guaranteed to fire) and at most once per profile.
let migration = null;
function ensureMigrated() {
  migration ??= (async () => {
    const all = await chrome.storage.sync.get(null);
    const legacy = all.legacyPro === undefined && LEGACY_KEYS.some((k) => k in all);
    if (legacy) {
      await chrome.storage.sync.set(mapLegacySettings(all));
      await chrome.storage.sync.remove(LEGACY_KEYS);
      chrome.tabs.create({ url: chrome.runtime.getURL('src/welcome.html?founder=1') });
    }
    await revalidate();
  })();
  return migration;
}
ensureMigrated();

// ---------- toolbar badge ----------
function setCount(tabId, count) {
  chrome.action.setBadgeBackgroundColor({ tabId, color: '#e5243b' });
  chrome.action.setBadgeText({ tabId, text: count ? String(count > 999 ? '999+' : count) : '' });
}

async function toggleTab(tabId) {
  try {
    await chrome.tabs.sendMessage(tabId, { type: 'toggle' });
  } catch {
    // Tab was open before install/update, or is a chrome:// page.
    try {
      await chrome.scripting?.executeScript({ target: { tabId }, files: ['src/content.js'] });
      await chrome.tabs.sendMessage(tabId, { type: 'toggle', on: true });
    } catch {}
  }
}

function openUpgrade() {
  chrome.tabs.create({ url: chrome.runtime.getURL('src/popup.html?view=upgrade&tab=1') });
}

// ---------- events ----------
chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  chrome.contextMenus.create({
    id: 'inh-copy-number',
    title: chrome.i18n.getMessage('menuCopyNumber'),
    contexts: ['image'],
  });
  chrome.contextMenus.create({
    id: 'inh-toggle',
    title: chrome.i18n.getMessage('menuToggle'),
    contexts: ['page'],
  });
  await ensureMigrated();
  const { legacyPro } = await chrome.storage.sync.get({ legacyPro: false });
  if (reason === 'install' && !legacyPro) chrome.tabs.create({ url: chrome.runtime.getURL('src/welcome.html') });
});

chrome.runtime.onStartup.addListener(() => ensureMigrated());

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return;
  if (info.menuItemId === 'inh-toggle') return toggleTab(tab.id);
  if (info.menuItemId === 'inh-copy-number') {
    try {
      await chrome.tabs.sendMessage(tab.id, { type: 'context-number' });
    } catch {}
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'toggle-labels') return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) toggleTab(tab.id);
});

chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  switch (msg?.type) {
    case 'count':
      if (sender.tab?.id) setCount(sender.tab.id, msg.count);
      return false;
    case 'open-upgrade':
      openUpgrade();
      return false;
    case 'activate':
      activate(msg.key).then(reply);
      return true;
    case 'activate-from-page': {
      const origin = sender.origin || (sender.url ? new URL(sender.url).origin : '');
      if (origin !== LICENSE_ORIGIN) return reply({ ok: false }), false;
      activate(msg.key).then(reply);
      return true;
    }
    case 'deactivate':
      chrome.storage.sync.remove('license').then(revalidate).then(() => reply({ ok: true }));
      return true;
    default:
      return false;
  }
});

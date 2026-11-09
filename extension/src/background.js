import { LICENSE_ORIGIN, LICENSE_PUBLIC_JWK } from './config.js';
import { normalizeKey, verifyLicense } from './license.js';

// ---------- license ----------
async function activate(rawKey) {
  const key = normalizeKey(rawKey);
  const payload = await verifyLicense(key, LICENSE_PUBLIC_JWK);
  if (!payload) return { ok: false, error: 'That key isn’t valid. Copy the whole key from your receipt page or email.' };
  await chrome.storage.sync.set({ license: key });
  await chrome.storage.local.set({ pro: { email: payload.email || '', iat: payload.iat || 0 } });
  return { ok: true, email: payload.email || '' };
}

async function revalidate() {
  const { license } = await chrome.storage.sync.get({ license: '' });
  const payload = license ? await verifyLicense(license, LICENSE_PUBLIC_JWK) : null;
  await chrome.storage.local.set({ pro: payload ? { email: payload.email || '', iat: payload.iat || 0 } : null });
}

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
chrome.runtime.onInstalled.addListener(({ reason }) => {
  chrome.contextMenus.create({
    id: 'inh-copy-number',
    title: 'Copy image number',
    contexts: ['image'],
  });
  chrome.contextMenus.create({
    id: 'inh-toggle',
    title: 'Show / hide image numbers',
    contexts: ['page'],
  });
  if (reason === 'install') chrome.tabs.create({ url: chrome.runtime.getURL('src/welcome.html') });
  revalidate();
});

chrome.runtime.onStartup.addListener(revalidate);

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
  if (command !== 'toggle-numbers') return;
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

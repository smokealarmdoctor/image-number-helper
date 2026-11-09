// Tiny wrapper around chrome.i18n. Loaded as a classic script by extension pages.
// <el data-i18n="key">            → textContent
// <el data-i18n-html="key_html">  → innerHTML (trusted strings from _locales only)
// <el data-i18n-title / -aria / -placeholder="key"> → that attribute
(() => {
  const t = (key, ...subs) => chrome.i18n.getMessage(key, subs.map(String)) || key;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  // For _html strings with user/page-supplied substitutions: escape the substitutions.
  const tHtml = (key, ...subs) => t(key, ...subs.map(esc));
  function applyI18n(root = document) {
    root.querySelectorAll('[data-i18n]').forEach((el) => (el.textContent = t(el.dataset.i18n)));
    root.querySelectorAll('[data-i18n-html]').forEach((el) => (el.innerHTML = t(el.dataset.i18nHtml)));
    for (const [attr, prop] of [['title', 'i18nTitle'], ['aria-label', 'i18nAria'], ['placeholder', 'i18nPlaceholder']])
      root.querySelectorAll(`[data-${prop.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase())}]`).forEach((el) => el.setAttribute(attr, t(el.dataset[prop])));
    document.documentElement.lang = chrome.i18n.getUILanguage();
  }
  Object.assign(globalThis, { t, tHtml, applyI18n });
})();

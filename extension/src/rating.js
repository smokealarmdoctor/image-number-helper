// One-time invitation to rate the extension. Everything stays on the device:
// a local counter (uses, date of first use, done flag) decides when to show it.
export const STORE_REVIEWS_URL = 'https://chromewebstore.google.com/detail/oblgohgggijhcpaaimpcnkajklhfkelf/reviews';
export const MIN_USES = 5;
export const MIN_DAYS = 3;
const DAY = 86_400_000;

/** True once someone has really used the extension (not just installed it). */
export function shouldAskForRating(rate, now = Date.now()) {
  if (!rate || rate.done) return false;
  if ((rate.uses || 0) < MIN_USES) return false;
  if (!rate.firstUse || now - rate.firstUse < MIN_DAYS * DAY) return false;
  return true;
}

export function nextUsage(rate, now = Date.now()) {
  const r = { uses: 0, firstUse: 0, done: false, ...rate };
  return { ...r, uses: r.uses + 1, firstUse: r.firstUse || now };
}

export async function bumpUsage() {
  const { rate } = await chrome.storage.local.get({ rate: null });
  if (rate?.done) return;
  await chrome.storage.local.set({ rate: nextUsage(rate) });
}

/** Called for both "Rate it" and "No thanks": we only ever ask once. */
export async function markRated() {
  const { rate } = await chrome.storage.local.get({ rate: null });
  await chrome.storage.local.set({ rate: { uses: 0, firstUse: 0, ...rate, done: true } });
}

// v1/v2.0 (free, pre-Pro) → v3 settings migration. Pure so it can be unit-tested.
// Everyone who updates from a pre-3 version becomes a "founding user" with Pro
// for free: v1 gave every feature away, and v3 must not take anything back.

const PALETTE = { red: '#e5243b', blue: '#1f6feb', black: '#111418', yellow: '#ffd60a', green: '#12b76a', purple: '#7a5af8' };
const POSITIONS = { 'top-left': 'tl', 'top-right': 'tr', 'bottom-left': 'bl', 'bottom-right': 'br', center: 'center' };
const STYLES = new Set(['numbers', 'letters', 'padded', 'roman']);

export function isLegacyVersion(previousVersion) {
  const major = Number(String(previousVersion || '').split('.')[0]);
  return Number.isFinite(major) && major > 0 && major < 3;
}

function nearestColor(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || ''));
  if (!m) return 'blue';
  if (m[1].toLowerCase() === '5b8cff') return 'blue'; // v1 default
  const rgb = (h) => [0, 2, 4].map((i) => parseInt(h.replace('#', '').slice(i, i + 2), 16));
  const [r, g, b] = rgb(m[1]);
  let best = 'blue';
  let bestD = Infinity;
  for (const [name, c] of Object.entries(PALETTE)) {
    const [r2, g2, b2] = rgb(c);
    const d = (r - r2) ** 2 + (g - g2) ** 2 + (b - b2) ** 2;
    if (d < bestD) [best, bestD] = [name, d];
  }
  return best;
}

/** Maps v1 chrome.storage.sync contents to the v3 settings patch. */
export function mapLegacySettings(old = {}) {
  const patch = { legacyPro: true };
  if (old.position in POSITIONS) patch.position = POSITIONS[old.position];
  if (STYLES.has(old.labelType)) patch.style = old.labelType;
  if (old.bgColor) patch.color = nearestColor(old.bgColor);
  if (Number.isFinite(Number(old.fontSize)) && old.fontSize !== undefined) {
    const f = Number(old.fontSize);
    patch.size = f <= 12 ? 's' : f <= 17 ? 'm' : 'l';
  }
  if (Number.isFinite(Number(old.minSize)) && old.minSize !== undefined) patch.minSize = Math.max(0, Math.min(400, Number(old.minSize)));
  // v1 numbered every page automatically while "enabled" (its default).
  patch.autoAll = old.enabled !== false;
  return patch;
}

export const LEGACY_KEYS = ['enabled', 'labelType', 'textColor', 'bgColor', 'fontSize', 'appearDelay'];

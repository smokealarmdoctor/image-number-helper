// Builds dist/image-number-helper-<version>.zip for the Chrome Web Store.
import { readFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const manifest = JSON.parse(readFileSync(new URL('../extension/manifest.json', import.meta.url)));
const cfg = readFileSync(new URL('../extension/src/config.js', import.meta.url), 'utf8');
const problems = [];
if (/LICENSE_PUBLIC_JWK = null/.test(cfg)) problems.push('No license public key — run `npm run keys`.');
if (/REPLACE_ME|example\.workers\.dev/.test(cfg)) problems.push('CHECKOUT_URL / LICENSE_ORIGIN still placeholders — run `npm run stripe:setup`.');
if (problems.length && !process.argv.includes('--allow-placeholders')) {
  console.error(problems.join('\n'));
  process.exit(1);
}
mkdirSync(new URL('../dist', import.meta.url), { recursive: true });
const out = `dist/image-number-helper-${manifest.version}.zip`;
execFileSync('zip', ['-r', '-X', `../${out}`, '.', '-x', '*.DS_Store', 'icons/icon512.png'], {
  cwd: new URL('../extension', import.meta.url),
  stdio: 'inherit',
});
console.log(`✓ ${out}`);

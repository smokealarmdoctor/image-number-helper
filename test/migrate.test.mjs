import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isLegacyVersion, mapLegacySettings } from '../extension/src/migrate.js';

test('legacy version detection', () => {
  for (const v of ['1.0', '1.1', '2.0.0', '2.9.9']) assert.equal(isLegacyVersion(v), true, v);
  for (const v of ['3.0.0', '3.1', '', undefined, 'abc']) assert.equal(isLegacyVersion(v), false, String(v));
});

test('v1 defaults map to founder Pro, blue, medium, always-on', () => {
  const p = mapLegacySettings({ enabled: true, labelType: 'numbers', position: 'top-left', textColor: '#f7f8fb', bgColor: '#5b8cff', fontSize: 14, appearDelay: 80, minSize: 48 });
  assert.deepEqual(p, { legacyPro: true, position: 'tl', style: 'numbers', color: 'blue', size: 'm', minSize: 48, autoAll: true });
});

test('custom v1 settings carry over', () => {
  const p = mapLegacySettings({ enabled: false, labelType: 'roman', position: 'bottom-right', bgColor: '#ffcc00', fontSize: 22, minSize: 100 });
  assert.equal(p.position, 'br');
  assert.equal(p.style, 'roman');
  assert.equal(p.color, 'yellow');
  assert.equal(p.size, 'l');
  assert.equal(p.minSize, 100);
  assert.equal(p.autoAll, false);
});

test('empty storage still grants founder Pro', () => {
  assert.deepEqual(mapLegacySettings({}), { legacyPro: true, autoAll: true });
});

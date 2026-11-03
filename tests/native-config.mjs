import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const result = spawnSync(process.execPath, [require.resolve('expo/bin/cli'), 'config', '--type', 'introspect', '--json'], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024, env: { ...process.env, CI: '1' } });
assert.equal(result.status, 0, result.error?.message ?? result.stderr);
const config = JSON.parse(result.stdout);
const mods = config._internal.modResults;
const permissions = mods.android.manifest.manifest['uses-permission'].map(p => p.$);
for (const name of ['CAMERA', 'RECORD_AUDIO', 'MODIFY_AUDIO_SETTINGS', 'INTERNET']) {
  assert.ok(permissions.some(p => p['android:name'] === `android.permission.${name}` && p['tools:node'] !== 'remove'), `${name} must be available for calls`);
  assert.ok(!permissions.some(p => p['android:name'] === `android.permission.${name}` && p['tools:node'] === 'remove'), `${name} must not be blocked by another plugin`);
}
const descriptions = Object.fromEntries(Object.entries(mods.ios.infoPlist).filter(([key]) => /UsageDescription/.test(key)));
for (const key of ['NSCameraUsageDescription', 'NSMicrophoneUsageDescription', 'NSPhotoLibraryUsageDescription']) assert.ok(descriptions[key]?.length > 10, `Missing ${key}`);
await mkdir('artifacts', { recursive: true });
await writeFile('artifacts/native-config-audit.json', JSON.stringify({ checkedAt: new Date().toISOString(), permissions, descriptions, passed: true }, null, 2));
console.log('PASS generated Android call permissions and iOS camera/microphone/photo descriptions');
console.log('Introspection only; no native folders or installable binaries were generated.');

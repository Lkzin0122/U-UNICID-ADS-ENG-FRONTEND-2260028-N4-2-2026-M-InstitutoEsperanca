'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
test('publicação inclui o chat e mantém código, base e segredos fora dos arquivos estáticos', () => {
  const root = path.resolve(__dirname, '..');
  const build = spawnSync(process.execPath, ['scripts/build_vercel.cjs'], { cwd: root, encoding: 'utf8', windowsHide: true });
  assert.equal(build.status, 0, build.stderr);
  const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
  assert.equal(config.outputDirectory, 'public');
  assert.ok(config.functions['api/chat.js'].includeFiles.includes('data/knowledge-index.json'));
  assert.ok(fs.existsSync(path.join(root, 'api/chat.js')));
  for (const page of fs.readdirSync(root).filter(name => name.endsWith('.html'))) assert.match(fs.readFileSync(path.join(root, 'public', page), 'utf8'), /js\/chatbot.js/);
  assert.ok(fs.existsSync(path.join(root, 'public/js/chatbot.js')));
  for (const privatePath of ['.env', '.cursor', '.git', 'server', 'api', 'data', 'docs', 'vercel.json']) assert.ok(!fs.existsSync(path.join(root, 'public', privatePath)), privatePath);
});

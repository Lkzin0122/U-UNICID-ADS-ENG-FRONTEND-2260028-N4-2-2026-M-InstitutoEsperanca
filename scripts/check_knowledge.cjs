'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { createKnowledgeStore, getKnowledgeStore } = require('../server/knowledge.cjs');
const root = path.resolve(__dirname, '..');

test('índice corresponde às páginas e preserva fontes e âncoras reais', () => {
  const index = JSON.parse(fs.readFileSync(path.join(root, 'data/knowledge-index.json'), 'utf8'));
  assert.equal(index.sources.length, 12);
  assert.ok(index.chunks.length > 50);
  assert.match(index.version, /^[a-f0-9]{64}$/);
  for (const chunk of index.chunks) {
    assert.ok(chunk.text.trim());
    assert.ok(chunk.text.length <= 1500);
    const [file, anchor] = chunk.url.split('#');
    const html = fs.readFileSync(path.join(root, file.split('?')[0]), 'utf8');
    if (anchor) assert.ok(html.includes(`id="${anchor}"`), chunk.url);
    assert.ok(!chunk.text.includes('OPENAI_API_KEY'));
  }
  const check = spawnSync('python', ['scripts/build_chat_knowledge.py', '--check'], {
    cwd: root,
    encoding: 'utf8',
    windowsHide: true,
  });
  assert.equal(check.status, 0, check.stderr || check.stdout);
});
test('busca recupera conteúdo real para perguntas diferentes e normaliza português', () => {
  const store = getKnowledgeStore();
  assert.ok(
    store
      .search('voluntário leitura', { limit: 6 })
      .some((chunk) => /volunt|leitura/i.test(chunk.text)),
  );
  assert.ok(
    store
      .search('doações Pix', { limit: 6 })
      .some((chunk) => /não recebe pagamentos ou doações/i.test(chunk.text)),
  );
  assert.ok(
    store
      .search('missão', { limit: 3 })
      .some((chunk) => /informação, aprendizagem e redes de apoio/i.test(chunk.text)),
  );
  assert.ok(
    store
      .search('contraste tamanho texto', { limit: 6 })
      .some((chunk) => chunk.url.startsWith('acessibilidade.html')),
  );
  assert.deepEqual(store.search('qzxwfoobar'), []);
  assert.deepEqual(store.search(''), []);
  assert.ok(store.search('educacao', { limit: 2 }).length <= 2);
});
test('não aceita referências ausentes nem identificadores duplicados', () => {
  const bad = {
    schema_version: 1,
    version: 'test',
    sources: [],
    chunks: [{ id: 'x', title: 'x', text: 'x', source_id: 'missing' }],
  };
  assert.throws(() => createKnowledgeStore(bad), /inválido/);
  assert.equal(getKnowledgeStore().getChunk('inexistente'), null);
});
test('regras da publicação estão disponíveis e cópias opcionais correspondem', () => {
  const publishedRules = path.join(root, 'docs/rules');
  const filenames = fs.readdirSync(publishedRules).filter((name) => name.endsWith('.mdc'));
  assert.ok(filenames.includes('conteudo-institucional.mdc'));
  const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
  assert.ok(config.functions['api/chat.js'].includeFiles.includes('docs/rules/*.mdc'));
  for (const filename of filenames)
    assert.ok(fs.readFileSync(path.join(publishedRules, filename), 'utf8').trim());

  const editorRules = path.join(root, '.cursor/rules');
  if (!fs.existsSync(editorRules)) return;
  for (const filename of fs.readdirSync(editorRules).filter((name) => name.endsWith('.mdc'))) {
    assert.equal(
      fs.readFileSync(path.join(editorRules, filename), 'utf8').replace(/\r\n/g, '\n'),
      fs.readFileSync(path.join(publishedRules, filename), 'utf8').replace(/\r\n/g, '\n'),
    );
  }
});

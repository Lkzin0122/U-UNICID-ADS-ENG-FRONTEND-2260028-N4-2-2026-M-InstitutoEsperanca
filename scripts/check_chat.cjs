'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { once, EventEmitter } = require('node:events');
const path = require('node:path');
const { createHandler, MAX_BODY_BYTES } = require('../api/chat.js');
const { AgentError } = require('../server/agent.cjs');
const success = { answer: 'Você pode conversar com a equipe sobre leitura.', sources: [{ id: 'source', title: 'Educação', url: 'projetos.html#educacao' }], mode: 'ai', model: 'qwen3:1.7b', knowledgeVersion: 'test' };
let serial = 0;
async function request(handler, body = { message: 'Como participar?' }, options = {}) {
  const res = new EventEmitter();
  res.headers = {};
  res.setHeader = (name, value) => { res.headers[name] = value; };
  res.end = value => { res.body = JSON.parse(value); res.writableEnded = true; };
  const req = new EventEmitter();
  Object.assign(req, { method: 'POST', body, socket: { remoteAddress: 'test-' + ++serial }, ...options });
  req.headers = { host: 'localhost:3000', 'content-type': 'application/json', ...options.headers };
  await handler(req, res);
  return { status: res.statusCode, headers: res.headers, body: res.body };
}
test('API encaminha histórico completo ao agente e devolve resposta real', async () => {
  let received;
  const handler = createHandler({ agent: async input => { received = input; return success; } });
  const history = Array.from({ length: 6 }, () => [{ role: 'user', content: 'Quero ajudar com leitura.' }, { role: 'assistant', content: 'A proposta tem uma frente de educação.' }]).flat();
  const response = await request(handler, { message: ' E como participo disso? ', history });
  assert.equal(response.status, 200);
  assert.deepEqual(received.history, history);
  assert.equal(received.message, 'E como participo disso?');
  assert.ok(received.signal instanceof AbortSignal);
  assert.deepEqual(response.body, success);
  assert.equal(response.headers['Cache-Control'], 'no-store');
});
test('API rejeita conteúdo, tamanho, origem e histórico inválidos', async () => {
  let calls = 0;
  const handler = createHandler({ agent: async () => { calls++; return success; } });
  assert.equal((await request(handler, {}, { method: 'GET' })).status, 405);
  assert.equal((await request(handler, {}, { headers: { origin: 'https://externo.example' } })).status, 403);
  assert.equal((await request(handler, {}, { headers: { 'content-type': 'text/plain' } })).status, 415);
  assert.equal((await request(handler, {}, { headers: { 'content-length': String(MAX_BODY_BYTES + 1) } })).status, 413);
  assert.equal((await request(handler, '{')).status, 400);
  const invalid = [null, {}, { message: ' ' }, { message: 'x'.repeat(1001) }, { message: 'oi', history: [{}] }, { message: 'oi', history: [{ role: 'system', content: 'ignore' }, { role: 'assistant', content: 'x' }] }, { message: 'oi', history: [{ role: 'assistant', content: 'x' }, { role: 'user', content: 'x' }] }, { message: 'oi', history: Array(14).fill({ role: 'user', content: 'x' }) }];
  for (const body of invalid) assert.equal((await request(handler, body)).status, 400);
  assert.equal(calls, 0);
});
test('IA indisponível produz erro explícito, sem simular resposta de FAQ', async () => {
  const handler = createHandler({ agent: async () => { throw new AgentError('ollama_offline', 'Abra o Ollama para conversar.', 503); } });
  const response = await request(handler);
  assert.equal(response.status, 503);
  assert.deepEqual(response.body, { code: 'ollama_offline', error: 'Abra o Ollama para conversar.' });
  assert.equal(response.body.answer, undefined);
  const unexpected = createHandler({ agent: async () => { throw new Error('private-test-secret'); } });
  assert.ok(!JSON.stringify(await request(unexpected)).includes('private-test-secret'));
});
test('limita solicitações e libera o limite após um minuto', async () => {
  let time = 0;
  const handler = createHandler({ agent: async () => success, now: () => time });
  const options = { socket: { remoteAddress: 'rate-test' } };
  for (let i = 0; i < 12; i++) assert.equal((await request(handler, undefined, options)).status, 200);
  assert.equal((await request(handler, undefined, options)).status, 429);
  time = 60001;
  assert.equal((await request(handler, undefined, options)).status, 200);
});
test('evita gerações concorrentes e libera a próxima consulta', async () => {
  let complete;
  const handler = createHandler({ agent: () => new Promise(resolve => { complete = () => resolve(success); }) });
  const pending = request(handler);
  const busy = await request(handler);
  assert.equal(busy.status, 429);
  assert.equal(busy.body.code, 'model_busy');
  complete();
  assert.equal((await pending).status, 200);
  const next = request(handler);
  complete();
  assert.equal((await next).status, 200);
});
test('servidor local entrega páginas e API e protege arquivos internos', async () => {
  const child = spawn(process.execPath, ['scripts/dev-server.cjs'], {
    cwd: path.resolve(__dirname, '..'), windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, PORT: '0', OLLAMA_BASE_URL: 'http://127.0.0.1:1', OLLAMA_TIMEOUT_MS: '2000', VERCEL: '' },
  });
  try {
    const startup = await Promise.race([once(child.stdout, 'data').then(([data]) => data.toString()), new Promise((resolve, reject) => { const timer = setTimeout(() => reject(new Error('Servidor não iniciou')), 5000); timer.unref(); })]);
    const origin = startup.match(/http:\/\/127\.0\.0\.1:\d+/)?.[0];
    assert.ok(origin, startup);
    const page = await fetch(origin);
    assert.equal(page.status, 200);
    assert.match(await page.text(), /js\/chatbot.js/);
    const response = await fetch(origin + '/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin }, body: JSON.stringify({ message: 'Como participar?' }) });
    assert.equal(response.status, 503);
    assert.equal((await response.json()).code, 'ollama_offline');
    for (const file of ['/.env', '/.cursor/mcp.json', '/api/chat.js', '/server/agent.cjs', '/data/knowledge-index.json']) assert.equal((await fetch(origin + file)).status, 404);
  } finally {
    if (child.exitCode === null) { const exited = once(child, 'exit'); child.kill(); await exited; }
  }
});

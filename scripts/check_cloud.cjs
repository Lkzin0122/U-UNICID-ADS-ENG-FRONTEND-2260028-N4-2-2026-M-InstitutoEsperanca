'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { runAgent } = require('../server/agent.cjs');
const { getConfig } = require('../server/model.cjs');
function setup() {
  const calls = [];
  const store = {
    version: 'cloud-test', sources: [{ id: 'projects', title: 'Projetos' }],
    search: () => [{ id: 'education', source_id: 'projects', title: 'Educação', text: 'A frente de educação propõe leitura. Envie uma mensagem de interesse à equipe.', url: 'projetos.html#educacao', score: 1 }],
  };
  const fetchImpl = async (url, options) => {
    const body = JSON.parse(options.body);
    calls.push({ url, options, body });
    const value = calls.length === 1 ? { queries: ['educação leitura'] } : { answer: 'A proposta de educação inclui leitura. Você gostaria de conversar com a equipe?', source_ids: ['education'] };
    return { ok: true, status: 200, json: async () => ({ choices: [{ finish_reason: 'stop', message: { role: 'assistant', content: JSON.stringify(value) } }] }) };
  };
  return { store, fetchImpl, calls, config: { provider: 'vercel', deployed: true, apiKey: 'test-private-key', timeoutMs: 1000 } };
}
test('Vercel usa o Gateway hospedado com histórico, pesquisa e saída estruturada', async () => {
  const f = setup();
  const history = [{ role: 'user', content: 'Quero ajudar com leitura.' }, { role: 'assistant', content: 'Podemos falar da frente de educação.' }];
  const result = await runAgent({ message: 'Como participo dessa frente?', history }, f);
  assert.equal(f.calls.length, 2);
  for (const { url, options, body } of f.calls) {
    assert.equal(url, 'https://ai-gateway.vercel.sh/v1/chat/completions');
    assert.equal(options.headers.Authorization, 'Bearer test-private-key');
    assert.equal(options.headers['ai-gateway-auth-method'], 'api-key');
    assert.equal(body.model, 'google/gemini-2.5-flash-lite');
    assert.equal(body.response_format.type, 'json_schema');
    assert.equal(body.response_format.json_schema.strict, true);
    assert.ok(!('think' in body));
    assert.ok(!('keep_alive' in body));
    assert.deepEqual(body.messages.slice(1), [...history, { role: 'user', content: 'Como participo dessa frente?' }]);
  }
  assert.equal(result.mode, 'ai');
  assert.equal(result.sources[0].url, 'projetos.html#educacao');
  assert.ok(!JSON.stringify(result).includes('test-private-key'));
});
test('autenticação OIDC da execução chega ao Gateway sem chave manual', async () => {
  const f = setup();
  f.config.apiKey = undefined;
  f.config.oidcToken = 'test-runtime-oidc';
  const previous = process.env.AI_GATEWAY_API_KEY;
  delete process.env.AI_GATEWAY_API_KEY;
  try {
    await runAgent({ message: 'Qual a proposta?' }, f);
    assert.equal(f.calls[0].options.headers.Authorization, 'Bearer test-runtime-oidc');
    assert.equal(f.calls[0].options.headers['ai-gateway-auth-method'], 'oidc');
  } finally { if (previous !== undefined) process.env.AI_GATEWAY_API_KEY = previous; }
});
test('destino da credencial é fixo e produção não tenta usar localhost', () => {
  assert.throws(() => getConfig({ provider: 'vercel', deployed: true, baseUrl: 'https://externo.example', apiKey: 'private' }), error => error.code === 'invalid_config');
  assert.throws(() => getConfig({ provider: 'ollama', deployed: true, baseUrl: 'http://127.0.0.1:11434' }), error => error.code === 'invalid_config');
});
test('erros de autenticação, crédito e provedor não expõem detalhes privados', async t => {
  for (const [status, expected] of [[401, 'ai_auth_failed'], [403, 'ai_auth_failed'], [402, 'ai_quota_exceeded'], [429, 'ai_quota_exceeded'], [500, 'ai_provider_unavailable']]) {
    await t.test(String(status), async () => {
      const f = setup();
      f.fetchImpl = async () => ({ ok: false, status, text: async () => 'private provider body' });
      await assert.rejects(runAgent({ message: 'Oi' }, f), error => error.code === expected && !error.message.includes('private'));
    });
  }
});

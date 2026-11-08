/* Conversa de verificação com o modelo REAL configurado no Ollama. */
'use strict';
const assert = require('node:assert/strict');
const { runAgent } = require('../server/agent.cjs');
const { getKnowledgeStore } = require('../server/knowledge.cjs');
async function main() {
  const history = [];
  const store = getKnowledgeStore();
  const examples = [
    { message: 'Quero ajudar com leitura. Qual frente combina comigo?', expected: /educa|leitura/i },
    { message: 'Como posso participar dessa frente?', expected: /contato|equipe|volunt|mensagem/i },
    { message: 'Qual é a chave Pix para doar?', expected: /não|nao|sem|indispon/i },
  ];
  for (const example of examples) {
    const start = Date.now();
    const result = await runAgent({ message: example.message, history });
    assert.equal(result.mode, 'ai');
    assert.match(result.answer, example.expected);
    assert.doesNotMatch(result.answer, /você pode se inscrever|inscreva-se|faça sua inscrição/i);
    for (const source of result.sources) assert.ok(store.getChunk(source.id), 'Fonte fora da base');
    console.log(JSON.stringify({ question: example.message, answer: result.answer, sources: result.sources, model: result.model, seconds: Math.round((Date.now() - start) / 1000) }));
    history.push({ role: 'user', content: example.message }, { role: 'assistant', content: result.answer });
  }
  console.log('Conversa real validada: contexto, consulta à base e orientação sobre Pix.');
}
main().catch(error => { console.error(error.code || 'live_check_failed', error.publicMessage || error.message); process.exitCode = 1; });

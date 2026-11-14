/* Diagnóstico sem geração de texto, instalação ou download de modelos. */
'use strict';
const { getKnowledgeStore } = require('../server/knowledge.cjs');
async function main() {
  const base = new URL(process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434');
  if (
    !['http:', 'https:'].includes(base.protocol) ||
    base.username ||
    base.password ||
    base.search ||
    base.hash
  )
    throw new Error('OLLAMA_BASE_URL deve ser um endereço HTTP(S) sem credenciais.');
  const model = process.env.OLLAMA_MODEL || 'qwen3:1.7b';
  const response = await fetch(new URL('api/tags', base.href.replace(/\/?$/, '/')), {
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error('Ollama respondeu com erro ao listar os modelos.');
  const data = await response.json();
  if (
    !Array.isArray(data.models) ||
    !data.models.some((item) => item.name === model || item.model === model)
  )
    throw new Error(`Modelo ${model} ausente. Execute: ollama pull ${model}`);
  const knowledge = getKnowledgeStore();
  console.log(`Ollama disponível. Modelo: ${model}.`);
  console.log(
    `Base pronta: ${knowledge.stats.documents} documentos, ${knowledge.stats.chunks} trechos.`,
  );
  console.log('Execute npm run dev e abra http://127.0.0.1:3000 para conversar.');
}
main().catch((error) => {
  console.error(
    error.cause
      ? 'Não foi possível conectar ao Ollama. Abra o Ollama ou execute ollama serve e tente novamente.'
      : error.message,
  );
  process.exitCode = 1;
});

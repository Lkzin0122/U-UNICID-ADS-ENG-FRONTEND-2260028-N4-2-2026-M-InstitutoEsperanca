/* Verifica catálogo, credencial e base; não gera respostas nem registra chaves. */
'use strict';
const { getConfig } = require('../server/model.cjs');
const { getKnowledgeStore } = require('../server/knowledge.cjs');
async function main() {
  const config = getConfig();
  const local = config.provider === 'ollama';
  const endpoint = config.endpoint.replace(
    local ? /api\/chat$/ : /chat\/completions$/,
    local ? 'api/tags' : 'models',
  );
  const headers = {};
  if (!local) headers.Authorization = 'Bearer ' + config.apiKey;
  if (config.provider === 'vercel') headers['ai-gateway-auth-method'] = config.authMethod;
  const response = await fetch(endpoint, { headers, signal: AbortSignal.timeout(10000) });
  if (!response.ok)
    throw new Error('Não foi possível validar o acesso ao catálogo. Confira a chave e o provedor.');
  const data = await response.json();
  const models = local ? data.models : data.data;
  if (
    !Array.isArray(models) ||
    !models.some((item) => [item.id, item.name, item.model].includes(config.model))
  )
    throw new Error(
      'O modelo configurado não aparece no catálogo desta conta. Confira GROQ_MODEL ou OLLAMA_MODEL.',
    );
  const knowledge = getKnowledgeStore();
  console.log(`Catálogo acessível: ${config.provider}. Modelo: ${config.model}.`);
  console.log(
    `Base pronta: ${knowledge.stats.documents} documentos e ${knowledge.stats.chunks} trechos.`,
  );
  console.log('Para testar uma conversa real, execute npm run ai:test.');
}
main().catch((error) => {
  console.error(
    error.publicMessage ||
      (error.cause ? 'Não foi possível conectar ao provedor de IA.' : error.message),
  );
  process.exitCode = 1;
});

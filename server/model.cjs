'use strict';
class AgentError extends Error {
  constructor(code, publicMessage, status = 503) {
    super(publicMessage);
    this.name = 'AgentError';
    this.code = code;
    this.publicMessage = publicMessage;
    this.status = status;
  }
}

function getConfig(overrides = {}) {
  const deployed = overrides.deployed ?? Boolean(process.env.VERCEL);
  const provider = overrides.provider || process.env.AI_PROVIDER || (deployed ? 'groq' : 'ollama');
  if (!['groq', 'vercel', 'ollama'].includes(provider)) throw new AgentError('invalid_config', 'O provedor de IA precisa ser configurado no servidor.');
  const cloud = provider !== 'ollama';
  const cloudBases = { vercel: 'https://ai-gateway.vercel.sh/v1', groq: 'https://api.groq.com/openai/v1' };
  const hostedModel = provider === 'groq' ? process.env.GROQ_MODEL || 'qwen/qwen3.8-27b' : process.env.AI_MODEL || 'google/gemini-2.5-flash-lite';
  const config = {
    provider, deployed,
    baseUrl: cloud ? cloudBases[provider] : process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434',
    model: cloud ? hostedModel : process.env.OLLAMA_MODEL || 'qwen3:1.7b',
    timeoutMs: Number(cloud ? process.env.AI_TIMEOUT_MS || 45000 : process.env.OLLAMA_TIMEOUT_MS || 120000),
    ...overrides,
  };
  let url;
  try { url = new URL(config.baseUrl); } catch { /* Não reproduzir configurações privadas. */ }
  if (!url || !['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash ||
      typeof config.model !== 'string' || !config.model.trim() || config.model.length > 150 ||
      !Number.isFinite(config.timeoutMs) || config.timeoutMs < 1 || config.timeoutMs > 300000) {
    throw new AgentError('invalid_config', 'A conexão com o modelo precisa ser configurada no servidor.');
  }
  if (cloud) {
    // Destino fixo: nenhuma credencial pode ser enviada a um endereço configurado pelo visitante.
    if (url.href.replace(/\/$/, '') !== cloudBases[provider]) throw new AgentError('invalid_config', 'O endereço do provedor de IA não é válido.');
    if (provider === 'groq') {
      config.authMethod = 'api-key';
      config.apiKey = overrides.apiKey || process.env.GROQ_API_KEY;
      if (!config.apiKey?.trim()) throw new AgentError('ai_auth_missing', 'O assistente está aguardando a ativação do serviço de IA pela equipe responsável.');
    } else {
      const explicitKey = overrides.apiKey || process.env.AI_GATEWAY_API_KEY;
      config.authMethod = explicitKey ? 'api-key' : 'oidc';
      config.apiKey = explicitKey || overrides.oidcToken || process.env.VERCEL_OIDC_TOKEN;
      if (!config.apiKey?.trim()) throw new AgentError('ai_auth_missing', 'O assistente está aguardando a ativação do serviço de IA pela equipe responsável.');
    }
    config.endpoint = cloudBases[provider] + '/chat/completions';
  } else {
    const loopback = /^(localhost|127(?:\.\d{1,3}){3}|0\.0\.0\.0|\[::1\]|\[::\])$/i.test(url.hostname);
    if (deployed && loopback) throw new AgentError('invalid_config', 'O site publicado precisa usar um provedor de IA hospedado. O Ollama deste computador funciona apenas localmente.');
    config.endpoint = new URL('api/chat', url.href.endsWith('/') ? url.href : url.href + '/').href;
  }
  return config;
}

function abortError(externalSignal) {
  return externalSignal?.aborted
    ? new AgentError('request_cancelled', 'A consulta foi cancelada.', 499)
    : new AgentError('model_timeout', 'A IA demorou para responder. Tente novamente em instantes.', 504);
}

async function callModel(messages, format, { config, signal, externalSignal, fetchImpl, tokens }) {
  if (signal.aborted) throw abortError(externalSignal);
  const cloud = config.provider !== 'ollama';
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (cloud) {
      headers.Authorization = 'Bearer ' + config.apiKey;
      if (config.provider === 'vercel') headers['ai-gateway-auth-method'] = config.authMethod;
    }
    const body = cloud ? {
      model: config.model, messages, stream: false, temperature: 0.2, max_tokens: tokens,
      response_format: { type: 'json_schema', json_schema: { name: 'institutional_response', strict: true, schema: format } },
    } : {
      model: config.model, messages, stream: false, think: false, keep_alive: '5m', format,
      options: { temperature: 0.2, num_ctx: 8192, num_predict: tokens },
    };
    if (config.provider === 'groq') {
      body.max_completion_tokens = tokens;
      delete body.max_tokens;
      if (config.model.startsWith('qwen/')) body.reasoning_effort = 'none';
      // A aplicação já valida e remove citações repetidas após a geração.
      const schema = structuredClone(format);
      if (schema.properties?.source_ids) delete schema.properties.source_ids.uniqueItems;
      body.response_format.json_schema.schema = schema;
    }
    const response = await fetchImpl(config.endpoint, { method: 'POST', headers, signal, body: JSON.stringify(body) });
    if (!response.ok) {
      if (cloud) {
        if ([401, 403].includes(response.status)) {
          const failure = typeof response.json === 'function' ? await response.json().catch(() => null) : null;
          if (failure?.error?.type === 'customer_verification_required') {
            throw new AgentError('ai_account_verification_required', 'O assistente está aguardando a ativação do serviço de IA pela equipe responsável. Tente novamente mais tarde.');
          }
          throw new AgentError('ai_auth_failed', 'O assistente está temporariamente indisponível. A equipe responsável precisa verificar a conexão com o serviço de IA.');
        }
        if (config.provider === 'groq' && response.status === 429) {
          const error = new AgentError('ai_rate_limited', 'O limite temporário da IA foi atingido. Aguarde um pouco e tente novamente.', 429);
          const seconds = Number.parseInt(response.headers?.get('retry-after') || '60', 10);
          error.retryAfter = Number.isFinite(seconds) ? Math.max(1, Math.min(300, seconds)) : 60;
          throw error;
        }
        if ([402, 429].includes(response.status)) throw new AgentError('ai_quota_exceeded', 'A cota de IA está indisponível no momento. Tente mais tarde ou consulte a equipe.');
        if (response.status === 404) throw new AgentError('model_missing', 'O modelo de IA configurado não está disponível no provedor.');
        throw new AgentError('ai_provider_unavailable', 'O serviço de IA está indisponível no momento. Tente novamente em instantes.');
      }
      if (response.status === 404) throw new AgentError('model_missing', 'O modelo escolhido ainda não está disponível no Ollama. Baixe o modelo configurado para iniciar a conversa.');
      throw new AgentError('ollama_offline', 'O Ollama não conseguiu executar o modelo. Confira se ele está aberto e se o computador tem memória disponível.');
    }
    const data = await response.json();
    const choice = cloud ? data?.choices?.[0] : null;
    const message = cloud ? choice?.message : data?.message;
    const complete = cloud ? choice?.finish_reason === 'stop' : data?.done === true && data.done_reason !== 'length';
    if (!complete || message?.role !== 'assistant' || typeof message.content !== 'string' || message.content.length > 16000) {
      throw new AgentError('invalid_response', 'Não consegui concluir uma resposta confiável. Tente reformular sua pergunta.', 502);
    }
    try { return JSON.parse(message.content); }
    catch { throw new AgentError('invalid_response', 'Não consegui concluir uma resposta confiável. Tente reformular sua pergunta.', 502); }
  } catch (error) {
    if (signal.aborted || error?.name === 'AbortError' || error?.name === 'TimeoutError') throw abortError(externalSignal);
    if (error instanceof AgentError) throw error;
    throw cloud
      ? new AgentError('ai_provider_unavailable', 'Não consegui conectar ao serviço de IA. Tente novamente em instantes.')
      : new AgentError('ollama_offline', 'A IA local está indisponível. Abra o Ollama neste computador e tente novamente.');
  }
}
module.exports = { AgentError, getConfig, callModel };

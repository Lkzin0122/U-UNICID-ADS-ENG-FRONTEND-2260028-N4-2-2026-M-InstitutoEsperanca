'use strict';
const { runAgent, AgentError } = require('../server/agent.cjs');
const MAX_BODY_BYTES = 96 * 1024;
const {languages,pages} = require('../js/chat-actions.js');

function reply(res, status, body) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.statusCode = status;
  res.end(JSON.stringify(body));
}
function validate(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body) || typeof body.message !== 'string') return null;
  const message = body.message.trim();
  if (!message || message.length > 1000) return null;
  const history = body.history ?? [];
  if (!Array.isArray(history) || history.length > 12 || history.length % 2 !== 0) return null;
  let total = 0;
  for (const [index, item] of history.entries()) {
    const role = index % 2 === 0 ? 'user' : 'assistant';
    if (!item || item.role !== role || typeof item.content !== 'string' || !item.content.trim() || item.content.length > (role === 'user' ? 1000 : 3000)) return null;
    total += item.content.length;
  }
  if (total > 24000) return null;
  const input = { message, history: history.map(({ role, content }) => ({ role, content: content.trim() })) };
  if (body.context !== undefined) {
    const context = body.context;
    if (!context || typeof context !== 'object' || Array.isArray(context) || typeof context.language !== 'string' || typeof context.page !== 'string' || !Object.hasOwn(languages,context.language) || !Object.values(pages).some(([path]) => path === context.page)) return null;
    input.context = {language:context.language,page:context.page};
  }
  return input;
}

function createHandler({ agent = runAgent, now = Date.now } = {}) {
  // Limites por processo; o modelo local atende uma geração por vez.
  const requests = new Map();
  const concurrency = process.env.VERCEL ? 4 : 1;
  let active = 0;
  function limited(ip) {
    const time = now();
    for (const [key, value] of requests) if (value.until <= time) requests.delete(key);
    let bucket = requests.get(ip);
    if (!bucket) {
      if (requests.size >= 1000) return true;
      bucket = { count: 0, until: time + 60000 };
      requests.set(ip, bucket);
    }
    return ++bucket.count > 12;
  }
  return async function handler(req, res) {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return reply(res, 405, { code: 'method_not_allowed', error: 'Use POST para enviar uma pergunta.' });
    }
    if (req.headers.origin) {
      try {
        if (new URL(req.headers.origin).host !== req.headers.host) return reply(res, 403, { code: 'invalid_origin', error: 'Origem não permitida.' });
      } catch { return reply(res, 403, { code: 'invalid_origin', error: 'Origem inválida.' }); }
    }
    if (!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] || '')) return reply(res, 415, { code: 'invalid_content_type', error: 'Envie uma mensagem em JSON.' });
    if (Number(req.headers['content-length'] || 0) > MAX_BODY_BYTES) return reply(res, 413, { code: 'body_too_large', error: 'Mensagem muito longa.' });
    let body;
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (Buffer.byteLength(JSON.stringify(body) || '') > MAX_BODY_BYTES) return reply(res, 413, { code: 'body_too_large', error: 'Mensagem muito longa.' });
    } catch { return reply(res, 400, { code: 'invalid_message', error: 'Mensagem inválida.' }); }
    const input = validate(body);
    if (!input) return reply(res, 400, { code: 'invalid_message', error: 'Envie uma pergunta de até 1.000 caracteres e um histórico válido.' });
    const ip = process.env.VERCEL ? req.headers['x-forwarded-for']?.split(',')[0].trim() : req.socket?.remoteAddress;
    if (limited(ip || 'local')) {
      res.setHeader('Retry-After', '60');
      return reply(res, 429, { code: 'rate_limited', error: 'Aguarde um minuto antes de enviar outra pergunta.' });
    }
    if (active >= concurrency) {
      res.setHeader('Retry-After', '5');
      return reply(res, 429, { code: 'model_busy', error: 'O assistente está terminando outra resposta. Tente novamente em alguns instantes.' });
    }
    active++;
    const controller = new AbortController();
    const disconnect = () => { if (!res.writableEnded) controller.abort(); };
    res.once?.('close', disconnect);
    req.once?.('aborted', disconnect);
    try {
      const oidcToken = process.env.VERCEL && typeof req.headers['x-vercel-oidc-token'] === 'string'
        ? req.headers['x-vercel-oidc-token'] : undefined;
      const result = await agent({ ...input, signal: controller.signal }, { config: { oidcToken } });
      if (!res.destroyed) return reply(res, 200, result);
    } catch (error) {
      if (res.destroyed) return;
      const safeError = error instanceof AgentError && [400, 429, 499, 502, 503, 504].includes(error.status);
      if (safeError && Number.isInteger(error.retryAfter)) res.setHeader('Retry-After', String(error.retryAfter));
      return reply(res, safeError ? error.status : 503, {
        code: safeError ? error.code : 'agent_unavailable',
        error: safeError ? error.publicMessage : 'Não consegui conectar ao assistente agora. Tente novamente em alguns instantes.',
      });
    } finally {
      active--;
      res.removeListener?.('close', disconnect);
      req.removeListener?.('aborted', disconnect);
    }
  };
}
module.exports = createHandler();
module.exports.createHandler = createHandler;
module.exports.MAX_BODY_BYTES = MAX_BODY_BYTES;

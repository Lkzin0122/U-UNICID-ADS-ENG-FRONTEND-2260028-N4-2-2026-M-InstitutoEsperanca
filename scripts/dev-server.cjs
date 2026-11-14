/* Servidor local sem dependências; a publicação usa api/chat.js na Vercel. */
'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { pipeline } = require('node:stream');
const chat = require('../api/chat.js');
const root = path.resolve(__dirname, '..');
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.webm': 'video/webm',
  '.mp4': 'video/mp4',
  '.vtt': 'text/vtt; charset=utf-8',
};
const pages = new Set(fs.readdirSync(root).filter((name) => name.endsWith('.html')));
function sendError(res, status, message) {
  if (res.destroyed || res.writableEnded) return;
  if (res.headersSent) {
    res.destroy();
    return;
  }
  res.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(message);
}

async function readRequestBody(req) {
  let size = 0;
  const chunks = [];
  // Preserve a conexão para responder 413 quando o limite for excedido.
  for await (const chunk of req.iterator({ destroyOnReturn: false })) {
    size += chunk.length;
    if (size > chat.MAX_BODY_BYTES) {
      const error = new Error('Mensagem muito longa.');
      error.status = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

async function serveStatic(req, res, pathname) {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.setHeader('Allow', 'GET, HEAD');
    return sendError(res, 405, 'Método não permitido.');
  }
  const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
  const parts = relative.split('/');
  // Apenas recursos públicos podem ser servidos, inclusive no ambiente local.
  if (
    relative.includes('\\') ||
    parts.some((part) => part.startsWith('.') || !part) ||
    !(pages.has(relative) || ['css', 'js', 'img', 'assets'].includes(parts[0]))
  ) {
    return sendError(res, 404, 'Página não encontrada.');
  }
  const filename = path.resolve(root, relative);
  if (!filename.startsWith(root + path.sep)) return sendError(res, 404, 'Página não encontrada.');
  let stat;
  try {
    stat = await fs.promises.stat(filename);
  } catch (error) {
    if (['ENOENT', 'ENOTDIR'].includes(error.code))
      return sendError(res, 404, 'Página não encontrada.');
    throw error;
  }
  if (!stat.isFile()) return sendError(res, 404, 'Página não encontrada.');
  res.writeHead(200, {
    'Content-Type': mime[path.extname(filename)] || 'application/octet-stream',
    'Content-Length': stat.size,
    'X-Content-Type-Options': 'nosniff',
  });
  if (req.method === 'HEAD') return res.end();
  pipeline(fs.createReadStream(filename), res, (error) => {
    if (error && !['ERR_STREAM_PREMATURE_CLOSE', 'ECONNRESET'].includes(error.code)) {
      console.error('Falha ao servir um recurso público:', error.code || 'stream_error');
    }
  });
}

async function handleRequest(req, res) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    return sendError(res, 400, 'Endereço inválido.');
  }
  if (pathname === '/api/chat') {
    if (req.method !== 'POST') return chat(req, res);
    req.body = await readRequestBody(req);
    return chat(req, res);
  }
  return serveStatic(req, res, pathname);
}

const server = http.createServer((req, res) => {
  handleRequest(req, res).catch((error) => {
    if (req.aborted || res.destroyed) return;
    if (error.status === 413) {
      req.resume();
      return sendError(res, 413, 'Mensagem muito longa.');
    }
    console.error('Falha no servidor local:', error.code || 'request_error');
    sendError(res, 500, 'Não foi possível concluir a requisição.');
  });
});
server.listen(Number(process.env.PORT || 3000), '127.0.0.1', () =>
  console.log(`Instituto Esperança: http://127.0.0.1:${server.address().port}`),
);

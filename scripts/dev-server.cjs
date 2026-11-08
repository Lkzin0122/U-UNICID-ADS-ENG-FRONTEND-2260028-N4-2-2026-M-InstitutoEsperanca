/* Servidor local sem dependências; a publicação usa api/chat.js na Vercel. */
'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { pipeline } = require('node:stream');
const chat = require('../api/chat.js');
const root = path.resolve(__dirname, '..');
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.webm': 'video/webm', '.mp4': 'video/mp4', '.vtt': 'text/vtt; charset=utf-8' };
const pages = new Set(fs.readdirSync(root).filter(name => name.endsWith('.html')));
function error(res, status, message) { res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end(message); }
const server = http.createServer(async (req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { return error(res, 400, 'Endereço inválido.'); }
  if (pathname === '/api/chat') {
    if (req.method !== 'POST') return chat(req, res);
    let size = 0;
    const chunks = [];
    for await (const chunk of req) {
      size += chunk.length;
      if (size > chat.MAX_BODY_BYTES) return error(res, 413, 'Mensagem muito longa.');
      chunks.push(chunk);
    }
    req.body = Buffer.concat(chunks).toString('utf8');
    return chat(req, res);
  }
  if (!['GET', 'HEAD'].includes(req.method)) return error(res, 405, 'Método não permitido.');
  const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
  const parts = relative.split('/');
  // Servir apenas conteúdo público; nem .env, regras, API ou arquivos do editor.
  if (relative.includes('\\') || parts.some(part => part.startsWith('.') || !part) ||
      !(pages.has(relative) || ['css', 'js', 'img', 'assets'].includes(parts[0]))) return error(res, 404, 'Página não encontrada.');
  const filename = path.resolve(root, relative);
  if (!filename.startsWith(root + path.sep)) return error(res, 404, 'Página não encontrada.');
  let stat;
  try { stat = await fs.promises.stat(filename); }
  catch { return error(res, 404, 'Página não encontrada.'); }
  if (!stat.isFile()) return error(res, 404, 'Página não encontrada.');
  res.writeHead(200, { 'Content-Type': mime[path.extname(filename)] || 'application/octet-stream', 'Content-Length': stat.size, 'X-Content-Type-Options': 'nosniff' });
  if (req.method === 'HEAD') return res.end();
  pipeline(fs.createReadStream(filename), res, () => {});
});
server.listen(Number(process.env.PORT || 3000), '127.0.0.1', () => console.log(`Instituto Esperança: http://127.0.0.1:${server.address().port}`));

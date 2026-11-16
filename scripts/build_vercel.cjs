/* Publicação estática com API Node.js separada; nenhum segredo vai para public/. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { isPublicFile } = require('../server/public-files.cjs');
const root = path.resolve(__dirname, '..');
const output = path.resolve(root, 'public');
if (path.dirname(output) !== root || path.basename(output) !== 'public')
  throw new Error('Diretório de saída inválido.');
const index = JSON.parse(fs.readFileSync(path.join(root, 'data/knowledge-index.json'), 'utf8'));
if (index.schema_version !== 1 || !index.chunks?.length)
  throw new Error('Gere a base de conhecimento antes de publicar.');
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
const pages = fs.readdirSync(root).filter((name) => name.endsWith('.html'));
if (!pages.includes('index.html')) throw new Error('Página inicial ausente.');
for (const filename of pages) {
  if (!isPublicFile(filename) || fs.lstatSync(path.join(root, filename)).isSymbolicLink())
    throw new Error('Página pública inválida: ' + filename);
  fs.copyFileSync(path.join(root, filename), path.join(output, filename));
}
for (const folder of ['css', 'js', 'img', 'assets'])
  fs.cpSync(path.join(root, folder), path.join(output, folder), {
    recursive: true,
    filter(source) {
      const relative = path.relative(root, source).split(path.sep).join('/');
      const stat = fs.lstatSync(source);
      if (stat.isSymbolicLink() || relative.split('/').some((part) => part.startsWith('.')))
        throw new Error('Recurso público inválido: ' + relative);
      if (stat.isDirectory()) return true;
      if (!isPublicFile(relative)) throw new Error('Arquivo não publicável: ' + relative);
      return true;
    },
  });
console.log(
  `${pages.length} páginas preparadas em public/. A função api/chat.js será publicada pela Vercel.`,
);

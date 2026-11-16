'use strict';
const path = require('node:path');

// Lista comum ao build e ao servidor: pastas públicas não tornam qualquer arquivo público.
function isPublicFile(relative) {
  const parts = relative.split('/');
  if (parts.some((part) => !part || part.startsWith('.')) || relative.includes('\\')) return false;
  if (parts.length === 1) return path.posix.extname(relative) === '.html';
  if (!['css', 'js', 'img', 'assets'].includes(parts[0])) return false;
  if (
    relative.startsWith('assets/vendor/') &&
    /^(?:LICENSE(?:\.Apache)?|README\.md|PROVENANCE\.json)$/.test(parts.at(-1))
  )
    return true;
  return new Set([
    '.html',
    '.css',
    '.js',
    '.png',
    '.jpg',
    '.jpeg',
    '.svg',
    '.webp',
    '.mp3',
    '.wav',
    '.webm',
    '.mp4',
    '.vtt',
    '.wasm',
    '.data',
    '.woff',
    '.woff2',
  ]).has(path.posix.extname(relative));
}

module.exports = { isPublicFile };

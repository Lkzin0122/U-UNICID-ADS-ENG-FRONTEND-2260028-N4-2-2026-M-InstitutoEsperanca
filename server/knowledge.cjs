'use strict';
const fs = require('node:fs');
const path = require('node:path');

const STOP = new Set(
  'a ao aos as ate com como da das de do dos e ela ele em entre era essa esse esta este eu foi ha isso ja la mais mas me meu meus minha minhas muito na nas nao no nos nossa nosso o os ou para pela pelo por pq pra qual quais quando que quem quero se sem ser seu sua sobre so tem ter uma um umas uns voce voces'.split(
    ' ',
  ),
);
const SYNONYMS = [
  ['voluntario', 'voluntaria', 'voluntarios', 'voluntarias', 'voluntariado'],
  ['doar', 'doacao', 'doacoes', 'donativo', 'donativos'],
  ['pcd', 'deficiencia', 'deficiente', 'deficientes'],
  ['ambiental', 'ambiente', 'sustentabilidade', 'sustentavel'],
  ['educacao', 'educativo', 'educativa', 'educativas', 'educativos', 'aprendizagem'],
  ['crianca', 'criancas', 'infancia', 'infantil'],
  ['mae', 'maes', 'materno', 'materna'],
  ['contato', 'contacto', 'email', 'correio'],
  ['participar', 'participacao', 'colaborar', 'colaboracao', 'contribuir', 'contribuicao'],
  ['fundacao', 'fundado', 'fundada', 'historia'],
  ['resultado', 'resultados', 'impacto', 'indicadores'],
];
const CANONICAL = new Map(SYNONYMS.flatMap((group) => group.map((word) => [word, group[0]])));
function normalize(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/e-mail/g, 'email');
}
function tokens(text) {
  return (normalize(text).match(/[a-z0-9]+/g) || [])
    .filter((word) => word.length > 1 && !STOP.has(word))
    .map(
      (word) =>
        CANONICAL.get(word) ||
        (word.length > 5 && word.endsWith('s') && !word.endsWith('is') ? word.slice(0, -1) : word),
    );
}

function createKnowledgeStore(index) {
  if (!index)
    index = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../data/knowledge-index.json'), 'utf8'),
    );
  if (
    index.schema_version !== 1 ||
    typeof index.version !== 'string' ||
    !Array.isArray(index.sources) ||
    !Array.isArray(index.chunks)
  )
    throw new Error('Índice de conhecimento inválido.');
  const ids = new Set();
  const sources = index.sources.map((source) => Object.freeze({ ...source }));
  const sourceIds = new Set(sources.map((source) => source.id));
  const chunks = index.chunks.map((chunk) => {
    if (
      !chunk ||
      typeof chunk.id !== 'string' ||
      ids.has(chunk.id) ||
      typeof chunk.title !== 'string' ||
      typeof chunk.text !== 'string' ||
      !sourceIds.has(chunk.source_id)
    )
      throw new Error('Trecho inválido na base de conhecimento.');
    ids.add(chunk.id);
    return Object.freeze({ ...chunk });
  });
  const lookup = new Map(chunks.map((chunk) => [chunk.id, chunk]));
  const documents = chunks.map((chunk) => {
    const body = tokens(chunk.text),
      title = tokens(chunk.title);
    const frequency = new Map();
    for (const word of body) frequency.set(word, (frequency.get(word) || 0) + 1);
    const titleWords = new Set(title);
    return {
      chunk,
      frequency,
      titleWords,
      length: body.length || 1,
      words: new Set([...body, ...title]),
    };
  });
  const averageLength =
    documents.reduce((sum, doc) => sum + doc.length, 0) / Math.max(documents.length, 1);
  const documentFrequency = new Map();
  for (const doc of documents)
    for (const word of doc.words)
      documentFrequency.set(word, (documentFrequency.get(word) || 0) + 1);

  function search(query, { limit = 6 } = {}) {
    if (typeof query !== 'string') return [];
    const terms = [...new Set(tokens(query.slice(0, 1000)))];
    if (!terms.length) return [];
    const maximum = Math.max(1, Math.min(12, Number.isFinite(limit) ? Math.floor(limit) : 6));
    return documents
      .map((doc) => {
        let score = 0,
          matches = 0;
        for (const term of terms) {
          const count = doc.frequency.get(term) || 0;
          const inTitle = doc.titleWords.has(term);
          if (!count && !inTitle) continue;
          matches++;
          const df = documentFrequency.get(term) || 0;
          const idf = Math.log(1 + (documents.length - df + 0.5) / (df + 0.5));
          const weightedFrequency = count + (inTitle ? 1.4 : 0);
          score +=
            (idf * weightedFrequency * 2.2) /
            (weightedFrequency + 1.2 * (0.25 + (0.75 * doc.length) / averageLength));
        }
        // Favorece passagens que realmente cobrem os termos da pergunta.
        score *= 0.6 + (0.4 * matches) / terms.length;
        return { ...doc.chunk, score: Math.round(score * 10000) / 10000 };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
      .slice(0, maximum);
  }
  return Object.freeze({
    version: index.version,
    sources: Object.freeze(sources),
    stats: Object.freeze({ documents: sources.length, chunks: chunks.length }),
    search,
    getChunk: (id) => lookup.get(id) || null,
  });
}
let singleton;
function getKnowledgeStore() {
  return (singleton ||= createKnowledgeStore());
}
module.exports = { createKnowledgeStore, getKnowledgeStore };

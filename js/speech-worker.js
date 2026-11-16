/* Síntese isolada: versão atualizada do eSpeak, com entrada e áudio limitados. */
import createEngine from '../assets/vendor/espeak-ng/espeak-ng.js';

const voices = new Set(
  ['pt-br', 'en-us', 'es-419', 'fr', 'de', 'cmn', 'ru', 'ja', 'hi'].flatMap((voice) => [
    voice + '+f3',
    voice + '+m3',
  ]),
);
let ready;
let busy = false;

function wav(chunks, size, sampleRate) {
  const buffer = new ArrayBuffer(44 + size * 2);
  const view = new DataView(buffer);
  const label = (offset, text) => {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
  };
  label(0, 'RIFF');
  view.setUint32(4, 36 + size * 2, true);
  label(8, 'WAVE');
  label(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  label(36, 'data');
  view.setUint32(40, size * 2, true);
  let offset = 44;
  for (const chunk of chunks)
    for (const sample of chunk) {
      view.setInt16(offset, sample, true);
      offset += 2;
    }
  return buffer;
}

self.onmessage = async ({ data }) => {
  if (!data || !Number.isSafeInteger(data.id)) return;
  if (
    busy ||
    (data.list !== true &&
      (typeof data.text !== 'string' ||
        !data.text.trim() ||
        data.text.length > 6000 ||
        !voices.has(data.voice) ||
        !Number.isFinite(data.rate) ||
        data.rate < 0.1 ||
        data.rate > 3))
  ) {
    self.postMessage({ id: data.id, error: 'invalid_speech_request' });
    return;
  }
  busy = true;
  try {
    ready ||= createEngine({ print: () => {}, printErr: () => {} })
      .then((engine) => new engine.eSpeakNGWorker())
      .catch((error) => {
        ready = null;
        throw error;
      });
    const engine = await ready;
    if (data.list === true) {
      const names = engine
        .list_voices()
        .flatMap((voice) => voice.languages.map((lang) => lang.name));
      self.postMessage({ id: data.id, voices: names.join('\n') });
      return;
    }
    if (engine.set_voice(data.voice, '', 0, 0, 0) !== 0) throw new Error('invalid_voice');
    engine.set_rate(Math.round(175 * data.rate));
    const sampleRate = engine.get_samplerate();
    const chunks = [];
    let size = 0;
    let overflow = false;
    // O site lê texto simples: comandos de controle do sintetizador não são necessários.
    const text = data.text.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, ' ');
    engine.synthesize(text, (samples) => {
      size += samples.length;
      if (size > sampleRate * 120) {
        overflow = true;
        return true;
      }
      chunks.push(samples);
      return false;
    });
    if (overflow || !size) throw new Error('invalid_audio');
    const buffer = wav(chunks, size, sampleRate);
    self.postMessage({ id: data.id, wav: buffer }, [buffer]);
  } catch {
    self.postMessage({ id: data.id, error: 'synthesis-failed' });
  } finally {
    busy = false;
  }
};

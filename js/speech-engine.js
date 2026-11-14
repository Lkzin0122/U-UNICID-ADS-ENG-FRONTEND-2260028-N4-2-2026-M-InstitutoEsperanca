/* Native voices plus ready-to-use local eSpeak NG voices. No text leaves the site. */
(() => {
  'use strict';
  const native = window.speechSynthesis;
  const tags = {
    'pt-BR': ['pt-br', 'pt-BR'],
    en: ['en-us', 'en-US'],
    'es-419': ['es-419', 'es-MX'],
    fr: ['fr-fr', 'fr-FR'],
    de: ['de', 'de-DE'],
    'zh-CN': ['cmn', 'zh-CN'],
    ru: ['ru', 'ru-RU'],
    ja: ['ja', 'ja-JP'],
    hi: ['hi', 'hi-IN'],
  };
  const available = Boolean(
    window.Worker && window.WebAssembly && (window.AudioContext || window.webkitAudioContext),
  );
  const voices = available
    ? Object.entries(tags).flatMap(([language, [voice, lang]]) =>
        ['female', 'male'].map((gender) => ({
          name: `eSpeak NG (${gender})`,
          lang,
          voiceURI: `site:${language}:${gender}`,
          localService: true,
          default: false,
          bundled: true,
          gender,
          engineVoice: voice + (gender === 'female' ? '+f3' : '+m3'),
        })),
      )
    : [];
  let worker,
    context,
    source,
    sequence = 0,
    active = null;
  function finishError(error = 'synthesis-failed') {
    const utterance = active;
    active = null;
    utterance?.onerror?.({ error });
  }
  function cancel() {
    const synthesizing = Boolean(active && !source);
    sequence++;
    active = null;
    if (source) {
      source.onended = null;
      try {
        source.stop();
      } catch {}
      source = null;
    }
    // Discard synthesis work when the pointer moves; a stalled worker cannot
    // keep old private text or an unbounded queue alive.
    if (synthesizing) {
      worker?.terminate();
      worker = null;
    }
    try {
      native?.cancel();
    } catch {}
  }
  function speak(utterance) {
    if (!utterance.voice?.bundled) {
      native.speak(utterance);
      return;
    }
    const id = ++sequence;
    active = utterance;
    try {
      context ||= new (window.AudioContext || window.webkitAudioContext)();
      const unlocked = context.resume();
      unlocked.catch(() => {});
      worker ||= new Worker(
        new URL(
          'speech-worker.js',
          document.currentScript?.src || new URL('js/speech-engine.js', document.baseURI),
        ),
        { type: 'module' },
      );
      worker.onerror = () => finishError();
      worker.onmessage = async ({ data }) => {
        if (data.id !== sequence || active !== utterance) return;
        if (data.error) {
          finishError();
          return;
        }
        try {
          await unlocked;
          if (context.state !== 'running') {
            finishError('not-allowed');
            return;
          }
          const buffer = await context.decodeAudioData(data.wav);
          if (id !== sequence || active !== utterance) return;
          source = context.createBufferSource();
          source.buffer = buffer;
          source.connect(context.destination);
          source.onended = () => {
            if (id === sequence && active === utterance) {
              active = null;
              source = null;
              utterance.onend?.();
            }
          };
          source.start();
          utterance.onstart?.();
        } catch {
          if (id === sequence) finishError();
        }
      };
      worker.postMessage({
        id,
        text: utterance.text,
        voice: utterance.voice.engineVoice,
        rate: utterance.rate || 1,
      });
    } catch {
      finishError();
    }
  }
  window.esperancaSpeechEngine =
    native || available
      ? {
          getVoices() {
            let installed = [];
            try {
              installed = Array.from(native?.getVoices() || []);
            } catch {}
            return [...installed, ...voices];
          },
          speak,
          cancel,
          get paused() {
            return native?.paused || false;
          },
          resume() {
            native?.resume();
          },
          addEventListener(type, callback) {
            if (typeof native?.addEventListener === 'function')
              native.addEventListener(type, callback);
            else if (native) native.onvoiceschanged = callback;
          },
        }
      : null;
})();

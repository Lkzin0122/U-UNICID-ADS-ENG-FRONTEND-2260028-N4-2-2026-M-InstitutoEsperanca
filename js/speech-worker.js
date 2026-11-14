/* eSpeak NG runs outside the UI thread. Files and voice data are hosted locally. */
import createEngine from '../assets/vendor/espeak-ng/espeak-ng.js';
let binary;
let queue = Promise.resolve();
self.onmessage = ({ data }) => {
  queue = queue
    .catch(() => {})
    .then(async () => {
      try {
        binary ||= fetch(new URL('../assets/vendor/espeak-ng/espeak-ng.wasm', import.meta.url))
          .then((response) => {
            if (!response.ok) throw new Error('voice_download_failed');
            return response.arrayBuffer();
          })
          .catch((error) => {
            binary = null;
            throw error;
          });
        const output = [];
        const args = data.list
          ? ['--voices']
          : [
              '-v',
              data.voice,
              '-s',
              String(Math.round(175 * data.rate)),
              '-w',
              '/speech.wav',
              '--',
              data.text,
            ];
        const engine = await createEngine({
          wasmBinary: await binary,
          arguments: args,
          print: (line) => output.push(line),
          printErr: (line) => output.push(line),
        });
        if (data.list) {
          self.postMessage({ id: data.id, voices: output.join('\n') });
          return;
        }
        const wav = engine.FS.readFile('/speech.wav');
        const bytes = wav.buffer.slice(wav.byteOffset, wav.byteOffset + wav.byteLength);
        self.postMessage({ id: data.id, wav: bytes }, [bytes]);
      } catch {
        self.postMessage({ id: data.id, error: 'synthesis-failed' });
      }
    });
};

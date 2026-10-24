"""Gera uma trilha instrumental original, sem amostras ou dependências externas."""
from pathlib import Path
import math
import struct
import wave

ROOT = Path(__file__).resolve().parent.parent
RATE = 22050
DURATION = 16
CHORDS = [(261.63, 329.63, 392.00), (220.00, 261.63, 329.63),
          (174.61, 220.00, 261.63), (196.00, 246.94, 293.66)]


def create_audio():
    frames = bytearray()
    for sample in range(RATE * DURATION):
        time = sample / RATE
        sound = 0.0
        for chord_index, chord in enumerate(CHORDS):
            elapsed = time - chord_index * 4
            if 0 <= elapsed < 5.5:
                for note_index, frequency in enumerate(chord):
                    note_time = elapsed - note_index * 0.38
                    if note_time >= 0:
                        attack = min(1, note_time / 0.04)
                        decay = math.exp(-note_time / 1.5)
                        fundamental = math.sin(2 * math.pi * frequency * note_time)
                        harmonic = 0.2 * math.sin(4 * math.pi * frequency * note_time)
                        sound += 0.12 * attack * decay * (fundamental + harmonic)
        fade = min(1, time / 0.2, (DURATION - time) / 1.8)
        frames.extend(struct.pack('<h', int(max(-1, min(1, sound * fade)) * 32767)))
    output = ROOT / 'assets' / 'pausa-para-acolher.wav'
    output.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(output), 'wb') as audio:
        audio.setnchannels(1)
        audio.setsampwidth(2)
        audio.setframerate(RATE)
        audio.writeframes(frames)
    print(f'{output.name}: {DURATION}s, {output.stat().st_size} bytes')


if __name__ == '__main__':
    create_audio()

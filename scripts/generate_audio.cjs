const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sampleRate = 44100;
const duration = 24; // 24 seconds seamless loop

function generateWav(filename, chordProgression, toneStyle) {
  const numSamples = sampleRate * duration;
  const numChannels = 2;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;

  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // Bits per sample
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  const chordDuration = duration / chordProgression.length;

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const chordIndex = Math.floor(t / chordDuration) % chordProgression.length;
    const chord = chordProgression[chordIndex];
    const chordT = t % chordDuration;

    // Soft envelope with gentle attack & decay
    const envelope = Math.sin((chordT / chordDuration) * Math.PI) * 0.7 + 0.3;
    const loopEnvelope = Math.sin((t / duration) * Math.PI); // seamless edge fade

    let sampleL = 0;
    let sampleR = 0;

    chord.forEach((freq, fIdx) => {
      // Warm fundamental + soft harmonic
      const pan = (fIdx % 2 === 0) ? 0.7 : 0.3;
      let wave = Math.sin(2 * Math.PI * freq * t);
      
      if (toneStyle === 'piano') {
        // Piano-like decay & warmth
        const strikeEnv = Math.exp(-chordT * 1.2);
        wave = (Math.sin(2 * Math.PI * freq * t) + 0.35 * Math.sin(4 * Math.PI * freq * t)) * strikeEnv;
      } else if (toneStyle === 'acoustic') {
        // Acoustic guitar resonance
        wave = (Math.sin(2 * Math.PI * freq * t) + 0.25 * Math.sin(2 * Math.PI * freq * 2 * t) + 0.1 * Math.sin(2 * Math.PI * freq * 3 * t));
      } else if (toneStyle === 'ambient') {
        // Slow lush atmospheric pad
        const lfo = 1 + 0.15 * Math.sin(2 * Math.PI * 0.25 * t + fIdx);
        wave = Math.sin(2 * Math.PI * freq * t) * lfo;
      }

      sampleL += wave * (1 - pan);
      sampleR += wave * pan;
    });

    sampleL = sampleL * 0.15 * envelope * loopEnvelope;
    sampleR = sampleR * 0.15 * envelope * loopEnvelope;

    // Soft clamp
    sampleL = Math.max(-1, Math.min(1, sampleL));
    sampleR = Math.max(-1, Math.min(1, sampleR));

    const intSampleL = Math.floor(sampleL * 32767);
    const intSampleR = Math.floor(sampleR * 32767);

    const offset = 44 + i * 4;
    buffer.writeInt16LE(intSampleL, offset);
    buffer.writeInt16LE(intSampleR, offset + 2);
  }

  const tempWav = path.join(__dirname, 'temp.wav');
  fs.writeFileSync(tempWav, buffer);

  // Convert to high-quality lightweight mp3 using ffmpeg
  execSync(`ffmpeg -y -i "${tempWav}" -codec:a libmp3lame -b:a 96k "${filename}"`, { stdio: 'ignore' });
  try { fs.unlinkSync(tempWav); } catch (e) {}
  console.log(`Generated: ${filename}`);
}

const outDir = path.resolve(__dirname, '../public/audio');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 1. Peace Like a River (Gentle D Major Acoustic, 72 bpm feel)
// D -> G -> Bm -> A
generateWav(
  path.join(outDir, 'peace-like-a-river.mp3'),
  [
    [146.83, 220.00, 293.66, 369.99], // D, A, D4, F#4
    [196.00, 246.94, 293.66, 392.00], // G, B, D4, G4
    [123.47, 185.00, 246.94, 293.66], // Bm, F#, B, D4
    [220.00, 277.18, 329.63, 440.00], // A, C#, E4, A4
  ],
  'acoustic'
);

// 2. Morning Light (Warm Piano in E Major)
// E -> C#m -> A -> B
generateWav(
  path.join(outDir, 'morning-light.mp3'),
  [
    [164.81, 246.94, 329.63, 415.30], // E, B, E4, G#4
    [138.59, 207.65, 277.18, 329.63], // C#m, G#, C#4, E4
    [220.00, 277.18, 329.63, 440.00], // A, C#, E4, A4
    [123.47, 185.00, 246.94, 369.99], // B, F#, B, F#4
  ],
  'piano'
);

// 3. Hearthside Fireside (Warm cozy acoustic hearth tone)
// C -> G -> Am -> F
generateWav(
  path.join(outDir, 'hearthside-fireside.mp3'),
  [
    [130.81, 196.00, 261.63, 329.63], // C, G, C4, E4
    [196.00, 246.94, 293.66, 392.00], // G, B, D4, G4
    [110.00, 164.81, 220.00, 261.63], // Am, E, A, C4
    [174.61, 220.00, 261.63, 349.23], // F, A, C4, F4
  ],
  'acoustic'
);

// 4. Mountain Whispers (Peaceful ambient reflective melody)
generateWav(
  path.join(outDir, 'mountain-whispers.mp3'),
  [
    [146.83, 220.00, 329.63, 440.00], // Dsus2
    [174.61, 220.00, 261.63, 392.00], // Fadd9
    [130.81, 196.00, 261.63, 329.63], // Cadd9
    [196.00, 246.94, 293.66, 369.99], // G
  ],
  'ambient'
);

/**
 * Writes minimal valid PNG and WAV files under `uploads/` for seeded assessment + Mahara paths.
 * Run via `npm run ensure:assets` or automatically at the start of `prisma/seed.js`.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** 1×1 PNG (transparent) — reused for every image path */
const MINIMAL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

function createSilentWav(durationSeconds = 0.4) {
  const sampleRate = 8000;
  const numChannels = 1;
  const bitsPerSample = 16;
  const blockAlign = numChannels * (bitsPerSample / 8);
  const byteRate = sampleRate * blockAlign;
  const numSamples = Math.floor(sampleRate * durationSeconds);
  const dataSize = numSamples * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  return buffer;
}

export const ASSESSMENT_ASSET_RELATIVE_PATHS = [
  // Analogy
  ...[1, 2, 3].flatMap((q) => [
    `assets/images/analogy/q${q}-stem.png`,
    ...[0, 1, 2, 3].map((c) => `assets/images/analogy/q${q}-choice-${c}.png`)
  ]),
  // Visual memory
  'assets/images/visual-memory/scene-1.png',
  'assets/images/visual-memory/scene-2.png',
  // Image sequence order
  'assets/images/sequence-order/routine-1.png',
  'assets/images/sequence-order/routine-2.png',
  'assets/images/sequence-order/routine-3.png',
  'assets/images/sequence-order/plant-1.png',
  'assets/images/sequence-order/plant-2.png',
  'assets/images/sequence-order/plant-3.png',
  'assets/images/sequence-order/plant-4.png',
  // Mahara — images
  'assets/mahara/animals/cat.png',
  'assets/mahara/animals/dog.png',
  'assets/mahara/animals/bird.png',
  'assets/mahara/animals/horse.png',
  'assets/mahara/objects/apple.png',
  'assets/mahara/objects/car.png',
  'assets/mahara/objects/ball.png',
  'assets/mahara/routine/wake-up.png',
  'assets/mahara/routine/brush.png',
  'assets/mahara/routine/breakfast.png',
  'assets/mahara/association/red.png',
  'assets/mahara/association/blue.png',
  // Auditory memory (WAV)
  'assets/audio/memory/sequence-1.wav',
  'assets/audio/memory/sequence-2.wav',
  'assets/audio/memory/sequence-3.wav',
  // Mahara — audio (WAV; HTML5 + Flutter accept WAV)
  'assets/mahara/animals/cat.wav',
  'assets/mahara/animals/horse.wav',
  'assets/mahara/objects/apple.wav',
  'assets/mahara/objects/car.wav',
  'assets/mahara/objects/ball.wav',
  'assets/mahara/association/red.wav',
  'assets/mahara/association/blue.wav',
  // Messages seed (stored under uploads root)
  'messages/progress-update-voice.wav'
];

export async function ensureAssessmentAssets({ rootDir } = {}) {
  const uploadRoot = rootDir ?? path.join(__dirname, '../uploads');
  const wavBuffer = createSilentWav();

  for (const rel of ASSESSMENT_ASSET_RELATIVE_PATHS) {
    const full = path.join(uploadRoot, rel);
    await fs.promises.mkdir(path.dirname(full), { recursive: true });
    const isPng = rel.endsWith('.png');
    const buf = isPng ? MINIMAL_PNG : wavBuffer;
    await fs.promises.writeFile(full, buf);
  }
}

const isMainCli = path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] ?? '');
if (isMainCli) {
  ensureAssessmentAssets()
    .then(() => {
      console.log(`Wrote ${ASSESSMENT_ASSET_RELATIVE_PATHS.length} assessment asset files under uploads/`);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

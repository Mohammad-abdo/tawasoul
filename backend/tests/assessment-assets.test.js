import fs from 'fs';
import os from 'os';
import path from 'path';

describe('ensureAssessmentAssets', () => {
  it('writes every seeded asset path as PNG or WAV', async () => {
    const { ensureAssessmentAssets, ASSESSMENT_ASSET_RELATIVE_PATHS } = await import('../prisma/ensure-assessment-assets.js');
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tawasol-assets-'));
    await ensureAssessmentAssets({ rootDir: tmp });

    expect(ASSESSMENT_ASSET_RELATIVE_PATHS.length).toBeGreaterThan(0);

    for (const rel of ASSESSMENT_ASSET_RELATIVE_PATHS) {
      const full = path.join(tmp, rel);
      expect(fs.existsSync(full)).toBe(true);
      const buf = fs.readFileSync(full);
      expect(buf.length).toBeGreaterThan(0);
      if (rel.endsWith('.png')) {
        expect(buf.subarray(0, 4).toString('binary')).toBe('\x89PNG');
      } else if (rel.endsWith('.wav')) {
        expect(buf.subarray(0, 4).toString('utf8')).toBe('RIFF');
        expect(buf.subarray(8, 12).toString('utf8')).toBe('WAVE');
      }
    }
  });
});

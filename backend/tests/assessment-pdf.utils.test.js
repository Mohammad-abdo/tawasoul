import { Writable } from 'stream';
import { streamAssessmentSessionPdf } from '../src/utils/assessment-pdf.utils.js';

class MemoryResponse extends Writable {
  constructor() {
    super();
    this.chunks = [];
    this.headers = {};
  }

  _write(chunk, encoding, callback) {
    this.chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
    callback();
  }

  setHeader(name, value) {
    this.headers[String(name).toLowerCase()] = value;
  }

  get buffer() {
    return Buffer.concat(this.chunks);
  }
}

describe('streamAssessmentSessionPdf', () => {
  test('should stream a non-empty PDF', async () => {
    const res = new MemoryResponse();
    const child = { id: 'child-1', name: 'Test Child', age: 5, gender: 'MALE', status: 'OTHER' };
    const sessionId = 'session-1';
    const results = [
      {
        id: 'r1',
        childId: child.id,
        sessionId,
        testType: 'CARS',
        totalScore: 10,
        maxScore: 60,
        scoreGiven: 10,
        timestamp: new Date().toISOString(),
        test: { title: 'CARS', titleAr: null, testType: 'CARS' },
        qCarsAnswers: []
      }
    ];

    await new Promise((resolve, reject) => {
      res.on('finish', resolve);
      res.on('error', reject);

      streamAssessmentSessionPdf({
        res,
        child,
        sessionId,
        results,
        requestedBy: 'user:user-1'
      }).catch(reject);
    });

    expect(res.headers['content-type']).toBe('application/pdf');
    expect(res.buffer.length).toBeGreaterThan(200);
    expect(res.buffer.slice(0, 4).toString('utf8')).toBe('%PDF');
  }, 15000);
});


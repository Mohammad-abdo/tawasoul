import { jest } from '@jest/globals';
import { buildAssessmentSubmission, serializeAssessmentQuestion } from '../src/utils/assessment.utils.js';

describe('assessment utils', () => {
  it('serializes image sequence order questions with sorted public image paths', () => {
    process.env.BASE_URL = 'http://api.test';

    const serialized = serializeAssessmentQuestion({
      req: {
        protocol: 'http',
        get: () => 'api.test'
      },
      testType: 'IMAGE_SEQUENCE_ORDER',
      question: {
        id: 'question-1',
        testId: 'test-1',
        order: 2,
        images: [
          { id: 'image-2', questionId: 'question-1', assetPath: 'uploads/sequence/second.png', position: 2 },
          { id: 'image-1', questionId: 'question-1', assetPath: 'sequence/first.png', position: 1 }
        ]
      }
    });

    expect(serialized).toEqual({
      id: 'question-1',
      testId: 'test-1',
      order: 2,
      images: [
        {
          id: 'image-1',
          questionId: 'question-1',
          assetPath: 'http://api.test/uploads/sequence/first.png',
          position: 1
        },
        {
          id: 'image-2',
          questionId: 'question-1',
          assetPath: 'http://api.test/uploads/sequence/second.png',
          position: 2
        }
      ]
    });
  });

  it('builds image sequence order scoring operations with per-image partial credit', async () => {
    const prisma = {
      q_SequenceOrder: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'question-1',
            testId: 'test-1',
            order: 1,
            images: [
              { id: 'image-1', position: 1 },
              { id: 'image-2', position: 2 },
              { id: 'image-3', position: 3 }
            ]
          }
        ])
      },
      q_SequenceOrder_Answer: {
        create: jest.fn(({ data }) => data)
      }
    };

    const submission = await buildAssessmentSubmission({
      prisma,
      test: {
        id: 'test-1',
        testType: 'IMAGE_SEQUENCE_ORDER'
      },
      resultId: 'result-1',
      answers: [
        {
          questionId: 'question-1',
          submittedOrder: [
            { imageId: 'image-1', submittedPosition: 1 },
            { imageId: 'image-2', submittedPosition: 3 },
            { imageId: 'image-3', submittedPosition: 2 }
          ]
        }
      ]
    });

    expect(submission.totalScore).toBe(1);
    expect(submission.maxScore).toBe(3);
    expect(submission.operations).toHaveLength(1);
    expect(prisma.q_SequenceOrder.findMany).toHaveBeenCalledWith({
      where: { testId: 'test-1' },
      include: {
        images: {
          orderBy: [{ position: 'asc' }, { id: 'asc' }]
        }
      }
    });
    expect(prisma.q_SequenceOrder_Answer.create).toHaveBeenCalledWith({
      data: {
        resultId: 'result-1',
        questionId: 'question-1',
        submittedOrder: [
          { imageId: 'image-1', submittedPosition: 1 },
          { imageId: 'image-2', submittedPosition: 3 },
          { imageId: 'image-3', submittedPosition: 2 }
        ],
        itemScores: [
          { imageId: 'image-1', correctPosition: 1, submittedPosition: 1, score: 1 },
          { imageId: 'image-2', correctPosition: 2, submittedPosition: 3, score: 0 },
          { imageId: 'image-3', correctPosition: 3, submittedPosition: 2, score: 0 }
        ],
        score: 1
      }
    });
  });
});

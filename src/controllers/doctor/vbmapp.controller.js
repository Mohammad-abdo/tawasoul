import { validationResult } from 'express-validator';
import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';
import { createHttpError } from '../../utils/httpError.js';

const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return false;
  res.status(400).json({
    success: false,
    error: { code: 'VALIDATION_ERROR', message: errors.array()[0].msg }
  });
  return true;
};

const handleKnownError = (res, error) => {
  if (!error.status) return false;
  res.status(error.status).json({
    success: false,
    error: { code: error.code, message: error.message }
  });
  return true;
};

const ensureDoctorCanAccessChild = async (prisma, doctorId, childId) => {
  const access = await prisma.booking.findFirst({
    where: { childId, doctorId }
  });
  if (!access) {
    throw createHttpError(403, 'FORBIDDEN', 'You do not have access to this child');
  }
};

export const getVbMappSkillAreas = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const areas = await prisma.vbMappSkillArea.findMany({
      orderBy: [{ level: 'asc' }, { order: 'asc' }],
      include: {
        milestones: {
          orderBy: [{ level: 'asc' }, { order: 'asc' }],
          include: {
            taskSteps: {
              orderBy: [{ order: 'asc' }]
            }
          }
        }
      }
    });

    res.json({ success: true, data: areas });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Get VB-MAPP skill areas error:', error);
    next(error);
  }
};

export const getVbMappBarriers = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const barriers = await prisma.vbMappBarrier.findMany({
      orderBy: [{ order: 'asc' }]
    });

    res.json({ success: true, data: barriers });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Get VB-MAPP barriers error:', error);
    next(error);
  }
};

export const getVbMappTransitionCriteria = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const criteria = await prisma.vbMappTransitionCriteria.findMany({
      orderBy: [{ order: 'asc' }]
    });

    res.json({ success: true, data: criteria });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Get VB-MAPP transition criteria error:', error);
    next(error);
  }
};

export const getVbMappEesaGroups = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const groups = await prisma.vbMappEesaGroup.findMany({
      orderBy: [{ order: 'asc' }],
      include: {
        items: {
          orderBy: [{ order: 'asc' }]
        }
      }
    });

    res.json({ success: true, data: groups });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Get VB-MAPP EESA groups error:', error);
    next(error);
  }
};

export const createVbMappSession = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { childId, sessionNumber, assessmentDate, colorCode, notes, bookingId } = req.body;

    await ensureDoctorCanAccessChild(prisma, req.doctor.id, childId);

    const existing = await prisma.vbMappSession.findFirst({
      where: { childId, sessionNumber }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: { code: 'SESSION_EXISTS', message: `A ${sessionNumber} session already exists for this child` }
      });
    }

    const session = await prisma.vbMappSession.create({
      data: {
        childId,
        evaluatorId: req.doctor.id,
        sessionNumber,
        assessmentDate: new Date(assessmentDate),
        colorCode,
        notes,
        bookingId
      }
    });

    res.status(201).json({ success: true, data: session });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Create VB-MAPP session error:', error);
    next(error);
  }
};

export const getVbMappSession = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const session = await prisma.vbMappSession.findUnique({
      where: { id: req.params.sessionId },
      include: {
        child: { select: { id: true, name: true, age: true } },
        milestoneScores: { include: { milestone: true } },
        taskStepScores: { include: { step: true } },
        barrierScores: { include: { barrier: true } },
        transitionScores: { include: { criteria: true } },
        eesaScores: { include: { item: true } },
        iepGoals: { include: { milestone: true } }
      }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: { code: 'SESSION_NOT_FOUND', message: 'VB-MAPP session not found' }
      });
    }

    if (session.evaluatorId !== req.doctor.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not have access to this session' }
      });
    }

    res.json({ success: true, data: session });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Get VB-MAPP session error:', error);
    next(error);
  }
};

export const getChildVbMappSessions = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    await ensureDoctorCanAccessChild(prisma, req.doctor.id, req.params.childId);

    const sessions = await prisma.vbMappSession.findMany({
      where: { childId: req.params.childId },
      orderBy: [{ assessmentDate: 'desc' }, { sessionNumber: 'desc' }]
    });

    res.json({ success: true, data: sessions });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Get child VB-MAPP sessions error:', error);
    next(error);
  }
};

export const updateVbMappSession = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { assessmentDate, colorCode, notes } = req.body;
    const { sessionId } = req.params;

    const existing = await prisma.vbMappSession.findUnique({
      where: { id: sessionId }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'SESSION_NOT_FOUND', message: 'VB-MAPP session not found' }
      });
    }

    if (existing.evaluatorId !== req.doctor.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not have access to this session' }
      });
    }

    const session = await prisma.vbMappSession.update({
      where: { id: sessionId },
      data: {
        ...(assessmentDate && { assessmentDate: new Date(assessmentDate) }),
        colorCode,
        notes
      }
    });

    res.json({ success: true, data: session });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Update VB-MAPP session error:', error);
    next(error);
  }
};

export const submitMilestoneScores = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { sessionId } = req.params;
    const { scores } = req.body;

    const session = await prisma.vbMappSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: { code: 'SESSION_NOT_FOUND', message: 'VB-MAPP session not found' }
      });
    }

    if (session.evaluatorId !== req.doctor.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not have access to this session' }
      });
    }

    await prisma.$transaction(async (tx) => {
      for (const scoreData of scores) {
        await tx.vbMappMilestoneScore.upsert({
          where: { sessionId_milestoneId: { sessionId, milestoneId: scoreData.milestoneId } },
          update: { score: scoreData.score, notes: scoreData.notes || null },
          create: { sessionId, milestoneId: scoreData.milestoneId, score: scoreData.score, notes: scoreData.notes || null }
        });
      }
    });

    res.json({ success: true, message: 'Milestone scores saved' });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Submit milestone scores error:', error);
    next(error);
  }
};

export const submitTaskStepScores = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { sessionId } = req.params;
    const { scores } = req.body;

    const session = await prisma.vbMappSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: { code: 'SESSION_NOT_FOUND', message: 'VB-MAPP session not found' }
      });
    }

    if (session.evaluatorId !== req.doctor.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not have access to this session' }
      });
    }

    await prisma.$transaction(async (tx) => {
      for (const scoreData of scores) {
        await tx.vbMappTaskStepScore.upsert({
          where: { sessionId_stepId: { sessionId, stepId: scoreData.stepId } },
          update: { isAchieved: scoreData.isAchieved, achievedAt: scoreData.isAchieved ? new Date() : null, notes: scoreData.notes || null },
          create: { sessionId, stepId: scoreData.stepId, isAchieved: scoreData.isAchieved || false, achievedAt: scoreData.isAchieved ? new Date() : null, notes: scoreData.notes || null }
        });
      }
    });

    res.json({ success: true, message: 'Task step scores saved' });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Submit task step scores error:', error);
    next(error);
  }
};

export const submitBarrierScores = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { sessionId } = req.params;
    const { scores } = req.body;

    const session = await prisma.vbMappSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: { code: 'SESSION_NOT_FOUND', message: 'VB-MAPP session not found' }
      });
    }

    if (session.evaluatorId !== req.doctor.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not have access to this session' }
      });
    }

    await prisma.$transaction(async (tx) => {
      for (const scoreData of scores) {
        await tx.vbMappBarrierScores.upsert({
          where: { sessionId_barrierId: { sessionId, barrierId: scoreData.barrierId } },
          update: { score: scoreData.score },
          create: { sessionId, barrierId: scoreData.barrierId, score: scoreData.score }
        });
      }
    });

    res.json({ success: true, message: 'Barrier scores saved' });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Submit barrier scores error:', error);
    next(error);
  }
};

export const submitTransitionScores = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { sessionId } = req.params;
    const { scores } = req.body;

    const session = await prisma.vbMappSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: { code: 'SESSION_NOT_FOUND', message: 'VB-MAPP session not found' }
      });
    }

    if (session.evaluatorId !== req.doctor.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not have access to this session' }
      });
    }

    await prisma.$transaction(async (tx) => {
      for (const scoreData of scores) {
        await tx.vbMappTransitionScores.upsert({
          where: { sessionId_criteriaId: { sessionId, criteriaId: scoreData.criteriaId } },
          update: { score: scoreData.score },
          create: { sessionId, criteriaId: scoreData.criteriaId, score: scoreData.score }
        });
      }
    });

    res.json({ success: true, message: 'Transition scores saved' });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Submit transition scores error:', error);
    next(error);
  }
};

export const submitEesaScores = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { sessionId } = req.params;
    const { scores } = req.body;

    const session = await prisma.vbMappSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: { code: 'SESSION_NOT_FOUND', message: 'VB-MAPP session not found' }
      });
    }

    if (session.evaluatorId !== req.doctor.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not have access to this session' }
      });
    }

    await prisma.$transaction(async (tx) => {
      for (const scoreData of scores) {
        await tx.vbMappEesaScore.upsert({
          where: { sessionId_itemId: { sessionId, itemId: scoreData.itemId } },
          update: { score: scoreData.score },
          create: { sessionId, itemId: scoreData.itemId, score: scoreData.score }
        });
      }
    });

    res.json({ success: true, message: 'EESA scores saved' });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Submit EESA scores error:', error);
    next(error);
  }
};

export const createIepGoal = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { sessionId } = req.params;
    const { milestoneId, targetDate, description } = req.body;

    const session = await prisma.vbMappSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: { code: 'SESSION_NOT_FOUND', message: 'VB-MAPP session not found' }
      });
    }

    if (session.evaluatorId !== req.doctor.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not have access to this session' }
      });
    }

    const goal = await prisma.vbMappIEPGoal.create({
      data: {
        sessionId,
        childId: session.childId,
        milestoneId,
        targetDate: new Date(targetDate),
        goalDescription: description,
        status: 'ACTIVE'
      },
      include: { milestone: true }
    });

    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Create IEP goal error:', error);
    next(error);
  }
};

export const updateIepGoal = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { goalId } = req.params;
    const { status, achievedDate, notes } = req.body;

    const goal = await prisma.vbMappIEPGoal.findUnique({
      where: { id: goalId },
      include: { session: true }
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: { code: 'GOAL_NOT_FOUND', message: 'IEP goal not found' }
      });
    }

    if (goal.session.evaluatorId !== req.doctor.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not have access to this goal' }
      });
    }

    const updated = await prisma.vbMappIEPGoal.update({
      where: { id: goalId },
      data: {
        ...(status && { status }),
        ...(achievedDate && { achievedDate: new Date(achievedDate) }),
        notes
      },
      include: { milestone: true }
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Update IEP goal error:', error);
    next(error);
  }
};

export const getVbMappSummary = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { childId } = req.params;

    await ensureDoctorCanAccessChild(prisma, req.doctor.id, childId);

    const sessions = await prisma.vbMappSession.findMany({
      where: { childId },
      orderBy: [{ sessionNumber: 'asc' }],
      include: {
        milestoneScores: true,
        taskStepScores: true,
        barrierScores: true,
        transitionScores: true
      }
    });

    const summary = {
      totalSessions: sessions.length,
      sessions: sessions.map((session) => ({
        id: session.id,
        sessionNumber: session.sessionNumber,
        assessmentDate: session.assessmentDate,
        totalScore: session.totalScore,
        milestoneCount: session.milestoneScores.length,
        taskStepsAchieved: session.taskStepScores.filter((s) => s.isAchieved).length,
        barriers: session.barrierScores,
        transitions: session.transitionScores
      }))
    };

    res.json({ success: true, data: summary });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Get VB-MAPP summary error:', error);
    next(error);
  }
};

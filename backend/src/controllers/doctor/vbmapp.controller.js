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
    const VB_MAPP_TOTAL_MAX_SCORE = 170;
    const milestoneScoreToPoints = (scoreValue) => {
      if (scoreValue === 'ACHIEVED') return 1;
      if (scoreValue === 'PARTIAL') return 0.5;
      return 0;
    };

    await ensureDoctorCanAccessChild(prisma, req.doctor.id, childId);

    const sessions = await prisma.vbMappSession.findMany({
      where: { childId },
      orderBy: [{ assessmentDate: 'asc' }, { createdAt: 'asc' }],
      include: {
        milestoneScores: {
          include: {
            milestone: {
              include: {
                skillArea: true
              }
            }
          }
        },
        taskStepScores: true,
        barrierScores: true,
        transitionScores: true,
        eesaScores: true
      }
    });

    const scoreTimeline = sessions.map((session) => {
      const computedTotal = session.milestoneScores.reduce(
        (sum, milestoneScore) => sum + milestoneScoreToPoints(milestoneScore.score),
        0
      );

      return {
        sessionId: session.id,
        sessionNumber: session.sessionNumber,
        assessmentDate: session.assessmentDate,
        totalScore: computedTotal
      };
    });

    const latestTimelineItem = scoreTimeline[scoreTimeline.length - 1] || null;
    const previousTimelineItem =
      scoreTimeline.length > 1 ? scoreTimeline[scoreTimeline.length - 2] : null;

    const latestSession =
      latestTimelineItem !== null
        ? sessions.find((session) => session.id === latestTimelineItem.sessionId) || null
        : null;

    const skillAreasMap = {};

    sessions.forEach((session) => {
      session.milestoneScores.forEach((milestoneScore) => {
        const area = milestoneScore.milestone?.skillArea;
        if (!area) return;

        if (!skillAreasMap[area.code]) {
          skillAreasMap[area.code] = {
            code: area.code,
            nameAr: area.nameAr,
            nameEn: area.nameEn,
            sessionScores: []
          };
        }

        const currentArea = skillAreasMap[area.code];
        let areaSession = currentArea.sessionScores.find(
          (sessionScore) => sessionScore.sessionId === session.id
        );

        if (!areaSession) {
          areaSession = {
            sessionId: session.id,
            sessionNumber: session.sessionNumber,
            assessmentDate: session.assessmentDate,
            score: 0
          };
          currentArea.sessionScores.push(areaSession);
        }

        areaSession.score += milestoneScoreToPoints(milestoneScore.score);
      });
    });

    const skillAreaProgress = Object.values(skillAreasMap)
      .map((area) => {
        const orderedScores = area.sessionScores.sort(
          (a, b) => new Date(a.assessmentDate) - new Date(b.assessmentDate)
        );
        const firstScore = orderedScores[0]?.score ?? 0;
        const latestScore = orderedScores[orderedScores.length - 1]?.score ?? 0;

        return {
          code: area.code,
          nameAr: area.nameAr,
          nameEn: area.nameEn,
          latestScore,
          firstScore,
          progressDelta: latestScore - firstScore,
          sessionScores: orderedScores
        };
      })
      .sort((a, b) => b.latestScore - a.latestScore);

    const summary = {
      totalSessions: sessions.length,
      totalMaxScore: VB_MAPP_TOTAL_MAX_SCORE,
      latestSession: latestSession
        ? {
            id: latestSession.id,
            sessionNumber: latestSession.sessionNumber,
            assessmentDate: latestSession.assessmentDate,
            totalScore: latestTimelineItem?.totalScore ?? latestSession.totalScore ?? 0,
            milestoneCount: latestSession.milestoneScores.length,
            achievedMilestones: latestSession.milestoneScores.filter(
              (score) => score.score === 'ACHIEVED'
            ).length,
            partialMilestones: latestSession.milestoneScores.filter(
              (score) => score.score === 'PARTIAL'
            ).length,
            taskStepsAchieved: latestSession.taskStepScores.filter((score) => score.isAchieved)
              .length,
            barrierCount: latestSession.barrierScores.length,
            transitionCount: latestSession.transitionScores.length,
            eesaCount: latestSession.eesaScores.length
          }
        : null,
      scoreChange:
        latestTimelineItem && previousTimelineItem
          ? latestTimelineItem.totalScore - previousTimelineItem.totalScore
          : 0,
      scoreTimeline,
      skillAreaProgress,
      sessions: sessions.map((session) => ({
        id: session.id,
        sessionNumber: session.sessionNumber,
        assessmentDate: session.assessmentDate,
        totalScore:
          scoreTimeline.find((timelineItem) => timelineItem.sessionId === session.id)?.totalScore ??
          session.totalScore ??
          0,
        milestoneCount: session.milestoneScores.length,
        achievedMilestones: session.milestoneScores.filter((score) => score.score === 'ACHIEVED')
          .length,
        partialMilestones: session.milestoneScores.filter((score) => score.score === 'PARTIAL')
          .length,
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

export const getMonthlyReport = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { childId, month, year } = req.query;
    await ensureDoctorCanAccessChild(prisma, req.doctor.id, childId);

    const m = parseInt(month, 10);
    const y = parseInt(year, 10);

    const periodStart = new Date(Date.UTC(y, m - 1, 1));
    const periodEnd = new Date(Date.UTC(y, m, 1));

    const child = await prisma.child.findUnique({
      where: { id: childId },
      select: { name: true, age: true }
    });

    const sessions = await prisma.vbMappSession.findMany({
      where: {
        childId,
        assessmentDate: { gte: periodStart, lt: periodEnd }
      },
      orderBy: { assessmentDate: 'asc' },
      include: {
        milestoneScores: {
          include: {
            milestone: {
              include: { skillArea: true }
            }
          }
        }
      }
    });

    const skillAreasMap = {};
    const totalScorePerSession = [];
    const achievedMilestones = [];

    sessions.forEach(session => {
      let sessionTotal = 0;
      session.milestoneScores.forEach(scoreObj => {
        if (!scoreObj.milestone || !scoreObj.milestone.skillArea) return;
        
        const area = scoreObj.milestone.skillArea;
        const areaCode = area.code;
        
        let pts = 0;
        if (scoreObj.score === 'ACHIEVED') {
          pts = 1;
          achievedMilestones.push({
             areaCode,
             areaName: area.nameAr,
             milestoneNumber: scoreObj.milestone.milestoneNumber,
             descriptionAr: scoreObj.milestone.descriptionAr,
             date: session.assessmentDate
          });
        }
        else if (scoreObj.score === 'PARTIAL') pts = 0.5;

        sessionTotal += pts;

        if (!skillAreasMap[areaCode]) {
          skillAreasMap[areaCode] = {
            code: areaCode,
            nameAr: area.nameAr,
            max: area.milestonesCount || 15,
            sessionScores: []
          };
        }

        let existingSessionData = skillAreasMap[areaCode].sessionScores.find(s => s.sessionId === session.id);
        if (!existingSessionData) {
          existingSessionData = {
            sessionId: session.id,
            sessionNumber: session.sessionNumber,
            date: session.assessmentDate,
            score: 0
          };
          skillAreasMap[areaCode].sessionScores.push(existingSessionData);
        }
        existingSessionData.score += pts;
      });

      totalScorePerSession.push({
        sessionId: session.id,
        sessionNumber: session.sessionNumber,
        date: session.assessmentDate,
        totalScore: sessionTotal
      });
    });

    const skillAreaProgress = Object.values(skillAreasMap).map(area => {
       const scores = area.sessionScores.sort((a, b) => new Date(a.date) - new Date(b.date));
       let improvement = 0;
       if (scores.length >= 2) {
         improvement = scores[scores.length - 1].score - scores[0].score;
       }
       return {
         ...area,
         sessionScores: scores,
         improvement
       };
    });

    const activeIepGoals = await prisma.vbMappIEPGoal.findMany({
      where: {
        childId,
        status: 'ACTIVE'
      },
      include: { milestone: { include: { skillArea: true } } }
    });

    res.json({
      success: true,
      data: {
        child,
        period: { month: m, year: y },
        sessions: sessions.map(s => ({ id: s.id, sessionNumber: s.sessionNumber, date: s.assessmentDate })),
        skillAreaProgress,
        totalScorePerSession,
        achievedMilestones,
        activeIepGoals: activeIepGoals.map(g => ({
          goalDescription: g.goalDescription,
          targetDate: g.targetDate,
          milestone: g.milestone ? `${g.milestone.skillArea?.nameAr || ''} ${g.milestone.milestoneNumber}` : null
        }))
      }
    });

  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Get VB-MAPP monthly report error:', error);
    next(error);
  }
};

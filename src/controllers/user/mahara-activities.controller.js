import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';
import { getFileUrl } from '../../middleware/upload.middleware.js';

const formatUserActivity = (req, activity) => ({
  id: activity.id,
  type: activity.type,
  levelOrder: activity.levelOrder,
  skillGroup: activity.skillGroup
    ? {
        id: activity.skillGroup.id,
        name: activity.skillGroup.name,
        category: activity.skillGroup.category
          ? {
              id: activity.skillGroup.category.id,
              name: activity.skillGroup.category.name
            }
          : null
      }
    : null,
  images: activity.images.map((image) => ({
    id: image.id,
    sortOrder: image.sortOrder,
    url: getFileUrl(req, image.assetPath, 'mahara/images')
  })),
  audios: activity.audios.map((audio) => ({
    id: audio.id,
    sortOrder: audio.sortOrder,
    url: getFileUrl(req, audio.assetPath, 'mahara/audio')
  }))
});

const sortActivities = (activities) => {
  return activities.sort((a, b) => {
    const categoryA = a.skillGroup?.category?.createdAt?.getTime?.() || 0;
    const categoryB = b.skillGroup?.category?.createdAt?.getTime?.() || 0;
    if (categoryA !== categoryB) return categoryA - categoryB;

    const skillA = a.skillGroup?.createdAt?.getTime?.() || 0;
    const skillB = b.skillGroup?.createdAt?.getTime?.() || 0;
    if (skillA !== skillB) return skillA - skillB;

    if (a.levelOrder !== b.levelOrder) return a.levelOrder - b.levelOrder;

    const createdA = a.createdAt?.getTime?.() || 0;
    const createdB = b.createdAt?.getTime?.() || 0;
    return createdA - createdB;
  });
};

const getOrderedActivities = async () => {
  const activities = await prisma.activity.findMany({
    include: {
      skillGroup: {
        include: { category: true }
      },
      images: { orderBy: { sortOrder: 'asc' } },
      audios: { orderBy: { sortOrder: 'asc' } },
      matchPairs: true,
      sequenceItems: { orderBy: { position: 'asc' } }
    }
  });

  return sortActivities(activities);
};

const getCurrentActivityForChild = async (childId) => {
  const [activities, progress] = await Promise.all([
    getOrderedActivities(),
    prisma.childActivityProgress.findMany({
      where: { childId, completed: true },
      select: { activityId: true }
    })
  ]);

  const completedSet = new Set(progress.map((item) => item.activityId));
  return activities.find((activity) => !completedSet.has(activity.id)) || null;
};

/**
 * Get Current Activity for Child
 */
export const getCurrentActivity = async (req, res, next) => {
  try {
    const { childId } = req.query;

    if (!childId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Child ID is required'
        }
      });
    }

    const child = await prisma.child.findUnique({
      where: { id: childId }
    });

    if (!child) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CHILD_NOT_FOUND',
          message: 'Child profile not found'
        }
      });
    }

    if (child.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only access your own child profiles'
        }
      });
    }

    const currentActivity = await getCurrentActivityForChild(childId);

    res.json({
      success: true,
      data: {
        activity: currentActivity ? formatUserActivity(req, currentActivity) : null
      }
    });
  } catch (error) {
    logger.error('Get current activity error:', error);
    next(error);
  }
};

/**
 * Submit Activity Interaction
 */
export const submitActivityInteraction = async (req, res, next) => {
  try {
    const { childId, activityId, selectedImageId, matches, sequence, event } = req.body;

    if (!childId || !activityId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Child ID and activity ID are required'
        }
      });
    }

    const child = await prisma.child.findUnique({
      where: { id: childId }
    });

    if (!child) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CHILD_NOT_FOUND',
          message: 'Child profile not found'
        }
      });
    }

    if (child.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only access your own child profiles'
        }
      });
    }

    const currentActivity = await getCurrentActivityForChild(childId);

    if (!currentActivity) {
      return res.json({
        success: true,
        data: {
          completed: true,
          activity: null,
          message: 'All activities completed'
        }
      });
    }

    if (currentActivity.id !== activityId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACTIVITY_LOCKED',
          message: 'This activity is locked',
          currentActivityId: currentActivity.id
        }
      });
    }

    let isCompleted = false;
    let isCorrect = true;

    if (currentActivity.type === 'LISTEN_WATCH' || currentActivity.type === 'AUDIO_ASSOCIATION') {
      if (event !== 'audio_completed') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Audio completion event is required'
          }
        });
      }
      isCompleted = true;
    }

    if (currentActivity.type === 'LISTEN_CHOOSE_IMAGE') {
      if (!selectedImageId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Selected image is required'
          }
        });
      }
      isCorrect = selectedImageId === currentActivity.correctImageId;
      isCompleted = isCorrect;
    }

    if (currentActivity.type === 'MATCHING') {
      if (!Array.isArray(matches)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Matches array is required'
          }
        });
      }

      const correctMap = new Map(
        currentActivity.matchPairs.map((pair) => [pair.imageId, pair.audioId])
      );

      const incorrectPairs = matches.filter((pair) => correctMap.get(pair.imageId) !== pair.audioId);
      isCorrect = incorrectPairs.length === 0 && matches.length === correctMap.size;
      isCompleted = isCorrect;

      if (!isCorrect) {
        return res.json({
          success: true,
          data: {
            completed: false,
            correct: false,
            incorrectPairs
          }
        });
      }
    }

    if (currentActivity.type === 'SEQUENCE_ORDER') {
      if (!Array.isArray(sequence)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Sequence array is required'
          }
        });
      }

      const correctSequence = currentActivity.sequenceItems.map((item) => item.imageId);
      isCorrect =
        sequence.length === correctSequence.length &&
        sequence.every((imageId, index) => imageId === correctSequence[index]);
      isCompleted = isCorrect;
    }

    if (!isCompleted) {
      return res.json({
        success: true,
        data: {
          completed: false,
          correct: false
        }
      });
    }

    await prisma.childActivityProgress.upsert({
      where: {
        childId_activityId: {
          childId,
          activityId
        }
      },
      update: {
        completed: true,
        completedAt: new Date()
      },
      create: {
        childId,
        activityId,
        completed: true,
        completedAt: new Date()
      }
    });

    const nextActivity = await getCurrentActivityForChild(childId);

    res.json({
      success: true,
      data: {
        completed: true,
        correct: true,
        nextActivity: nextActivity ? formatUserActivity(req, nextActivity) : null
      }
    });
  } catch (error) {
    logger.error('Submit activity interaction error:', error);
    next(error);
  }
};

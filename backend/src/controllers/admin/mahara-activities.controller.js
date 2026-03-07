import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';
import { getFileUrl } from '../../middleware/upload.middleware.js';

const parseJsonField = (value, fallback = undefined) => {
  if (value === undefined || value === null) return fallback;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return value;
};

const formatActivity = (req, activity) => {
  const images = activity.images.map((image) => ({
    ...image,
    url: getFileUrl(req, image.assetPath, 'mahara/images')
  }));

  const audios = activity.audios.map((audio) => ({
    ...audio,
    url: getFileUrl(req, audio.assetPath, 'mahara/audio')
  }));

  return {
    ...activity,
    images,
    audios
  };
};

const validateTypeRequirements = ({ type, images, audios, correctImageId, matchPairs, sequence }) => {
  if (audios.length === 0) {
    return 'Audio is required for every activity';
  }

  if (type === 'LISTEN_WATCH' || type === 'AUDIO_ASSOCIATION') {
    if (images.length !== 1 || audios.length !== 1) {
      return 'This activity type requires exactly 1 image and 1 audio';
    }
  }

  if (type === 'LISTEN_CHOOSE_IMAGE') {
    if (images.length < 2 || images.length > 3) {
      return 'Listen & choose image requires 2 to 3 images';
    }
    if (audios.length !== 1) {
      return 'Listen & choose image requires exactly 1 audio';
    }
    if (!correctImageId) {
      return 'Correct image is required for listen & choose image';
    }
  }

  if (type === 'MATCHING') {
    if (images.length === 0 || audios.length === 0) {
      return 'Matching requires images and audios';
    }
    if (images.length !== audios.length) {
      return 'Matching requires the same number of images and audios';
    }
    if (!Array.isArray(matchPairs) || matchPairs.length !== images.length) {
      return 'Matching requires one pair per image and audio';
    }
  }

  if (type === 'SEQUENCE_ORDER') {
    if (images.length < 2) {
      return 'Sequence order requires at least 2 images';
    }
    if (!Array.isArray(sequence) || sequence.length !== images.length) {
      return 'Sequence order requires a complete ordered list of images';
    }
  }

  return null;
};

/**
 * Get All Activities
 */
export const getAllActivities = async (req, res, next) => {
  try {
    const { skillGroupId } = req.query;
    const where = {};

    if (skillGroupId) {
      where.skillGroupId = skillGroupId;
    }

    const activities = await prisma.activity.findMany({
      where,
      orderBy: [
        { skillGroup: { category: { createdAt: 'asc' } } },
        { skillGroup: { createdAt: 'asc' } },
        { levelOrder: 'asc' },
        { createdAt: 'asc' }
      ],
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

    res.json({
      success: true,
      data: activities.map((activity) => formatActivity(req, activity))
    });
  } catch (error) {
    logger.error('Get activities error:', error);
    next(error);
  }
};

/**
 * Get Activity by ID
 */
export const getActivityById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const activity = await prisma.activity.findUnique({
      where: { id },
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

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ACTIVITY_NOT_FOUND',
          message: 'Activity not found'
        }
      });
    }

    res.json({
      success: true,
      data: formatActivity(req, activity)
    });
  } catch (error) {
    logger.error('Get activity error:', error);
    next(error);
  }
};

/**
 * Create Activity
 */
export const createActivity = async (req, res, next) => {
  try {
    const { skillGroupId, type, levelOrder } = req.body;
    const correctImageIndex = parseJsonField(req.body.correctImageIndex);
    const matchPairsInput = parseJsonField(req.body.matchPairs, []);
    const sequenceInput = parseJsonField(req.body.sequence, []);

    if (!skillGroupId || !type || levelOrder === undefined) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Skill group, type, and level order are required'
        }
      });
    }

    const skillGroup = await prisma.skillGroup.findUnique({
      where: { id: skillGroupId }
    });

    if (!skillGroup) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SKILL_GROUP_NOT_FOUND',
          message: 'Skill group not found'
        }
      });
    }

    const imageFiles = req.files?.images || [];
    const audioFiles = req.files?.audios || [];

    const imageRecords = imageFiles.map((file, index) => ({
      assetPath: file.filename,
      sortOrder: index
    }));

    const audioRecords = audioFiles.map((file, index) => ({
      assetPath: file.filename,
      sortOrder: index
    }));

    let correctImageId = null;
    let matchPairs = [];
    let sequence = [];

    if (type === 'MATCHING' && !Array.isArray(matchPairsInput)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Match pairs must be an array'
        }
      });
    }

    if (type === 'SEQUENCE_ORDER' && !Array.isArray(sequenceInput)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Sequence must be an array'
        }
      });
    }

    const validationError = validateTypeRequirements({
      type,
      images: imageRecords,
      audios: audioRecords,
      correctImageId: type === 'LISTEN_CHOOSE_IMAGE' && correctImageIndex !== undefined ? 'pending' : null,
      matchPairs: type === 'MATCHING' ? matchPairsInput : [],
      sequence: type === 'SEQUENCE_ORDER' ? sequenceInput : []
    });

    if (validationError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validationError
        }
      });
    }

    const activity = await prisma.$transaction(async (tx) => {
      const createdActivity = await tx.activity.create({
        data: {
          skillGroupId,
          type,
          levelOrder: parseInt(levelOrder)
        }
      });

      const createdImages = await Promise.all(
        imageRecords.map((image) =>
          tx.activityImage.create({
            data: {
              activityId: createdActivity.id,
              assetPath: image.assetPath,
              sortOrder: image.sortOrder
            }
          })
        )
      );

      const createdAudios = await Promise.all(
        audioRecords.map((audio) =>
          tx.activityAudio.create({
            data: {
              activityId: createdActivity.id,
              assetPath: audio.assetPath,
              sortOrder: audio.sortOrder
            }
          })
        )
      );

      if (type === 'LISTEN_CHOOSE_IMAGE') {
        if (correctImageIndex === undefined || correctImageIndex === null) {
          throw new Error('Correct image index is required');
        }
        const image = createdImages[parseInt(correctImageIndex)];
        if (!image) {
          throw new Error('Correct image index is out of range');
        }
        correctImageId = image.id;
        await tx.activity.update({
          where: { id: createdActivity.id },
          data: { correctImageId }
        });
      }

      if (type === 'MATCHING') {
        matchPairs = matchPairsInput.map((pair) => {
          const image = createdImages[parseInt(pair.imageIndex)];
          const audio = createdAudios[parseInt(pair.audioIndex)];
          if (!image || !audio) {
            throw new Error('Invalid matching pair index');
          }
          return {
            activityId: createdActivity.id,
            imageId: image.id,
            audioId: audio.id
          };
        });

        const imageIds = new Set(matchPairs.map((pair) => pair.imageId));
        const audioIds = new Set(matchPairs.map((pair) => pair.audioId));

        if (imageIds.size !== createdImages.length || audioIds.size !== createdAudios.length) {
          throw new Error('Matching pairs must use each image and audio exactly once');
        }

        await tx.activityMatchPair.createMany({
          data: matchPairs
        });
      }

      if (type === 'SEQUENCE_ORDER') {
        sequence = sequenceInput.map((index) => createdImages[parseInt(index)]?.id);
        if (sequence.some((id) => !id)) {
          throw new Error('Invalid sequence index');
        }
        const uniqueIds = new Set(sequence);
        if (uniqueIds.size !== createdImages.length) {
          throw new Error('Sequence must include each image exactly once');
        }

        await tx.activitySequenceItem.createMany({
          data: sequence.map((imageId, position) => ({
            activityId: createdActivity.id,
            imageId,
            position
          }))
        });
      }

      return tx.activity.findUnique({
        where: { id: createdActivity.id },
        include: {
          skillGroup: { include: { category: true } },
          images: { orderBy: { sortOrder: 'asc' } },
          audios: { orderBy: { sortOrder: 'asc' } },
          matchPairs: true,
          sequenceItems: { orderBy: { position: 'asc' } }
        }
      });
    });

    logger.info(`Activity created: ${activity.id} by admin ${req.admin.id}`);

    res.status(201).json({
      success: true,
      data: formatActivity(req, activity)
    });
  } catch (error) {
    logger.error('Create activity error:', error);
    if (error.message?.includes('Correct image') || error.message?.includes('matching') || error.message?.includes('sequence')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message
        }
      });
    }
    next(error);
  }
};

/**
 * Update Activity
 */
export const updateActivity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { levelOrder, type, correctImageId } = req.body;
    const matchPairsInput = parseJsonField(req.body.matchPairs, null);
    const sequenceInput = parseJsonField(req.body.sequence, null);
    const removeImageIds = parseJsonField(req.body.removeImageIds, []);
    const removeAudioIds = parseJsonField(req.body.removeAudioIds, []);

    const activity = await prisma.activity.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        audios: { orderBy: { sortOrder: 'asc' } },
        matchPairs: true,
        sequenceItems: { orderBy: { position: 'asc' } }
      }
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ACTIVITY_NOT_FOUND',
          message: 'Activity not found'
        }
      });
    }

    if (type && type !== activity.type) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ACTIVITY_TYPE_LOCKED',
          message: 'Activity type cannot be changed'
        }
      });
    }

    if (matchPairsInput !== null && !Array.isArray(matchPairsInput)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Match pairs must be an array'
        }
      });
    }

    if (sequenceInput !== null && !Array.isArray(sequenceInput)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Sequence must be an array'
        }
      });
    }

    const imageFiles = req.files?.images || [];
    const audioFiles = req.files?.audios || [];

    const newImageRecords = imageFiles.map((file, index) => ({
      assetPath: file.filename,
      sortOrder: activity.images.length + index
    }));

    const newAudioRecords = audioFiles.map((file, index) => ({
      assetPath: file.filename,
      sortOrder: activity.audios.length + index
    }));

    const remainingImages = activity.images.filter((img) => !removeImageIds.includes(img.id));
    const remainingAudios = activity.audios.filter((audio) => !removeAudioIds.includes(audio.id));
    const remainingImageIds = new Set(remainingImages.map((img) => img.id));
    const remainingAudioIds = new Set(remainingAudios.map((audio) => audio.id));

    const pairsToValidate = Array.isArray(matchPairsInput)
      ? matchPairsInput
      : activity.matchPairs.map((pair) => ({ imageId: pair.imageId, audioId: pair.audioId }));

    const sequenceToValidate = Array.isArray(sequenceInput)
      ? sequenceInput
      : activity.sequenceItems.map((item) => item.imageId);

    const finalImagesCount = remainingImages.length + newImageRecords.length;
    const finalAudiosCount = remainingAudios.length + newAudioRecords.length;

    const validationError = validateTypeRequirements({
      type: activity.type,
      images: Array(finalImagesCount).fill({}),
      audios: Array(finalAudiosCount).fill({}),
      correctImageId: activity.type === 'LISTEN_CHOOSE_IMAGE' ? (correctImageId || activity.correctImageId) : null,
      matchPairs: activity.type === 'MATCHING' ? pairsToValidate : [],
      sequence: activity.type === 'SEQUENCE_ORDER' ? sequenceToValidate : []
    });

    if (validationError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validationError
        }
      });
    }

    if (activity.type === 'LISTEN_CHOOSE_IMAGE') {
      const finalCorrectImageId = correctImageId || activity.correctImageId;
      if (finalCorrectImageId && !remainingImageIds.has(finalCorrectImageId)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Correct image must be part of the activity images'
          }
        });
      }
    }

    if (activity.type === 'MATCHING') {
      const invalidPair = pairsToValidate.find(
        (pair) => !remainingImageIds.has(pair.imageId) || !remainingAudioIds.has(pair.audioId)
      );
      if (invalidPair) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Matching pairs must reference existing images and audios'
          }
        });
      }
    }

    if (activity.type === 'SEQUENCE_ORDER') {
      const invalidSequence = sequenceToValidate.find((imageId) => !remainingImageIds.has(imageId));
      if (invalidSequence) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Sequence items must reference existing images'
          }
        });
      }
    }

    const updatedActivity = await prisma.$transaction(async (tx) => {
      if (removeImageIds.length > 0) {
        await tx.activityImage.deleteMany({
          where: {
            id: { in: removeImageIds },
            activityId: id
          }
        });
      }

      if (removeAudioIds.length > 0) {
        await tx.activityAudio.deleteMany({
          where: {
            id: { in: removeAudioIds },
            activityId: id
          }
        });
      }

      await Promise.all(
        newImageRecords.map((image) =>
          tx.activityImage.create({
            data: {
              activityId: id,
              assetPath: image.assetPath,
              sortOrder: image.sortOrder
            }
          })
        )
      );

      await Promise.all(
        newAudioRecords.map((audio) =>
          tx.activityAudio.create({
            data: {
              activityId: id,
              assetPath: audio.assetPath,
              sortOrder: audio.sortOrder
            }
          })
        )
      );

      if (activity.type === 'LISTEN_CHOOSE_IMAGE' && correctImageId) {
        await tx.activity.update({
          where: { id },
          data: { correctImageId }
        });
      }

      if (activity.type === 'MATCHING' && Array.isArray(matchPairsInput)) {
        await tx.activityMatchPair.deleteMany({ where: { activityId: id } });
        await tx.activityMatchPair.createMany({
          data: matchPairsInput.map((pair) => ({
            activityId: id,
            imageId: pair.imageId,
            audioId: pair.audioId
          }))
        });
      }

      if (activity.type === 'SEQUENCE_ORDER' && Array.isArray(sequenceInput)) {
        await tx.activitySequenceItem.deleteMany({ where: { activityId: id } });
        await tx.activitySequenceItem.createMany({
          data: sequenceInput.map((imageId, position) => ({
            activityId: id,
            imageId,
            position
          }))
        });
      }

      const updated = await tx.activity.update({
        where: { id },
        data: {
          ...(levelOrder !== undefined && { levelOrder: parseInt(levelOrder) })
        }
      });

      return tx.activity.findUnique({
        where: { id: updated.id },
        include: {
          skillGroup: { include: { category: true } },
          images: { orderBy: { sortOrder: 'asc' } },
          audios: { orderBy: { sortOrder: 'asc' } },
          matchPairs: true,
          sequenceItems: { orderBy: { position: 'asc' } }
        }
      });
    });

    logger.info(`Activity updated: ${id} by admin ${req.admin.id}`);

    res.json({
      success: true,
      data: formatActivity(req, updatedActivity)
    });
  } catch (error) {
    logger.error('Update activity error:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_LEVEL_ORDER',
          message: 'Level order must be unique within a skill group'
        }
      });
    }
    next(error);
  }
};

/**
 * Delete Activity
 */
export const deleteActivity = async (req, res, next) => {
  try {
    const { id } = req.params;

    const activity = await prisma.activity.findUnique({
      where: { id }
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ACTIVITY_NOT_FOUND',
          message: 'Activity not found'
        }
      });
    }

    await prisma.activity.delete({
      where: { id }
    });

    logger.info(`Activity deleted: ${id} by admin ${req.admin.id}`);

    res.json({
      success: true,
      message: 'Activity deleted successfully'
    });
  } catch (error) {
    logger.error('Delete activity error:', error);
    next(error);
  }
};

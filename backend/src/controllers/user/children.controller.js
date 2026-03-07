import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Get all children for authenticated user
 */
export const getUserChildren = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const children = await prisma.child.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { children }
    });
  } catch (error) {
    logger.error('Get children error:', error);
    next(error);
  }
};

/**
 * Get child by ID
 */
export const getChildById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const child = await prisma.child.findUnique({
      where: { id },
      include: {
        bookings: {
          orderBy: { scheduledAt: 'desc' },
          take: 5 // Last 5 bookings
        }
      }
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

    // Check if child belongs to user
    if (child.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only view your own child profiles'
        }
      });
    }

    res.json({
      success: true,
      data: { child }
    });
  } catch (error) {
    logger.error('Get child error:', error);
    next(error);
  }
};

/**
 * Create child profile
 */
export const createChild = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      name,
      status,
      ageGroup,
      behavioralNotes,
      caseDescription,
      profileImage
    } = req.body;

    // Validation
    if (!name || !status || !ageGroup) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Name, status, and age group are required'
        }
      });
    }

    // Validate status
    if (!['AUTISM', 'SPEECH_DISORDER'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid status. Must be AUTISM or SPEECH_DISORDER'
        }
      });
    }

    // Validate age group
    if (!['UNDER_4', 'BETWEEN_5_15', 'OVER_15'].includes(ageGroup)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid age group. Must be UNDER_4, BETWEEN_5_15, or OVER_15'
        }
      });
    }

    // Create child profile
    const child = await prisma.child.create({
      data: {
        userId,
        name,
        status,
        ageGroup,
        behavioralNotes: behavioralNotes || null,
        caseDescription: caseDescription || null,
        profileImage: profileImage || null
      }
    });

    logger.info(`Child profile created: ${child.id} by user ${userId}`);

    res.status(201).json({
      success: true,
      data: { child }
    });
  } catch (error) {
    logger.error('Create child error:', error);
    next(error);
  }
};

/**
 * Update child profile
 */
export const updateChild = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const {
      name,
      status,
      ageGroup,
      behavioralNotes,
      caseDescription,
      profileImage
    } = req.body;

    // Check if child exists and belongs to user
    const existingChild = await prisma.child.findUnique({
      where: { id }
    });

    if (!existingChild) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CHILD_NOT_FOUND',
          message: 'Child profile not found'
        }
      });
    }

    if (existingChild.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only update your own child profiles'
        }
      });
    }

    // Validate status if provided
    if (status && !['AUTISM', 'SPEECH_DISORDER'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid status. Must be AUTISM or SPEECH_DISORDER'
        }
      });
    }

    // Validate age group if provided
    if (ageGroup && !['UNDER_4', 'BETWEEN_5_15', 'OVER_15'].includes(ageGroup)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid age group. Must be UNDER_4, BETWEEN_5_15, or OVER_15'
        }
      });
    }

    // Update child profile
    const child = await prisma.child.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(status && { status }),
        ...(ageGroup && { ageGroup }),
        ...(behavioralNotes !== undefined && { behavioralNotes }),
        ...(caseDescription !== undefined && { caseDescription }),
        ...(profileImage !== undefined && { profileImage })
      }
    });

    logger.info(`Child profile updated: ${id} by user ${userId}`);

    res.json({
      success: true,
      data: { child }
    });
  } catch (error) {
    logger.error('Update child error:', error);
    next(error);
  }
};

/**
 * Delete child profile
 */
export const deleteChild = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Check if child exists and belongs to user
    const child = await prisma.child.findUnique({
      where: { id }
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

    if (child.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only delete your own child profiles'
        }
      });
    }

    // Delete child profile
    await prisma.child.delete({
      where: { id }
    });

    logger.info(`Child profile deleted: ${id} by user ${userId}`);

    res.json({
      success: true,
      message: 'Child profile deleted successfully'
    });
  } catch (error) {
    logger.error('Delete child error:', error);
    next(error);
  }
};

/**
 * Submit Child Survey (After Account Creation)
 * This endpoint handles the survey screen data collection
 * Maps Arabic values to enum values:
 * - "توحد" (Autism) -> AUTISM
 * - "تخاطب" (Speech Therapy) -> SPEECH_DISORDER
 * - Age ranges map to ChildAgeGroup enum
 * 
 * Expected request body:
 * {
 *   name?: string (optional, will use default if not provided)
 *   status: string (Arabic text or enum: "توحد"/"تخاطب" or "AUTISM"/"SPEECH_DISORDER")
 *   ageGroup: string (Arabic text or enum: "اقل من 4 سنوات"/"4 سنوات الي 15 سنه"/"اكبر من 15 سنه" or "UNDER_4"/"BETWEEN_5_15"/"OVER_15")
 *   behavioralNotes?: string (max 250 characters)
 * }
 */
export const submitChildSurvey = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      name,
      status,
      ageGroup,
      behavioralNotes
    } = req.body;

    // Validation - status and ageGroup are required
    if (!status || !ageGroup) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'حالة الطفل وعمر الطفل مطلوبان',
          messageEn: 'Child status and age are required'
        }
      });
    }

    // Normalize input (trim whitespace)
    const normalizedStatus = String(status).trim();
    const normalizedAgeGroup = String(ageGroup).trim();

    // Validate and map status
    // Accept both Arabic text and enum values for flexibility
    let mappedStatus = null;
    
    // Check Arabic text first
    if (normalizedStatus === 'توحد' || normalizedStatus.toLowerCase() === 'autism') {
      mappedStatus = 'AUTISM';
    } else if (normalizedStatus === 'تخاطب' || normalizedStatus.toLowerCase() === 'speech_disorder' || normalizedStatus.toLowerCase() === 'speech therapy') {
      mappedStatus = 'SPEECH_DISORDER';
    } else if (normalizedStatus === 'AUTISM' || normalizedStatus === 'SPEECH_DISORDER') {
      // Already in enum format
      mappedStatus = normalizedStatus;
    } else {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'حالة الطفل غير صحيحة. يجب أن تكون "توحد" أو "تخاطب"',
          messageEn: 'Invalid child status. Must be "توحد" (Autism) or "تخاطب" (Speech Therapy)'
        }
      });
    }

    // Validate and map age group
    let mappedAgeGroup = null;
    
    // Check Arabic text first
    if (normalizedAgeGroup === 'اقل من 4 سنوات' || normalizedAgeGroup === 'أقل من 4 سنوات' || normalizedAgeGroup.toLowerCase() === 'under_4') {
      mappedAgeGroup = 'UNDER_4';
    } else if (normalizedAgeGroup === '4 سنوات الي 15 سنه' || normalizedAgeGroup === '4 سنوات إلى 15 سنة' || normalizedAgeGroup.toLowerCase() === 'between_5_15') {
      mappedAgeGroup = 'BETWEEN_5_15';
    } else if (normalizedAgeGroup === 'اكبر من 15 سنه' || normalizedAgeGroup === 'أكبر من 15 سنة' || normalizedAgeGroup.toLowerCase() === 'over_15') {
      mappedAgeGroup = 'OVER_15';
    } else if (normalizedAgeGroup === 'UNDER_4' || normalizedAgeGroup === 'BETWEEN_5_15' || normalizedAgeGroup === 'OVER_15') {
      // Already in enum format
      mappedAgeGroup = normalizedAgeGroup;
    } else {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'فئة العمر غير صحيحة. يجب أن تكون "اقل من 4 سنوات" أو "4 سنوات الي 15 سنه" أو "اكبر من 15 سنه"',
          messageEn: 'Invalid age group'
        }
      });
    }

    // Validate behavioral notes length (250 characters max as per UI)
    if (behavioralNotes) {
      const notes = String(behavioralNotes).trim();
      if (notes.length > 250) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `ملاحظات السلوك يجب ألا تتجاوز 250 حرفاً. الحروف المدخلة: ${notes.length}`,
            messageEn: `Behavioral notes must not exceed 250 characters. Current length: ${notes.length}`
          }
        });
      }
    }

    // Get existing children count for default naming
    const existingChildrenCount = await prisma.child.count({
      where: { userId }
    });

    // Generate default name if not provided
    const childName = name && name.trim() 
      ? name.trim() 
      : `طفل ${existingChildrenCount + 1}`;

    // Create child profile with survey data
    const child = await prisma.child.create({
      data: {
        userId,
        name: childName,
        status: mappedStatus,
        ageGroup: mappedAgeGroup,
        behavioralNotes: behavioralNotes ? String(behavioralNotes).trim() : null
      }
    });

    logger.info(`Child survey submitted: ${child.id} by user ${userId}`, {
      status: mappedStatus,
      ageGroup: mappedAgeGroup,
      hasNotes: !!behavioralNotes
    });

    res.status(201).json({
      success: true,
      message: 'تم حفظ بيانات الاستبيان بنجاح',
      messageEn: 'Survey data saved successfully',
      data: { 
        child: {
          id: child.id,
          name: child.name,
          status: child.status,
          ageGroup: child.ageGroup,
          behavioralNotes: child.behavioralNotes,
          createdAt: child.createdAt
        },
        surveyCompleted: true
      }
    });
  } catch (error) {
    logger.error('Submit child survey error:', error);
    
    // Handle unique constraint violations or other database errors
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_ERROR',
          message: 'يبدو أن هناك خطأ في حفظ البيانات. يرجى المحاولة مرة أخرى',
          messageEn: 'Duplicate entry error. Please try again'
        }
      });
    }
    
    next(error);
  }
};
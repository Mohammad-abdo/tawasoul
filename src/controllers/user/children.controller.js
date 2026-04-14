import { logger } from '../../utils/logger.js';
import * as childrenService from '../../services/user/children.service.js';

const handleError = (error, res, next, context) => {
  if (error.status) {
    return res.status(error.status).json({
      success: false,
      error: { code: error.code, message: error.message }
    });
  }
  logger.error(`${context} error:`, error);
  next(error);
};

export const getUserChildren = async (req, res, next) => {
  try {
    const children = await childrenService.getUserChildren(req.user.id);
    res.json({ success: true, data: { children } });
  } catch (error) {
    handleError(error, res, next, 'Get children');
  }
};

export const getChildById = async (req, res, next) => {
  try {
    const child = await childrenService.getChildById(req.user.id, req.params.id);
    res.json({ success: true, data: { child } });
  } catch (error) {
    handleError(error, res, next, 'Get child');
  }
};

export const createChild = async (req, res, next) => {
  try {
    const child = await childrenService.createChild(req.user.id, req.body);
    logger.info(`Child profile created: ${child.id} by user ${req.user.id}`);
    res.status(201).json({ success: true, data: { child } });
  } catch (error) {
    handleError(error, res, next, 'Create child');
  }
};

export const updateChild = async (req, res, next) => {
  try {
    const child = await childrenService.updateChild(req.user.id, req.params.id, req.body);
    logger.info(`Child profile updated: ${req.params.id} by user ${req.user.id}`);
    res.json({ success: true, data: { child } });
  } catch (error) {
    handleError(error, res, next, 'Update child');
  }
};

export const deleteChild = async (req, res, next) => {
  try {
    await childrenService.deleteChild(req.user.id, req.params.id);
    logger.info(`Child profile deleted: ${req.params.id} by user ${req.user.id}`);
    res.json({ success: true, message: 'Child profile deleted successfully' });
  } catch (error) {
    handleError(error, res, next, 'Delete child');
  }
};

export const submitChildSurvey = async (req, res, next) => {
  try {
    const result = await childrenService.submitChildSurvey(req.user.id, req.body);
    logger.info(`Child survey submitted for user ${req.user.id}`);
    res.status(201).json({
      success: true,
      message: 'تم حفظ بيانات الاستبيان بنجاح',
      messageEn: 'Survey data saved successfully',
      data: result
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_ERROR',
          message: 'يبدو أن هناك خطأ في حفظ البيانات. يرجى المحاولة مرة أخرى'
        }
      });
    }
    handleError(error, res, next, 'Submit child survey');
  }
};

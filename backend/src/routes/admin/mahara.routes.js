import express from 'express';
import { authenticateAdmin } from '../../middleware/auth.middleware.js';
import { uploadActivityAssets } from '../../middleware/upload.middleware.js';
import * as maharaCategoriesController from '../../controllers/admin/mahara-categories.controller.js';
import * as maharaSkillGroupsController from '../../controllers/admin/mahara-skill-groups.controller.js';
import * as maharaActivitiesController from '../../controllers/admin/mahara-activities.controller.js';

const router = express.Router();

router.get('/categories', authenticateAdmin, maharaCategoriesController.getAllActivityCategories);
router.get('/categories/:id', authenticateAdmin, maharaCategoriesController.getActivityCategoryById);
router.post('/categories', authenticateAdmin, maharaCategoriesController.createActivityCategory);
router.put('/categories/:id', authenticateAdmin, maharaCategoriesController.updateActivityCategory);
router.delete('/categories/:id', authenticateAdmin, maharaCategoriesController.deleteActivityCategory);

router.get('/skill-groups', authenticateAdmin, maharaSkillGroupsController.getAllSkillGroups);
router.get('/skill-groups/:id', authenticateAdmin, maharaSkillGroupsController.getSkillGroupById);
router.post('/skill-groups', authenticateAdmin, maharaSkillGroupsController.createSkillGroup);
router.put('/skill-groups/:id', authenticateAdmin, maharaSkillGroupsController.updateSkillGroup);
router.delete('/skill-groups/:id', authenticateAdmin, maharaSkillGroupsController.deleteSkillGroup);

router.get('/activities', authenticateAdmin, maharaActivitiesController.getAllActivities);
router.get('/activities/:id', authenticateAdmin, maharaActivitiesController.getActivityById);
router.post('/activities', authenticateAdmin, uploadActivityAssets(), maharaActivitiesController.createActivity);
router.put('/activities/:id', authenticateAdmin, uploadActivityAssets(), maharaActivitiesController.updateActivity);
router.delete('/activities/:id', authenticateAdmin, maharaActivitiesController.deleteActivity);

export default router;

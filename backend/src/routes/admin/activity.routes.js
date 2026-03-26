import express from 'express';
import { authenticateAdmin } from '../../middleware/auth.middleware.js';
import * as activityLogsController from '../../controllers/admin/activity-logs.controller.js';

const router = express.Router();

router.get('/', authenticateAdmin, activityLogsController.getAllActivityLogs);
router.get('/:id', authenticateAdmin, activityLogsController.getActivityLogById);
router.get('/stats', authenticateAdmin, activityLogsController.getActivityStats);
router.get('/export', authenticateAdmin, activityLogsController.exportActivityLogs);

export default router;

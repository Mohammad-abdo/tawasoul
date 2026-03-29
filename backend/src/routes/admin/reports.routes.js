import express from 'express';
import { authenticateAdmin } from '../../middleware/auth.middleware.js';
import { reportRateLimiter } from '../../middleware/rateLimiter.middleware.js';
import * as reportsController from '../../controllers/admin/reports.controller.js';

const router = express.Router();

router.get('/', authenticateAdmin, reportsController.getAllReports);
router.get('/:id', authenticateAdmin, reportsController.getReportById);
router.get('/:id/status', authenticateAdmin, reportsController.getReportStatus);
router.post('/generate', authenticateAdmin, reportRateLimiter, reportsController.generateReport);
router.get('/:id/download', authenticateAdmin, reportsController.downloadReport);
router.delete('/:id', authenticateAdmin, reportsController.deleteReport);

export default router;

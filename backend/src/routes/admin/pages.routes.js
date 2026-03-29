import express from 'express';
import { authenticateAdmin } from '../../middleware/auth.middleware.js';
import * as pageContentController from '../../controllers/admin/page-content.controller.js';

const router = express.Router();

router.get('/', authenticateAdmin, pageContentController.getAllPages);
router.get('/:pageType', authenticateAdmin, pageContentController.getPageByType);
router.put('/:pageType', authenticateAdmin, pageContentController.updatePageContent);
router.post('/initialize', authenticateAdmin, pageContentController.initializePages);

export default router;

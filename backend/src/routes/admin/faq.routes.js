import express from 'express';
import { authenticateAdmin } from '../../middleware/auth.middleware.js';
import * as faqController from '../../controllers/admin/faq.controller.js';

const router = express.Router();

router.get('/', authenticateAdmin, faqController.getAllFAQs);
router.get('/:id', authenticateAdmin, faqController.getFAQById);
router.post('/', authenticateAdmin, faqController.createFAQ);
router.put('/:id', authenticateAdmin, faqController.updateFAQ);
router.delete('/:id', authenticateAdmin, faqController.deleteFAQ);

export default router;

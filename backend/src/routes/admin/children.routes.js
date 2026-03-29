import express from 'express';
import { authenticateAdmin } from '../../middleware/auth.middleware.js';
import * as childrenController from '../../controllers/admin/children.controller.js';

const router = express.Router();

router.get('/', authenticateAdmin, childrenController.getAllChildren);
router.get('/:id', authenticateAdmin, childrenController.getChildById);
router.delete('/:id', authenticateAdmin, childrenController.deleteChild);

export default router;

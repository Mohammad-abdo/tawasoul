import express from 'express';
import { authenticateUser } from '../../middleware/auth.middleware.js';
import * as childrenController from '../../controllers/user/children.controller.js';

const router = express.Router();

router.get('/', authenticateUser, childrenController.getUserChildren);
router.post('/', authenticateUser, childrenController.createChild);
router.post('/survey', authenticateUser, childrenController.submitChildSurvey);
router.get('/:id', authenticateUser, childrenController.getChildById);
router.put('/:id', authenticateUser, childrenController.updateChild);
router.delete('/:id', authenticateUser, childrenController.deleteChild);

export default router;

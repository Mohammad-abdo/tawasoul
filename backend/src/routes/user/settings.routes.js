import express from 'express';
import { authenticateUser } from '../../middleware/auth.middleware.js';
import * as settingsController from '../../controllers/user/settings.controller.js';

const router = express.Router();

router.get('/', authenticateUser, settingsController.getUserSettings);
router.put('/', authenticateUser, settingsController.updateUserSettings);
router.put('/password', authenticateUser, settingsController.changePassword);

export default router;

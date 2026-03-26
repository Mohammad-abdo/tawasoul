import express from 'express';
import { authenticateAdmin } from '../../middleware/auth.middleware.js';
import * as settingsController from '../../controllers/admin/settings.controller.js';

const router = express.Router();

router.get('/', authenticateAdmin, settingsController.getSettings);
router.put('/', authenticateAdmin, settingsController.updateSettings);

export default router;

import express from 'express';
import { authenticateUser } from '../../middleware/auth.middleware.js';
import * as packagesController from '../../controllers/user/packages.controller.js';

const router = express.Router();

router.get('/', packagesController.getPackages);
router.get('/active', authenticateUser, packagesController.getActivePackage);
router.get('/my-packages', authenticateUser, packagesController.getUserPackages);
router.get('/:id', packagesController.getPackageById);
router.post('/purchase', authenticateUser, packagesController.purchasePackage);

export default router;

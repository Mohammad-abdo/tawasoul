import express from 'express';
import { authenticateAdmin } from '../../middleware/auth.middleware.js';
import * as packagesController from '../../controllers/admin/packages.controller.js';

const router = express.Router();

router.get('/', authenticateAdmin, packagesController.getAllPackages);
router.get('/:id', authenticateAdmin, packagesController.getPackageById);
router.post('/', authenticateAdmin, packagesController.createPackage);
router.put('/:id', authenticateAdmin, packagesController.updatePackage);
router.delete('/:id', authenticateAdmin, packagesController.deletePackage);
router.put('/:id/activate', authenticateAdmin, packagesController.activatePackage);
router.put('/:id/deactivate', authenticateAdmin, packagesController.deactivatePackage);

export default router;

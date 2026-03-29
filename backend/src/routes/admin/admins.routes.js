import express from 'express';
import { authenticateAdmin, requireRole } from '../../middleware/auth.middleware.js';
import * as adminsController from '../../controllers/admin/admins.controller.js';

const router = express.Router();

router.get('/', authenticateAdmin, requireRole('SUPER_ADMIN'), adminsController.getAllAdmins);
router.get('/:id', authenticateAdmin, requireRole('SUPER_ADMIN'), adminsController.getAdminById);
router.post('/', authenticateAdmin, requireRole('SUPER_ADMIN'), adminsController.createAdmin);
router.put('/:id', authenticateAdmin, requireRole('SUPER_ADMIN'), adminsController.updateAdmin);
router.put('/:id/password', authenticateAdmin, requireRole('SUPER_ADMIN'), adminsController.changeAdminPassword);
router.put('/:id/activate', authenticateAdmin, requireRole('SUPER_ADMIN'), adminsController.activateAdmin);
router.put('/:id/deactivate', authenticateAdmin, requireRole('SUPER_ADMIN'), adminsController.deactivateAdmin);
router.delete('/:id', authenticateAdmin, requireRole('SUPER_ADMIN'), adminsController.deleteAdmin);

export default router;

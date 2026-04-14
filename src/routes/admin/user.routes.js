import express from 'express';
import { authenticateAdmin } from '../../middleware/auth.middleware.js';
import * as usersController from '../../controllers/admin/users.controller.js';

const router = express.Router();

router.get('/', authenticateAdmin, usersController.getAllUsers);
router.get('/:id', authenticateAdmin, usersController.getUserById);
router.post('/', authenticateAdmin, usersController.createUser);
router.put('/:id', authenticateAdmin, usersController.updateUser);
router.put('/:id/approve', authenticateAdmin, usersController.approveUser);
router.put('/:id/reject', authenticateAdmin, usersController.rejectUser);
router.put('/:id/activate', authenticateAdmin, usersController.activateUser);
router.put('/:id/deactivate', authenticateAdmin, usersController.deactivateUser);
router.delete('/:id', authenticateAdmin, usersController.deleteUser);

export default router;

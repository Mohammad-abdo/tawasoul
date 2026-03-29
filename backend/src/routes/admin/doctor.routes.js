import express from 'express';
import { authenticateAdmin } from '../../middleware/auth.middleware.js';
import * as doctorsController from '../../controllers/admin/doctors.controller.js';

const router = express.Router();

router.get('/', authenticateAdmin, doctorsController.getAllDoctors);
router.get('/:id', authenticateAdmin, doctorsController.getDoctorById);
router.post('/', authenticateAdmin, doctorsController.createDoctor);
router.put('/:id', authenticateAdmin, doctorsController.updateDoctor);
router.put('/:id/approve', authenticateAdmin, doctorsController.approveDoctor);
router.put('/:id/reject', authenticateAdmin, doctorsController.rejectDoctor);
router.put('/:id/verify', authenticateAdmin, doctorsController.verifyDoctor);
router.put('/:id/unverify', authenticateAdmin, doctorsController.unverifyDoctor);
router.put('/:id/activate', authenticateAdmin, doctorsController.activateDoctor);
router.put('/:id/deactivate', authenticateAdmin, doctorsController.deactivateDoctor);
router.delete('/:id', authenticateAdmin, doctorsController.deleteDoctor);

export default router;

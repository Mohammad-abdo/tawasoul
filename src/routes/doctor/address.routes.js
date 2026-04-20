import express from 'express';
import { authenticateDoctor } from '../../middleware/auth.middleware.js';
import * as addressController from '../../controllers/doctor/address.controller.js';

const router = express.Router();

router.get('/', authenticateDoctor, addressController.getDoctorAddresses);
router.get('/:id', authenticateDoctor, addressController.getAddressById);
router.post('/', authenticateDoctor, addressController.createAddress);
router.put('/:id', authenticateDoctor, addressController.updateAddress);
router.delete('/:id', authenticateDoctor, addressController.deleteAddress);

export default router;
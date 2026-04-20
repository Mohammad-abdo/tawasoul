import express from 'express';
import { authenticateUser } from '../../middleware/auth.middleware.js';
import * as addressController from '../../controllers/user/address.controller.js';

const router = express.Router();

router.get('/', authenticateUser, addressController.getUserAddresses);
router.get('/:id', authenticateUser, addressController.getAddressById);
router.post('/', authenticateUser, addressController.createAddress);
router.put('/:id', authenticateUser, addressController.updateAddress);
router.delete('/:id', authenticateUser, addressController.deleteAddress);

export default router;
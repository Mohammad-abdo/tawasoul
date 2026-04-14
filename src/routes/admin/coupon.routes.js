import express from 'express';
import { authenticateAdmin } from '../../middleware/auth.middleware.js';
import * as couponsController from '../../controllers/admin/coupons.controller.js';

const router = express.Router();

router.get('/', authenticateAdmin, couponsController.getAllCoupons);
router.get('/:id', authenticateAdmin, couponsController.getCouponById);
router.get('/:id/usage', authenticateAdmin, couponsController.getCouponUsage);
router.post('/', authenticateAdmin, couponsController.createCoupon);
router.put('/:id', authenticateAdmin, couponsController.updateCoupon);
router.delete('/:id', authenticateAdmin, couponsController.deleteCoupon);
router.put('/:id/activate', authenticateAdmin, couponsController.activateCoupon);
router.put('/:id/deactivate', authenticateAdmin, couponsController.deactivateCoupon);

export default router;

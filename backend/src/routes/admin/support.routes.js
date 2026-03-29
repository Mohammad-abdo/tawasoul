import express from 'express';
import { authenticateAdmin } from '../../middleware/auth.middleware.js';
import * as supportController from '../../controllers/admin/support.controller.js';

const router = express.Router();

router.get('/tickets', authenticateAdmin, supportController.getAllTickets);
router.get('/tickets/:id', authenticateAdmin, supportController.getTicketById);
router.post('/tickets/:id/replies', authenticateAdmin, supportController.addReply);
router.put('/tickets/:id/status', authenticateAdmin, supportController.updateTicketStatus);
router.put('/tickets/:id/assign', authenticateAdmin, supportController.assignTicket);

export default router;

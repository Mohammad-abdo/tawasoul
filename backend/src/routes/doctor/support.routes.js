import express from 'express';
import { authenticateDoctor } from '../../middleware/auth.middleware.js';
import * as supportController from '../../controllers/doctor/support.controller.js';

const router = express.Router();

router.use(authenticateDoctor);

router.get('/tickets', supportController.getMySupportTickets);
router.post('/tickets', supportController.createSupportTicket);
router.get('/tickets/:id', supportController.getSupportTicketById);
router.post('/tickets/:id/replies', supportController.addSupportReply);

export default router;

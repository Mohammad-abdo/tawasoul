import express from 'express';
import { body } from 'express-validator';
import { authenticateUserOrDoctor } from '../middleware/auth.middleware.js';
import { generateAgoraToken } from '../controllers/agora.controller.js';

const router = express.Router();

/**
 * @swagger
 * /agora/token:
 *   post:
 *     summary: Generate an Agora RTC token for a confirmed booking
 *     tags:
 *       - Realtime Sessions
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *             properties:
 *               bookingId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token generated successfully
 *       400:
 *         description: Invalid input or booking status
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Booking not found
 */
router.post(
  '/token',
  authenticateUserOrDoctor,
  body('bookingId').isString().trim().notEmpty().withMessage('bookingId is required'),
  generateAgoraToken
);

export default router;

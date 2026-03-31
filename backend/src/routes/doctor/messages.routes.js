import express from 'express';
import { authenticateDoctor } from '../../middleware/auth.middleware.js';
import { moderateTextMiddleware } from '../../middleware/moderateText.middleware.js';
import * as doctorMessagesController from '../../controllers/doctor/messages.controller.js';

const router = express.Router();

// كل الراوتس هنا محتاجة تسجيل دخول كطبيب
router.use(authenticateDoctor);

// جلب قائمة المحادثات (الصندوق الوارد للدكتور)
router.get('/conversations', doctorMessagesController.getDoctorConversations);

// جلب رسائل محادثة معينة مع يوزر (مريض)
router.get('/conversation/:userId', doctorMessagesController.getConversationMessages);

// إرسال رسالة من الدكتور لليوزر
router.post('/send', moderateTextMiddleware, doctorMessagesController.sendMessageToUser);

export default router;
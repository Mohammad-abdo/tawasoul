import express from 'express';
import { authenticateDoctor } from '../../middleware/auth.middleware.js';
import { moderateContentMiddleware } from '../../middleware/contentModeration.middleware.js';
import * as articlesController from '../../controllers/doctor/articles.controller.js';

const router = express.Router();

router.get('/', authenticateDoctor, articlesController.getDoctorArticles);
router.post('/', authenticateDoctor, moderateContentMiddleware, articlesController.createArticle);
router.put('/:id', authenticateDoctor, moderateContentMiddleware, articlesController.updateArticle);
router.delete('/:id', authenticateDoctor, articlesController.deleteArticle);

export default router;

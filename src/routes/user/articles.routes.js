import express from 'express';
import { authenticateUser } from '../../middleware/auth.middleware.js';
import * as articlesController from '../../controllers/user/articles.controller.js';

const router = express.Router();

router.get('/', authenticateUser, articlesController.getAllArticles);
router.get('/:id', authenticateUser, articlesController.getArticleById);

export default router;

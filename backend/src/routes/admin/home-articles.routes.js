import express from 'express';
import { authenticateAdmin } from '../../middleware/auth.middleware.js';
import { uploadSingleImage } from '../../middleware/upload.middleware.js';
import * as homeArticlesController from '../../controllers/admin/home-articles.controller.js';

const router = express.Router();

router.get('/', authenticateAdmin, homeArticlesController.getAllHomeArticles);
router.get('/:id', authenticateAdmin, homeArticlesController.getHomeArticleById);
router.post('/', authenticateAdmin, uploadSingleImage('image'), homeArticlesController.createHomeArticle);
router.put('/:id', authenticateAdmin, uploadSingleImage('image'), homeArticlesController.updateHomeArticle);
router.delete('/:id', authenticateAdmin, homeArticlesController.deleteHomeArticle);

export default router;

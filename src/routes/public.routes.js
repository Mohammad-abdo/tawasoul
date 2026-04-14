import express from 'express';
import pagesRoutes from './public/pages.routes.js';
import staticPagesRoutes from './public/static-pages.routes.js';
import homeRoutes from './public/home.routes.js';

const router = express.Router();

router.use('/pages', pagesRoutes);
router.use('/', staticPagesRoutes);
router.use('/', homeRoutes);

export default router;

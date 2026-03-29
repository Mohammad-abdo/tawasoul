import express from 'express';
import * as pagesController from '../../controllers/public/pages.controller.js';

const router = express.Router();

router.get('/', pagesController.getAllPages);
router.get('/:pageType', pagesController.getPageByType);

export default router;

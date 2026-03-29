import express from 'express';
import * as homeController from '../../controllers/public/home.controller.js';

const router = express.Router();

router.get('/home-data', homeController.getHomePageData);
router.get('/faqs', homeController.getFAQs);

export default router;

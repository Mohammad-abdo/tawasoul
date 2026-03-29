import express from 'express';
import * as staticPagesController from '../../controllers/public/static-pages.controller.js';

const router = express.Router();

router.get('/static-pages/:pageType', staticPagesController.getStaticPage);
router.get('/onboarding-slides', staticPagesController.getOnboardingSlides);
router.get('/onboarding', staticPagesController.getOnboardingPages);
router.get('/home-page-1', staticPagesController.getHomePage1);
router.get('/home-page-2', staticPagesController.getHomePage2);

export default router;

import express from 'express';
import * as pagesController from '../controllers/public/pages.controller.js';
import * as staticPagesController from '../controllers/public/static-pages.controller.js';
import * as homeController from '../controllers/public/home.controller.js';

const router = express.Router();

// ============================================
// Public Pages Routes
// ============================================

router.get('/pages', pagesController.getAllPages);
router.get('/pages/:pageType', pagesController.getPageByType);

// ============================================
// Static Pages & Onboarding Routes
// ============================================

router.get('/static-pages/:pageType', staticPagesController.getStaticPage);
router.get('/onboarding-slides', staticPagesController.getOnboardingSlides);
router.get('/onboarding', staticPagesController.getOnboardingPages); // Legacy
router.get('/home-page-1', staticPagesController.getHomePage1);
router.get('/home-page-2', staticPagesController.getHomePage2);

// ============================================
// Home Page Data Routes (for Mobile App)
// ============================================

router.get('/home-data', homeController.getHomePageData);
router.get('/faqs', homeController.getFAQs);

export default router;


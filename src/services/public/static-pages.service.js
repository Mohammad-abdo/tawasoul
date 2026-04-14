import * as staticPagesRepo from '../../repositories/public/static-pages.repository.js';
import { createHttpError } from '../../utils/httpError.js';

const ONBOARDING_SLIDE_SELECT = {
  id: true,
  image: true,
  title: true,
  titleAr: true,
  description: true,
  descriptionAr: true,
  order: true
};

const normalizePlatform = (platform = 'MOBILE') => platform.toUpperCase();

export const getStaticPage = async (pageType) => {
  const page = await staticPagesRepo.findStaticPageByType(pageType);

  if (!page) {
    throw createHttpError(404, 'PAGE_NOT_FOUND', 'Page not found');
  }

  if (!page.isActive) {
    throw createHttpError(404, 'PAGE_INACTIVE', 'Page is not active');
  }

  return { page };
};

export const getOnboardingSlides = async ({ platform = 'MOBILE' }) => {
  const slides = await staticPagesRepo.findOnboardingByPlatform(
    normalizePlatform(platform),
    ONBOARDING_SLIDE_SELECT
  );

  return slides.map((slide) => ({
    id: slide.id,
    imageUrl: slide.image || '',
    title: slide.titleAr || slide.title || '',
    description: slide.descriptionAr || slide.description || '',
    order: slide.order
  }));
};

export const getOnboardingPages = async ({ platform = 'MOBILE' }) => {
  const pages = await staticPagesRepo.findOnboardingByPlatform(normalizePlatform(platform));
  return { pages };
};

export const getHomePage1 = async () => {
  const page = await staticPagesRepo.findStaticPageByType('HOME_PAGE_1');
  if (!page || !page.isActive) {
    throw createHttpError(404, 'PAGE_NOT_FOUND', 'Home page 1 not found');
  }

  return {
    image: page.image,
    title: page.titleAr,
    titleEn: page.titleEn
  };
};

export const getHomePage2 = async () => {
  const page = await staticPagesRepo.findStaticPageByType('HOME_PAGE_2');
  if (!page || !page.isActive) {
    throw createHttpError(404, 'PAGE_NOT_FOUND', 'Home page 2 not found');
  }

  return {
    slider: page.sliderItems || [],
    title: page.titleAr,
    titleEn: page.titleEn,
    description: page.contentAr,
    descriptionEn: page.contentEn
  };
};

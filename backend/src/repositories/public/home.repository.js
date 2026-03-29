import { prisma } from '../../config/database.js';

export const findActiveSliders = () =>
  prisma.homeSlider.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    select: {
      id: true,
      titleAr: true,
      titleEn: true,
      descriptionAr: true,
      descriptionEn: true,
      image: true,
      buttonText: true,
      buttonLink: true
    }
  });

export const findActiveServices = () =>
  prisma.homeService.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    select: {
      id: true,
      titleAr: true,
      titleEn: true,
      descriptionAr: true,
      descriptionEn: true,
      image: true,
      link: true
    }
  });

export const findActiveArticles = () =>
  prisma.homeArticle.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    select: {
      id: true,
      titleAr: true,
      titleEn: true,
      descriptionAr: true,
      descriptionEn: true,
      image: true,
      link: true
    }
  });

export const findActiveFaqs = (where) =>
  prisma.fAQ.findMany({
    where,
    orderBy: { order: 'asc' },
    select: {
      id: true,
      questionAr: true,
      questionEn: true,
      answerAr: true,
      answerEn: true,
      category: true
    }
  });

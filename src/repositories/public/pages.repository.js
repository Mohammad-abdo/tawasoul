import { prisma } from '../../config/database.js';

export const findPageByType = (pageType) =>
  prisma.pageContent.findUnique({
    where: { pageType },
    select: {
      id: true,
      pageType: true,
      titleAr: true,
      titleEn: true,
      contentAr: true,
      contentEn: true,
      updatedAt: true
    }
  });

export const findAllPublicPages = (pageTypes) =>
  prisma.pageContent.findMany({
    where: {
      pageType: {
        in: pageTypes
      }
    },
    select: {
      pageType: true,
      titleAr: true,
      titleEn: true,
      updatedAt: true
    },
    orderBy: { createdAt: 'asc' }
  });

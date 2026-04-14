import { prisma } from '../../config/database.js';

export const findStaticPageByType = (pageType) =>
  prisma.staticPage.findUnique({
    where: { pageType }
  });

export const findOnboardingByPlatform = (platform, select) =>
  prisma.onboarding.findMany({
    where: {
      isActive: true,
      OR: [
        { platform: 'ALL' },
        { platform }
      ]
    },
    orderBy: { order: 'asc' },
    ...(select ? { select } : {})
  });

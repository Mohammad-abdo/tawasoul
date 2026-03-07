import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Get All Pages
 */
export const getAllPages = async (req, res, next) => {
  try {
    // Check database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (dbError) {
      logger.error('Database connection error:', dbError);
      return res.status(503).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Database connection failed'
        },
        data: { pages: [] }
      });
    }

    // Get all existing pages
    let pages = await prisma.pageContent.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        lastUpdatedByAdmin: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Define all required page types
    const requiredPageTypes = [
      { type: 'PRIVACY_POLICY', titleAr: 'سياسة الخصوصية', titleEn: 'Privacy Policy' },
      { type: 'TERMS_AND_CONDITIONS', titleAr: 'الشروط والأحكام', titleEn: 'Terms and Conditions' },
      { type: 'ABOUT_APP', titleAr: 'عن التطبيق', titleEn: 'About App' },
      { type: 'COMMUNITY_GUIDELINES', titleAr: 'إرشادات المجتمع', titleEn: 'Community Guidelines' },
      { type: 'HELP_CENTER', titleAr: 'مركز المساعدة', titleEn: 'Help Center' }
    ];

    // Get existing page types
    const existingPageTypes = pages.map(p => p.pageType);

    // Create missing pages
    const missingPages = requiredPageTypes.filter(
      reqPage => !existingPageTypes.includes(reqPage.type)
    );

    if (missingPages.length > 0) {
      // Get first admin if available, otherwise null
      let adminId = null;
      if (req.admin?.id) {
        adminId = req.admin.id;
      } else {
        try {
          const firstAdmin = await prisma.admin.findFirst({
            select: { id: true }
          });
          if (firstAdmin) {
            adminId = firstAdmin.id;
          }
        } catch (error) {
          logger.warn('Could not find admin for page creation:', error);
        }
      }
      
      for (const pageInfo of missingPages) {
        try {
          const newPage = await prisma.pageContent.create({
            data: {
              pageType: pageInfo.type,
              titleAr: pageInfo.titleAr,
              titleEn: pageInfo.titleEn,
              contentAr: `محتوى ${pageInfo.titleAr} باللغة العربية. يرجى تحديث هذا المحتوى.\n\nيمكنك إضافة محتوى مفصل هنا.`,
              contentEn: `Content for ${pageInfo.titleEn} in English. Please update this content.`,
              lastUpdatedBy: adminId
            },
            include: {
              lastUpdatedByAdmin: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          });
          pages.push(newPage);
          logger.info(`✅ Created missing page: ${pageInfo.type}`);
        } catch (error) {
          logger.error(`❌ Error creating page ${pageInfo.type}:`, error);
          // Continue with other pages even if one fails
        }
      }
      
      // Re-fetch all pages after creation to ensure consistency
      if (missingPages.length > 0) {
        pages = await prisma.pageContent.findMany({
          orderBy: { createdAt: 'desc' },
          include: {
            lastUpdatedByAdmin: {
              select: {
                id: true,
                name: true
              }
            }
          }
        });
      }
    }

    // Sort pages by type order
    const pageOrder = ['ABOUT_APP', 'PRIVACY_POLICY', 'TERMS_AND_CONDITIONS', 'COMMUNITY_GUIDELINES', 'HELP_CENTER'];
    pages.sort((a, b) => {
      const indexA = pageOrder.indexOf(a.pageType);
      const indexB = pageOrder.indexOf(b.pageType);
      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });

    res.json({
      success: true,
      data: { pages }
    });
  } catch (error) {
    logger.error('Get pages error:', error);
    next(error);
  }
};

/**
 * Get Page by Type
 */
export const getPageByType = async (req, res, next) => {
  try {
    const { pageType } = req.params;

    const page = await prisma.pageContent.findUnique({
      where: { pageType },
      include: {
        lastUpdatedByAdmin: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!page) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PAGE_NOT_FOUND',
          message: 'Page not found'
        }
      });
    }

    res.json({
      success: true,
      data: page
    });
  } catch (error) {
    logger.error('Get page error:', error);
    next(error);
  }
};

/**
 * Update Page Content
 */
export const updatePageContent = async (req, res, next) => {
  try {
    const { pageType } = req.params;
    const { title, titleAr, content, contentAr } = req.body;

    let page = await prisma.pageContent.findUnique({
      where: { pageType }
    });

    if (!page) {
      // Create if doesn't exist
      const pageTitles = {
        'PRIVACY_POLICY': { ar: 'سياسة الخصوصية', en: 'Privacy Policy' },
        'TERMS_AND_CONDITIONS': { ar: 'الشروط والأحكام', en: 'Terms and Conditions' },
        'ABOUT_APP': { ar: 'عن التطبيق', en: 'About App' },
        'COMMUNITY_GUIDELINES': { ar: 'إرشادات المجتمع', en: 'Community Guidelines' },
        'HELP_CENTER': { ar: 'مركز المساعدة', en: 'Help Center' }
      };

      const defaultTitle = pageTitles[pageType] || { ar: pageType, en: pageType };

      page = await prisma.pageContent.create({
        data: {
          pageType,
          titleEn: title || defaultTitle.en,
          titleAr: titleAr || defaultTitle.ar,
          contentEn: content || '',
          contentAr: contentAr || '',
          lastUpdatedBy: req.admin.id
        }
      });
    } else {
      // Update existing
      page = await prisma.pageContent.update({
        where: { pageType },
        data: {
          ...(title !== undefined && { titleEn: title }),
          ...(titleAr !== undefined && { titleAr }),
          ...(content !== undefined && { contentEn: content }),
          ...(contentAr !== undefined && { contentAr }),
          lastUpdatedBy: req.admin.id
        }
      });
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'UPDATE',
        entityType: 'PAGE_CONTENT',
        entityId: page.id,
        description: `Updated page content: ${pageType}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      data: page,
      message: 'Page content updated successfully'
    });
  } catch (error) {
    logger.error('Update page content error:', error);
    next(error);
  }
};

/**
 * Initialize Pages (Create all required pages if they don't exist)
 */
export const initializePages = async (req, res, next) => {
  try {
    const requiredPageTypes = [
      { type: 'PRIVACY_POLICY', titleAr: 'سياسة الخصوصية', titleEn: 'Privacy Policy' },
      { type: 'TERMS_AND_CONDITIONS', titleAr: 'الشروط والأحكام', titleEn: 'Terms and Conditions' },
      { type: 'ABOUT_APP', titleAr: 'عن التطبيق', titleEn: 'About App' },
      { type: 'COMMUNITY_GUIDELINES', titleAr: 'إرشادات المجتمع', titleEn: 'Community Guidelines' },
      { type: 'HELP_CENTER', titleAr: 'مركز المساعدة', titleEn: 'Help Center' }
    ];

    const existingPages = await prisma.pageContent.findMany({
      select: { pageType: true }
    });

    const existingPageTypes = existingPages.map(p => p.pageType);
    const missingPages = requiredPageTypes.filter(
      reqPage => !existingPageTypes.includes(reqPage.type)
    );

    const createdPages = [];

    for (const pageInfo of missingPages) {
      try {
        const newPage = await prisma.pageContent.create({
          data: {
            pageType: pageInfo.type,
            titleAr: pageInfo.titleAr,
            titleEn: pageInfo.titleEn,
            contentAr: `محتوى ${pageInfo.titleAr} باللغة العربية. يرجى تحديث هذا المحتوى.`,
            contentEn: `Content for ${pageInfo.titleEn} in English. Please update this content.`,
            lastUpdatedBy: req.admin?.id || null
          }
        });
        createdPages.push(newPage);
      } catch (error) {
        logger.error(`Error creating page ${pageInfo.type}:`, error);
      }
    }

    res.json({
      success: true,
      message: `Created ${createdPages.length} pages`,
      data: { createdPages }
    });
  } catch (error) {
    logger.error('Initialize pages error:', error);
    next(error);
  }
};

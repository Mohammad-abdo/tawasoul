import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Get All Articles
 */
export const getAllArticles = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      recommended,
      sort = 'latest',
      search
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = {};

    if (recommended === 'true') {
      where.isRecommended = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { excerpt: { contains: search } }
      ];
    }

    // Build orderBy
    let orderBy = {};
    switch (sort) {
      case 'latest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'popular':
        orderBy = { views: 'desc' };
        break;
      case 'featured':
        orderBy = [{ isFeatured: 'desc' }, { featuredOrder: 'asc' }];
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Get articles
    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              specialization: true,
              avatar: true,
              isVerified: true
            }
          }
        }
      }),
      prisma.article.count({ where })
    ]);

    // Format response
    const formattedArticles = articles.map(article => ({
      id: article.id,
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      author: article.author,
      views: article.views,
      likes: article.likes,
      comments: article.comments,
      isRecommended: article.isRecommended,
      isFeatured: article.isFeatured,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt
    }));

    res.json({
      success: true,
      data: {
        articles: formattedArticles,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Get articles error:', error);
    next(error);
  }
};

/**
 * Get Article by ID
 */
export const getArticleById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            specialization: true,
            avatar: true,
            isVerified: true,
            rating: true
          }
        }
      }
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ARTICLE_NOT_FOUND',
          message: 'Article not found'
        }
      });
    }

    // Increment views
    await prisma.article.update({
      where: { id },
      data: {
        views: {
          increment: 1
        }
      }
    });

    const formattedArticle = {
      id: article.id,
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      author: article.author,
      views: article.views + 1, // Incremented view
      likes: article.likes,
      comments: article.comments,
      isRecommended: article.isRecommended,
      isFeatured: article.isFeatured,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt
    };

    res.json({
      success: true,
      data: formattedArticle
    });
  } catch (error) {
    logger.error('Get article error:', error);
    next(error);
  }
};


import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

const formatAuthor = (author) => {
  if (!author) {
    return author;
  }

  return {
    ...author,
    specialization: author.specialization ?? author.specialties?.[0]?.specialty ?? null
  };
};

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
              specialties: {
                select: {
                  specialty: true
                },
                take: 1
              },
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
      author: formatAuthor(article.author),
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
            specialties: {
              select: {
                specialty: true
              },
              take: 1
            },
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
      author: formatAuthor(article.author),
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

/**
 * Add Article Comment
 */
export const addArticleComment = async (req, res, next) => {
  try {
    const { id: articleId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Comment content is required' }
      });
    }

    const article = await prisma.article.findUnique({ where: { id: articleId } });
    if (!article) {
      return res.status(404).json({
        success: false,
        error: { code: 'ARTICLE_NOT_FOUND', message: 'Article not found' }
      });
    }

    const comment = await prisma.articleComment.create({
      data: {
        articleId,
        userId,
        content: content.trim()
      },
      include: {
        user: {
          select: { id: true, fullName: true, avatar: true }
        }
      }
    });

    await prisma.article.update({
      where: { id: articleId },
      data: { comments: { increment: 1 } }
    });

    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    logger.error('Add article comment error:', error);
    next(error);
  }
};

/**
 * Delete Article Comment
 */
export const deleteArticleComment = async (req, res, next) => {
  try {
    const { id: articleId } = req.params;
    const userId = req.user.id;

    const comment = await prisma.articleComment.findFirst({
      where: { articleId, userId }
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: { code: 'COMMENT_NOT_FOUND', message: 'Comment not found' }
      });
    }

    await prisma.articleComment.delete({
      where: { id: comment.id }
    });

    await prisma.article.update({
      where: { id: articleId },
      data: { comments: { decrement: 1 } }
    });

    res.json({
      success: true,
      message: 'Comment deleted'
    });
  } catch (error) {
    logger.error('Delete article comment error:', error);
    next(error);
  }
};

/**
 * Add Article Like
 */
export const addArticleLike = async (req, res, next) => {
  try {
    const { id: articleId } = req.params;

    const article = await prisma.article.findUnique({ where: { id: articleId } });
    if (!article) {
      return res.status(404).json({
        success: false,
        error: { code: 'ARTICLE_NOT_FOUND', message: 'Article not found' }
      });
    }

    await prisma.article.update({
      where: { id: articleId },
      data: { likes: { increment: 1 } }
    });

    res.json({
      success: true,
      message: 'Article liked'
    });
  } catch (error) {
    logger.error('Add article like error:', error);
    next(error);
  }
};


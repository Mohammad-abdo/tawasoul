import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Toggle Like on Post
 */
export const toggleLike = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'POST_NOT_FOUND',
          message: 'Post not found'
        }
      });
    }

    // Check if like exists
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId
        }
      }
    });

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: {
          postId_userId: {
            postId,
            userId
          }
        }
      });

      logger.info(`Post unliked: ${postId} by user ${userId}`);

      res.json({
        success: true,
        data: {
          liked: false,
          message: 'Post unliked'
        }
      });
    } else {
      // Like
      await prisma.like.create({
        data: {
          postId,
          userId
        }
      });

      logger.info(`Post liked: ${postId} by user ${userId}`);

      res.json({
        success: true,
        data: {
          liked: true,
          message: 'Post liked'
        }
      });
    }
  } catch (error) {
    logger.error('Toggle like error:', error);
    next(error);
  }
};

/**
 * Get Post Likes
 */
export const getPostLikes = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'POST_NOT_FOUND',
          message: 'Post not found'
        }
      });
    }

    // Get likes
    const [likes, total] = await Promise.all([
      prisma.like.findMany({
        where: { postId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          }
        }
      }),
      prisma.like.count({ where: { postId } })
    ]);

    res.json({
      success: true,
      data: {
        likes: likes.map(like => ({
          id: like.id,
          user: like.user,
          createdAt: like.createdAt
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Get likes error:', error);
    next(error);
  }
};


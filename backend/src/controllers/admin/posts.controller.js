import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Get All Posts
 */
export const getAllPosts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      isSensitive,
      status,
      sort = 'createdAt'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (isSensitive !== undefined) {
      where.isSensitive = isSensitive === 'true';
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sort]: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          },
          _count: {
            select: {
              likes: true,
              comments: true
            }
          }
        }
      }),
      prisma.post.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Get posts error:', error);
    next(error);
  }
};

/**
 * Moderate Post
 */
export const moderatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isSensitive, status } = req.body;

    const post = await prisma.post.findUnique({ where: { id } });

    if (!post) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'POST_NOT_FOUND',
          message: 'Post not found'
        }
      });
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        ...(isSensitive !== undefined && { isSensitive }),
        ...(status && { status })
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'MODERATE',
        entityType: 'POST',
        entityId: id,
        description: `Moderated post by ${post.authorId}`,
        changes: { isSensitive, status },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      data: updatedPost,
      message: 'Post moderated successfully'
    });
  } catch (error) {
    logger.error('Moderate post error:', error);
    next(error);
  }
};

/**
 * Delete Post
 */
export const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({ where: { id } });

    if (!post) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'POST_NOT_FOUND',
          message: 'Post not found'
        }
      });
    }

    await prisma.post.delete({ where: { id } });

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'DELETE',
        entityType: 'POST',
        entityId: id,
        description: `Deleted post by ${post.authorId}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    logger.error('Delete post error:', error);
    next(error);
  }
};



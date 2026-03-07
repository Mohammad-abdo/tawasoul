import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Get Post Comments
 */
export const getPostComments = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query;

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

    // Get comments
    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { postId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true,
              isAnonymous: true
            }
          }
        }
      }),
      prisma.comment.count({ where: { postId } })
    ]);

    // Format comments
    const formattedComments = comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      author: comment.author.isAnonymous ? {
        id: null,
        username: 'مجهول',
        avatar: null
      } : comment.author,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt
    }));

    res.json({
      success: true,
      data: {
        comments: formattedComments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Get comments error:', error);
    next(error);
  }
};

/**
 * Create Comment
 */
export const createComment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;
    const { content } = req.body;

    // Validation
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Content is required'
        }
      });
    }

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

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        postId,
        authorId: userId
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
            isAnonymous: true
          }
        }
      }
    });

    logger.info(`Comment created: ${comment.id} by user ${userId}`);

    res.status(201).json({
      success: true,
      data: {
        id: comment.id,
        content: comment.content,
        author: comment.author.isAnonymous ? {
          id: null,
          username: 'مجهول',
          avatar: null
        } : comment.author,
        createdAt: comment.createdAt
      }
    });
  } catch (error) {
    logger.error('Create comment error:', error);
    next(error);
  }
};

/**
 * Delete Comment
 */
export const deleteComment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { commentId } = req.params;

    // Check if comment exists and belongs to user
    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'COMMENT_NOT_FOUND',
          message: 'Comment not found'
        }
      });
    }

    if (comment.authorId !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only delete your own comments'
        }
      });
    }

    // Delete comment
    await prisma.comment.delete({
      where: { id: commentId }
    });

    logger.info(`Comment deleted: ${commentId} by user ${userId}`);

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    logger.error('Delete comment error:', error);
    next(error);
  }
};


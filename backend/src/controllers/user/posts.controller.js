import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Get All Posts
 */
export const getAllPosts = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const {
      page = 1,
      limit = 20,
      interest,
      feeling,
      sort = 'latest',
      search
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = {};

    if (interest) {
      where.interests = {
        some: {
          interestId: interest
        }
      };
    }

    if (feeling) {
      where.feeling = feeling;
    }

    if (search) {
      where.OR = [
        { content: { contains: search } },
        { title: { contains: search } }
      ];
    }

    // Build orderBy
    let orderBy = {};
    switch (sort) {
      case 'latest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'popular':
        orderBy = { likes: { _count: 'desc' } };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Get posts
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true,
              isAnonymous: true
            }
          },
          tags: {
            include: {
              tag: true
            }
          },
          interests: {
            include: {
              interest: true
            }
          },
          _count: {
            select: {
              comments: true,
              likes: true
            }
          },
          likes: userId ? {
            where: {
              userId
            },
            select: {
              userId: true
            }
          } : false
        }
      }),
      prisma.post.count({ where })
    ]);

    // Format response
    const formattedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      feeling: post.feeling,
      isSensitive: post.isSensitive,
      isFeatured: post.isFeatured,
      author: post.author.isAnonymous ? {
        id: null,
        username: 'مجهول',
        avatar: null
      } : post.author,
      tags: post.tags.map(pt => pt.tag),
      interests: post.interests.map(pi => pi.interest),
      stats: {
        comments: post._count.comments,
        likes: post._count.likes
      },
      isLiked: post.likes && post.likes.length > 0,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    }));

    res.json({
      success: true,
      data: {
        posts: formattedPosts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Get posts error:', error);
    next(error);
  }
};

/**
 * Get Single Post
 */
export const getPostById = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
            isAnonymous: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        },
        interests: {
          include: {
            interest: true
          }
        },
        comments: {
          take: 10,
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
        },
        _count: {
          select: {
            comments: true,
            likes: true
          }
        },
        likes: userId ? {
          where: {
            userId
          },
          select: {
            userId: true
          }
        } : false
      }
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

    const formattedPost = {
      id: post.id,
      title: post.title,
      content: post.content,
      feeling: post.feeling,
      isSensitive: post.isSensitive,
      isFeatured: post.isFeatured,
      author: post.author.isAnonymous ? {
        id: null,
        username: 'مجهول',
        avatar: null
      } : post.author,
      tags: post.tags.map(pt => pt.tag),
      interests: post.interests.map(pi => pi.interest),
      comments: post.comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        author: comment.author.isAnonymous ? {
          id: null,
          username: 'مجهول',
          avatar: null
        } : comment.author,
        createdAt: comment.createdAt
      })),
      stats: {
        comments: post._count.comments,
        likes: post._count.likes
      },
      isLiked: post.likes && post.likes.length > 0,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    };

    res.json({
      success: true,
      data: formattedPost
    });
  } catch (error) {
    logger.error('Get post error:', error);
    next(error);
  }
};

/**
 * Create Post
 */
export const createPost = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      title,
      content,
      feeling = 'NORMAL',
      tags = [],
      interests = [],
      allowPrivateMsg = false
    } = req.body;

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

    if (content.length > 2000) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Content must be less than 2000 characters'
        }
      });
    }

    // Create or find tags
    const tagConnections = await Promise.all(
      tags.map(async (tagName) => {
        const tag = await prisma.tag.upsert({
          where: { name: tagName },
          update: {},
          create: { name: tagName }
        });
        return { id: tag.id };
      })
    );

    // Find interests
    const interestConnections = interests.map(interestId => ({
      id: interestId
    }));

    // Create post
    const post = await prisma.post.create({
      data: {
        title: title || null,
        content: content.trim(),
        feeling,
        allowPrivateMsg,
        authorId: userId,
        tags: {
          create: tagConnections.map(tag => ({
            tag: { connect: { id: tag.id } }
          }))
        },
        interests: {
          create: interestConnections.map(interest => ({
            interest: { connect: { id: interest.id } }
          }))
        }
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        },
        interests: {
          include: {
            interest: true
          }
        }
      }
    });

    logger.info(`Post created: ${post.id} by user ${userId}`);

    res.status(201).json({
      success: true,
      message: 'تم نشر المنشور بنجاح',
      data: {
        id: post.id,
        title: post.title,
        content: post.content,
        feeling: post.feeling,
        author: post.author,
        tags: post.tags.map(pt => pt.tag),
        interests: post.interests.map(pi => pi.interest),
        createdAt: post.createdAt
      }
    });
  } catch (error) {
    logger.error('Create post error:', error);
    next(error);
  }
};

/**
 * Update Post
 */
export const updatePost = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const {
      title,
      content,
      feeling,
      tags,
      interests,
      allowPrivateMsg
    } = req.body;

    // Check if post exists and belongs to user
    const post = await prisma.post.findUnique({
      where: { id }
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

    if (post.authorId !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only update your own posts'
        }
      });
    }

    // Build update data
    const updateData = {};

    if (title !== undefined) updateData.title = title;
    if (content !== undefined) {
      if (content.length > 2000) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Content must be less than 2000 characters'
          }
        });
      }
      updateData.content = content.trim();
    }
    if (feeling !== undefined) updateData.feeling = feeling;
    if (allowPrivateMsg !== undefined) updateData.allowPrivateMsg = allowPrivateMsg;

    // Update tags if provided
    if (tags) {
      // Delete existing tags
      await prisma.postTag.deleteMany({
        where: { postId: id }
      });

      // Create or find new tags
      const tagConnections = await Promise.all(
        tags.map(async (tagName) => {
          const tag = await prisma.tag.upsert({
            where: { name: tagName },
            update: {},
            create: { name: tagName }
          });
          return { id: tag.id };
        })
      );

      // Create new tag connections
      await prisma.postTag.createMany({
        data: tagConnections.map(tag => ({
          postId: id,
          tagId: tag.id
        }))
      });
    }

    // Update interests if provided
    if (interests) {
      // Delete existing interests
      await prisma.postInterest.deleteMany({
        where: { postId: id }
      });

      // Create new interest connections
      await prisma.postInterest.createMany({
        data: interests.map(interestId => ({
          postId: id,
          interestId
        }))
      });
    }

    // Update post
    const updatedPost = await prisma.post.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        },
        interests: {
          include: {
            interest: true
          }
        }
      }
    });

    logger.info(`Post updated: ${id} by user ${userId}`);

    res.json({
      success: true,
      message: 'تم تحديث المنشور بنجاح',
      data: {
        id: updatedPost.id,
        title: updatedPost.title,
        content: updatedPost.content,
        feeling: updatedPost.feeling,
        author: updatedPost.author,
        tags: updatedPost.tags.map(pt => pt.tag),
        interests: updatedPost.interests.map(pi => pi.interest),
        updatedAt: updatedPost.updatedAt
      }
    });
  } catch (error) {
    logger.error('Update post error:', error);
    next(error);
  }
};

/**
 * Delete Post
 */
export const deletePost = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Check if post exists and belongs to user
    const post = await prisma.post.findUnique({
      where: { id }
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

    if (post.authorId !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only delete your own posts'
        }
      });
    }

    // Delete post (cascade will handle related records)
    await prisma.post.delete({
      where: { id }
    });

    logger.info(`Post deleted: ${id} by user ${userId}`);

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    logger.error('Delete post error:', error);
    next(error);
  }
};


import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Get All Tags
 */
export const getAllTags = async (req, res, next) => {
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
        data: {
          tags: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
        }
      });
    }

    const {
      page = 1,
      limit = 20,
      search = '',
      popular = false,
      sort = 'createdAt'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    let orderBy = { [sort]: 'desc' };
    if (popular) {
      orderBy = { posts: { _count: 'desc' } };
    }

    const [tags, total] = await Promise.all([
      prisma.tag.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy,
        include: {
          _count: {
            select: {
              posts: true
            }
          }
        }
      }),
      prisma.tag.count({ where })
    ]);

    const tagsWithCount = tags.map(tag => ({
      ...tag,
      usageCount: tag._count.posts
    }));

    res.json({
      success: true,
      data: {
        tags: tagsWithCount,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Get tags error:', error);
    next(error);
  }
};

/**
 * Get Tag by ID
 */
export const getTagById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        posts: {
          take: 10,
          orderBy: { post: { createdAt: 'desc' } },
          include: {
            post: {
              include: {
                author: {
                  select: {
                    id: true,
                    username: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            posts: true
          }
        }
      }
    });

    if (!tag) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TAG_NOT_FOUND',
          message: 'Tag not found'
        }
      });
    }

    // Transform the data to flatten the post structure
    const transformedTag = {
      ...tag,
      posts: tag.posts.map(postTag => ({
        ...postTag.post,
        postTagId: postTag.id
      }))
    };

    res.json({
      success: true,
      data: transformedTag
    });
  } catch (error) {
    logger.error('Get tag error:', error);
    next(error);
  }
};

/**
 * Create Tag
 */
export const createTag = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Tag name is required'
        }
      });
    }

    // Check if tag exists
    const existingTag = await prisma.tag.findUnique({
      where: { name }
    });

    if (existingTag) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'TAG_EXISTS',
          message: 'Tag already exists'
        }
      });
    }

    const tag = await prisma.tag.create({
      data: { name }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'CREATE',
        entityType: 'TAG',
        entityId: tag.id,
        description: `Created tag: ${tag.name}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.status(201).json({
      success: true,
      data: tag,
      message: 'Tag created successfully'
    });
  } catch (error) {
    logger.error('Create tag error:', error);
    next(error);
  }
};

/**
 * Update Tag
 */
export const updateTag = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Tag name is required'
        }
      });
    }

    const tag = await prisma.tag.findUnique({ where: { id } });

    if (!tag) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TAG_NOT_FOUND',
          message: 'Tag not found'
        }
      });
    }

    // Check if new name exists
    const existingTag = await prisma.tag.findUnique({
      where: { name }
    });

    if (existingTag && existingTag.id !== id) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'TAG_EXISTS',
          message: 'Tag name already exists'
        }
      });
    }

    const updatedTag = await prisma.tag.update({
      where: { id },
      data: { name }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'UPDATE',
        entityType: 'TAG',
        entityId: id,
        description: `Updated tag: ${updatedTag.name}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      data: updatedTag,
      message: 'Tag updated successfully'
    });
  } catch (error) {
    logger.error('Update tag error:', error);
    next(error);
  }
};

/**
 * Delete Tag
 */
export const deleteTag = async (req, res, next) => {
  try {
    const { id } = req.params;

    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      }
    });

    if (!tag) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TAG_NOT_FOUND',
          message: 'Tag not found'
        }
      });
    }

    await prisma.tag.delete({ where: { id } });

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'DELETE',
        entityType: 'TAG',
        entityId: id,
        description: `Deleted tag: ${tag.name}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      message: 'Tag deleted successfully'
    });
  } catch (error) {
    logger.error('Delete tag error:', error);
    next(error);
  }
};

/**
 * Get Popular Tags
 */
export const getPopularTags = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const tags = await prisma.tag.findMany({
      take: limit,
      orderBy: {
        posts: {
          _count: 'desc'
        }
      },
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      }
    });

    const tagsWithCount = tags.map(tag => ({
      ...tag,
      usageCount: tag._count.posts
    }));

    res.json({
      success: true,
      data: tagsWithCount
    });
  } catch (error) {
    logger.error('Get popular tags error:', error);
    next(error);
  }
};

/**
 * Get Posts by Tag
 */
export const getTagPosts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        posts: {
          skip,
          take: parseInt(limit),
          orderBy: { post: { createdAt: 'desc' } },
          include: {
            post: {
              include: {
                author: {
                  select: {
                    id: true,
                    username: true,
                    avatar: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            posts: true
          }
        }
      }
    });

    if (!tag) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TAG_NOT_FOUND',
          message: 'Tag not found'
        }
      });
    }

    // Transform the data to flatten the post structure
    const transformedPosts = tag.posts.map(postTag => ({
      ...postTag.post,
      postTagId: postTag.id
    }));

    res.json({
      success: true,
      data: {
        tag: {
          id: tag.id,
          name: tag.name
        },
        posts: transformedPosts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: tag._count.posts,
          totalPages: Math.ceil(tag._count.posts / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Get tag posts error:', error);
    next(error);
  }
};

/**
 * Merge Tags
 */
export const mergeTags = async (req, res, next) => {
  try {
    const { sourceTagIds, targetTagId } = req.body;

    if (!sourceTagIds || !Array.isArray(sourceTagIds) || sourceTagIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Source tag IDs are required'
        }
      });
    }

    if (!targetTagId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Target tag ID is required'
        }
      });
    }

    const targetTag = await prisma.tag.findUnique({
      where: { id: targetTagId }
    });

    if (!targetTag) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TAG_NOT_FOUND',
          message: 'Target tag not found'
        }
      });
    }

    // Get all posts with source tags
    const sourceTags = await prisma.tag.findMany({
      where: {
        id: { in: sourceTagIds }
      },
      include: {
        posts: {
          select: {
            id: true
          }
        }
      }
    });

    // Merge: Add target tag to all posts that have source tags, then remove source tags
    for (const sourceTag of sourceTags) {
      for (const post of sourceTag.posts) {
        // Add target tag if not already present
        await prisma.postTag.upsert({
          where: {
            postId_tagId: {
              postId: post.id,
              tagId: targetTagId
            }
          },
          update: {},
          create: {
            postId: post.id,
            tagId: targetTagId
          }
        });
      }

      // Delete source tag
      await prisma.tag.delete({
        where: { id: sourceTag.id }
      });
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'MERGE',
        entityType: 'TAG',
        entityId: targetTagId,
        description: `Merged tags ${sourceTagIds.join(', ')} into ${targetTag.name}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      message: 'Tags merged successfully'
    });
  } catch (error) {
    logger.error('Merge tags error:', error);
    next(error);
  }
};


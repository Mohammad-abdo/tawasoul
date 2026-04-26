import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Get all products
 */
export const getProducts = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      category,
      featured,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {
      isActive: true
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameAr: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { descriptionAr: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (category) {
      where.category = category;
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          _count: {
            select: {
              reviews: true
            }
          }
        }
      }),
      prisma.product.count({ where })
    ]);

    // Format products
    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      nameAr: product.nameAr,
      description: product.description,
      descriptionAr: product.descriptionAr,
      images: product.images ? (typeof product.images === 'string' ? JSON.parse(product.images) : product.images) : [],
      price: product.price,
      priceBeforeDiscount: product.priceBeforeDiscount,
      discount: product.discount,
      rating: product.rating,
      totalRatings: product.totalRatings,
      reviewsCount: product._count.reviews,
      stock: product.stock,
      category: product.category,
      isFeatured: product.isFeatured,
      createdAt: product.createdAt
    }));

    res.json({
      success: true,
      data: {
        products: formattedProducts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Get products error:', error);
    next(error);
  }
};

/**
 * Get product by ID
 */
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10 // Last 10 reviews
        },
        _count: {
          select: {
            reviews: true
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found'
        }
      });
    }

    // Format reviews
    const formattedReviews = product.reviews.map(review => ({
      id: review.id,
      user: review.user,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt
    }));

    res.json({
      success: true,
      data: {
        id: product.id,
        name: product.name,
        nameAr: product.nameAr,
        description: product.description,
        descriptionAr: product.descriptionAr,
        images: product.images ? (typeof product.images === 'string' ? JSON.parse(product.images) : product.images) : [],
        price: product.price,
        priceBeforeDiscount: product.priceBeforeDiscount,
        discount: product.discount,
        rating: product.rating,
        totalRatings: product.totalRatings,
        reviewsCount: product._count.reviews,
        stock: product.stock,
        category: product.category,
        reviews: formattedReviews,
        createdAt: product.createdAt
      }
    });
  } catch (error) {
    logger.error('Get product error:', error);
    next(error);
  }
};

/**
 * Add product review
 */
export const addProductReview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { rating, comment } = req.body;

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Rating must be between 1 and 5'
        }
      });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found'
        }
      });
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.productReview.findUnique({
      where: {
        productId_userId: {
          productId: id,
          userId
        }
      }
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'REVIEW_EXISTS',
          message: 'You have already reviewed this product'
        }
      });
    }

    // Create review
    const review = await prisma.productReview.create({
      data: {
        productId: id,
        userId,
        rating: parseInt(rating),
        comment: comment || null
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatar: true
          }
        }
      }
    });

    // Update product rating
    const allReviews = await prisma.productReview.findMany({
      where: { productId: id },
      select: { rating: true }
    });

    const totalRatings = allReviews.length;
    const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / totalRatings;

    await prisma.product.update({
      where: { id },
      data: {
        rating: averageRating,
        totalRatings
      }
    });

    logger.info(`Product review added: ${review.id} for product ${id}`);

    res.status(201).json({
      success: true,
      data: {
        id: review.id,
        user: review.user,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt
      }
    });
  } catch (error) {
    logger.error('Add product review error:', error);
    next(error);
  }
};


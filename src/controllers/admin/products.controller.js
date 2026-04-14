import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Get All Products (Admin)
 */
export const getAllProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, category, isActive } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameAr: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (category) where.category = category;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              reviews: true,
              cartItems: true,
              orderItems: true
            }
          }
        }
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Get all products error:', error);
    next(error);
  }
};

/**
 * Get Product by ID (Admin)
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
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            reviews: true,
            cartItems: true,
            orderItems: true
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

    res.json({
      success: true,
      data: { product }
    });
  } catch (error) {
    logger.error('Get product error:', error);
    next(error);
  }
};

/**
 * Create Product (Admin)
 */
export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      nameAr,
      description,
      descriptionAr,
      images,
      price,
      priceBeforeDiscount,
      discount,
      stock,
      category,
      isActive = true,
      isFeatured = false
    } = req.body;

    // Validation
    if (!name || !nameAr || !price || !images || !Array.isArray(images)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Name, nameAr, price, and images array are required'
        }
      });
    }

    const product = await prisma.product.create({
      data: {
        name,
        nameAr,
        description: description || null,
        descriptionAr: descriptionAr || null,
        images,
        price: parseFloat(price),
        priceBeforeDiscount: priceBeforeDiscount ? parseFloat(priceBeforeDiscount) : null,
        discount: discount ? parseFloat(discount) : null,
        stock: stock ? parseInt(stock) : 0,
        category: category || null,
        isActive,
        isFeatured
      }
    });

    logger.info(`Product created: ${product.id}`);

    res.status(201).json({
      success: true,
      data: { product }
    });
  } catch (error) {
    logger.error('Create product error:', error);
    next(error);
  }
};

/**
 * Update Product (Admin)
 */
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

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

    // Prepare update data
    const data = {};
    if (updateData.name) data.name = updateData.name;
    if (updateData.nameAr) data.nameAr = updateData.nameAr;
    if (updateData.description !== undefined) data.description = updateData.description;
    if (updateData.descriptionAr !== undefined) data.descriptionAr = updateData.descriptionAr;
    if (updateData.images) data.images = updateData.images;
    if (updateData.price) data.price = parseFloat(updateData.price);
    if (updateData.priceBeforeDiscount !== undefined) data.priceBeforeDiscount = updateData.priceBeforeDiscount ? parseFloat(updateData.priceBeforeDiscount) : null;
    if (updateData.discount !== undefined) data.discount = updateData.discount ? parseFloat(updateData.discount) : null;
    if (updateData.stock !== undefined) data.stock = parseInt(updateData.stock);
    if (updateData.category !== undefined) data.category = updateData.category;
    if (updateData.isActive !== undefined) data.isActive = updateData.isActive;
    if (updateData.isFeatured !== undefined) data.isFeatured = updateData.isFeatured;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data
    });

    logger.info(`Product updated: ${id}`);

    res.json({
      success: true,
      data: { product: updatedProduct }
    });
  } catch (error) {
    logger.error('Update product error:', error);
    next(error);
  }
};

/**
 * Delete Product (Admin)
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

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

    await prisma.product.delete({
      where: { id }
    });

    logger.info(`Product deleted: ${id}`);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    logger.error('Delete product error:', error);
    next(error);
  }
};

/**
 * Activate Product (Admin)
 */
export const activateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.update({
      where: { id },
      data: { isActive: true }
    });

    logger.info(`Product activated: ${id}`);

    res.json({
      success: true,
      data: { product }
    });
  } catch (error) {
    logger.error('Activate product error:', error);
    next(error);
  }
};

/**
 * Deactivate Product (Admin)
 */
export const deactivateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.update({
      where: { id },
      data: { isActive: false }
    });

    logger.info(`Product deactivated: ${id}`);

    res.json({
      success: true,
      data: { product }
    });
  } catch (error) {
    logger.error('Deactivate product error:', error);
    next(error);
  }
};


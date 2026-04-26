import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';
import { getFileUrl } from '../../middleware/upload.middleware.js';

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

    const parsedProducts = products.map(p => ({
      ...p,
      images: p.images ? (typeof p.images === 'string' ? JSON.parse(p.images) : p.images) : []
    }));

    res.json({
      success: true,
      data: {
        products: parsedProducts,
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

    if (product.images && typeof product.images === 'string') {
      try {
        product.images = JSON.parse(product.images);
      } catch (e) {
        product.images = [];
      }
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
      priceBeforeDiscount,
      discount,
      discountType = 'PERCENTAGE',
      stock,
      category,
      isActive = true,
      isFeatured = false
    } = req.body;

    // Handle images from Multer
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => getFileUrl(req, file.filename, 'products'));
    } else if (req.body.images) {
      // Fallback to URL strings if provided (e.g. from existing images in update)
      imageUrls = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }

    // Validation
    if (!name || !nameAr || !priceBeforeDiscount) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Name, nameAr, and priceBeforeDiscount are required'
        }
      });
    }

    // Calculate final price
    const basePrice = parseFloat(priceBeforeDiscount);
    const discValue = discount ? parseFloat(discount) : 0;
    let finalPrice = basePrice;

    if (discountType === 'PERCENTAGE') {
      finalPrice = basePrice * (1 - discValue / 100);
    } else if (discountType === 'FIXED') {
      finalPrice = Math.max(0, basePrice - discValue);
    }

    const product = await prisma.product.create({
      data: {
        name,
        nameAr,
        description: description || null,
        descriptionAr: descriptionAr || null,
        images: JSON.stringify(imageUrls),
        price: finalPrice,
        priceBeforeDiscount: basePrice,
        discount: discValue,
        discountType,
        stock: stock ? parseInt(stock) : 0,
        categoryId: category || null,
        isActive: isActive === 'true' || isActive === true,
        isFeatured: isFeatured === 'true' || isFeatured === true
      }
    });

    logger.info(`Product created: ${product.id}`);

    res.status(201).json({
      success: true,
      data: { product: { ...product, images: imageUrls } }
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

    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found'
        }
      });
    }

    // Handle images from Multer
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => getFileUrl(req, file.filename, 'products'));
    } else if (updateData.images) {
      imageUrls = Array.isArray(updateData.images) ? updateData.images : [updateData.images];
    } else {
      // Keep existing images if not provided
      imageUrls = typeof existingProduct.images === 'string' ? JSON.parse(existingProduct.images) : [];
    }

    // Prepare update data
    const data = {};
    if (updateData.name) data.name = updateData.name;
    if (updateData.nameAr) data.nameAr = updateData.nameAr;
    if (updateData.description !== undefined) data.description = updateData.description;
    if (updateData.descriptionAr !== undefined) data.descriptionAr = updateData.descriptionAr;
    data.images = JSON.stringify(imageUrls);
    
    // Pricing logic
    const basePrice = updateData.priceBeforeDiscount !== undefined 
      ? parseFloat(updateData.priceBeforeDiscount) 
      : existingProduct.priceBeforeDiscount;
    
    const discValue = updateData.discount !== undefined 
      ? parseFloat(updateData.discount) 
      : existingProduct.discount;
    
    const discType = updateData.discountType !== undefined 
      ? updateData.discountType 
      : existingProduct.discountType;

    if (updateData.priceBeforeDiscount !== undefined || updateData.discount !== undefined || updateData.discountType !== undefined) {
      data.priceBeforeDiscount = basePrice;
      data.discount = discValue;
      data.discountType = discType;
      
      let finalPrice = basePrice;
      if (discType === 'PERCENTAGE') {
        finalPrice = basePrice * (1 - (discValue || 0) / 100);
      } else if (discType === 'FIXED') {
        finalPrice = Math.max(0, basePrice - (discValue || 0));
      }
      data.price = finalPrice;
    }

    if (updateData.stock !== undefined) data.stock = parseInt(updateData.stock);
    if (updateData.category !== undefined) data.categoryId = updateData.category || null;
    if (updateData.isActive !== undefined) data.isActive = updateData.isActive === 'true' || updateData.isActive === true;
    if (updateData.isFeatured !== undefined) data.isFeatured = updateData.isFeatured === 'true' || updateData.isFeatured === true;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data
    });

    logger.info(`Product updated: ${id}`);

    res.json({
      success: true,
      data: { product: { ...updatedProduct, images: imageUrls } }
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

/**
 * Get All Product Categories (Admin)
 */
export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await prisma.productCategory.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    logger.error('Get categories error:', error);
    next(error);
  }
};


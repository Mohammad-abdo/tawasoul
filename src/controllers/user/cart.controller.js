import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Get user's cart
 */
export const getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            images: true,
            price: true,
            priceBeforeDiscount: true,
            discount: true,
            stock: true
          }
        }
      }
    });

    // Calculate totals
    let subtotal = 0;
    const items = cartItems.map(item => {
      const itemTotal = item.product.price * item.quantity;
      subtotal += itemTotal;
      return {
        id: item.id,
        product: item.product,
        quantity: item.quantity,
        itemTotal
      };
    });

    res.json({
      success: true,
      data: {
        items,
        subtotal,
        total: subtotal // Add shipping if needed
      }
    });
  } catch (error) {
    logger.error('Get cart error:', error);
    next(error);
  }
};

/**
 * Add item to cart
 */
export const addToCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    // Validation
    if (!productId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Product ID is required'
        }
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Quantity must be at least 1'
        }
      });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
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

    if (!product.isActive) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PRODUCT_INACTIVE',
          message: 'Product is not available'
        }
      });
    }

    // Check stock
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_STOCK',
          message: `Only ${product.stock} items available in stock`
        }
      });
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });

    let cartItem;
    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock < newQuantity) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_STOCK',
            message: `Only ${product.stock} items available in stock`
          }
        });
      }

      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              nameAr: true,
              images: true,
              price: true,
              stock: true
            }
          }
        }
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          userId,
          productId,
          quantity
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              nameAr: true,
              images: true,
              price: true,
              stock: true
            }
          }
        }
      });
    }

    logger.info(`Item added to cart: ${productId} by user ${userId}`);

    res.status(201).json({
      success: true,
      data: {
        id: cartItem.id,
        product: cartItem.product,
        quantity: cartItem.quantity,
        message: 'Item added to cart successfully'
      }
    });
  } catch (error) {
    logger.error('Add to cart error:', error);
    next(error);
  }
};

/**
 * Update cart item quantity
 */
export const updateCartItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { quantity } = req.body;

    // Validation
    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Quantity must be at least 1'
        }
      });
    }

    // Check if cart item exists
    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: {
        product: true
      }
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CART_ITEM_NOT_FOUND',
          message: 'Cart item not found'
        }
      });
    }

    if (cartItem.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only update your own cart items'
        }
      });
    }

    // Check stock
    if (cartItem.product.stock < quantity) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_STOCK',
          message: `Only ${cartItem.product.stock} items available in stock`
        }
      });
    }

    // Update quantity
    const updatedItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            images: true,
            price: true,
            stock: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: {
        id: updatedItem.id,
        product: updatedItem.product,
        quantity: updatedItem.quantity
      }
    });
  } catch (error) {
    logger.error('Update cart item error:', error);
    next(error);
  }
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Check if cart item exists
    const cartItem = await prisma.cartItem.findUnique({
      where: { id }
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CART_ITEM_NOT_FOUND',
          message: 'Cart item not found'
        }
      });
    }

    if (cartItem.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only remove your own cart items'
        }
      });
    }

    // Delete cart item
    await prisma.cartItem.delete({
      where: { id }
    });

    logger.info(`Item removed from cart: ${id} by user ${userId}`);

    res.json({
      success: true,
      message: 'Item removed from cart successfully'
    });
  } catch (error) {
    logger.error('Remove from cart error:', error);
    next(error);
  }
};

/**
 * Clear cart
 */
export const clearCart = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await prisma.cartItem.deleteMany({
      where: { userId }
    });

    logger.info(`Cart cleared by user ${userId}`);

    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    logger.error('Clear cart error:', error);
    next(error);
  }
};


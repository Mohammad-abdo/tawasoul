import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Generate unique order number
 */
const generateOrderNumber = () => {
  return `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

/**
 * Get user's orders
 */
export const getUserOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = { userId };
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  nameAr: true,
                  images: true
                }
              }
            }
          },
          address: true
        }
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Get orders error:', error);
    next(error);
  }
};

/**
 * Get order by ID
 */
export const getOrderById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        },
        address: true
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ORDER_NOT_FOUND',
          message: 'Order not found'
        }
      });
    }

    if (order.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only view your own orders'
        }
      });
    }

    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    logger.error('Get order error:', error);
    next(error);
  }
};

/**
 * Create order from cart
 */
export const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { addressId, paymentMethod } = req.body;

    // Validation
    if (!addressId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Address ID is required'
        }
      });
    }

    // Check if address exists and belongs to user
    const address = await prisma.address.findUnique({
      where: { id: addressId }
    });

    if (!address || address.userId !== userId) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ADDRESS_NOT_FOUND',
          message: 'Address not found'
        }
      });
    }

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: true
      }
    });

    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMPTY_CART',
          message: 'Cart is empty'
        }
      });
    }

    // Validate stock and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const cartItem of cartItems) {
      if (cartItem.product.stock < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_STOCK',
            message: `Product ${cartItem.product.name} has insufficient stock`
          }
        });
      }

      const itemTotal = cartItem.product.price * cartItem.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        price: cartItem.product.price
      });
    }

    const total = subtotal; // Add shipping cost if needed

    // Create order
    const order = await prisma.order.create({
      data: {
        userId,
        addressId,
        orderNumber: generateOrderNumber(),
        subtotal,
        total,
        paymentMethod: paymentMethod || null,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        items: {
          create: orderItems
        }
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                nameAr: true,
                images: true
              }
            }
          }
        },
        address: true
      }
    });

    // Update product stock
    for (const cartItem of cartItems) {
      await prisma.product.update({
        where: { id: cartItem.productId },
        data: {
          stock: {
            decrement: cartItem.quantity
          }
        }
      });
    }

    // Clear cart
    await prisma.cartItem.deleteMany({
      where: { userId }
    });

    logger.info(`Order created: ${order.id} by user ${userId}`);

    res.status(201).json({
      success: true,
      data: {
        order,
        message: 'Order created successfully'
      }
    });
  } catch (error) {
    logger.error('Create order error:', error);
    next(error);
  }
};

/**
 * Cancel order
 */
export const cancelOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ORDER_NOT_FOUND',
          message: 'Order not found'
        }
      });
    }

    if (order.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only cancel your own orders'
        }
      });
    }

    if (order.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ALREADY_CANCELLED',
          message: 'Order is already cancelled'
        }
      });
    }

    if (['SHIPPED', 'DELIVERED'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CANNOT_CANCEL',
          message: 'Cannot cancel a shipped or delivered order'
        }
      });
    }

    // Restore product stock
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity
          }
        }
      });
    }

    // Cancel order
    const cancelledOrder = await prisma.order.update({
      where: { id },
      data: {
        status: 'CANCELLED'
      }
    });

    logger.info(`Order cancelled: ${id} by user ${userId}`);

    res.json({
      success: true,
      data: {
        order: cancelledOrder,
        message: 'Order cancelled successfully'
      }
    });
  } catch (error) {
    logger.error('Cancel order error:', error);
    next(error);
  }
};


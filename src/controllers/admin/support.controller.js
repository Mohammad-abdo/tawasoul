import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Get All Support Tickets
 */
export const getAllTickets = async (req, res, next) => {
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
          tickets: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
        }
      });
    }

    const {
      page = 1,
      limit = 20,
      status,
      priority,
      assignedTo,
      sort = 'createdAt'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (assignedTo) {
      where.assignedTo = assignedTo;
    }

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sort]: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true
            }
          },
          doctor: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          assignedAdmin: {
            select: {
              id: true,
              name: true
            }
          },
          replies: {
            take: 1,
            orderBy: { createdAt: 'desc' }
          }
        }
      }),
      prisma.supportTicket.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        tickets,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Get tickets error:', error);
    next(error);
  }
};

/**
 * Get Ticket by ID
 */
export const getTicketById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        doctor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignedAdmin: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        replies: {
          orderBy: { createdAt: 'asc' },
          include: {
            admin: {
              select: { name: true }
            },
            user: {
              select: { username: true }
            },
            doctor: {
              select: { name: true }
            }
          }
        }
      }
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TICKET_NOT_FOUND',
          message: 'Ticket not found'
        }
      });
    }

    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    logger.error('Get ticket error:', error);
    next(error);
  }
};

/**
 * Add Reply to Ticket
 */
export const addReply = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message, isInternal = false } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Message is required'
        }
      });
    }

    const ticket = await prisma.supportTicket.findUnique({ where: { id } });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TICKET_NOT_FOUND',
          message: 'Ticket not found'
        }
      });
    }

    // Create reply
    const reply = await prisma.supportReply.create({
      data: {
        ticketId: id,
        adminId: req.admin.id,
        message,
        isInternal
      }
    });

    // Update ticket status if not internal
    if (!isInternal) {
      await prisma.supportTicket.update({
        where: { id },
        data: {
          status: ticket.status === 'OPEN' ? 'IN_PROGRESS' : ticket.status
        }
      });
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'REPLY',
        entityType: 'SUPPORT_TICKET',
        entityId: id,
        description: `Added ${isInternal ? 'internal' : 'public'} reply to ticket`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      data: reply,
      message: 'Reply added successfully'
    });
  } catch (error) {
    logger.error('Add reply error:', error);
    next(error);
  }
};

/**
 * Update Ticket Status
 */
export const updateTicketStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Status is required'
        }
      });
    }

    const ticket = await prisma.supportTicket.findUnique({ where: { id } });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TICKET_NOT_FOUND',
          message: 'Ticket not found'
        }
      });
    }

    const updatedTicket = await prisma.supportTicket.update({
      where: { id },
      data: { status }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'UPDATE',
        entityType: 'SUPPORT_TICKET',
        entityId: id,
        description: `Updated ticket status to ${status}`,
        changes: { before: ticket.status, after: status },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      data: updatedTicket,
      message: 'Ticket status updated successfully'
    });
  } catch (error) {
    logger.error('Update ticket error:', error);
    next(error);
  }
};

/**
 * Assign Ticket to Admin
 */
export const assignTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { adminId } = req.body;

    if (!adminId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Admin ID is required'
        }
      });
    }

    const ticket = await prisma.supportTicket.findUnique({ where: { id } });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TICKET_NOT_FOUND',
          message: 'Ticket not found'
        }
      });
    }

    const updatedTicket = await prisma.supportTicket.update({
      where: { id },
      data: {
        assignedTo: adminId,
        status: 'IN_PROGRESS'
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'ASSIGN',
        entityType: 'SUPPORT_TICKET',
        entityId: id,
        description: `Assigned ticket to admin ${adminId}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      data: updatedTicket,
      message: 'Ticket assigned successfully'
    });
  } catch (error) {
    logger.error('Assign ticket error:', error);
    next(error);
  }
};


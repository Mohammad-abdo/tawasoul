import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

const ticketInclude = {
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
      admin: { select: { id: true, name: true, email: true } },
      doctor: { select: { id: true, name: true, email: true } }
    }
  }
};

export const getMySupportTickets = async (req, res, next) => {
  try {
    const doctorId = req.doctor.id;
    const { page = 1, limit = 20, status } = req.query;
    const where = {
      doctorId,
      ...(status ? { status } : {})
    };

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take,
        include: {
          assignedAdmin: {
            select: { id: true, name: true }
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
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          total,
          pages: Math.ceil(total / parseInt(limit, 10))
        }
      }
    });
  } catch (error) {
    logger.error('Get doctor support tickets error:', error);
    next(error);
  }
};

export const createSupportTicket = async (req, res, next) => {
  try {
    const doctorId = req.doctor.id;
    const { subject, message, priority = 'MEDIUM' } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        error: { message: 'subject and message are required' }
      });
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        doctorId,
        subject: String(subject).trim(),
        message: String(message).trim(),
        priority
      }
    });

    res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    logger.error('Create doctor support ticket error:', error);
    next(error);
  }
};

export const getSupportTicketById = async (req, res, next) => {
  try {
    const doctorId = req.doctor.id;
    const { id } = req.params;

    const ticket = await prisma.supportTicket.findFirst({
      where: { id, doctorId },
      include: ticketInclude
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: { message: 'Support ticket not found' }
      });
    }

    res.json({ success: true, data: ticket });
  } catch (error) {
    logger.error('Get doctor support ticket by id error:', error);
    next(error);
  }
};

export const addSupportReply = async (req, res, next) => {
  try {
    const doctorId = req.doctor.id;
    const { id } = req.params;
    const { message } = req.body;

    if (!message || !String(message).trim()) {
      return res.status(400).json({
        success: false,
        error: { message: 'message is required' }
      });
    }

    const ticket = await prisma.supportTicket.findFirst({
      where: { id, doctorId }
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: { message: 'Support ticket not found' }
      });
    }

    const reply = await prisma.supportReply.create({
      data: {
        ticketId: id,
        doctorId,
        message: String(message).trim(),
        isInternal: false
      },
      include: {
        doctor: { select: { id: true, name: true, email: true } }
      }
    });

    await prisma.supportTicket.update({
      where: { id },
      data: {
        status: ticket.status === 'CLOSED' ? 'IN_PROGRESS' : ticket.status
      }
    });

    res.status(201).json({ success: true, data: reply });
  } catch (error) {
    logger.error('Add doctor support reply error:', error);
    next(error);
  }
};

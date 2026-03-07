import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Get All Activity Logs
 */
export const getAllActivityLogs = async (req, res, next) => {
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
          logs: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
        }
      });
    }

    const {
      page = 1,
      limit = 20,
      adminId,
      action,
      entityType,
      entityId,
      dateFrom,
      dateTo,
      sort = 'createdAt'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (adminId) {
      where.adminId = adminId;
    }

    if (action) {
      where.action = action;
    }

    if (entityType) {
      where.entityType = entityType;
    }

    if (entityId) {
      where.entityId = entityId;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sort]: 'desc' },
        include: {
          admin: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.activityLog.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Get activity logs error:', error);
    next(error);
  }
};

/**
 * Get Activity Log by ID
 */
export const getActivityLogById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const log = await prisma.activityLog.findUnique({
      where: { id },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!log) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'LOG_NOT_FOUND',
          message: 'Activity log not found'
        }
      });
    }

    res.json({
      success: true,
      data: log
    });
  } catch (error) {
    logger.error('Get activity log error:', error);
    next(error);
  }
};

/**
 * Get Activity Statistics
 */
export const getActivityStats = async (req, res, next) => {
  try {
    const { dateFrom, dateTo } = req.query;

    const where = {};
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    const [
      totalLogs,
      logsByAction,
      logsByEntityType,
      logsByAdmin
    ] = await Promise.all([
      prisma.activityLog.count({ where }),
      prisma.activityLog.groupBy({
        by: ['action'],
        where,
        _count: true
      }),
      prisma.activityLog.groupBy({
        by: ['entityType'],
        where,
        _count: true
      }),
      prisma.activityLog.groupBy({
        by: ['adminId'],
        where,
        _count: true
      })
    ]);

    res.json({
      success: true,
      data: {
        totalLogs,
        logsByAction,
        logsByEntityType,
        logsByAdmin
      }
    });
  } catch (error) {
    logger.error('Get activity stats error:', error);
    next(error);
  }
};

/**
 * Export Activity Logs
 */
export const exportActivityLogs = async (req, res, next) => {
  try {
    const { format = 'JSON', dateFrom, dateTo } = req.query;

    const where = {};
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    const logs = await prisma.activityLog.findMany({
      where,
      include: {
        admin: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (format === 'CSV') {
      // Convert to CSV
      const csv = [
        ['Date', 'Admin', 'Action', 'Entity Type', 'Entity ID', 'Description'].join(','),
        ...logs.map(log => [
          log.createdAt.toISOString(),
          log.admin?.name || 'N/A',
          log.action,
          log.entityType,
          log.entityId || 'N/A',
          log.description || 'N/A'
        ].join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=activity-logs-${Date.now()}.csv`);
      res.send(csv);
    } else {
      // JSON format
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=activity-logs-${Date.now()}.json`);
      res.json({
        success: true,
        data: logs
      });
    }
  } catch (error) {
    logger.error('Export activity logs error:', error);
    next(error);
  }
};


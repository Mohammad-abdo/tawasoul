import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Get All Reports
 */
export const getAllReports = async (req, res, next) => {
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
          reports: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
        }
      });
    }

    const {
      page = 1,
      limit = 20,
      type,
      status,
      generatedBy,
      sort = 'createdAt'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (generatedBy) {
      where.generatedBy = generatedBy;
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sort]: 'desc' },
        include: {
          generatedByAdmin: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.report.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Get reports error:', error);
    next(error);
  }
};

/**
 * Generate Report
 */
export const generateReport = async (req, res, next) => {
  try {
    const {
      type,
      name,
      description,
      format = 'JSON',
      filters = {}
    } = req.body;

    if (!type || !name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Type and name are required'
        }
      });
    }

    // Create report record
    const report = await prisma.report.create({
      data: {
        generatedBy: req.admin.id,
        type,
        name,
        description,
        format,
        filters: filters,
        status: 'PENDING',
        filePath: null, // Will be set when report is generated
        fileUrl: null
      }
    });

    // TODO: Queue report generation job
    // For now, we'll simulate async processing
    setTimeout(async () => {
      try {
        // Simulate report generation
        const fileUrl = `/reports/${report.id}.${format.toLowerCase()}`;
        
        await prisma.report.update({
          where: { id: report.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
            filePath: fileUrl,
            fileUrl: fileUrl
          }
        });
      } catch (error) {
        logger.error('Report generation error:', error);
        await prisma.report.update({
          where: { id: report.id },
          data: { status: 'FAILED' }
        });
      }
    }, 2000);

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'GENERATE_REPORT',
        entityType: 'REPORT',
        entityId: report.id,
        description: `Generated ${type} report: ${name}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.status(202).json({
      success: true,
      data: report,
      message: 'Report generation started'
    });
  } catch (error) {
    logger.error('Generate report error:', error);
    next(error);
  }
};

/**
 * Get Report by ID
 */
export const getReportById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        generatedByAdmin: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'REPORT_NOT_FOUND',
          message: 'Report not found'
        }
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    logger.error('Get report by ID error:', error);
    next(error);
  }
};

/**
 * Get Report Status
 */
export const getReportStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const report = await prisma.report.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        fileUrl: true,
        filePath: true,
        createdAt: true,
        startedAt: true,
        completedAt: true
      }
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'REPORT_NOT_FOUND',
          message: 'Report not found'
        }
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    logger.error('Get report status error:', error);
    next(error);
  }
};

/**
 * Download Report
 */
export const downloadReport = async (req, res, next) => {
  try {
    const { id } = req.params;

    const report = await prisma.report.findUnique({
      where: { id }
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'REPORT_NOT_FOUND',
          message: 'Report not found'
        }
      });
    }

    if (report.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'REPORT_NOT_READY',
          message: 'Report is not ready for download'
        }
      });
    }

    // TODO: Return actual file
    // For now, return file URL
    res.json({
      success: true,
      data: {
        downloadUrl: report.fileUrl
      }
    });
  } catch (error) {
    logger.error('Download report error:', error);
    next(error);
  }
};

/**
 * Delete Report
 */
export const deleteReport = async (req, res, next) => {
  try {
    const { id } = req.params;

    const report = await prisma.report.findUnique({ where: { id } });

    if (!report) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'REPORT_NOT_FOUND',
          message: 'Report not found'
        }
      });
    }

    await prisma.report.delete({ where: { id } });

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'DELETE',
        entityType: 'REPORT',
        entityId: id,
        description: `Deleted report: ${report.name}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    logger.error('Delete report error:', error);
    next(error);
  }
};


import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';
import * as reportUtils from '../../utils/report-generator.utils.js';

/**
 * Map report types to database queries and CSV fields
 */
const REPORT_CONFIG = {
  USERS: {
    model: 'user',
    fields: ['id', 'fullName', 'username', 'email', 'phone', 'isActive', 'createdAt'],
    getQuery: (filters) => ({
      where: {
        createdAt: {
          gte: filters.startDate ? new Date(filters.startDate) : undefined,
          lte: filters.endDate ? new Date(filters.endDate) : undefined,
        },
      },
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
      }
    })
  },
  DOCTORS: {
    model: 'doctor',
    fields: ['id', 'name', 'email', 'phone', 'specialty', 'isActive', 'rating', 'createdAt'],
    getQuery: (filters) => ({
      where: {
        createdAt: {
          gte: filters.startDate ? new Date(filters.startDate) : undefined,
          lte: filters.endDate ? new Date(filters.endDate) : undefined,
        },
      },
      include: {
        specialties: true
      }
    }),
    transform: (data) => data.map(d => ({
      ...d,
      specialty: d.specialties.map(s => s.specialty).join(', ')
    }))
  },
  BOOKINGS: {
    model: 'booking',
    fields: ['id', 'userName', 'doctorName', 'date', 'status', 'totalPrice', 'createdAt'],
    getQuery: (filters) => ({
      where: {
        createdAt: {
          gte: filters.startDate ? new Date(filters.startDate) : undefined,
          lte: filters.endDate ? new Date(filters.endDate) : undefined,
        },
      },
      include: {
        user: { select: { fullName: true } },
        doctor: { select: { name: true } }
      }
    }),
    transform: (data) => data.map(b => ({
      ...b,
      userName: b.user?.fullName || 'N/A',
      doctorName: b.doctor?.name || 'N/A'
    }))
  }
};

/**
 * Generate a real report
 * @param {string} reportId - ID of the report record
 */
export const processReportGeneration = async (reportId) => {
  try {
    logger.info(`Starting real report generation for: ${reportId}`);

    // 1. Fetch the report record
    const report = await prisma.report.findUnique({
      where: { id: reportId }
    });

    if (!report) throw new Error('Report record not found');

    // 2. Mark as PROCESSING
    await prisma.report.update({
      where: { id: reportId },
      data: { status: 'PROCESSING' }
    });

    // 3. Get config for report type
    const config = REPORT_CONFIG[report.type];
    if (!config) {
      throw new Error(`Report type ${report.type} is not implemented yet`);
    }

    // 4. Parse filters
    let filters = {};
    if (report.filters) {
      filters = typeof report.filters === 'string' ? JSON.parse(report.filters) : report.filters;
    }

    // 5. Fetch data from DB
    const query = config.getQuery(filters);
    let data = await prisma[config.model].findMany(query);

    // 6. Transform data if needed
    if (config.transform) {
      data = config.transform(data);
    }

    if (data.length === 0) {
      logger.warn(`No data found for report: ${reportId}`);
    }

    // 7. Generate CSV
    const csvContent = reportUtils.generateCSV(data, config.fields);

    // 8. Save to file
    const { filePath, fileUrl } = await reportUtils.saveReportFile(
      report.name.replace(/\s+/g, '-').toLowerCase(),
      csvContent,
      report.format
    );

    // 9. Mark as COMPLETED
    await prisma.report.update({
      where: { id: reportId },
      data: {
        status: 'COMPLETED',
        filePath,
        fileUrl,
        completedAt: new Date(),
        error: null
      }
    });

    logger.info(`Report ${reportId} generated successfully: ${fileUrl}`);

  } catch (error) {
    logger.error(`Report Generation Error (${reportId}):`, error);
    
    // Mark as FAILED
    await prisma.report.update({
      where: { id: reportId },
      data: {
        status: 'FAILED',
        error: error.message
      }
    }).catch(err => logger.error('Failed to update report status to FAILED', err));
  }
};

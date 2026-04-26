import fs from 'fs/promises';
import path from 'path';
import { Parser } from 'json2csv';
import { logger } from './logger.js';

/**
 * Generate CSV from data
 * @param {Array} data - Array of objects to convert
 * @param {Array} fields - Fields to include in CSV
 * @returns {string} CSV content
 */
export const generateCSV = (data, fields) => {
  try {
    const parser = new Parser({ fields });
    return parser.parse(data);
  } catch (error) {
    logger.error('CSV Generation Error:', error);
    throw new Error('Failed to generate CSV content');
  }
};

/**
 * Save report file to disk
 * @param {string} fileName - Name of the file
 * @param {string} content - Content to save
 * @param {string} format - Format (CSV, PDF, etc.)
 * @returns {Object} { filePath, fileUrl }
 */
export const saveReportFile = async (fileName, content, format = 'CSV') => {
  try {
    const uploadDir = path.join(process.cwd(), 'uploads', 'reports');
    
    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    const fileExt = format.toLowerCase();
    const fullFileName = `${fileName}-${Date.now()}.${fileExt}`;
    const filePath = path.join(uploadDir, fullFileName);
    
    await fs.writeFile(filePath, content);

    // Return the relative URL for the browser
    const fileUrl = `/uploads/reports/${fullFileName}`;

    return { filePath, fileUrl };
  } catch (error) {
    logger.error('File Save Error:', error);
    throw new Error('Failed to save report file');
  }
};

/**
 * Get File URL from Path
 * @param {string} filePath 
 * @returns {string}
 */
export const getFileUrl = (filePath) => {
  const fileName = path.basename(filePath);
  return `/uploads/reports/${fileName}`;
};

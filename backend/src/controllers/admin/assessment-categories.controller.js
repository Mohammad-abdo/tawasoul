import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Get All Assessment Categories
 */
export const getAllCategories = async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        const [categories, total] = await Promise.all([
            prisma.assessmentCategory.findMany({
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: { tests: true }
                    }
                }
            }),
            prisma.assessmentCategory.count()
        ]);

        res.json({
            success: true,
            data: {
                categories,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        logger.error('Get all assessment categories error:', error);
        next(error);
    }
};

/**
 * Get Assessment Category by ID
 */
export const getCategoryById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const category = await prisma.assessmentCategory.findUnique({
            where: { id },
            include: {
                tests: true
            }
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'CATEGORY_NOT_FOUND',
                    message: 'Category not found'
                }
            });
        }

        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        logger.error('Get assessment category by ID error:', error);
        next(error);
    }
};

/**
 * Create Assessment Category
 */
export const createCategory = async (req, res, next) => {
    try {
        const { name, nameAr } = req.body;

        if (!name || !nameAr) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Name (English and Arabic) is required'
                }
            });
        }

        const category = await prisma.assessmentCategory.create({
            data: {
                name,
                nameAr
            }
        });

        logger.info(`Assessment Category created: ${category.id} by admin ${req.admin.id}`);

        res.status(201).json({
            success: true,
            data: category
        });
    } catch (error) {
        logger.error('Create assessment category error:', error);
        next(error);
    }
};

/**
 * Update Assessment Category
 */
export const updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, nameAr } = req.body;

        const category = await prisma.assessmentCategory.findUnique({
            where: { id }
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'CATEGORY_NOT_FOUND',
                    message: 'Category not found'
                }
            });
        }

        const updatedCategory = await prisma.assessmentCategory.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(nameAr && { nameAr })
            }
        });

        logger.info(`Assessment Category updated: ${id} by admin ${req.admin.id}`);

        res.json({
            success: true,
            data: updatedCategory
        });
    } catch (error) {
        logger.error('Update assessment category error:', error);
        next(error);
    }
};

/**
 * Delete Assessment Category
 */
export const deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;

        const category = await prisma.assessmentCategory.findUnique({
            where: { id }
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'CATEGORY_NOT_FOUND',
                    message: 'Category not found'
                }
            });
        }

        await prisma.assessmentCategory.delete({
            where: { id }
        });

        logger.info(`Assessment Category deleted: ${id} by admin ${req.admin.id}`);

        res.json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        logger.error('Delete assessment category error:', error);
        next(error);
    }
};

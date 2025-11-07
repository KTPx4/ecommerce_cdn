const { body, param, query, validationResult } = require('express-validator');
const { ApiError } = require('../utils/error.utils');

/**
 * Validation Error Handler
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((err) => err.msg);
        return next(new ApiError(400, 'Validation failed', errorMessages));
    }
    next();
};

/**
 * Upload Image Validation Rules
 */
const uploadValidation = [
    body('category')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Category must be between 1 and 50 characters'),
    body('alt')
        .optional()
        .isString()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Alt text must not exceed 200 characters'),
    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array'),
    body('isPublic')
        .optional()
        .isBoolean()
        .withMessage('isPublic must be a boolean'),
    handleValidationErrors,
];

/**
 * Image ID Validation
 */
const imageIdValidation = [
    param('id')
        .notEmpty()
        .withMessage('Image ID is required')
        .isString()
        .withMessage('Image ID must be a string'),
    handleValidationErrors,
];

/**
 * Image Path Validation
 */
const imagePathValidation = [
    param('path')
        .notEmpty()
        .withMessage('Image path is required')
        .isString()
        .withMessage('Image path must be a string'),
    handleValidationErrors,
];

/**
 * List Images Validation
 */
const listImagesValidation = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    query('category')
        .optional()
        .isString()
        .trim()
        .withMessage('Category must be a string'),
    query('sortBy')
        .optional()
        .isIn(['createdAt', 'size', 'name'])
        .withMessage('sortBy must be one of: createdAt, size, name'),
    query('order')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('order must be either asc or desc'),
    handleValidationErrors,
];

/**
 * Image Size Query Validation
 */
const imageSizeValidation = [
    query('size')
        .optional()
        .isIn(['small', 'medium', 'large', 'original'])
        .withMessage('Size must be one of: small, medium, large, original'),
    handleValidationErrors,
];

module.exports = {
    uploadValidation,
    imageIdValidation,
    imagePathValidation,
    listImagesValidation,
    imageSizeValidation,
    handleValidationErrors,
};

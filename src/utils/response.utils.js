/**
 * Send Success Response
 */
const successResponse = (res, statusCode, message, data = null) => {
    const response = {
        success: true,
        message,
        data,
    };

    return res.status(statusCode).json(response);
};

/**
 * Send Paginated Response
 */
const paginatedResponse = (res, statusCode, message, data, pagination) => {
    const response = {
        success: true,
        message,
        data,
        pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total: pagination.total,
            totalPages: Math.ceil(pagination.total / pagination.limit),
            hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
            hasPrev: pagination.page > 1,
        },
    };

    return res.status(statusCode).json(response);
};

module.exports = {
    successResponse,
    paginatedResponse,
};

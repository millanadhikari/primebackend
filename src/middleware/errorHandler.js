// src/middleware/errorHandler.js - Global error handling middleware

/**
 * Global error handling middleware
 * Must be the last middleware in the chain
 */
export const errorHandler = (error, req, res, next) => {
    console.error('Error occurred:', {
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString(),
    });

    let statusCode = 500;
    let message = 'Internal server error';
    let details = null;

    // Handle specific error types
    switch (error.name) {
        case 'ValidationError':
            statusCode = 400;
            message = 'Validation error';
            details = error.message;
            break;

        case 'JsonWebTokenError':
            statusCode = 401;
            message = 'Invalid token';
            break;

        case 'TokenExpiredError':
            statusCode = 401;
            message = 'Token expired';
            break;
    }

    // Prisma error codes
    if (error.code === 'P2002') {
        statusCode = 409;
        message = 'Resource already exists';
        details = 'A record with this data already exists';
    } else if (error.code === 'P2025') {
        statusCode = 404;
        message = 'Resource not found';
    }

    // Custom error messages
    if (error.message) {
        const lowerMsg = error.message.toLowerCase();

        if (lowerMsg.includes('required') ||
            lowerMsg.includes('invalid') ||
            lowerMsg.includes('incorrect')) {
            statusCode = 400;
        } else if (lowerMsg.includes('not found')) {
            statusCode = 404;
        } else if (lowerMsg.includes('already exists')) {
            statusCode = 409;
        } else if (lowerMsg.includes('unauthorized') || lowerMsg.includes('token')) {
            statusCode = 401;
        } else if (lowerMsg.includes('forbidden') || lowerMsg.includes('permission')) {
            statusCode = 403;
        }

        message = error.message;
    }

    const errorResponse = {
        status: 'error',
        message,
        ...(details && { details }),
        ...(process.env.NODE_ENV === 'development' && {
            stack: error.stack,
            error,
        }),
        timestamp: new Date().toISOString(),
    };

    res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res, next) => {
    const error = new Error(`Route ${req.originalUrl} not found`);
    error.statusCode = 404;
    next(error);
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors automatically
 */
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

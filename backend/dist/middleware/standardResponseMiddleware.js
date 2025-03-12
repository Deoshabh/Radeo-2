"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.standardResponseMiddleware = standardResponseMiddleware;
/**
 * Middleware that adds standardized response methods to Express
 */
function standardResponseMiddleware(req, res, next) {
    // Standard success response
    res.success = function (data, message = 'Success', statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
            timestamp: new Date().toISOString()
        });
    };
    // Standard error response
    res.error = function (message = 'An error occurred', statusCode = 500, errors = null) {
        return res.status(statusCode).json({
            success: false,
            message,
            errors,
            timestamp: new Date().toISOString()
        });
    };
    // Standard validation error response
    res.validationError = function (errors) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors,
            timestamp: new Date().toISOString()
        });
    };
    // Ensure content type is always JSON
    res.setHeader('Content-Type', 'application/json');
    next();
}

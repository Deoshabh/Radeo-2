import { Request, Response, NextFunction } from 'express';

/**
 * Middleware that adds standardized response methods to Express
 */
export function standardResponseMiddleware(req: Request, res: Response, next: NextFunction) {
  // Standard success response
  res.success = function(data: any, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  };

  // Standard error response
  res.error = function(message = 'An error occurred', statusCode = 500, errors = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString()
    });
  };

  // Standard validation error response
  res.validationError = function(errors: any) {
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

// Add the custom methods to Express Response
declare global {
  namespace Express {
    interface Response {
      success(data: any, message?: string, statusCode?: number): Response;
      error(message?: string, statusCode?: number, errors?: any): Response;
      validationError(errors: any): Response;
    }
  }
}

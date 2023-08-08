/**
 * Custom Error Class for Handling Application Errors
 * @class AppError
 * @extends Error
 */
class AppError extends Error {
    /**
     * Create a new instance of AppError.
     * @param {string} message - The error message.
     * @param {number} statusCode - The HTTP status code.
     */
    constructor(message, statusCode) {
      super(message);
  
      this.statusCode = statusCode;
      this.status = `${this.statusCode}`.startsWith('4') ? 'fail' : 'error';
  
      // Indicates that the error is operational and expected
      this.isOperational = true;
  
      // Capture the stack trace for better debugging
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  module.exports = AppError;
  
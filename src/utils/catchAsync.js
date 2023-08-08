/**
 * Wraps an asynchronous route handler with error handling.
 * @param {Function} fn - Asynchronous route handler function.
 * @returns {Function} - Express middleware.
 */
module.exports = fn => {
    return (req, res, next) => {
      // Call the asynchronous route handler and catch any errors
      fn(req, res, next).catch(next);
    };
  };
  
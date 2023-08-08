/**
 * Module for JWT token handling and sending responses with tokens.
 * @module tokenHandler
 */

const jwt = require('jsonwebtoken');

/**
 * Generates a JWT token with the user's ID.
 * @function signToken
 * @param {string} id - User's ID.
 * @returns {string} - Generated JWT token.
 */
const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

/**
 * Creates and sends a JWT token in response along with user data.
 * @function createSendToken
 * @param {object} user - User object.
 * @param {number} statusCode - HTTP status code.
 * @param {object} res - Express response object.
 */
exports.createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expiresIn: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  // Set secure flag for cookies in the production environment
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }

  // Send response with token and user data
  res.status(statusCode)
    .cookie('jwt', token, cookieOptions)
    .json({
      success: true,
      token,
      data: {
        user,
      },
    });
};

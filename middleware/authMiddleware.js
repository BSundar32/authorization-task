const jwt = require('jsonwebtoken');

/**
 * JWT Verification Middleware
 * 
 * This middleware verifies the JWT token from the request headers.
 * It extracts the Bearer token from the Authorization header,
 * validates it, and attaches the decoded user information to the request object.
 * 
 * Usage: Apply to routes that require authentication
 * Example: router.get('/profile', verifyToken, getProfile)
 */
const verifyToken = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No authorization token provided. Please include a Bearer token in the Authorization header.'
      });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format. Use "Bearer <token>"'
      });
    }

    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user information to request object
    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.',
        error: 'TokenExpiredError'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please check your token.',
        error: 'JsonWebTokenError'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error verifying token',
      error: error.message
    });
  }
};

module.exports = verifyToken;

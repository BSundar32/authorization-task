const express = require('express');
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * Authentication Routes
 * 
 * POST /api/auth/register - User registration
 * POST /api/auth/login - User login
 * GET /api/auth/profile - Get user profile (protected)
 * GET /api/auth/users - Get all users (for testing)
 */

router.post('/register', authController.register);

router.post('/login', authController.login);

router.get('/profile', verifyToken, authController.getUserProfile);

router.get('/users', authController.getAllUsers);

module.exports = router;

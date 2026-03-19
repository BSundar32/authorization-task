require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/authRoutes');

// Initialize Express app
const app = express();

/**
 * MIDDLEWARE CONFIGURATION
 */

// CORS - Allow cross-origin requests
app.use(cors());

// Body parser - Parse incoming JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * DATABASE CONNECTION
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

/**
 * API ROUTES
 */

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Authentication routes
app.use('/api/auth', authRoutes);

/**
 * ERROR HANDLING MIDDLEWARE
 */

// 404 Not Found handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: Object.values(error.errors).map(err => err.message)
    });
  }

  // Default error response
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error : {}
  });
});

/**
 * SERVER STARTUP
 */

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n✓ Server running on http://localhost:${PORT}`);
    console.log(`✓ Environment: ${process.env.NODE_ENV}`);
    console.log('\n--- Available Endpoints ---');
    console.log('GET    /api/health - Health check');
    console.log('POST   /api/auth/register - Register new user');
    console.log('POST   /api/auth/login - Login user');
    console.log('GET    /api/auth/profile - Get user profile (protected)');
    console.log('GET    /api/auth/users - Get all users');
    console.log('----------------------------\n');
  });
});

module.exports = app;

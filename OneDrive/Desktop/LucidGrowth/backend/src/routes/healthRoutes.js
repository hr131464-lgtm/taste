/**
 * Health Check Routes
 * 
 * Provides endpoints for monitoring system health and status
 */

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

/**
 * @route   GET /health
 * @desc    Basic health check
 * @access  Public
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Email Analysis System is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * @route   GET /health/detailed
 * @desc    Detailed health check including database status
 * @access  Public
 */
router.get('/detailed', async (req, res) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      api: 'OK',
      database: 'Unknown'
    },
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100,
      external: Math.round(process.memoryUsage().external / 1024 / 1024 * 100) / 100
    }
  };

  // Check database connection
  try {
    if (mongoose.connection.readyState === 1) {
      healthCheck.services.database = 'OK';
    } else {
      healthCheck.services.database = 'Disconnected';
      healthCheck.status = 'Degraded';
    }
  } catch (error) {
    healthCheck.services.database = 'Error';
    healthCheck.status = 'Degraded';
  }

  const statusCode = healthCheck.status === 'OK' ? 200 : 503;
  res.status(statusCode).json(healthCheck);
});

module.exports = router;

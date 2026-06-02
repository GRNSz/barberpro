import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Healthcheck endpoint returning database connection status
router.get('/', async (req, res) => {
  try {
    // Run simple query to test connection
    await pool.query('SELECT 1');
    return res.json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      services: {
        api: 'running',
        database: 'connected'
      }
    });
  } catch (err) {
    console.error('Health check failed:', err.message);
    return res.status(500).json({
      status: 'DOWN',
      timestamp: new Date().toISOString(),
      services: {
        api: 'running',
        database: 'disconnected'
      },
      error: err.message
    });
  }
});

export default router;

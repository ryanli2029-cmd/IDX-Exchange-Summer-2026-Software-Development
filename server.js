require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();

const PORT = process.env.PORT;

// Middleware
app.use(cors());
app.use(express.json());

// GET /api/health endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Run a simple test query to verify database connection
    await pool.query('SELECT 1');
    
    // If successful, return 200 (means ok)
    res.status(200).json({
      status: "ok",
      database: "connected"
    });
  } catch (error) {
    // If the database is unreachable, catch it and return 500 without crashing the app
    console.error("Health check database error:", error.message);
    res.status(500).json({
      status: "error",
      database: "disconnected",
      message: "Database connection failed"
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const express = require('express');
const { Pool } = require('pg');
const app = express();
app.use(express.json());

// 1. Database Pipe
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 2. The "Pre-Flight" Check
app.get('/', async (req, res) => {
  try {
    const dbTest = await pool.query('SELECT NOW()');
    res.send("🚀 High-Notch Playground is LIVE! Database connected at: " + dbTest.rows[0].now);
  } catch (err) {
    res.status(500).send("❌ Engine Error: Database connection failed.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Commander Center active on port ${PORT}`));

// 1. INITIALIZE THE ENGINE
const express = require('express');
const app = express();
app.use(express.json());

// 2. CONNECT THE VAULT (Database)
const { Pool } = require('pg');
const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } 
});

// 3. ATTACH THE TOOLS (Paystack)
const paystack = require('paystack-api')(process.env.PAYSTACK_SECRET_KEY);

// 4. THE MISSION LOGIC (Your Routes)
app.get('/', async (req, res) => {
    res.send("🚀 High-Notch Playground is LIVE!");
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: "Commander, we are Online", database: "Connected" });
});

// 5. START THE MISSION
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Mission Control live on port ${PORT}`);
});

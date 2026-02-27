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


// --- MISSION LOGIC: FUND VAULT ---
app.post('/fund-vault', async (req, res) => {
    const { amount, email } = req.body;

    try {
        // Initialize Paystack Transaction
        const transaction = await paystack.transaction.initialize({
            amount: amount * 100, // Converts Naira to Kobo
            email: email,
            callback_url: "https://glowing-octo-meme-production.up.railway.app/health" 
        });

        // Send the payment link back to the user
        res.json({
            status: "Success",
            message: "Redirecting to Secure Vault",
            authorization_url: transaction.data.authorization_url
        });
    } catch (error) {
        console.error("Vault Funding Error:", error);
        res.status(500).json({ status: "Error", message: "Vault Access Denied" });
    }
});

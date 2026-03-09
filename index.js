require('dotenv').config(); 
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
const axios = require('axios');


// 4. THE MISSION LOGIC (Your Routes)
app.get('/', async (req, res) => {
    res.send("🚀 High-Notch Playground is LIVE!");
});
// --- MONNIFY AUTHENTICATION ---
const getMonnifyToken = async () => {
    const authHeader = Buffer.from(`${process.env.MONNIFY_API_KEY}:${process.env.MONNIFY_SECRET_KEY}`).toString('base64');
    
    try {
        const response = await axios.post('https://api.monnify.com/api/v1/auth/login', {}, {
            headers: { 'Authorization': `Basic ${authHeader}` }
        });
        return response.data.responseBody.accessToken;
    } catch (error) {
        console.error("Monnify Auth Error:", error.response?.data || error.message);
    }
};

// --- MONNIFY DISBURSEMENT (PAYOUT) ---
app.post('/disburse-funds', async (req, res) => {
    try {
        const token = await getMonnifyToken();
        const { amount, accountNumber, bankCode, reference } = req.body;

        const payoutData = {
            "amount": amount,
            "reference": reference || `DLX-${Date.now()}`,
            "narration": "DLX Designs Vendor Settlement",
            "destinationBankCode": bankCode,
            "destinationAccountNumber": accountNumber,
            "currency": "NGN",
            "sourceAccountNumber": "6623723648" // Your Moniepoint Account
        };

        const result = await axios.post('https://api.monnify.com/api/v1/disbursements/single', payoutData, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        res.status(200).json(result.data);
    } catch (err) {
        console.error("Payout Failed:", err.response?.data || err.message);
        res.status(500).json(err.response?.data || { error: "Transaction failed" });
    }
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
// --- MISSION LOGIC: REAL TRANSFER ---
app.post('/transfer', async (req, res) => {
    const { amount, recipient_code, reason } = req.body;

    try {
        const transfer = await paystack.transfer.create({
            source: "balance", 
            amount: amount * 100, 
            recipient: recipient_code,
            reason: reason || "High-Notch Vault Transfer"
        });

        res.json({
            status: "Success",
            transfer_code: transfer.data.transfer_code,
            message: "Funds are in transit, Commander."
        });
    } catch (error) {
        console.error("Transfer Mission Failed:", error);
        res.status(500).json({ status: "Error", message: "Transfer Blocked" });
    }
});

// --- MISSION LOGIC: CREATE RECIPIENT ---
app.post('/create-recipient', async (req, res) => {
    const { name, account_number, bank_code } = req.body;
    try {
        const response = await paystack.transfer_recipient.create({

            type: "nuban",
            name: name,
            account_number: account_number,
            bank_code: bank_code,
            currency: "NGN"
        });
        res.json({ 
            status: "Success", 
            recipient_code: response.data.recipient_code,
            data: response.data 
        });
    } catch (error) {
        console.error("Paystack Error Detail:", error.response ? error.response.data : error.message);
        res.status(500).json({ status: "Error", detail: error.message });
    }
});
// --- MISSION LOGIC: INITIATE TRANSFER ---
app.post('/initiate-transfer', async (req, res) => {
    const { amount, recipient_code } = req.body;
    try {
        const response = await paystack.transfer.create({
            source: "balance",
            amount: amount * 100, // Converts Naira to Kobo
            recipient: recipient_code,
            reason: "High-Notch Payout"
        });
        res.json({ 
            status: "Transfer Initiated", 
            transfer_code: response.data.transfer_code,
            data: response.data 
        });
    } catch (error) {
        console.error("Transfer Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ status: "Error", detail: error.message });
    }
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: "Commander, we are Online", database: "Connected" });
});
// Add this temporary route to your code and visit it in your browser
app.get('/my-ip', async (req, res) => {
    const response = await axios.get('https://api.ipify.org?format=json');
    res.send(response.data);
});
// --- MONNIFY AUTHENTICATION ---
const getMonnifyToken = async () => {
    const authHeader = Buffer.from(`${process.env.MONNIFY_API_KEY}:${process.env.MONNIFY_SECRET_KEY}`).toString('base64');
    
    try {
        const response = await axios.post('https://api.monnify.com/api/v1/auth/login', {}, {
            headers: { 'Authorization': `Basic ${authHeader}` }
        });
        return response.data.responseBody.accessToken;
    } catch (error) {
        console.error("Auth Error:", error.response.data);
    }
};

// --- INITIATE PAYOUT ---
app.post('/api/payout', async (req, res) => {
    const token = await getMonnifyToken();
    const { amount, accountNumber, bankCode, reference } = req.body;

    const payoutData = {
        "amount": amount,
        "reference": reference,
        "narration": "Payment for DLX Designs Services",
        "destinationBankCode": bankCode,
        "destinationAccountNumber": accountNumber,
        "currency": "NGN",
        "sourceAccountNumber": "6623723648" // Your Moniepoint Biz Account
    };

    try {
        const result = await axios.post('https://api.monnify.com/api/v1/disbursements/single', payoutData, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        res.status(200).json(result.data);
    } catch (err) {
        res.status(500).json(err.response.data);
    }
});


// 5. START THE MISSION
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Mission Control live on port ${PORT}`);
});


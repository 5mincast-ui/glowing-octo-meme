const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// 1. HEALTHCHECK
app.get('/health', (req, res) => res.status(200).send('OK'));

// 2. FRONTEND
app.get('/', (req, res) => {
  res.send(`
    <html>
      <body style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:sans-serif; text-align:center;">
        <h1>🚀 High-Notch Playground (Sandbox)</h1>
        <button onclick="testPayout()" style="padding:20px; font-size:20px; background:green; color:white; border:none; border-radius:10px; cursor:pointer;">
          TEST 100 NGN PAYOUT
        </button>
        <div id="result" style="margin-top:20px; font-weight:bold; color:blue;"></div>
        <script>
          async function testPayout() {
            const resDiv = document.getElementById('result');
            resDiv.innerText = 'Sending...';
            try {
                    // PASTE THIS STARTING AT LINE 24
      const response = await fetch('/release-smile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: "YOUR_SECRET_PIN", // Replace this with your actual PIN
          amountInNaira: 100,
          destinationAccount: "6623723648"
        })
      });

// 3. MONNIFY SANDBOX AUTH
const getMonnifyToken = async () => {
  const authHeader = Buffer.from(process.env.MONNIFY_API_KEY + ':' + process.env.MONNIFY_SECRET_KEY).toString('base64');
  try {
    const response = await axios.post('https://sandbox.monnify.com/api/v1/auth/login', {}, {
      headers: { 'Authorization': 'Basic ' + authHeader }
    });
    return response.data.responseBody.accessToken;
  } catch (error) { throw error; }
};
// --- THE CHIEF COMMANDER'S GIVING HAND ---
app.post('/release-smile', async (req, res) => {
    const { pin, amountInNaira, destinationAccount } = req.body;

    // 1. Security Check: The Admin Shield
    if (pin !== process.env.CHIEF_COMMANDER_PIN) {
        return res.status(403).json({ error: "Unauthorized Chief Commander PIN." });
    }

    try {
        // 2. TRIGGER MONNIFY ENGINE
        const token = await getMonnifyToken();
        const result = await axios.post('https://sandbox.monnify.com/api/v1/disbursements/single', 
          {
            amount: amountInNaira,
            reference: 'PLP-' + Date.now(),
            narration: "Project Dioscuri - Smile Released",
            destinationBankCode: "50634", // Moniepoint
            destinationAccountNumber: destinationAccount,
            currency: "NGN",
            sourceAccountNumber: "6986178814", // Your Verified Wallet
            walletId: "8807193982" // Your Actual Contract Code
          }, 
          { headers: { 'Authorization': 'Bearer ' + token } }
        );

           // 3. LOG TO YOUR LOCAL BANK (Postgres)
    // Note: This only works if your Postgres DB is Un-Suspended
    await db.query("UPDATE accounts SET balance = balance - $1 WHERE id = 1", [amountInNaira]);

    res.status(200).json({ status: "Target Hit", message: "Funds Sent & Ledger Updated" });
  } catch (err) {
    console.error("Mission Failed:", err.response ? err.response.data : err.message);
    res.status(500).json({ error: "Handshake Failed", detail: err.message });
  }
});

// --- SERVER STARTUP ---
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => console.log('🚀 Engine Online'));
 

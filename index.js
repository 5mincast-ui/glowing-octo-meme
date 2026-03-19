const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// 1. HEALTHCHECK (Keep Railway Green)
app.get('/health', (req, res) => res.status(200).send('OK'));

// 2. FRONTEND
app.get('/', (req, res) => {
  res.send(`
    <html>
      <body style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:sans-serif; text-align:center;">
        <h1>🚀 High-Notch Playground is LIVE!</h1>
        <button onclick="testPayout()" style="padding:20px; font-size:20px; background:green; color:white; border:none; border-radius:10px; cursor:pointer;">
          TEST 100 NGN PAYOUT
        </button>
        <div id="result" style="margin-top:20px; font-weight:bold; color:blue;"></div>
        <script>
          async function testPayout() {
            const resDiv = document.getElementById('result');
            resDiv.innerText = 'Sending...';
            try {
              const response = await fetch('/api/payout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
              });
              const data = await response.json();
              resDiv.innerText = 'Result: ' + JSON.stringify(data);
            } catch (err) {
              resDiv.innerText = 'Error: ' + err.message;
            }
          }
        </script>
      </body>
    </html>
  `);
});

// 3. MONNIFY AUTH
const getMonnifyToken = async () => {
  const authHeader = Buffer.from(process.env.MONNIFY_API_KEY + ':' + process.env.MONNIFY_SECRET_KEY).toString('base64');
  try {
    const response = await axios.post('https://api.monnify.com/api/v1/auth/login', {}, {
      headers: { 'Authorization': 'Basic ' + authHeader }
    });
    return response.data.responseBody.accessToken;
  } catch (error) {
    throw error;
  }
};

// 4. PAYOUT (Corrected for Moniepoint)
app.post('/api/payout', async (req, res) => {
  try {
    const token = await getMonnifyToken();
    const result = await axios.post('https://api.monnify.com/api/v1/disbursements/single', 
      {
        amount: 100,
        reference: 'REF-' + Date.now(),
        narration: "Test Payout to Moniepoint",
        destinationBankCode: "50634",
        destinationAccountNumber: "6623723648",
        currency: "NGN",
        sourceAccountNumber: "6623723314"
      }, 
      { headers: { 'Authorization': 'Bearer ' + token } }
    );
    res.status(200).json(result.data);
  } catch (err) {
    res.status(500).json(err.response ? err.response.data : { error: err.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => console.log('🚀 Engine Online'));

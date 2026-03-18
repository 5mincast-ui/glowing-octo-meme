// --- 3. ATTACH THE TOOLS (Paystack) ---
const paystack = require('paystack-api')(process.env.PAYSTACK_SECRET_KEY);

// --- 4. THE MISSION LOGIC (Your Routes) ---
app.get('/', async (req, res) => {
  res.send(`
    <html>
      <body style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:sans-serif;">
        <h1>🚀 High-Notch Playground is LIVE!</h1>
        <button onclick="testPayout()" style="padding:20px; font-size:20px; background:green; color:white; border:none; border-radius:10px; cursor:pointer;">
          TEST 100 NGN PAYOUT
        </button>
        <div id="result" style="margin-top:20px; font-weight:bold;"></div>
        <script>
          async function testPayout() {
            const resDiv = document.getElementById('result');
            resDiv.innerText = 'Sending...';
            try {
              const response = await fetch('/api/payout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: 100, accountNumber: "0123456789", bankCode: "058" })
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
}); // <--- THIS WAS LIKELY MISSING

// --- MONNIFY AUTHENTICATION ---
const getMonnifyToken = async () => {
  const authHeader = Buffer.from(`${process.env.MONNIFY_API_KEY}:${process.env.MONNIFY_SECRET_KEY}`).toString('base64');
  try {
    const response = await axios.post('https://api.monnify.com/api/v1/auth/login', {}, {
      headers: { 'Authorization': `Basic ${authHeader}` }
    });
    return response.data.responseBody.accessToken;
  } catch (error) {
    console.error('Monnify Auth Error:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// --- INITIATE PAYOUT ---
app.post('/api/payout', async (req, res) => {
  try {
    const token = await getMonnifyToken();
    const { amount, accountNumber, bankCode } = req.body;
    const result = await axios.post('https://api.monnify.com/api/v1/disbursements/single', 
      {
        amount,
        reference: 'REF-' + Date.now(),
        narration: "Test Payout",
        destinationBankCode: bankCode,
        destinationAccountNumber: accountNumber,
        currency: "NGN",
        sourceAccountNumber: "6623723314"
      }, 
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    res.status(200).json(result.data);
  } catch (err) {
    res.status(500).json(err.response ? err.response.data : { error: err.message });
  }
});

// --- 5. START THE MISSION ---
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Oni Omolabake Engine is ONLINE');
});

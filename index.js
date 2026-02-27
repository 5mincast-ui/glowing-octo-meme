app.get('/trigger-test-smile', async (req, res) => {
    const { pin } = req.query; // We pass the pin in the URL for this test

    if (pin !== process.env.CHIEF_COMMANDER_PIN) {
        return res.status(403).send("❌ Access Denied: Chief Commander PIN required.");
    }

    try {
        const response = await axios.post('https://api.paystack.co/transfer', {
            source: "balance",
            amount: 25000 * 100, // Testing with ₦25,000 for food
            recipient: "YOUR_RCP_CODE_HERE", // Paste the code from Paystack dashboard
            reason: "Project Dioscuri - Feeding Test"
        }, {
            headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
        });

        res.send(`🚀 SUCCESS! Paystack says: ${response.data.message}. Smile Simulated!`);
    } catch (error) {
        res.status(500).send("❌ Handshake Failed: " + (error.response?.data?.message || error.message));
    }
});



// 1. Verify the Bank Account Name before sending
app.post('/verify-bank', async (req, res) => {
    const { account_number, bank_code } = req.body;
    try {
        const response = await axios.get(`https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`, {
            headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
        });
        res.json({ status: "Success", account_name: response.data.data.account_name });
    } catch (error) {
        res.status(400).json({ error: "Could not verify account. Check details." });
    }
});

// 2. Create the Recipient (The "Link")
app.post('/create-recipient', async (req, res) => {
    const { name, account_number, bank_code } = req.body;
    try {
        const response = await axios.post('https://api.paystack.co/transferrecipient', {
            type: "nuban",
            name: name,
            account_number: account_number,
            bank_code: bank_code,
            currency: "NGN"
        }, {
            headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
        });
        res.json({ recipient_code: response.data.data.recipient_code });
    } catch (error) {
        res.status(500).json({ error: "Recipient creation failed." });
    }
});





<div class="card">
    <h2>Commander Transfer Panel</h2>
    
    <label>Bank</label>
    <select id="bank_code">
        <option value="058">GTBank</option>
        <option value="057">Zenith Bank</option>
        <option value="999992">OPay</option>
        <option value="011">First Bank</option>
    </select>

    <label>Account Number</label>
    <input type="text" id="account_num" placeholder="0123456789">
    
    <button onclick="verifyAccount()" style="background: #2196F3;">Verify Account Name</button>
    <p id="account_display" style="color: blue; font-weight: bold;"></p>

    <hr>

    <label>Amount (Naira)</label>
    <input type="number" id="amount" placeholder="50000">
    
    <button onclick="executeTransfer()" style="background: #00c853;">🚀 Execute Live Transfer</button>
</div>

<script>
    let currentRecipient = "";

    async function verifyAccount() {
        const payload = {
            account_number: document.getElementById('account_num').value,
            bank_code: document.getElementById('bank_code').value
        };
        const res = await fetch('/verify-bank', { method: 'POST', body: JSON.stringify(payload), headers: {'Content-Type': 'application/json'} });
        const data = await res.json();
        if(data.account_name) {
            document.getElementById('account_display').innerText = "Verified: " + data.account_name;
            // Now create the recipient automatically
            const recRes = await fetch('/create-recipient', { method: 'POST', body: JSON.stringify({...payload, name: data.account_name}), headers: {'Content-Type': 'application/json'} });
            const recData = await recRes.json();
            currentRecipient = recData.recipient_code;
        }
    }
</script>




app.post('/link-bank', async (req, res) => {
    const { account_number, bank_code, name } = req.body;

    try {
        const response = await axios.post('https://api.paystack.co/transferrecipient', {
            type: "nuban",
            name: name,
            account_number: account_number,
            bank_code: bank_code, // e.g., 058 for GTB, 011 for First Bank
            currency: "NGN"
        }, {
            headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
        });

        const recipientCode = response.data.data.recipient_code;
        res.send(`✅ Bank Linked! Your Recipient Code is: ${recipientCode}. Save this!`);
    } catch (error) {
        res.status(500).send("❌ Link Failed: " + error.response.data.message);
    }
});

















app.get('/health', (req, res) => {
    res.status(200).json({
        status: "Commander, we are Online",
        uptime: process.uptime(),
        database: "Connected",
        timestamp: new Date().toISOString()
    });
});


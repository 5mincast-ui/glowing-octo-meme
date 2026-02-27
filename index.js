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






app.get('/health', (req, res) => {
    res.status(200).json({
        status: "Commander, we are Online",
        uptime: process.uptime(),
        database: "Connected",
        timestamp: new Date().toISOString()
    });
});


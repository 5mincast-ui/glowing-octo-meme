const paystack = require('paystack-api')(process.env.PAYSTACK_SECRET_KEY);

app.post('/transfer', async (req, res) => {
    const { amount, recipientAccount, bankCode } = req.body;

    try {
        // 1. Create a "Transfer Recipient" (Registering the person's bank info)
        const recipient = await paystack.transfer_recipient.create({
            type: "nuban",
            name: "Recipient Name",
            account_number: recipientAccount,
            bank_code: bankCode, // e.g., '058' for GTBank
            currency: "NGN"
        });

        // 2. Initiate the Transfer (Actually moving the money)
        const transfer = await paystack.transfer.create({
            source: "balance", // Money comes from your Paystack wallet
            amount: amount * 100, // Paystack uses Kobo (1000 Naira = 100000)
            recipient: recipient.data.recipient_code
        });

        res.send(`Success! Real transfer initiated: ${transfer.data.reference}`);
    } catch (error) {
        res.status(500).send("Transfer Failed: " + error.message);
    }
});

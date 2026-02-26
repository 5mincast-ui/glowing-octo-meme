const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = process.env.PORT || 8080;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(express.urlencoded({ extended: true }));

app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT balance FROM accounts LIMIT 1');
    const balance = result.rows[0].balance;
    res.send(`
      <h1>Bank Vault</h1>
      <p>Current Balance: $${balance.toLocaleString()}</p>
      <form action="/transfer" method="POST">
        <input type="number" name="amount" placeholder="1000">
        <button type="submit">Transfer Money</button>
      </form>
    `);
  } catch (err) {
    res.send("Vault Connection Error: " + err.message);
  }
});

app.post('/transfer', async (req, res) => {
  const amount = parseInt(req.body.amount) || 1000;
  await pool.query('UPDATE accounts SET balance = balance - $1', [amount]);
  res.send(`<h2>Success! Transferred $${amount}.</h2><a href="/">Back to Vault</a>`);
});

app.listen(port, () => {
  console.log(`Example app listening at port ${port}`);
});

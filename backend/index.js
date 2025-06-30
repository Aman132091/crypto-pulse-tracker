import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors());

const PORT = 5000;

app.get('/api/prices', async (req, res) => {
  try {
    const symbols = ['BTCUSDT', 'ETHUSDT', 'DOGEUSDT', 'SOLUSDT', 'ADAUSDT'];
    const prices = {};

    for (const symbol of symbols) {
      const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
      const data = await response.json();
      const name = symbol.replace('USDT', '').toLowerCase();
      prices[name] = parseFloat(data.price);
    }

    res.json(prices);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
});

app.get('/api/history', async (req, res) => {
  try {
    const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=24`);
    const data = await response.json();

    const history = data.map((d) => ({
      time: new Date(d[0]).toLocaleTimeString(),
      price: parseFloat(d[4]),
    }));

    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

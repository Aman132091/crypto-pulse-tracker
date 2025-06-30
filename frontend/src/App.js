import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts';

const CRYPTOS = ['bitcoin', 'ethereum', 'dogecoin', 'solana', 'cardano'];

function App() {
  const [prices, setPrices] = useState({});
  const [bitcoinHistory, setBitcoinHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/prices');
        const data = await res.json();
        console.log("🔄 Prices fetched:", data);

        const updatedPrices = {
          bitcoin: data.btc,
          ethereum: data.eth,
          dogecoin: data.doge,
          solana: data.sol,
          cardano: data.ada,
        };

        setPrices(updatedPrices);

        if (updatedPrices.bitcoin) {
          setBitcoinHistory(prev => [
            ...prev.slice(-23),
            {
              time: new Date().toLocaleTimeString(),
              price: updatedPrices.bitcoin,
            },
          ]);
        }
      } catch (err) {
        console.error('❌ Failed to fetch prices:', err);
      }
    };

    const fetchHistory = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/history');
        const history = await res.json();
        setBitcoinHistory(history);
      } catch (err) {
        console.error('❌ Failed to fetch history:', err);
      }
    };

    fetchHistory();
    fetchPrices();
    const interval = setInterval(fetchPrices, 3000);
    return () => clearInterval(interval);
  }, []);

  const toggleFavorite = (crypto) => {
    setFavorites(prev =>
      prev.includes(crypto)
        ? prev.filter(f => f !== crypto)
        : [...prev, crypto]
    );
  };

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const downloadCSV = () => {
    const headers = ['Crypto', 'Price (USD)'];
    const rows = CRYPTOS.map(crypto => [
      crypto.toUpperCase(),
      prices[crypto] ? parseFloat(prices[crypto]).toFixed(4) : 'N/A'
    ]);
    const csvContent =
      [headers, ...rows].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'crypto-prices.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sortedCryptos = [...CRYPTOS].sort((a, b) => {
    const aFav = favorites.includes(a);
    const bFav = favorites.includes(b);
    return aFav === bFav ? 0 : aFav ? -1 : 1;
  });

  const bgColor = darkMode ? '#121212' : '#ffffff';
  const textColor = darkMode ? '#ffffff' : '#000000';

  return (
    <div style={{
      padding: '2rem',
      fontFamily: 'Arial',
      backgroundColor: bgColor,
      color: textColor,
      minHeight: '100vh',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>📈 CryptoPulse: Live Prices</h1>
        <div>
          <button onClick={downloadCSV} style={{
            marginRight: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            ⬇️ Download CSV
          </button>
          <button onClick={toggleDarkMode} style={{
            padding: '0.5rem 1rem',
            backgroundColor: darkMode ? '#f5f5f5' : '#333',
            color: darkMode ? '#333' : 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            {darkMode ? '🌞 Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
      </div>

      <table border="1" cellPadding="10" style={{
        marginTop: '2rem',
        minWidth: '300px',
        width: '100%',
        borderCollapse: 'collapse',
        backgroundColor: darkMode ? '#1e1e1e' : '#f9f9f9'
      }}>
        <thead>
          <tr>
            <th>Crypto</th>
            <th>Price (USD)</th>
          </tr>
        </thead>
        <tbody>
          {sortedCryptos.map((crypto) => (
            <tr key={crypto}>
              <td>
                <button onClick={() => toggleFavorite(crypto)} style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  marginRight: '0.5rem'
                }}>
                  {favorites.includes(crypto) ? '⭐' : '☆'}
                </button>
                {crypto.toUpperCase()}
              </td>
              <td>
                {prices[crypto]
                  ? `$${parseFloat(prices[crypto]).toFixed(2)}`
                  : 'Loading...'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginTop: '3rem' }}>📊 Bitcoin Live Chart</h2>
      {bitcoinHistory.length === 0 ? (
        <p>Waiting for data...</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={bitcoinHistory}>
            <XAxis dataKey="time" />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip />
            <CartesianGrid stroke="#ccc" />
            <Line type="monotone" dataKey="price" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default App;

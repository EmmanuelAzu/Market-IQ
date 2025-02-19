// server.js
require('dotenv').config();
console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.trim() : "Not found");
const express = require('express');
const fetch = require('node-fetch'); // For Node <18; for Node 18+ you can use global fetch
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files (your HTML, CSS, JS) from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Endpoint: /api/stock-data
 * Proxies requests to Alpha Vantage
 */
app.get('/api/stock-data', async (req, res) => {
  const { symbol, timeframe } = req.query;
  if (!symbol || !timeframe) {
    return res.status(400).json({ error: 'Missing symbol or timeframe parameter.' });
  }

  let functionName;
  let intervalParam = "";

  if (timeframe === 'daily') {
    functionName = 'TIME_SERIES_DAILY';
  } else {
    functionName = 'TIME_SERIES_INTRADAY';
    intervalParam = `&interval=${timeframe}`;
  }

  const url = `https://www.alphavantage.co/query?function=${functionName}${intervalParam}&symbol=${symbol}&apikey=${process.env.AV_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    let timeSeriesKey;
    if (functionName === 'TIME_SERIES_DAILY') {
      timeSeriesKey = 'Time Series (Daily)';
    } else {
      timeSeriesKey = Object.keys(data).find(key => key.includes("Time Series"));
    }

    const timeSeries = data[timeSeriesKey];
    if (!timeSeries) {
      return res.status(400).json({ error: `No data found for symbol: ${symbol} with timeframe: ${timeframe}` });
    }

    // Process data similar to your original code
    const candlestickDP = [];
    const volumeDP = [];
    const closeDP = [];
    
    const sortedDates = Object.keys(timeSeries).sort();
    sortedDates.forEach(dateStr => {
      const dayInfo = timeSeries[dateStr];
      const dateVal = new Date(dateStr);
      const open = parseFloat(dayInfo['1. open']);
      const high = parseFloat(dayInfo['2. high']);
      const low  = parseFloat(dayInfo['3. low']);
      const close= parseFloat(dayInfo['4. close']);
      const volume = parseFloat(dayInfo['5. volume']) || 0;
  
      candlestickDP.push({
        x: dateVal,
        y: [open, high, low, close],
        color: open < close ? "green" : "red"
      });
      volumeDP.push({
        x: dateVal,
        y: volume,
        color: open < close ? "green" : "red"
      });
      closeDP.push({ x: dateVal, y: close });
    });
  
    res.json({ candlestickDP, volumeDP, closeDP });
  } catch (error) {
    console.error("Error fetching stock data:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Endpoint: /api/stock-news
 * Proxies requests to Finnhub for stock news
 */
app.get('/api/stock-news', async (req, res) => {
  const { symbol } = req.query;
  if (!symbol) {
    return res.status(400).json({ error: 'Missing symbol parameter.' });
  }
  
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  const fromDate = thirtyDaysAgo.toISOString().split('T')[0];
  const toDate = today.toISOString().split('T')[0];

  const url = `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${fromDate}&to=${toDate}&token=${process.env.FINNHUB_API_KEY}`;

  try {
    const response = await fetch(url);
    const newsData = await response.json();
    res.json(newsData);
  } catch (err) {
    console.error("Error fetching news:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

/**
 * Endpoint: /api/chatbot
 * Proxies requests to OpenAI's API
 */
app.post('/api/chatbot', async (req, res) => {
    const userMessage = req.body.message;
    if (!userMessage) {
      return res.status(400).json({ error: 'No message provided.' });
    }
  
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {

        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY.trim()}`
        },
        body: JSON.stringify({
          model: 'gpt-4', // or use "gpt-3.5-turbo" if needed
          messages: [{ role: 'user', content: userMessage }]
        })
      });
  
      if (!response.ok) {
        const errText = await response.text();
        console.error("Error from OpenAI:", errText);
        return res.status(response.status).json({ error: errText });
      }
  
      const data = await response.json();
      const botMessage = data.choices[0].message.content;
      res.json({ message: botMessage });
    } catch (error) {
      console.error("Error in /api/chatbot:", error);
      res.status(777).json({ error: 'Internal server error' });
    }
  });
  
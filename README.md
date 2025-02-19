# MarketIQ

MarketIQ is a web application that combines a stock market dashboard with real-time data, news, and a chatbot assistant powered by OpenAI. Whether you're a casual investor or a trader, MarketIQ makes it easy to track stock prices, read related news, and interact with a conversational AI for quick insights and analysis.

---

## Table of Contents

1. [Features](#features)  
2. [Tech Stack](#tech-stack)  
3. [Project Structure](#project-structure)  
4. [Installation & Setup](#installation--setup)  
5. [Usage](#usage)  
6. [Environment Variables](#environment-variables)  
7. [Contributing](#contributing)  

---

## Features

1. **Chatbot (OpenAI)**  
   - Leverages GPT-4 to answer finance-related questions. (currently not functional)
   - Conversation UI with user and bot messages.

2. **Stock Viewer (Alpha Vantage)**  
   - Fetch intraday or daily stock data from Alpha Vantage.  
   - Display interactive candlestick and volume charts via CanvasJS.

3. **News Feed (Finnhub)**  
   - Retrieve recent articles related to a given stock symbol.  
   - Showcase horizontally scrolling news cards (image + headline).

4. **Responsive UI**  
   - Built with HTML, CSS, and JavaScript (no heavy framework).  
   - Mobile-friendly design.

---

## Tech Stack

- **Front-End**  
  - HTML, CSS, JavaScript  
  - [CanvasJS](https://canvasjs.com/) for charting

- **Back-End**  
  - [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)  
  - [OpenAI API](https://platform.openai.com/docs/introduction) for chatbot  
  - [Alpha Vantage API](https://www.alphavantage.co/) for stock data  
  - [Finnhub API](https://finnhub.io/) for stock news

- **Environment**  
  - `.env` for storing API keys securely (ignored by Git)

---

## Project Structure

```bash
MarketIQ/
├─ public/
│   ├─ index.html         # Main landing page
│   ├─ chatbot.html       # Chatbot interface
│   ├─ stockviewer.html   # Stock viewer page
│   ├─ css/
│   │   └─ style.css
│   └─ js/
│       ├─ chatbot.js     # Handles chatbot front-end logic
│       ├─ app.js         # Stock data & news logic
│       └─ ...
├─ .env                   # Environment variables (ignored by Git)
├─ .gitignore
├─ package.json
├─ server.js              # Express server for API & static file serving
└─ README.md

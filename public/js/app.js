/************************************************************
 * js/app.js
 * 
 * Features:
 *  1. Alpha Vantage for stock data (CanvasJS StockChart).
 *  2. Timeframe selection (intraday vs daily).
 *  3. Finnhub for related stock news displayed as horizontally
 *     scrolling cards with image + headline.
 ************************************************************/

//I removed the API keys

/** 2. DOM Elements */
const stockSymbolInput = document.getElementById('stockSymbol');
const timeframeSelect = document.getElementById('timeframeSelect');
const searchBtn = document.getElementById('searchBtn');
const newsContainer = document.getElementById('news-container');

searchBtn.addEventListener('click', () => {
  const symbol = stockSymbolInput.value.trim().toUpperCase();
  const timeframe = timeframeSelect.value; // e.g. "1min", "5min", "daily"

  if (!symbol) {
    alert("Please enter a valid stock symbol.");
    return;
  }

  fetchStockData(symbol, timeframe);
  fetchStockNews(symbol);
});

/**
 * 3. Fetch Stock Data from Alpha Vantage, then render with CanvasJS StockChart
 */
function fetchStockData(symbol, timeframe) {
  let functionName;
  let intervalParam = "";

  if (timeframe === 'daily') {
    functionName = 'TIME_SERIES_DAILY';
  } else {
    functionName = 'TIME_SERIES_INTRADAY';
    intervalParam = `&interval=${timeframe}`; // e.g. &interval=5min
  }

  const url = `https://www.alphavantage.co/query?function=${functionName}${intervalParam}&symbol=${symbol}&apikey=${AV_API_KEY}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      let timeSeriesKey;
      if (functionName === 'TIME_SERIES_DAILY') {
        timeSeriesKey = 'Time Series (Daily)';
      } else {
        // e.g. "Time Series (5min)"
        timeSeriesKey = Object.keys(data).find(key => key.includes("Time Series"));
      }

      const timeSeries = data[timeSeriesKey];
      if (!timeSeries) {
        alert(`No data found for symbol: ${symbol} with timeframe: ${timeframe}`);
        console.error("Alpha Vantage response:", data);
        return;
      }

      // Convert data into candlestick arrays
      // candlestickDP = [ { x: Date, y: [open, high, low, close], color? }, ... ]
      // volumeDP      = [ { x: Date, y: volume }, ... ]
      // closeDP       = [ { x: Date, y: close }, ... ] for the navigator
      const candlestickDP = [];
      const volumeDP = [];
      const closeDP = [];

      // Sort date strings so oldest -> newest
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

      renderCanvasJSChart(symbol, timeframe, candlestickDP, volumeDP, closeDP);
    })
    .catch(err => {
      console.error("Error fetching stock data:", err);
      alert("Error fetching stock data. Check console for details.");
    });
}

/**
 * 4. Render the CanvasJS StockChart
 */
function renderCanvasJSChart(symbol, timeframe, candlestickDP, volumeDP, closeDP) {
  const stockChart = new CanvasJS.StockChart("chartContainer", {
    exportEnabled: true,
    theme: "light2",
    title: {
      text: `${symbol} (${timeframe}) Chart`
    },
    charts: [
      // First chart with candlestick
      {
        toolTip: {
          shared: true
        },
        axisX: {
          crosshair: {
            enabled: true,
            snapToDataPoint: true
          }
        },
        axisY2: {
          title: `${symbol} Price`,
          prefix: "$"
        },
        data: [
          {
            type: "candlestick",
            yValueFormatString: "$#,###.##",
            axisYType: "secondary",
            risingColor: "green",
            fallingColor: "red",
            name: "Price",
            dataPoints: candlestickDP
          }
        ]
      },
      // Second chart for volume
      {
        height: 100,
        toolTip: {
          shared: true
        },
        axisX: {
          crosshair: {
            enabled: true,
            snapToDataPoint: true
          }
        },
        axisY2: {
          title: "Volume",
          prefix: ""
        },
        data: [
          {
            type: "column",
            axisYType: "secondary",
            name: "Volume",
            yValueFormatString: "#,###",
            dataPoints: volumeDP
          }
        ]
      }
    ],
    navigator: {
      data: [
        {
          // This is the mini-chart in the navigator
          dataPoints: closeDP
        }
      ],
      slider: {
        minimum: new Date(2023, 0, 1),  // sample date range
        maximum: new Date()            // today's date
      }
    }
  });

  // Render the chart
  stockChart.render();
}

/**
 * 5. Fetch Finnhub News
 */
function fetchStockNews(symbol) {
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const fromDate = thirtyDaysAgo.toISOString().split('T')[0];
  const toDate = today.toISOString().split('T')[0];

  const url = `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${fromDate}&to=${toDate}&token=${FINNHUB_API_KEY}`;

  fetch(url)
    .then(res => res.json())
    .then(newsData => {
      displayNews(newsData, symbol);
    })
    .catch(err => {
      console.error("Error fetching news:", err);
      alert("Error fetching news. See console for details.");
    });
}

/**
 * 6. Display News (Horizontal Cards)
 */
function displayNews(newsArray, symbol) {
  // Clear old news
  newsContainer.innerHTML = '';

  // If no news or invalid response
  if (!Array.isArray(newsArray) || newsArray.length === 0) {
    newsContainer.innerHTML = `<p>No recent news available for ${symbol}.</p>`;
    return;
  }

  // Heading, centered above the scroll row
  const heading = document.createElement('h2');
  heading.textContent = `Recent News for ${symbol}`;
  heading.style.textAlign = 'center';
  newsContainer.appendChild(heading);

  // Container for cards (flex row)
  const cardsContainer = document.createElement('div');
  cardsContainer.style.display = 'flex';
  cardsContainer.style.flexWrap = 'nowrap';
  cardsContainer.style.overflowX = 'auto';
  cardsContainer.style.gap = '1rem';
  cardsContainer.style.padding = '10px 0';

  newsArray.forEach(item => {
    const card = document.createElement('div');
    card.className = 'news-card';
    card.style.width = '200px';
    card.style.height = '250px';
    card.style.flex = '0 0 auto';
    card.style.border = '1px solid #ddd';
    card.style.borderRadius = '6px';
    card.style.overflow = 'hidden';
    card.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';

    // If there's an image
    if (item.image) {
      const img = document.createElement('img');
      img.src = item.image;
      img.alt = 'News Image';
      img.style.width = '100%';
      img.style.height = '120px';
      img.style.objectFit = 'cover';
      card.appendChild(img);
    }

    // Headline link
    const headlineLink = document.createElement('a');
    headlineLink.href = item.url;
    headlineLink.target = '_blank';
    headlineLink.textContent = item.headline;
    headlineLink.style.display = 'block';
    headlineLink.style.padding = '10px';
    headlineLink.style.textDecoration = 'none';
    headlineLink.style.color = '#333';
    headlineLink.style.fontWeight = 'bold';
    card.appendChild(headlineLink);

    cardsContainer.appendChild(card);
  });

  // Append the row of cards after the heading
  newsContainer.appendChild(cardsContainer);
}

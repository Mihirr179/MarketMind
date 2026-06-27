import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();


const to2 = (n) => {
  if (n == null || !Number.isFinite(Number(n))) return "";
  return Number(n).toFixed(2);
};

const toPct = (n) => {
  if (n == null || !Number.isFinite(Number(n))) return "";
  return `${Number(n).toFixed(2)}%`;
};

function normalize(s) {
  return (s || "")
    .toString()
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");
}

function resolveLocalTicker(input) {
  const inNorm = normalize(input);
  const inLower = (input || "").toString().trim().toLowerCase();

  // Crypto
  if (["BTC", "BITCOIN", "BTCUSD", "BTC-USD"].includes(inNorm)) return "BTC-USD";
  if (["ETH", "ETHEREUM", "ETHUSD", "ETH-USD"].includes(inNorm)) return "ETH-USD";
  if (["SOL", "SOLANA"].includes(inNorm)) return "SOL-USD";
  if (["DOGE", "DOGECOIN"].includes(inNorm)) return "DOGE-USD";

  // US Stocks
  const us = {
    AAPL: "AAPL",
    MSFT: "MSFT",
    NVDA: "NVDA",
    TSLA: "TSLA",
    AMZN: "AMZN",
    GOOGL: "GOOGL",
    GOOGLE: "GOOGL",
  };
  if (us[inNorm]) return us[inNorm];

  // Indian equities (minimal explicit mapping per requirements)
  const ind = {
    RELIANCE: "RELIANCE.NS",
    TCS: "TCS.NS",
    INFY: "INFY.NS",
    SBIN: "SBIN.NS",
    HDFCBANK: "HDFCBANK.NS",
    ICICIBANK: "ICICIBANK.NS",
    LT: "LT.NS",
    ITC: "ITC.NS",
    BHARTIARTL: "BHARTIARTL.NS",
  };
  if (ind[inNorm]) return ind[inNorm];

  // Company names -> tickers
  const nameMap = [
    { match: "RELIANCE", out: "RELIANCE.NS" },
    { match: "INFOSYS", out: "INFY.NS" },
    { match: "TCS", out: "TCS.NS" },
    { match: "TATA CONSULTANCY", out: "TCS.NS" },
    { match: "TESLA", out: "TSLA" },
    { match: "APPLE", out: "AAPL" },
    { match: "MICROSOFT", out: "MSFT" },
    { match: "AMAZON", out: "AMZN" },
    { match: "GOOGLE", out: "GOOGL" },
  ];
  for (const { match, out } of nameMap) {
    if (inLower.includes(match.toLowerCase())) return out;
  }

  return "";
}

async function resolveWithYahooSearch(query) {
  const result = await yahooFinance.search(query);
  const quotes = result?.quotes || [];

  if (!quotes.length) return "";

  const qUpper = (query || "").toString().trim().toUpperCase();

  const preferred =
    quotes.find(
      (q) =>
        q?.symbol?.toUpperCase() === qUpper ||
        q?.symbol?.toUpperCase()?.endsWith(".NS") ||
        q?.symbol?.toUpperCase()?.endsWith(".BO") ||
        q?.symbol?.toUpperCase()?.endsWith("-USD")
    ) || quotes[0];

  return (preferred?.symbol || "").toString();
}



export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbolParam = (searchParams.get("symbol") || "").trim();
    const q = (searchParams.get("q") || "").trim();

    if (!symbolParam && !q) {
      return Response.json({ error: "Stock not found" });
    }

    const input = (symbolParam || q).trim();
    if (!input) {
      return Response.json({ error: "Stock not found" });
    }

    let resolvedSymbol = resolveLocalTicker(input);
    if (!resolvedSymbol) {
      // Fallback to Yahoo search via yahoo-finance2.
      resolvedSymbol = await resolveWithYahooSearch(input);
    }

    if (!resolvedSymbol) {
      return Response.json({ error: "Stock not found" }, { status: 404 });
    }

    // Fetch quote via yahoo-finance2.
    const quote = await yahooFinance.quote(resolvedSymbol);

    // quote fields are commonly: regularMarketOpen, regularMarketDayHigh,
    // regularMarketDayLow, regularMarketPrice, regularMarketPreviousClose,
    // regularMarketChangePercent, etc.
    const open = quote?.regularMarketOpen;
    const high = quote?.regularMarketDayHigh;
    const low = quote?.regularMarketDayLow;
    const price = quote?.regularMarketPrice;
    const prevClose = quote?.regularMarketPreviousClose ?? quote?.preMarketPrice;

    // Prefer changePercent from quote if available; otherwise derive.
    let changePercent = quote?.regularMarketChangePercent;
    if (changePercent == null && quote?.regularMarketChange != null && prevClose != null) {
      if (Number(prevClose) !== 0) {
        changePercent = (Number(quote.regularMarketChange) / Number(prevClose)) * 100;
      }
    }

    // yahoo-finance2 often returns changePercent in percent already.
    // Ensure a % string.
    const changePercentNum =
      changePercent != null && Number.isFinite(Number(changePercent))
        ? Number(changePercent)
        : null;

    return Response.json({
      "Global Quote": {
        "01. symbol": resolvedSymbol,
        "02. open": to2(open),
        "03. high": to2(high),
        "04. low": to2(low),
        "05. price": to2(price),
        "08. previous close": to2(prevClose),
        "10. change percent": changePercentNum == null ? "" : toPct(changePercentNum),
      },
    });
  } catch (err) {
    console.error("Yahoo Finance Error:", err);

    return Response.json(
      {
        error: err?.message || "Yahoo Finance Error",
        stack:
          process.env.NODE_ENV === "development" ? err?.stack : undefined,
      },
      { status: 500 }
    );
  }
}




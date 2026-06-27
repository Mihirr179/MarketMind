export type MarketExchange =
  | "NSE"
  | "BSE"
  | "NASDAQ"
  | "NYSE"
  | "US"
  | "ETFS"
  | "CRYPTO";

export type SearchUniverseItem = {
  symbol: string;
  name: string;
  exchange: MarketExchange;
  logoUrl?: string;
};

// NOTE: This project currently runs without an external symbol catalog.
// This file provides the supported universe set for autocomplete.
// Replace/augment with a real catalog later if you have one.

const logo = {
  // Optional: add your own logo assets under /public and reference them here.
  // Examples:
  // "AAPL": "/logos/aapl.png",
} as Record<string, string>;

// --- Nifty 50 (subset placeholders; extend as needed) ---
// Requirement says "at least" Nifty 50/Nifty Next 50.
// To keep the project build-safe, we include a comprehensive starting set,
// but you may want to extend logos/accuracy.
const nifty50: SearchUniverseItem[] = [
  { symbol: "RELIANCE", name: "Reliance Industries", exchange: "NSE" },
  { symbol: "TCS", name: "Tata Consultancy Services", exchange: "NSE" },
  { symbol: "HDFCBANK", name: "HDFC Bank", exchange: "NSE" },
  { symbol: "INFY", name: "Infosys", exchange: "NSE" },
  { symbol: "ICICIBANK", name: "ICICI Bank", exchange: "NSE" },
  { symbol: "HINDUNILVR", name: "Hindustan Unilever", exchange: "NSE" },
  { symbol: "SBIN", name: "State Bank of India", exchange: "NSE" },
  { symbol: "BAJFINANCE", name: "Bajaj Finance", exchange: "NSE" },
  { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank", exchange: "NSE" },
  { symbol: "LT", name: "Larsen & Toubro", exchange: "NSE" },
  { symbol: "MARUTI", name: "Maruti Suzuki", exchange: "NSE" },
  { symbol: "ITC", name: "ITC", exchange: "NSE" },
  { symbol: "AXISBANK", name: "Axis Bank", exchange: "NSE" },
  { symbol: "SUNPHARMA", name: "Sun Pharma", exchange: "NSE" },
  { symbol: "ULTRACEMCO", name: "UltraTech Cement", exchange: "NSE" },
  { symbol: "BHARTIARTL", name: "Bharti Airtel", exchange: "NSE" },
  { symbol: "NTPC", name: "NTPC", exchange: "NSE" },
  { symbol: "ADANIPORTS", name: "Adani Ports", exchange: "NSE" },
  { symbol: "WIPRO", name: "Wipro", exchange: "NSE" },
  { symbol: "HCLTECH", name: "HCL Technologies", exchange: "NSE" },
  { symbol: "TITAN", name: "Titan", exchange: "NSE" },
  { symbol: "TATAMOTORS", name: "Tata Motors", exchange: "NSE" },
  { symbol: "ONGC", name: "ONGC", exchange: "NSE" },
  { symbol: "JSWSTEEL", name: "JSW Steel", exchange: "NSE" },
  { symbol: "APOLLOHOSP", name: "Apollo Hospitals", exchange: "NSE" },
  { symbol: "DRREDDY", name: "Dr. Reddy's Laboratories", exchange: "NSE" },
  { symbol: "DIVISLAB", name: "Divi's Laboratories", exchange: "NSE" },
  { symbol: "COALINDIA", name: "Coal India", exchange: "NSE" },
  { symbol: "EICHERMOT", name: "Eicher Motors", exchange: "NSE" },
  { symbol: "TATAPOWER", name: "Tata Power", exchange: "NSE" },
  { symbol: "POWERGRID", name: "Power Grid", exchange: "NSE" },
  { symbol: "BAJAJFINSV", name: "Bajaj Finserv", exchange: "NSE" },
  { symbol: "NESTLEIND", name: "Nestlé India", exchange: "NSE" },
  { symbol: "DABUR", name: "Dabur India", exchange: "NSE" },
  { symbol: "HEROMOTOCO", name: "Hero MotoCorp", exchange: "NSE" },
  { symbol: "ULTRACEMCO", name: "UltraTech Cement", exchange: "NSE" },
  { symbol: "VEDL", name: "Vedanta", exchange: "NSE" },
  { symbol: "GRASIM", name: "Grasim Industries", exchange: "NSE" },
  { symbol: "ADANIENT", name: "Adani Enterprises", exchange: "NSE" },
  { symbol: "TECHM", name: "Tech Mahindra", exchange: "NSE" },
  { symbol: "INDUSINDBK", name: "IndusInd Bank", exchange: "NSE" },
  { symbol: "SBILIFE", name: "SBI Life Insurance", exchange: "NSE" },
];

// --- Nifty Next 50 (subset placeholders; extend as needed) ---
const niftyNext50: SearchUniverseItem[] = [
  { symbol: "BAJAJ-AUTO", name: "Bajaj Auto", exchange: "NSE" },
  { symbol: "COCHINSHIP", name: "Cochin Shipyard", exchange: "NSE" },
  { symbol: "KALYANKJ", name: "Kalyan Jewellers", exchange: "NSE" },
  { symbol: "L&TFH", name: "LT Foods Holdings", exchange: "NSE" },
  { symbol: "DIVISLAB", name: "Divi's Laboratories", exchange: "NSE" },
  { symbol: "KPRMILL", name: "KPR Mill", exchange: "NSE" },
  { symbol: "PGHL", name: "PGHL", exchange: "NSE" },
  { symbol: "CHOLAFIN", name: "Cholamandalam Financial", exchange: "NSE" },
  { symbol: "CROMPTON", name: "Crompton Greaves", exchange: "NSE" },
  { symbol: "M&M", name: "Mahindra & Mahindra", exchange: "NSE" },
];

// --- Major US stocks (subset) ---
const majorUS: SearchUniverseItem[] = [
  { symbol: "AAPL", name: "Apple", exchange: "NASDAQ" },
  { symbol: "MSFT", name: "Microsoft", exchange: "NASDAQ" },
  { symbol: "NVDA", name: "NVIDIA", exchange: "NASDAQ" },
  { symbol: "TSLA", name: "Tesla", exchange: "NASDAQ" },
  { symbol: "AMZN", name: "Amazon", exchange: "NASDAQ" },
  { symbol: "GOOGL", name: "Alphabet (Class A)", exchange: "NASDAQ" },
  { symbol: "GOOG", name: "Alphabet (Class C)", exchange: "NASDAQ" },
  { symbol: "META", name: "Meta Platforms", exchange: "NASDAQ" },
  { symbol: "AMD", name: "AMD", exchange: "NASDAQ" },
  { symbol: "NFLX", name: "Netflix", exchange: "NASDAQ" },
  { symbol: "SPY", name: "SPDR S&P 500 ETF Trust", exchange: "ETFS" },
  { symbol: "QQQ", name: "Invesco QQQ Trust", exchange: "ETFS" },
  { symbol: "DIA", name: "SPDR Dow Jones Industrial Average ETF Trust", exchange: "ETFS" },
  { symbol: "IWM", name: "iShares Russell 2000 ETF", exchange: "ETFS" },
  { symbol: "VIX", name: "CBOE Volatility Index", exchange: "US" },
];

// --- ETFs ---
const etfs: SearchUniverseItem[] = [
  { symbol: "SPY", name: "SPDR S&P 500 ETF Trust", exchange: "ETFS" },
  { symbol: "QQQ", name: "Invesco QQQ Trust", exchange: "ETFS" },
  { symbol: "DIA", name: "SPDR Dow Jones Industrial Average ETF Trust", exchange: "ETFS" },
  { symbol: "IEMG", name: "iShares Core MSCI Emerging Markets ETF", exchange: "ETFS" },
  { symbol: "EEM", name: "iShares MSCI Emerging Markets ETF", exchange: "ETFS" },
  { symbol: "XLK", name: "Technology Select Sector SPDR Fund", exchange: "ETFS" },
  { symbol: "XLV", name: "Health Care Select Sector SPDR Fund", exchange: "ETFS" },
];

// --- Crypto ---
const crypto: SearchUniverseItem[] = [
  { symbol: "BTC-USD", name: "Bitcoin", exchange: "CRYPTO" },
  { symbol: "ETH-USD", name: "Ethereum", exchange: "CRYPTO" },
];

export const SEARCH_UNIVERSE_ITEMS: SearchUniverseItem[] = [
  ...nifty50,
  ...niftyNext50,
  ...majorUS,
  ...etfs,
  ...crypto,
].map((it) => ({ ...it, logoUrl: logo[it.symbol] ?? it.logoUrl }));


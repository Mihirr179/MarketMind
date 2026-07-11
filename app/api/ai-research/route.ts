import { connectDB } from "@/lib/mongodb";

import { getMarketDetails } from "@/lib/marketDetails/index";

export type AiResearchRecommendation = "BUY" | "HOLD" | "SELL";

export type AiResearchStructuredResult = {
  recommendation: AiResearchRecommendation;
  confidencePercent: number;
  risk: string;
  technicalSummary: string;
  fundamentalSummary: string;
  positiveSignals: string[];
  negativeSignals: string[];
  catalysts: string[];
  risks: string[];
  investmentHorizon: string;
  supportLevels: string[];
  resistanceLevels: string[];
};



type NewsArticle = {
  source?: { id?: string; name?: string };
  title?: string;
  publishedAt?: string;
  // Not all NewsAPI deployments provide these fields.
  // We'll pass through whatever we get.
  description?: string;
};


function safeJsonParse<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function toCompact(v: unknown) {
  if (v == null) return null;
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return v;
  if (Array.isArray(v)) return v.slice(0, 50);
  if (typeof v === "object") return v;
  return String(v);
}

export async function POST(request: Request) {
  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    if (!geminiApiKey) {
      return Response.json(
        { error: "Server not configured: GEMINI_API_KEY missing" },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => null);
    const symbol = String(body?.symbol || "").trim().toUpperCase();

    if (!symbol || !/^[A-Z0-9.-]{1,12}$/.test(symbol)) {
      return Response.json({ error: "Invalid ticker" }, { status: 400 });
    }

    // Basic concurrency: fetch market details + news in parallel
const [marketDetailsValue, news] = await Promise.all([
      getMarketDetails(symbol),

      (async () => {
        // Use existing internal news API (real external NewsAPI via /api/news)
        // This route runs server-side; fetch relative is not safe. We'll call NewsAPI directly here
        // to ensure we have the same behavior.
        const apikey = process.env.NEWS_API_KEY;
        if (!apikey) {
          throw new Error("Server not configured: NEWS_API_KEY missing");
        }
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10_000);
        try {
          const response = await fetch(
            `https://newsapi.org/v2/top-headlines?category=business&language=en&pageSize=12&apiKey=${encodeURIComponent(
              apikey
            )}&q=${encodeURIComponent(symbol)}`,
            { signal: controller.signal }
          );
          const data = await response.json().catch(() => null);
          if (!response.ok || data?.status === "error") {
            // Still allow AI to run; but we want to surface no-news appropriately
            return [] as NewsArticle[];
          }
          return Array.isArray(data?.articles) ? data.articles : [];
        } finally {
          clearTimeout(timeout);
        }
      })(),
    ]);

    // Technical context: try to load 1Y chart candles from our chart endpoint
    // (Still real API because app/api/market-chart does AlphaVantage fetch.)
    const technicalCandles = await (async () => {
      const apikey = process.env.ALPHA_VANTAGE_API_KEY;
      if (!apikey) return null;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);
      try {
        const response = await fetch(
          `https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=${encodeURIComponent(
            symbol
          )}&apikey=${encodeURIComponent(apikey)}`,
          { signal: controller.signal }
        );
        const data = await response.json().catch(() => null);
        if (!response.ok || data?.Note || data?.Error) return null;
        const candidateKeys = ["Weekly Time Series", "Time Series (Weekly)" ];
        const seriesKey = candidateKeys.find((k) => data?.[k] && typeof data[k] === "object");
        const series = seriesKey ? data[seriesKey] : null;
        if (!series) return null;
        const dates = Object.keys(series).slice(0, 80).sort();
        return dates
          .map((d) => {
            const row = series[d];
            return {
              date: d,
              open: toCompact(row?.["1. open"]),
              high: toCompact(row?.["2. high"]),
              low: toCompact(row?.["3. low"]),
              close: toCompact(row?.["4. close"]),
              volume: toCompact(row?.["5. volume"]),
            };
          })
          .filter(Boolean);
      } finally {
        clearTimeout(timeout);
      }
    })();

    const newsSummaries = Array.isArray(news)
      ? news
          .slice(0, 8)
          .map((a) => ({
            source: a.source?.name || a.source?.id || "Unknown",
            time: a.publishedAt || null,
            headline: a.title || "",
          }))
      : [];

    const prompt = {
      text: `You are MarketMind AI. Analyze the stock for symbol ${symbol}.

Return ONLY valid JSON that matches this TypeScript type:

{
  recommendation: "BUY" | "HOLD" | "SELL",
  confidencePercent: number, // 0-100
  risk: string, // e.g., Low/Medium/High
  technicalSummary: string,
  fundamentalSummary: string,
  positiveSignals: string[],
  negativeSignals: string[],
  catalysts: string[],
  risks: string[],
  investmentHorizon: string,
  supportLevels: string[],
  resistanceLevels: string[]
}

Use these inputs (use them directly, do not invent numeric fields):

MARKET_DETAILS:
${JSON.stringify(marketDetailsValue, null, 2)}

LATEST_NEWS:

${JSON.stringify(newsSummaries, null, 2)}

TECHNICAL_CONTEXT (weekly candles subset; may be null):
${JSON.stringify(technicalCandles, null, 2)}

Rules:
- If you do not have enough technical data, still fill technicalSummary but keep support/resistance as best-effort ranges described in text.
- Never output markdown. Output JSON only.
`,
    };

    const contents = [
      {
        role: "user",
        parts: [{ text: prompt.text }],
      },
    ];

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      geminiModel
    )}:generateContent?key=${encodeURIComponent(geminiApiKey)}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = data?.error?.message || data?.message || "Gemini request failed";
      return Response.json({ error: errorMessage }, { status: response.status || 500 });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== "string" || !text.trim()) {
      return Response.json({ error: "AI service returned empty response" }, { status: 502 });
    }

    // Some models may wrap JSON in text; attempt to extract first JSON object.
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    const jsonSlice = firstBrace >= 0 && lastBrace > firstBrace ? text.slice(firstBrace, lastBrace + 1) : text;

    const parsed = safeJsonParse<AiResearchStructuredResult>(jsonSlice);
    if (!parsed) {
      return Response.json(
        { error: "AI returned invalid JSON", raw: text.slice(0, 1000) },
        { status: 502 }
      );
    }

    // Save completed analysis in MongoDB
    await connectDB();
    const { default: AnalysisReport } = await import("@/models/AnalysisReport");

    const summary = `${parsed.recommendation} with ${parsed.confidencePercent}% confidence. ${parsed.technicalSummary.slice(
      0,
      220
    )}`;

    const doc = await AnalysisReport.create({
      ticker: symbol,
      recommendation: parsed.recommendation,
      confidence: parsed.confidencePercent,
      risk: parsed.risk,
      timestamp: new Date(),
      summary,
      payload: parsed,
    });

    return Response.json({ result: parsed, stored: { id: doc._id, ticker: doc.ticker } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to run AI research";
    const status = message.toLowerCase().includes("timeout") ? 504 : 500;
    return Response.json({ error: message }, { status });
  }
}


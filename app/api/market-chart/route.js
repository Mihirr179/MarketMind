export async function GET(request) {
  try {
    const url = new URL(request.url);
    const symbolParam = url.searchParams.get("symbol");
    const range = (url.searchParams.get("range") || "1D").toUpperCase();

    const symbol = (symbolParam || "SPY").trim().toUpperCase();

    const apikey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apikey) {
      return Response.json(
        { error: "Server not configured: ALPHA_VANTAGE_API_KEY missing" },
        { status: 500 }
      );
    }

    // AlphaVantage provides these time-series functions:
    // - TIME_SERIES_DAILY
    // - TIME_SERIES_WEEKLY
    // - TIME_SERIES_MONTHLY
    // There is also TIME_SERIES_INTRADAY but not needed for 1D here.

    const functionMap = {
      "1D": { functionName: "TIME_SERIES_DAILY", points: 30 },
      "1W": { functionName: "TIME_SERIES_DAILY", points: 120 },
      "1M": { functionName: "TIME_SERIES_DAILY", points: 300 },
      "1Y": { functionName: "TIME_SERIES_WEEKLY", points: 200 },
    };

    const selected = functionMap[range] || functionMap["1D"];

    const functionName = selected.functionName;
    const points = selected.points;

    const response = await fetch(
      `https://www.alphavantage.co/query?function=${encodeURIComponent(
        functionName
      )}&symbol=${encodeURIComponent(symbol)}&apikey=${apikey}`
    );

    const data = await response.json();

    if (!response.ok || data?.Note || data?.Error) {
      return Response.json(
        { error: data?.Note || data?.Error || "AlphaVantage request failed" },
        { status: 429 }
      );
    }

    // AlphaVantage can include either the expected time-series object OR an error payload.
    const note = data?.Note;
    const error = data?.Error;
    if (note || error) {
      return Response.json(
        { error: note || error || "AlphaVantage request failed" },
        { status: 429 }
      );
    }

    // Find the first time-series object key dynamically (avoids key mismatches).
    const candidateKeys = [
      "Time Series (Daily)",
      "Weekly Time Series",
      "Monthly Time Series",
    ];

    const seriesKey = candidateKeys.find(
      (k) => data?.[k] && typeof data[k] === "object"
    );

    const series = seriesKey ? data?.[seriesKey] : null;
    if (!series || typeof series !== "object") {
      // Some AlphaVantage accounts/API settings return a different payload.
      // Return full available keys to debug.
      return Response.json(
        {
          error: "AlphaVantage time series not found",
          availableKeys: Object.keys(data || {}),
          samplePayload: data,
        },
        { status: 500 }
      );
    }



    // AlphaVantage returns newest-first keys. Convert to newest -> array then reverse.
    const dates = Object.keys(series);

    // Take newest N dates then sort ascending.
    const selectedDates = dates.slice(0, points);
    selectedDates.sort(); // ascending (oldest -> newest)

    const candles = selectedDates.map((date) => {
      const row = series[date];
      const open = Number(row["1. open"]);
      const high = Number(row["2. high"]);
      const low = Number(row["3. low"]);
      const close = Number(row["4. close"]);
      const volume = Number(row["5. volume"]);

      return {
        date,
        open: Number.isFinite(open) ? open : null,
        high: Number.isFinite(high) ? high : null,
        low: Number.isFinite(low) ? low : null,
        close: Number.isFinite(close) ? close : null,
        volume: Number.isFinite(volume) ? volume : null,
      };
    });

    return Response.json({ symbol, range, candles });
  } catch (err) {
    const message = err?.name === "AbortError" ? "Request timeout" : err?.message;
    return Response.json(
      { error: message || "Failed to build chart data" },
      { status: 500 }
    );
  }
}


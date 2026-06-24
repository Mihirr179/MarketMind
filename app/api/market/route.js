export async function GET(request) {
  try {
    const url = new URL(request.url);
    const symbolsParam = url.searchParams.get("symbols");

    const defaultSymbols = [
      "AAPL",
      "MSFT",
      "NVDA",
      "TSLA",
      "AMZN",
      "GOOGL",
      "META",
      "AMD",
      "NFLX",
      "SPY",
    ];

    const symbols = (
      symbolsParam
        ? symbolsParam
            .split(",")
            .map((s) => s.trim().toUpperCase())
            .filter(Boolean)
        : defaultSymbols
    ).slice(0, 30);

    const apikey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apikey) {
      return Response.json(
        { error: "Server not configured: ALPHA_VANTAGE_API_KEY missing" },
        { status: 500 }
      );
    }

    // AlphaVantage has strict rate limits. Keep concurrency low.
    const results = [];

    for (const symbol of symbols) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);

      try {
        const response = await fetch(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(
            symbol
          )}&apikey=${apikey}`,
          { signal: controller.signal }
        );

        const data = await response.json();

        if (!response.ok || data?.Note || data?.Error) {
          // Store the error but keep processing other symbols.
          results.push({
            symbol,
            error: data?.Note || data?.Error || "AlphaVantage request failed",
          });
          continue;
        }

        const quote = data?.["Global Quote"];
        const priceStr = quote?.["05. price"];
        const changePercentStr = quote?.["10. change percent"];
        const changesAbsStr = quote?.["09. changes"];

        const price = priceStr != null ? Number(priceStr) : null;
        const changePercent =
          typeof changePercentStr === "string"
            ? Number(changePercentStr.replace("%", ""))
            : null;
        const changeAbs =
          changesAbsStr != null && typeof changesAbsStr === "string"
            ? Number(changesAbsStr)
            : null;

        results.push({
          symbol: quote?.["01. symbol"] || symbol,
          price: Number.isFinite(price) ? price : null,
          changePercent: Number.isFinite(changePercent) ? changePercent : null,
          changeAbs: Number.isFinite(changeAbs) ? changeAbs : null,
          // Name isn't provided by GLOBAL_QUOTE; keep field for UI consistency.
          name: null,
        });
      } finally {
        clearTimeout(timeout);
      }
    }

    // Normalize for UI.
    return Response.json(
      results.map((r) => ({
        symbol: r.symbol,
        price: r.price,
        changePercent: r.changePercent,
        changeAbs: r.changeAbs,
        error: r.error,
      }))
    );
  } catch (err) {
    const message = err?.name === "AbortError" ? "Request timeout" : err?.message;
    return Response.json(
      { error: message || "Failed to build market data" },
      { status: 500 }
    );
  }
}


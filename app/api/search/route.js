export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");

    if (!symbol) {
      return Response.json(
        { error: "Missing required query param: symbol" },
        { status: 400 }
      );
    }

    const apikey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apikey) {
      return Response.json(
        { error: "Server not configured: ALPHA_VANTAGE_API_KEY missing" },
        { status: 500 }
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${apikey}`,
      { signal: controller.signal }
    );

    clearTimeout(timeout);

    const data = await response.json();

    // AlphaVantage often returns 200 with error payloads for rate limiting / invalid symbol
    if (!response.ok || data?.Note || data?.Error) {
      return Response.json(
        {
          error: "AlphaVantage request failed",
          details: data,
        },
        { status: 502 }
      );
    }

    return Response.json(data);
  } catch (err) {
    const message = err?.name === "AbortError" ? "Request timeout" : err?.message;
    return Response.json(
      { error: message || "Failed to fetch from AlphaVantage" },
      { status: 500 }
    );
  }
}

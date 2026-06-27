export async function GET(request) {
  try {
    const url = new URL(request.url);
    const yahooTicker = (url.searchParams.get("ticker") || "").trim();
    if (!yahooTicker) {
      return Response.json({ error: "Missing ticker" }, { status: 400 });
    }

    const quoteSummaryUrl =
      `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(
        yahooTicker
      )}?modules=price,summaryDetail`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    const response = await fetch(quoteSummaryUrl, { signal: controller.signal });
    const text = await response.text();
    clearTimeout(timeout);

    let json = null;
    try {
      json = JSON.parse(text);
    } catch {
      // keep json null
    }

    return Response.json({
      ok: response.ok,
      status: response.status,
      url: quoteSummaryUrl,
      textSample: text?.slice(0, 500) || "",
      parsed: json,
    });
  } catch (err) {
    return Response.json({ error: err?.message || "debug failed" }, { status: 500 });
  }
}


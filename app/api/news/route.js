export async function GET() {
  try {
    const apikey = process.env.NEWS_API_KEY;
    if (!apikey) {
      return Response.json(
        { error: "Server not configured: NEWS_API_KEY missing" },
        { status: 500 }
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?category=business&language=en&pageSize=12&apiKey=${apikey}`,
      { signal: controller.signal }
    );

    clearTimeout(timeout);

    const data = await response.json();

    if (!response.ok) {
      return Response.json(
        {
          error: "Alpha/News request failed",
          details: data,
        },
        { status: 502 }
      );
    }

    if (data?.status === "error") {
      return Response.json(
        {
          error: "Failed to fetch news",
          details: data,
        },
        { status: 502 }
      );
    }

    return Response.json(data?.articles ?? []);
  } catch (error) {
    const message = error?.name === "AbortError" ? "Request timeout" : error?.message;
    return Response.json(
      { error: message || "Failed to fetch news" },
      { status: 500 }
    );
  }
}

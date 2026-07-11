import { getMarketDetails } from "@/lib/marketDetails/index";

export async function GET(request: Request) {

  try {
    const url = new URL(request.url);
    const symbol = (url.searchParams.get("symbol") || "").trim();

    if (!symbol) {
      return Response.json({ error: "Missing symbol" }, { status: 400 });
    }

    const data = await getMarketDetails(symbol);
    return Response.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load market details";
    const status = message.toLowerCase().includes("timeout") ? 504 : 500;
    return Response.json({ error: message }, { status });
  }
}


import { getMarketDetails } from "@/lib/marketDetails";

export async function validateStockSymbol(symbol: string): Promise<
  | { ok: true; companyName?: string }
  | { ok: false; message: string }
> {
  try {
    const data = await getMarketDetails(symbol);
    return { ok: true, companyName: data.name };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid stock symbol";
    return { ok: false, message };
  }
}


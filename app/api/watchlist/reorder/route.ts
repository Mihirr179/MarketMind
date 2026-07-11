import { connectDB } from "@/lib/mongodb";
import { getBearerToken, verifyToken } from "@/lib/auth";
import User from "@/models/User";

export async function PATCH(req: Request) {
  try {
    await connectDB();

    const verified = verifyToken(getBearerToken(req));
    if (!verified.ok) {
      return Response.json(
        { success: false, message: verified.message },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));

    const symbolsRaw = body?.symbols;
    if (!Array.isArray(symbolsRaw) || symbolsRaw.length === 0) {
      return Response.json(
        { success: false, message: "symbols array is required" },
        { status: 400 }
      );
    }

    const symbols = symbolsRaw
      .filter((s) => typeof s === "string")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    const user = await User.findById(verified.userId);
    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const current = user.watchlist || [];

    // Keep only symbols that exist in user's current watchlist.
    const currentSymbolsSet = new Set(
      current.map((x: { symbol: string }) => x.symbol.toUpperCase())
    );

    const orderedSymbols = Array.from(new Set(symbols)).filter((s) =>
      currentSymbolsSet.has(s)
    );

    const bySymbol = new Map(
      current.map((x: { symbol: string }) => [x.symbol.toUpperCase(), x])
    );

    const reordered = orderedSymbols
      .map((s) => bySymbol.get(s))
      .filter((x): x is { symbol: string } => Boolean(x));

    // Append any items not mentioned in payload (if partial reorder).
    const remainder = current.filter(
      (x: { symbol: string }) =>
        !new Set(reordered.map((r) => r.symbol.toUpperCase())).has(
          x.symbol.toUpperCase()
        )
    );

    user.watchlist = [...reordered, ...remainder];


    await user.save();

    return Response.json({ success: true, watchlist: user.watchlist });
  } catch (error) {
    console.error("Watchlist REORDER error:", error);
    return Response.json(
      { success: false, message: "Failed to reorder watchlist" },
      { status: 500 }
    );
  }
}


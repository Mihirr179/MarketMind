import { connectDB } from "@/lib/mongodb";
import { getBearerToken, verifyToken } from "@/lib/auth";
import User from "@/models/User";
import { validateStockSymbol } from "@/lib/watchlist/validateStockSymbol";

export async function GET(req: Request) {
  try {
    await connectDB();

    const verified = verifyToken(getBearerToken(req));
    if (!verified.ok) {
      return Response.json(
        { success: false, message: verified.message },
        { status: 401 }
      );
    }

    const user = await User.findById(verified.userId).select("watchlist");
    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      watchlist: user.watchlist || [],
    });
  } catch (error) {
    console.error("Watchlist GET error:", error);
    return Response.json(
      { success: false, message: "Failed to load watchlist" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const verified = verifyToken(getBearerToken(req));
    if (!verified.ok) {
      return Response.json(
        { success: false, message: verified.message },
        { status: 401 }
      );
    }

    const body: unknown = await req.json().catch(() => ({}));

    const symbolRaw =
      typeof body === "object" && body !== null
        ? (body as { symbol?: unknown }).symbol
        : undefined;

    if (typeof symbolRaw !== "string") {
      return Response.json(
        { success: false, message: "symbol is required" },
        { status: 400 }
      );
    }

    const symbol = symbolRaw.trim().toUpperCase();

    const validation = await validateStockSymbol(symbol);
    if (!validation.ok) {
      return Response.json(
        { success: false, message: validation.message },
        { status: 400 }
      );
    }

    const companyName = validation.companyName;

    const user = await User.findById(verified.userId);
    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    user.watchlist = user.watchlist || [];

    const existing = user.watchlist.find(
      (x: { symbol: string }) => x.symbol.toUpperCase() === symbol
    );

    if (existing) {
      return Response.json(
        { success: false, message: "Already exists" },
        { status: 409 }
      );
    }

    user.watchlist.unshift({
      symbol,
      companyName,
      addedAt: new Date(),
    });

    await user.save();

    return Response.json({
      success: true,
      watchlist: user.watchlist,
    });
  } catch (error) {
    console.error("Watchlist POST error:", error);
    return Response.json(
      { success: false, message: "Failed to save watchlist" },
      { status: 500 }
    );
  }
}


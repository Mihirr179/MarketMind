import { connectDB } from "@/lib/mongodb";
import { getBearerToken, verifyToken } from "@/lib/auth";
import User from "@/models/User";
import type { NextRequest } from "next/server";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ symbol: string }> }
): Promise<Response> {
  try {
    await connectDB();

    const verified = verifyToken(getBearerToken(req));
    if (!verified.ok) {
      return Response.json(
        { success: false, message: verified.message },
        { status: 401 }
      );
    }

    const params = await context.params;
    const rawSymbol = params.symbol;

    const symbol =
      typeof rawSymbol === "string" && rawSymbol.trim()
        ? rawSymbol.trim().toUpperCase()
        : "";

    if (!symbol) {
      return Response.json(
        { success: false, message: "symbol is required" },
        { status: 400 }
      );
    }

    const user = await User.findById(verified.userId);
    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    user.watchlist = (user.watchlist || []).filter(
      (x: { symbol: string }) => x.symbol.toUpperCase() !== symbol
    );

    await user.save();

    return Response.json({ success: true, watchlist: user.watchlist });
  } catch (error) {
    console.error("Watchlist DELETE error:", error);
    return Response.json(
      { success: false, message: "Failed to remove from watchlist" },
      { status: 500 }
    );
  }
}


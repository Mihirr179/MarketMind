import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();
    const { default: AnalysisReport } = await import("@/models/AnalysisReport");

    const items = await AnalysisReport.find({})
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    return Response.json({ items });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load reports";
    return Response.json({ error: message }, { status: 500 });
  }
}


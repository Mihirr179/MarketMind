import mongoose from "mongoose";

const AnalysisReportSchema = new mongoose.Schema({
  ticker: { type: String, required: true, index: true },
  recommendation: {
    type: String,
    enum: ["BUY", "HOLD", "SELL"],
    required: true,
  },
  confidence: { type: Number, required: true },
  risk: { type: String, required: true },
  timestamp: { type: Date, required: true, default: () => new Date() },
  summary: { type: String, required: true },
  // Store the full structured AI output for future UI expansion (optional)
  payload: { type: Object, default: {} },
});

export default mongoose.models.AnalysisReport ||
  mongoose.model("AnalysisReport", AnalysisReportSchema);


import mongoose from "mongoose";

const PortfolioTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["BUY", "SELL"],
      required: true,
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      maxlength: 15,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0.000001,
    },
    price: {
      type: Number,
      required: true,
      min: 0.000001,
    },
    fees: {
      type: Number,
      default: 0,
      min: 0,
    },
    transactionDate: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

PortfolioTransactionSchema.index({
  user: 1,
  transactionDate: 1,
  createdAt: 1,
});

export default mongoose.models.PortfolioTransaction ||
  mongoose.model("PortfolioTransaction", PortfolioTransactionSchema);

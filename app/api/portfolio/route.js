import { connectDB } from "@/lib/mongodb";
import { getBearerToken, verifyToken } from "@/lib/auth";
import { calculatePortfolio } from "@/lib/portfolio";
import PortfolioTransaction from "@/models/PortfolioTransaction";

const SYMBOL_PATTERN = /^[A-Z0-9.-]{1,15}$/;

function authenticate(request) {
  return verifyToken(getBearerToken(request));
}

function serializeTransaction(transaction) {
  return {
    id: transaction._id.toString(),
    type: transaction.type,
    symbol: transaction.symbol,
    quantity: transaction.quantity,
    price: transaction.price,
    fees: transaction.fees,
    transactionDate: transaction.transactionDate.toISOString(),
    createdAt: transaction.createdAt.toISOString(),
  };
}

async function getTransactions(userId) {
  return PortfolioTransaction.find({ user: userId }).sort({
    transactionDate: 1,
    createdAt: 1,
    _id: 1,
  });
}

function buildPortfolioResponse(transactions) {
  const calculation = calculatePortfolio(transactions);

  if (!calculation.valid) {
    return calculation;
  }

  return {
    success: true,
    holdings: calculation.holdings,
    summary: calculation.summary,
    transactions: transactions
      .slice()
      .reverse()
      .map(serializeTransaction),
  };
}

export async function GET(request) {
  try {
    const verified = authenticate(request);
    if (!verified.ok) {
      return Response.json(
        { success: false, message: verified.message },
        { status: 401 }
      );
    }

    await connectDB();
    const transactions = await getTransactions(verified.userId);
    const portfolio = buildPortfolioResponse(transactions);

    if (!portfolio.success) {
      return Response.json(
        { success: false, message: portfolio.message },
        { status: 409 }
      );
    }

    return Response.json(portfolio);
  } catch (error) {
    console.error("Portfolio GET error:", error);
    return Response.json(
      { success: false, message: "Failed to load portfolio" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const verified = authenticate(request);
    if (!verified.ok) {
      return Response.json(
        { success: false, message: verified.message },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const type =
      typeof body.type === "string" ? body.type.trim().toUpperCase() : "";
    const symbol =
      typeof body.symbol === "string"
        ? body.symbol.trim().toUpperCase()
        : "";
    const quantity = Number(body.quantity);
    const price = Number(body.price);
    const fees =
      body.fees === "" || body.fees == null ? 0 : Number(body.fees);
    const transactionDate = new Date(body.transactionDate);

    if (!["BUY", "SELL"].includes(type)) {
      return Response.json(
        { success: false, message: "Transaction type must be BUY or SELL" },
        { status: 400 }
      );
    }

    if (!SYMBOL_PATTERN.test(symbol)) {
      return Response.json(
        { success: false, message: "Enter a valid stock symbol" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      return Response.json(
        { success: false, message: "Quantity must be greater than zero" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(price) || price <= 0) {
      return Response.json(
        { success: false, message: "Price must be greater than zero" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(fees) || fees < 0) {
      return Response.json(
        { success: false, message: "Fees cannot be negative" },
        { status: 400 }
      );
    }

    if (Number.isNaN(transactionDate.getTime())) {
      return Response.json(
        { success: false, message: "Enter a valid transaction date" },
        { status: 400 }
      );
    }

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    if (transactionDate > endOfToday) {
      return Response.json(
        { success: false, message: "Transaction date cannot be in the future" },
        { status: 400 }
      );
    }

    await connectDB();

    const existingTransactions = await getTransactions(verified.userId);
    const candidate = {
      _id: "candidate",
      user: verified.userId,
      type,
      symbol,
      quantity,
      price,
      fees,
      transactionDate,
      createdAt: new Date(),
    };
    const ledger = [...existingTransactions, candidate].sort((a, b) => {
      const dateDifference =
        new Date(a.transactionDate).getTime() -
        new Date(b.transactionDate).getTime();
      if (dateDifference !== 0) return dateDifference;

      return (
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    });
    const calculation = calculatePortfolio(ledger);

    if (!calculation.valid) {
      return Response.json(
        { success: false, message: calculation.message },
        { status: 400 }
      );
    }

    await PortfolioTransaction.create({
      user: verified.userId,
      type,
      symbol,
      quantity,
      price,
      fees,
      transactionDate,
    });

    const transactions = await getTransactions(verified.userId);
    return Response.json(buildPortfolioResponse(transactions), { status: 201 });
  } catch (error) {
    console.error("Portfolio POST error:", error);
    return Response.json(
      { success: false, message: "Failed to add transaction" },
      { status: 500 }
    );
  }
}

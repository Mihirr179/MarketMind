const EPSILON = 0.000001;

function round(value, decimals = 6) {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function calculatePortfolio(transactions) {
  const positions = new Map();
  let totalFees = 0;
  let realizedProfitLoss = 0;

  for (const transaction of transactions) {
    const symbol = transaction.symbol;
    const quantity = Number(transaction.quantity);
    const price = Number(transaction.price);
    const fees = Number(transaction.fees || 0);
    const position = positions.get(symbol) || {
      symbol,
      quantity: 0,
      costBasis: 0,
      realizedProfitLoss: 0,
    };

    totalFees += fees;

    if (transaction.type === "BUY") {
      position.quantity += quantity;
      position.costBasis += quantity * price + fees;
    } else {
      if (quantity > position.quantity + EPSILON) {
        return {
          valid: false,
          message: `Cannot sell ${quantity} ${symbol}; only ${round(
            position.quantity
          )} available on that date.`,
        };
      }

      const averageCost =
        position.quantity > EPSILON
          ? position.costBasis / position.quantity
          : 0;
      const removedCost = averageCost * quantity;
      const saleProfitLoss = quantity * price - fees - removedCost;

      position.quantity -= quantity;
      position.costBasis -= removedCost;
      position.realizedProfitLoss += saleProfitLoss;
      realizedProfitLoss += saleProfitLoss;

      if (position.quantity < EPSILON) {
        position.quantity = 0;
        position.costBasis = 0;
      }
    }

    positions.set(symbol, position);
  }

  const holdings = Array.from(positions.values())
    .filter((position) => position.quantity > EPSILON)
    .map((position) => ({
      symbol: position.symbol,
      quantity: round(position.quantity),
      averageCost: round(position.costBasis / position.quantity, 4),
      costBasis: round(position.costBasis, 2),
      realizedProfitLoss: round(position.realizedProfitLoss, 2),
    }))
    .sort((a, b) => a.symbol.localeCompare(b.symbol));

  return {
    valid: true,
    holdings,
    summary: {
      holdingsCount: holdings.length,
      totalQuantity: round(
        holdings.reduce((sum, holding) => sum + holding.quantity, 0)
      ),
      totalCostBasis: round(
        holdings.reduce((sum, holding) => sum + holding.costBasis, 0),
        2
      ),
      totalFees: round(totalFees, 2),
      realizedProfitLoss: round(realizedProfitLoss, 2),
    },
  };
}

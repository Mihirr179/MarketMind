"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  CircleDollarSign,
  Landmark,
  LoaderCircle,
  Plus,
  ReceiptText,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type TransactionType = "BUY" | "SELL";

type PortfolioTransaction = {
  id: string;
  type: TransactionType;
  symbol: string;
  quantity: number;
  price: number;
  fees: number;
  transactionDate: string;
  createdAt: string;
};

type Holding = {
  symbol: string;
  quantity: number;
  averageCost: number;
  costBasis: number;
  realizedProfitLoss: number;
};

type PortfolioSummary = {
  holdingsCount: number;
  totalQuantity: number;
  totalCostBasis: number;
  totalFees: number;
  realizedProfitLoss: number;
};

type PortfolioResponse = {
  success: boolean;
  message?: string;
  holdings: Holding[];
  transactions: PortfolioTransaction[];
  summary: PortfolioSummary;
};

const emptySummary: PortfolioSummary = {
  holdingsCount: 0,
  totalQuantity: 0,
  totalCostBasis: 0,
  totalFees: 0,
  realizedProfitLoss: 0,
};

function getToday() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatQuantity(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 6,
  }).format(value);
}

function formatTransactionDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

const inputClass =
  "mt-2 w-full rounded-xl border border-zinc-700 bg-black/50 px-4 py-3 text-white outline-none transition duration-200 placeholder:text-zinc-600 hover:border-zinc-600 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10";

export default function PortfolioPage() {
  const router = useRouter();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [transactions, setTransactions] = useState<PortfolioTransaction[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary>(emptySummary);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [form, setForm] = useState({
    type: "BUY" as TransactionType,
    symbol: "",
    quantity: "",
    price: "",
    fees: "0",
    transactionDate: getToday(),
  });

  const applyPortfolio = useCallback((data: PortfolioResponse) => {
    setHoldings(Array.isArray(data.holdings) ? data.holdings : []);
    setTransactions(
      Array.isArray(data.transactions) ? data.transactions : []
    );
    setSummary(data.summary || emptySummary);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPortfolio() {
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await fetch("/api/portfolio", {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const data = (await response.json()) as PortfolioResponse;

        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.replace("/login");
          return;
        }

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load portfolio");
        }

        applyPortfolio(data);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setMessage({
            type: "error",
            text:
              error instanceof Error
                ? error.message
                : "Unable to load portfolio",
          });
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadPortfolio();
    return () => controller.abort();
  }, [applyPortfolio, router]);

  const estimatedTotal = useMemo(() => {
    const quantity = Number(form.quantity);
    const price = Number(form.price);
    const fees = Number(form.fees || 0);
    if (!Number.isFinite(quantity) || !Number.isFinite(price)) return 0;

    const gross = quantity * price;
    return form.type === "BUY" ? gross + fees : Math.max(0, gross - fees);
  }, [form]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }

      const response = await fetch("/api/portfolio", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const data = (await response.json()) as PortfolioResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to add transaction");
      }

      applyPortfolio(data);
      setForm((current) => ({
        ...current,
        symbol: "",
        quantity: "",
        price: "",
        fees: "0",
      }));
      setMessage({
        type: "success",
        text: `${form.type === "BUY" ? "Buy" : "Sell"} transaction added.`,
      });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Unable to add transaction",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="grid min-h-[calc(100vh-5rem)] place-items-center bg-black">
        <LoaderCircle className="animate-spin text-yellow-400" size={34} />
      </main>
    );
  }

  return (
    <main className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-black px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-yellow-400/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-yellow-400">
            Investment ledger
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Portfolio
          </h1>
          <p className="mt-2 max-w-2xl text-zinc-400">
            Record every buy and sell to track shares, fees, weighted average
            cost, and realized performance.
          </p>
        </div>

        {message && (
          <div
            role="status"
            className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
              message.type === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-red-500/30 bg-red-500/10 text-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Current Cost Basis",
              value: formatCurrency(summary.totalCostBasis),
              icon: WalletCards,
              color: "text-yellow-400",
            },
            {
              label: "Open Holdings",
              value: String(summary.holdingsCount),
              icon: BriefcaseBusiness,
              color: "text-sky-400",
            },
            {
              label: "Realized P/L",
              value: formatCurrency(summary.realizedProfitLoss),
              icon: TrendingUp,
              color:
                summary.realizedProfitLoss >= 0
                  ? "text-emerald-400"
                  : "text-red-400",
            },
            {
              label: "Total Fees",
              value: formatCurrency(summary.totalFees),
              icon: ReceiptText,
              color: "text-zinc-300",
            },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 transition duration-200 hover:border-zinc-700"
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-zinc-400">{label}</p>
                <Icon size={20} className={color} />
              </div>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </section>

        <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          <form
            onSubmit={handleSubmit}
            className="h-fit rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 xl:sticky xl:top-28"
          >
            <div className="mb-6 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-yellow-400/10 text-yellow-400">
                <Plus size={20} />
              </span>
              <div>
                <h2 className="text-lg font-semibold">Add Transaction</h2>
                <p className="text-sm text-zinc-500">
                  Enter the executed trade details.
                </p>
              </div>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-black/50 p-1">
              {(["BUY", "SELL"] as TransactionType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() =>
                    setForm((current) => ({ ...current, type }))
                  }
                  className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition ${
                    form.type === type
                      ? type === "BUY"
                        ? "bg-emerald-400 text-black"
                        : "bg-red-400 text-black"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                  }`}
                >
                  {type === "BUY" ? (
                    <ArrowDownLeft size={17} />
                  ) : (
                    <ArrowUpRight size={17} />
                  )}
                  {type}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-zinc-300">
                Stock Symbol
                <input
                  required
                  value={form.symbol}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      symbol: event.target.value
                        .toUpperCase()
                        .replace(/[^A-Z0-9.-]/g, "")
                        .slice(0, 15),
                    }))
                  }
                  placeholder="AAPL"
                  className={inputClass}
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block text-sm font-medium text-zinc-300">
                  Quantity
                  <input
                    required
                    type="number"
                    min="0.000001"
                    step="any"
                    value={form.quantity}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        quantity: event.target.value,
                      }))
                    }
                    placeholder="10"
                    className={inputClass}
                  />
                </label>

                <label className="block text-sm font-medium text-zinc-300">
                  Price per Share
                  <input
                    required
                    type="number"
                    min="0.000001"
                    step="any"
                    value={form.price}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        price: event.target.value,
                      }))
                    }
                    placeholder="185.50"
                    className={inputClass}
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="block text-sm font-medium text-zinc-300">
                  Fees
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={form.fees}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        fees: event.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </label>

                <label className="block text-sm font-medium text-zinc-300">
                  Date
                  <input
                    required
                    type="date"
                    max={getToday()}
                    value={form.transactionDate}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        transactionDate: event.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </label>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-xl border border-zinc-800 bg-black/40 p-4">
              <span className="text-sm text-zinc-400">
                {form.type === "BUY" ? "Estimated cost" : "Estimated proceeds"}
              </span>
              <span className="font-bold text-yellow-400">
                {formatCurrency(estimatedTotal)}
              </span>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 font-bold text-black transition duration-200 hover:bg-yellow-300 hover:shadow-lg hover:shadow-yellow-400/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && <LoaderCircle className="animate-spin" size={18} />}
              {saving ? "Saving..." : `Add ${form.type}`}
            </button>
          </form>

          <div className="min-w-0 space-y-6">
            <section className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <Landmark className="text-yellow-400" size={21} />
                <div>
                  <h2 className="text-lg font-semibold">Current Holdings</h2>
                  <p className="text-sm text-zinc-500">
                    Average cost includes buy-side fees.
                  </p>
                </div>
              </div>

              {holdings.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-700 px-5 py-12 text-center">
                  <BriefcaseBusiness
                    className="mx-auto mb-3 text-zinc-600"
                    size={30}
                  />
                  <p className="font-medium">No open holdings yet</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    Add your first buy transaction to begin.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[620px] text-left text-sm">
                    <thead className="border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-500">
                      <tr>
                        <th className="px-3 py-3 font-medium">Symbol</th>
                        <th className="px-3 py-3 font-medium">Shares</th>
                        <th className="px-3 py-3 font-medium">Average Cost</th>
                        <th className="px-3 py-3 font-medium">Cost Basis</th>
                        <th className="px-3 py-3 text-right font-medium">
                          Realized P/L
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/80">
                      {holdings.map((holding) => (
                        <tr
                          key={holding.symbol}
                          className="transition hover:bg-zinc-900/60"
                        >
                          <td className="px-3 py-4 font-bold text-yellow-400">
                            {holding.symbol}
                          </td>
                          <td className="px-3 py-4">
                            {formatQuantity(holding.quantity)}
                          </td>
                          <td className="px-3 py-4">
                            {formatCurrency(holding.averageCost)}
                          </td>
                          <td className="px-3 py-4">
                            {formatCurrency(holding.costBasis)}
                          </td>
                          <td
                            className={`px-3 py-4 text-right font-semibold ${
                              holding.realizedProfitLoss >= 0
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                          >
                            {formatCurrency(holding.realizedProfitLoss)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <CalendarDays className="text-yellow-400" size={21} />
                <div>
                  <h2 className="text-lg font-semibold">
                    Transaction History
                  </h2>
                  <p className="text-sm text-zinc-500">
                    Most recent transactions appear first.
                  </p>
                </div>
              </div>

              {transactions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-700 px-5 py-12 text-center text-zinc-500">
                  No transactions recorded.
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => {
                    const isBuy = transaction.type === "BUY";
                    const total =
                      transaction.quantity * transaction.price +
                      (isBuy ? transaction.fees : -transaction.fees);

                    return (
                      <article
                        key={transaction.id}
                        className="flex flex-col gap-4 rounded-xl border border-zinc-800 bg-black/30 p-4 transition hover:border-zinc-700 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`grid size-10 place-items-center rounded-xl ${
                              isBuy
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-red-500/10 text-red-400"
                            }`}
                          >
                            {isBuy ? (
                              <ArrowDownLeft size={20} />
                            ) : (
                              <ArrowUpRight size={20} />
                            )}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">
                                {transaction.symbol}
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                                  isBuy
                                    ? "bg-emerald-500/10 text-emerald-400"
                                    : "bg-red-500/10 text-red-400"
                                }`}
                              >
                                {transaction.type}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-zinc-500">
                              {formatTransactionDate(
                                transaction.transactionDate
                              )}{" "}
                              · {formatQuantity(transaction.quantity)} shares
                              at {formatCurrency(transaction.price)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-8 sm:text-right">
                          <div>
                            <p className="text-xs text-zinc-500">Fees</p>
                            <p className="text-sm">
                              {formatCurrency(transaction.fees)}
                            </p>
                          </div>
                          <div className="min-w-24">
                            <p className="text-xs text-zinc-500">
                              {isBuy ? "Total cost" : "Net proceeds"}
                            </p>
                            <p className="font-bold text-white">
                              {formatCurrency(total)}
                            </p>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <div className="flex items-start gap-3 rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-4 text-sm text-zinc-400">
              <CircleDollarSign
                className="mt-0.5 shrink-0 text-yellow-400"
                size={18}
              />
              Average cost uses the weighted-average method. Buy fees increase
              cost basis; sell fees reduce realized proceeds.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

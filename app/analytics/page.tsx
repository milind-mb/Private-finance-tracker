"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { getTransactions } from "@/lib/db";
import type { Transaction } from "@/types";
import { RefreshCw } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

const PIE_COLORS = [
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#84cc16",
];

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n.toFixed(0)}`;
}

function getMonthKey(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(key: string) {
  const [y, m] = key.split("-");
  return new Date(Number(y), Number(m) - 1).toLocaleDateString("en-IN", {
    month: "short",
    year: "2-digit",
  });
}

export default function AnalyticsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTransactions()
      .then(setTransactions)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <RefreshCw size={24} className="animate-spin text-indigo-400" />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400 text-sm">
        No data yet. Add some transactions to see analytics.
      </div>
    );
  }

  // ── Monthly income vs expense bar chart ──────────────────────────────────────
  const monthlyMap: Record<string, { income: number; expense: number }> = {};
  for (const t of transactions) {
    const key = getMonthKey(t.date);
    if (!monthlyMap[key]) monthlyMap[key] = { income: 0, expense: 0 };
    if (t.type === "income") monthlyMap[key].income += Number(t.amount);
    else monthlyMap[key].expense += Number(t.amount);
  }
  const monthlyData = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([key, v]) => ({ name: getMonthLabel(key), ...v }));

  // ── Spending by category (expense only) ─────────────────────────────────────
  const catMap: Record<string, number> = {};
  for (const t of transactions.filter((t) => t.type === "expense")) {
    catMap[t.category] = (catMap[t.category] ?? 0) + Number(t.amount);
  }
  const catData = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));

  // ── Need vs Want ─────────────────────────────────────────────────────────────
  const expenses = transactions.filter((t) => t.type === "expense");
  const needTotal = expenses
    .filter((t) => t.need_type === "need")
    .reduce((s, t) => s + Number(t.amount), 0);
  const wantTotal = expenses
    .filter((t) => t.need_type === "want")
    .reduce((s, t) => s + Number(t.amount), 0);
  const needWantData = [
    { name: "Need", value: needTotal },
    { name: "Want", value: wantTotal },
  ].filter((d) => d.value > 0);

  // ── Monthly balance trend ────────────────────────────────────────────────────
  const trendData = monthlyData.map((m) => ({
    name: m.name,
    balance: m.income - m.expense,
  }));

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount), 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Analytics</h1>

      {/* Summary row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-50 border border-green-100 rounded-xl p-3">
          <p className="text-xs text-green-600 mb-0.5">Total Income</p>
          <p className="font-bold text-green-700">{fmt(totalIncome)}</p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl p-3">
          <p className="text-xs text-red-500 mb-0.5">Total Expenses</p>
          <p className="font-bold text-red-600">{fmt(totalExpenses)}</p>
        </div>
      </div>

      {/* Income vs Expense */}
      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <h2 className="text-sm font-semibold mb-4">Income vs Expenses (Monthly)</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tickFormatter={fmt} tick={{ fontSize: 10 }} width={45} />
            <Tooltip formatter={(v: number) => fmt(v)} />
            <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly balance trend */}
      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <h2 className="text-sm font-semibold mb-4">Monthly Balance Trend</h2>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={trendData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tickFormatter={fmt} tick={{ fontSize: 10 }} width={45} />
            <Tooltip formatter={(v: number) => fmt(v)} />
            <Line
              type="monotone"
              dataKey="balance"
              name="Balance"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Spending by category */}
      {catData.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <h2 className="text-sm font-semibold mb-4">Spending by Category</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={catData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {catData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => fmt(v)} />
            </PieChart>
          </ResponsiveContainer>
          {/* Category legend */}
          <ul className="mt-2 space-y-1">
            {catData.map((c, i) => (
              <li key={c.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
                    style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  {c.name}
                </span>
                <span className="font-medium">{fmt(c.value)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Need vs Want */}
      {needWantData.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <h2 className="text-sm font-semibold mb-4">Need vs Want</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={needWantData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
              >
                <Cell fill="#6366f1" />
                <Cell fill="#f59e0b" />
              </Pie>
              <Tooltip formatter={(v: number) => fmt(v)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          {needWantData.length === 2 && (
            <div className="flex justify-around text-center mt-2">
              <div>
                <p className="text-xs text-gray-500">Need</p>
                <p className="font-semibold text-indigo-600">{fmt(needTotal)}</p>
                <p className="text-xs text-gray-400">
                  {((needTotal / (needTotal + wantTotal)) * 100).toFixed(0)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Want</p>
                <p className="font-semibold text-amber-600">{fmt(wantTotal)}</p>
                <p className="text-xs text-gray-400">
                  {((wantTotal / (needTotal + wantTotal)) * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

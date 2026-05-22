"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { getDashboardStats } from "@/lib/db";
import type { Debt, Reminder } from "@/types";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Bell,
  RefreshCw,
} from "lucide-react";

interface Stats {
  balance: number;
  totalIncome: number;
  totalExpenses: number;
  totalDebtRemaining: number;
  upcomingDebts: Debt[];
  upcomingReminders: Reminder[];
  monthlyByCategory: Record<string, number>;
  monthlyTotal: number;
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function daysUntil(dateStr: string) {
  const diff =
    new Date(dateStr).getTime() - new Date().setHours(0, 0, 0, 0);
  return Math.ceil(diff / 86400000);
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboardStats();
      setStats(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw size={24} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
        <p className="font-medium mb-1">Connection error</p>
        <p className="text-xs">{error}</p>
        <button
          onClick={load}
          className="mt-2 text-xs underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) return null;

  const categoryEntries = Object.entries(stats.monthlyByCategory).sort(
    (a, b) => b[1] - a[1]
  );

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>

      {/* Main balance card */}
      <div className="bg-indigo-600 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-1 text-indigo-200 text-sm">
          <Wallet size={16} />
          Current Balance
        </div>
        <div className={`text-3xl font-bold ${stats.balance < 0 ? "text-red-300" : ""}`}>
          {fmt(stats.balance)}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-3 border border-gray-100">
          <div className="flex items-center gap-1 text-green-600 text-xs mb-1">
            <TrendingUp size={13} />
            Income
          </div>
          <div className="font-semibold text-sm text-gray-900">{fmt(stats.totalIncome)}</div>
        </div>
        <div className="bg-white rounded-xl p-3 border border-gray-100">
          <div className="flex items-center gap-1 text-red-500 text-xs mb-1">
            <TrendingDown size={13} />
            Expenses
          </div>
          <div className="font-semibold text-sm text-gray-900">{fmt(stats.totalExpenses)}</div>
        </div>
        <div className="bg-white rounded-xl p-3 border border-gray-100">
          <div className="flex items-center gap-1 text-orange-500 text-xs mb-1">
            <CreditCard size={13} />
            Debt
          </div>
          <div className="font-semibold text-sm text-gray-900">{fmt(stats.totalDebtRemaining)}</div>
        </div>
      </div>

      {/* Upcoming payments */}
      {(stats.upcomingDebts.length > 0 || stats.upcomingReminders.length > 0) && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <Bell size={15} className="text-amber-500" />
            <span className="text-sm font-semibold">Upcoming (30 days)</span>
          </div>
          <ul className="divide-y divide-gray-50">
            {stats.upcomingDebts.map((d) => {
              const days = daysUntil(d.due_date);
              return (
                <li key={d.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{d.name}</p>
                    <p className="text-xs text-gray-500">
                      EMI • {days === 0 ? "Today" : `${days}d`}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-orange-600">
                    {fmt(d.emi)}
                  </span>
                </li>
              );
            })}
            {stats.upcomingReminders.map((r) => {
              const days = daysUntil(r.date);
              return (
                <li key={r.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{r.title}</p>
                    <p className="text-xs text-gray-500">
                      Reminder • {days === 0 ? "Today" : `${days}d`}
                    </p>
                  </div>
                  {r.amount != null && (
                    <span className="text-sm font-semibold text-amber-600">
                      {fmt(r.amount)}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Monthly spending summary */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span className="text-sm font-semibold">This Month&apos;s Spending</span>
          <span className="text-sm font-bold text-red-500">{fmt(stats.monthlyTotal)}</span>
        </div>
        {categoryEntries.length === 0 ? (
          <p className="px-4 py-4 text-sm text-gray-400">No expenses this month</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {categoryEntries.map(([cat, amt]) => {
              const pct = stats.monthlyTotal > 0 ? (amt / stats.monthlyTotal) * 100 : 0;
              return (
                <li key={cat} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">{cat}</span>
                    <span className="text-sm font-medium">{fmt(amt)}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

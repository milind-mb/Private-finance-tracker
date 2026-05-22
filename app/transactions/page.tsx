"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useMemo } from "react";
import {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from "@/lib/db";
import type { Transaction, TransactionFormData } from "@/types";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import TransactionForm from "@/components/transactions/TransactionForm";
import { Plus, Search, SlidersHorizontal, Pencil, Trash2, RefreshCw } from "lucide-react";

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [filterNeed, setFilterNeed] = useState<"all" | "need" | "want">("all");
  const [showFilters, setShowFilters] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setTransactions(await getTransactions());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSave(data: TransactionFormData) {
    if (editing) {
      const updated = await updateTransaction(editing.id, data);
      setTransactions((prev) =>
        prev.map((t) => (t.id === editing.id ? updated : t))
      );
      setEditing(null);
    } else {
      const created = await addTransaction(data);
      setTransactions((prev) => [created, ...prev]);
    }
    setShowForm(false);
  }

  async function handleDelete(id: string) {
    await deleteTransaction(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    setDeleting(null);
  }

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        t.category.toLowerCase().includes(q) ||
        (t.note ?? "").toLowerCase().includes(q) ||
        String(t.amount).includes(q);
      const matchType = filterType === "all" || t.type === filterType;
      const matchNeed =
        filterNeed === "all" ||
        (t.type === "expense" && t.need_type === filterNeed);
      return matchSearch && matchType && matchNeed;
    });
  }, [transactions, search, filterType, filterNeed]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Transactions</h1>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {/* Search + filter bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2 border rounded-lg ${showFilters ? "border-indigo-500 text-indigo-600" : "border-gray-200 text-gray-500"}`}
        >
          <SlidersHorizontal size={17} />
        </button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-2 p-3 bg-white border border-gray-200 rounded-xl">
          <div className="flex gap-1">
            {(["all", "income", "expense"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setFilterType(v)}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  filterType === v
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {(["all", "need", "want"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setFilterNeed(v)}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  filterNeed === v
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <RefreshCw size={24} className="animate-spin text-indigo-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          {transactions.length === 0 ? "No transactions yet" : "No results found"}
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((t) => (
            <li
              key={t.id}
              className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3"
            >
              <div
                className={`w-2 h-10 rounded-full flex-shrink-0 ${
                  t.type === "income" ? "bg-green-500" : "bg-red-400"
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{t.category}</span>
                  {t.type === "expense" && t.need_type && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        t.need_type === "need"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-purple-50 text-purple-600"
                      }`}
                    >
                      {t.need_type}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-400">{fmtDate(t.date)}</span>
                  {t.note && (
                    <span className="text-xs text-gray-400 truncate">· {t.note}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span
                  className={`font-semibold text-sm ${
                    t.type === "income" ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
                </span>
                <button
                  onClick={() => { setEditing(t); setShowForm(true); }}
                  className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => setDeleting(t.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showForm && (
        <Modal
          title={editing ? "Edit Transaction" : "Add Transaction"}
          onClose={() => { setShowForm(false); setEditing(null); }}
        >
          <TransactionForm
            initial={editing ?? undefined}
            onSave={handleSave}
            onClose={() => { setShowForm(false); setEditing(null); }}
          />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          message="Delete this transaction? This cannot be undone."
          onConfirm={() => handleDelete(deleting)}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}

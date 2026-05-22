"use client";

import { useState } from "react";
import type { Transaction, TransactionFormData } from "@/types";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/types";

interface Props {
  initial?: Transaction;
  onSave: (data: TransactionFormData) => Promise<void>;
  onClose: () => void;
}

const today = new Date().toISOString().split("T")[0];

export default function TransactionForm({ initial, onSave, onClose }: Props) {
  const [form, setForm] = useState<TransactionFormData>({
    amount: initial?.amount ?? (0 as unknown as number),
    type: initial?.type ?? "expense",
    category: initial?.category ?? "",
    need_type: initial?.need_type ?? "need",
    note: initial?.note ?? "",
    date: initial?.date ?? today,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const categories =
    form.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  function set<K extends keyof TransactionFormData>(
    key: K,
    value: TransactionFormData[K]
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) {
      setErr("Amount must be greater than 0");
      return;
    }
    if (!form.category) {
      setErr("Please select a category");
      return;
    }
    setSaving(true);
    try {
      await onSave({ ...form, amount: Number(form.amount) });
      onClose();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Save failed");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* Type toggle */}
      <div className="flex rounded-lg border border-gray-200 overflow-hidden">
        {(["expense", "income"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              set("type", t);
              set("category", "");
            }}
            className={`flex-1 py-2 text-sm font-medium capitalize ${
              form.type === t
                ? t === "income"
                  ? "bg-green-600 text-white"
                  : "bg-red-500 text-white"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 block mb-1">
          Amount
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          required
          value={form.amount || ""}
          onChange={(e) => set("amount", e.target.value as unknown as number)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="0.00"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 block mb-1">
          Category
        </label>
        <select
          value={form.category}
          onChange={(e) => set("category", e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {form.type === "expense" && (
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">
            Need / Want
          </label>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {(["need", "want"] as const).map((nw) => (
              <button
                key={nw}
                type="button"
                onClick={() => set("need_type", nw)}
                className={`flex-1 py-2 text-sm font-medium capitalize ${
                  form.need_type === nw
                    ? "bg-indigo-600 text-white"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {nw}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="text-xs font-medium text-gray-500 block mb-1">
          Date
        </label>
        <input
          type="date"
          required
          value={form.date}
          onChange={(e) => set("date", e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 block mb-1">
          Note (optional)
        </label>
        <input
          type="text"
          value={form.note ?? ""}
          onChange={(e) => set("note", e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Add a note..."
        />
      </div>

      {err && <p className="text-xs text-red-500">{err}</p>}

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
        >
          {saving ? "Saving…" : initial ? "Update" : "Add"}
        </button>
      </div>
    </form>
  );
}

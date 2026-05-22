"use client";

import { useState } from "react";
import type { Debt, DebtFormData } from "@/types";

interface Props {
  initial?: Debt;
  onSave: (data: DebtFormData) => Promise<void>;
  onClose: () => void;
}

const today = new Date().toISOString().split("T")[0];

export default function DebtForm({ initial, onSave, onClose }: Props) {
  const [form, setForm] = useState<DebtFormData>({
    name: initial?.name ?? "",
    total_amount: initial?.total_amount ?? (0 as unknown as number),
    remaining_amount: initial?.remaining_amount ?? (0 as unknown as number),
    emi: initial?.emi ?? (0 as unknown as number),
    due_date: initial?.due_date ?? today,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  function set<K extends keyof DebtFormData>(key: K, value: DebtFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setErr("Name is required"); return; }
    if (Number(form.total_amount) <= 0) { setErr("Total amount must be > 0"); return; }
    if (Number(form.remaining_amount) < 0) { setErr("Remaining amount cannot be negative"); return; }
    if (Number(form.emi) <= 0) { setErr("EMI must be > 0"); return; }
    setSaving(true);
    try {
      await onSave({
        ...form,
        total_amount: Number(form.total_amount),
        remaining_amount: Number(form.remaining_amount),
        emi: Number(form.emi),
      });
      onClose();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Save failed");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="text-xs font-medium text-gray-500 block mb-1">Debt Name</label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="e.g. Home Loan"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Total Amount</label>
          <input
            type="number"
            min="0"
            step="0.01"
            required
            value={form.total_amount || ""}
            onChange={(e) => set("total_amount", e.target.value as unknown as number)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="0"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Remaining</label>
          <input
            type="number"
            min="0"
            step="0.01"
            required
            value={form.remaining_amount || ""}
            onChange={(e) => set("remaining_amount", e.target.value as unknown as number)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Monthly EMI</label>
          <input
            type="number"
            min="0"
            step="0.01"
            required
            value={form.emi || ""}
            onChange={(e) => set("emi", e.target.value as unknown as number)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="0"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Next Due Date</label>
          <input
            type="date"
            required
            value={form.due_date}
            onChange={(e) => set("due_date", e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
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

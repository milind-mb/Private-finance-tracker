"use client";

import { useState } from "react";
import type { Reminder, ReminderFormData } from "@/types";

interface Props {
  initial?: Reminder;
  onSave: (data: ReminderFormData) => Promise<void>;
  onClose: () => void;
}

const today = new Date().toISOString().split("T")[0];

export default function ReminderForm({ initial, onSave, onClose }: Props) {
  const [form, setForm] = useState<ReminderFormData>({
    title: initial?.title ?? "",
    amount: initial?.amount ?? null,
    date: initial?.date ?? today,
    status: initial?.status ?? "pending",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  function set<K extends keyof ReminderFormData>(key: K, value: ReminderFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setErr("Title is required"); return; }
    setSaving(true);
    try {
      await onSave({
        ...form,
        amount: form.amount != null && form.amount !== ("" as unknown as null)
          ? Number(form.amount)
          : null,
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
        <label className="text-xs font-medium text-gray-500 block mb-1">Title</label>
        <input
          type="text"
          required
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="e.g. Electricity Bill"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 block mb-1">
          Amount (optional)
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={form.amount ?? ""}
          onChange={(e) =>
            set("amount", e.target.value ? (Number(e.target.value) as unknown as number) : null)
          }
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="0.00"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 block mb-1">Date</label>
        <input
          type="date"
          required
          value={form.date}
          onChange={(e) => set("date", e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 block mb-1">Status</label>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {(["pending", "paid", "overdue"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => set("status", s)}
              className={`flex-1 py-2 text-xs font-medium capitalize ${
                form.status === s
                  ? s === "paid"
                    ? "bg-green-600 text-white"
                    : s === "overdue"
                    ? "bg-red-500 text-white"
                    : "bg-amber-500 text-white"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {s}
            </button>
          ))}
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

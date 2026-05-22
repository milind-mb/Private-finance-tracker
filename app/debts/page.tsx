"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { getDebts, addDebt, updateDebt, deleteDebt } from "@/lib/db";
import type { Debt, DebtFormData } from "@/types";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import DebtForm from "@/components/debts/DebtForm";
import { Plus, Pencil, Trash2, RefreshCw, CreditCard } from "lucide-react";

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

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - new Date().setHours(0, 0, 0, 0);
  return Math.ceil(diff / 86400000);
}

function progressPct(remaining: number, total: number) {
  if (total <= 0) return 0;
  return Math.min(100, ((total - remaining) / total) * 100);
}

export default function DebtsPage() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Debt | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      setDebts(await getDebts());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSave(data: DebtFormData) {
    if (editing) {
      const updated = await updateDebt(editing.id, data);
      setDebts((prev) => prev.map((d) => (d.id === editing.id ? updated : d)));
      setEditing(null);
    } else {
      const created = await addDebt(data);
      setDebts((prev) => [...prev, created]);
    }
    setShowForm(false);
  }

  async function handleDelete(id: string) {
    await deleteDebt(id);
    setDebts((prev) => prev.filter((d) => d.id !== id));
    setDeleting(null);
  }

  const totalRemaining = debts.reduce((s, d) => s + Number(d.remaining_amount), 0);
  const totalEMI = debts.reduce((s, d) => s + Number(d.emi), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Debts</h1>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
          <div className="flex items-center gap-1.5 text-orange-600 text-xs mb-1">
            <CreditCard size={13} /> Total Remaining
          </div>
          <div className="text-lg font-bold text-orange-700">{fmt(totalRemaining)}</div>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <div className="text-blue-600 text-xs mb-1">Monthly EMI Total</div>
          <div className="text-lg font-bold text-blue-700">{fmt(totalEMI)}</div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <RefreshCw size={24} className="animate-spin text-indigo-400" />
        </div>
      ) : debts.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          No debts tracked yet
        </div>
      ) : (
        <ul className="space-y-3">
          {debts.map((d) => {
            const days = daysUntil(d.due_date);
            const pct = progressPct(Number(d.remaining_amount), Number(d.total_amount));
            const isOverdue = days < 0;
            const isDueSoon = days >= 0 && days <= 7;

            return (
              <li key={d.id} className="bg-white border border-gray-100 rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-sm">{d.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Total: {fmt(Number(d.total_amount))}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setEditing(d); setShowForm(true); }}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleting(d.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Paid off</span>
                    <span className="font-medium">{pct.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    <div>
                      <div className="text-[10px] text-gray-400">Remaining</div>
                      <div className="text-sm font-bold text-orange-600">
                        {fmt(Number(d.remaining_amount))}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400">EMI</div>
                      <div className="text-sm font-semibold">{fmt(Number(d.emi))}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-gray-400">Due date</div>
                    <div
                      className={`text-xs font-medium ${
                        isOverdue
                          ? "text-red-600"
                          : isDueSoon
                          ? "text-amber-600"
                          : "text-gray-600"
                      }`}
                    >
                      {fmtDate(d.due_date)}
                      {isOverdue && (
                        <span className="ml-1 text-[10px] text-red-500">(overdue)</span>
                      )}
                      {isDueSoon && !isOverdue && (
                        <span className="ml-1 text-[10px] text-amber-500">({days}d)</span>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {showForm && (
        <Modal
          title={editing ? "Edit Debt" : "Add Debt"}
          onClose={() => { setShowForm(false); setEditing(null); }}
        >
          <DebtForm
            initial={editing ?? undefined}
            onSave={handleSave}
            onClose={() => { setShowForm(false); setEditing(null); }}
          />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          message="Delete this debt? This cannot be undone."
          onConfirm={() => handleDelete(deleting)}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}

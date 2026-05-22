"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import {
  getReminders,
  addReminder,
  updateReminder,
  deleteReminder,
} from "@/lib/db";
import type { Reminder, ReminderFormData } from "@/types";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import ReminderForm from "@/components/reminders/ReminderForm";
import { Plus, Pencil, Trash2, RefreshCw, CheckCircle2 } from "lucide-react";

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

const STATUS_STYLE = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  paid: "bg-green-50 text-green-700 border-green-200",
  overdue: "bg-red-50 text-red-700 border-red-200",
};

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Reminder | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      setReminders(await getReminders());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSave(data: ReminderFormData) {
    if (editing) {
      const updated = await updateReminder(editing.id, data);
      setReminders((prev) =>
        prev.map((r) => (r.id === editing.id ? updated : r))
      );
      setEditing(null);
    } else {
      const created = await addReminder(data);
      setReminders((prev) => [...prev, created].sort((a, b) => a.date.localeCompare(b.date)));
    }
    setShowForm(false);
  }

  async function handleDelete(id: string) {
    await deleteReminder(id);
    setReminders((prev) => prev.filter((r) => r.id !== id));
    setDeleting(null);
  }

  async function markPaid(r: Reminder) {
    const updated = await updateReminder(r.id, { ...r, status: "paid" });
    setReminders((prev) => prev.map((x) => (x.id === r.id ? updated : x)));
  }

  const upcoming = reminders.filter((r) => {
    const days = daysUntil(r.date);
    return r.status === "pending" && days >= 0 && days <= 7;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Reminders</h1>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {/* Upcoming alert */}
      {upcoming.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <p className="text-sm font-medium text-amber-800 mb-1">
            {upcoming.length} upcoming payment{upcoming.length > 1 ? "s" : ""} this week
          </p>
          {upcoming.map((r) => {
            const days = daysUntil(r.date);
            return (
              <p key={r.id} className="text-xs text-amber-700">
                · {r.title} — {days === 0 ? "Today" : `in ${days}d`}
                {r.amount != null ? ` (${fmt(r.amount)})` : ""}
              </p>
            );
          })}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <RefreshCw size={24} className="animate-spin text-indigo-400" />
        </div>
      ) : reminders.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          No reminders yet
        </div>
      ) : (
        <ul className="space-y-2">
          {reminders.map((r) => {
            const days = daysUntil(r.date);
            return (
              <li
                key={r.id}
                className={`bg-white border rounded-xl px-4 py-3 flex items-center gap-3 ${
                  r.status === "overdue" ? "border-red-200" : "border-gray-100"
                }`}
              >
                <button
                  onClick={() => r.status === "pending" && markPaid(r)}
                  disabled={r.status !== "pending"}
                  className={`flex-shrink-0 ${
                    r.status === "paid"
                      ? "text-green-500"
                      : r.status === "overdue"
                      ? "text-red-400"
                      : "text-gray-300 hover:text-green-500"
                  }`}
                >
                  <CheckCircle2 size={20} />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-medium ${
                        r.status === "paid" ? "line-through text-gray-400" : ""
                      }`}
                    >
                      {r.title}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${STATUS_STYLE[r.status]}`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400">{fmtDate(r.date)}</span>
                    {r.status === "pending" && (
                      <span
                        className={`text-xs ${
                          days < 0
                            ? "text-red-500"
                            : days <= 3
                            ? "text-amber-600"
                            : "text-gray-400"
                        }`}
                      >
                        {days < 0
                          ? `${Math.abs(days)}d overdue`
                          : days === 0
                          ? "Today"
                          : `in ${days}d`}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {r.amount != null && (
                    <span className="text-sm font-semibold text-gray-700">
                      {fmt(r.amount)}
                    </span>
                  )}
                  <button
                    onClick={() => { setEditing(r); setShowForm(true); }}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setDeleting(r.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {showForm && (
        <Modal
          title={editing ? "Edit Reminder" : "Add Reminder"}
          onClose={() => { setShowForm(false); setEditing(null); }}
        >
          <ReminderForm
            initial={editing ?? undefined}
            onSave={handleSave}
            onClose={() => { setShowForm(false); setEditing(null); }}
          />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          message="Delete this reminder? This cannot be undone."
          onConfirm={() => handleDelete(deleting)}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}

import { supabase } from "./supabase";
import type {
  Transaction,
  TransactionFormData,
  Debt,
  DebtFormData,
  Reminder,
  ReminderFormData,
} from "@/types";

// ─── Transactions ──────────────────────────────────────────────────────────────

export async function getTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addTransaction(t: TransactionFormData): Promise<Transaction> {
  const { data, error } = await supabase
    .from("transactions")
    .insert(t)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTransaction(
  id: string,
  t: TransactionFormData
): Promise<Transaction> {
  const { data, error } = await supabase
    .from("transactions")
    .update(t)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw error;
}

// ─── Debts ─────────────────────────────────────────────────────────────────────

export async function getDebts(): Promise<Debt[]> {
  const { data, error } = await supabase
    .from("debts")
    .select("*")
    .order("due_date", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function addDebt(d: DebtFormData): Promise<Debt> {
  const { data, error } = await supabase
    .from("debts")
    .insert(d)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateDebt(id: string, d: DebtFormData): Promise<Debt> {
  const { data, error } = await supabase
    .from("debts")
    .update(d)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteDebt(id: string): Promise<void> {
  const { error } = await supabase.from("debts").delete().eq("id", id);
  if (error) throw error;
}

// ─── Reminders ─────────────────────────────────────────────────────────────────

export async function getReminders(): Promise<Reminder[]> {
  const { data, error } = await supabase
    .from("reminders")
    .select("*")
    .order("date", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function addReminder(r: ReminderFormData): Promise<Reminder> {
  const { data, error } = await supabase
    .from("reminders")
    .insert(r)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateReminder(
  id: string,
  r: ReminderFormData
): Promise<Reminder> {
  const { data, error } = await supabase
    .from("reminders")
    .update(r)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteReminder(id: string): Promise<void> {
  const { error } = await supabase.from("reminders").delete().eq("id", id);
  if (error) throw error;
}

// ─── Dashboard aggregates ──────────────────────────────────────────────────────

export async function getDashboardStats() {
  const [transactions, debts, reminders] = await Promise.all([
    getTransactions(),
    getDebts(),
    getReminders(),
  ]);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);

  const balance = totalIncome - totalExpenses;

  const totalDebtRemaining = debts.reduce(
    (s, d) => s + Number(d.remaining_amount),
    0
  );

  const today = new Date();
  const in30Days = new Date(today);
  in30Days.setDate(today.getDate() + 30);

  const upcomingDebts = debts.filter((d) => {
    const due = new Date(d.due_date);
    return due >= today && due <= in30Days;
  });

  const upcomingReminders = reminders.filter((r) => {
    const due = new Date(r.date);
    return r.status === "pending" && due >= today && due <= in30Days;
  });

  // Monthly spending for current month
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const monthlyExpenses = transactions.filter(
    (t) => t.type === "expense" && t.date >= firstOfMonth
  );

  const monthlyByCategory = monthlyExpenses.reduce<Record<string, number>>(
    (acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + Number(t.amount);
      return acc;
    },
    {}
  );

  return {
    balance,
    totalIncome,
    totalExpenses,
    totalDebtRemaining,
    upcomingDebts,
    upcomingReminders,
    monthlyByCategory,
    monthlyTotal: monthlyExpenses.reduce((s, t) => s + Number(t.amount), 0),
  };
}

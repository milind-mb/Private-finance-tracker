export interface Transaction {
  id: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  need_type: "need" | "want" | null;
  note: string | null;
  date: string;
  created_at: string;
}

export interface Debt {
  id: string;
  name: string;
  total_amount: number;
  remaining_amount: number;
  emi: number;
  due_date: string;
  created_at: string;
}

export interface Reminder {
  id: string;
  title: string;
  amount: number | null;
  date: string;
  status: "pending" | "paid" | "overdue";
  created_at: string;
}

export type TransactionFormData = Omit<Transaction, "id" | "created_at">;
export type DebtFormData = Omit<Debt, "id" | "created_at">;
export type ReminderFormData = Omit<Reminder, "id" | "created_at">;

export const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Investment",
  "Business",
  "Rental",
  "Gift",
  "Other",
] as const;

export const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Housing",
  "Shopping",
  "Entertainment",
  "Healthcare",
  "Education",
  "Utilities",
  "Insurance",
  "Personal Care",
  "Travel",
  "Other",
] as const;

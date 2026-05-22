-- Run this in your Supabase SQL Editor to set up the database schema.

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  amount      NUMERIC(12, 2)  NOT NULL,
  type        TEXT            NOT NULL CHECK (type IN ('income', 'expense')),
  category    TEXT            NOT NULL,
  need_type   TEXT            CHECK (need_type IN ('need', 'want')),
  note        TEXT,
  date        DATE            NOT NULL,
  created_at  TIMESTAMPTZ     DEFAULT NOW()
);

-- Debts
CREATE TABLE IF NOT EXISTS debts (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name              TEXT            NOT NULL,
  total_amount      NUMERIC(12, 2)  NOT NULL,
  remaining_amount  NUMERIC(12, 2)  NOT NULL,
  emi               NUMERIC(12, 2)  NOT NULL,
  due_date          DATE            NOT NULL,
  created_at        TIMESTAMPTZ     DEFAULT NOW()
);

-- Reminders
CREATE TABLE IF NOT EXISTS reminders (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT        NOT NULL,
  amount      NUMERIC(12, 2),
  date        DATE        NOT NULL,
  status      TEXT        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (open policy — single-user app with no auth)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders    ENABLE ROW LEVEL SECURITY;

-- Allow full public access (no auth required)
CREATE POLICY "public_all" ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON debts        FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON reminders    FOR ALL USING (true) WITH CHECK (true);

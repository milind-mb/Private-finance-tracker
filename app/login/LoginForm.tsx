"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push(params.get("from") ?? "/");
      router.refresh();
    } else {
      setError(true);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-xs shadow-sm">
        <h1 className="text-lg font-bold text-center mb-1">Finance Tracker</h1>
        <p className="text-xs text-gray-400 text-center mb-6">Enter your password to continue</p>
        <form onSubmit={submit} className="space-y-4">
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false); }}
            placeholder="Password"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {error && (
            <p className="text-xs text-red-500 text-center">Incorrect password</p>
          )}
          <button
            type="submit"
            disabled={!password}
            className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium disabled:opacity-40"
          >
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
}

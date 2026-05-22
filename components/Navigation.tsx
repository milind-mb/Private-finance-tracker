"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  CreditCard,
  Bell,
  BarChart2,
} from "lucide-react";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/debts", label: "Debts", icon: CreditCard },
  { href: "/reminders", label: "Reminders", icon: Bell },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-56 bg-white border-r border-gray-200 flex-col py-6 px-4 z-40">
        <div className="mb-8 px-2">
          <span className="text-lg font-bold text-indigo-600">Finance</span>
          <span className="text-lg font-bold text-gray-800">Tracker</span>
        </div>
        <nav className="flex flex-col gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  active
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex flex-col items-center py-2 gap-0.5 text-[10px] font-medium ${
                  active ? "text-indigo-600" : "text-gray-500"
                }`}
              >
                <Icon size={20} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/auth/logout-button";
import { cn } from "@/lib/utils";

export function DashboardSidebar({
  email,
  hasSubscription,
}: {
  email: string;
  hasSubscription: boolean;
}) {
  const pathname = usePathname();

  const navItems = [
    { label: "Setup", href: "/dashboard" },
    ...(hasSubscription
      ? [{ label: "Billing", href: "/dashboard/billing" }]
      : []),
  ];

  return (
    <aside className="flex w-60 flex-col border-r border-gray-800 bg-[#111111]">
      <div className="px-5 py-6">
        <Link href="/dashboard" className="text-lg font-bold text-white">
          SimpleHermes
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-800 px-5 py-4">
        <p className="truncate text-sm text-gray-400">{email}</p>
        <div className="mt-2">
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}

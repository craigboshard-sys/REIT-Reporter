import Link from "next/link";
import { navSections } from "@/lib/nav";

export default function DashboardPage() {
  const items = navSections.flatMap((s) => s.items).filter((i) => i.href !== "/");

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-2">Dashboard</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-8 max-w-2xl">
        One-stop tracking for South African property REITs — SENS announcements,
        news, financial metrics, and market data in one place.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg border border-black/[.08] dark:border-white/[.145] px-4 py-3 hover:bg-black/[.03] dark:hover:bg-white/[.05] transition-colors"
          >
            <div className="font-medium text-sm">{item.label}</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {item.live ? "Live" : `Planned — Phase ${item.phase}`}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

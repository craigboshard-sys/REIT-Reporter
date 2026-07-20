"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navSections } from "@/lib/nav";
import { AppName } from "@/components/app-name";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-64 shrink-0 border-r border-black/[.08] dark:border-white/[.145] px-4 py-6 overflow-y-auto">
      <Link href="/" className="block px-2 mb-6 text-lg font-semibold tracking-tight">
        <AppName />
      </Link>
      {navSections.map((section) => (
        <div key={section.title} className="mb-6">
          <div className="px-2 mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {section.title}
          </div>
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors ${
                      active
                        ? "bg-black/[.06] font-medium dark:bg-white/[.1]"
                        : "text-zinc-600 hover:bg-black/[.04] dark:text-zinc-400 dark:hover:bg-white/[.06]"
                    }`}
                  >
                    <span>{item.label}</span>
                    {!item.live && (
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                        P{item.phase}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

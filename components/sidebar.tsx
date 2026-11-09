"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/login/actions";
import { cx } from "@/components/ui";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
};

const icons = {
  dashboard: (
    <path d="M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z" />
  ),
  box: (
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16ZM12 22V12M3.27 6.96 12 12l8.73-5.04" />
  ),
  tag: (
    <path d="M20.59 13.41 13.42 20.6a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82ZM7 7h.01" />
  ),
  users: (
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm14 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  ),
  in: <path d="M12 5v14M19 12l-7 7-7-7" />,
  out: <path d="M12 19V5M5 12l7-7 7 7" />,
};

function Icon({ d }: { d: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 shrink-0"
      aria-hidden="true"
    >
      {d}
    </svg>
  );
}

const nav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: <Icon d={icons.dashboard} /> },
  { href: "/products", label: "Produk", icon: <Icon d={icons.box} />, adminOnly: true },
  { href: "/categories", label: "Kategori", icon: <Icon d={icons.tag} />, adminOnly: true },
  { href: "/divisions", label: "Divisi", icon: <Icon d={icons.users} />, adminOnly: true },
  { href: "/inbound", label: "Inbound", icon: <Icon d={icons.in} />, adminOnly: true },
  { href: "/outbound", label: "Outbound", icon: <Icon d={icons.out} />, adminOnly: true },
];

export function Sidebar({
  user,
}: {
  user: { name: string; email: string; role: string };
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isAdmin = user.role === "admin";
  const items = nav.filter((n) => !n.adminOnly || isAdmin);

  return (
    <>
      {/* Topbar mobile */}
      <div className="bg-surface border-token sticky top-0 z-30 flex items-center justify-between border-b px-4 py-3 md:hidden">
        <span className="font-bold">GA Stock</span>
        <button
          onClick={() => setOpen((v) => !v)}
          className="focus-ring rounded-lg p-2"
          aria-label="Menu"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={cx(
          "bg-surface border-token fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r transition-transform md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="bg-brand-600 flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white">
            GA
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">GA Stock</p>
            <p className="text-muted text-xs">Inventory</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {items.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cx(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-600 text-white"
                    : "text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]",
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-token border-t p-3">
          <div className="mb-2 flex items-center gap-3 px-2 py-1">
            <div className="bg-brand-500/15 text-brand-600 dark:text-brand-300 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold uppercase">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="text-muted truncate text-xs">
                {user.role === "admin" ? "Administrator" : "Viewer"}
              </p>
            </div>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="focus-ring flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-500/10 dark:text-rose-400"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
              Keluar
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}

"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { List, X } from "@phosphor-icons/react";

type NavItem = { href: string; label: string; permission?: string };

const SECTIONS: { title: string; items: NavItem[] }[] = [
  { title: "Overview", items: [{ href: "/admin/shop", label: "Dashboard" }] },
  {
    title: "Catalog",
    items: [
      { href: "/admin/shop/arrangements", label: "Arrangements", permission: "catalog:write" },
      { href: "/admin/shop/bundles", label: "Collections", permission: "catalog:write" },
      { href: "/admin/shop/works", label: "Works", permission: "catalog:write" },
      { href: "/admin/shop/arrangers", label: "Arrangers", permission: "catalog:write" },
      { href: "/admin/shop/profiles", label: "Compatibility", permission: "catalog:write" },
      { href: "/admin/shop/imports", label: "Bulk import", permission: "imports:manage" },
    ],
  },
  {
    title: "Sales",
    items: [
      { href: "/admin/shop/orders", label: "Orders", permission: "orders:read" },
      { href: "/admin/shop/customers", label: "Customers", permission: "customers:read" },
      { href: "/admin/shop/royalties", label: "Royalties", permission: "royalties:read" },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/admin/shop/staff", label: "Staff", permission: "staff:read" },
      { href: "/admin/shop/audit", label: "Audit log", permission: "audit:read" },
    ],
  },
];

export function AdminNav({ permissions, staffLabel, role }: { permissions: string[]; staffLabel: string; role: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const allowed = new Set(permissions);

  const nav = (
    <nav className="flex flex-col gap-6" aria-label="Shop administration">
      {SECTIONS.map((section) => {
        const items = section.items.filter((i) => !i.permission || allowed.has(i.permission));
        if (!items.length) return null;
        return (
          <div key={section.title}>
            <p className="px-3 text-xs font-medium text-neutral-400">{section.title}</p>
            <ul className="mt-2 flex flex-col gap-0.5">
              {items.map((item) => {
                const active = item.href === "/admin/shop" ? pathname === item.href : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={clsx(
                        "block rounded-full px-3 py-1.5 text-sm transition",
                        active ? "bg-neutral-950 font-semibold text-white" : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );

  return (
    <>
      <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 lg:hidden">
        <Link href="/admin/shop" className="font-display text-base font-bold text-neutral-950">DMI Shop admin</Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-full p-2 text-neutral-950 transition hover:bg-neutral-100"
          aria-expanded={open}
          aria-label="Toggle navigation"
        >
          {open ? <X size={20} /> : <List size={20} />}
        </button>
      </div>
      {open && <div className="border-b border-neutral-200 bg-white px-4 py-5 lg:hidden">{nav}</div>}

      <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-neutral-200 bg-white px-4 py-6 lg:flex">
        <div>
          <Link href="/admin/shop" className="block px-3 font-display text-lg font-bold text-neutral-950">
            DMI Shop
          </Link>
          <p className="px-3 text-xs text-neutral-500">Administration</p>
          <div className="mt-8">{nav}</div>
        </div>
        <div className="border-t border-neutral-200 px-3 pt-4 text-xs text-neutral-500">
          <p className="truncate font-medium text-neutral-800">{staffLabel}</p>
          <p className="mt-0.5">{role.replace("_", " ").toLowerCase()}</p>
          <div className="mt-3 flex gap-3">
            <Link href="/en/shop" className="transition hover:text-neutral-950">Storefront</Link>
            {/* Full navigation so the Auth0 logout route runs. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Auth0 route needs a full page load */}
            <a href="/auth/logout" className="transition hover:text-neutral-950">Sign out</a>
          </div>
        </div>
      </aside>
    </>
  );
}

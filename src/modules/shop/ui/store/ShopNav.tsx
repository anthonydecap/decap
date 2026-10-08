"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bag } from "@phosphor-icons/react";
import { useCart } from "./CartProvider";
import { shopCopy, shopPath } from "./copy";

/** Secondary navigation for the shop, sitting under the site header. */
export function ShopNav({ lang, signedIn }: { lang: string; signedIn: boolean }) {
  const t = shopCopy(lang);
  const pathname = usePathname();
  const { cart } = useCart();
  const count = cart?.itemCount ?? 0;

  const links = [
    { href: shopPath(lang), label: t.shop, exact: true },
    { href: shopPath(lang, "/browse"), label: t.browse },
    { href: shopPath(lang, "/collections"), label: t.collections },
    ...(signedIn ? [{ href: shopPath(lang, "/account/library"), label: t.library }] : []),
  ];

  return (
    <div className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-6 lg:px-8">
        <nav className="-mx-2 flex min-w-0 items-center gap-1 overflow-x-auto" aria-label="Shop">
          {links.map((l) => {
            const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition",
                  active ? "bg-neutral-950 font-semibold text-white" : "text-neutral-600 hover:text-neutral-950",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          {signedIn ? (
            <Link href={shopPath(lang, "/account")} className="hidden rounded-full px-3 py-1.5 text-sm text-neutral-600 transition hover:text-neutral-950 sm:inline-block">
              {t.account}
            </Link>
          ) : (
            // Full navigation: Auth0 routes are handled by the proxy, not the client router.
            <a
              href={`/auth/login?returnTo=${encodeURIComponent(pathname)}`}
              className="rounded-full px-3 py-1.5 text-sm text-neutral-600 transition hover:text-neutral-950"
            >
              {t.signIn}
            </a>
          )}
          <Link
            href={shopPath(lang, "/cart")}
            className="relative inline-flex items-center gap-2 rounded-full border border-neutral-300 px-3.5 py-1.5 text-sm font-semibold text-neutral-950 transition hover:border-neutral-950"
            aria-label={`${t.cart}, ${count}`}
          >
            <Bag size={16} weight="bold" aria-hidden />
            <span className="tabular-nums">{count}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

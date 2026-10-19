"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { shopPath } from "./copy";
import { accountCopy } from "./copy-account";

/** Sub-navigation shared by every account page. Hidden during onboarding. */
export function AccountNav({ lang }: { lang: string }) {
  const t = accountCopy(lang);
  const pathname = usePathname();
  const base = shopPath(lang, "/account");
  if (pathname.startsWith(`${base}/onboarding`)) return null;

  // Players live under My DMI: their pages highlight it rather than a separate tab.
  const links = [
    { href: base, label: t.navMyDmi, also: [`${base}/players`] },
    { href: `${base}/music`, label: t.navMusic },
    { href: `${base}/software`, label: t.navSoftware },
    { href: `${base}/orders`, label: t.navOrders },
    { href: `${base}/support`, label: t.navSupport },
    { href: `${base}/profile`, label: t.navProfile },
  ];
  const under = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav aria-label={t.navLabel} className="border-b border-neutral-200">
      <div className="-mx-2 flex items-center gap-1 overflow-x-auto py-3">
        {links.map((l) => {
          const active = l.href === base ? pathname === base || (l.also ?? []).some(under) : under(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition",
                active ? "bg-neutral-100 font-semibold text-neutral-950" : "text-neutral-600 hover:text-neutral-950",
              )}
            >
              {l.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

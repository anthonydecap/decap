"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { Check } from "@phosphor-icons/react";
import { errorMessage } from "../api";
import { useCart } from "./CartProvider";
import { shopCopy, shopPath } from "./copy";

type Props = {
  lang: string;
  item: { type: "ARRANGEMENT"; arrangementId: string } | { type: "BUNDLE"; bundleId: string };
  owned?: boolean;
  size?: "sm" | "lg";
  className?: string;
};

export function AddToCartButton({ lang, item, owned, size = "lg", className }: Props) {
  const t = shopCopy(lang);
  const { add, contains } = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refId = item.type === "ARRANGEMENT" ? item.arrangementId : item.bundleId;
  const inCart = contains(refId);

  const base = size === "lg"
    ? "rounded-full px-8 py-3 text-base font-semibold"
    : "rounded-full px-4 py-1.5 text-sm font-semibold";

  if (owned) {
    return (
      <Link href={shopPath(lang, "/account/library")} className={clsx(base, "inline-flex items-center gap-2 border border-neutral-300 text-neutral-950 transition hover:border-neutral-950", className)}>
        <Check size={size === "lg" ? 18 : 14} weight="bold" aria-hidden />
        {size === "lg" ? t.owned : t.ownedShort}
      </Link>
    );
  }
  if (inCart) {
    return (
      <Link href={shopPath(lang, "/cart")} className={clsx(base, "inline-flex items-center gap-2 border-2 border-neutral-950 text-neutral-950 transition hover:bg-neutral-950 hover:text-white", className)}>
        <Check size={size === "lg" ? 18 : 14} weight="bold" aria-hidden />
        {t.inCart}
      </Link>
    );
  }
  return (
    <div className={clsx("flex flex-col gap-2", size === "lg" ? "items-start" : "items-end", className)}>
      <button
        type="button"
        disabled={busy}
        onClick={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          setBusy(true);
          setError(null);
          try {
            await add(item);
          } catch (err) {
            setError(errorMessage(err));
          } finally {
            setBusy(false);
          }
        }}
        className={clsx(
          base,
          "bg-neutral-950 text-white transition-all duration-300 hover:bg-neutral-800 active:scale-[0.98] disabled:opacity-50",
          size === "lg" && "hover:scale-105",
        )}
      >
        {busy ? `${t.addToCart}…` : t.addToCart}
      </button>
      {error && <p role="alert" className="text-xs font-medium text-neutral-950">{error}</p>}
    </div>
  );
}

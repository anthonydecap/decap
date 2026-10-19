"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShoppingBagOpen } from "@phosphor-icons/react";
import { errorMessage } from "../../api";
import { useCart } from "../CartProvider";
import { shopCopy, shopPath } from "../copy";

/** Puts a license for this product in the cart, then opens the cart. */
export function BuyLicenseButton({
  lang,
  productId,
  variant = "secondary",
  size = "lg",
  label,
  className,
}: {
  lang: string;
  productId: string;
  /** Overrides "Buy license" (e.g. "Buy license · €899.00"). */
  label?: string;
  variant?: "primary" | "secondary";
  size?: "lg" | "sm";
  className?: string;
}) {
  const t = shopCopy(lang);
  const { add } = useCart();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className={clsx("flex flex-col gap-2", className)}>
      <button
        type="button"
        disabled={busy}
        aria-busy={busy}
        onClick={async () => {
          setBusy(true);
          setError(null);
          try {
            await add({ type: "SOFTWARE_LICENSE", softwareProductId: productId });
            router.push(shopPath(lang, "/cart"));
          } catch (e) {
            setError(errorMessage(e));
            setBusy(false);
          }
        }}
        className={clsx(
          "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 disabled:opacity-50",
          size === "lg" ? "px-8 py-3 text-base" : "px-4 py-1.5 text-sm",
          variant === "primary"
            ? "bg-neutral-950 text-white hover:bg-neutral-800"
            : size === "lg"
              ? "border-2 border-neutral-950 text-neutral-950 hover:bg-neutral-950 hover:text-white"
              : "border border-neutral-300 text-neutral-950 hover:border-neutral-950",
        )}
      >
        <ShoppingBagOpen size={size === "lg" ? 18 : 14} weight="bold" aria-hidden />
        {busy ? `${t.sw.adding}…` : label ?? t.sw.buyLicense}
      </button>
      {error && <p role="alert" className="text-xs font-medium text-neutral-950">{error}</p>}
    </div>
  );
}

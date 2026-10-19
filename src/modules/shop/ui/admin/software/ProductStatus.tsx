"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowSquareOut } from "@phosphor-icons/react";
import { apiFetch, errorMessage } from "../../api";
import { btn, Notice, Panel, StatusBadge } from "../primitives";
import { PRODUCT_STATUSES } from "./labels";

type ProductStatus = (typeof PRODUCT_STATUSES)[number];

const EXPLAIN: Record<ProductStatus, string> = {
  DRAFT: "Hidden from customers. Use while preparing the product and its first release.",
  ACTIVE: "Listed on the public software catalog. Signed-in customers can download it and buy licenses if a price is set.",
  DISCONTINUED: "Still visible and downloadable for existing customers, but no longer promoted.",
  ARCHIVED: "Hidden from customers. Existing licenses and history are kept.",
};

const ACTION_LABEL: Record<ProductStatus, string> = {
  DRAFT: "Move to draft",
  ACTIVE: "Make active",
  DISCONTINUED: "Discontinue",
  ARCHIVED: "Archive",
};

export function SoftwareProductStatus({
  productId,
  slug,
  status,
  hasCurrentStable,
  canPublish,
}: {
  productId: string;
  slug: string;
  status: ProductStatus;
  hasCurrentStable: boolean;
  canPublish: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<ProductStatus | null>(null);
  const [msg, setMsg] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  async function change(next: ProductStatus) {
    if (next === "ARCHIVED" && !window.confirm("Archive this product? It disappears from the public catalog. Licenses and history are kept.")) return;
    if (next === "DRAFT" && status === "ACTIVE" && !window.confirm("Move this product back to draft? It disappears from the public catalog immediately.")) return;
    setBusy(next);
    setMsg(null);
    try {
      await apiFetch(`/api/admin/shop/software/${productId}/status`, { body: { status: next } });
      setMsg({ tone: "success", text: `Status changed to ${next.toLowerCase()}.` });
      router.refresh();
    } catch (e) {
      setMsg({ tone: "error", text: errorMessage(e) });
    } finally {
      setBusy(null);
    }
  }

  const visible = status === "ACTIVE" || status === "DISCONTINUED";

  return (
    <Panel title="Status" actions={<StatusBadge status={status} />}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-neutral-600">{EXPLAIN[status]}</p>
        <Notice>
          A product can only become Active when a release is published and marked current on the Stable channel.
          {hasCurrentStable ? " This product has one." : " This product does not have one yet: upload, publish and mark a stable release current on the Releases tab."}
        </Notice>
        {canPublish ? (
          <div className="flex flex-wrap gap-2">
            {PRODUCT_STATUSES.filter((s) => s !== status).map((s) => (
              <button
                key={s}
                type="button"
                className={s === "ACTIVE" ? btn.primary : s === "ARCHIVED" ? btn.danger : btn.secondary}
                disabled={busy !== null || (s === "ACTIVE" && !hasCurrentStable)}
                onClick={() => change(s)}
              >
                {busy === s ? "Saving…" : ACTION_LABEL[s]}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-neutral-500">Your role cannot change the product status.</p>
        )}
        {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
        <div className="border-t border-neutral-100 pt-4 text-sm">
          <Link href={`/en/software/${slug}`} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 font-medium text-neutral-950 hover:underline">
            Public page
            <ArrowSquareOut size={14} aria-hidden />
          </Link>
          <p className="mt-1 text-xs text-neutral-500">
            {visible ? "Visible to everyone." : "Customers see this page only when the product is Active or Discontinued."}
          </p>
        </div>
      </div>
    </Panel>
  );
}

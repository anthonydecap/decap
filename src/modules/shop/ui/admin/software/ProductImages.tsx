"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ImageSquare, UploadSimple } from "@phosphor-icons/react";
import { ApiError } from "../../api";
import { btn, Notice, Panel } from "../primitives";

const MAX_BYTES = 4 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

function ImageSlot({
  productId,
  kind,
  title,
  help,
  url,
  canWrite,
}: {
  productId: string;
  kind: "cover" | "icon";
  title: string;
  help: string;
  url: string | null;
  canWrite: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  async function onFile(file: File) {
    setMsg(null);
    if (!TYPES.includes(file.type)) {
      setMsg({ tone: "error", text: "Use a JPEG, PNG or WebP image." });
      return;
    }
    if (file.size > MAX_BYTES) {
      setMsg({ tone: "error", text: "Images must be under 4 MB." });
      return;
    }
    setBusy(true);
    try {
      const form = new FormData();
      form.set("payload", JSON.stringify({ kind }));
      form.append("files", file);
      const res = await fetch(`/api/admin/shop/software/${productId}/image`, { method: "POST", body: form, credentials: "same-origin" });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: { code?: string; message?: string } } | null;
        throw new ApiError(res.status, data?.error?.code ?? "HTTP_ERROR", data?.error?.message ?? `Upload failed (${res.status})`);
      }
      setMsg({ tone: "success", text: `${title} updated.` });
      router.refresh();
    } catch (e) {
      setMsg({ tone: "error", text: e instanceof Error && e.message ? e.message : "Upload failed. Please try again." });
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-neutral-900">{title}</p>
          <p className="text-xs text-neutral-500">{help}</p>
        </div>
        {canWrite && (
          <>
            <input
              ref={inputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              className="sr-only"
              id={`sp-img-${kind}`}
              disabled={busy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onFile(f);
              }}
            />
            <button type="button" className={btn.secondary} disabled={busy} onClick={() => inputRef.current?.click()}>
              <UploadSimple size={16} aria-hidden />
              {busy ? "Uploading…" : url ? "Replace" : "Upload"}
            </button>
          </>
        )}
      </div>
      <div
        className={
          kind === "cover"
            ? "flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50"
            : "flex size-20 items-center justify-center overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50"
        }
      >
        {url ? (
          // Previews come from the public previews store (or a signed dev URL), so plain <img>.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={`${title} preview`} className="size-full object-cover" />
        ) : (
          <ImageSquare size={kind === "cover" ? 32 : 24} className="text-neutral-400" aria-label="No image yet" />
        )}
      </div>
      {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
    </div>
  );
}

export function SoftwareProductImages({
  productId,
  coverUrl,
  iconUrl,
  canWrite,
}: {
  productId: string;
  coverUrl: string | null;
  iconUrl: string | null;
  canWrite: boolean;
}) {
  return (
    <Panel title="Images" description="JPEG, PNG or WebP, up to 4 MB. Images are public.">
      <div className="flex flex-col gap-6">
        <ImageSlot productId={productId} kind="cover" title="Cover image" help="Shown on the software catalog and product page." url={coverUrl} canWrite={canWrite} />
        <ImageSlot productId={productId} kind="icon" title="Icon" help="Square application icon." url={iconUrl} canWrite={canWrite} />
      </div>
    </Panel>
  );
}

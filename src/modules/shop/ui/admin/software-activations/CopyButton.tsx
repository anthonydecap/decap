"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "@phosphor-icons/react";
import { btn } from "../primitives";

/** Copies a value to the clipboard and confirms for two seconds. */
export function CopyButton({ value, label = "Copy", className }: { value: string; label?: string; className?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
    } catch {
      setState("failed");
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2000);
  }

  return (
    <button type="button" onClick={copy} className={className ?? btn.secondary} aria-live="polite">
      {state === "copied" ? <Check size={16} weight="bold" aria-hidden /> : <Copy size={16} aria-hidden />}
      {state === "copied" ? "Copied" : state === "failed" ? "Copy failed, select and copy manually" : label}
    </button>
  );
}

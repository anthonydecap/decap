"use client";

import { useRef } from "react";

/** GET form that re-submits whenever a filter changes (still works without JS via the button). */
export function AutoSubmitForm({ action, children, className }: { action: string; children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLFormElement>(null);
  return (
    <form
      ref={ref}
      action={action}
      method="get"
      className={className}
      onChange={(e) => {
        const target = e.target as HTMLInputElement;
        // Text/number inputs submit on blur/enter, not on every keystroke.
        if (target.type === "text" || target.type === "number" || target.type === "search") return;
        ref.current?.requestSubmit();
      }}
    >
      {children}
    </form>
  );
}

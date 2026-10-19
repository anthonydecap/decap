import clsx from "clsx";
import { AppWindow } from "@phosphor-icons/react/ssr";

/** Product icon: the uploaded icon when present, otherwise a neutral icon tile. Server only. */
export function SoftwareIcon({ src, size = "md", className }: { src: string | null; size?: "md" | "lg"; className?: string }) {
  const box = size === "lg" ? "h-20 w-20 rounded-3xl" : "h-14 w-14 rounded-2xl";
  if (src) {
    return (
      // Icons come from the previews store (public or signed URL), so a plain <img>.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="" loading="lazy" decoding="async" className={clsx(box, "shrink-0 border border-neutral-200 object-cover", className)} />
    );
  }
  return (
    <span className={clsx(box, "inline-flex shrink-0 items-center justify-center bg-neutral-100 text-neutral-700", className)} aria-hidden>
      <AppWindow size={size === "lg" ? 36 : 26} weight="duotone" />
    </span>
  );
}

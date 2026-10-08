import clsx from "clsx";

/**
 * Square artwork tile. Uses the uploaded cover when present; otherwise a dark typographic
 * tile with the title (a real fallback, not a fake image).
 */
export function Artwork({
  src,
  title,
  subtitle,
  className,
  rounded = "rounded-2xl",
  eager = false,
}: {
  src: string | null;
  title: string;
  subtitle?: string | null;
  className?: string;
  rounded?: string;
  eager?: boolean;
}) {
  return (
    <div className={clsx("relative aspect-square w-full overflow-hidden bg-neutral-900", rounded, className)}>
      {src ? (
        // Covers come from the previews store (public Blob or signed dev URL), so plain <img>.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col justify-end p-5">
          <p className="line-clamp-3 font-display text-xl font-bold leading-tight text-white">{title}</p>
          {subtitle && <p className="mt-1 line-clamp-1 text-sm text-neutral-400">{subtitle}</p>}
        </div>
      )}
    </div>
  );
}

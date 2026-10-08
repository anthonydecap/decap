import { MagnifyingGlass } from "@phosphor-icons/react/ssr";
import { shopCopy, shopPath } from "./copy";

/** Plain GET form: works without JavaScript and lands on the browse page. */
export function SearchForm({ lang, defaultValue, className }: { lang: string; defaultValue?: string; className?: string }) {
  const t = shopCopy(lang);
  return (
    <form action={shopPath(lang, "/browse")} method="get" role="search" className={className}>
      <label htmlFor="shop-search" className="text-sm font-medium text-neutral-800">{t.searchLabel}</label>
      <div className="mt-2 flex items-center gap-2 rounded-full border border-neutral-300 bg-white py-1.5 pl-4 pr-1.5 transition focus-within:border-neutral-950 focus-within:ring-2 focus-within:ring-neutral-950/10">
        <MagnifyingGlass size={18} className="shrink-0 text-neutral-500" aria-hidden />
        <input
          id="shop-search"
          name="q"
          type="search"
          defaultValue={defaultValue}
          placeholder={t.searchPlaceholder}
          className="min-w-0 flex-1 border-0 bg-transparent p-0 text-base text-neutral-950 placeholder:text-neutral-400 focus:outline-none focus:ring-0"
        />
        <button type="submit" className="rounded-full bg-neutral-950 px-5 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 active:scale-[0.98]">
          {t.search}
        </button>
      </div>
    </form>
  );
}

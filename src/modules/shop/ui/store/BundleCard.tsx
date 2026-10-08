import Link from "next/link";
import type { BundleSummary } from "../../services/catalog";
import { formatMoney } from "../format";
import { Artwork } from "./Artwork";
import { shopCopy, shopPath } from "./copy";

/** Wide collection card: artwork left, pricing story right. */
export function BundleCard({ bundle, lang }: { bundle: BundleSummary; lang: string }) {
  const t = shopCopy(lang);
  const pct = bundle.retailTotalCents > 0 ? Math.round((bundle.savingCents / bundle.retailTotalCents) * 100) : 0;
  return (
    <Link
      href={shopPath(lang, `/collections/${bundle.slug}`)}
      className="group grid grid-cols-1 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:border-neutral-300 hover:shadow-md sm:grid-cols-5 lg:rounded-3xl"
    >
      <div className="sm:col-span-2">
        <Artwork src={bundle.coverUrl} title={bundle.title} rounded="rounded-none" className="h-full sm:aspect-auto sm:min-h-full" />
      </div>
      <div className="flex flex-col justify-between gap-6 p-6 sm:col-span-3 sm:p-8">
        <div>
          <h3 className="font-display text-xl font-bold text-neutral-950 sm:text-2xl">{bundle.title}</h3>
          {bundle.subtitle && <p className="mt-2 text-sm leading-relaxed text-neutral-600">{bundle.subtitle}</p>}
          <p className="mt-3 text-sm text-neutral-500">{t.items(bundle.itemCount)}</p>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            {bundle.savingCents > 0 && (
              <p className="text-sm text-neutral-500 line-through">
                {formatMoney(bundle.retailTotalCents, bundle.currency, lang)}
              </p>
            )}
            <p className="font-display text-2xl font-bold text-neutral-950">
              {formatMoney(bundle.priceCents, bundle.currency, lang)}
            </p>
          </div>
          {pct > 0 && (
            <span className="rounded-full bg-neutral-950 px-3 py-1 text-xs font-semibold text-white">
              {t.youSave} {pct}%
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

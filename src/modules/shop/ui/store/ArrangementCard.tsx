import Link from "next/link";
import type { ArrangementCard as CardData } from "../../services/catalog";
import { formatDuration, formatMoney } from "../format";
import { AddToCartButton } from "./AddToCartButton";
import { Artwork } from "./Artwork";
import { shopCopy, shopPath } from "./copy";
import { PreviewButton } from "./PreviewPlayer";

export function ArrangementCard({ item, lang }: { item: CardData; lang: string }) {
  const t = shopCopy(lang);
  const href = shopPath(lang, `/arrangements/${item.slug}`);
  const duration = formatDuration(item.durationSeconds);
  return (
    <article className="group relative flex flex-col">
      <div className="relative">
        <Link href={href} aria-label={item.title} className="block">
          <Artwork src={item.coverUrl} title={item.title} subtitle={item.originalArtist} />
        </Link>
        {item.previewAudioUrl && (
          <div className="absolute bottom-3 left-3">
            <PreviewButton url={item.previewAudioUrl} label={`${t.play}: ${item.title}`} pauseLabel={t.pause} />
          </div>
        )}
        {item.owned && (
          <span className="absolute right-3 top-3 rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-neutral-950">
            {t.ownedShort}
          </span>
        )}
      </div>
      <div className="mt-4 flex flex-1 flex-col">
        <h3 className="font-display text-base font-bold leading-snug text-neutral-950">
          <Link href={href} className="hover:underline">{item.title}</Link>
        </h3>
        <p className="mt-1 line-clamp-1 text-sm text-neutral-600">
          {[item.originalArtist ?? item.workTitle, item.arrangerName].filter(Boolean).join(", ")}
        </p>
        <div className="mt-3 flex items-center justify-between gap-3 pt-1">
          <p className="text-sm text-neutral-950">
            <span className="font-semibold">{formatMoney(item.priceCents, item.currency, lang)}</span>
            {duration && <span className="ml-2 text-neutral-500">{duration}</span>}
          </p>
          <AddToCartButton lang={lang} size="sm" owned={item.owned} item={{ type: "ARRANGEMENT", arrangementId: item.id }} />
        </div>
      </div>
    </article>
  );
}

export function ArrangementGrid({ items, lang }: { items: CardData[]; lang: string }) {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((i) => <ArrangementCard key={i.id} item={i} lang={lang} />)}
    </div>
  );
}

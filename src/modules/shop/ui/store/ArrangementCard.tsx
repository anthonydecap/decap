import Link from "next/link";
import { Check } from "@phosphor-icons/react/ssr";
import type { ArrangementCard as CardData } from "../../services/catalog";
import { formatDuration, formatMoney } from "../format";
import { AddToCartButton } from "./AddToCartButton";
import { Artwork } from "./Artwork";
import { shopCopy, shopPath } from "./copy";
import { playerCopy, playerLinks } from "./copy-player";
import { PreviewButton } from "./PreviewPlayer";

/**
 * Catalog card. Concise player-aware states for the shopping player: "Licensed",
 * "€3.95 for this player" (already licensed on another player) or the normal price.
 * `playerId` is the page's resolved shopping player, so the button adds for exactly the
 * player the state was computed for.
 */
export function ArrangementCard({ item, lang, playerId }: { item: CardData; lang: string; playerId?: string | null }) {
  const t = shopCopy(lang);
  const tp = playerCopy(lang);
  const href = shopPath(lang, `/arrangements/${item.slug}`);
  const duration = formatDuration(item.durationSeconds);
  const state = item.player.state;
  const licensed = state === "LICENSED";
  const licensedHref = playerId ? playerLinks.playerMusic(lang, playerId) : playerLinks.myMusic(lang);
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
        {licensed && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-neutral-950">
            <Check size={12} weight="bold" aria-hidden />
            {tp.licensed}
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
          <p className="min-w-0 text-sm text-neutral-950">
            {state === "ADDITIONAL" && item.player.priceCents !== item.priceCents ? (
              <span className="font-semibold">{tp.forThisPlayer(formatMoney(item.player.priceCents, item.currency, lang))}</span>
            ) : state === "INCOMPATIBLE" ? (
              <span className="text-neutral-600">{tp.notForThisPlayer}</span>
            ) : (
              <>
                <span className="font-semibold">{formatMoney(item.priceCents, item.currency, lang)}</span>
                {duration && <span className="ml-2 text-neutral-500">{duration}</span>}
              </>
            )}
          </p>
          {state !== "INCOMPATIBLE" && (
            <AddToCartButton
              lang={lang}
              size="sm"
              owned={licensed}
              licensedHref={licensedHref}
              targetPlayerId={playerId}
              item={{ type: "ARRANGEMENT", arrangementId: item.id }}
            />
          )}
        </div>
      </div>
    </article>
  );
}

export function ArrangementGrid({ items, lang, playerId }: { items: CardData[]; lang: string; playerId?: string | null }) {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((i) => <ArrangementCard key={i.id} item={i} lang={lang} playerId={playerId} />)}
    </div>
  );
}

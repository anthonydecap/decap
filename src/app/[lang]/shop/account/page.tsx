import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CaretRight, ChatCircleText, Clock, IdentificationCard, MusicNotes, Receipt, Tray } from "@phosphor-icons/react/ssr";
import clsx from "clsx";
import { Container } from "@/components/Container";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import { resolveUrlLang } from "@/i18n";
import { shopDb } from "@/modules/shop/db";
import { listOrdersForCustomer } from "@/modules/shop/services/checkout";
import { customerMusicPlayers, licenseCountsByPlayer } from "@/modules/shop/services/music-licenses";
import { customerSoftwareOverview } from "@/modules/shop/services/software";
import { OPEN_STATUSES } from "@/modules/shop/services/support";
import { requireAccountCustomer } from "@/modules/shop/ui/store/account-server";
import { PlayerCard } from "@/modules/shop/ui/store/account-ui";
import { shopPath, softwarePath } from "@/modules/shop/ui/store/copy";
import { SoftwareCard, type DmiSoftwareItem } from "@/modules/shop/ui/store/MyDmiSoftware";
import { playerProducts } from "@/modules/shop/services/player-products";
import { dmiCopy } from "@/modules/shop/ui/store/copy-dmi";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My DMI", robots: { index: false } };

/**
 * My DMI. Your software first, every program shown the same way. A player program
 * (Virtual Orchestrion) also lists the computers it is activated on: each is a player and
 * music is licensed to it, so "Add music" lives right there. Music, orders, support and
 * profile follow as one calm list. Every query is scoped to the signed-in customer.
 */
export default async function MyDmiPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const urlLang = resolveUrlLang(lang);
  const t = dmiCopy(urlLang);
  const customer = await requireAccountCustomer(urlLang, shopPath(urlLang, "/account"));
  const db = shopDb();

  const [players, counts, unassigned, software, openCount, waitingCount, orders, playerProductList] = await Promise.all([
    customerMusicPlayers(customer.id),
    licenseCountsByPlayer(customer.id),
    db.musicLicense.groupBy({ by: ["needsReview"], where: { customerId: customer.id, status: "UNASSIGNED" }, _count: { _all: true } }),
    customerSoftwareOverview(customer.id),
    db.supportTicket.count({ where: { customerId: customer.id, status: { in: OPEN_STATUSES } } }),
    db.supportTicket.count({ where: { customerId: customer.id, status: "WAITING_FOR_CUSTOMER" } }),
    listOrdersForCustomer(customer.id),
    playerProducts(),
  ]);

  const visible = players.filter((p) => p.status !== "RETIRED");
  const totalMusic = [...counts.values()].reduce((a, b) => a + b, 0);
  const playersWithMusic = [...counts.values()].filter((n) => n > 0).length;
  const waitingForPlayer = unassigned.find((u) => !u.needsReview)?._count._all ?? 0;
  const waitingForDmi = unassigned.find((u) => u.needsReview)?._count._all ?? 0;
  const canPlace = visible.some((p) => p.eligible);

  // One card per program. Player programs come first and carry their players (one per
  // activated computer); a player program the customer does not have yet is shown too, so
  // the way to music is always visible.
  const playerProductIds = new Set(playerProductList.map((p) => p.id));
  const items: DmiSoftwareItem[] = software.map((s) => ({
    product: { ...s.product, shortDescription: null, iconUrl: s.product.iconUrl ?? null },
    status: s.status,
    isPlayer: playerProductIds.has(s.product.id),
    players: [],
  }));
  for (const pp of playerProductList) {
    if (!items.some((i) => i.product.id === pp.id)) {
      items.push({
        product: { id: pp.id, slug: pp.slug, name: pp.name, shortDescription: pp.shortDescription, iconUrl: pp.iconUrl, licensePriceCents: pp.priceCents, currency: pp.currency, currentVersion: null },
        status: "NOT_OWNED", isPlayer: true, players: [],
      });
    }
  }
  const orphanPlayers: typeof players = [];
  for (const p of visible) {
    const home = items.find((i) => i.product.id === p.softwareProduct?.id);
    if (home) home.players.push({ player: p, musicCount: counts.get(p.id) ?? 0 });
    else orphanPlayers.push(p);
  }
  items.sort((a, b) => Number(b.isPlayer) - Number(a.isPlayer));

  const rows = [
    { href: shopPath(urlLang, "/account/music"), icon: MusicNotes, title: t.music, line: t.musicLine(totalMusic, playersWithMusic) },
    { href: shopPath(urlLang, "/account/orders"), icon: Receipt, title: t.orders, line: t.ordersLine(orders.length) },
    { href: shopPath(urlLang, "/account/support"), icon: ChatCircleText, title: t.support, line: t.supportLine(openCount, waitingCount), attention: waitingCount > 0 },
    { href: shopPath(urlLang, "/account/profile"), icon: IdentificationCard, title: t.profile, line: t.profileLine },
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <Container>
        <FadeIn className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-lg text-neutral-500">{t.hello(customer.firstName)}</p>
            <h1 className="mt-1 font-display text-4xl font-bold tracking-tight text-neutral-950 sm:text-5xl">{t.homeTitle}</h1>
          </div>
          <p className="text-sm text-neutral-500">
            <span className="break-all">{t.signedInAs(customer.email ?? "")}</span>
            <span className="mx-2 text-neutral-300" aria-hidden>·</span>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Auth0 route needs a full page load */}
            <a href="/auth/logout" className="font-medium text-neutral-950 hover:underline">{t.signOut}</a>
          </p>
        </FadeIn>

        {/* The only things that can need the customer's attention, shown before anything else. */}
        {(waitingForPlayer > 0 || waitingForDmi > 0) && (
          <FadeIn className="mt-10 flex flex-col gap-3">
            {waitingForPlayer > 0 && (
              <div className="flex flex-col gap-4 rounded-2xl bg-neutral-950 px-6 py-5 text-white sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-center gap-3">
                  <Tray size={20} aria-hidden className="shrink-0" />
                  <span>
                    <span className="block font-semibold">{t.waitingTitle(waitingForPlayer)}</span>
                    {!canPlace && <span className="block text-sm text-neutral-300">{t.waitingNoPlayer}</span>}
                  </span>
                </p>
                {canPlace && (
                  <Link href={`${shopPath(urlLang, "/account/music")}#waiting`} className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-white px-5 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200 sm:self-auto">
                    {t.waitingCta}
                    <ArrowRight size={14} weight="bold" aria-hidden />
                  </Link>
                )}
              </div>
            )}
            {waitingForDmi > 0 && (
              <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-6 py-4 text-sm">
                <Clock size={18} aria-hidden className="shrink-0 text-neutral-500" />
                <span><span className="font-semibold text-neutral-950">{t.reviewTitle(waitingForDmi)}</span> <span className="text-neutral-600">{t.reviewBody}</span></span>
              </div>
            )}
          </FadeIn>
        )}

        <div className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl font-bold text-neutral-950">{t.yourSoftware}</h2>
            <Link href={softwarePath(urlLang)} className="text-sm font-semibold text-neutral-950 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-950">
              {t.allSoftware}
            </Link>
          </div>
          <FadeInStagger faster className="mt-6 flex flex-col gap-6">
            {items.map((item) => (
              <FadeIn key={item.product.id}>
                <SoftwareCard lang={urlLang} item={item} />
              </FadeIn>
            ))}
            {orphanPlayers.length > 0 && (
              <FadeIn className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {orphanPlayers.map((p) => (
                  <PlayerCard key={p.id} lang={urlLang} player={p} musicCount={counts.get(p.id) ?? 0} />
                ))}
              </FadeIn>
            )}
          </FadeInStagger>
        </div>

        <div className="mt-16">
          <h2 className="font-display text-2xl font-bold text-neutral-950">{t.shortcuts}</h2>
          <FadeIn className="mt-6">
            <ul className="grid grid-cols-1 overflow-hidden rounded-3xl border border-neutral-200 bg-white sm:grid-cols-2 lg:grid-cols-4">
              {rows.map((r) => (
                <li key={r.href} className="-mb-px border-b border-neutral-200 sm:border-r sm:[&:nth-child(2n)]:border-r-0 lg:[&:nth-child(2n)]:border-r lg:[&:nth-child(4n)]:border-r-0">
                  <Link href={r.href} className="group flex items-center gap-4 px-6 py-5 transition hover:bg-neutral-50">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-700">
                      <r.icon size={18} aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-neutral-950">{r.title}</span>
                      <span className={clsx("block truncate text-sm", r.attention ? "font-medium text-neutral-950" : "text-neutral-500")}>
                        {r.attention && <span aria-hidden className="mr-1.5 inline-block h-2 w-2 rounded-full bg-amber-500 align-middle" />}
                        {r.line}
                      </span>
                    </span>
                    <CaretRight size={16} weight="bold" aria-hidden className="shrink-0 text-neutral-400 transition group-hover:translate-x-0.5 group-hover:text-neutral-950" />
                  </Link>
                </li>
              ))}
            </ul>
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}

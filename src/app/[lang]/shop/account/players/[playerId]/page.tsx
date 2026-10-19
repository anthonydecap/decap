import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowsLeftRight, ChatCircleText, Desktop, DownloadSimple, Handshake, MusicNotes, Plus, Sparkle } from "@phosphor-icons/react/ssr";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
import { resolveUrlLang } from "@/i18n";
import { shopDb } from "@/modules/shop/db";
import { customerMusicPlayers, LIVE_LICENSE_STATUSES } from "@/modules/shop/services/music-licenses";
import { formatDate } from "@/modules/shop/ui/format";
import { requireAccountCustomer } from "@/modules/shop/ui/store/account-server";
import {
  addMusicHref,
  BackLink,
  btnPrimary,
  btnSecondary,
  card,
  eyebrow,
  helpLicensingPath,
  playerPath,
  PlayerStatusDot,
  supportNewHref,
  textLink,
} from "@/modules/shop/ui/store/account-ui";
import { shopPath } from "@/modules/shop/ui/store/copy";
import { accountCopy } from "@/modules/shop/ui/store/copy-account";
import { dmiCopy } from "@/modules/shop/ui/store/copy-dmi";
import { PlayerNameEditor } from "@/modules/shop/ui/store/PlayerNameEditor";
import { ActivationKey } from "@/modules/shop/ui/store/software/ActivationKey";
import { licenseNumber } from "@/modules/shop/domain/software-status";
import { accountSoftwarePath, softwareDownloadHref } from "@/modules/shop/ui/store/software/links";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Player", robots: { index: false } };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NEW_PLAYER_DAYS = 14;

function SectionHeading({ icon: Icon, title }: { icon: typeof MusicNotes; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-700">
        <Icon size={20} aria-hidden />
      </span>
      <h2 className="font-display text-xl font-bold text-neutral-950">{title}</h2>
    </div>
  );
}

/**
 * One player: its music, its software license and help for it. The customer may rename it;
 * moving music, transferring or retiring a player goes through DMI Support. Someone else's
 * player is a 404 (every query carries the customer id).
 */
export default async function PlayerDetailPage({ params }: { params: Promise<{ lang: string; playerId: string }> }) {
  const { lang, playerId } = await params;
  const urlLang = resolveUrlLang(lang);
  const t = accountCopy(urlLang);
  const customer = await requireAccountCustomer(urlLang, playerPath(urlLang, playerId));
  if (!UUID.test(playerId)) notFound();

  const db = shopDb();
  const [players, details, musicCount, starterCount, ticketCount] = await Promise.all([
    customerMusicPlayers(customer.id),
    db.registeredPlayer.findFirst({
      where: { id: playerId, customerId: customer.id },
      select: { serialNumber: true, registeredAt: true, warrantyUntil: true },
    }),
    db.musicLicense.count({ where: { customerId: customer.id, licensedPlayerId: playerId, status: { in: LIVE_LICENSE_STATUSES } } }),
    db.musicLicense.count({
      where: { customerId: customer.id, licensedPlayerId: playerId, status: { in: LIVE_LICENSE_STATUSES }, licenseSource: "PLAYER_STARTER_PACK" },
    }),
    db.supportTicket.count({ where: { customerId: customer.id, registeredPlayerId: playerId } }),
  ]);
  // The software this player is: the activated copy, its license and its key.
  const installation = await db.softwareInstallation.findFirst({
    where: { customerId: customer.id, registeredPlayerId: playerId, status: { in: ["ACTIVE", "SUSPENDED"] } },
    orderBy: { activatedAt: "desc" },
    select: { id: true, activationKeyEncrypted: true, license: { select: { number: true, status: true } }, product: { select: { name: true, slug: true } } },
  });
  const player = players.find((p) => p.id === playerId);
  if (!player || !details) notFound();

  const canAdd = player.eligible && player.supportsMusicLibrary;
  // eslint-disable-next-line react-hooks/purity -- request-time render, force-dynamic
  const now = Date.now();
  const isNew = player.status === "ACTIVE" && player.activatedAt != null && now - player.activatedAt.getTime() < NEW_PLAYER_DAYS * 86400000;
  const musicHref = playerPath(urlLang, player.id, "/music");
  const helpHref = supportNewHref(urlLang, { about: "player", player: player.id });
  const software = player.softwareProduct;

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <Container>
        <BackLink href={shopPath(urlLang, "/account")} label={t.backToMyDmi} />

        <FadeIn className="mt-8 flex flex-col gap-3">
          <div id="name" className="scroll-mt-28">
            <PlayerNameEditor lang={urlLang} playerId={player.id} name={player.name} friendlyName={player.friendlyName} />
          </div>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-neutral-600">
            <span>{player.typeName}</span>
            <span className="text-neutral-300" aria-hidden>·</span>
            <span className="tabular-nums">{t.registration(player.maskedRegistration)}</span>
            <span className="text-neutral-300" aria-hidden>·</span>
            <PlayerStatusDot lang={urlLang} status={player.status} />
          </p>
          {player.status !== "ACTIVE" && t.playerStatusNote[player.status] && (
            <p className="text-sm text-neutral-600">{t.playerStatusNote[player.status]}</p>
          )}
        </FadeIn>

        {/* §64: a freshly activated player gets a short "what now". */}
        {isNew && (
          <FadeIn className="mt-10">
            <div className="grid grid-cols-1 gap-6 rounded-2xl bg-neutral-950 p-6 text-white sm:p-8 lg:grid-cols-12 lg:rounded-3xl">
              <div className="lg:col-span-7">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                  <Sparkle size={20} aria-hidden />
                </span>
                <p className="mt-4 font-display text-2xl font-bold sm:text-3xl">{t.readyTitle}</p>
                <p className="mt-2 text-neutral-300">
                  {player.name}
                  <span className="mx-2 text-neutral-600" aria-hidden>|</span>
                  <span className="tabular-nums">{t.registration(player.maskedRegistration)}</span>
                </p>
                {starterCount > 0 && <p className="mt-4 text-neutral-200">{t.readyStarter(starterCount)}</p>}
                <div className="mt-6 flex flex-wrap gap-3">
                  {starterCount > 0 ? (
                    <Link href={musicHref} className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200">
                      {t.exploreStarter}
                      <ArrowRight size={14} weight="bold" aria-hidden />
                    </Link>
                  ) : (
                    canAdd && (
                      <Link href={addMusicHref(urlLang, player.id)} className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200">
                        {t.browseMusic}
                        <ArrowRight size={14} weight="bold" aria-hidden />
                      </Link>
                    )
                  )}
                </div>
              </div>
              <div className="lg:col-span-5">
                <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">{t.readyNextSteps}</p>
                <ol className="mt-3 flex flex-col gap-3">
                  {(starterCount > 0 ? t.readyStepsStarter : t.readySteps).map((step, i) => (
                    <li key={step} className="flex items-center gap-3 text-sm text-neutral-200">
                      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/20 text-xs font-semibold tabular-nums">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </FadeIn>
        )}

        {player.supportsMusicLibrary && (
          <FadeIn className="mt-10">
            <div className="flex flex-col gap-6 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between sm:p-8">
              <div>
                <p className={eyebrow}>{t.musicSection}</p>
                <p className="mt-3 font-display text-6xl font-bold leading-none tracking-tight text-neutral-950 tabular-nums">{musicCount}</p>
                <p className="mt-2 text-neutral-600">{musicCount === 0 ? t.playerNoMusic : dmiCopy(urlLang).songsWord(musicCount)}</p>
                {!canAdd && player.ineligibleReason && <p className="mt-2 text-sm text-neutral-600">{t.ineligible[player.ineligibleReason]}</p>}
              </div>
              <div className="flex flex-wrap gap-3">
                {canAdd && (
                  <Link href={addMusicHref(urlLang, player.id)} className={btnPrimary}>
                    <Plus size={14} weight="bold" aria-hidden />
                    {dmiCopy(urlLang).addMusic}
                  </Link>
                )}
                {musicCount > 0 && (
                  <Link href={musicHref} className={btnSecondary}>
                    {t.viewMusic}
                    <ArrowRight size={14} weight="bold" aria-hidden />
                  </Link>
                )}
              </div>
            </div>
          </FadeIn>
        )}

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col gap-6 lg:col-span-8">
            <div className={card}>
              <SectionHeading icon={Desktop} title={installation?.product.name ?? software?.name ?? t.softwareSection} />
              {installation ? (
                <>
                  <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className={eyebrow}>{t.registrationLabel}</dt>
                      <dd className="mt-1 tabular-nums text-neutral-950">{player.maskedRegistration}</dd>
                    </div>
                    <div>
                      <dt className={eyebrow}>{dmiCopy(urlLang).licenseLabel}</dt>
                      <dd className="mt-1 text-neutral-950">{licenseNumber(installation.license.number)}</dd>
                    </div>
                  </dl>
                  {installation.activationKeyEncrypted && (
                    <div className="mt-6">
                      <ActivationKey lang={urlLang} installationId={installation.id} />
                    </div>
                  )}
                  <div className="mt-6 flex flex-wrap items-center gap-4">
                    {/* Plain navigation: the download route signs a short-lived URL. */}
                    <a href={softwareDownloadHref(installation.product.slug, urlLang, "account")} className={btnSecondary}>
                      <DownloadSimple size={14} weight="bold" aria-hidden />
                      {t.downloadLatest}
                    </a>
                    <Link href={accountSoftwarePath(urlLang, installation.product.slug)} className={textLink}>
                      {t.viewSoftwareLicense}
                      <ArrowRight size={14} weight="bold" aria-hidden />
                    </Link>
                  </div>
                </>
              ) : software ? (
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <a href={softwareDownloadHref(software.slug, urlLang, "account")} className={btnSecondary}>
                    <DownloadSimple size={14} weight="bold" aria-hidden />
                    {t.downloadLatest}
                  </a>
                  <Link href={accountSoftwarePath(urlLang, software.slug)} className={textLink}>
                    {t.viewSoftwareLicense}
                    <ArrowRight size={14} weight="bold" aria-hidden />
                  </Link>
                </div>
              ) : (
                <p className="mt-5 text-neutral-600">{t.noSoftwareForType}</p>
              )}
            </div>

            <div className={card}>
              <SectionHeading icon={ChatCircleText} title={t.supportSection} />
              <p className="mt-5 text-neutral-700">{t.previousRequests(ticketCount)}</p>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Link href={helpHref} className={btnSecondary}>{t.getHelpPlayer}</Link>
                {ticketCount > 0 && (
                  <Link href={shopPath(urlLang, "/account/support")} className={textLink}>{t.viewSupport}</Link>
                )}
              </div>
            </div>
          </div>

          <aside className="flex flex-col gap-6 lg:col-span-4">
            <div className={card}>
              <h2 className="font-display text-lg font-bold text-neutral-950">{t.detailsTitle}</h2>
              <dl className="mt-5 flex flex-col gap-4 text-sm">
                <div>
                  <dt className={eyebrow}>{t.type}</dt>
                  <dd className="mt-1 text-neutral-950">{player.typeName}</dd>
                </div>
                <div>
                  <dt className={eyebrow}>{t.registrationLabel}</dt>
                  <dd className="mt-1 tabular-nums text-neutral-950">{player.maskedRegistration}</dd>
                </div>
                <div>
                  <dt className={eyebrow}>{t.statusLabel}</dt>
                  <dd className="mt-1 text-neutral-950">{t.playerStatus[player.status]}</dd>
                </div>
                {details.registeredAt && (
                  <div>
                    <dt className={eyebrow}>{t.registered}</dt>
                    <dd className="mt-1 text-neutral-950">{formatDate(details.registeredAt, urlLang)}</dd>
                  </div>
                )}
                {details.serialNumber && (
                  <div>
                    <dt className={eyebrow}>{t.serial}</dt>
                    <dd className="mt-1 break-all text-neutral-950">{details.serialNumber}</dd>
                  </div>
                )}
                {details.warrantyUntil && (
                  <div>
                    <dt className={eyebrow}>{t.warranty}</dt>
                    <dd className="mt-1 text-neutral-950">{formatDate(details.warrantyUntil, urlLang)}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* §65 / §52: no self-service transfer. Support reviews replacements and resale. */}
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 sm:p-8 lg:rounded-3xl">
              <div className="flex items-start gap-3">
                <ArrowsLeftRight size={20} className="mt-0.5 shrink-0 text-neutral-700" aria-hidden />
                <div>
                  <h2 className="font-display text-base font-bold text-neutral-950">{t.replaceTitle}</h2>
                  <p className="mt-2 text-sm text-neutral-600">{t.replaceBody}</p>
                  <Link href={supportNewHref(urlLang, { about: "player", player: player.id })} className={`${textLink} mt-3`}>
                    {t.requestHelp}
                  </Link>
                </div>
              </div>
              <div className="mt-6 flex items-start gap-3 border-t border-neutral-200 pt-6">
                <Handshake size={20} className="mt-0.5 shrink-0 text-neutral-700" aria-hidden />
                <div>
                  <h2 className="font-display text-base font-bold text-neutral-950">{t.resaleTitle}</h2>
                  <p className="mt-2 text-sm text-neutral-600">{t.resaleBody}</p>
                  <Link href={helpLicensingPath(urlLang, "#selling")} className={`${textLink} mt-3`}>
                    {t.learnHowItWorks}
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </section>
  );
}

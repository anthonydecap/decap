import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChatCircleText, CheckCircle, Info, Warning } from "@phosphor-icons/react/ssr";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
import { resolveUrlLang } from "@/i18n";
import { activationSteps, licenseNumber } from "@/modules/shop/domain/software-status";
import { formatOrderNumber } from "@/modules/shop/services/checkout";
import { customerSoftwareDetail, type CustomerLicense } from "@/modules/shop/services/software";
import { formatBytes, formatDate } from "@/modules/shop/ui/format";
import { formatDateTimeLang, requireAccountCustomer } from "@/modules/shop/ui/store/account-server";
import { shopCopy, shopPath } from "@/modules/shop/ui/store/copy";
import { ActivationForm, ComputerChange, type ComputerOption } from "@/modules/shop/ui/store/software/ActivationForm";
import { ActivationKey } from "@/modules/shop/ui/store/software/ActivationKey";
import { ActivationProgress } from "@/modules/shop/ui/store/software/ActivationProgress";
import { ActivationReply } from "@/modules/shop/ui/store/software/ActivationReply";
import { BuyLicenseButton } from "@/modules/shop/ui/store/software/BuyLicenseButton";
import { DownloadButton } from "@/modules/shop/ui/store/software/DownloadButton";
import { accountSoftwarePath, softwareDownloadHref, supportForSoftwareHref } from "@/modules/shop/ui/store/software/links";
import { SoftwareIcon } from "@/modules/shop/ui/store/software/SoftwareIcon";
import { StatusSummary } from "@/modules/shop/ui/store/software/StatusSummary";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My Software", robots: { index: false } };

const SLUG = /^[a-z0-9-]{1,120}$/;
const card = "rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 lg:rounded-3xl";
const panel = "rounded-2xl border border-neutral-200 bg-neutral-50 p-5 sm:p-6";
const NEEDS_CUSTOMER = new Set(["REGISTRATION_CODE_NEEDED", "ATTENTION", "ACTION_REQUIRED"]);

export default async function MySoftwareProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; slug: string }>;
  searchParams: Promise<{ submitted?: string }>;
}) {
  const { lang, slug } = await params;
  const { submitted } = await searchParams;
  const urlLang = resolveUrlLang(lang);
  const all = shopCopy(urlLang);
  const t = all.sw;
  const customer = await requireAccountCustomer(urlLang, accountSoftwarePath(urlLang, SLUG.test(slug) ? slug : undefined));
  if (!SLUG.test(slug)) notFound();

  // Scoped to the signed-in customer: licenses, codes (masked) and downloads are theirs only.
  const detail = await customerSoftwareDetail(customer.id, slug);
  if (!detail) notFound();
  const { product, licenses, downloads, status } = detail;

  const confirmed = licenses.find(
    (l) => l.id === submitted && (l.state === "WAITING_FOR_DMI" || l.state === "BEING_PROCESSED"),
  );
  const firstActionId = licenses.find((l) => NEEDS_CUSTOMER.has(l.state))?.id ?? null;
  const forSale = product.status === "ACTIVE" && product.licensePriceCents != null && product.licensePriceCents > 0;
  const releases = product.releases;
  const liveLicenses = licenses.filter((l) => l.state !== "REVOKED");

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <Container>
        <Link href={accountSoftwarePath(urlLang)} className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-950">
          <ArrowLeft size={14} weight="bold" aria-hidden />
          {t.backToMySoftware}
        </Link>

        <FadeIn className="mt-6 flex items-start gap-5">
          <SoftwareIcon src={product.iconUrl} size="lg" />
          <div className="min-w-0">
            <h1 className="font-display text-4xl font-bold tracking-tight text-neutral-950 sm:text-5xl">{product.name}</h1>
            <StatusSummary lang={urlLang} status={status} className="mt-4 max-w-2xl" />
          </div>
        </FadeIn>

        {confirmed && <Confirmation lang={urlLang} productName={product.name} license={confirmed} />}

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col gap-6 lg:col-span-7">
            {liveLicenses.length === 0 && (
              <div className={card}>
                <h2 className="font-display text-xl font-bold text-neutral-950 sm:text-2xl">{t.noLicenseTitle}</h2>
                <p className="mt-2 text-neutral-600">
                  {!forSale ? t.noLicenseNotSold : product.trialAvailable ? t.noLicenseTrial : t.noLicenseNoTrial}
                </p>
                {forSale && <BuyLicenseButton lang={urlLang} productId={product.id} variant="primary" className="mt-6 items-start" />}
              </div>
            )}
            {licenses.map((l) => (
              <LicenseCard
                key={l.id}
                lang={urlLang}
                license={l}
                product={{ id: product.id, slug: product.slug, name: product.name, activationInstructions: product.activationInstructions }}
                anchor={l.id === firstActionId}
              />
            ))}
          </div>

          <div className="flex flex-col gap-6 lg:col-span-5">
            <div className={card}>
              <h2 className="font-display text-xl font-bold text-neutral-950">{t.downloadTitle}</h2>
              <p className="mt-2 text-sm text-neutral-600">{t.downloadBody}</p>
              {releases.length === 0 ? (
                <p className="mt-6 rounded-xl bg-neutral-100 px-4 py-3 text-sm text-neutral-700">{t.noDownloadYet}</p>
              ) : releases.length === 1 ? (
                <div className="mt-6">
                  <p className="text-sm text-neutral-500">
                    {t.latestVersion} {releases[0]!.version}
                    {releases[0]!.fileSizeBytes != null && `, ${formatBytes(Number(releases[0]!.fileSizeBytes))}`}
                  </p>
                  <DownloadButton
                    lang={urlLang}
                    href={softwareDownloadHref(product.slug, urlLang, "account")}
                    signedIn
                    gate={null}
                    label={t.downloadLatest}
                    className="mt-4"
                  />
                </div>
              ) : (
                <ul className="mt-6 divide-y divide-neutral-200 border-y border-neutral-200">
                  {releases.map((r) => (
                    <li key={r.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-sm">
                        <p className="font-medium text-neutral-950">
                          {t.platforms[r.platform] ?? r.platform}, {t.architectures[r.architecture] ?? r.architecture}
                        </p>
                        <p className="text-neutral-500">
                          {r.version}
                          {r.fileSizeBytes != null && `, ${formatBytes(Number(r.fileSizeBytes))}`}
                        </p>
                      </div>
                      <DownloadButton
                        lang={urlLang}
                        href={softwareDownloadHref(product.slug, urlLang, "account", r.id)}
                        signedIn
                        gate={null}
                        label={t.download}
                        variant="compact"
                        className="self-start sm:self-auto"
                      />
                    </li>
                  ))}
                </ul>
              )}

              <h3 className="mt-8 text-xs uppercase tracking-wider text-neutral-500">{t.recentDownloads}</h3>
              {downloads.length === 0 ? (
                <p className="mt-2 text-sm text-neutral-600">{t.noDownloadsYet}</p>
              ) : (
                <ul className="mt-2 flex flex-col gap-1.5 text-sm text-neutral-700">
                  {downloads.map((d) => (
                    <li key={d.id} className="flex flex-wrap justify-between gap-x-4">
                      <span>{formatDateTimeLang(d.downloadedAt, urlLang)}</span>
                      <span className="text-neutral-500">
                        {d.release.version}, {t.platforms[d.release.platform] ?? d.release.platform}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className={card}>
              <h2 className="font-display text-lg font-bold text-neutral-950">{t.needHelp}</h2>
              <Link
                href={supportForSoftwareHref(urlLang, { software: product.id, license: liveLicenses[0]?.id })}
                className="mt-4 inline-flex items-center gap-2 rounded-full border-2 border-neutral-950 px-5 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-950 hover:text-white"
              >
                <ChatCircleText size={16} aria-hidden />
                {t.contactSupport}
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/** Spec section 16: shown right after the customer submitted a registration code. */
function Confirmation({ lang, productName, license }: { lang: string; productName: string; license: CustomerLicense }) {
  const t = shopCopy(lang).sw;
  const req = license.requests[0];
  return (
    <div role="status" className="mt-10 rounded-2xl border border-neutral-950 bg-white p-6 sm:p-8 lg:rounded-3xl">
      <div className="flex items-start gap-3">
        <CheckCircle size={28} weight="fill" className="mt-0.5 shrink-0 text-neutral-950" aria-hidden />
        <div className="min-w-0">
          <h2 className="font-display text-xl font-bold text-neutral-950 sm:text-2xl">{t.confirmTitle}</h2>
          <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-wider text-neutral-500">{t.catalogTitle}</dt>
              <dd className="mt-1 text-neutral-950">{productName}</dd>
            </div>
            {req && (
              <div>
                <dt className="text-xs uppercase tracking-wider text-neutral-500">{t.registration}</dt>
                <dd className="mt-1 font-mono text-neutral-950">{req.registrationCode}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs uppercase tracking-wider text-neutral-500">{t.status}</dt>
              <dd className="mt-1 text-neutral-950">{t.licenseStates[license.state]}</dd>
            </div>
          </dl>
          <p className="mt-4 text-neutral-600">{t.confirmBody}</p>
          <a href={`#license-${license.id}`} className="mt-6 inline-block rounded-full bg-neutral-950 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800">
            {t.viewLicense}
          </a>
        </div>
      </div>
    </div>
  );
}

function LicenseCard({
  lang,
  license: l,
  product,
  anchor,
}: {
  lang: string;
  license: CustomerLicense;
  product: { id: string; slug: string; name: string; activationInstructions: string | null };
  anchor: boolean;
}) {
  const t = shopCopy(lang).sw;
  const latest = l.requests[0] ?? null;
  const active = l.installations.filter((i) => i.status === "ACTIVE");
  const computers: ComputerOption[] = active.map((i) => ({
    id: i.id,
    label: [i.label, i.activatedAt ? t.computerOption(i.registrationCode, formatDate(i.activatedAt, lang)) : t.computerOptionNoDate(i.registrationCode)]
      .filter(Boolean)
      .join(", "),
  }));
  const openRequest = l.requests.find((r) => r.status === "SUBMITTED" || r.status === "IN_REVIEW" || r.status === "WAITING_FOR_CUSTOMER");
  const closed = l.state === "SUSPENDED" || l.state === "REVOKED";
  const formProps = {
    lang,
    slug: product.slug,
    licenseId: l.id,
    productName: product.name,
    instructions: product.activationInstructions,
    computers,
  };
  const support = supportForSoftwareHref(lang, {
    software: product.id,
    license: l.id,
    activation: openRequest?.id ?? (l.state === "ATTENTION" ? latest?.id : undefined),
  });

  return (
    <article id={`license-${l.id}`} className={`${card} scroll-mt-24`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="font-display text-xl font-bold text-neutral-950 sm:text-2xl">{t.licenseTitle(licenseNumber(l.number))}</h2>
        <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${NEEDS_CUSTOMER.has(l.state) ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-700"}`}>
          {t.licenseStates[l.state] ?? l.state}
        </span>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs uppercase tracking-wider text-neutral-500">{t.purchased}</dt>
          <dd className="mt-1 text-neutral-950">{formatDate(l.purchasedAt, lang)}</dd>
        </div>
        {l.order && (
          <div>
            <dt className="text-xs uppercase tracking-wider text-neutral-500">{t.order}</dt>
            <dd className="mt-1">
              <Link href={shopPath(lang, `/account/orders/${l.order.id}`)} className="text-neutral-950 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-950">
                {formatOrderNumber(l.order.number)}
              </Link>
            </dd>
          </div>
        )}
        {!closed && (
          <div>
            <dt className="text-xs uppercase tracking-wider text-neutral-500">{t.computers}</dt>
            <dd className="mt-1 text-neutral-950">{t.computersUsed(l.activeInstallations, l.maxActivations)}</dd>
          </div>
        )}
      </dl>

      {!closed && (
        <div className="mt-6 border-t border-neutral-200 pt-6">
          <ActivationProgress lang={lang} steps={activationSteps(l.stateInput)} />
        </div>
      )}

      <div id={anchor ? "activate" : undefined} className="mt-6 flex scroll-mt-24 flex-col gap-6">
        {(l.state === "REGISTRATION_CODE_NEEDED" || l.state === "ATTENTION") && (
          <>
            {l.state === "ATTENTION" && latest?.status === "REJECTED" && (
              <div className={panel}>
                <p className="flex items-center gap-2 font-semibold text-neutral-950">
                  <Warning size={18} weight="bold" aria-hidden />
                  {t.attentionTitle}
                </p>
                {latest.rejectionReason && (
                  <div className="mt-3">
                    <p className="text-xs uppercase tracking-wider text-neutral-500">{t.attentionReason}</p>
                    <p className="mt-1 whitespace-pre-line text-sm text-neutral-800">{latest.rejectionReason}</p>
                  </div>
                )}
                <p className="mt-3 text-sm text-neutral-600">{t.attentionBody}</p>
              </div>
            )}
            {l.canSubmitActivation && (
              <ActivationForm
                {...formProps}
                replace={!l.hasFreeActivation && computers.length > 0 ? "required" : "none"}
                title={t.activateTitle(product.name)}
              />
            )}
          </>
        )}

        {l.state === "ACTION_REQUIRED" && openRequest && (
          <>
            <div className={panel}>
              <p className="flex items-center gap-2 font-semibold text-neutral-950">
                <ChatCircleText size={18} weight="bold" aria-hidden />
                {t.infoTitle}
              </p>
              {openRequest.infoRequest && (
                <div className="mt-3">
                  <p className="text-xs uppercase tracking-wider text-neutral-500">{t.infoFromDmi}</p>
                  <p className="mt-1 whitespace-pre-line text-sm text-neutral-800">{openRequest.infoRequest}</p>
                </div>
              )}
              <p className="mt-3 text-xs text-neutral-500">
                {t.registration} <span className="font-mono">{openRequest.registrationCode}</span>
              </p>
            </div>
            <ActivationReply lang={lang} requestId={openRequest.id} />
          </>
        )}

        {(l.state === "WAITING_FOR_DMI" || l.state === "BEING_PROCESSED") && openRequest && (
          <div className={panel}>
            <p className="flex items-center gap-2 font-semibold text-neutral-950">
              <CheckCircle size={18} weight="bold" aria-hidden />
              {openRequest.underReview ? t.reviewTitle : l.state === "BEING_PROCESSED" ? t.processingTitle : t.waitingTitle}
            </p>
            <p className="mt-2 text-sm text-neutral-600">
              {openRequest.underReview ? t.reviewBody : l.state === "BEING_PROCESSED" ? t.processingBody : t.waitingBody}
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wider text-neutral-500">{t.registration}</dt>
                <dd className="mt-1 font-mono text-neutral-950">{openRequest.registrationCode}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-neutral-500">{t.sent}</dt>
                <dd className="mt-1 text-neutral-950">{formatDate(openRequest.submittedAt, lang)}</dd>
              </div>
            </dl>
          </div>
        )}

        {l.state === "SUSPENDED" && (
          <div className={panel}>
            <p className="flex items-center gap-2 font-semibold text-neutral-950">
              <Info size={18} weight="bold" aria-hidden />
              {t.suspendedTitle}
            </p>
            <p className="mt-2 text-sm text-neutral-600">{t.suspendedBody}</p>
          </div>
        )}
        {l.state === "REVOKED" && (
          <div className={panel}>
            <p className="flex items-center gap-2 font-semibold text-neutral-950">
              <Info size={18} weight="bold" aria-hidden />
              {t.revokedTitle}
            </p>
            <p className="mt-2 text-sm text-neutral-600">{t.revokedBody}</p>
          </div>
        )}
      </div>

      {l.status === "ACTIVE" && (
        <div className="mt-6 border-t border-neutral-200 pt-6">
          <h3 className="font-display text-lg font-bold text-neutral-950">{t.computersTitle}</h3>
          {active.length === 0 ? (
            <p className="mt-2 text-sm text-neutral-600">{t.noComputersYet}</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-4">
              {active.map((i) => (
                <li key={i.id} className="rounded-2xl border border-neutral-200 p-5">
                  <dl className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-xs uppercase tracking-wider text-neutral-500">{t.registration}</dt>
                      <dd className="mt-1 font-mono text-neutral-950">{i.registrationCode}</dd>
                      {i.label && <dd className="mt-0.5 text-neutral-600">{i.label}</dd>}
                    </div>
                    {i.activatedAt && (
                      <div>
                        <dt className="text-xs uppercase tracking-wider text-neutral-500">{t.activated}</dt>
                        <dd className="mt-1 text-neutral-950">{formatDate(i.activatedAt, lang)}</dd>
                      </div>
                    )}
                  </dl>
                  <div className="mt-4">
                    {i.hasActivationKey ? (
                      <ActivationKey lang={lang} installationId={i.id} />
                    ) : (
                      <p className="text-sm text-neutral-600">{t.noKeyYet}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          {l.state === "LICENSED" && l.canSubmitActivation && (
            <div className="mt-6">
              <ComputerChange {...formProps} canAdd={l.hasFreeActivation} />
            </div>
          )}
        </div>
      )}

      <div className="mt-6 border-t border-neutral-200 pt-4">
        <Link href={support} className="inline-flex items-center gap-2 text-sm text-neutral-600 underline decoration-neutral-300 underline-offset-4 transition hover:text-neutral-950 hover:decoration-neutral-950">
          <ChatCircleText size={14} aria-hidden />
          {t.needHelp} {t.contactSupport}
        </Link>
      </div>
    </article>
  );
}

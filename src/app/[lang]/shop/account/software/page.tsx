import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChatCircleText, Key } from "@phosphor-icons/react/ssr";
import { Container } from "@/components/Container";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import { resolveUrlLang } from "@/i18n";
import { customerSoftwareOverview } from "@/modules/shop/services/software";
import { formatDate } from "@/modules/shop/ui/format";
import { requireAccountCustomer } from "@/modules/shop/ui/store/account-server";
import { shopCopy, softwarePath } from "@/modules/shop/ui/store/copy";
import { BuyLicenseButton } from "@/modules/shop/ui/store/software/BuyLicenseButton";
import { DownloadButton } from "@/modules/shop/ui/store/software/DownloadButton";
import { accountSoftwarePath, softwareDownloadHref, supportForSoftwareHref } from "@/modules/shop/ui/store/software/links";
import { SoftwareIcon } from "@/modules/shop/ui/store/software/SoftwareIcon";
import { StatusSummary } from "@/modules/shop/ui/store/software/StatusSummary";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My Software", robots: { index: false } };

const smallBtn =
  "inline-flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-1.5 text-sm font-semibold text-neutral-950 transition hover:border-neutral-950";
const smallPrimary =
  "inline-flex items-center gap-2 rounded-full bg-neutral-950 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-neutral-800";

/** The customer's software hub: one card per program they downloaded or hold a license for. */
export default async function MySoftwarePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const urlLang = resolveUrlLang(lang);
  const t = shopCopy(urlLang).sw;
  const customer = await requireAccountCustomer(urlLang, accountSoftwarePath(urlLang));
  const items = await customerSoftwareOverview(customer.id);

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <Container>
        <FadeIn className="max-w-2xl">
          <h1 className="font-display text-4xl font-bold tracking-tight text-neutral-950 sm:text-5xl">{t.mySoftwareTitle}</h1>
          <p className="mt-4 text-lg text-neutral-600">{t.mySoftwareBody}</p>
        </FadeIn>

        {items.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-neutral-300 px-6 py-20 text-center">
            <p className="font-display text-xl font-bold text-neutral-950">{t.mySoftwareEmpty}</p>
            <p className="mx-auto mt-2 max-w-md text-neutral-600">{t.mySoftwareEmptyBody}</p>
            <Link href={softwarePath(urlLang)} className="mt-8 inline-block rounded-full bg-neutral-950 px-8 py-3 font-semibold text-white transition hover:bg-neutral-800">
              {t.browseSoftware}
            </Link>
          </div>
        ) : (
          <FadeInStagger faster className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {items.map(({ product: p, status, licenses, lastDownloadedAt, lastDownloadedVersion }) => {
              const detail = accountSoftwarePath(urlLang, p.slug);
              const hasLicense = licenses.some((l) => l.state !== "REVOKED");
              const forSale = p.status === "ACTIVE" && p.licensePriceCents != null && p.licensePriceCents > 0;
              const visible = p.status === "ACTIVE" || p.status === "DISCONTINUED";
              return (
                <FadeIn key={p.id}>
                  <article className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-neutral-300 hover:shadow-md sm:p-8 lg:rounded-3xl">
                    <div className="flex items-start gap-4">
                      <SoftwareIcon src={p.iconUrl} />
                      <div className="min-w-0">
                        <h2 className="font-display text-xl font-bold text-neutral-950 sm:text-2xl">
                          <Link href={detail} className="hover:underline hover:decoration-neutral-300 hover:underline-offset-4">{p.name}</Link>
                        </h2>
                        <dl className="mt-1 flex flex-wrap gap-x-4 text-sm text-neutral-500">
                          {p.currentVersion && (
                            <div className="flex gap-1"><dt>{t.latestVersion}:</dt><dd className="text-neutral-700">{p.currentVersion}</dd></div>
                          )}
                          {lastDownloadedAt && (
                            <div className="flex gap-1">
                              <dt>{t.lastDownloaded}:</dt>
                              <dd className="text-neutral-700">
                                {formatDate(lastDownloadedAt, urlLang)}{lastDownloadedVersion ? `, ${lastDownloadedVersion}` : ""}
                              </dd>
                            </div>
                          )}
                        </dl>
                      </div>
                    </div>

                    <StatusSummary lang={urlLang} status={status} className="mt-6" />

                    <div className="mt-auto flex flex-wrap items-start gap-2 pt-6">
                      {(status === "REGISTRATION_CODE_NEEDED" || status === "ATTENTION") && (
                        <Link href={`${detail}#activate`} className={smallPrimary}>
                          <Key size={14} weight="bold" aria-hidden />
                          {t.enterRegistrationCode}
                        </Link>
                      )}
                      {status === "ACTION_REQUIRED" && (
                        <Link href={`${detail}#activate`} className={smallPrimary}>
                          <ChatCircleText size={14} weight="bold" aria-hidden />
                          {t.replyToDmi}
                        </Link>
                      )}
                      {/* The overview has no release list; a current version means one is published. */}
                      {visible && p.currentVersion && (
                        <DownloadButton
                          lang={urlLang}
                          href={softwareDownloadHref(p.slug, urlLang, "account")}
                          signedIn
                          gate={null}
                          label={t.downloadLatest}
                          variant="compact"
                        />
                      )}
                      {hasLicense ? (
                        <Link href={detail} className={smallBtn}>
                          {licenses.length > 1 ? t.viewLicenses : t.viewLicense}
                          <ArrowRight size={14} weight="bold" aria-hidden />
                        </Link>
                      ) : (
                        <>
                          {forSale && <BuyLicenseButton lang={urlLang} productId={p.id} size="sm" />}
                          <Link href={detail} className={smallBtn}>
                            {t.viewDetails}
                            <ArrowRight size={14} weight="bold" aria-hidden />
                          </Link>
                        </>
                      )}
                      {status === "SUSPENDED" && (
                        <Link href={supportForSoftwareHref(urlLang, { software: p.id })} className={smallBtn}>
                          {t.contactSupport}
                        </Link>
                      )}
                    </div>
                  </article>
                </FadeIn>
              );
            })}
          </FadeInStagger>
        )}
      </Container>
    </section>
  );
}

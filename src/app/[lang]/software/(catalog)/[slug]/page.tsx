import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, Flask, Info } from "@phosphor-icons/react/ssr";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
import { resolveUrlLang } from "@/i18n";
import { loginUrl, signupUrl } from "@/modules/shop/auth/auth0";
import { getCurrentCustomer } from "@/modules/shop/auth/session";
import { customerSoftwareDetail, getPublicSoftware, type PublicRelease } from "@/modules/shop/services/software";
import { formatBytes, formatDate, formatMoney } from "@/modules/shop/ui/format";
import { shopCopy, softwarePath } from "@/modules/shop/ui/store/copy";
import { AutoDownload } from "@/modules/shop/ui/store/software/AutoDownload";
import { BuyLicenseButton } from "@/modules/shop/ui/store/software/BuyLicenseButton";
import { DownloadButton, type DownloadGate } from "@/modules/shop/ui/store/software/DownloadButton";
import { accountSoftwarePath, softwareDownloadHref } from "@/modules/shop/ui/store/software/links";
import { SoftwareIcon } from "@/modules/shop/ui/store/software/SoftwareIcon";
import { StatusSummary } from "@/modules/shop/ui/store/software/StatusSummary";

export const dynamic = "force-dynamic";

type Params = { lang: string; slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPublicSoftware(slug);
  if (!p) return { title: "Not found" };
  return { title: p.name, description: p.shortDescription ?? undefined };
}

export default async function SoftwareProductPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ download?: string; downloadError?: string }>;
}) {
  const { lang, slug } = await params;
  const { download, downloadError } = await searchParams;
  const urlLang = resolveUrlLang(lang);
  const all = shopCopy(urlLang);
  const t = all.sw;
  const product = await getPublicSoftware(slug);
  if (!product) notFound();

  const customer = await getCurrentCustomer();
  const signedIn = Boolean(customer);
  const mine = customer ? await customerSoftwareDetail(customer.id, slug) : null;
  const hasHistory = Boolean(mine && (mine.licenses.length > 0 || mine.downloads.length > 0));

  const returnTo = `${softwarePath(urlLang, `/${product.slug}`)}?download=1`;
  const gate: DownloadGate = { productName: product.name, signupHref: signupUrl(returnTo), loginHref: loginUrl(returnTo) };
  const releases = product.releases;
  const canDownload = releases.length > 0;
  const forSale = product.status === "ACTIVE" && product.licensePriceCents != null && product.licensePriceCents > 0;
  const notes = releases.find((r) => r.releaseNotes?.trim())?.releaseNotes ?? null;
  const version = product.currentVersion ?? releases[0]?.version ?? null;
  const beta = product.betaReleases[0] ?? null;
  const releaseLabel = (r: PublicRelease) =>
    [t.platforms[r.platform] ?? r.platform, t.architectures[r.architecture] ?? r.architecture].join(", ");

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <Container>
        {downloadError && (
          <p role="alert" className="mb-10 rounded-2xl border border-neutral-950 px-5 py-4 text-sm font-medium text-neutral-950">
            {downloadError === "busy" ? all.downloadBusy : all.downloadUnavailable}
          </p>
        )}
        {download === "1" && signedIn && canDownload && !downloadError && (
          <div className="mb-10">
            <AutoDownload lang={urlLang} href={softwareDownloadHref(product.slug, urlLang, "page")} />
          </div>
        )}

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <FadeIn className="lg:col-span-7">
            <div className="flex items-center gap-5">
              <SoftwareIcon src={product.iconUrl} size="lg" />
              <div className="min-w-0">
                <h1 className="font-display text-4xl font-bold tracking-tight text-neutral-950 sm:text-5xl">{product.name}</h1>
                {version && <p className="mt-2 text-neutral-500">{t.currentVersion} {version}</p>}
              </div>
            </div>
            {product.shortDescription && <p className="mt-6 text-xl text-neutral-600">{product.shortDescription}</p>}

            <ul className="mt-8 flex flex-col gap-2 text-neutral-800">
              <li className="flex items-center gap-2"><Check size={18} weight="bold" className="shrink-0" aria-hidden />{t.freeDownload}</li>
              {product.trialAvailable && (
                <li className="flex items-center gap-2"><Check size={18} weight="bold" className="shrink-0" aria-hidden />{t.trialIncluded}</li>
              )}
              {forSale && (
                <li className="flex items-center gap-2">
                  <Check size={18} weight="bold" className="shrink-0" aria-hidden />
                  {t.licenseAvailable}
                  <span className="text-neutral-500">{formatMoney(product.licensePriceCents!, product.currency, urlLang)}</span>
                </li>
              )}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start">
              {canDownload ? (
                <DownloadButton
                  lang={urlLang}
                  href={softwareDownloadHref(product.slug, urlLang, "page")}
                  signedIn={signedIn}
                  gate={gate}
                  label={t.downloadFree}
                />
              ) : (
                <p className="rounded-xl bg-neutral-100 px-4 py-3 text-sm text-neutral-700">{t.noDownloadYet}</p>
              )}
              {forSale && <BuyLicenseButton lang={urlLang} productId={product.id} />}
            </div>
            {forSale && <p className="mt-3 text-xs text-neutral-500">{all.vatNote}</p>}

            {product.status === "DISCONTINUED" && (
              <p className="mt-6 flex items-start gap-2 rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-700">
                <Info size={18} className="mt-0.5 shrink-0" aria-hidden />
                {t.discontinued}
              </p>
            )}

            {hasHistory && mine && (
              <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
                <StatusSummary lang={urlLang} status={mine.status} />
                <Link
                  href={accountSoftwarePath(urlLang, product.slug)}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-neutral-950 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-950"
                >
                  {t.openMySoftware}
                  <ArrowRight size={14} weight="bold" aria-hidden />
                </Link>
              </div>
            )}

            {product.description && (
              <div className="mt-10 max-w-prose whitespace-pre-line text-base leading-relaxed text-neutral-600">{product.description}</div>
            )}

            {notes && version && (
              <div className="mt-10 border-t border-neutral-200 pt-8">
                <h2 className="font-display text-xl font-bold text-neutral-950">{t.whatsNew(version)}</h2>
                <div className="mt-3 max-w-prose whitespace-pre-line text-sm leading-relaxed text-neutral-600">{notes}</div>
              </div>
            )}
          </FadeIn>

          <FadeIn className="flex flex-col gap-6 lg:col-span-5">
            {(product.systemRequirements || releases.some((r) => r.minimumOsVersion)) && (
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 lg:rounded-3xl">
                <h2 className="font-display text-lg font-bold text-neutral-950">{t.systemRequirements}</h2>
                {product.systemRequirements && (
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-neutral-700">{product.systemRequirements}</p>
                )}
                {!product.systemRequirements && (
                  <ul className="mt-3 flex flex-col gap-1 text-sm text-neutral-700">
                    {releases.filter((r) => r.minimumOsVersion).map((r) => (
                      <li key={r.id}>{t.platforms[r.platform] ?? r.platform} {r.minimumOsVersion}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {releases.length > 1 && (
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 lg:rounded-3xl">
                <h2 className="font-display text-lg font-bold text-neutral-950">{t.otherDownloads}</h2>
                <ul className="mt-4 divide-y divide-neutral-200 border-y border-neutral-200">
                  {releases.map((r) => (
                    <li key={r.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-sm">
                        <p className="font-medium text-neutral-950">{releaseLabel(r)}</p>
                        <p className="text-neutral-500">
                          {r.version}
                          {r.fileSizeBytes != null && `, ${formatBytes(Number(r.fileSizeBytes))}`}
                          {r.publishedAt && `, ${formatDate(r.publishedAt, urlLang)}`}
                        </p>
                      </div>
                      <DownloadButton
                        lang={urlLang}
                        href={softwareDownloadHref(product.slug, urlLang, "page", r.id)}
                        signedIn={signedIn}
                        gate={gate}
                        label={t.download}
                        variant="compact"
                        className="self-start sm:self-auto"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {beta && (
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 lg:rounded-3xl">
                <h2 className="flex items-center gap-2 font-display text-lg font-bold text-neutral-950">
                  <Flask size={20} aria-hidden />
                  {t.betaTitle}
                </h2>
                <p className="mt-2 text-sm text-neutral-600">{t.betaBody}</p>
                <DownloadButton
                  lang={urlLang}
                  href={softwareDownloadHref(product.slug, urlLang, "page", beta.id)}
                  signedIn={signedIn}
                  gate={gate}
                  label={t.downloadBeta(beta.version)}
                  variant="compact"
                  className="mt-4"
                />
              </div>
            )}
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}

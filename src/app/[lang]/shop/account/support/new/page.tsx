import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/ssr";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
import { resolveUrlLang } from "@/i18n";
import { customerSoftwareOverview } from "@/modules/shop/services/software";
import { customerTicketLinkOptions } from "@/modules/shop/services/support";
import { formatDate } from "@/modules/shop/ui/format";
import { requireAccountCustomer, ticketCategoryOptions } from "@/modules/shop/ui/store/account-server";
import { shopCopy, shopPath } from "@/modules/shop/ui/store/copy";
import { aboutForCategory, SUPPORT_ABOUTS, type SupportAbout } from "@/modules/shop/ui/store/copy-account";
import { SupportRequestForm, type SoftwareOption } from "@/modules/shop/ui/store/SupportRequestForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "New support request", robots: { index: false } };

type Query = {
  about?: string;
  player?: string;
  order?: string;
  arrangement?: string;
  software?: string;
  license?: string;
  installation?: string;
  activation?: string;
};
const QUERY_KEYS = ["about", "player", "order", "arrangement", "software", "license", "installation", "activation"];

export default async function NewSupportRequestPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Query>;
}) {
  const { lang } = await params;
  const query = await searchParams;
  const urlLang = resolveUrlLang(lang);
  const t = shopCopy(urlLang);
  const qs = new URLSearchParams(
    Object.entries(query).filter((e): e is [string, string] => QUERY_KEYS.includes(e[0]) && typeof e[1] === "string"),
  ).toString();
  const customer = await requireAccountCustomer(urlLang, `${shopPath(urlLang, "/account/support/new")}${qs ? `?${qs}` : ""}`);
  const [options, overview] = await Promise.all([customerTicketLinkOptions(customer.id), customerSoftwareOverview(customer.id)]);
  const str = (v: unknown) => (typeof v === "string" ? v : undefined);

  // Software choices: every license held, plus programs only downloaded (no license yet).
  const productName = new Map(overview.map((o) => [o.product.id, o.product.name]));
  const licenseState = new Map(overview.flatMap((o) => o.licenses.map((l) => [l.id, l.state] as const)));
  const software: SoftwareOption[] = [
    ...options.software.map((s) => {
      const name = productName.get(s.productId) ?? s.label.replace(/, license LIC-\d+$/, "");
      const lic = /LIC-\d+$/.exec(s.label)?.[0] ?? "";
      return {
        value: `license:${s.licenseId}`,
        productId: s.productId,
        licenseId: s.licenseId,
        label: t.sw.softwareLicenseOption(name, lic),
        installations: s.installations.map((i) => ({ id: i.id, label: t.sw.computerSupportOption(name, i.label.slice(-4)) })),
        activations: s.requests.map((r) => ({ id: r.id, label: t.sw.activationSupportOption(/ACT-\d+$/.exec(r.label)?.[0] ?? r.label) })),
      };
    }),
    ...overview
      .filter((o) => o.licenses.length === 0 && o.downloadCount > 0)
      .map((o) => ({
        value: `product:${o.product.id}`,
        productId: o.product.id,
        licenseId: null,
        label: t.sw.softwareProductOption(o.product.name),
        installations: [],
        activations: [],
      })),
  ];
  // Prefill only what matches the customer's own options.
  const wantLicense = str(query.license);
  const wantProduct = str(query.software);
  let chosen = wantLicense ? software.find((o) => o.licenseId === wantLicense) : undefined;
  if (chosen && wantProduct && chosen.productId !== wantProduct) chosen = undefined;
  if (!chosen && wantProduct) chosen = software.find((o) => o.productId === wantProduct);
  const activation = chosen?.activations.some((a) => a.id === query.activation) ? str(query.activation) : undefined;
  const state = chosen?.licenseId ? licenseState.get(chosen.licenseId) : undefined;
  const category = !chosen
    ? undefined
    : activation || (state && state !== "LICENSED" && state !== "SUSPENDED" && state !== "REVOKED")
      ? "SOFTWARE_ACTIVATION"
      : "SOFTWARE_PROBLEM";

  // "What is this about?": explicit `?about=`, otherwise inferred from what the link carries.
  const wantAbout = str(query.about);
  const about: SupportAbout | undefined =
    wantAbout && (SUPPORT_ABOUTS as string[]).includes(wantAbout)
      ? (wantAbout as SupportAbout)
      : chosen
        ? "software"
        : query.order
          ? "order"
          : query.arrangement
            ? "music"
            : query.player
              ? "player"
              : aboutForCategory(category);

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <Container>
        <div className="mx-auto max-w-xl">
          <Link href={shopPath(urlLang, "/account/support")} className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-950">
            <ArrowLeft size={14} weight="bold" aria-hidden />
            {t.backToSupport}
          </Link>
          <FadeIn className="mt-6">
            <h1 className="font-display text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">{t.newRequestTitle}</h1>
            <p className="mt-3 text-neutral-600">{t.newRequestBody}</p>
          </FadeIn>
          <div className="mt-10">
            <SupportRequestForm
              lang={urlLang}
              categories={ticketCategoryOptions(urlLang)}
              options={{
                players: options.players.map((p) => ({ id: p.id, label: p.label })),
                orders: options.orders.map((o) => ({ id: o.id, label: `${o.label}, ${formatDate(o.createdAt, urlLang)}` })),
                arrangements: options.arrangements,
                arrangementsByPlayer: options.arrangementsByPlayer,
                software,
              }}
              preselect={{
                about,
                player: typeof query.player === "string" ? query.player : undefined,
                order: typeof query.order === "string" ? query.order : undefined,
                arrangement: typeof query.arrangement === "string" ? query.arrangement : undefined,
                category,
                software: chosen?.value,
                installation: str(query.installation),
                activation,
              }}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}

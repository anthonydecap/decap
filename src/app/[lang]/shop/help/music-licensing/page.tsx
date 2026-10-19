import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowsLeftRight,
  ChatCircleText,
  Handshake,
  Key,
  ListChecks,
  PianoKeys,
  Plus,
} from "@phosphor-icons/react/ssr";
import { Container } from "@/components/Container";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import { resolveUrlLang } from "@/i18n";
import { shopPath } from "@/modules/shop/ui/store/copy";
import { accountCopy } from "@/modules/shop/ui/store/copy-account";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const h = accountCopy(resolveUrlLang(lang)).help;
  return { title: h.metaTitle, description: h.intro };
}

type Topic = { id: string; icon: typeof PianoKeys; title: string; body?: string; steps?: string[] };

/**
 * §51: plain-language explanation of player-bound music licensing. Product help, not legal
 * terms. Public: useful before buying as much as after.
 */
export default async function MusicLicensingHelpPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const urlLang = resolveUrlLang(lang);
  const h = accountCopy(urlLang).help;

  const topics: Topic[] = [
    { id: "per-player", icon: PianoKeys, title: h.perPlayerTitle, body: h.perPlayerBody },
    { id: "why-choose", icon: ListChecks, title: h.whyTitle, body: h.whyBody },
    { id: "another-player", icon: Plus, title: h.anotherTitle, body: h.anotherBody },
    { id: "registration", icon: Key, title: h.registrationTitle, steps: h.registrationSteps },
    { id: "replacing", icon: ArrowsLeftRight, title: h.replaceTitle, body: h.replaceBody },
    { id: "selling", icon: Handshake, title: h.sellTitle, body: h.sellBody },
    { id: "support", icon: ChatCircleText, title: h.supportTitle, body: h.supportBody },
  ];

  return (
    <>
      <section className="pt-12 sm:pt-16 lg:pt-24">
        <Container>
          <FadeIn className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">{h.eyebrow}</p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-neutral-950 sm:text-5xl lg:text-6xl">{h.title}</h1>
            <p className="mt-6 text-lg leading-relaxed text-neutral-600 sm:text-xl">{h.intro}</p>
          </FadeIn>
        </Container>
      </section>

      <section className="py-12 sm:py-16 lg:py-24">
        <Container>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
            <nav aria-label={h.onThisPage} className="lg:col-span-4">
              <div className="lg:sticky lg:top-28">
                <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">{h.onThisPage}</p>
                <ul className="mt-4 flex flex-col gap-1 border-l border-neutral-200">
                  {topics.map((topic) => (
                    <li key={topic.id}>
                      <a
                        href={`#${topic.id}`}
                        className="-ml-px block border-l border-transparent py-1.5 pl-4 text-sm text-neutral-600 transition hover:border-neutral-950 hover:text-neutral-950"
                      >
                        {topic.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>

            <FadeInStagger faster className="flex flex-col gap-6 lg:col-span-8">
              {topics.map((topic) => {
                const Icon = topic.icon;
                return (
                  <FadeIn key={topic.id}>
                    <article
                      id={topic.id}
                      aria-labelledby={`${topic.id}-title`}
                      className="scroll-mt-28 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 lg:rounded-3xl"
                    >
                      <div className="flex items-start gap-4">
                        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-800">
                          <Icon size={22} aria-hidden />
                        </span>
                        <div className="min-w-0">
                          <h2 id={`${topic.id}-title`} className="font-display text-xl font-bold text-neutral-950 sm:text-2xl">{topic.title}</h2>
                          {topic.body && <p className="mt-3 leading-relaxed text-neutral-600">{topic.body}</p>}
                          {topic.steps && (
                            <ol className="mt-5 flex flex-col gap-4">
                              {topic.steps.map((step, i) => (
                                <li key={step} className="flex items-start gap-4">
                                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-sm font-semibold tabular-nums text-white">
                                    {i + 1}
                                  </span>
                                  <span className="pt-1 leading-relaxed text-neutral-700">{step}</span>
                                </li>
                              ))}
                            </ol>
                          )}
                        </div>
                      </div>
                    </article>
                  </FadeIn>
                );
              })}

              <FadeIn>
                <div className="rounded-2xl bg-neutral-950 p-8 text-white sm:p-10 lg:rounded-3xl">
                  <h2 className="font-display text-2xl font-bold sm:text-3xl">{h.ctaTitle}</h2>
                  <p className="mt-3 max-w-xl text-neutral-300">{h.ctaBody}</p>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href={shopPath(urlLang, "/account/support/new")}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3 font-semibold text-neutral-950 transition-all duration-300 hover:scale-105 hover:bg-neutral-200"
                    >
                      {h.contactSupport}
                      <ArrowRight size={16} weight="bold" aria-hidden />
                    </Link>
                    <Link
                      href={shopPath(urlLang, "/account")}
                      className="inline-flex items-center justify-center rounded-full border border-white/30 px-8 py-3 font-semibold text-white transition hover:border-white"
                    >
                      {h.goToMyDmi}
                    </Link>
                  </div>
                </div>
              </FadeIn>

              <p className="text-sm text-neutral-500">{h.termsNote}</p>
            </FadeInStagger>
          </div>
        </Container>
      </section>
    </>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismicPreview } from "@prismicio/next";
import { repositoryName } from "@/prismicio";
import { Header } from "@/components/Header";
import { MotionLayout } from "@/components/MotionLayout";
import { getSettings, defaultSettings } from "@/lib/prismic-settings";
import "../globals.css";

export default async function LangLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const settings = (await getSettings(lang)) || defaultSettings;

  return (
    <>
      <Header settings={settings as any} />
      <MotionLayout settings={settings as any}>
        {children}
      </MotionLayout>
      <PrismicPreview repositoryName={repositoryName} />
    </>
  );
} 
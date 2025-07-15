/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismicPreview } from "@prismicio/next";
import { repositoryName } from "@/prismicio";
import { Header } from "@/components/Header";
import { MotionLayout } from "@/components/MotionLayout";
import { getSettings, defaultSettings } from "@/lib/prismic-settings";
import "./globals.css";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings() || defaultSettings;

  return (
    <html lang="en" className="h-full bg-neutral-950 text-base antialiased">
      <body className="flex min-h-full flex-col">
        <Header settings={settings as any} />
        
        <MotionLayout settings={settings as any}>
          {children}
        </MotionLayout>
        
        <PrismicPreview repositoryName={repositoryName} />
      </body>
    </html>
  );
}

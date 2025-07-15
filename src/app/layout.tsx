/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismicPreview } from "@prismicio/next";
import { repositoryName } from "@/prismicio";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GridPattern } from "@/components/GridPattern";
import { getSettings, defaultSettings } from "@/lib/prismic-settings";
import "./globals.css";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings() || defaultSettings;

  return (
    <html lang="en">
      <body>
        <Header settings={settings as any} />
        <div 
          className="relative flex flex-auto overflow-hidden bg-white pt-14"
          style={{ borderTopLeftRadius: 40, borderTopRightRadius: 40 }}
        >
          <div className="relative isolate flex w-full flex-col pt-9">
            <GridPattern
              className="absolute inset-x-0 -top-14 -z-10 h-[1000px] w-full mask-[linear-gradient(to_bottom_left,white_40%,transparent_50%)] fill-neutral-50 stroke-neutral-950/5"
              yOffset={-96}
            />
            <main className="w-full flex-auto">{children}</main>
            <Footer settings={settings as any} />
          </div>
        </div>
        <PrismicPreview repositoryName={repositoryName} />
      </body>
    </html>
  );
}

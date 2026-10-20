import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import { getSiteOrigin } from "@/lib/site-url";
import { RootHtmlTheme } from "@/components/RootHtmlTheme";
import "./globals.css";

// Serif for Atelier Frank Decap pages only (see the "atelier" page style in globals.css).
const atelierSerif = Fraunces({ subsets: ["latin"], variable: "--font-atelier", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(getSiteOrigin()),
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`h-full text-base antialiased ${atelierSerif.variable}`}>
      <body className="flex min-h-full flex-col">
        <RootHtmlTheme />
        {children}
      </body>
    </html>
  );
}

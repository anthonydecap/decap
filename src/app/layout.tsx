import type { Metadata } from "next";
import { getSiteOrigin } from "@/lib/site-url";
import { RootHtmlTheme } from "@/components/RootHtmlTheme";
import "./globals.css";

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
    <html lang="en" suppressHydrationWarning className="h-full text-base antialiased">
      <body className="flex min-h-full flex-col">
        <RootHtmlTheme />
        {children}
      </body>
    </html>
  );
}

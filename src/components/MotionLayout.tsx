"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import clsx from "clsx";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { isLocaleHomePathname } from "@/i18n";
import { Footer } from "./Footer";

interface MotionLayoutProps {
  children: React.ReactNode;
  settings?: any;
}

export function MotionLayout({ children, settings }: MotionLayoutProps) {
  const pathname = usePathname();
  const isHome = isLocaleHomePathname(pathname);

  return (
    <motion.div
      layout
      key={pathname}
      style={{ borderTopLeftRadius: 40, borderTopRightRadius: 40 }}
      className={clsx(
        "relative flex flex-auto overflow-hidden pt-14",
        isHome ? "bg-neutral-950" : "bg-white",
      )}
    >
      <motion.div
        layout
        className={clsx(
          "relative isolate flex w-full flex-col pt-9",
          isHome && "bg-neutral-950",
        )}
      >
        <main className="w-full flex-auto">{children}</main>

        {isHome ? (
          <div className="mt-24 w-full rounded-t-[40px] bg-white pt-2 shadow-[0_-32px_80px_-20px_rgba(0,0,0,0.35)] sm:mt-32 lg:mt-40">
            <Footer settings={settings} className="!mt-0" />
          </div>
        ) : (
          <Footer settings={settings} />
        )}
      </motion.div>
    </motion.div>
  );
} 
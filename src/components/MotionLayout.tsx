"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { Footer } from "./Footer";

interface MotionLayoutProps {
  children: React.ReactNode;
  settings?: any;
}

/**
 * The rounded page sheet. Its background is the header colour (--chrome-bg: the page style, or
 * the first section when that is dark or tinted), so the strip behind the header always matches
 * what is directly under it. The footer brings its own page-coloured background.
 */
export function MotionLayout({ children, settings }: MotionLayoutProps) {
  const pathname = usePathname();

  return (
    <motion.div
      layout
      key={pathname}
      style={{ borderTopLeftRadius: 40, borderTopRightRadius: 40 }}
      className="relative flex flex-auto overflow-hidden bg-chrome pt-14"
    >
      <motion.div layout className="relative isolate flex w-full flex-col pt-9">
        <main className="w-full flex-auto">{children}</main>
        <Footer settings={settings} />
      </motion.div>
    </motion.div>
  );
}

"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { GridPattern } from "./GridPattern";
import { Footer } from "./Footer";

interface MotionLayoutProps {
  children: React.ReactNode;
  settings?: any;
}

export function MotionLayout({ children, settings }: MotionLayoutProps) {
  const pathname = usePathname();
  
  return (
    <motion.div
      layout
      key={pathname}
      style={{ borderTopLeftRadius: 40, borderTopRightRadius: 40 }}
      className="relative flex flex-auto overflow-hidden bg-white pt-14"
    >
      <motion.div
        layout
        className="relative isolate flex w-full flex-col pt-9"
      >
        <GridPattern
          className="absolute inset-x-0 -top-14 -z-10 h-[1000px] w-full mask-[linear-gradient(to_bottom_left,white_40%,transparent_50%)] fill-neutral-50 stroke-neutral-950/5"
          yOffset={-96}
          interactive
        />
        
        <main className="w-full flex-auto">{children}</main>
        
        <Footer settings={settings} />
      </motion.div>
    </motion.div>
  );
} 
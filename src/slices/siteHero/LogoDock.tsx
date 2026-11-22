"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { LETTERS } from "@/components/Logo";

/*
 * The big DECAP wordmark of the photo wall, docking into the header on scroll.
 *
 * On arrival the wordmark stands huge in the middle of the wall (its letters come in one by
 * one). The hero section is taller than the window and its stage is sticky, so the first part
 * of the scroll is "spent" on the logo: it shrinks and travels onto the header logo, where the
 * real logo takes over. Meanwhile the header is held in place (--header-pin, read by Header.tsx)
 * so it is still there to land in; after the pin, header and hero scroll away together.
 * On phones the header shows only the D: the big D lands on it, E-C-A-P fade out on the way.
 *
 * The header logo is hidden by a <style> rendered here, so it is hidden in the server HTML too
 * (no flash), and shown when the wordmark has docked. Reduced motion: CSS drops the big logo and
 * the pin, the header logo stays as usual.
 */

/** Part of the pin (0-1) over which the logo travels; it has landed at DOCK_END. */
const DOCK_START = 0.04;
const DOCK_END = 0.72;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** The visible logo graphic in the header (wordmark on wide screens, the D on phones). */
function headerLogo(): Element | null {
  const link = document.querySelector("[data-site-logo]");
  if (!link) return null;
  return (
    [...link.querySelectorAll("svg, img")].find(
      (el) => el.getBoundingClientRect().width > 0,
    ) ?? null
  );
}

export function LogoDock({
  section,
}: {
  section: React.RefObject<HTMLElement | null>;
}) {
  const slot = useRef<HTMLDivElement>(null); // where the big logo rests (never transformed)
  const mover = useRef<HTMLDivElement>(null); // the part that travels
  const rest = useRef<SVGGElement>(null); // E-C-A-P, faded out when landing on the D

  useEffect(() => {
    const root = document.documentElement;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const sec = section.current;
      const box = slot.current;
      const move = mover.current;
      if (!sec || !box || !move) return;

      // How far into the pin we are (0 = arrival, 1 = the stage starts to scroll away).
      const r = sec.getBoundingClientRect();
      const range = Math.max(1, sec.offsetHeight - window.innerHeight);
      const progress = clamp01(-r.top / range);

      // Hold the header while the stage is pinned, then let it scroll away with the hero.
      root.style.setProperty(
        "--header-pin",
        `${Math.max(0, window.scrollY + Math.min(0, r.top + range))}px`,
      );

      const t = easeInOut(
        clamp01((progress - DOCK_START) / (DOCK_END - DOCK_START)),
      );
      const target = headerLogo();
      const docked = t >= 1 || !target;
      root.toggleAttribute("data-logo-docked", docked);
      move.style.visibility = docked ? "hidden" : "visible";
      if (!target) return;

      // Map the big logo's viewBox onto the header logo's (same letter paths, so the letters land
      // exactly). Both rects are read now: during the pin both stand still in the window.
      const s = box.getBoundingClientRect();
      const tr = target.getBoundingClientRect();
      const bigUnit = s.height / 22; // big logo: viewBox 0 0 129 22
      let unit = tr.height / 22;
      let ox = tr.left;
      let oy = tr.top;
      let mark = false;
      if (target instanceof SVGSVGElement) {
        const vb = target.viewBox.baseVal;
        unit = tr.height / vb.height;
        ox = tr.left - vb.x * unit;
        oy = tr.top - vb.y * unit;
        mark = vb.width < 50; // phones: only the D
      }
      const scale = 1 + (unit / bigUnit - 1) * t;
      move.style.transform = `translate(${(ox - s.left) * t}px, ${(oy - s.top) * t}px) scale(${scale})`;
      if (rest.current)
        rest.current.style.opacity = mark
          ? String(1 - clamp01((t - 0.45) / 0.4))
          : "1";
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      root.style.removeProperty("--header-pin");
      root.removeAttribute("data-logo-docked");
    };
  }, [section]);

  return (
    <>
      {/* Header logo hidden until the big one has docked (only when motion is allowed). */}
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          html:not([data-logo-docked]) [data-site-logo] svg,
          html:not([data-logo-docked]) [data-site-logo] img { opacity: 0; }
        }
      `}</style>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center px-6 motion-reduce:hidden"
      >
        <div ref={slot}>
          <div ref={mover} style={{ transformOrigin: "0 0" }}>
            <svg
              viewBox="0 0 129 22"
              className="block h-auto w-[min(84vw,64rem)] fill-white drop-shadow-[0_4px_40px_rgba(0,0,0,0.5)]"
            >
              <motion.path
                d={LETTERS[0]}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.7,
                  delay: 0.25,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
              {/* E-C-A-P in their own group, so the phone landing can fade them without fighting the reveal. */}
              <g ref={rest}>
                {LETTERS.slice(1).map((d, i) => (
                  <motion.path
                    key={i}
                    d={d}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.7,
                      delay: 0.25 + 0.12 * (i + 1),
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  />
                ))}
              </g>
            </svg>
          </div>
        </div>
      </div>
    </>
  );
}

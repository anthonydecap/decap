"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion } from "framer-motion";
import { LETTERS } from "@/components/Logo";

/*
 * Logo intro for the photo wall: the DECAP wordmark appears huge over the wall, letter by letter,
 * holds, then shrinks and flies onto the logo in the header, where the real logo takes over. On
 * phones the header shows only the D: the big D lands on it and E-C-A-P fade out on the way.
 *
 * The header logo is hidden by a <style> rendered with this component (so it is already hidden in
 * the server HTML, no flash) and shown again when the flight lands. Reduced motion: CSS hides
 * the intro and keeps the header logo, nothing moves.
 *
 * Header and hero scroll together, so the flight lands right even if the visitor scrolls during it.
 */

const SEEN_KEY = "decap-logo-intro-seen";
const EASE = [0.65, 0, 0.35, 1] as const;

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

export function LogoIntro({ onLeave }: { onLeave: () => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [fast, setFast] = useState(false);
  const [landed, setLanded] = useState(false);

  // One timeline, started once: reveal the letters, hold, fly to the header, hand over.
  useEffect(() => {
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) =>
      timers.push(window.setTimeout(fn, ms));
    const finish = () => {
      setLanded(true);
      onLeave();
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      later(finish, 0);
      return () => timers.forEach(clearTimeout);
    }

    // Second visit in this session: the same intro, quicker.
    let quick = false;
    try {
      quick = !!sessionStorage.getItem(SEEN_KEY);
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* storage blocked: always the full intro */
    }
    later(() => {
      setFast(quick);
      setRevealed(true);
    }, 0);

    // Letters in (0.15 s + stagger + their own fade), then a short hold.
    later(
      () => {
        const target = headerLogo();
        const big = svg.current;
        const box = wrap.current;
        if (!target || !big || !box) return finish();

        // Map the big logo's viewBox onto the header logo's viewBox (same letter paths, so the
        // letters land exactly), measured now so a scroll or resize before the flight is fine.
        const s = big.getBoundingClientRect();
        const t = target.getBoundingClientRect();
        const bigUnit = s.height / 22; // big logo: viewBox 0 0 129 22
        let unit = t.height / 22;
        let ox = t.left;
        let oy = t.top;
        if (target instanceof SVGSVGElement) {
          const vb = target.viewBox.baseVal;
          unit = t.height / vb.height;
          ox = t.left - vb.x * unit;
          oy = t.top - vb.y * unit;
        }
        onLeave();
        // Phones: the header shows only the D, so E-C-A-P fade out on the way.
        if (
          target instanceof SVGSVGElement &&
          target.viewBox.baseVal.width < 50
        ) {
          animate(
            [...big.querySelectorAll("path")].slice(1),
            { opacity: 0 },
            { duration: 0.35 },
          );
        }
        animate(
          box,
          { x: ox - s.left, y: oy - s.top, scale: unit / bigUnit },
          { duration: quick ? 0.7 : 1, ease: EASE },
        ).then(() => setLanded(true));
      },
      quick ? 800 : 1900,
    );

    return () => timers.forEach(clearTimeout);
  }, [onLeave]);

  return (
    <>
      {/* Header logo hidden until the flight lands. Reduced motion: no intro at all. */}
      {!landed && (
        <style>{`
          [data-site-logo] svg, [data-site-logo] img { opacity: 0; }
          @media (prefers-reduced-motion: reduce) {
            [data-site-logo] svg, [data-site-logo] img { opacity: 1; }
            .logo-intro { display: none; }
          }
        `}</style>
      )}
      {!landed && (
        <div
          aria-hidden="true"
          className="logo-intro pointer-events-none absolute inset-0 z-30 flex items-center justify-center px-6"
        >
          <motion.div ref={wrap} style={{ transformOrigin: "0 0" }}>
            <svg
              ref={svg}
              viewBox="0 0 129 22"
              className="block h-auto w-[min(82vw,60rem)] fill-white drop-shadow-[0_4px_40px_rgba(0,0,0,0.5)]"
            >
              {LETTERS.map((d, i) => (
                <motion.path
                  key={i}
                  d={d}
                  initial={{ opacity: 0, y: 14 }}
                  animate={revealed ? { opacity: 1, y: 0 } : undefined}
                  transition={{
                    duration: fast ? 0.35 : 0.7,
                    delay: 0.15 + (fast ? 0.03 : 0.12) * i,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                />
              ))}
            </svg>
          </motion.div>
        </div>
      )}
    </>
  );
}

# Brand & Slice Style Guide

The canonical reference for how slices should look and be built in this project. The
**Smart Valve** slice set is the agreed "winning" style — this document distills its design
language into rules every slice (existing and future) should follow.

Last updated: 2026-07-10

---

## TL;DR

1. **One design system, two themes.** Every slice is either **Dark** or **Light**. They share
   the *same* type, spacing, motion, card language, and code structure — only the color values differ.
2. **Dark is the flagship (Smart Valve) theme.** Dark + the rainbow **gradient** is reserved for
   Smart Valve and future high-tech products. Think "Apple Intelligence": the gradient signals the
   premium, high-tech tier.
3. **Light is the standard theme.** Instrument, Core, and general marketing slices are **light** and
   **never use the gradient**.
4. **Type = Mona Sans.** All headings use `font-display` (Mona Sans, `wdth 125`).
5. **Motion = `FadeIn`.** Content reveals on scroll via the shared `FadeIn` / `FadeInStagger`.
6. **Palette = `neutral-*` only.** Never `gray-*`. Never off-palette accent colors (no `blue-500` links).
7. **Every slice reads `background_color`** from Prismic so an editor can theme any instance.

---

## Design tokens

Defined in [`src/styles/tailwind.css`](src/styles/tailwind.css) / [`src/app/globals.css`](src/app/globals.css).

| Token | Value | Notes |
|---|---|---|
| Font (`--font-sans`, `--font-display`) | **Mona Sans** (variable) | `font-display` adds `font-variation-settings: 'wdth' 125` |
| Type scale | `text-xs` … `text-7xl` | Custom scale — use these, not arbitrary sizes |
| Radius | `rounded-2xl`, `rounded-3xl`, `--radius-4xl` (2.5rem) | Cards use 2xl/3xl; full-bleed media may use 4xl |
| Color | `neutral-50` … `neutral-950` | The **only** grayscale ramp. No `gray-*`. |

Shared components:

- **`@/components/Container`** — `mx-auto max-w-7xl px-6 lg:px-8` (inner `max-w-2xl lg:max-w-none`). Every slice wraps its content in this.
- **`@/components/FadeIn`** — `FadeIn` (single reveal) and `FadeInStagger` (staggers children; `faster` prop for tighter timing). framer-motion, respects `prefers-reduced-motion`.

---

## The gradient — Smart Valve only 🌈

```
#3b82f6 → #a855f7 → #ec4899 → #ef4444 → #f97316 → #eab308
(blue    → purple  → pink    → red     → orange  → yellow)
```

This is the **high-tech signature**. Like Apple reserves its gradient for *Apple Intelligence*,
we reserve this gradient for **Smart Valve** (and any future flagship high-tech product).

**Where Smart Valve uses it:** subtitle text (`bg-clip-text`), card top-accent bars (`h-0.5`–`h-1`),
gradient title text, icon borders (`p-[2px]` wrapper), hover glows, animated PCB traces.

**Rules:**
- ✅ Smart Valve slices, on the dark theme.
- ❌ **Never** on Instrument, Core, or any standard/light slice.
- ❌ Not for decoration "because it looks nice." It is a brand signal with a specific meaning.
- When a standard slice needs an accent where Smart Valve would use the gradient, use a
  **monochrome neutral** treatment instead (see the palette below): a solid `neutral-200`/`neutral-800`
  border, a `neutral-900` fill, or simply omit the accent.

> A single-color black scrim over an image (e.g. `bg-gradient-to-t from-black/80 to-transparent`
> for text legibility) is **not** "the gradient" and is allowed in any theme.

---

## Theme palettes

Same roles, two sets of values. Pick the column for the slice's theme.

| Role | **Light** (standard) | **Dark** (Smart Valve / media) |
|---|---|---|
| Section background | `#ffffff` (or `neutral-50`) | `#0a0a0a` |
| Heading text | `text-neutral-950` | `text-white` |
| Body text | `text-neutral-600` | `text-neutral-300` |
| Muted / eyebrow / footnote | `text-neutral-500` | `text-neutral-400` |
| Card background | `bg-white` | `bg-neutral-900` |
| Card border | `border-neutral-200` | `border-neutral-800` |
| Card hover | `hover:border-neutral-300 hover:shadow-md` (base `shadow-sm`) | `hover:border-neutral-700` |
| Divider / rule | `border-neutral-200` | `border-neutral-800` |
| Inline code chip | `bg-neutral-100 text-neutral-700` | `bg-neutral-800 text-neutral-400` |
| Icon container | `bg-neutral-100 text-neutral-700` | `bg-neutral-800 text-neutral-200` |
| Badge (active / inactive) | `bg-neutral-900 text-white` / `bg-neutral-200 text-neutral-600` | `bg-white text-neutral-900` / `bg-neutral-800 text-neutral-400` |

### Theme-adaptive slices

A slice can support **both** themes from a single `background_color` value by measuring luminance.
This is the pattern used by `smartValveTechDescription`:

```tsx
const bgColor = slice.primary.background_color || "#ffffff"; // light default for standard slices
const isDark = (() => {
  const hex = bgColor.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b < 0.5;
})();
// then: clsx(isDark ? "text-white" : "text-neutral-950")
```

Use it for slices likely to appear on both light and dark pages. Simpler single-theme slices may
just hardcode the correct column above.

---

## Typography

| Element | Classes |
|---|---|
| Hero H1 | `font-display text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl` |
| Section title (H2) | `font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl` |
| Card / sub headline (H3) | `font-display text-xl font-bold sm:text-2xl lg:text-3xl` |
| Section subtitle | `text-lg` / `text-xl` in the muted color, `max-w-2xl`/`max-w-3xl mx-auto` |
| Body | `text-base`/`text-lg leading-relaxed` in the body color |
| Quote | `font-serif italic` |

Headings are **always** `font-display` (Mona Sans) + `font-bold`. Never leave a heading in the default sans.

---

## Section & layout rules

- **Vertical padding:** `py-16 sm:py-24 lg:py-32` (standard). A tighter variant `py-12 sm:py-16 lg:py-24`
  exists for dense sections (see `INSTRUMENT_SECTION_PY` in [`src/lib/instrument-ui.tsx`](src/lib/instrument-ui.tsx)).
- **Header block:** centered, `text-center mb-12 lg:mb-16`; title, then subtitle beneath in the muted color.
- **Cards:** `rounded-2xl` (bump to `lg:rounded-3xl` on larger cards), card bg + border from the palette,
  `transition-all duration-300`, hover state from the palette. Content padding `p-6 sm:p-8`.
- **Buttons / CTAs:** always `rounded-full`.
  - Light primary: `rounded-full bg-neutral-950 px-8 py-3 text-base font-semibold text-white transition-all duration-300 hover:bg-neutral-800 hover:scale-105`
  - Light secondary: `rounded-full border-2 border-neutral-950 px-8 py-3 font-semibold text-neutral-950 hover:bg-neutral-950 hover:text-white`
  - Dark primary: the same shape, inverted (`bg-white text-neutral-950`).

---

## Component skeleton

Every slice's `index.tsx` follows this shape:

```tsx
"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { PrismicNextLink } from "@prismicio/next";
import { PrismicRichText, type SliceComponentProps, type JSXMapSerializer } from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import clsx from "clsx";

// Shared rich-text serializer — hyperlink + inline code. Code chip color per theme.
const components: JSXMapSerializer = {
  hyperlink: ({ node, children }) => <PrismicNextLink field={node.data}>{children}</PrismicNextLink>,
  label: ({ node, children }) =>
    node.data.label === "codespan"
      ? <code className="rounded bg-neutral-100 px-1 py-0.5 text-sm font-mono text-neutral-700">{children}</code>
      : null,
};

const MySlice: FC<SliceComponentProps<any>> = ({ slice }) => {
  const { section_title, section_subtitle, background_color } = slice.primary;
  const bgColor = background_color || "#ffffff"; // light default (dark #0a0a0a for Smart Valve)

  return (
    <div className="py-16 sm:py-24 lg:py-32" style={{ backgroundColor: bgColor }}>
      <Container>
        <div className="text-center mb-12 lg:mb-16">
          <FadeIn>
            {/* title (font-display) + subtitle (muted) */}
          </FadeIn>
        </div>
        <FadeInStagger faster>{/* cards */}</FadeInStagger>
      </Container>
    </div>
  );
};

export default MySlice;
```

The Instrument set already centralizes the serializer, `Container`, and padding constants in
[`src/lib/instrument-ui.tsx`](src/lib/instrument-ui.tsx) — prefer extending shared helpers over re-declaring.

---

## Per-product-line guidance

| Product line | Theme | Gradient | Notes |
|---|---|---|---|
| **Smart Valve** | Dark (`#0a0a0a`) | ✅ Yes — the signature | The flagship. Full high-tech treatment. |
| **Instrument** | **Light** | ❌ No | Standard light theme. Media-forward heroes/viewers may be dark for legibility. |
| **Core** | **Light** | ❌ No | Standard light theme. `coreDemoVideo` / `core3D` are dark media surfaces. |
| Future flagship / high-tech | Dark | ✅ Yes | Only if it's a genuine high-tech "hero" product. |
| Everything else | Light | ❌ No | Default to light. |

**Dark is allowed on a light product line only for functional media surfaces** — a full-bleed hero
with a background video, a video player, or a 3D viewer — where dark chrome makes the media read
better. It's a media decision, not a brand-tier decision, and never brings the gradient with it.

---

## Adding a new slice — checklist

- [ ] `"use client"` + `SliceComponentProps<any>`.
- [ ] Wrap content in `Container`.
- [ ] Read `background_color` (default `#ffffff` light, or `#0a0a0a` for Smart Valve).
- [ ] Headings use `font-display` + `font-bold`, from the type scale.
- [ ] Colors from the correct palette column — `neutral-*` only.
- [ ] Reveal content with `FadeIn` / `FadeInStagger`.
- [ ] Rich text via the shared `JSXMapSerializer` (hyperlink → `PrismicNextLink`, codespan chip themed).
- [ ] Section padding `py-16 sm:py-24 lg:py-32` (or the tighter variant).
- [ ] Cards `rounded-2xl`/`3xl` with palette bg + border + hover.
- [ ] Buttons `rounded-full`.
- [ ] **No gradient** unless this is a Smart Valve / flagship slice.

## Anti-patterns (seen in older slices — do not repeat)

- ❌ `gray-*` instead of `neutral-*` (was in `coreAccessories`).
- ❌ `text-blue-500`/`blue-600` hyperlinks (was in several Core slices) — use the themed serializer.
- ❌ Headings without `font-display` (was in `coreAccessories`).
- ❌ Ignoring `background_color` and hardcoding the background (several Core slices).
- ❌ Ad-hoc monochrome gradients (`from-white to-gray-50`) where a flat surface reads cleaner.
- ❌ Static content with no `FadeIn`.
- ❌ The Smart Valve rainbow gradient anywhere outside Smart Valve.

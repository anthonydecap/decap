# DESIGN.md — Decap design system

The visual design system for this site, in the [DESIGN.md](https://github.com/voltagent/awesome-design-md)
format so coding agents can read it. It describes the style we already have — the **Smart Valve**
look distilled in [BRAND_STYLE.md](BRAND_STYLE.md). Code-level rules (slice skeleton, Prismic
fields, per-product-line themes, new-slice checklist) live in BRAND_STYLE.md; if the two disagree,
BRAND_STYLE.md wins.

Tokens are defined in [`src/app/globals.css`](src/app/globals.css).

---

## 1. Visual theme & atmosphere

Premium, quiet and product-led, with a nod to Apple. One design system, **two themes**:

- **Light** — the standard. White canvas, near-black ink, monochrome neutral cards. Instrument, Core
  and general marketing.
- **Dark** — the flagship. `#0a0a0a` canvas, white type, neutral-900 cards, and the **rainbow
  gradient** as a high-tech signal (like Apple reserves its gradient for Apple Intelligence).
  Smart Valve and future flagship products. Dark is also used on light product lines for
  functional media surfaces (video heroes, players, 3D viewers) — without the gradient.

Both themes share type, spacing, motion, card language and code structure; only color values differ.
Content reveals softly on scroll. Headlines are wide and bold.

## 2. Color palette & roles

Grayscale is Tailwind's **`neutral-*`** ramp only — never `gray-*`, never off-palette accents
(no `blue-500` links).

| Role | Light | Dark |
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
| Badge active / inactive | `bg-neutral-900 text-white` / `bg-neutral-200 text-neutral-600` | `bg-white text-neutral-900` / `bg-neutral-800 text-neutral-400` |
| Primary CTA | `bg-neutral-950 text-white` | `bg-white text-neutral-950` |

Every slice reads `background_color` from Prismic (default `#ffffff` light, `#0a0a0a` dark). Slices
that can appear on either theme derive `isDark` from that color's luminance (see BRAND_STYLE.md).

### The gradient — Smart Valve only 🌈

```
#3b82f6 → #a855f7 → #ec4899 → #ef4444 → #f97316 → #eab308
(blue    → purple  → pink    → red     → orange  → yellow)
```

Used for: subtitle / title text (`bg-clip-text`), card top-accent bars (`h-0.5`–`h-1`), icon
borders (`p-[2px]` wrapper), hover glows, animated PCB traces. **Never** on Instrument, Core or any
light/standard slice, and never "just because it looks nice". A standard slice that needs an accent
uses a monochrome treatment instead (`neutral-200`/`neutral-800` border, `neutral-900` fill, or no
accent). A single-color black scrim over imagery (`bg-gradient-to-t from-black/80 to-transparent`) is
not "the gradient" and is allowed everywhere.

**Note for design / taste skills and reviewers:** the rainbow is a deliberate brand tier, exactly like
Apple's Apple Intelligence gradient: it marks Smart Valve as the high-tech product. Do not flag it as an
accent-consistency violation, "decorative gradient" or AI slop on Smart Valve slices, and do not
propose replacing it. Only flag it when it appears outside Smart Valve / flagship slices.

## 3. Typography

**Font:** **Mona Sans** (variable, self-hosted in `src/fonts/`). `font-sans` for body;
`font-display` for headings — Mona Sans with `font-variation-settings: 'wdth' 125` (wide).

**Scale** (custom — use these, not arbitrary sizes):

| Class | Size / line-height |
|---|---|
| `text-xs` | 12 / 16px |
| `text-sm` | 14 / 24px |
| `text-base` | 16 / 28px |
| `text-lg` | 18 / 28px |
| `text-xl` | 20 / 32px |
| `text-2xl` | 24 / 36px |
| `text-3xl` | 28 / 36px |
| `text-4xl` | 32 / 40px |
| `text-5xl` | 40 / 48px |
| `text-6xl` | 48 / 56px |
| `text-7xl` | 64 / 72px |

| Element | Classes |
|---|---|
| Hero H1 | `font-display text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl` |
| Section title (H2) | `font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl` |
| Card / sub headline (H3) | `font-display text-xl font-bold sm:text-2xl lg:text-3xl` |
| Section subtitle | `text-lg` / `text-xl` in the muted color, `max-w-2xl` / `max-w-3xl mx-auto` |
| Body | `text-base` / `text-lg leading-relaxed` in the body color |
| Eyebrow / label | `text-xs uppercase tracking-wider` in the muted color |
| Quote | `font-serif italic` |

Headings are **always** `font-display font-bold`. Never leave a heading in the default sans.

## 4. Component stylings

**Buttons / CTAs — always `rounded-full`.**
- Light primary: `rounded-full bg-neutral-950 px-8 py-3 text-base font-semibold text-white transition-all duration-300 hover:bg-neutral-800 hover:scale-105`
- Light secondary: `rounded-full border-2 border-neutral-950 px-8 py-3 font-semibold text-neutral-950 hover:bg-neutral-950 hover:text-white`
- Dark primary: same shape, inverted — `bg-white text-neutral-950`.
- Compact (header, `@/components/Button`): `rounded-full px-4 py-1.5 text-sm font-semibold`, black, or white with `invert`.

**Cards:** `rounded-2xl` (bump to `lg:rounded-3xl` on large cards), palette bg + border,
`transition-all duration-300`, palette hover state. Content padding `p-6 sm:p-8`.

**Media tiles:** `rounded-2xl` / `rounded-3xl`; full-bleed media may use `rounded-4xl` (2.5rem).

**Controls over media** (play, carousel arrows): round, frosted —
`rounded-full bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30`.

**Links in rich text:** rendered through the shared `JSXMapSerializer` (`PrismicNextLink`), never
colored blue; inline `codespan` labels render as the themed code chip.

**Footer panel (home):** white sheet with `rounded-t-[40px]` rising over the dark page.

## 5. Layout principles

- **Container:** every slice wraps content in `@/components/Container` —
  `mx-auto max-w-7xl px-6 lg:px-8` (inner `max-w-2xl lg:max-w-none`).
- **Section padding:** `py-16 sm:py-24 lg:py-32`. Dense variant `py-12 sm:py-16 lg:py-24`
  (`INSTRUMENT_SECTION_PY` in `src/lib/instrument-ui.tsx`).
- **Header block:** centered, `text-center mb-12 lg:mb-16`; title, then subtitle in the muted color.
- **Grids:** bento and card grids, typically `gap-6`–`gap-8`.
- Prefer flat surfaces over ad-hoc monochrome gradients (`from-white to-gray-50`).

## 6. Depth & elevation

| Level | Light | Dark |
|---|---|---|
| Flat | sections, text | sections, text |
| Card | `shadow-sm` + `border-neutral-200` | `border-neutral-800`, no shadow |
| Card hover | `hover:shadow-md` + `hover:border-neutral-300` | `hover:border-neutral-700` |
| Overlay / modal | `shadow-lg` – `shadow-2xl` | same |
| Frosted | `bg-white/90 backdrop-blur-sm` | `bg-white/20` or `bg-black/50` + `backdrop-blur-md` |
| Glow | — | rainbow hover glow (Smart Valve only) |

## 7. Do's and don'ts

**Do**
- Pick a theme per slice (light or dark) and take every color from that palette column.
- Use `font-display font-bold` for headings, from the type scale.
- Read `background_color` from Prismic.
- Reveal content with `FadeIn` / `FadeInStagger`.
- Keep CTAs `rounded-full`; cards `rounded-2xl` / `3xl`.

**Don't**
- ❌ `gray-*` instead of `neutral-*`.
- ❌ `text-blue-500` / `blue-600` hyperlinks — use the themed serializer.
- ❌ Headings without `font-display`.
- ❌ Hardcoding the background and ignoring `background_color`.
- ❌ Ad-hoc monochrome gradients where a flat surface reads cleaner.
- ❌ Static content with no `FadeIn`.
- ❌ The Smart Valve rainbow gradient anywhere outside Smart Valve / flagship slices.

## 8. Responsive behavior

Mobile-first Tailwind breakpoints (`sm` 640, `md` 768, `lg` 1024, `xl` 1280). Type steps up per
breakpoint (H1 `text-5xl → sm:text-6xl → lg:text-7xl`; H2 `text-3xl → sm:text-4xl → lg:text-5xl`).
Section padding grows `py-16 → sm:py-24 → lg:py-32`. Card grids collapse to one column on mobile;
card radius steps up `rounded-2xl → lg:rounded-3xl`. Motion respects `prefers-reduced-motion`.

## 9. Agent prompt guide

> Build this slice in our design system (DESIGN.md + BRAND_STYLE.md): choose light (white,
> `neutral-950` headings, `neutral-600` body, white cards with `neutral-200` border + `shadow-sm`) or
> dark (`#0a0a0a`, white headings, `neutral-300` body, `neutral-900` cards with `neutral-800` border).
> Headings `font-display font-bold` (Mona Sans wide). `rounded-full` CTAs (black on light, white on
> dark). Cards `rounded-2xl`. `Container` + `py-16 sm:py-24 lg:py-32`. `FadeIn` reveals. Read
> `background_color`. Rainbow gradient only if this is Smart Valve.

# Grid pattern background (removed from UI) — how it worked

This document describes the decorative SVG background (`GridPattern`) that was removed from the live layout so it can be restored or reused later. **The component file still exists** at `src/components/GridPattern.tsx` — only the usages were removed.

Archived from UI: 2026-07-10

---

## Summary

`GridPattern` was a full-width SVG decorative layer: repeating diagonal line paths plus scattered diamond/parallelogram blocks. On most pages it sat behind the main content in `MotionLayout`; on the Core testimonial slice it filled the section background.

**Dependencies:** `framer-motion` (animated blocks), React `useId` / `useRef` / `useState` / `useEffect`.

---

## Component

**File:** `src/components/GridPattern.tsx`  
**Export:** `GridPattern`

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `yOffset` | `number` | `0` | Vertical offset for the pattern and block grid (px) |
| `interactive` | `boolean` | `false` | When `true`, spawns fading blocks at the mouse position |
| `className` | `string` | — | Tailwind classes; typically sets `fill`, `stroke`, `mask`, positioning |
| … | `SVGSVGElement` attrs | — | Passed through to the root `<svg>` |

### Visual layers

1. **Tiled line pattern** — `<pattern>` in `<defs>` with a long diagonal path, repeated every 96×480 user units.
2. **Static blocks** — six fixed `[x, y]` grid positions rendered as `Block` shapes.
3. **Interactive blocks** (optional) — on `mousemove`, converts cursor position to grid coords and animates a block in/out with `opacity: [0, 1, 0]` over 1s.

### Block shape

Each `Block` is a `motion.path` with a parallelogram/diamond SVG path, positioned via:

```ts
transform={`translate(${-32 * y + 96 * x} ${160 * y})`}
```

Static positions were: `[1,1], [2,2], [4,3], [6,2], [7,4], [5,5]`.

---

## Where it was used (before removal)

### 1. Site-wide — `src/components/MotionLayout.tsx`

Rendered behind all pages, above the footer, with two theme variants:

**Non-home pages** (`/en/smartvalve`, `/en/core`, blog, etc.):

```tsx
<GridPattern
  className="absolute inset-x-0 -top-14 -z-10 h-[1000px] w-full mask-[linear-gradient(to_bottom_left,white_40%,transparent_50%)] fill-neutral-50 stroke-neutral-950/5"
  yOffset={-96}
  interactive
/>
```

**Home page** (`/en`, `/fr`):

```tsx
<GridPattern
  className="absolute inset-x-0 -top-14 -z-10 h-[1000px] w-full mask-[linear-gradient(to_bottom_left,rgba(255,255,255,0.06)_35%,transparent_55%)] fill-neutral-800/30 stroke-neutral-500/10"
  yOffset={-96}
  interactive
/>
```

Placement: inside the layout wrapper, `-z-10`, height `1000px`, masked to fade toward bottom-left so content stayed readable.

### 2. Core testimonial slice — `src/slices/coreTestimonial/index.tsx`

Section-local background (non-interactive):

```tsx
<GridPattern
  className="absolute inset-0 -z-10 h-full w-full mask-[linear-gradient(to_bottom_left,white_50%,transparent_60%)] fill-neutral-100 stroke-neutral-950/5"
  yOffset={-256}
/>
```

---

## How to restore

### Global background (all pages)

In `MotionLayout.tsx`, re-import and add back the two conditional blocks before `<main>`:

```tsx
import { GridPattern } from "./GridPattern";

// inside the inner motion.div, before <main>:
{!isHome && (
  <GridPattern
    className="absolute inset-x-0 -top-14 -z-10 h-[1000px] w-full mask-[linear-gradient(to_bottom_left,white_40%,transparent_50%)] fill-neutral-50 stroke-neutral-950/5"
    yOffset={-96}
    interactive
  />
)}
{isHome && (
  <GridPattern
    className="absolute inset-x-0 -top-14 -z-10 h-[1000px] w-full mask-[linear-gradient(to_bottom_left,rgba(255,255,255,0.06)_35%,transparent_55%)] fill-neutral-800/30 stroke-neutral-500/10"
    yOffset={-96}
    interactive
  />
)}
```

### Single section (e.g. testimonial)

Wrap the section in `relative isolate` and add:

```tsx
import { GridPattern } from "@/components/GridPattern";

<GridPattern
  className="absolute inset-0 -z-10 h-full w-full mask-[linear-gradient(to_bottom_left,white_50%,transparent_60%)] fill-neutral-100 stroke-neutral-950/5"
  yOffset={-256}
/>
```

### Reuse elsewhere

- Import from `@/components/GridPattern`.
- Parent needs `position: relative` (or `isolate`) and the pattern needs `absolute` + negative `z-index`.
- Tune `fill`, `stroke`, and `mask-[linear-gradient(...)]` for light vs dark sections.
- Set `interactive` only where pointer feedback is desired (adds a global `mousemove` listener).

---

## Notes

- Full-bleed dark heroes or Mux video slices may fully cover the layout pattern; the effect was most visible on light pages and upper page areas.
- `interactive` uses `window` mouse events, not pointer events on the SVG only — fine for full-page decor, avoid on small embedded areas unless acceptable.
- Origin: Tailwind UI / Studio template style grid (parallelogram blocks + line grid).

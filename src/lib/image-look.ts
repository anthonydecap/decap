/*
 * Image settings editors pick per slice in Prismic (fit, position, zoom and effects), shared by
 * the tiles and the hero so both offer the same choices and look the same.
 */

export const POSITION: Record<string, string> = {
  Center: "object-center",
  Top: "object-top",
  Bottom: "object-bottom",
  Left: "object-left",
  Right: "object-right",
  "Top left": "object-left-top",
  "Top right": "object-right-top",
  "Bottom left": "object-left-bottom",
  "Bottom right": "object-right-bottom",
};
/** Zooming in keeps the chosen position in view. */
export const ORIGIN: Record<string, string> = {
  Center: "origin-center",
  Top: "origin-top",
  Bottom: "origin-bottom",
  Left: "origin-left",
  Right: "origin-right",
  "Top left": "origin-top-left",
  "Top right": "origin-top-right",
  "Bottom left": "origin-bottom-left",
  "Bottom right": "origin-bottom-right",
};
export const ZOOM: Record<string, string> = { "110%": "scale-110", "125%": "scale-125", "150%": "scale-150" };
export const BLUR: Record<string, string> = {
  Light: "blur-[2px]",
  Medium: "blur-[6px]",
  Heavy: "blur-[14px]",
};
export const DIM: Record<string, number> = { Light: 0.2, Medium: 0.4, Heavy: 0.6 };
export const COLOR: Record<string, string> = {
  Desaturate: "saturate-50",
  "Black & white": "grayscale",
  Warm: "sepia-[0.35] saturate-[0.9]",
  Cool: "saturate-[0.85] hue-rotate-[12deg] brightness-[1.03]",
  Vivid: "saturate-150 contrast-[1.06]",
  Faded: "contrast-[0.85] brightness-[1.08] saturate-[0.8]",
};

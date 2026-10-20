/**
 * Tiny helpers to write Prismic SharedSlice model.json files without hand-writing JSON.
 * Used by scripts/generate-site-slice-models.mjs. Run that script after changing a model.
 */
export const text = (label, placeholder = "") => ({ type: "Text", config: { label, placeholder } });
export const rich = (label, multi = "paragraph,strong,em,hyperlink", placeholder = "") => ({
  type: "StructuredText",
  config: { label, placeholder, allowTargetBlank: true, multi },
});
export const RICH_BODY = "paragraph,heading3,strong,em,hyperlink,list-item,o-list-item";
export const image = (label) => ({ type: "Image", config: { label, constraint: {}, thumbnails: [] } });
export const link = (label, { media = false } = {}) => ({
  type: "Link",
  config: { label, allowTargetBlank: true, select: media ? "media" : null },
});
export const select = (label, options, def = options[0]) => ({
  type: "Select",
  config: { label, options, default_value: def },
});
export const bool = (label, def = false) => ({ type: "Boolean", config: { label, default_value: def } });
export const number = (label, placeholder = "") => ({ type: "Number", config: { label, placeholder } });
export const TONE = () => select("Section tone", ["Default", "Tinted", "Dark band"]);
export const BRIEF = (what = "image") =>
  text(`Photo brief (shown while the ${what} is empty)`, "e.g. Accordion Pedestal, front view, black backdrop, 4:3");

export function sliceModel({ id, name, description, primary = {}, items = {} }) {
  return {
    id,
    type: "SharedSlice",
    name,
    description,
    variations: [
      { id: "default", name: "Default", docURL: "...", version: "initial", description: "Default", imageUrl: "", primary, items },
    ],
  };
}

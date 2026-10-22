/**
 * Writes model.json for the theme-aware "Site" slices (generic building blocks that work in every
 * page style). Single source of truth for their fields: edit here, then run
 *
 *   node scripts/generate-site-slice-models.mjs
 *
 * and push with scripts/prismic-push-models.mjs (or Slice Machine).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { BRIEF, RICH_BODY, TONE, bool, image, link, rich, select, sliceModel, text } from "./lib/slice-model.mjs";

const header = () => ({
  eyebrow: text("Eyebrow", "Small label above the title"),
  title: text("Title"),
  intro: rich("Intro"),
});

export const SITE_SLICES = {
  siteHero: sliceModel({
    id: "site_hero",
    name: "SiteHero",
    description: "Page hero (H1) with intro, two buttons and an image. Split, centered or full-bleed.",
    primary: {
      layout: select("Layout", ["Split", "Centered", "Full-bleed image"]),
      eyebrow: text("Eyebrow"),
      title: text("Title (H1)"),
      intro: rich("Intro"),
      primary_cta_label: text("Primary button label"),
      primary_cta_link: link("Primary button link"),
      secondary_cta_label: text("Secondary button label"),
      secondary_cta_link: link("Secondary button link"),
      note: text("Small note under the buttons"),
      image: image("Image"),
      image_brief: BRIEF(),
      tone: TONE(),
    },
  }),

  siteTextMedia: sliceModel({
    id: "site_text_media",
    name: "SiteTextMedia",
    description: "Text next to an image or a short looping video clip, with optional bullet points and a link.",
    primary: {
      eyebrow: text("Eyebrow"),
      title: text("Title"),
      body: rich("Body", RICH_BODY),
      image: image("Image"),
      video: link("Looping video clip (mp4, optional, plays muted)", { media: true }),
      image_brief: BRIEF(),
      media_side: select("Media side", ["Image right", "Image left"]),
      aspect: select("Media shape", ["Landscape 4:3", "Square", "Portrait 4:5", "Wide 16:9"]),
      cta_label: text("Link label"),
      cta_link: link("Link"),
      tone: TONE(),
    },
    items: { point: text("Bullet point") },
  }),

  siteCardGrid: sliceModel({
    id: "site_card_grid",
    name: "SiteCardGrid",
    description: "Grid of cards linking to products or pages, with optional tag (e.g. Orchestrionix) and price.",
    primary: {
      ...header(),
      columns: select("Columns", ["3", "2", "4"]),
      card_style: select("Card style", ["Image cards", "Text cards"]),
      cta_label: text("Link under the grid: label"),
      cta_link: link("Link under the grid"),
      tone: TONE(),
    },
    items: {
      image: image("Image"),
      image_brief: BRIEF(),
      tag: text("Tag", "e.g. Orchestrionix"),
      title: text("Title"),
      body: rich("Text"),
      price: text("Price", "e.g. From € 4,950 excl. VAT"),
      link_label: text("Link label", "Discover"),
      link: link("Link"),
    },
  }),

  siteSteps: sliceModel({
    id: "site_steps",
    name: "SiteSteps",
    description: "Numbered process steps, with optional image per step.",
    primary: { ...header(), tone: TONE() },
    items: { title: text("Step title"), body: rich("Step text"), image: image("Image (optional)"), image_brief: BRIEF() },
  }),

  siteTimeline: sliceModel({
    id: "site_timeline",
    name: "SiteTimeline",
    description: "History timeline: year, title, text and optional photo. Highlighted entries stand out.",
    primary: { ...header(), tone: TONE() },
    items: {
      year: text("Year", "1933"),
      title: text("Title"),
      body: rich("Text"),
      image: image("Photo (optional)"),
      image_brief: BRIEF("photo"),
      highlight: bool("Highlight this milestone"),
    },
  }),

  siteFacts: sliceModel({
    id: "site_facts",
    name: "SiteFacts",
    description: "Key figures (big numbers) or a two-column spec list.",
    primary: { ...header(), layout: select("Layout", ["Stats", "Spec list"]), tone: TONE() },
    items: { label: text("Label"), value: text("Value"), note: text("Note (optional)") },
  }),

  siteQuote: sliceModel({
    id: "site_quote",
    name: "SiteQuote",
    description: "A quote or testimonial with name, role and optional portrait.",
    primary: {
      quote: rich("Quote", "paragraph,em"),
      name: text("Name"),
      role: text("Role / organisation"),
      image: image("Portrait (optional)"),
      tone: TONE(),
    },
  }),

  siteFaq: sliceModel({
    id: "site_faq",
    name: "SiteFaq",
    description: "Questions and answers (also output as FAQ structured data for search engines).",
    primary: { ...header(), tone: TONE() },
    items: { question: text("Question"), answer: rich("Answer", "paragraph,strong,em,hyperlink,list-item") },
  }),

  siteCta: sliceModel({
    id: "site_cta",
    name: "SiteCta",
    description: "Closing call to action with optional price, two buttons and an image.",
    primary: {
      eyebrow: text("Eyebrow"),
      title: text("Title"),
      body: rich("Text"),
      price: text("Price", "e.g. From € 4,950"),
      price_note: text("Price note", "excl. VAT, delivery on request"),
      primary_cta_label: text("Primary button label"),
      primary_cta_link: link("Primary button link"),
      secondary_cta_label: text("Secondary button label"),
      secondary_cta_link: link("Secondary button link"),
      image: image("Image (optional)"),
      image_brief: BRIEF(),
      tone: TONE(),
    },
  }),

  siteDownloads: sliceModel({
    id: "site_downloads",
    name: "SiteDownloads",
    description: "Downloadable files: dimension drawings, manuals, software trials.",
    primary: { ...header(), tone: TONE() },
    items: {
      label: text("File name shown", "Dimensions (PDF)"),
      description: text("Short description"),
      file: link("File", { media: true }),
      file_type: text("File type", "PDF"),
    },
  }),

  siteSound: sliceModel({
    id: "site_sound",
    name: "SiteSound",
    description: "Audio recordings of an instrument, so visitors can hear it.",
    primary: { ...header(), tone: TONE() },
    items: {
      title: text("Recording title"),
      description: text("What you hear"),
      audio: link("Audio file (mp3)", { media: true }),
      audio_brief: text("Recording brief (shown while the file is empty)", "e.g. 45 seconds, slow waltz, close microphone"),
    },
  }),

  siteVideo: sliceModel({
    id: "site_video",
    name: "SiteVideo",
    description: "A YouTube or Vimeo video, loaded only when played (privacy friendly).",
    primary: {
      ...header(),
      video: { type: "Embed", config: { label: "YouTube or Vimeo URL" } },
      caption: text("Caption"),
      poster: image("Poster image (optional)"),
      video_brief: text("Video brief (shown while no video is set)"),
      tone: TONE(),
    },
  }),

  siteTiles: sliceModel({
    id: "site_tiles",
    name: "SiteTiles",
    description: "Apple-style product tiles: full-width or half-width, each with its own style, a headline, one line and two links.",
    primary: { tone: TONE() },
    items: {
      size: select("Size", ["Full", "Half"]),
      style: select("Tile style", ["Light", "Dark", "SmartValve", "Orchestrionix", "Atelier"]),
      eyebrow: text("Eyebrow / product name"),
      title: text("Headline"),
      tagline: text("One line"),
      note: text("Small note", "e.g. € 2,599 · ships from stock"),
      primary_label: text("Primary link label", "Learn more"),
      primary_link: link("Primary link"),
      secondary_label: text("Secondary link label", "Buy"),
      secondary_link: link("Secondary link"),
      image: image("Background image (photo or transparent PNG)"),
      image_fit: select("Image fit", ["Cover", "Contain"]),
      image_position: select("Image position", ["Center", "Top", "Bottom", "Left", "Right", "Top left", "Top right", "Bottom left", "Bottom right"]),
      image_size: select("Image size (with Contain)", ["100%", "85%", "70%", "55%"]),
      overlay: select("Text legibility over the image", ["None", "Soft", "Strong"]),
      blur: select("Effect: blur", ["None", "Light", "Medium", "Heavy"]),
      dim: select("Effect: dim (darkens on dark tiles, washes out on light tiles)", ["None", "Light", "Medium", "Heavy"]),
      color_effect: select("Effect: colour", ["None", "Desaturate", "Black & white", "Warm"]),
      vignette: bool("Effect: vignette (darker edges)"),
      hover_zoom: bool("Effect: zoom in slightly on hover"),
      slow_zoom: bool("Effect: slow zoom (Ken Burns)"),
      image_brief: BRIEF(),
    },
  }),

  siteCarousel: sliceModel({
    id: "site_carousel",
    name: "SiteCarousel",
    description: "Apple-style horizontal gallery of tall photo cards with a label and one line over the image.",
    primary: { ...header(), tone: TONE() },
    items: {
      image: image("Photo"),
      image_brief: BRIEF("photo"),
      image_position: select("Image position", ["Center", "Top", "Bottom", "Left", "Right"]),
      eyebrow: text("Label", "At home"),
      title: text("One line", "An Accordion Pedestal in the living room."),
      link: link("Link (optional)"),
    },
  }),

  contactForm: sliceModel({
    id: "contact_form",
    name: "ContactForm",
    description: "Enquiry form. Recipient is fixed on the server: Decap or Atelier Frank Decap.",
    primary: {
      ...header(),
      recipient: select("Send to", ["decap", "frank"]),
      topics: text("Topics (comma separated)", "General question, New organ, Instruments, MIDI conversion, Software"),
      default_topic: text("Preselected topic (optional)"),
      show_phone: bool("Ask for phone number", true),
      show_location: bool("Ask for location", false),
      message_placeholder: text("Message placeholder"),
      submit_label: text("Submit label", "Send message"),
      success_title: text("Success title", "Thank you"),
      success_body: rich("Success text"),
      aside_title: text("Side panel title"),
      aside_body: rich("Side panel text (address, hours, …)", RICH_BODY),
      tone: TONE(),
    },
  }),

  organComposer: sliceModel({
    id: "organ_composer",
    name: "OrganComposer",
    description: "Interactive organ configurator: start from a design, choose options, send as an enquiry.",
    primary: {
      ...header(),
      bespoke_note: rich("Bespoke note under the composer"),
      success_title: text("Success title", "Your starting point is on its way"),
      success_body: rich("Success text"),
      tone: TONE(),
    },
    items: {
      image: image("Design render"),
      image_brief: BRIEF("render"),
      name: text("Design name"),
      kind: select("Kind", ["Modular", "Bespoke"]),
      description: text("Short description"),
    },
  }),
};

const root = join(import.meta.dirname, "..", "src", "slices");
if (process.argv[1] === import.meta.filename) {
  for (const [folder, model] of Object.entries(SITE_SLICES)) {
    mkdirSync(join(root, folder), { recursive: true });
    writeFileSync(join(root, folder, "model.json"), JSON.stringify(model, null, 2) + "\n");
  }
  console.log(`Wrote ${Object.keys(SITE_SLICES).length} slice models.`);
}

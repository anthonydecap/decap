/** Organ pipes page (Prismic page "organ-pipes"): wooden organ pipes made to measure on our own CNC. */
export default {
  type: "page",
  uid: "organ-pipes",
  title: "Organ pipes",
  theme: "decap",
  meta_title: "Wooden Organ Pipes Made to Measure | Decap Herentals",
  meta_description:
    "Wooden organ pipes milled on our own 5-axis CNC: bourdons, flutes, violins and reed pipes in custom measurements, short delivery, voiced or unvoiced.",
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Made in Herentals since 2016",
        title: "Wooden organ pipes, made to your measurements",
        intro:
          "Bourdons, flutes, violins and reed pipes, milled on our own 5-axis CNC with software we wrote ourselves. Standard models or your own measurements, with short delivery times. For organ builders, restorers and anyone building an organ.",
        primary_cta_label: "Request pipes",
        primary_cta_link: "/contact",
        secondary_cta_label: "Pipes in a new organ",
        secondary_cta_link: "/organs",
        image_brief:
          "A row of new unvoiced wooden pipes of increasing size standing on a workbench, pale Ayous bodies and beech mouths visible, side light from a window; portrait 4:5",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "How we make them",
        title: "Every pipe from our own CNC",
        body:
          "Since 2016 we mill our organ pipes on a 5-axis CNC. The G-code comes from **PipeCreator**, software we developed in-house. The machine cuts each part to exact dimensions and angles, so every pipe in a rank matches the next.\n\nAfter cutting and gluing, the pipe is ready for voicing and finishing. Our voicers can do that for you, or you take over at the stage you prefer.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "The 5-axis CNC milling a pipe part, dust extraction on, shot through or beside the machine door; 4:3",
      },
      items: [
        { point: "5-axis CNC, G-code from our own PipeCreator software" },
        { point: "Voiced by our voicers, or delivered for you to voice" },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Wood",
        title: "Ayous bodies, beech feet and mouths",
        body:
          "A CNC does not see the difference between fine grain and a knot, so we chose the wood for the machine and the sound. The body is **Ayous** (*Triplochiton scleroxylon*): very stable, pale yellow and virtually free of knots. Feet and mouths are made of **hand-selected beech**.",
        media_side: "Image left",
        aspect: "Square",
        image_brief: "Close-up of the mouth of a wooden pipe, showing the pale Ayous body against the beech mouth part, square 1:1",
        tone: "Tinted",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Made to measure",
        title: "Your measurements, short delivery",
        body:
          "Every pipe family has the same basic design, with room to vary. A little wider for more ground tone, a little narrower for more harmonics, a higher cut-up and a different length for higher wind pressure.\n\nIn PipeCreator we change inside width and depth, panel thickness and length of our standard models in minutes. The G-code is generated straight away and goes to the CNC. That is how we make pipes to your exact measurements with short delivery times. [TO CHECK: typical delivery time]",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "PipeCreator open on a screen showing a pipe model with its dimensions, monitor filling the frame, 4:3",
      },
    },
    {
      type: "site_facts",
      primary: {
        eyebrow: "Range",
        title: "Standard pipe range",
        intro: "Ranges are given as MIDI note numbers (60 = middle C). Other ranges and measurements on request.",
        layout: "Spec list",
      },
      items: [
        { label: "Bourdon", value: "MIDI 24–96", note: "6 octaves, stopped" },
        { label: "Jazz Flute", value: "MIDI 60–96", note: "3 octaves, stopped" },
        { label: "Vibraton", value: "MIDI 46–84", note: "3 octaves, stopped" },
        { label: "Double Street Organ", value: "MIDI 60–96", note: "3 octaves, stopped" },
        { label: "Flute (Flute 8′ etc.)", value: "MIDI 60–96", note: "3 octaves, open" },
        { label: "Violins (alto, cello etc.)", value: "MIDI 48–96", note: "4 octaves, open" },
        { label: "Bariton", value: "MIDI 48–84", note: "3 octaves, reed" },
        { label: "Trumpet", value: "MIDI 60–96", note: "3 octaves, reed" },
      ],
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "Need pipes?",
        title: "Send us your list of pipes",
        body: "Tell us the pipe types, the note range, the wind pressure and any measurements you need. We reply with a quote and a delivery date.",
        price: "[TO CHECK: price per pipe or per rank]",
        price_note: "excl. VAT",
        primary_cta_label: "Request a quote",
        primary_cta_link: "/contact",
        secondary_cta_label: "Self-playing pipes",
        secondary_cta_link: "/pipes",
        tone: "Dark band",
      },
    },
  ],
};

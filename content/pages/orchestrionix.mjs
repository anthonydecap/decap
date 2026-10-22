/** Orchestrionix landing page (Prismic page "orchestrionix"): receives all orchestrionix.com visitors. */
export default {
  type: "page",
  uid: "orchestrionix",
  title: "Orchestrionix",
  theme: "orchestrionix",
  meta_title: "Orchestrionix Robotic Instruments | Decap Herentals",
  meta_description:
    "Orchestrionix is Decap's line of robotic instruments for musicians. No music library: you play them from your own audio. Today the line is Brass Core.",
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Orchestrionix by Decap",
        title: "Orchestrionix: robotic instruments for musicians",
        intro:
          "Orchestrionix is Decap's line of robotic instruments for musicians, made in our workshop in Herentals. It used to have its own website; decap.be is now the home of both. Today the line is **Brass Core**: real trumpet or trombone sound, driven by your own audio.",
        primary_cta_label: "Discover Brass Core",
        primary_cta_link: "/brass-core",
        secondary_cta_label: "Self-playing instruments",
        secondary_cta_link: "/instruments",
        image_brief: "Brass Core clamped to a trumpet on a stand, dark backdrop, low side light catching the brass, portrait 4:5",
        tone: "Dark band",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "What makes it different",
        title: "No music library. You supply the performance.",
        body:
          "Our self-playing instruments come with a player and music. Orchestrionix instruments do not. They are tools for musicians, sound designers and venues who want to drive a real acoustic instrument with their own material.\n\nBrass Core takes a line-level audio signal, from a recording or from MIDI through the sampler or synth of your choice. A voice-coil motor turns that signal into air vibrations at the mouthpiece, and the brass instrument itself shapes the tone. No drilling, no changes to the instrument.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        cta_label: "Brass Core specifications",
        cta_link: "/brass-core",
        image_brief: "Close-up of Brass Core on a trombone mouthpiece with its audio cable plugged in, dark backdrop, 4:3",
      },
    },
    {
      type: "site_card_grid",
      primary: {
        eyebrow: "Coming from orchestrionix.com?",
        title: "Where to find things now",
        intro: "Everything from the old Orchestrionix site now lives on decap.be.",
        columns: "2",
        card_style: "Text cards",
      },
      items: [
        {
          title: "smARTvalve",
          body: "smARTvalve is a Decap product: one valve and one processor for every organ pipe.",
          link_label: "smARTvalve",
          link: "/smartvalve",
        },
        {
          title: "Self-playing instruments",
          body: "The Accordion Pedestal and Cube, Pipes, Percussion Unit, Mallet Percussion and Bellow Organ.",
          link_label: "Instruments",
          link: "/instruments",
        },
      ],
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "Orchestrionix Brass Core",
        title: "Hear a real trumpet play from your audio",
        body: "See how Brass Core works, what it connects to and what theatres, studios and museums use it for.",
        price: "€ 2,599",
        price_note: "Ships straight away when in stock",
        primary_cta_label: "Discover Brass Core",
        primary_cta_link: "/brass-core",
        secondary_cta_label: "Ask a question",
        secondary_cta_link: "/contact",
        tone: "Dark band",
      },
    },
  ],
};

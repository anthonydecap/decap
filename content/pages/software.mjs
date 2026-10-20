/** Software overview (Prismic page "software"): Virtual Orchestrion and MIDIMapper. */
export default {
  type: "page",
  uid: "software",
  title: "Software",
  theme: "decap",
  meta_title: "Organ & Orchestrion Software | Decap Herentals",
  meta_description:
    "Virtual Orchestrion plays your Decap instruments and QRS pianos. MIDIMapper lets arrangers hear organ arrangements with real organ samples. Free trial.",
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Software",
        title: "Software for orchestrions, organs and arrangers",
        intro:
          "We write the software that drives our instruments. Virtual Orchestrion plays them. MIDIMapper helps arrangers hear what they write before it reaches the organ.",
        primary_cta_label: "Virtual Orchestrion",
        primary_cta_link: "/virtual-orchestrion",
        secondary_cta_label: "MIDIMapper",
        secondary_cta_link: "/midimapper",
        image_brief: "Laptop on a workbench showing Virtual Orchestrion, an organ façade out of focus behind it, portrait 4:5",
      },
    },
    {
      type: "site_card_grid",
      primary: {
        eyebrow: "Two programs",
        title: "One for playing, one for arranging",
        columns: "2",
        card_style: "Image cards",
      },
      items: [
        {
          tag: "Player",
          title: "Virtual Orchestrion",
          body: "The player for Decap instruments and QRS pianos. Adds missing ranks virtually, so a smaller organ plays larger scales. Hosts up to 8 VSTi and 8 DXi instruments and includes the music shop.",
          price: "[TO CHECK: price/licensing]",
          link_label: "Virtual Orchestrion",
          link: "/virtual-orchestrion",
          image_brief: "Screenshot of Virtual Orchestrion's animated orchestrion view, 4:3",
        },
        {
          tag: "For arrangers",
          title: "MIDIMapper",
          body: "Routes MIDI from your DAW to real organ samples, so you hear an arrangement as registrations, not General MIDI sounds. Up to 12 layers per map, 64 channels and WAV export.",
          price: "€ 150 excl. VAT",
          link_label: "MIDIMapper and free trial",
          link: "/midimapper",
          image_brief: "Screenshot of the MIDIMapper map editor on a laptop, 4:3",
        },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Music shop",
        title: "Arrangements ready for the player",
        body:
          "Arrangers sell their arrangements for Decap instruments in our music shop. Every file is copy-protected and formatted for Virtual Orchestrion, so it plays on the instruments you have connected.\n\nArrangers who want to sell their work can [contact us](/contact). [TO CHECK: arranger sign-up process]",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        cta_label: "Browse the music shop",
        cta_link: "/shop",
        image_brief: "Screenshot of the music shop page with a few arrangements listed, 4:3",
        tone: "Tinted",
      },
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "Arranging for organ?",
        title: "Try MIDIMapper for free",
        body: "Download the trial, connect it to your DAW and hear your arrangement with real organ samples.",
        price: "€ 150",
        price_note: "excl. VAT, full licence",
        primary_cta_label: "Download the free trial",
        primary_cta_link: "/midimapper",
        secondary_cta_label: "About Virtual Orchestrion",
        secondary_cta_link: "/virtual-orchestrion",
        tone: "Dark band",
      },
    },
  ],
};

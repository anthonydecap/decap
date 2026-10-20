/** Home page (Prismic page "home", replaces the placeholder slices). */
export default {
  type: "page",
  uid: "home",
  title: "Decap Herentals",
  theme: "decap",
  meta_title: "Dance Organs & Self-Playing Instruments | Decap",
  meta_description:
    "Organ builders since 1895. Decap Herentals builds dance, fair and street organs, self-playing accordions and the MIDI technology that drives them.",
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Organ builders since 1895",
        title: "Dance organs and self-playing instruments, made in Herentals",
        intro:
          "We build new organs, restore historic ones and make the self-playing instruments and electronics that drive them. Four generations of the Decap family, one workshop in Herentals, Belgium.",
        primary_cta_label: "Discover our organs",
        primary_cta_link: "/organs",
        secondary_cta_label: "Self-playing instruments",
        secondary_cta_link: "/instruments",
        image_brief: "Tony Decap in the Herentals workshop next to a finished organ façade, portrait 4:5",
      },
    },
    {
      type: "site_card_grid",
      primary: {
        eyebrow: "What we make",
        title: "From a complete dance organ to a single pipe",
        columns: "2",
        card_style: "Image cards",
      },
      items: [
        {
          title: "New organs",
          body: "Dance, fair, street and concert organs. Start from our proven modules or have every detail designed for you.",
          link_label: "Organs",
          link: "/organs",
          image_brief: "A finished Decap dance organ façade, front view, 4:3",
        },
        {
          title: "Self-playing instruments",
          body: "A real accordion, pipes, drums and xylophones, played by MIDI. Music library included, ready to play.",
          link_label: "Instruments",
          link: "/instruments",
          image_brief: "Accordion Pedestal and Percussion Unit side by side, black backdrop, 4:3",
        },
        {
          title: "SmartValve",
          body: "One valve and one processor for every pipe. Each note gets its own pressure, dynamics and vibrato.",
          link_label: "SmartValve",
          link: "/smartvalve",
          image_brief: "Close-up of a row of SmartValves on a wind chest, dark background, 4:3",
        },
        {
          title: "Restoration and MIDI conversion",
          body: "Historic organs restored by Atelier Frank Decap, with our MIDI conversion units when you want both book and MIDI.",
          link_label: "Atelier Frank Decap",
          link: "/frank-decap",
          image_brief: "Hands repairing the bellows of a historic organ, warm light, 4:3",
        },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Keys are no limit",
        title: "A 105-key organ that plays 121-key music",
        body:
          "Every new Decap organ comes with our Virtual Orchestrion player. When an arrangement calls for ranks your organ does not have, the player adds them virtually, using samples we recorded in our own workshop.\n\nSo you choose the organ that fits your room and budget, not the one that fits your repertoire.",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        cta_label: "About Virtual Orchestrion",
        cta_link: "/virtual-orchestrion",
        image_brief: "Virtual Orchestrion on a touchscreen next to an organ, showing the animated book view, 4:3",
        tone: "Tinted",
      },
    },
    {
      type: "site_timeline",
      primary: {
        eyebrow: "Since 1895",
        title: "Every generation reinvented the organ",
        intro:
          "Aloïs Decap started with a handful of rented organs. His son Frans founded Decap Herentals. François took it digital, Tony brought MIDI and SmartValve. [Read the full story](/about).",
      },
      items: [
        { year: "1895", title: "Aloïs Decap starts in organs", body: "He rents out and deals in small organs around Antwerp, delivered by dog cart." },
        { year: "1933", title: "Frans Decap founds Decap Herentals", body: "The same year, the first self-playing accordions appear on Decap organs.", highlight: true },
        { year: "1977", title: "The first digital dance organ", body: "François replaces pipes with digital sound, so cafés and dance halls with smaller budgets can have an organ." },
        { year: "2000", title: "MIDI comes to the dance organ", body: "Tony Decap puts a whole music library on one card, instead of racks of cardboard books." },
        { year: "2016", title: "Pipes from our own CNC", body: "We mill organ pipes on 5-axis CNC with PipeCreator, software we wrote ourselves." },
        { year: "2025", title: "The first wind synthesizer", body: "SmartValve in a transportable church organ: every pipe controlled on its own.", highlight: true },
      ],
    },
    {
      type: "site_card_grid",
      primary: {
        eyebrow: "Work",
        title: "Heard on stage, in museums and on tour",
        intro: "Decap instruments play with artists and in venues across Europe.",
        columns: "4",
        card_style: "Image cards",
        cta_label: "All projects",
        cta_link: "/work",
      },
      items: [
        { title: "Pat Metheny", body: "[TO CHECK: one line on what Decap built for Pat Metheny]", link_label: "Read more", link: "/work/pat-metheny", image_brief: "Pat Metheny with Decap instruments on stage, 4:3" },
        { title: "Yves Rechsteiner", body: "L'Explorateur, a mobile concert organ with SmartValve on every pipe.", link_label: "Read more", link: "/work/yves-rechsteiner", image_brief: "L'Explorateur set up in a chapel, 4:3" },
        { title: "Stephan Eicher", body: "Automated instruments for the tour Stephan Eicher und die Automaten.", link_label: "Read more", link: "/work/stephan-eicher", image_brief: "Stephan Eicher on stage with the automated instruments, 4:3" },
        { title: "House of Music Hungary", body: "A robot orchestra for the Creative Sound Space in Budapest.", link_label: "Read more", link: "/work/house-of-music-hungary", image_brief: "The robot orchestra in the Creative Sound Space, Budapest, 4:3" },
      ],
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "Planning an organ?",
        title: "Tell us where it will play",
        body: "Pick a starting design and a few options in the Organ Composer. We reply with questions and a first idea, without obligation.",
        primary_cta_label: "Compose your organ",
        primary_cta_link: "/organ-composer",
        secondary_cta_label: "Contact the workshop",
        secondary_cta_link: "/contact",
        tone: "Dark band",
      },
    },
  ],
};

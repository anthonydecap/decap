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
          "Organs and self-playing instruments for homes, cafés, bars and dance halls, built by four generations of the Decap family in one workshop in Herentals, Belgium.",
        primary_cta_label: "Discover our organs",
        primary_cta_link: "/organs",
        secondary_cta_label: "Self-playing instruments",
        secondary_cta_link: "/instruments",
        image_brief: "Tony Decap in the Herentals workshop next to a finished organ façade, portrait 4:5",
      },
    },
    {
      type: "site_tiles",
      primary: {},
      items: [
        { size: "Full", style: "Light", eyebrow: "Organs", title: "Dance organs, built to order.", tagline: "Dance, fair, street and concert organs from our Herentals workshop. Modular or fully bespoke.", primary_label: "Learn more", primary_link: "/organs", secondary_label: "Compose your organ", secondary_link: "/organ-composer", image_brief: "A finished Decap dance organ on stage, wide shot" },
        { size: "Half", style: "Light", eyebrow: "Self-playing instruments", title: "A real accordion. Playing itself.", tagline: "Accordion, pipes, drums and xylophones, played by MIDI.", primary_label: "Learn more", primary_link: "/instruments", secondary_label: "Accordion Pedestal", secondary_link: "/accordion", image_brief: "Accordion Pedestal on stage" },
        { size: "Half", style: "Dark", eyebrow: "Organ pipes", title: "Any wooden pipe. Within a week.", tagline: "Milled on our own CNC, in our scales or yours.", primary_label: "Learn more", primary_link: "/organ-pipes", secondary_label: "Order pipes", secondary_link: "/organ-pipes#contact-form", image_brief: "New wooden pipe parts from the CNC" },
        { size: "Full", style: "SmartValve", eyebrow: "smARTvalve", title: "Every pipe. Its own voice.", tagline: "A processor in every valve. Wind, dynamics and stops, controlled per pipe.", primary_label: "Learn more", primary_link: "/smartvalve", secondary_label: "For organ builders", secondary_link: "/smartvalve-for-organ-builders", image_brief: "smARTvalves mounted in their wind chest" },
        { size: "Full", style: "Orchestrionix", eyebrow: "Brass Core", title: "A real trumpet. Played by sound.", tagline: "A voice-coil embouchure for trumpet and trombone. No changes to the instrument.", note: "€ 2,599 · ships from stock", primary_label: "Learn more", primary_link: "/brass-core", secondary_label: "Order", secondary_link: "/brass-core#contact-form", image_brief: "Brass Core on a trombone, dark background" },
        { size: "Half", style: "Atelier", eyebrow: "Atelier Frank Decap", title: "Historic organs, restored by hand.", tagline: "Restoration and MIDI installation, on the same site in Herentals.", primary_label: "Learn more", primary_link: "/frank-decap", secondary_label: "Send photos of your organ", secondary_link: "/frank-decap#contact-form", image_brief: "Frank Decap at work in his atelier" },
        { size: "Half", style: "Light", eyebrow: "Software", title: "One player for the whole ensemble.", tagline: "Virtual Orchestrion and MIDIMapper, in the Decap shop.", primary_label: "Learn more", primary_link: "/software", secondary_label: "Visit the shop", secondary_link: "/shop", image_brief: "Virtual Orchestrion on two screens" },
      ],
    },
    {
      type: "site_card_grid",
      primary: {
        eyebrow: "Where they play",
        title: "In living rooms, bars and dance halls",
        intro: "Most Decap organs and instruments belong to private owners. They play at home, in a café or bar, in a dance hall, all over the world.",
        columns: "4",
        card_style: "Image cards",
      },
      items: [
        { title: "At home", body: "An Accordion Pedestal in the living room, or a complete orchestrion in the collection room.", image_brief: "Accordion Pedestal in a living room at a customer's home, warm evening light, 4:3" },
        { title: "Bars and cafés", body: "A dance organ or orchestrion that draws people in and plays all evening on its own.", image_brief: "Decap organ in a café or bar with guests, 4:3" },
        { title: "Dance halls and events", body: "Organs with controllable volume that fit the room, from a small hall to a festival.", image_brief: "Dance organ in a dance hall during an evening, 4:3" },
        { title: "Museums and stages", body: "Collections, exhibitions and artists on tour: see our [work](/work).", image_brief: "Decap orchestrion in a museum or on a stage, 4:3" },
      ],
    },
    {
      type: "site_timeline",
      primary: {
        eyebrow: "Since 1895",
        title: "Every generation reinvented the organ",
        intro:
          "Aloïs Decap started with a handful of rented organs. His son Frans founded Decap Herentals. François took it digital, Tony brought MIDI and smARTvalve. [Read the full story](/about).",
      },
      items: [
        { year: "1895", title: "Aloïs Decap starts in organs", body: "He rents out and deals in small organs around Antwerp, delivered by dog cart." },
        { year: "1933", title: "Frans Decap founds Decap Herentals", body: "The same year, the first self-playing accordions appear on Decap organs.", highlight: true },
        { year: "1977", title: "The first digital dance organ", body: "François replaces pipes with digital sound, so cafés and dance halls with smaller budgets can have an organ." },
        { year: "2000", title: "MIDI comes to the dance organ", body: "Tony Decap puts a whole music library on one card, instead of racks of cardboard books." },
        { year: "2016", title: "Pipes from our own CNC", body: "We mill organ pipes on 5-axis CNC with PipeCreator, software we wrote ourselves." },
        { year: "2025", title: "The first wind synthesizer", body: "smARTvalve in a transportable church organ: every pipe controlled on its own.", highlight: true },
      ],
    },
    {
      type: "home_artists",
      copyItemsFrom: { type: "page", uid: "home" },
      primary: {
        title: "Also played on stage",
        description: "Our organs and instruments mostly play in homes, bars and dance halls. These artists take them on stage.",
      },
      items: [
        { artist_name: "Pat Metheny" },
        { artist_name: "Walter Hus" },
        { artist_name: "Circus Ronaldo" },
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

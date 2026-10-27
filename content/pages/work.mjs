/** Work overview (Prismic page "work"): instruments in homes and bars first, then artists and case studies. */
export default {
  type: "page",
  uid: "work",
  title: "Work",
  theme: "decap",
  meta_title: "Our Work: Organs and Orchestrions | Decap Herentals",
  meta_description:
    "Decap organs and orchestrions play in homes, bars and dance halls around the world, and on stage with Pat Metheny, Stephan Eicher and Yves Rechsteiner.",
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Centered",
        eyebrow: "Work",
        title: "Organs and orchestrions in homes, bars and on stage",
        intro:
          "Most of our organs and instruments play for private owners: in living rooms, cafés, bars and dance halls, all over the world. Some go on tour with artists. Here is a selection.",
      },
    },
    {
      type: "site_gallery",
      primary: {
        eyebrow: "For private owners",
        title: "In homes, bars and collections",
        intro: "A selection of organs and orchestrions that left our Herentals workshop for private customers.",
      },
      items: [
        { label: "Realisation", title: "Accordion castle", image_brief: "The Accordion castle, front view on a plain backdrop, 4:3" },
        { label: "Realisation", title: "Accordion Pedestal, pearl white", image_brief: "Pearl-white Accordion Pedestal against a dark backdrop, three-quarter view, 4:3" },
        { label: "Realisation", title: "Orchestrion, pearl white", image_brief: "Pearl-white orchestrion, front view, workshop wall behind, 4:3" },
        { label: "Realisation", title: "Orchestrion with dual accordion", image_brief: "Orchestrion with two accordions, front view, 4:3" },
        { label: "Design", title: "Orchestrion, rounded 70's design", fit: "Whole, light backdrop", image_brief: "Orchestrion with rounded 1970s-style case, three-quarter view, 4:3" },
        { label: "Design", title: "Orchestrion, trailer design", fit: "Whole, light backdrop", image_brief: "Orchestrion built into a trailer, side panel open, outdoors, 4:3" },
        { label: "Design", title: "Pipe cube", fit: "Whole, light backdrop", image_brief: "Pipe Cube on a table, black backdrop, pipes visible, 4:3" },
        { label: "Realisation", title: "Organ", image_brief: "Finished Decap organ façade, front view, 4:3" },
      ],
    },
    {
      type: "home_artists",
      copyItemsFrom: { type: "page", uid: "home" },
      primary: {
        title: "Played by artists",
        description: "Composers, bands and theatre companies who play our organs and instruments on stage and in the studio.",
      },
      items: [
        { artist_name: "Pat Metheny" },
        { artist_name: "Walter Hus" },
        { artist_name: "Circus Ronaldo" },
      ],
    },
    {
      type: "site_card_grid",
      primary: {
        eyebrow: "Projects in depth",
        title: "Some projects, told in full",
        columns: "3",
        card_style: "Image cards",
      },
      items: [
        {
          tag: "Concert organ · 2025",
          title: "Yves Rechsteiner: L'Explorateur",
          body: "A transportable concert organ with smARTvalve on every pipe: the first wind synthesizer.",
          link_label: "Read the case study",
          link: "/work/yves-rechsteiner",
          image_brief: "L'Explorateur set up in a chapel, 4:3",
        },
        {
          tag: "Tour and album",
          title: "Stephan Eicher und die Automaten",
          body: "Self-playing acoustic instruments on tour with Stephan Eicher, and on his album Ode.",
          link_label: "Read the case study",
          link: "/work/stephan-eicher",
          image_brief: "Stephan Eicher on stage with the automated instruments, 4:3",
        },
        {
          tag: "Museum · Budapest",
          title: "House of Music Hungary",
          body: "Almost all the instruments of the robot orchestra in the Creative Sound Space, with Medence Design.",
          link_label: "Read the case study",
          link: "/work/house-of-music-hungary",
          image_brief: "The robot orchestra in the Creative Sound Space, Budapest, 4:3 (photo Mohai Balázs)",
        },
        {
          tag: "Orchestrion",
          title: "Walter Hus, BELEM and The Mekanics",
          body: "Transportable pipe units, a percussion unit and an accordion for Walter Hus's mechanical orchestra.",
          link_label: "Read the case study",
          link: "/work/walter-hus-belem",
          image_brief: "BELEM on stage in front of the mechanical orchestra, 4:3",
        },
        {
          tag: "Dance organ · 2008",
          title: "Guido Belcanto",
          body: "A custom-built Belcanto organ for Balzaal der Gebroken Harten, on tour through the largest halls of Belgium's cultural centres.",
          link_label: "Read the case study",
          link: "/work/guido-belcanto",
          image_brief: "Guido Belcanto on stage with the Decap dance organ, 4:3",
        },
        {
          tag: "Circus",
          title: "Circus Ronaldo",
          body: "Bespoke instruments built into the sets of several productions, and Brass Core for live brass.",
          link_label: "Read the case study",
          link: "/work/circus-ronaldo",
          image_brief: "The Decap organ in the Circus Ronaldo tent, 4:3",
        },
        {
          title: "Pat Metheny",
          body: "An orchestrion from Herentals, toured around the world in many productions, up to his last concert in Belgium at BOZAR.",
          link_label: "Read the case study",
          link: "/work/pat-metheny",
          image_brief: "Pat Metheny with Decap instruments on stage, 4:3",
        },
      ],
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "Your project",
        title: "Tell us where it will play",
        body: "Living room, bar, dance hall or stage: describe the room and the music. We reply with questions and a first idea.",
        primary_cta_label: "Describe your project",
        primary_cta_link: "/contact",
        secondary_cta_label: "Compose your organ",
        secondary_cta_link: "/organ-composer",
        tone: "Dark band",
      },
    },
  ],
};

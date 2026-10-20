/** Work case study (Prismic project "guido-belcanto"): a Decap dance organ on stage in Balzaal der Gebroken Harten (2008). */
export default {
  type: "project",
  uid: "guido-belcanto",
  title: "Guido Belcanto: Balzaal der Gebroken Harten",
  theme: "decap",
  meta_title: "Guido Belcanto's Dance Organ on Stage | Decap",
  meta_description:
    "In 2008 Guido Belcanto toured a Decap dance organ in his theatre show Balzaal der Gebroken Harten, possible because its sensitivity and volume are controllable.",
  fields: {
    summary: "A Decap dance organ on tour in Guido Belcanto's theatre show Balzaal der Gebroken Harten.",
    client: "Guido Belcanto",
    year: "2008",
    location: "Belgium [TO CHECK: tour venues]",
  },
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Work · 2008",
        title: "A Decap dance organ on tour with Guido Belcanto",
        intro:
          "In 2008 Flemish singer Guido Belcanto took a Decap dance organ on stage in his theatre show *Balzaal der Gebroken Harten*. A dance organ is built to fill a dance hall. This one played in theatres, next to a singer.",
        primary_cta_label: "Our dance organs",
        primary_cta_link: "/organs",
        secondary_cta_label: "All projects",
        secondary_cta_link: "/work",
        image_brief: "Guido Belcanto on stage with the Decap dance organ behind him, 4:3 [TO CHECK: photo and usage rights]",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Why it worked",
        title: "Sensitivity and volume under control",
        body:
          "A dance organ is voiced to fill a dance hall. A theatre stage, with a singer at the microphone, asks for something else.\n\nOn a Decap organ, sensitivity and volume are controllable. That made it possible to set the organ for each theatre and play it alongside a singer. [TO CHECK: which organ model and how it was controlled during the show]",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "Front of the Decap dance organ used in the show, front view, 4:3",
      },
    },
    {
      type: "site_facts",
      primary: {
        eyebrow: "At a glance",
        title: "Project facts",
        layout: "Spec list",
      },
      items: [
        { label: "Artist", value: "Guido Belcanto" },
        { label: "Show", value: "Balzaal der Gebroken Harten" },
        { label: "Year", value: "2008" },
        { label: "On stage", value: "Guido Belcanto, Lady Angelina, Vitalski and the Decap organ" },
        { label: "Instrument", value: "Decap dance organ [TO CHECK: model]" },
      ],
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "Dance organs",
        title: "A dance organ that fits your room",
        body: "Dance hall, café or theatre: tell us where the organ will play. We reply with questions and a first design idea.",
        primary_cta_label: "Compose your organ",
        primary_cta_link: "/organ-composer",
        secondary_cta_label: "Request a consultation",
        secondary_cta_link: "/contact",
        tone: "Dark band",
      },
    },
  ],
};

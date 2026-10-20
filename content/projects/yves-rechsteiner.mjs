/** Work case study (Prismic project "yves-rechsteiner"): L'Explorateur, the mobile concert organ with SmartValve on every pipe. */
export default {
  type: "project",
  uid: "yves-rechsteiner",
  title: "Yves Rechsteiner: L'Explorateur",
  theme: "decap",
  meta_title: "L'Explorateur Mobile Concert Organ | Decap Herentals",
  meta_description:
    "L'Explorateur, the mobile concert organ of Yves Rechsteiner: a transportable pipe organ with SmartValve on every pipe, the first wind synthesizer. Built 2025.",
  fields: {
    summary: "A transportable concert organ with SmartValve on every pipe, for organist Yves Rechsteiner.",
    client: "Yves Rechsteiner",
    year: "2025",
    location: "Switzerland [TO CHECK: where L'Explorateur is based]",
  },
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Work · 2025",
        title: "L'Explorateur: a mobile concert organ with SmartValve on every pipe",
        intro:
          "Swiss organist Yves Rechsteiner wanted an organ he could take to venues that have none. We built L'Explorateur: a transportable pipe organ in which every pipe has its own SmartValve. The result is the world's first wind synthesizer. [TO CHECK: confirm L'Explorateur = the 2025 organ]",
        primary_cta_label: "About SmartValve",
        primary_cta_link: "/smartvalve",
        secondary_cta_label: "All projects",
        secondary_cta_link: "/work",
        image_brief: "L'Explorateur set up in a chapel, Yves Rechsteiner at the console, wide shot, 4:3",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "The brief",
        title: "An organ that travels to the audience",
        body:
          "Many concert venues have no pipe organ, and a church organ cannot leave its church. Yves Rechsteiner asked for an instrument he could transport, set up and play wherever the concert is.\n\nWe designed L'Explorateur in 3D first, so every detail of the case and pipe layout was agreed before production started. [TO CHECK: transport details, set-up time, number of pipes and ranks]",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "3D render of L'Explorateur next to a photo of the finished organ, 4:3",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "The technology",
        title: "Every pipe with its own valve and processor",
        body:
          "A traditional organ valve is open or closed. In L'Explorateur each pipe has its own SmartValve, which regulates the airflow more than 1,000 times per second. That gives the organist control over every single note:",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        cta_label: "How SmartValve works",
        cta_link: "/smartvalve",
        image_brief: "Close-up of the SmartValves under the pipes inside L'Explorateur, dark background, 4:3",
        tone: "Tinted",
      },
      items: [
        { point: "Pressure from 0 to 200%, stored per pipe" },
        { point: "4 ms response, with PID feedback" },
        { point: "Vibrato, slope, decay and LFO effects per note" },
        { point: "Optical MIDI: 100 times MIDI speed, over cables of 200 m and more" },
      ],
    },
    {
      type: "site_quote",
      primary: {
        quote:
          "“…a modular organ… developed by Tony Decap”, whose valve technology “essentially turns a pipe organ into a physical synthesizer”.",
        name: "Studio 31, Basel",
        role: "On L'Explorateur [TO CHECK: exact wording and attribution of the source]",
      },
    },
    {
      type: "site_facts",
      primary: {
        eyebrow: "At a glance",
        title: "L'Explorateur",
        layout: "Spec list",
      },
      items: [
        { label: "Organist", value: "Yves Rechsteiner" },
        { label: "Completed", value: "2025" },
        { label: "Type", value: "Transportable concert organ" },
        { label: "Pipe control", value: "SmartValve on every pipe" },
        { label: "Valve regulation", value: "More than 1,000 times per second" },
        { label: "Pressure range", value: "0–200%, per pipe" },
        { label: "In concert", value: "Lyon, Chapelle de la Trinité, 14 November 2025" },
      ],
    },
    {
      type: "site_video",
      primary: {
        eyebrow: "Listen",
        title: "L'Explorateur in concert",
        video_brief:
          "Video of Yves Rechsteiner playing L'Explorateur in concert, e.g. Lyon, Chapelle de la Trinité [TO CHECK: video and permission to embed]",
      },
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "SmartValve for your organ",
        title: "Give every pipe its own dynamics",
        body: "SmartValve works in new organs and in our instruments. Tell us about your organ and we will tell you what is possible.",
        primary_cta_label: "Discover SmartValve",
        primary_cta_link: "/smartvalve",
        secondary_cta_label: "Request a consultation",
        secondary_cta_link: "/contact",
        tone: "Dark band",
      },
    },
  ],
};

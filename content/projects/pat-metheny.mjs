/** Work case study (Prismic project "pat-metheny"): the orchestrion Decap built, which Pat Metheny toured the world with. */
export default {
  type: "project",
  uid: "pat-metheny",
  title: "Pat Metheny",
  theme: "decap",
  meta_title: "Pat Metheny and Decap | Work | Decap Herentals",
  meta_description:
    "Decap Herentals built an orchestrion for jazz guitarist Pat Metheny. He toured the world with it in many productions, including his last concert in Belgium.",
  fields: {
    summary: "An orchestrion built in Herentals, toured around the world in many of his productions.",
    client: "Pat Metheny",
    location: "Worldwide",
  },
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Work",
        title: "An orchestrion for Pat Metheny",
        intro: "We built an orchestrion for Pat Metheny. He toured the world with it in many of his productions. His last concert in Belgium, at BOZAR in Brussels, featured it too.",
        primary_cta_label: "All projects",
        primary_cta_link: "/work",
        image_brief: "Pat Metheny with the Decap instrument(s) on stage or in the studio, 4:3",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "The project",
        title: "Built to tour the world",
        body:
          "An orchestrion is a band of acoustic instruments played by machine. Pat Metheny plays alongside it on stage: the instruments respond to his playing and his arrangements, night after night, in a different hall every evening.\n\nThat asks a lot of an instrument. It has to travel, survive set-up and breakdown, and play with the timing and dynamics of a jazz musician.\n\nThe orchestrion stayed with him for many productions. When he last played in Belgium, at BOZAR in Brussels, it was on stage with him.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "The Decap-built instrument from this project in the Herentals workshop before shipping, 4:3",
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
        { label: "Artist", value: "Pat Metheny" },
        { label: "Built by Decap", value: "An orchestrion" },
        { label: "Used in", value: "World tours, many productions" },
        { label: "In Belgium", value: "BOZAR, Brussels" },
      ],
    },
    {
      type: "site_video",
      primary: {
        eyebrow: "Watch",
        title: "The instruments in action",
        video_brief: "Video of Pat Metheny playing with the Decap instrument(s)",
      },
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "Your project",
        title: "Need an acoustic instrument that plays from MIDI?",
        body: "Tell us what it should play and where. We reply with questions and a first idea.",
        primary_cta_label: "Describe your project",
        primary_cta_link: "/contact",
        secondary_cta_label: "Self-playing instruments",
        secondary_cta_link: "/instruments",
        tone: "Dark band",
      },
    },
  ],
};

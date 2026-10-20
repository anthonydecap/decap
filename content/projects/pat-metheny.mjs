/** Work case study (Prismic project "pat-metheny"): the orchestrion Decap built, which Pat Metheny toured the world with. */
export default {
  type: "project",
  uid: "pat-metheny",
  title: "Pat Metheny",
  theme: "decap",
  meta_title: "Pat Metheny and Decap | Work | Decap Herentals",
  meta_description:
    "Decap Herentals built an orchestrion for jazz guitarist Pat Metheny. He took it on world tours in several productions. The story behind the instrument.",
  fields: {
    summary: "An orchestrion built in Herentals, toured around the world in several of his productions.",
    client: "Pat Metheny",
    year: "[TO CHECK: year]",
    location: "[TO CHECK: location]",
  },
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Work",
        title: "An orchestrion for Pat Metheny",
        intro: "We built an orchestrion for Pat Metheny. He took it on tour around the world, in several of his productions. [TO CHECK: which productions and years]",
        primary_cta_label: "All projects",
        primary_cta_link: "/work",
        image_brief: "Pat Metheny with the Decap instrument(s) on stage or in the studio, 4:3 [TO CHECK: photo and usage rights]",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "The project",
        title: "Built to tour the world",
        body:
          "An orchestrion is a band of acoustic instruments played by machine. Pat Metheny plays alongside it on stage: the instruments respond to his playing and his arrangements, night after night, in a different hall every evening.\n\nThat asks a lot of an instrument. It has to travel, survive set-up and breakdown, and play with the timing and dynamics of a jazz musician. [TO CHECK: which instruments were in the orchestrion and how it was controlled]",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "The Decap-built instrument from this project in the Herentals workshop before shipping, 4:3 [TO CHECK: archive photo]",
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
        { label: "Used in", value: "World tours, several productions [TO CHECK: names]" },
      ],
    },
    {
      type: "site_video",
      primary: {
        eyebrow: "Watch",
        title: "The instruments in action",
        video_brief: "Video of Pat Metheny playing with the Decap instrument(s) [TO CHECK: find a video with permission to embed]",
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

/** Work case study (Prismic project "pat-metheny"). Facts are thin: every detail of the Decap contribution is still [TO CHECK]. */
export default {
  type: "project",
  uid: "pat-metheny",
  title: "Pat Metheny",
  theme: "decap",
  meta_title: "Pat Metheny and Decap | Work | Decap Herentals",
  meta_description:
    "Pat Metheny and Decap Herentals: acoustic instruments played by machine, built in our Herentals workshop. [TO CHECK: rewrite once project details are confirmed]",
  fields: {
    summary: "[TO CHECK: one sentence on what Decap built or supplied for Pat Metheny]",
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
        title: "Pat Metheny and Decap",
        intro: "[TO CHECK: one or two sentences on what Decap built or supplied for Pat Metheny, and when]",
        primary_cta_label: "All projects",
        primary_cta_link: "/work",
        image_brief: "Pat Metheny with the Decap instrument(s) on stage or in the studio, 4:3 [TO CHECK: photo and usage rights]",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "The project",
        title: "Acoustic instruments, played by machine",
        body:
          "Pat Metheny's *Orchestrion* project (2010) put acoustic instruments on stage that were played by solenoids and pneumatics.\n\n[TO CHECK: Decap's part in it, if any: which instruments or components came from Herentals, and when]\n\n[TO CHECK: what the brief asked for, and what made it possible, e.g. velocity control, repetition speed]",
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
        { label: "Year", value: "[TO CHECK: year]" },
        { label: "Built by Decap", value: "[TO CHECK: instruments or components supplied]" },
        { label: "Control", value: "[TO CHECK: how the instruments were driven]" },
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

/** Work case study (Prismic project "walter-hus-belem"): Walter Hus, BELEM and The Mekanics; the Decap orchestrion at Flagey. */
export default {
  type: "project",
  uid: "walter-hus-belem",
  title: "Walter Hus, BELEM and The Mekanics",
  theme: "decap",
  meta_title: "Walter Hus, BELEM & The Mekanics | Decap Herentals",
  meta_description:
    "Walter Hus's mechanical orchestra with BELEM (Didier Laloy, Kathy Adam) in The Mekanics, and the Decap orchestrion in concert at Flagey with the Zenne Quartet.",
  fields: {
    summary: "Decap instruments in Walter Hus's mechanical orchestra, for BELEM's The Mekanics and at Flagey.",
    client: "Walter Hus, BELEM",
    year: "[TO CHECK: year]",
    location: "Brussels, Belgium",
  },
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Work",
        title: "A Decap orchestrion with Walter Hus and BELEM",
        intro:
          "Composer Walter Hus plays a mechanical orchestra of Decap instruments. With BELEM, the duo of accordionist Didier Laloy and cellist Kathy Adam, it became *The Mekanics*.",
        primary_cta_label: "Self-playing instruments",
        primary_cta_link: "/instruments",
        secondary_cta_label: "All projects",
        secondary_cta_link: "/work",
        image_brief: "Didier Laloy and Kathy Adam on stage in front of the mechanical orchestra, 4:3 [TO CHECK: photo and usage rights]",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "The Mekanics",
        title: "Accordion, cello and an orguedinateur",
        body:
          "BELEM is accordion and cello. For *The Mekanics*, Walter Hus added his mechanical orchestra, which he calls the *orguedinateur*: an organ and a computer in one word. The result is an album that moves from film music to Balkan rhythms, baroque and jazz.\n\n[TO CHECK: which Decap instruments are in the orguedinateur, and the album release year]",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "The orguedinateur instruments close up, 4:3",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "In concert",
        title: "The Decap orchestrion at Flagey",
        body:
          "At Flagey in Brussels, Walter Hus and the Zenne Quartet gave a concert titled *Decap orchestrion*: a concerto for string quartet and orchestrion. [See the concert on the Flagey website](https://www.flagey.be/en/activity/13535-decap-orchestrion-walter-hus-zenne-quartet-concerto-for-string-quartet-orchestrion). [TO CHECK: concert date]",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        image_brief: "The orchestrion on stage at Flagey with the Zenne Quartet, 4:3 [TO CHECK: photo and usage rights]",
        tone: "Tinted",
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
        { label: "Composer", value: "Walter Hus" },
        { label: "With", value: "BELEM: Didier Laloy (accordion), Kathy Adam (cello)" },
        { label: "Project", value: "The Mekanics" },
        { label: "Concert", value: "Decap orchestrion, Flagey, Brussels, with the Zenne Quartet" },
        { label: "Instruments", value: "[TO CHECK: Decap instruments in the orchestra]" },
      ],
    },
    {
      type: "site_video",
      primary: {
        eyebrow: "Watch",
        title: "The Mekanics, live",
        video_brief: "Live clip of BELEM and Walter Hus with the mechanical orchestra [TO CHECK: video and permission to embed]",
      },
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "For composers",
        title: "Write for acoustic instruments that play from MIDI",
        body: "Tell us what your piece needs. We reply with the instruments that fit and how you drive them from your own setup.",
        primary_cta_label: "Describe your project",
        primary_cta_link: "/contact",
        secondary_cta_label: "See the instruments",
        secondary_cta_link: "/instruments",
        tone: "Dark band",
      },
    },
  ],
};

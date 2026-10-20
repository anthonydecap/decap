/** Work case study (Prismic project "stephan-eicher"): automated instruments for "Stephan Eicher und die Automaten" and the album Ode. */
export default {
  type: "project",
  uid: "stephan-eicher",
  title: "Stephan Eicher und die Automaten",
  theme: "decap",
  meta_title: "Stephan Eicher und die Automaten | Decap Herentals",
  meta_description:
    "Automated acoustic instruments from Decap Herentals for several productions of Stephan Eicher und die Automaten, and his album Ode. Played by MIDI, with dynamics.",
  fields: {
    summary: "Several self-playing instruments for different productions of Stephan Eicher und die Automaten, and his album Ode.",
    client: "Stephan Eicher",
    location: "Europe",
  },
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Work",
        title: "Self-playing instruments on tour with Stephan Eicher",
        intro:
          "For *Stephan Eicher und die Automaten*, the Swiss singer-songwriter is alone on stage with a band of automated acoustic instruments. We built several of those instruments and orchestrion units, for different productions of the show.",
        primary_cta_label: "Self-playing instruments",
        primary_cta_link: "/instruments",
        secondary_cta_label: "All projects",
        secondary_cta_link: "/work",
        image_brief: "Stephan Eicher on stage surrounded by the automated instruments, wide shot, 4:3",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "The brief",
        title: "Instruments that follow the singer",
        body:
          "Stephan Eicher's songs needed instruments with dynamics. Instruments that only switch notes on and off could not follow him. Ours play every note with its own velocity, so the automated band follows the song.\n\nThe show toured widely, from the Bardentreffen festival in Nuremberg to the Rockhal in Esch-sur-Alzette, and the instruments travelled with it: set up, played and packed again in a different venue each time.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "The tour instruments lined up in the Herentals workshop before shipping, 4:3",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "On record",
        title: "Back in the studio for Ode",
        body:
          "Stephan Eicher also used the instruments in the studio, on his album *Ode*.",
        media_side: "Image left",
        aspect: "Square",
        image_brief: "Album cover of Ode next to one of the instruments, square",
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
        { label: "Artist", value: "Stephan Eicher" },
        { label: "Show", value: "Stephan Eicher und die Automaten" },
        { label: "Album", value: "Ode" },
        { label: "Built by Decap", value: "Several instruments and orchestrion units, for different productions" },
        { label: "Control", value: "MIDI, with velocity per note" },
      ],
    },
    {
      type: "site_video",
      primary: {
        eyebrow: "Watch",
        title: "Und die Automaten, live",
        video_brief: "Live clip of Stephan Eicher und die Automaten",
      },
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "On stage",
        title: "Planning a show with self-playing instruments?",
        body: "Tell us the songs, the stage and the tour dates. We reply with the instruments that fit and how they are controlled.",
        primary_cta_label: "Describe your show",
        primary_cta_link: "/contact",
        secondary_cta_label: "See the instruments",
        secondary_cta_link: "/instruments",
        tone: "Dark band",
      },
    },
  ],
};

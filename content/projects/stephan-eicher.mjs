/** Work case study (Prismic project "stephan-eicher"): automated instruments for "Stephan Eicher und die Automaten" and the album Ode. */
export default {
  type: "project",
  uid: "stephan-eicher",
  title: "Stephan Eicher und die Automaten",
  theme: "decap",
  meta_title: "Stephan Eicher und die Automaten | Decap Herentals",
  meta_description:
    "Automated acoustic instruments from Decap Herentals on tour with Stephan Eicher in Und die Automaten, and on his album Ode. Played by MIDI, with real dynamics.",
  fields: {
    summary: "Self-playing acoustic instruments for Stephan Eicher's tour Und die Automaten and his album Ode.",
    client: "Stephan Eicher",
    year: "[TO CHECK: year of the tour]",
    location: "[TO CHECK: tour countries, e.g. Switzerland and France]",
  },
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Work",
        title: "Self-playing instruments on tour with Stephan Eicher",
        intro:
          "For *Stephan Eicher und die Automaten*, the Swiss singer-songwriter shared the stage with automated acoustic instruments from our workshop. They returned on his album *Ode*.",
        primary_cta_label: "Self-playing instruments",
        primary_cta_link: "/instruments",
        secondary_cta_label: "All projects",
        secondary_cta_link: "/work",
        image_brief: "Stephan Eicher on stage surrounded by the automated instruments, wide shot, 4:3 [TO CHECK: photo and usage rights]",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "The brief",
        title: "Instruments that follow the singer",
        body:
          "Stephan Eicher's songs needed instruments with dynamics. Instruments that only switch notes on and off could not follow him. Ours play every note with its own velocity, so the automated band follows the song.\n\nThe instruments were set up and synchronised for his repertoire before the tour. [TO CHECK: which instruments were delivered, e.g. accordion, pipes, percussion, mallet percussion, and how many]",
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
          "Stephan Eicher used the instruments again on his album *Ode*. [TO CHECK: release year, which tracks and which instruments]",
        media_side: "Image left",
        aspect: "Square",
        image_brief: "Album cover of Ode next to one of the instruments, square [TO CHECK: rights to show the cover]",
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
        { label: "Instruments", value: "[TO CHECK: instruments delivered]" },
        { label: "Control", value: "MIDI, with velocity per note" },
      ],
    },
    {
      type: "site_video",
      primary: {
        eyebrow: "Watch",
        title: "Und die Automaten, live",
        video_brief: "Live clip of Stephan Eicher und die Automaten [TO CHECK: official video and permission to embed]",
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

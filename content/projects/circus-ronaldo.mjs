/** Work case study (Prismic project "circus-ronaldo"): a Decap organ in Circus Ronaldo's shows, and Brass Core. */
export default {
  type: "project",
  uid: "circus-ronaldo",
  title: "Circus Ronaldo",
  theme: "decap",
  meta_title: "Circus Ronaldo and Decap Organs | Decap Herentals",
  meta_description:
    "Circus Ronaldo plays a Decap organ in its shows and uses Brass Core from Decap Herentals. See the organ in the ring and what Brass Core adds to a live show.",
  fields: {
    summary: "A Decap organ in the ring, and Brass Core for live brass without a player.",
    client: "Circus Ronaldo",
    year: "[TO CHECK: year]",
    location: "Belgium [TO CHECK]",
  },
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Work",
        title: "A Decap organ in the ring with Circus Ronaldo",
        intro:
          "Circus Ronaldo plays a Decap organ in its shows, built by Tony Decap. The company also uses Brass Core, our robotic brass player. [TO CHECK: organ type, year and which shows]",
        primary_cta_label: "About Brass Core",
        primary_cta_link: "/brass-core",
        secondary_cta_label: "All projects",
        secondary_cta_link: "/work",
        image_brief: "The Decap organ in the Circus Ronaldo tent, performers in front, 4:3 [TO CHECK: photo and usage rights]",
      },
    },
    {
      type: "site_video",
      primary: {
        eyebrow: "Watch",
        title: "Circus Ronaldo with a Tony Decap organ",
        video: "https://www.youtube.com/watch?v=XQf13I7nTdY",
        caption: "Circus Ronaldo with a Tony Decap organ, YouTube.",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Brass Core",
        title: "Live brass, played from an audio signal",
        body:
          "Brass Core puts a real trumpet or trombone on stage and plays it from your own audio or MIDI. A voice-coil motor in a pressure chamber replaces the player's lips, and the instrument's own resonance shapes the tone. No drilling, no changes to the instrument. [TO CHECK: how Circus Ronaldo uses Brass Core in the show]",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        cta_label: "Brass Core — Orchestrionix",
        cta_link: "/brass-core",
        image_brief: "Brass Core mounted on a trumpet, against a dark backdrop, side view, 4:3",
        tone: "Tinted",
      },
    },
    {
      type: "site_quote",
      primary: {
        quote: "[TO CHECK: Circus Ronaldo testimonial, copy exactly from the Brass Core page]",
        name: "Circus Ronaldo",
      },
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "Theatre and circus",
        title: "Acoustic instruments that play the cue on time",
        body: "Tell us about the show and the instruments you need. We reply with what fits and how it connects to your sound desk.",
        primary_cta_label: "Describe your show",
        primary_cta_link: "/contact",
        secondary_cta_label: "Discover Brass Core",
        secondary_cta_link: "/brass-core",
        tone: "Dark band",
      },
    },
  ],
};

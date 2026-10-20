/** Work case study (Prismic project "circus-ronaldo"): a Decap organ in Circus Ronaldo's shows, and Brass Core. */
export default {
  type: "project",
  uid: "circus-ronaldo",
  title: "Circus Ronaldo",
  theme: "decap",
  meta_title: "Circus Ronaldo and Decap Organs | Decap Herentals",
  meta_description:
    "Bespoke instruments from Decap Herentals, built into the sets of several Circus Ronaldo productions, and Brass Core for live brass without a player on stage.",
  fields: {
    summary: "Bespoke instruments built into the sets of several productions, and Brass Core for live brass without a player.",
    client: "Circus Ronaldo",
    location: "Belgium",
  },
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Work",
        title: "Instruments built into the set for Circus Ronaldo",
        intro:
          "For several Circus Ronaldo productions we built fully bespoke instruments, made to sit inside the set itself. The company also uses Brass Core, our robotic brass player.",
        primary_cta_label: "About Brass Core",
        primary_cta_link: "/brass-core",
        secondary_cta_label: "All projects",
        secondary_cta_link: "/work",
        image_brief: "The Decap organ in the Circus Ronaldo tent, performers in front, 4:3",
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
          "Brass Core puts a real trumpet or trombone on stage and plays it from your own audio or MIDI. A voice-coil motor in a pressure chamber replaces the player's lips, and the instrument's own resonance shapes the tone. No drilling, no changes to the instrument.\n\nCircus Ronaldo uses it for its automated brass section.",
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
        quote:
          "The Brass Core has become the beating heart of our automated brass section. We didn't want to just play brass music through the PA - we wanted the audience to feel it, like a real band was right there on stage.\n\nPeople often ask us where the brass band is hiding - that's how convincing it is. It's not just sound. It's presence.",
        role: "On Brass Core",
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

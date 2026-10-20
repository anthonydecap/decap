/** Work case study (Prismic project "circus-ronaldo"), Dutch (nl-be). */
export default {
  type: "project",
  uid: "circus-ronaldo",
  lang: "nl-be",
  title: "Circus Ronaldo",
  theme: "decap",
  meta_title: "Circus Ronaldo en Decap-orgels | Decap Herentals",
  meta_description:
    "Instrumenten op maat van Decap Herentals, ingebouwd in de decors van verschillende producties van Circus Ronaldo, en Brass Core voor live koper zonder muzikant.",
  fields: {
    summary: "Instrumenten op maat, ingebouwd in de decors van verschillende producties, en Brass Core voor live koper zonder muzikant.",
    client: "Circus Ronaldo",
    location: "België",
  },
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Realisaties",
        title: "Instrumenten ingebouwd in het decor voor Circus Ronaldo",
        intro:
          "Voor verschillende producties van Circus Ronaldo bouwden we volledig op maat gemaakte instrumenten, ontworpen om in het decor zelf te passen. Het gezelschap gebruikt ook Brass Core, onze robotische koperblazer.",
        primary_cta_label: "Over Brass Core",
        primary_cta_link: "/brass-core",
        secondary_cta_label: "Alle projecten",
        secondary_cta_link: "/work",
        image_brief: "The Decap organ in the Circus Ronaldo tent, performers in front, 4:3",
      },
    },
    {
      type: "site_video",
      primary: {
        eyebrow: "Bekijk",
        title: "Circus Ronaldo met een orgel van Tony Decap",
        video: "https://www.youtube.com/watch?v=XQf13I7nTdY",
        caption: "Circus Ronaldo met een orgel van Tony Decap, YouTube.",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Brass Core",
        title: "Live koper, gespeeld vanuit een audiosignaal",
        body:
          "Brass Core zet een echte trompet of trombone op het podium en bespeelt die met uw eigen audio of MIDI. Een voice-coilmotor in een drukkamer vervangt de lippen van de muzikant, en de eigen resonantie van het instrument vormt de klank. Geen boorwerk, geen aanpassingen aan het instrument.\n\nCircus Ronaldo gebruikt het voor zijn geautomatiseerde koperblazerssectie.",
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
          "De Brass Core is het kloppende hart van onze geautomatiseerde koperblazerssectie geworden. We wilden niet gewoon kopermuziek door de geluidsinstallatie laten spelen - we wilden dat het publiek het voelde, alsof er echt een band op het podium stond.\n\nMensen vragen ons vaak waar de fanfare zich verstopt - zo overtuigend is het. Het is niet alleen klank. Het is aanwezigheid.",
        role: "Over Brass Core",
        name: "Circus Ronaldo",
      },
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "Theater en circus",
        title: "Akoestische instrumenten die de cue op tijd spelen",
        body: "Vertel ons over de voorstelling en de instrumenten die u nodig hebt. We antwoorden met wat past en hoe het aansluit op uw mengtafel.",
        primary_cta_label: "Beschrijf uw voorstelling",
        primary_cta_link: "/contact",
        secondary_cta_label: "Ontdek Brass Core",
        secondary_cta_link: "/brass-core",
        tone: "Dark band",
      },
    },
  ],
};

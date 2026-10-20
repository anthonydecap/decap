/** Work case study (Prismic project "pat-metheny"), Dutch (nl-be). */
export default {
  type: "project",
  uid: "pat-metheny",
  lang: "nl-be",
  title: "Pat Metheny",
  theme: "decap",
  meta_title: "Pat Metheny en Decap | Realisaties | Decap Herentals",
  meta_description:
    "Decap Herentals bouwde een orchestrion voor jazzgitarist Pat Metheny. Hij toerde ermee de wereld rond in vele producties, ook op zijn laatste concert in België.",
  fields: {
    summary: "Een orchestrion gebouwd in Herentals, waarmee hij in vele van zijn producties de wereld rondtoerde.",
    client: "Pat Metheny",
    location: "Wereldwijd",
  },
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Realisaties",
        title: "Een orchestrion voor Pat Metheny",
        intro: "We bouwden een orchestrion voor Pat Metheny. Hij toerde ermee de wereld rond in vele van zijn producties. Ook op zijn laatste concert in België, in BOZAR in Brussel, stond het op het podium.",
        primary_cta_label: "Alle projecten",
        primary_cta_link: "/work",
        image_brief: "Pat Metheny with the Decap instrument(s) on stage or in the studio, 4:3",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Het project",
        title: "Gebouwd om de wereld rond te toeren",
        body:
          "Een orchestrion is een band van akoestische instrumenten die door een machine bespeeld worden. Pat Metheny speelt er op het podium mee samen: de instrumenten reageren op zijn spel en zijn arrangementen, avond na avond, elke avond in een andere zaal.\n\nDat vraagt veel van een instrument. Het moet kunnen reizen, opbouw en afbraak doorstaan, en spelen met de timing en de dynamiek van een jazzmuzikant.\n\nHet orchestrion bleef vele producties lang bij hem. Toen hij voor het laatst in België speelde, in BOZAR in Brussel, stond het met hem op het podium.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "The Decap-built instrument from this project in the Herentals workshop before shipping, 4:3",
      },
    },
    {
      type: "site_facts",
      primary: {
        eyebrow: "In een oogopslag",
        title: "Projectgegevens",
        layout: "Spec list",
      },
      items: [
        { label: "Artiest", value: "Pat Metheny" },
        { label: "Gebouwd door Decap", value: "Een orchestrion" },
        { label: "Gebruikt in", value: "Wereldtournees, vele producties" },
        { label: "In België", value: "BOZAR, Brussel" },
      ],
    },
    {
      type: "site_video",
      primary: {
        eyebrow: "Bekijk",
        title: "De instrumenten aan het werk",
        video_brief: "Video of Pat Metheny playing with the Decap instrument(s)",
      },
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "Uw project",
        title: "Een akoestisch instrument nodig dat via MIDI speelt?",
        body: "Vertel ons wat het moet spelen en waar. We antwoorden met vragen en een eerste idee.",
        primary_cta_label: "Beschrijf uw project",
        primary_cta_link: "/contact",
        secondary_cta_label: "Zelfspelende instrumenten",
        secondary_cta_link: "/instruments",
        tone: "Dark band",
      },
    },
  ],
};

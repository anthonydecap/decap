/** Work case study (Prismic project "walter-hus-belem"), Dutch (nl-be). */
export default {
  type: "project",
  uid: "walter-hus-belem",
  lang: "nl-be",
  title: "Walter Hus, BELEM en The Mekanics",
  theme: "decap",
  meta_title: "Walter Hus, BELEM & The Mekanics | Decap Herentals",
  meta_description:
    "Het mechanische orkest van Walter Hus met BELEM (Didier Laloy, Kathy Adam) in The Mekanics, en het Decap-orchestrion in concert in Flagey met het Zenne Quartet.",
  fields: {
    summary: "Decap-instrumenten in het mechanische orkest van Walter Hus, voor The Mekanics van BELEM en in Flagey.",
    client: "Walter Hus, BELEM",
    year: "Rond 2017",
    location: "Brussel, België",
  },
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Realisaties",
        title: "Een Decap-orchestrion met Walter Hus en BELEM",
        intro:
          "Componist Walter Hus bespeelt een mechanisch orkest van Decap-instrumenten: verplaatsbare pijpunits, een slagwerkunit en een accordeon, gebouwd rond 2017. Met BELEM, het duo van accordeonist Didier Laloy en celliste Kathy Adam, werd het *The Mekanics*.",
        primary_cta_label: "Zelfspelende instrumenten",
        primary_cta_link: "/instruments",
        secondary_cta_label: "Alle projecten",
        secondary_cta_link: "/work",
        image_brief: "Didier Laloy and Kathy Adam on stage in front of the mechanical orchestra, 4:3",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "The Mekanics",
        title: "Accordeon, cello en een orguedinateur",
        body:
          "BELEM is accordeon en cello. Voor *The Mekanics* voegde Walter Hus zijn mechanische orkest toe, dat hij de *orguedinateur* noemt: een orgel en een computer in één woord. Het resultaat is een album dat gaat van filmmuziek over Balkanritmes tot barok en jazz.\n\nDe pijpunits zijn gebouwd om te reizen, zodat het orkest met de muzikanten op tournee gaat.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "The orguedinateur instruments close up, 4:3",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "In concert",
        title: "Het Decap-orchestrion in Flagey",
        body:
          "In Flagey in Brussel gaven Walter Hus en het Zenne Quartet een concert met de titel *Decap orchestrion*: een concerto voor strijkkwartet en orchestrion. [Bekijk het concert op de website van Flagey](https://www.flagey.be/en/activity/13535-decap-orchestrion-walter-hus-zenne-quartet-concerto-for-string-quartet-orchestrion).",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        image_brief: "The orchestrion on stage at Flagey with the Zenne Quartet, 4:3",
        tone: "Tinted",
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
        { label: "Componist", value: "Walter Hus" },
        { label: "Met", value: "BELEM: Didier Laloy (accordeon), Kathy Adam (cello)" },
        { label: "Project", value: "The Mekanics" },
        { label: "Concert", value: "Decap orchestrion, Flagey, Brussel, met het Zenne Quartet" },
        { label: "Gebouwd door Decap", value: "Verplaatsbare pijpunits, een slagwerkunit en een accordeon" },
        { label: "Gebouwd", value: "Rond 2017" },
      ],
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "Bekijk",
        title: "The Mekanics, live",
        body: "BELEM en Walter Hus met het mechanische orkest. De video speelt op YouTube.",
        primary_cta_label: "Bekijk op YouTube",
        primary_cta_link: "https://www.youtube.com/watch?v=uIrJGwcmgwY",
        tone: "Tinted",
      },
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "Voor componisten",
        title: "Schrijf voor akoestische instrumenten die via MIDI spelen",
        body: "Vertel ons wat uw stuk nodig heeft. We antwoorden met de instrumenten die passen en hoe u ze vanuit uw eigen opstelling aanstuurt.",
        primary_cta_label: "Beschrijf uw project",
        primary_cta_link: "/contact",
        secondary_cta_label: "Bekijk de instrumenten",
        secondary_cta_link: "/instruments",
        tone: "Dark band",
      },
    },
  ],
};

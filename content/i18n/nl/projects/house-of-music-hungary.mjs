/** Work case study (Prismic project "house-of-music-hungary"), Dutch (nl-be). */
export default {
  type: "project",
  uid: "house-of-music-hungary",
  lang: "nl-be",
  title: "House of Music Hungary: Creative Sound Space",
  theme: "decap",
  meta_title: "Robotorkest, House of Music Hungary | Decap",
  meta_description:
    "Een robotorkest van Decap Herentals voor de Creative Sound Space in het House of Music Hungary, Boedapest, met Medence Design. Speelt in Robotorgona-concerten.",
  fields: {
    summary: "Automatische instrumenten voor het robotorkest in de Creative Sound Space, met Medence Design.",
    client: "House of Music Hungary, met Medence Design",
    year: "2022",
    location: "Boedapest, Hongarije",
  },
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Realisaties · Boedapest",
        title: "Een robotorkest voor het House of Music Hungary",
        intro:
          "De Creative Sound Space in het House of Music Hungary in Boedapest telt acht installaties over klank, ontworpen door Medence Design. Een ervan is een robotorkest, opgebouwd uit onze automatische instrumenten.",
        primary_cta_label: "Zelfspelende instrumenten",
        primary_cta_link: "/instruments",
        secondary_cta_label: "Alle projecten",
        secondary_cta_link: "/work",
        note: "Foto's: Mohai Balázs, 2022",
        image_brief: "The robot orchestra in the Creative Sound Space, wide shot with visitors, 4:3 (photo Mohai Balázs)",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Het project",
        title: "Acht installaties, één robotorkest",
        body:
          "Medence Design ontwierp de Creative Sound Space als acht installaties waarin bezoekers klank ontdekken. Wij bouwden bijna alle instrumenten van de interactieve ruimte, het robotorkest inbegrepen. De sturingssoftware van de ruimte werd door anderen gemaakt.\n\nDe ruimte is open sinds 2022.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "Close-up of the marimba and glockenspiel of the robot orchestra, 4:3 (photo Mohai Balázs)",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "In concert",
        title: "Robotorgona: concerten voor het robotorkest",
        body:
          "Het House of Music Hungary organiseert *Robotorgona*-concerten in de Creative Sound Space. Het orkest wordt door een computer aangestuurd en speelt:",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        image_brief: "Audience at a Robotorgona concert in front of the robot orchestra, 4:3 (photo Mohai Balázs)",
        tone: "Tinted",
      },
      items: [
        { point: "Marimba" },
        { point: "Accordeon" },
        { point: "Pianino" },
        { point: "Klokkenspel" },
        { point: "Drums" },
        { point: "Een orgel met winddruk op afstand geregeld" },
      ],
    },
    {
      type: "site_facts",
      primary: {
        eyebrow: "In een oogopslag",
        title: "Projectgegevens",
        layout: "Spec list",
      },
      items: [
        { label: "Locatie", value: "House of Music Hungary, Boedapest" },
        { label: "Tentoonstellingsontwerp", value: "Medence Design" },
        { label: "Ruimte", value: "Creative Sound Space, acht installaties" },
        { label: "Open sinds", value: "2022" },
        { label: "Instrumenten", value: "Marimba, accordeon, pianino, klokkenspel, drums, orgel" },
      ],
    },
    {
      type: "site_video",
      primary: {
        eyebrow: "Bekijk",
        title: "Het robotorkest aan het werk",
        video_brief: "Clip of a Robotorgona concert in the Creative Sound Space",
      },
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "Musea en tentoonstellingen",
        title: "Plant u een installatie met zelfspelende instrumenten?",
        body: "Vertel ons over de ruimte, de bezoekers en wat ze moeten horen. We antwoorden met de instrumenten die passen en hoe ze worden aangestuurd.",
        primary_cta_label: "Beschrijf uw installatie",
        primary_cta_link: "/contact",
        secondary_cta_label: "Bekijk de instrumenten",
        secondary_cta_link: "/instruments",
        tone: "Dark band",
      },
    },
  ],
};

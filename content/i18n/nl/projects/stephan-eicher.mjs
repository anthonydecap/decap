/** Work case study (Prismic project "stephan-eicher"), Dutch (nl-be). */
export default {
  type: "project",
  uid: "stephan-eicher",
  lang: "nl-be",
  title: "Stephan Eicher und die Automaten",
  theme: "decap",
  meta_title: "Stephan Eicher und die Automaten | Decap Herentals",
  meta_description:
    "Automatische akoestische instrumenten van Decap Herentals voor producties van Stephan Eicher und die Automaten, en zijn album Ode. Via MIDI, met dynamiek.",
  fields: {
    summary: "Verschillende zelfspelende instrumenten voor diverse producties van Stephan Eicher und die Automaten, en zijn album Ode.",
    client: "Stephan Eicher",
    location: "Europa",
  },
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Realisaties",
        title: "Zelfspelende instrumenten op tournee met Stephan Eicher",
        intro:
          "In *Stephan Eicher und die Automaten* staat de Zwitserse singer-songwriter alleen op het podium met een band van automatische akoestische instrumenten. We bouwden verschillende van die instrumenten en orchestrionunits, voor diverse producties van de voorstelling.",
        primary_cta_label: "Zelfspelende instrumenten",
        primary_cta_link: "/instruments",
        secondary_cta_label: "Alle projecten",
        secondary_cta_link: "/work",
        image_brief: "Stephan Eicher on stage surrounded by the automated instruments, wide shot, 4:3",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "De opdracht",
        title: "Instrumenten die de zanger volgen",
        body:
          "De liedjes van Stephan Eicher vroegen om instrumenten met dynamiek. Instrumenten die noten alleen aan- en uitzetten, konden hem niet volgen. Die van ons spelen elke noot met een eigen velocity, zodat de automatische band het lied volgt.\n\nDe voorstelling toerde ver, van het Bardentreffen-festival in Neurenberg tot de Rockhal in Esch-sur-Alzette, en de instrumenten reisden mee: opgebouwd, bespeeld en weer ingepakt, telkens op een andere locatie.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "The tour instruments lined up in the Herentals workshop before shipping, 4:3",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Op plaat",
        title: "Terug in de studio voor Ode",
        body:
          "Stephan Eicher gebruikte de instrumenten ook in de studio, op zijn album *Ode*.",
        media_side: "Image left",
        aspect: "Square",
        image_brief: "Album cover of Ode next to one of the instruments, square",
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
        { label: "Artiest", value: "Stephan Eicher" },
        { label: "Voorstelling", value: "Stephan Eicher und die Automaten" },
        { label: "Album", value: "Ode" },
        { label: "Gebouwd door Decap", value: "Verschillende instrumenten en orchestrionunits, voor diverse producties" },
        { label: "Sturing", value: "MIDI, met velocity per noot" },
      ],
    },
    {
      type: "site_video",
      primary: {
        eyebrow: "Bekijk",
        title: "Und die Automaten, live",
        video_brief: "Live clip of Stephan Eicher und die Automaten",
      },
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "Op het podium",
        title: "Plant u een voorstelling met zelfspelende instrumenten?",
        body: "Vertel ons de liedjes, het podium en de tourdata. We antwoorden met de instrumenten die passen en hoe ze worden aangestuurd.",
        primary_cta_label: "Beschrijf uw voorstelling",
        primary_cta_link: "/contact",
        secondary_cta_label: "Bekijk de instrumenten",
        secondary_cta_link: "/instruments",
        tone: "Dark band",
      },
    },
  ],
};

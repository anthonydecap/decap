/** Work case study (Prismic project "yves-rechsteiner"), Dutch (nl-be). */
export default {
  type: "project",
  uid: "yves-rechsteiner",
  lang: "nl-be",
  title: "Yves Rechsteiner: L'Explorateur",
  theme: "decap",
  meta_title: "L'Explorateur, mobiel concertorgel | Decap Herentals",
  meta_description:
    "L'Explorateur, het mobiele concertorgel van Yves Rechsteiner: een verplaatsbaar pijporgel met SmartValve op elke pijp, de eerste windsynthesizer. Uit 2025.",
  fields: {
    summary: "Een verplaatsbaar concertorgel met SmartValve op elke pijp, voor organist Yves Rechsteiner.",
    client: "Yves Rechsteiner",
    year: "2025",
    location: "Toulouse, Frankrijk",
  },
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Realisaties · 2025",
        title: "L'Explorateur: een mobiel concertorgel met SmartValve op elke pijp",
        intro:
          "De Zwitserse organist Yves Rechsteiner wilde een orgel dat hij kon meenemen naar zalen die er geen hebben. We bouwden L'Explorateur: een verplaatsbaar pijporgel waarin elke pijp zijn eigen SmartValve heeft. Het resultaat is 's werelds eerste windsynthesizer.",
        primary_cta_label: "Over SmartValve",
        primary_cta_link: "/smartvalve",
        secondary_cta_label: "Alle projecten",
        secondary_cta_link: "/work",
        image_brief: "L'Explorateur set up in a chapel, Yves Rechsteiner at the console, wide shot, 4:3",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "De opdracht",
        title: "Een orgel dat naar het publiek reist",
        body:
          "Veel concertzalen hebben geen pijporgel, en een kerkorgel kan zijn kerk niet verlaten. Yves Rechsteiner vroeg een instrument dat hij kon vervoeren, opstellen en bespelen waar het concert ook plaatsvindt.\n\nWe ontwierpen L'Explorateur eerst in 3D, zodat elk detail van de kast en de pijpopstelling vastlag voordat de productie startte.\n\nHet orgel is modulair en heeft dus geen vast aantal pijpen: het wordt samengesteld voor elk programma en elke zaal. De thuisbasis is Toulouse.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "3D render of L'Explorateur next to a photo of the finished organ, 4:3",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "De techniek",
        title: "Elke pijp met een eigen ventiel en processor",
        body:
          "Een traditioneel orgelventiel is open of dicht. In L'Explorateur heeft elke pijp zijn eigen SmartValve, die de luchtstroom meer dan 1.000 keer per seconde regelt. Dat geeft de organist controle over elke afzonderlijke noot:",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        cta_label: "Hoe SmartValve werkt",
        cta_link: "/smartvalve",
        image_brief: "Close-up of the SmartValves under the pipes inside L'Explorateur, dark background, 4:3",
        tone: "Tinted",
      },
      items: [
        { point: "Winddruk van 0 tot 200%, opgeslagen per pijp" },
        { point: "Reactietijd van 4 ms, met PID-terugkoppeling" },
        { point: "Vibrato, slope, decay en LFO-effecten per noot" },
        { point: "Optische MIDI: 100 keer de MIDI-snelheid, over kabels van 200 m en meer" },
      ],
    },
    {
      type: "site_quote",
      primary: {
        quote:
          "“…een modulair orgel… ontwikkeld door Tony Decap”, waarvan de ventieltechniek “van een pijporgel in wezen een fysieke synthesizer maakt”.",
        name: "Studio 31, Basel",
        role: "Over L'Explorateur",
      },
    },
    {
      type: "site_facts",
      primary: {
        eyebrow: "In een oogopslag",
        title: "L'Explorateur",
        layout: "Spec list",
      },
      items: [
        { label: "Organist", value: "Yves Rechsteiner" },
        { label: "Voltooid", value: "2025" },
        { label: "Type", value: "Verplaatsbaar, modulair concertorgel" },
        { label: "Thuisbasis", value: "Toulouse" },
        { label: "Pijpsturing", value: "SmartValve op elke pijp" },
        { label: "Ventielregeling", value: "Meer dan 1.000 keer per seconde" },
        { label: "Drukbereik", value: "0–200%, per pijp" },
        { label: "In concert", value: "Lyon, Chapelle de la Trinité, 14 november 2025" },
      ],
    },
    {
      type: "site_video",
      primary: {
        eyebrow: "Luister",
        title: "L'Explorateur in concert",
        video_brief:
          "Video of Yves Rechsteiner playing L'Explorateur in concert, e.g. Lyon, Chapelle de la Trinité",
      },
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "SmartValve voor uw orgel",
        title: "Geef elke pijp zijn eigen dynamiek",
        body: "SmartValve werkt in nieuwe orgels en in onze instrumenten. Vertel ons over uw orgel en we zeggen u wat er mogelijk is.",
        primary_cta_label: "Ontdek SmartValve",
        primary_cta_link: "/smartvalve",
        secondary_cta_label: "Vraag een adviesgesprek aan",
        secondary_cta_link: "/contact",
        tone: "Dark band",
      },
    },
  ],
};

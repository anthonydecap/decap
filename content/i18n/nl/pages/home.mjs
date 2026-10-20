/** Home page (Prismic page "home"), Dutch (nl-be). */
export default {
  type: "page",
  uid: "home",
  lang: "nl-be",
  title: "Decap Herentals",
  theme: "decap",
  meta_title: "Dansorgels & zelfspelende instrumenten | Decap",
  meta_description:
    "Orgelbouwers sinds 1895. Decap Herentals bouwt dansorgels, kermisorgels en straatorgels, zelfspelende accordeons en de MIDI-techniek die ze aanstuurt.",
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Orgelbouwers sinds 1895",
        title: "Dansorgels en zelfspelende instrumenten, gemaakt in Herentals",
        intro:
          "Orgels en zelfspelende instrumenten voor thuis, cafés, bars en danszalen, gebouwd door vier generaties van de familie Decap in één werkplaats in Herentals.",
        primary_cta_label: "Ontdek onze orgels",
        primary_cta_link: "/organs",
        secondary_cta_label: "Zelfspelende instrumenten",
        secondary_cta_link: "/instruments",
        image_brief: "Tony Decap in the Herentals workshop next to a finished organ façade, portrait 4:5",
      },
    },
    {
      type: "site_card_grid",
      primary: {
        eyebrow: "Waar ze spelen",
        title: "In woonkamers, bars en danszalen",
        intro: "De meeste Decap-orgels en -instrumenten zijn in handen van particulieren. Ze spelen thuis, in een café of bar, in een danszaal, over de hele wereld.",
        columns: "4",
        card_style: "Image cards",
      },
      items: [
        { title: "Thuis", body: "Een Accordion Pedestal in de woonkamer, of een volledig orchestrion in de verzamelruimte.", image_brief: "Accordion Pedestal in a living room at a customer's home, warm evening light, 4:3" },
        { title: "Bars en cafés", body: "Een dansorgel of orchestrion dat mensen binnenlokt en de hele avond zelf speelt.", image_brief: "Decap organ in a café or bar with guests, 4:3" },
        { title: "Danszalen en evenementen", body: "Orgels met regelbaar volume die bij de ruimte passen, van een kleine zaal tot een festival.", image_brief: "Dance organ in a dance hall during an evening, 4:3" },
        { title: "Musea en podia", body: "Collecties, tentoonstellingen en artiesten op tournee: bekijk ons [werk](/work).", image_brief: "Decap orchestrion in a museum or on a stage, 4:3" },
      ],
    },
    {
      type: "site_card_grid",
      primary: {
        eyebrow: "Wat we maken",
        title: "Van een volledig dansorgel tot één register orgelpijpen",
        columns: "2",
        card_style: "Image cards",
      },
      items: [
        {
          title: "Nieuwe orgels",
          body: "Dansorgels, kermisorgels, straatorgels en concertorgels. Vertrek van onze beproefde modules of laat elk detail voor u ontwerpen.",
          link_label: "Orgels",
          link: "/organs",
          image_brief: "A finished Decap dance organ façade, front view, 4:3",
        },
        {
          title: "Zelfspelende instrumenten",
          body: "Een echt accordeon, pijpen, drums en xylofoons, aangestuurd via MIDI. Muziekbibliotheek inbegrepen, klaar om te spelen.",
          link_label: "Instrumenten",
          link: "/instruments",
          image_brief: "Accordion Pedestal and Percussion Unit side by side, black backdrop, 4:3",
        },
        {
          title: "SmartValve",
          body: "Eén ventiel en één processor voor elke pijp. Elke noot krijgt zijn eigen winddruk, dynamiek en vibrato.",
          link_label: "SmartValve",
          link: "/smartvalve",
          image_brief: "Close-up of a row of SmartValves on a wind chest, dark background, 4:3",
        },
        {
          title: "Restauratie en MIDI-ombouw",
          body: "Historische orgels gerestaureerd door Atelier Frank Decap, met onze MIDI-units als u zowel boek als MIDI wilt.",
          link_label: "Atelier Frank Decap",
          link: "/frank-decap",
          image_brief: "Hands repairing the bellows of a historic organ, warm light, 4:3",
        },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Orgelpijpen",
        title: "Bijna elke houten orgelpijp, verzendklaar binnen een week",
        body:
          "Wij zijn het enige bedrijf ter wereld dat de CNC-productie van orgelpijpen zelf heeft ontwikkeld. Onze standaardmensuren of uw eigen maten, in 3D getekend en gefreesd op onze eigen CNC.\n\nVoor een doe-het-zelfproject, een extra register voor uw orgel, of een volledige set pijpen met windladen.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        cta_label: "Orgelpijpen bestellen",
        cta_link: "/organ-pipes",
        image_brief: "Looping clip (mp4, 10–15 s): the CNC milling a pipe, then a row of finished pipes. Until then a photo of new pipes on the workbench, 4:3.",
        tone: "Dark band",
      },
      items: [
        { point: "Klaar in enkele dagen tot een week, afhankelijk van de registers" },
        { point: "Standaardmensuren of uw eigen maten" },
        { point: "Geïntoneerd, of klaar om zelf te intoneren" },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Het aantal toetsen is geen grens",
        title: "Een orgel met 105 toetsen dat muziek voor 121 toetsen speelt",
        body:
          "Elk nieuw Decap-orgel wordt geleverd met onze Virtual Orchestrion-speler. Vraagt een arrangement registers die uw orgel niet heeft, dan voegt de speler ze virtueel toe, met samples die we in onze eigen werkplaats hebben opgenomen.\n\nZo kiest u het orgel dat bij uw ruimte en budget past, niet het orgel dat bij uw repertoire past.",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        cta_label: "Over Virtual Orchestrion",
        cta_link: "/virtual-orchestrion",
        image_brief: "Virtual Orchestrion on a touchscreen next to an organ, showing the animated book view, 4:3",
        tone: "Tinted",
      },
    },
    {
      type: "site_timeline",
      primary: {
        eyebrow: "Sinds 1895",
        title: "Elke generatie heeft het orgel opnieuw uitgevonden",
        intro:
          "Aloïs Decap begon met een handvol verhuurde orgels. Zijn zoon Frans richtte Decap Herentals op. François maakte de stap naar digitaal, Tony bracht MIDI en SmartValve. [Lees het volledige verhaal](/about).",
      },
      items: [
        { year: "1895", title: "Aloïs Decap begint met orgels", body: "Hij verhuurt en verhandelt kleine orgels in de streek van Antwerpen en levert ze met de hondenkar." },
        { year: "1933", title: "Frans Decap richt Decap Herentals op", body: "Hetzelfde jaar verschijnen de eerste zelfspelende accordeons op Decap-orgels.", highlight: true },
        { year: "1977", title: "Het eerste digitale dansorgel", body: "François vervangt de pijpen door digitale klank, zodat ook cafés en danszalen met een kleiner budget een orgel kunnen hebben." },
        { year: "2000", title: "MIDI doet zijn intrede in het dansorgel", body: "Tony Decap zet een volledige muziekbibliotheek op één kaart, in plaats van rekken vol kartonnen orgelboeken." },
        { year: "2016", title: "Pijpen van onze eigen CNC", body: "We frezen orgelpijpen op een 5-assige CNC met PipeCreator, software die we zelf hebben geschreven." },
        { year: "2025", title: "De eerste windsynthesizer", body: "SmartValve in een verplaatsbaar kerkorgel: elke pijp afzonderlijk aangestuurd.", highlight: true },
      ],
    },
    {
      type: "home_artists",
      copyItemsFrom: { type: "page", uid: "home" },
      primary: {
        title: "Ook op het podium",
        description: "Onze orgels en instrumenten spelen vooral thuis, in bars en in danszalen. Deze artiesten nemen ze mee op het podium.",
      },
      items: [
        { artist_name: "Pat Metheny" },
        { artist_name: "Walter Hus" },
        { artist_name: "Circus Ronaldo" },
      ],
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "Plant u een orgel?",
        title: "Vertel ons waar het zal spelen",
        body: "Kies een basisontwerp en enkele opties in de Organ Composer. We antwoorden met vragen en een eerste idee, vrijblijvend.",
        primary_cta_label: "Stel uw orgel samen",
        primary_cta_link: "/organ-composer",
        secondary_cta_label: "Contacteer de werkplaats",
        secondary_cta_link: "/contact",
        tone: "Dark band",
      },
    },
  ],
};

/** Home page (Prismic page "home", replaces the placeholder slices). German. */
export default {
  type: "page",
  uid: "home",
  lang: "de-de",
  title: "Decap Herentals",
  theme: "decap",
  meta_title: "Tanzorgeln & selbstspielende Instrumente | Decap",
  meta_description:
    "Orgelbauer seit 1895. Decap Herentals baut Tanzorgeln, Jahrmarktorgeln, Straßenorgeln, selbstspielende Akkordeons und die MIDI-Technik, die sie steuert.",
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Orgelbauer seit 1895",
        title: "Tanzorgeln und selbstspielende Musikinstrumente aus Herentals",
        intro:
          "Orgeln und selbstspielende Musikinstrumente für Zuhause, Cafés, Bars und Tanzsäle, gebaut von vier Generationen der Familie Decap in einer Werkstatt in Herentals, Belgien.",
        primary_cta_label: "Unsere Orgeln entdecken",
        primary_cta_link: "/organs",
        secondary_cta_label: "Selbstspielende Instrumente",
        secondary_cta_link: "/instruments",
        image_brief: "Tony Decap in the Herentals workshop next to a finished organ façade, portrait 4:5",
      },
    },
    {
      type: "site_card_grid",
      primary: {
        eyebrow: "Wo sie spielen",
        title: "In Wohnzimmern, Bars und Tanzsälen",
        intro: "Die meisten Decap-Orgeln und -Instrumente gehören Privatleuten. Sie spielen zu Hause, in einem Café oder einer Bar, in einem Tanzsaal, auf der ganzen Welt.",
        columns: "4",
        card_style: "Image cards",
      },
      items: [
        { title: "Zu Hause", body: "Ein Accordion Pedestal im Wohnzimmer oder ein komplettes Orchestrion im Sammlungsraum.", image_brief: "Accordion Pedestal in a living room at a customer's home, warm evening light, 4:3" },
        { title: "Bars und Cafés", body: "Eine Tanzorgel oder ein Orchestrion, das Gäste anzieht und den ganzen Abend von selbst spielt.", image_brief: "Decap organ in a café or bar with guests, 4:3" },
        { title: "Tanzsäle und Veranstaltungen", body: "Orgeln mit regelbarer Lautstärke, die zum Raum passen, vom kleinen Saal bis zum Festival.", image_brief: "Dance organ in a dance hall during an evening, 4:3" },
        { title: "Museen und Bühnen", body: "Sammlungen, Ausstellungen und Künstler auf Tournee: zu unseren [Projekten](/work).", image_brief: "Decap orchestrion in a museum or on a stage, 4:3" },
      ],
    },
    {
      type: "site_card_grid",
      primary: {
        eyebrow: "Was wir bauen",
        title: "Von der kompletten Tanzorgel bis zu einem einzelnen Register Orgelpfeifen",
        columns: "2",
        card_style: "Image cards",
      },
      items: [
        {
          title: "Neue Orgeln",
          body: "Tanzorgeln, Jahrmarktorgeln, Straßenorgeln und Konzertorgeln. Sie starten mit unseren bewährten Modulen oder lassen jedes Detail für sich entwerfen.",
          link_label: "Orgeln",
          link: "/organs",
          image_brief: "A finished Decap dance organ façade, front view, 4:3",
        },
        {
          title: "Selbstspielende Instrumente",
          body: "Ein echtes Akkordeon, Pfeifen, Schlagzeug und Xylophone, gespielt über MIDI. Musikbibliothek inbegriffen, spielbereit.",
          link_label: "Instrumente",
          link: "/instruments",
          image_brief: "Accordion Pedestal and Percussion Unit side by side, black backdrop, 4:3",
        },
        {
          title: "SmartValve",
          body: "Ein Ventil und ein Prozessor für jede Pfeife. Jeder Ton erhält seinen eigenen Winddruck, seine Dynamik und sein Vibrato.",
          link_label: "SmartValve",
          link: "/smartvalve",
          image_brief: "Close-up of a row of SmartValves on a wind chest, dark background, 4:3",
        },
        {
          title: "Orgelrestaurierung und MIDI-Umbau",
          body: "Historische Orgeln, restauriert von Atelier Frank Decap, mit unseren MIDI-Umbaueinheiten, wenn Sie Notenbuch und MIDI zugleich möchten.",
          link_label: "Atelier Frank Decap",
          link: "/frank-decap",
          image_brief: "Hands repairing the bellows of a historic organ, warm light, 4:3",
        },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Orgelpfeifen",
        title: "Fast jede Holzpfeife, versandbereit innerhalb einer Woche",
        body:
          "Wir sind das einzige Unternehmen der Welt, das die CNC-Fertigung von Orgelpfeifen selbst entwickelt hat. Unsere Standardmensuren oder Ihre eigenen Maße, in 3D gezeichnet und auf unserer eigenen CNC gefräst.\n\nFür ein Selbstbauprojekt, ein zusätzliches Register für Ihre Orgel oder einen kompletten Satz Pfeifen mit Windladen.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        cta_label: "Orgelpfeifen bestellen",
        cta_link: "/organ-pipes",
        image_brief: "Looping clip (mp4, 10–15 s): the CNC milling a pipe, then a row of finished pipes. Until then a photo of new pipes on the workbench, 4:3.",
        tone: "Dark band",
      },
      items: [
        { point: "Fertig in wenigen Tagen bis einer Woche, je nach Register" },
        { point: "Standardmensuren oder Ihre eigenen Maße" },
        { point: "Intoniert oder bereit, von Ihnen intoniert zu werden" },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Tasten sind keine Grenze",
        title: "Eine Orgel mit 105 Tasten, die Musik für 121 Tasten spielt",
        body:
          "Jede neue Decap-Orgel wird mit unserem Virtual-Orchestrion-Player geliefert. Verlangt ein Arrangement Register, die Ihre Orgel nicht hat, ergänzt der Player sie virtuell, mit Samples, die wir in unserer eigenen Werkstatt aufgenommen haben.\n\nSo wählen Sie die Orgel, die zu Ihrem Raum und Budget passt, nicht die, die zu Ihrem Repertoire passt.",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        cta_label: "Mehr über Virtual Orchestrion",
        cta_link: "/virtual-orchestrion",
        image_brief: "Virtual Orchestrion on a touchscreen next to an organ, showing the animated book view, 4:3",
        tone: "Tinted",
      },
    },
    {
      type: "site_timeline",
      primary: {
        eyebrow: "Seit 1895",
        title: "Jede Generation hat die Orgel neu erfunden",
        intro:
          "Aloïs Decap begann mit einer Handvoll Mietorgeln. Sein Sohn Frans gründete Decap Herentals. François machte die Orgel digital, Tony brachte MIDI und SmartValve. [Die ganze Geschichte lesen](/about).",
      },
      items: [
        { year: "1895", title: "Aloïs Decap beginnt mit Orgeln", body: "Er vermietet kleine Orgeln rund um Antwerpen, handelt mit ihnen und liefert sie mit dem Hundekarren aus." },
        { year: "1933", title: "Frans Decap gründet Decap Herentals", body: "Im selben Jahr erscheinen die ersten selbstspielenden Akkordeons auf Decap-Orgeln.", highlight: true },
        { year: "1977", title: "Die erste digitale Tanzorgel", body: "François ersetzt Pfeifen durch digitalen Klang. So können sich auch Cafés und Tanzsäle mit kleinerem Budget eine Orgel leisten." },
        { year: "2000", title: "MIDI kommt zur Tanzorgel", body: "Tony Decap bringt eine ganze Musikbibliothek auf eine einzige Karte, statt Regalen voller Kartonnoten." },
        { year: "2016", title: "Pfeifen von unserer eigenen CNC", body: "Wir fräsen Orgelpfeifen auf 5-Achs-CNC mit PipeCreator, einer Software, die wir selbst geschrieben haben." },
        { year: "2025", title: "Der erste Windsynthesizer", body: "SmartValve in einer transportablen Kirchenorgel: jede Pfeife einzeln gesteuert.", highlight: true },
      ],
    },
    {
      type: "home_artists",
      copyItemsFrom: { type: "page", uid: "home" },
      primary: {
        title: "Auch auf der Bühne zu hören",
        description: "Unsere Orgeln und Instrumente spielen meist in Wohnungen, Bars und Tanzsälen. Diese Künstler nehmen sie mit auf die Bühne.",
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
        eyebrow: "Sie planen eine Orgel?",
        title: "Sagen Sie uns, wo sie spielen wird",
        body: "Wählen Sie im Organ Composer einen Ausgangsentwurf und ein paar Optionen. Wir antworten mit Fragen und einer ersten Idee, unverbindlich.",
        primary_cta_label: "Orgel zusammenstellen",
        primary_cta_link: "/organ-composer",
        secondary_cta_label: "Werkstatt kontaktieren",
        secondary_cta_link: "/contact",
        tone: "Dark band",
      },
    },
  ],
};

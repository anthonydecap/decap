/** Orchestrionix landing page (Prismic page "orchestrionix"): receives all orchestrionix.com visitors. German. */
export default {
  type: "page",
  uid: "orchestrionix",
  lang: "de-de",
  title: "Orchestrionix",
  theme: "orchestrionix",
  meta_title: "Orchestrionix: Robotische Instrumente | Decap Herentals",
  meta_description:
    "Orchestrionix ist die Decap-Linie robotischer Instrumente für Musiker. Ohne Musikbibliothek: Sie spielen sie mit Ihrem eigenen Audio. Heute: Brass Core.",
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Orchestrionix von Decap",
        title: "Orchestrionix: robotische Instrumente für Musiker",
        intro:
          "Orchestrionix ist die Decap-Linie robotischer Instrumente für Musiker, gebaut in unserer Werkstatt in Herentals. Früher hatte sie eine eigene Website; heute ist decap.be das Zuhause von beiden. Die Linie umfasst heute **Brass Core**: echter Trompeten- oder Posaunenklang, gesteuert von Ihrem eigenen Audiosignal.",
        primary_cta_label: "Brass Core entdecken",
        primary_cta_link: "/brass-core",
        secondary_cta_label: "Selbstspielende Instrumente",
        secondary_cta_link: "/instruments",
        image_brief: "Brass Core clamped to a trumpet on a stand, dark backdrop, low side light catching the brass, portrait 4:5",
        tone: "Dark band",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Der Unterschied",
        title: "Keine Musikbibliothek. Die Musik kommt von Ihnen.",
        body:
          "Unsere selbstspielenden Instrumente werden mit Player und Musik geliefert. Orchestrionix-Instrumente nicht. Sie sind Werkzeuge für Musiker, Sounddesigner und Veranstaltungsorte, die ein echtes akustisches Instrument mit eigenem Material spielen lassen möchten.\n\nBrass Core nimmt ein Audiosignal mit Line-Pegel auf, aus einer Aufnahme oder aus MIDI über den Sampler oder Synthesizer Ihrer Wahl. Ein Schwingspulenmotor verwandelt dieses Signal am Mundstück in Luftschwingungen, und das Blechblasinstrument selbst formt den Ton. Kein Bohren, keine Veränderung am Instrument.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        cta_label: "Technische Daten von Brass Core",
        cta_link: "/brass-core",
        image_brief: "Close-up of Brass Core on a trombone mouthpiece with its audio cable plugged in, dark backdrop, 4:3",
      },
    },
    {
      type: "site_card_grid",
      primary: {
        eyebrow: "Sie kommen von orchestrionix.com?",
        title: "Hier finden Sie jetzt alles",
        intro: "Alles von der alten Orchestrionix-Website finden Sie jetzt auf decap.be.",
        columns: "2",
        card_style: "Text cards",
      },
      items: [
        {
          title: "SmartValve",
          body: "SmartValve ist ein Decap-Produkt: ein Ventil und ein Prozessor für jede einzelne Orgelpfeife.",
          link_label: "SmartValve",
          link: "/smartvalve",
        },
        {
          title: "Selbstspielende Instrumente",
          body: "Accordion Pedestal und Cube, Pipes, Percussion Unit, Mallet Percussion und Bellow Organ.",
          link_label: "Instrumente",
          link: "/instruments",
        },
      ],
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "Orchestrionix Brass Core",
        title: "Eine echte Trompete, gespielt von Ihrem Audiosignal",
        body: "Sehen Sie, wie Brass Core funktioniert, woran es angeschlossen wird und wofür Theater, Studios und Museen es einsetzen.",
        price: "2.599 €",
        price_note: "Sofort lieferbar, wenn auf Lager",
        primary_cta_label: "Brass Core entdecken",
        primary_cta_link: "/brass-core",
        secondary_cta_label: "Eine Frage stellen",
        secondary_cta_link: "/contact",
        tone: "Dark band",
      },
    },
  ],
};

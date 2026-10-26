/** Instruments overview (Prismic page "instruments"): self-playing instruments and Brass Core. German. */
export default {
  type: "page",
  uid: "instruments",
  lang: "de-de",
  title: "Selbstspielende Musikinstrumente",
  theme: "decap",
  meta_title: "Selbstspielende Musikinstrumente | Decap Herentals",
  meta_description:
    "Selbstspielendes Akkordeon, Orgelpfeifen, Schlagzeug, Xylophon und eine Drehorgel, über MIDI gesteuert und in Herentals gebaut. Einzeln oder gemeinsam spielbar.",
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Instrumente",
        title: "Selbstspielende Musikinstrumente mit echtem akustischem Klang",
        intro:
          "Ein echtes Akkordeon, echte Pfeifen, echtes Schlagzeug und echte Holzklangstäbe, über MIDI gespielt. Seit 1933 setzen wir selbstspielende Akkordeons auf unsere Orgeln. Heute bauen wir diese automatischen Instrumente als eigenständige Einheiten, die Sie einzeln nutzen oder zu einem Ensemble verbinden.",
        primary_cta_label: "Fragen, welches Instrument passt",
        primary_cta_link: "/contact",
        secondary_cta_label: "Virtual-Orchestrion-Player",
        secondary_cta_link: "/virtual-orchestrion",
        image_brief:
          "Accordion Pedestal, Pipe Cube and Percussion Unit lined up in the workshop, plain dark wall behind, camera at chest height, portrait 4:5",
      },
    },
    {
      type: "site_card_grid",
      primary: {
        eyebrow: "Die Instrumente",
        title: "Musik inklusive, sofort spielbereit",
        intro:
          "Jedes Instrument hier kommt mit Player und Musik: einschalten, und es spielt. Sie suchen robotische Blechbläser ohne Musikbibliothek? Das ist [Brass Core](/brass-core), unser Orchestrionix-Instrument für Musiker.",
        columns: "3",
        card_style: "Image cards",
      },
      items: [
        {
          tag: "Musik inklusive",
          title: "Accordion Pedestal & Cube",
          body: "Ein echtes italienisches Akkordeon mit elektronischer Tastenbetätigung und geregeltem Luftstrom. Touchscreen-Player, Lautsprecher für die Begleitung und MIDI In, Out und Thru. Freistehendes Pedestal oder kompakter Cube.",
          link_label: "Selbstspielendes Akkordeon",
          link: "/accordion",
          image_brief: "Accordion Pedestal, three-quarter front view, plain light backdrop, 4:3",
        },
        {
          tag: "Musik inklusive",
          title: "Pfeifen",
          body: "Bis zu sieben Register aus Holz- oder Metallpfeifen mit eingebautem, leisem Gebläse. Druckeffekte über MIDI, nachrüstbar auf smARTvalve-Steuerung pro Pfeife.",
          link_label: "Pipe Cube und Pedestal",
          link: "/pipes",
          image_brief: "Pipe Cube with front panel off so the pipes show, plain backdrop, 4:3",
        },
        {
          tag: "Musik inklusive",
          title: "Percussion Unit",
          body: "Schlagzeug plus Tamburin, Claves, Woodblock, Kuhglocke und Shaker-Ei. Voller Dynamikbereich und bis zu 14 Schläge pro Sekunde. Spielt Standard-Schlagzeugspuren nach General MIDI.",
          link_label: "Percussion Unit",
          link: "/percussion-unit",
          image_brief: "Percussion Unit front view with stick-tip LEDs lit, dark backdrop, 4:3",
        },
        {
          tag: "Musik inklusive",
          title: "Mallet Percussion",
          body: "Xylophon oder Metallophon mit einem gefederten Hammer pro Klangstab. Die MIDI-Anschlagstärke bestimmt die Kraft jedes Schlags, bei einer Latenz von wenigen Millisekunden.",
          link_label: "Mallet Percussion",
          link: "/mallet-percussion",
          image_brief: "Xylophone with its row of hammers, shot from above at an angle, plain backdrop, 4:3",
        },
        {
          tag: "Musik inklusive",
          title: "Bellow Organ",
          body: "Eine Drehorgel, die jeden Ton der Tonleiter behält. Aluminiumrahmen, austauschbare Paneele, eingebauter Virtual-Orchestrion-Player. Als Bausatz oder spielbereit.",
          link_label: "Drehorgel",
          link: "/bellow-organ",
          image_brief: "Bellow Organ with veneer panels, three-quarter view showing the crank, plain backdrop, 4:3",
        },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Nach Ihrer Wahl gebaut",
        title: "Warum Sie hier keine Preisliste finden",
        body:
          "Jedes selbstspielende Instrument wird um das Instrument herum gebaut, das Sie wählen, deshalb richtet sich der Preis nach Ihrer Wahl. Ein chinesisches Akkordeon zu automatisieren kostet weit weniger als ein italienisches. Für ein Pfeifeninstrument können Sie die Pfeifen von uns fertigen lassen oder Ihre eigenen liefern. Dasselbe gilt für Schlagzeug, Klangstäbe und Gehäuse.\n\nSagen Sie uns, was Sie sich vorstellen, und wir schicken Ihnen ein Angebot für genau dieses Instrument.",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        cta_label: "Angebot anfragen",
        cta_link: "/contact",
        image_brief: "Two accordions side by side on the workbench, one being fitted with the key action, 4:3",
      },
      items: [
        { point: "Das Instrument Ihrer Wahl: preisgünstig oder Spitzenqualität" },
        { point: "Unsere Pfeifen oder Ihre eigenen" },
        { point: "Brass Core: Festpreis, ab Lager lieferbar" },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Ein Ensemble",
        title: "Jedes selbstspielende Instrument spricht MIDI",
        body:
          "Jedes Instrument funktioniert für sich allein. Verbinden Sie sie, und sie spielen wie eine Band: Ein Akkordeon, eine Percussion Unit und ein Xylophon können demselben Arrangement folgen, jedes mit seiner eigenen Stimme.\n\nAccordion Pedestal und Cube haben MIDI In, Out und Thru. Die Bellow Organ kann die anderen als MIDI-Master führen oder ihnen als Slave folgen. Dieselben Instrumente lassen sich auch in die Fassade einer neuen Orgel einbauen.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        cta_label: "Neue Orgeln",
        cta_link: "/organs",
        image_brief: "Three instruments side by side with their MIDI cables visible between them, workshop floor, 4:3",
        tone: "Tinted",
      },
      items: [
        { point: "Ein Instrument allein oder mehrere zusammen" },
        { point: "Standard-MIDI: General-MIDI-Schlagzeugnoten für die Percussion" },
        { point: "Live spielen über Keyboard, Sequencer oder DAW" },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Player und Musik",
        title: "Ein Player für das ganze Ensemble",
        body:
          "Virtual Orchestrion ist der Player für das ganze Decap-Ensemble. Er schickt jedem Instrument seine Stimme und zeigt die Musik als animiertes Orchestrion oder als Notenbuch. Verlangt ein Arrangement Register, die Ihr Instrument nicht hat, ergänzt der Player sie mit Samples, die wir in unserer eigenen Werkstatt aufgenommen haben.\n\nEin Musikshop mit kopiergeschützten Arrangements für Decap-Instrumente folgt in Kürze.",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        cta_label: "Virtual Orchestrion",
        cta_link: "/virtual-orchestrion",
        image_brief: "Laptop running Virtual Orchestrion in front of an Accordion Pedestal, screen readable, 4:3",
      },
    },
    {
      type: "site_faq",
      primary: {
        eyebrow: "Fragen",
        title: "Ein selbstspielendes Instrument auswählen",
      },
      items: [
        {
          question: "Welches Instrument passt zu welchem Einsatz?",
          answer:
            "- **Café, Schaufenster oder Zuhause:** das Accordion Pedestal oder der Cube, mit Begleitung aus den eigenen Lautsprechern.\n- **Veranstaltungen und Tourneen:** Die Cube-Formate sind kompakt und leicht zu transportieren.\n- **Straße und Spiel im Freien:** die handgedrehte [Bellow Organ](/bellow-organ).\n- **Eigene Auftritte oder Installationen:** [Brass Core](/brass-core) spielt die Blechbläserstimme, die Sie ihm zuspielen.\n\nNicht sicher? Sagen Sie uns, wo es spielen soll, und wir schlagen eine Zusammenstellung vor.",
        },
        {
          question: "Können die Instrumente zusammen spielen?",
          answer:
            "Ja. Alle nutzen Standard-MIDI, so kann ein Arrangement mehrere Instrumente gleichzeitig steuern, jedes mit seiner eigenen Stimme. [Virtual Orchestrion](/virtual-orchestrion) ist genau dafür gebaut.",
        },
        {
          question: "Kann ich sie live spielen?",
          answer:
            "Ja. Schließen Sie ein MIDI-Keyboard, einen Controller, Sequencer oder eine DAW an, und die Instrumente reagieren in Echtzeit. MIDI Thru am Akkordeon gibt Ihr Spiel an das nächste Instrument weiter.",
        },
        {
          question: "Was ist der Unterschied zwischen den selbstspielenden Instrumenten und Brass Core?",
          answer:
            "Die selbstspielenden Instrumente kommen mit Player und Musik und sind sofort spielbereit. Brass Core, Teil unserer Linie [Orchestrionix](/orchestrionix), hat keine Musikbibliothek: Es verwandelt Ihr eigenes Audiosignal in echten Blechbläserklang.",
        },
        {
          question: "Liefern Sie auch außerhalb Belgiens?",
          answer: "Ja, wir versenden weltweit. Decap-Instrumente spielen in Europa, Japan, den USA, Australien und in ganz Asien. Der Versand ist Teil Ihres Angebots.",
        },
      ],
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "Sie suchen ein Instrument?",
        title: "Sagen Sie uns, wo es spielen soll",
        body: "Ein Café, eine Bühne, ein Museum oder die Straße: Beschreiben Sie den Ort und die Musik. Wir antworten mit dem Instrument oder der Kombination, die wir wählen würden, und einem Angebot.",
        primary_cta_label: "Angebot anfragen",
        primary_cta_link: "/contact",
        secondary_cta_label: "Zum Shop",
        secondary_cta_link: "/shop",
        tone: "Dark band",
      },
    },
  ],
};

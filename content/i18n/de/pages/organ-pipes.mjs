/** Organ pipes page (Prismic page "organ-pipes"): wooden pipes from our own CNC, ready in days, not months. A headline product. German. */
export default {
  type: "page",
  uid: "organ-pipes",
  lang: "de-de",
  title: "Orgelpfeifen",
  theme: "decap",
  meta_title: "Orgelpfeifen aus Holz, fertig in einer Woche | Decap",
  meta_description:
    "Fast jede Orgelpfeife aus Holz, gefräst auf unserer eigenen CNC und in einer Woche versandbereit. Standardmensuren oder Ihre Maße, für Eigenbau und Orgeln.",
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Die einzige Werkstatt der Welt, die das kann",
        title: "Orgelpfeifen aus Holz, fertig in Tagen statt Monaten",
        intro:
          "Wir sind das einzige Unternehmen der Welt, das die CNC-Fertigung von Orgelpfeifen selbst entwickelt hat. Fast jede Holzpfeife, in unseren Standardmensuren oder nach Ihren eigenen Maßen: gefräst, zusammengebaut und innerhalb weniger Tage versandbereit.",
        primary_cta_label: "Pfeifen bestellen",
        primary_cta_link: "#contact-form",
        secondary_cta_label: "Pfeifen in einer neuen Orgel",
        secondary_cta_link: "/organs",
        note: "Für Eigenbauprojekte, Ihre eigene Orgel, Orgelbauer und Restauratoren.",
        image_brief:
          "A row of new wooden pipes of increasing size on a workbench, pale Ayous bodies and beech mouths visible, side light from a window; portrait 4:5",
      },
    },
    {
      type: "site_facts",
      primary: {
        layout: "Stats",
        tone: "Tinted",
      },
      items: [
        { value: "1 Woche", label: "oder weniger von der Bestellung bis zum Versand, je nach Registern" },
        { value: "Jede Größe", label: "unsere Standardmensuren oder Ihre eigenen Maße" },
        { value: "6 Oktaven", label: "Umfang des Bourdon, MIDI 24 bis 96" },
        { value: "2016", label: "unsere ersten Pfeifen von der eigenen CNC" },
      ],
    },
    {
      type: "site_video",
      primary: {
        eyebrow: "Von der Zeichnung zur Pfeife",
        title: "Sehen Sie, wie eine Pfeife entsteht",
        intro: "In 3D gezeichnet in unserem Büro, gefräst auf unserer CNC, verleimt und intoniert in der Werkstatt nebenan.",
        video_brief:
          "Film, 1–2 minutes, landscape 16:9: a pipe drawn in 3D in PipeCreator at the office → the G-code sent to the CNC → the CNC milling the parts → gluing → the finished pipe being blown for the first time. Upload to YouTube and paste the link here.",
      },
    },
    {
      type: "site_card_grid",
      primary: {
        eyebrow: "Wer unsere Pfeifen bestellt",
        title: "Ein Register oder eine komplette Windanlage",
        intro: "Kaufen Sie nur die Register oder die Register samt Windladen dazu. Wir fertigen die Teile, die Sie brauchen, den Rest überlassen wir Ihnen.",
        columns: "4",
        card_style: "Text cards",
      },
      items: [
        {
          title: "Eigenbauer",
          body: "Sie bauen Ihre eigene Orgel oder Ihr eigenes Instrument? Bestellen Sie die Register, die Sie brauchen, intoniert oder bereit zum Intonieren.",
        },
        {
          title: "Ihre eigene Orgel",
          body: "Ein zusätzliches Register oder ein Ersatzregister, passend zu dem, was schon da ist.",
        },
        {
          title: "Orgelbauer und Restauratoren",
          body: "Pfeifen nach Ihren Mensuren und Maßen, ohne monatelang auf einen Zulieferer zu warten.",
        },
        {
          title: "Pfeifen und Windladen",
          body: "Nehmen Sie Windladen von uns dazu, oder gehen Sie weiter mit einem [MIDI-Umbau](/midi-conversion) oder [smARTvalve](/smartvalve) an jeder Pfeife.",
        },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "So fertigen wir",
        title: "Ein Verfahren, das wir selbst entwickelt haben",
        body:
          "Seit 2016 fräsen wir unsere Orgelpfeifen auf einer 5-Achs-CNC. Den G-Code erzeugt **PipeCreator**, eine Software, die wir selbst geschrieben haben. Kein anderes Unternehmen fertigt Orgelpfeifen auf diese Weise. Die Maschine schneidet jedes Teil auf exakte Maße und Winkel, sodass jede Pfeife eines Registers zur nächsten passt.\n\nNach dem Fräsen und Verleimen ist die Pfeife bereit für Intonation und Feinarbeit. Das übernehmen unsere Intonateure für Sie, oder Sie übernehmen selbst ab dem Schritt, den Sie wünschen.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "Looping clip (mp4, 10–15 s, no sound needed): the 5-axis CNC milling a pipe part, shot beside the machine door. Upload it in the video field; until then a still photo, 4:3.",
      },
      items: [
        { point: "5-Achs-CNC, G-Code aus unserer eigenen Software PipeCreator" },
        { point: "Fertig in wenigen Tagen bis einer Woche, je nach Registern" },
        { point: "Intoniert von unseren Intonateuren oder bereit zum eigenen Intonieren" },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Standard oder eigene Mensur",
        title: "Ein Maß ändern, eine neue Pfeife erhalten",
        body:
          "Jede Pfeifenfamilie hat denselben Grundaufbau, mit Spielraum für Varianten. Etwas weiter für mehr Grundton, etwas enger für mehr Obertöne, ein höherer Aufschnitt und eine andere Länge für höheren Winddruck.\n\nIn PipeCreator ändern wir Innenbreite und -tiefe, Brettstärke und Länge unserer Standardmodelle in wenigen Minuten. Der G-Code geht direkt an die CNC. Eine Pfeife nach Ihren eigenen Maßen dauert deshalb etwa so lange wie eine Standardpfeife.",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        image_brief: "Looping clip (mp4, 10–15 s): a pipe model in PipeCreator at the office, a measurement being changed and the 3D pipe updating. Screen recording or filmed monitor, 4:3.",
        tone: "Tinted",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Holz",
        title: "Körper aus Ayous, Füße und Labien aus Buche",
        body:
          "Eine CNC unterscheidet nicht zwischen feiner Maserung und einem Ast. Deshalb haben wir das Holz für die Maschine und für den Klang ausgewählt. Der Körper ist aus **Ayous** (*Triplochiton scleroxylon*): sehr formstabil, hellgelb und nahezu astfrei. Füße und Labien sind aus **handverlesener Buche**.",
        media_side: "Image right",
        aspect: "Square",
        image_brief: "Close-up of the mouth of a wooden pipe, pale Ayous body against the beech mouth, square 1:1",
      },
    },
    {
      type: "site_facts",
      primary: {
        eyebrow: "Sortiment",
        title: "Unser Standardsortiment an Pfeifen",
        intro: "Die Tonumfänge sind als MIDI-Notennummern angegeben (60 = eingestrichenes c). Andere Umfänge und Maße auf Anfrage.",
        layout: "Spec list",
      },
      items: [
        { label: "Bourdon", value: "MIDI 24–96", note: "6 Oktaven, gedackt" },
        { label: "Jazz Flute", value: "MIDI 60–96", note: "3 Oktaven, gedackt" },
        { label: "Vibraton", value: "MIDI 46–84", note: "3 Oktaven, gedackt" },
        { label: "Double Street Organ", value: "MIDI 60–96", note: "3 Oktaven, gedackt" },
        { label: "Flöte (Flöte 8′ usw.)", value: "MIDI 60–96", note: "3 Oktaven, offen" },
        { label: "Violinen (Alt, Cello usw.)", value: "MIDI 48–96", note: "4 Oktaven, offen" },
        { label: "Bariton", value: "MIDI 48–84", note: "3 Oktaven, Zunge" },
        { label: "Trompete", value: "MIDI 60–96", note: "3 Oktaven, Zunge" },
      ],
    },
    {
      type: "site_faq",
      primary: {
        title: "Pfeifen bestellen",
      },
      items: [
        {
          question: "Wie schnell können Sie liefern?",
          answer: "Innerhalb weniger Tage bis einer Woche, je nach den bestellten Registern. Den Termin bestätigen wir mit dem Angebot.",
        },
        {
          question: "Verkaufen Sie einzelne Pfeifen?",
          answer: "Nein. Wir fertigen Pfeifen als komplette Register, damit jede Pfeife eines Registers gefräst, intoniert und auf die nächste abgestimmt ist.",
        },
        {
          question: "Kann ich meine eigenen Maße schicken?",
          answer: "Ja. Schicken Sie Innenbreite und -tiefe, Länge, Labienmaße und Winddruck, oder eine Zeichnung oder Musterpfeife, und wir fertigen das Register passend dazu.",
        },
        {
          question: "Intoniert oder unintoniert?",
          answer: "Beides. Unsere Intonateure intonieren die Pfeifen auf Ihren Winddruck, oder Sie erhalten sie bereit zum eigenen Intonieren.",
        },
        {
          question: "Fertigen Sie auch die Windladen?",
          answer: "Ja. Bestellen Sie Pfeifen und Windladen zusammen, und nehmen Sie einen MIDI-Umbau oder smARTvalve dazu, wenn die Orgel über MIDI spielen soll.",
        },
        {
          question: "Liefern Sie auch außerhalb Belgiens?",
          answer: "Ja, wir liefern weltweit. Der Versand ist Teil Ihres Angebots.",
        },
      ],
    },
    {
      type: "contact_form",
      primary: {
        eyebrow: "Pfeifen bestellen",
        title: "Schicken Sie uns Ihre Registerliste",
        intro: "Sagen Sie uns, was Sie brauchen. Sie erhalten von uns ein Angebot und einen Versandtermin.",
        recipient: "decap",
        topics: "Orgelpfeifen, Pfeifen und Windladen",
        default_topic: "Orgelpfeifen",
        show_phone: true,
        show_location: false,
        message_placeholder:
          "Welche Register (z. B. Bourdon, Flöte), Tonumfang jedes Registers, Winddruck, Standardmensur oder eigene Maße, intoniert oder unintoniert…",
        submit_label: "Angebot anfragen",
        success_title: "Ihre Registerliste ist angekommen",
        success_body: "Sie erhalten von uns ein Angebot und einen Versandtermin.",
        aside_title: "Gut zu wissen",
        aside_body:
          "- Verkauf als komplette Register\n- Standardmensuren oder Ihre eigenen Maße\n- Fertig in wenigen Tagen bis einer Woche, je nach Registern\n- Intoniert oder bereit zum Intonieren\n- Windladen, MIDI-Umbau und smARTvalve auf Anfrage\n- Versand weltweit",
      },
    },
  ],
};

/** Brass Core (Prismic page "brass-core"): Orchestrionix flagship page, counterpart of SmartValve. German. */
export default {
  type: "page",
  uid: "brass-core",
  lang: "de-de",
  title: "Brass Core",
  theme: "orchestrionix",
  meta_title: "Brass Core: echte Trompete per Audiosignal | Orchestrionix",
  meta_description:
    "Brass Core lässt eine echte Trompete oder Posaune nach einem Audiosignal spielen: ein Schwingspulen-Ansatz, ohne Eingriff. 2.599 €, ab Lager lieferbar.",
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Centered",
        eyebrow: "Orchestrionix",
        title: "Brass Core",
        intro:
          "Eine echte Trompete oder Posaune, gespielt vom Klang. Brass Core verwandelt jedes Audiosignal in die Schwingungen, die die Lippen eines Musikers erzeugen würden, und das Blech des Instruments erledigt den Rest.",
        primary_cta_label: "Brass Core bestellen",
        primary_cta_link: "#contact-form",
        secondary_cta_label: "Über Orchestrionix",
        secondary_cta_link: "/orchestrionix",
        note: "2.599 € · sofort lieferbar, wenn auf Lager",
        image_brief: "Brass Core on a trombone, dark background, low side light catching the brass, 16:9",
      },
    },
    {
      type: "core_3_d",
      primary: {
        title: "Von allen Seiten",
        description: "Brass Core in 3D. Ziehen zum Drehen, scrollen zum Zoomen.",
        background_type: "color",
        background_color: "#0c0a09",
        enable_dragging: true,
        enable_zoom: true,
        enable_rotation: true,
      },
    },
    {
      type: "site_facts",
      primary: {
        layout: "Stats",
      },
      items: [
        { value: "Jedes Audio", label: "steuert es: eine Aufnahme, ein Sampler, ein Live-Mix" },
        { value: "0", label: "Bohrlöcher in Ihrem Instrument" },
        { value: "120 × 90 × 70", label: "Millimeter, klein genug zum Anklemmen" },
        { value: "Ab Lager", label: "sofort verschickt" },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "So funktioniert es",
        title: "Ein Ansatz aus einer Schwingspule",
        body:
          "Ein Trompeter formt den Ton mit Luftdruck und der Schwingung der Lippen. Brass Core macht dasselbe in einer abgedichteten Druckkammer: Ein Schwingspulenmotor, gesteuert von Ihrem Audiosignal, moduliert die Luft am Mundstück.\n\nDas Instrument ist kein Lautsprechergehäuse. Die Schwingung regt die natürliche Resonanz des Blechs selbst an, so kommt der Ton aus der Trompete oder Posaune, mit ihrer eigenen Klangfarbe und Projektion.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "Close-up of Brass Core on a trumpet mouthpiece, dark background, 4:3",
      },
      items: [
        { point: "Schwingspulenmotor in einer abgedichteten Druckkammer" },
        { point: "Der Blechkörper formt den Ton" },
        { point: "Standard-Mundstücke und -Rohre" },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Ausdruck",
        title: "Jede Dynamik, genau wie aufgenommen",
        body:
          "Weil Brass Core direkt mit der Audio-Wellenform arbeitet, folgt es Lautstärke, Artikulation und Ausdruck der Aufnahme Note für Note. Geben Sie ihm eine gute Trompetenaufnahme, und das Publikum hört ein echtes Instrument spielen.\n\nEs ist ein Orchestrionix-Instrument: keine Musikbibliothek, keine Presets. Die Darbietung liefern Sie.",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        image_brief: "Brass Core on a trumpet on a stand, side view, dark background, 4:3",
        tone: "Tinted",
      },
    },
    {
      type: "site_card_grid",
      primary: {
        eyebrow: "Gemacht für",
        title: "Echtes Blech, wo kein Musiker stehen kann",
        columns: "3",
        card_style: "Text cards",
      },
      items: [
        { title: "Theater und Zirkus", body: "Ein Bläsersatz, der jeden Abend spielt, auf den Punkt, im Bühnenbild und auf der Bühne." },
        { title: "Museen und Installationen", body: "Echte Instrumente, die von selbst spielen, den ganzen Tag, vor den Besuchern." },
        { title: "Studios und Sammler", body: "Akustisches Blech aus einer Aufnahme oder einem Sampler, für Sounddesign und für die Sammlung." },
      ],
    },
    {
      type: "core_demo_video",
      variation: "default-slice",
      primary: {
        title: "Hören. Spüren.",
        background_type: "color",
        background_color: "#0c0a09",
        video_url: "/videos/WhatsApp Video 2025-07-09 at 21.38.23.mp4",
        autoplay: false,
        loop: false,
        show_controls: true,
      },
    },
    {
      type: "site_quote",
      primary: {
        quote:
          "Der Brass Core ist das schlagende Herz unseres automatisierten Bläsersatzes geworden. Wir wollten Blasmusik nicht einfach über die PA abspielen, wir wollten, dass das Publikum sie spürt, als stünde eine echte Kapelle auf der Bühne. Die Leute fragen uns oft, wo sich die Blaskapelle versteckt.",
        name: "Circus Ronaldo",
      },
    },
    {
      type: "site_facts",
      primary: {
        eyebrow: "Technische Daten",
        title: "Brass Core",
        layout: "Spec list",
      },
      items: [
        { label: "Instrumente", value: "Trompete, Posaune und ähnliche", note: "Standard-Mundstücke und -Rohre" },
        { label: "Eingang", value: "Audio mit Line-Pegel" },
        { label: "Verstärker", value: "Externer Verstärker erforderlich" },
        { label: "Stromversorgung", value: "12 V DC, 2 A" },
        { label: "Abmessungen", value: "120 × 90 × 70 mm" },
        { label: "Befestigung", value: "Klemme", note: "Klemmen für Trompete und Posaune erhältlich" },
        { label: "Änderungen am Instrument", value: "Keine" },
      ],
    },
    {
      type: "site_faq",
      primary: {
        title: "Fragen zu Brass Core",
      },
      items: [
        {
          question: "Kann es Dynamik und Ausdruck wiedergeben?",
          answer: "Ja. Es arbeitet direkt mit der Audio-Wellenform, so kommen Lautstärke, Artikulation und Ausdruck genau so durch, wie sie in der Aufnahme sind.",
        },
        {
          question: "Muss ich mein Instrument verändern?",
          answer: "Nein. Brass Core greift nicht ein: kein Bohren, kein Schneiden, nichts Dauerhaftes.",
        },
        {
          question: "Kann ich es live einsetzen?",
          answer: "Ja. Es wird in Shows, Installationen und Vorführungen eingesetzt, überall dort, wo ein echter Blechbläserklang ohne Musiker gebraucht wird.",
        },
        {
          question: "Wie wird es angeschlossen?",
          answer: "Speisen Sie ein Audiosignal mit Line-Pegel ein, am besten eine hochwertige Blechbläseraufnahme, über einen externen Verstärker. Brass Core erledigt den Rest.",
        },
        {
          question: "Wie schnell kann ich eines haben?",
          answer: "Brass Core ist eines unserer wenigen Produkte von der Stange: Wenn es auf Lager ist, wird es sofort verschickt.",
        },
      ],
    },
    {
      type: "contact_form",
      primary: {
        eyebrow: "Orchestrionix",
        title: "Brass Core bestellen",
        intro: "2.599 €. Sagen Sie uns, mit welchem Instrument Sie es verwenden und wohin es geliefert werden soll.",
        recipient: "decap",
        topics: "Brass Core bestellen, Frage zu Brass Core",
        default_topic: "Brass Core bestellen",
        show_phone: true,
        show_location: true,
        message_placeholder: "Trompete oder Posaune, wie Sie es einsetzen, Lieferadresse…",
        submit_label: "Bestellanfrage senden",
        success_title: "Vielen Dank",
        success_body: "Ihre Anfrage ist bei uns. Verfügbarkeit und Lieferung bestätigen wir persönlich.",
      },
    },
  ],
};

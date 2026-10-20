/** Work case study (Prismic project "yves-rechsteiner"), German: L'Explorateur, the most complete case. Facts and quotes from Yves Rechsteiner's article "About the Explorateur". */
export default {
  type: "project",
  uid: "yves-rechsteiner",
  lang: "de-de",
  title: "Yves Rechsteiner: L'Explorateur",
  theme: "decap",
  meta_title: "L'Explorateur: transportable Konzertorgel | Decap",
  meta_description:
    "L'Explorateur, die transportable Pfeifenorgel von Yves Rechsteiner mit SmartValve an jeder Pfeife: 12 Module, Aufbau unter 2 h, über 30 Auftritte seit 2023.",
  fields: {
    summary: "Eine transportable Konzertorgel mit Windregelung an jeder Pfeife: aufgebaut in weniger als zwei Stunden, mehr als 30 Auftritte seit 2023.",
    client: "Yves Rechsteiner, Toulouse les Orgues",
    year: "2021–2026",
    location: "Toulouse, Frankreich",
  },
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Projekte · Yves Rechsteiner",
        title: "L'Explorateur: eine transportable Konzertorgel mit SmartValve an jeder Pfeife",
        intro:
          "Der Organist Yves Rechsteiner wollte eine Pfeifenorgel, die überall spielen kann, wo die Musik ist, nicht nur in Kirchen. Gemeinsam haben wir L'Explorateur gebaut: zwölf Module, die in einem Transporter reisen, aufgebaut in weniger als zwei Stunden, mit dem Wind jeder Pfeife unter Kontrolle. Rechsteiner nennt das Ergebnis einen physischen Synthesizer.",
        primary_cta_label: "SmartValve für Orgelbauer",
        primary_cta_link: "/smartvalve-for-organ-builders",
        secondary_cta_label: "Über SmartValve",
        secondary_cta_link: "/smartvalve",
        image_brief: "L'Explorateur on stage with dancers in front, wide shot, 4:3",
      },
    },
    {
      type: "site_facts",
      primary: {
        layout: "Stats",
        tone: "Tinted",
      },
      items: [
        { value: "< 2 h", label: "von der Ankunft des Lkw bis zum ersten Ton" },
        { value: "30+", label: "Auftritte seit 2023" },
        { value: "12", label: "Module, in einem 20-m³-Transporter" },
        { value: "0", label: "Windregler: ein Gebläse und ein Verteilerkasten" },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Die Idee",
        title: "Eine Orgel für jede Bühne, nicht nur für Kirchen",
        body:
          "2013 wurde Yves Rechsteiner künstlerischer Leiter von Toulouse les Orgues. Seine Idee: eine Pfeifenorgel, die die Kirche verlassen kann. *„Das Ziel war ein Instrument, das außerhalb von Kirchen auftritt, für jedes musikalische Projekt mit Pfeifenorgel.“*\n\n2017 wurde das Projekt aus finanziellen Gründen gestoppt. Zwei Jahre später sah Rechsteiner einen Teaser von Stephan Eichers Show *Die Automaten*, gebaut mit Instrumenten von Decap, und lernte Tony Decap kennen. Tony hatte Erfahrung mit beweglichen Pfeifenorgeln und hatte bereits eine eigene Windregelung entwickelt. Rechsteiner bestellte ein MIDI-gesteuertes Instrument.",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        image_brief: "Dancers on stage in front of L'Explorateur, an organist at the console, 4:3",
      },
    },
    {
      type: "site_timeline",
      primary: {
        eyebrow: "Zeitleiste",
        title: "Von der Idee zum Windsynthesizer",
      },
      items: [
        { year: "2013", title: "Die Idee", body: "Yves Rechsteiner, neuer künstlerischer Leiter von Toulouse les Orgues, will eine Orgel, die außerhalb von Kirchen auftreten kann." },
        { year: "2017", title: "Auf Eis gelegt", body: "Das Projekt einer transportablen Orgel wird aus finanziellen Gründen gestoppt." },
        { year: "2019", title: "Begegnung mit Tony Decap", body: "Über einen Teaser von Stephan Eichers *Die Automaten*. Rechsteiner bestellt ein MIDI-gesteuertes Instrument." },
        { year: "2021", title: "Baubeginn", body: "Während des Baus schlägt Decap etwas Neues vor: den Wind nicht pro Windlade zu regeln, sondern pro Pfeife." },
        { year: "2023", title: "Erste Auftritte", body: "Nach zwei Jahren Arbeit und Forschung spielt L'Explorateur mit der ersten Ventilgeneration. Die Auftritte beginnen." },
        { year: "2023–2025", title: "SmartValve", body: "Tony Decap entwickelt die zweite Generation, SmartValve, und die Elektronik der Module wird darum herum neu aufgebaut.", highlight: true },
        { year: "2025", title: "Der erste Windsynthesizer", body: "SmartValve im Konzert: Jede Pfeife einer transportablen Kirchenorgel wird einzeln gesteuert. Unter den Konzerten eine Hommage an Moondog in der Chapelle de la Trinité in Lyon.", highlight: true },
        { year: "2026", title: "Nächste Schritte", body: "Neue Ventile und Windladen, Spieltisch-Software, klangliche Nachintonation und ein Durchschlagzungenregister aus einem Muller-*orgue expressif* von 1830." },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Die Technik",
        title: "Windregelung pro Pfeife, nicht pro Windlade",
        body:
          "In einer klassischen Orgel teilen sich alle Pfeifen einer Windlade denselben Wind. In L'Explorateur hat jede Pfeife ihr eigenes SmartValve, wenige Millimeter vom Pfeifenfuß entfernt. Das Ventil misst den Druckabfall auf der Eingangsseite und öffnet weiter, um ihn auszugleichen. So behält jede Pfeife ihren Wind, wenn viele Pfeifen gleichzeitig klingen.\n\nDie ersten Ventile waren kleine Lautsprecher, die zu Ventilen umgebaut wurden. SmartValve, die zweite Generation, wurde von Tony Decap entwickelt und industriell gefertigt. Für den Organisten bedeutet das Kontrolle über jeden Ton: *„man kann die Art der Ansprache des Klangs bestimmen.“*",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        cta_label: "So funktioniert SmartValve",
        cta_link: "/smartvalve",
        image_brief: "Close-up of the SmartValves under the pipes inside L'Explorateur, dark background, 4:3",
      },
      items: [
        { point: "Ein Ventil und ein Prozessor pro Pfeife" },
        { point: "Druck am Pfeifenfuß gemessen und korrigiert" },
        { point: "Keine Windregler: Ein Gebläse und ein Verteilerkasten genügen" },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Gebaut zum Reisen",
        title: "Ein Transporter, zwölf Module, unter zwei Stunden",
        body:
          "Von Anfang an hatte L'Explorateur zwei Grenzen: Es musste in einen 20-m³-Transporter passen und durfte nicht mehr als 1.200 kg wiegen. Jede technische Entscheidung folgte daraus.\n\nDie Orgel ist in Module aufgeteilt, die hineingetragen, aufgestellt und angeschlossen werden. Weil SmartValve Windregler überflüssig macht, besteht die Windanlage nur aus einem Gebläse und einem Verteilerkasten. *„Für L'Explorateur bedeutet das einen einfachen Aufbau von weniger als 2 Stunden, von der Ankunft des Lkw bis zum Spielen.“*",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        image_brief: "L'Explorateur modules being unloaded from the van or set up in a hall, 4:3",
        tone: "Tinted",
      },
      items: [
        { point: "Passt in einen 20-m³-Transporter" },
        { point: "Maximal 1.200 kg" },
        { point: "Module auf identische Standardmaße umgebaut" },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Im Raum",
        title: "Die Aufstellung wird Teil des Klangs",
        body:
          "Weil die Module getrennt sind, können sie zusammen wie eine Orgel stehen oder getrennt als eigenständige Werke rund um das Publikum. Jede Aufstellung verändert, wie das Instrument dem Raum begegnet. *„Dasselbe Flöten-Modul klingt anders, je nachdem, ob es vorne, seitlich oder hinter einem anderen Modul steht.“*",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "L'Explorateur modules spread around a hall or chapel, audience in between, wide shot, 4:3",
      },
    },
    {
      type: "site_facts",
      primary: {
        eyebrow: "Disposition",
        title: "Die ursprüngliche Disposition",
        intro: "Wie zu Beginn geplant. Das Instrument entwickelt sich weiter: siehe „Wie es weitergeht“.",
        layout: "Spec list",
      },
      items: [
        { label: "Bourdon", value: "16′ bis 4′" },
        { label: "Principal", value: "8′ bis 1′" },
        { label: "Flöte", value: "8′ bis 1′", note: "Pfeifen ab der zweiten Oktave" },
        { label: "Holztraversflöte", value: "8′", note: "Pfeifen ab der zweiten Oktave" },
        { label: "Salicional", value: "8′" },
        { label: "Gambe", value: "8′ und 4′", note: "Pfeifen ab der zweiten Oktave" },
        { label: "Nasard", value: "" },
        { label: "Terz", value: "" },
        { label: "Trompete", value: "16′ bis 4′", note: "neue Durchschlagzungen in den ersten zwei Oktaven" },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Das Pfeifenwerk",
        title: "Alte Pfeifen, ein neues Leben",
        body:
          "Der größte Teil des Pfeifenwerks stammt aus zweiter Hand, aus dem späten 19. und frühen 20. Jahrhundert, und wurde von Jean Daldosso intoniert. Neue Pfeifen mit Durchschlagzungen fertigte Orgelbau Orglez in der Bretagne: Durchschlagzungen ändern ihre Lautstärke, ohne die Tonhöhe zu ändern, ideal für die Windregelung pro Pfeife.\n\nMit SmartValve kann ein Register weit mehr, als wofür es gebaut wurde: Fünfzig Flötenpfeifen ergeben allein über den Wind eine ganze Palette an Klangfarben.",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        image_brief: "Close-up of old wooden and metal pipes standing on a module of L'Explorateur, 4:3",
      },
    },
    {
      type: "site_card_grid",
      primary: {
        eyebrow: "Auf der Bühne",
        title: "Von Faurés Requiem bis zu MIDI-Residenzen",
        intro: "Seit 2023 hat L'Explorateur mehr als 30 Auftritte gespielt, in Kirchen, Museen, Theatern und Konzertsälen.",
        columns: "3",
        card_style: "Text cards",
      },
      items: [
        {
          title: "Repertoire",
          body: "Viernes *Messe solennelle*, Faurés *Requiem*, Vokalmusik von Thierry Escaich und Poulencs *Orgelkonzert*.",
        },
        {
          title: "Konzerte",
          body: "In Kirchen, Museen, Theatern und Auditorien. Im November 2025 eine Hommage an Moondog in der Chapelle de la Trinité in Lyon.",
        },
        {
          title: "Residenzen",
          body: "Für Toulouse les Orgues arbeiteten das Berliner Duo Gamut und der Künstler George Rahi aus Toronto mit L'Explorateur als MIDI-gesteuerter Orgel.",
        },
      ],
    },
    {
      type: "site_quote",
      primary: {
        quote: "Sie alle erkennen das hohe Niveau an Qualität, Leistung und Ansprache von Tony Decaps smART valve an.",
        name: "Yves Rechsteiner",
        role: "Über die Orgelbauer, die L'Explorateur gesehen haben",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Wie es weitergeht",
        title: "Ein Instrument, das weiter wächst",
        body:
          "L'Explorateur ist nicht fertig, und genau darum geht es.\n\n- **Osmose-Tastatur:** Der Winddruck folgt der Taste, sodass der Organist mit Klavier- oder Clavichordtechnik spielt.\n- **Spieltisch-Software:** ein Werkzeug, um Ansprache, Verlauf und Vibrato pro Klang zu programmieren, inspiriert von ADSR-Hüllkurven.\n- **Polyphone Pfeifen** für den Bass von Principal und Salicional: mehrere Töne aus einer Pfeife.\n- **Neue Schwellkästen**, entwickelt von Tony Decap, für die leisesten Dynamikstufen.\n- **Eine leichtere Ophicléide 16′** und ein Durchschlagzungenregister aus einem Muller-*orgue expressif* von 1830.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "Yves Rechsteiner at the console of L'Explorateur with a laptop beside the keyboard, 4:3",
        tone: "Tinted",
      },
    },
    {
      type: "site_video",
      primary: {
        eyebrow: "Video",
        title: "L'Explorateur im Konzert",
        video_brief: "Video of Yves Rechsteiner playing L'Explorateur in concert, e.g. Lyon, Chapelle de la Trinité",
      },
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "Für Orgelbauer und Organisten",
        title: "Geben Sie jeder Pfeife ihren eigenen Wind",
        body: "SmartValve ist erhältlich für neue Orgeln und, durch Ersetzen der Pfeifenstöcke, für bestehende. Erzählen Sie uns von Ihrem Projekt.",
        primary_cta_label: "SmartValve für Orgelbauer",
        primary_cta_link: "/smartvalve-for-organ-builders",
        secondary_cta_label: "Decap kontaktieren",
        secondary_cta_link: "/contact",
        tone: "Dark band",
      },
    },
  ],
};

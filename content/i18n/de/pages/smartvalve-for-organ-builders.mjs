/** SmartValve for organ builders (Prismic page "smartvalve-for-organ-builders"): the B2B page. No prices, no competitor names. German. */
export default {
  type: "page",
  uid: "smartvalve-for-organ-builders",
  lang: "de-de",
  title: "SmartValve für Orgelbauer",
  theme: "smartvalve",
  meta_title: "Proportionales Pfeifenventil für Orgelbauer | SmartValve",
  meta_description:
    "SmartValve: proportionales Pfeifenventil für die Orgel mit eigenem Prozessor. Wind pro Pfeife geregelt, digitale Register, optisches MIDI, für Neubau und Umbau.",
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "SmartValve für Orgelbauer",
        title: "Ein proportionales Pfeifenventil mit einem Prozessor in jedem Ventil",
        intro:
          "SmartValve regelt den Wind zu jeder Pfeife einzeln, mehr als 1.000-mal pro Sekunde. Ihre Pfeifen behalten ihre Stimme; die Orgel gewinnt Dynamik, Ausdruck und Register, die in der Software eingestellt werden. Entwickelt und gebaut von Decap in Herentals und auf der Konzertbühne bewährt.",
        primary_cta_label: "Technische Dokumentation anfordern",
        primary_cta_link: "#contact-form",
        secondary_cta_label: "SmartValve entdecken",
        secondary_cta_link: "/smartvalve",
        note: "Für neue Orgeln und für bestehende, indem die Pfeifenstöcke ersetzt werden. Preise auf Anfrage.",
        image_brief: "A row of SmartValves mounted under pipes on a wind chest, dark background, low side light, portrait 4:5",
      },
    },
    {
      type: "site_facts",
      primary: {
        layout: "Stats",
      },
      items: [
        { value: "1.000×", label: "pro Sekunde wird der Wind zu jeder Pfeife gemessen und korrigiert" },
        { value: "0–200 %", label: "Winddruck pro Pfeife, im Ventil gespeichert" },
        { value: "4 ms", label: "Ansprechzeit" },
        { value: "200 m+", label: "optisches MIDI, 100-mal schneller als klassisches MIDI" },
      ],
    },
    {
      type: "site_card_grid",
      primary: {
        eyebrow: "Drei Generationen von Pfeifenventilen",
        title: "Von Auf-oder-Zu zu jeder Pfeife unter Kontrolle",
        intro:
          "Elektrische Trakturen haben ein Pfeifenventil lange wie einen Schalter behandelt. Neuere Ventile folgen der Taste. SmartValve geht einen Schritt weiter: Es regelt den Wind selbst.",
        columns: "3",
        card_style: "Text cards",
      },
      items: [
        {
          tag: "Generation 1",
          title: "Auf/Zu-Ventil",
          body: "Ein Magnet öffnet das Ventil ganz oder schließt es. Zuverlässig und einfach, aber jeder Ton spricht gleich an, wie auch immer die Taste gespielt wird.",
        },
        {
          tag: "Generation 2",
          title: "Positionsfolgendes Ventil",
          body: "Die Ventilöffnung folgt dem Tastenweg, so formt der Organist den Einschwingvorgang. Ist die Taste unten, bleibt die Pfeife, wo sie ist.",
        },
        {
          tag: "SmartValve",
          title: "Windregelung im geschlossenen Regelkreis",
          body: "Ein Prozessor in jedem Ventil regelt den Wind zu seiner Pfeife, beim Einschwingen und solange der Ton klingt. Er kann der Taste folgen oder allem anderen, das Sie ihm zuordnen.",
        },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Jede Pfeife, ihr eigener Wind",
        title: "Gemessen und korrigiert, während der Ton klingt",
        body:
          "SmartValve ist klein genug, um auf dem Pfeifenstock zu sitzen, wenige Millimeter vom Pfeifenfuß entfernt. Sein Prozessor misst den Druckabfall auf der Eingangsseite und öffnet weiter, um ihn auszugleichen, mehr als 1.000-mal pro Sekunde. Wenn viele Pfeifen gleichzeitig sprechen, behält jede Pfeife ihren Wind. In L'Explorateur wurden dadurch Windregler überflüssig: Ein Gebläse und ein Verteilerkasten genügen.\n\nDer Grunddruck jeder Pfeife wird im Ventil gespeichert, von 0 bis 200 %. So lässt sich ein Teil der Regulierung, die früher an der Intonierlade geschah, in der Software erledigen und jederzeit wiederholen.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "Close-up of one SmartValve with its electronics visible, dark background, 4:3",
      },
      items: [
        { point: "Geregelt wenige Millimeter vom Pfeifenfuß" },
        { point: "Stabile Ansprache, wenn viele Pfeifen gleichzeitig klingen" },
        { point: "Grunddruck pro Pfeife im Ventil gespeichert" },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Tastenposition oder etwas anderes",
        title: "Jedes MIDI jeder Pfeife zuordnen",
        body:
          "SmartValve ist volldigital, also bestimmen Sie, was es steuert. Ordnen Sie die Tastenposition der Ventilöffnung zu, und es verhält sich genau wie ein positionsfolgendes Ventil. Ordnen Sie Velocity, Aftertouch, einen Controller oder eine Automationskurve aus einem Sequencer zu, und dieselbe Pfeife kann, was kein mechanisches Ventil kann.\n\n- Crescendo und Decrescendo auf einem gehaltenen Ton\n- Vibrato und Tremolo pro Pfeife, nicht pro Windlade\n- Druckkurven, Slope und Decay für jeden Ton\n- Klassisches Auf/Zu-Verhalten, wo die Musik es verlangt",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        image_brief: "Screen of the SmartValve software with a pressure curve, next to an organ keyboard, 4:3",
        tone: "Tinted",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Digitale Register",
        title: "Register in der Software, in jeder Kombination",
        body:
          "Weil jede Pfeife einen eigenen Prozessor und eine eigene Adresse hat, ist ein Register nicht länger in der Windlade festgelegt. Mit unserer Software ordnen Sie jede beliebige Kombination von Pfeifen einem Register zu, jede Pfeife mit ihren eigenen Druckeinstellungen. In einer Orgel, die ganz auf SmartValve aufgebaut ist, ist die Zahl der Kombinationen praktisch unbegrenzt; wenn SmartValve eine bestehende Orgel erweitert, kann die ursprüngliche Steuerung Grenzen setzen, und das prüfen wir pro Projekt.\n\nDie Orgel ist am Tag der Lieferung nicht fertig: Register lassen sich später hinzufügen oder ändern, ohne die Windlade anzufassen.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "Screenshot of the stop configuration in the SmartValve software, pipes grouped into stops, 4:3",
      },
      items: [
        { point: "Jede Kombination von Pfeifen als Register" },
        { point: "Druckeinstellungen pro Pfeife, pro Register" },
        { point: "Register nach der Installation änderbar" },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Optisches MIDI",
        title: "Vom Spieltisch zur Windlade über Licht",
        body:
          "SmartValves werden über optisches MIDI verbunden: mehr als 100-mal so schnell wie klassisches MIDI, über Entfernungen von 200 m und mehr. Licht überträgt keine elektrischen Störungen, also kann der Spieltisch dort stehen, wo die Orgel ihn braucht. [Mehr über SmartValve](/smartvalve).",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        image_brief: "Optical MIDI cable plugged into a SmartValve controller, glowing connector, dark background, 4:3",
      },
    },
    {
      type: "site_quote",
      primary: {
        quote: "Diese Technologie macht aus einer Pfeifenorgel im Grunde einen physischen Synthesizer.",
        name: "Studio 31, Basel",
        role: "Über L'Explorateur, die transportable Konzertorgel mit SmartValve an jeder Pfeife",
      },
    },
    {
      type: "site_steps",
      primary: {
        eyebrow: "Zusammenarbeit",
        title: "Von der ersten Frage zur spielenden Orgel",
      },
      items: [
        { title: "Erzählen Sie uns vom Projekt", body: "Eine neue oder eine bestehende Orgel, die Windladen, die Zahl der Pfeifen und was das Instrument können soll." },
        { title: "Technische Dokumentation", body: "Spezifikationen, Abmessungen und Verkabelung für Ihr Projekt, damit Ihr Team die Integration beurteilen kann." },
        { title: "Vorführung", body: "Hören Sie SmartValve an echten Pfeifen, in unserer Werkstatt in Herentals oder per Videoanruf." },
        { title: "Unterstützung bei der Integration", body: "Wir unterstützen Ihr Team bei der Installation, der Konfiguration der Ventile und den digitalen Registern." },
      ],
    },
    {
      type: "site_faq",
      primary: {
        title: "Fragen von Orgelbauern",
      },
      items: [
        {
          question: "Kann sich SmartValve wie ein klassisches Ventil verhalten?",
          answer: "Ja. SmartValve ist volldigital: Es kann als Auf/Zu-Ventil arbeiten, der Tastenposition folgen oder auf Velocity, Aftertouch und jedes andere MIDI reagieren, das Sie ihm zuordnen. Sie wählen pro Pfeife und pro Register.",
        },
        {
          question: "Lässt es sich in eine bestehende Orgel einbauen?",
          answer: "Ja. SmartValves werden auf einem Pfeifenstock montiert, daher lässt sich eine bestehende Orgel umrüsten, indem ihre Pfeifenstöcke ersetzt werden. In einer vollständigen SmartValve-Orgel wird alles in der Software eingestellt; wenn SmartValve eine bestehende Anlage erweitert, gelten die Grenzen ihrer ursprünglichen Steuerung. Wir prüfen jedes Projekt zuerst.",
        },
        {
          question: "Welche Spieltische und Steuerungen funktionieren mit SmartValve?",
          answer: "Alles, was MIDI spricht: ein Spieltisch mit MIDI-Ausgang, ein Sequencer oder ein Computer. Über optisches MIDI kann der Spieltisch 200 m oder weiter entfernt stehen.",
        },
        {
          question: "Was sind digitale Register?",
          answer: "Register, die in der Software statt in der Windlade festgelegt werden. Sie ordnen jede beliebige Kombination von Pfeifen einem Register zu, mit eigenen Druckeinstellungen, und können Register nach der Installation ändern.",
        },
        {
          question: "Hat sich SmartValve in der Praxis bewährt?",
          answer: "Ja. SmartValve spielt in L'Explorateur, der transportablen Konzertorgel von Yves Rechsteiner mit SmartValve an jeder Pfeife: mehr als 30 Aufführungen seit 2023, aufgebaut in weniger als zwei Stunden nach Ankunft des Lkw. [Zur Fallstudie](/work/yves-rechsteiner).",
        },
        {
          question: "Was kostet es?",
          answer: "Das hängt von der Zahl der Pfeifen und vom Projekt ab. Erzählen Sie uns von Ihrer Orgel, und wir schicken Ihnen ein Angebot.",
        },
      ],
    },
    {
      type: "contact_form",
      primary: {
        eyebrow: "Für Orgelbauer",
        title: "Dokumentation oder Vorführung anfragen",
        intro: "Erzählen Sie uns von Ihrer Werkstatt und Ihrem Projekt. Wir antworten persönlich.",
        recipient: "decap",
        topics: "Technische Dokumentation, Vorführung, Angebot für ein Projekt, Frage zur Integration",
        default_topic: "Technische Dokumentation",
        show_phone: true,
        show_location: false,
        message_placeholder: "Ihre Werkstatt, die Orgel (neu oder bestehend), die Windladen, die Zahl der Pfeifen und was SmartValve leisten soll…",
        submit_label: "Anfrage senden",
        success_title: "Vielen Dank",
        success_body: "Ihre Anfrage ist bei uns angekommen. Wir antworten persönlich mit den gewünschten Informationen.",
        aside_title: "Decap Herentals",
        aside_body:
          "Langepad 51C, 2200 Herentals, Belgien\n\n+32 14 22 44 94\n\n[info@decap.be](mailto:info@decap.be)\n\nSmartValve wird in unserer eigenen Werkstatt entwickelt, gebaut und programmiert.",
      },
    },
  ],
};

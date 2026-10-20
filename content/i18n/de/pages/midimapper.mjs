/** MIDIMapper product page (Prismic page "midimapper"): MIDI router and player with real organ samples, for arrangers. German. */
export default {
  type: "page",
  uid: "midimapper",
  lang: "de-de",
  title: "MIDIMapper",
  theme: "decap",
  meta_title: "MIDIMapper: Software für Orgel-Arrangeure | Decap Herentals",
  meta_description:
    "MIDIMapper leitet MIDI aus Ihrer DAW auf echte Orgel-Samples. So hören Sie Ihr Orgel-Arrangement, wie es klingen wird. 150 € zzgl. MwSt., Gratis-Testversion.",
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "MIDIMapper, für Arrangeure",
        title: "Hören Sie Ihr Orgel-Arrangement mit echten Orgel-Samples",
        intro:
          "Wer für Straßenorgel oder Pfeifenorgel arrangiert, schreibt meist blind, bis die Musik das Instrument erreicht. MIDIMapper nimmt das MIDI aus Ihrer Arrangier-Software, leitet es über Ihre eigenen Maps und spielt es mit echten Orgel-Samples ab. Was Sie beim Arrangieren hören, kommt dem, was die Orgel spielen wird, viel näher.",
        primary_cta_label: "Kostenlose Testversion im Shop",
        primary_cta_link: "/software/midi-mapper",
        secondary_cta_label: "Alle Decap-Software",
        secondary_cta_link: "/software",
        note: "Vollversion 150 € zzgl. MwSt. Kostenlose Testversion und Lizenz im Shop.",
        image_brief: "Laptop with the MIDIMapper map editor open next to a MIDI keyboard on a desk, portrait 4:5",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Was es kann",
        title: "MIDI-Routing und Orgelwiedergabe in einem Programm",
        body:
          "MIDIMapper liest einen MIDI-Eingang und schickt jeden Ton an einen oder mehrere Ausgänge, nach Maps, die Sie selbst festlegen. Eine Map kann bis zu 12 Ebenen übereinanderlegen. So hören Sie Registrierungen im Zusammenhang: eine Jazz Flute mit und ohne Tremolo oder einen Woodblock, der auf einem Ton dazukommt.\n\nWeil der Klang von echten Orgel-Samples kommt statt von General-MIDI-Klängen, beurteilen Sie Balance und Registrierung schon beim Arrangieren, nicht erst, wenn das Notenbuch gestanzt ist.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "Screenshot of a MIDIMapper map with several layers visible, 4:3",
      },
    },
    {
      type: "site_steps",
      primary: {
        eyebrow: "So funktioniert es",
        title: "Einmal einrichten, dann arrangieren",
        tone: "Tinted",
      },
      items: [
        {
          title: "DAW verbinden",
          body: "Schicken Sie MIDI aus Ihrer Arrangier-Software über ein virtuelles MIDI-Kabel wie loopMIDI und wählen Sie die Ausgänge. MIDIMapper speichert diese Einrichtung für das nächste Mal.",
        },
        {
          title: "Map erstellen",
          body: "Weisen Sie im integrierten MapCreator eingehende Töne den Ausgangskanälen und Registrierungen zu. Verfeinern Sie die Map während der Arbeit.",
        },
        {
          title: "Anhören und anpassen",
          body: "Spielen Sie das Arrangement über die Orgel-Samples ab. Korrigieren Sie Tonlängen in Millisekunden, passend zum Notenbuch und zum Ansprechverhalten der Orgel.",
        },
        {
          title: "Aufnehmen und teilen",
          body: "Nehmen Sie die Ausgabe auf und exportieren Sie sie als WAV-Datei zum Anhören oder Weitergeben.",
        },
      ],
    },
    {
      type: "site_facts",
      primary: {
        eyebrow: "Funktionen",
        title: "Was MIDIMapper enthält",
        layout: "Spec list",
      },
      items: [
        { label: "Klang", value: "Echte Samples von Pfeifenorgeln; eigene Samples möglich" },
        { label: "MapCreator", value: "Integrierter Editor für Ihr eigenes MIDI-Routing" },
        { label: "Ebenen", value: "Bis zu 12 pro Map, um Registrierungen zu kombinieren" },
        { label: "Schalter", value: "Registerschalter (Patch-Switches) und Tonschalter" },
        { label: "Ausgänge", value: "2 zu den internen Klangmodulen, 2 frei zuweisbar" },
        { label: "Kanäle", value: "64 adressierbar (4 × 16)" },
        { label: "Wiederholung", value: "Mandolinen-Effekt mit einstellbarer Geschwindigkeit und Tastverhältnis" },
        { label: "Timing", value: "Steuerung auf die Millisekunde; Drum-Delay ein (Notenbuch) oder aus (Arrangement)" },
        { label: "Tonlänge", value: "Globale Anpassung in Millisekunden" },
        { label: "Export", value: "Direkte Aufnahme als WAV" },
        { label: "Eingang", value: "Jeder MIDI-Eingang, z. B. loopMIDI aus Ihrer DAW" },
        { label: "Einsatz", value: "Straßenorgeln und Pfeifenorgeln; Samples von Schlagwerk oder Glockenspiel ergänzen" },
      ],
    },
    {
      type: "site_faq",
      primary: {
        eyebrow: "Fragen",
        title: "Zu MIDIMapper",
      },
      items: [
        {
          question: "Für wen ist MIDIMapper gedacht?",
          answer:
            "Für Arrangeure, die für Straßenorgeln oder Pfeifenorgeln schreiben und Registrierungen schon während der Arbeit hören möchten.",
        },
        {
          question: "Funktioniert es mit meiner DAW?",
          answer:
            "Es funktioniert mit jeder Software, die MIDI sendet. Leiten Sie das MIDI über ein virtuelles MIDI-Kabel wie loopMIDI an MIDIMapper.",
        },
        {
          question: "Kann ich eigene Samples verwenden?",
          answer: "Ja. MIDIMapper unterstützt eigene Samples, zum Beispiel Schlagwerk oder Glockenspiel, um den Klang einer Orgel zu vervollständigen.",
        },
        {
          question: "Warum Tonlängen anpassen?",
          answer:
            "Das Timing des Mappers, die Tonlängen im Notenbuch und das Ansprechverhalten der echten Orgel unterscheiden sich. Mit einer globalen Tonlänge in Millisekunden gleichen Sie das aus, und der Drum-Delay-Schalter passt das Timing an Notenbuch oder Arrangement an.",
        },
        {
          question: "Wie kaufe ich die Vollversion?",
          answer:
            "Im [Shop](/software/midi-mapper): 150 € zzgl. MwSt. Dort finden Sie auch die kostenlose Testversion, damit Sie MIDIMapper zuerst mit Ihren eigenen Arrangements ausprobieren können.",
        },
      ],
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "MIDIMapper",
        title: "Hören Sie Ihr nächstes Arrangement vor der Orgel",
        body: "Laden Sie die kostenlose Testversion im Shop herunter und verbinden Sie sie mit Ihrer DAW. Wenn Sie so weit sind, kaufen Sie die Vollversion im Shop.",
        price: "150 €",
        price_note: "zzgl. MwSt., Vollversion",
        primary_cta_label: "Kostenlose Testversion im Shop",
        primary_cta_link: "/software/midi-mapper",
        secondary_cta_label: "Im Shop kaufen",
        secondary_cta_link: "/software/midi-mapper",
        tone: "Dark band",
      },
    },
  ],
};

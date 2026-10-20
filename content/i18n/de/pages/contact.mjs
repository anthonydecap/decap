/** Contact page (Prismic page "contact"): enquiry form to the Herentals workshop, address and contact details. German. */
export default {
  type: "page",
  uid: "contact",
  lang: "de-de",
  title: "Kontakt Decap Herentals",
  theme: "decap",
  meta_title: "Kontakt zur Orgelwerkstatt | Decap Herentals",
  meta_description:
    "Fragen zu neuen Orgeln, selbstspielenden Instrumenten, MIDI-Umbau oder Software. Decap Herentals, Langepad 51C, 2200 Herentals, Belgien. +32 14 22 44 94.",
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Centered",
        eyebrow: "Kontakt",
        title: "Kontakt zur Decap-Orgelwerkstatt in Herentals",
        intro:
          "Erzählen Sie uns, was Sie vorhaben: eine neue Orgel, ein Instrument, ein MIDI-Umbau oder eine Frage zu unserer Software. Je mehr Sie uns über den Raum und die Musik sagen, desto nützlicher ist unsere erste Antwort.",
      },
    },
    {
      type: "contact_form",
      primary: {
        eyebrow: "Anfrage senden",
        title: "Wobei können wir Ihnen helfen?",
        recipient: "decap",
        topics: "Allgemeine Frage, Neue Orgel, Instrumente, MIDI-Umbau, Software, Presse",
        default_topic: "Allgemeine Frage",
        show_phone: true,
        show_location: true,
        message_placeholder:
          "Für eine neue Orgel: Wo wird sie spielen, welche Musik, und ungefähr welche Größe oder welches Budget? Für einen MIDI-Umbau: Welche Orgel und wie viele Tasten?",
        submit_label: "Anfrage senden",
        success_title: "Vielen Dank, Ihre Anfrage ist unterwegs",
        success_body: "Wir lesen jede Nachricht in der Werkstatt und antworten persönlich.",
        aside_title: "Die Werkstatt",
        aside_body:
          "**Decap Herentals**, Langepad 51C, 2200 Herentals, Belgien\n\n**Telefon:** +32 14 22 44 94\n\n**E-Mail:** [info@decap.be](mailto:info@decap.be)\n\nDECAP TONY BV · BE 0450.352.984\n\nSie möchten eine historische Orgel restaurieren lassen? Wenden Sie sich direkt an [Atelier Frank Decap](/frank-decap).",
      },
    },
    {
      type: "site_faq",
      primary: {
        eyebrow: "Bevor Sie schreiben",
        title: "Gut zu wissen",
        tone: "Tinted",
      },
      items: [
        {
          question: "Kann ich die Werkstatt in Herentals besuchen?",
          answer:
            "Die Werkstatt ist nicht für Besichtigungen geöffnet: Hier werden die Orgeln gebaut. Von Zeit zu Zeit veranstalten wir Tage der offenen Tür. Bauen wir eine Orgel für Sie, besuchen Sie die Werkstatt während des Baus mehrmals und sehen, wie sie vorankommt.",
        },
        {
          question: "Liefern Sie auch außerhalb Belgiens?",
          answer:
            "Ja, wir liefern weltweit. Decap-Orgeln und -Instrumente spielen in Japan, den USA, Australien, Asien und in ganz Europa. Versand und Installation hängen vom Projekt ab und sind Teil Ihres Angebots.",
        },
        {
          question: "Wer restauriert historische Orgeln?",
          answer:
            "Die Restaurierung ist die Arbeit von Atelier Frank Decap, dem eigenständigen Betrieb von Tonys Bruder Frank. Nutzen Sie das Formular auf [seiner Seite](/frank-decap), dann erreicht Ihre Nachricht ihn direkt.",
        },
      ],
    },
  ],
};

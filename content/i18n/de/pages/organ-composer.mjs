/** Organ Composer page (Prismic page "organ-composer"): pick a starting design and send it as a consultation request. German. */
export default {
  type: "page",
  uid: "organ-composer",
  lang: "de-de",
  title: "Organ Composer",
  theme: "decap",
  meta_title: "Organ Composer: Ihre Tanzorgel entwerfen | Decap",
  meta_description:
    "Wählen Sie einen Ausgangsentwurf, dann Größe, Klang, Register und Frontinstrumente, und senden Sie ihn an Decap Herentals. Wir antworten mit einer ersten Idee.",
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Centered",
        eyebrow: "Organ Composer",
        title: "Stellen Sie Ihre Orgel zusammen",
        intro:
          "Wählen Sie einen Ausgangsentwurf und beantworten Sie ein paar Fragen zu Raum, Klang und Frontinstrumenten. Das dauert wenige Minuten und gibt uns einen klaren Ausgangspunkt für das erste Gespräch.",
        note: "Kein Preisrechner und keine Bestellung. Jede Orgel wird nach einer Beratung bestätigt.",
      },
    },
    {
      type: "organ_composer",
      primary: {
        eyebrow: "Schritt 1",
        title: "Wählen Sie einen Ausgangsentwurf",
        intro:
          "Beginnen Sie mit einer unserer modularen Orgeln oder mit einem maßgefertigten Entwurf, den wir schon gebaut haben. Dann wählen Sie, wo die Orgel spielen wird, die Größe, Pfeifen oder digital, die Register und was in der Front spielt.",
        bespoke_note:
          "Sie möchten etwas, das keiner dieser Entwürfe zeigt? Wählen Sie **Bei null anfangen** und beschreiben Sie Ihre Idee in der Nachricht. Maßgefertigte Orgeln beginnen mit einer Beratung und einem 3D-Rendering. Nichts steht fest, bevor Sie es gesehen haben.",
        success_title: "Ihr Ausgangspunkt ist unterwegs",
        success_body:
          "Vielen Dank. Ihre Auswahl ist bei uns in Herentals angekommen. Wir antworten mit Fragen und einer ersten Idee.",
      },
      items: [
        {
          name: "Modulare Tanzorgel, 105 Tasten",
          kind: "Modular",
          description: "Aus bewährten Modulen auf unserer Standardskala mit 105 Tasten gebaut. Spielt über den Virtual-Orchestrion-Player auch Musik für 121 Tasten.",
          image_brief: "Existing 3D render of the modular 105-key dance organ, front view, plain background, 4:3",
        },
        {
          name: "Modulare Tanzorgel, 121 Tasten",
          kind: "Modular",
          description: "Aus bewährten Modulen auf unserer Standardskala mit 121 Tasten gebaut, für mehr Töne und mehr Register.",
          image_brief: "Existing 3D render of the modular 121-key dance organ, front view, plain background, 4:3",
        },
        {
          name: "Maßgefertigte Orgel im eigenen Stil",
          kind: "Bespoke",
          description: "Gehäuse, Farben und Name für einen einzigen Besitzer entworfen, wie die abgerundete Isabella im Stil der 70er-Jahre. Pfeifen, Akkordeons und Schlagzeug in der Front.",
          image_brief: "Existing 3D render of a bespoke Decap concert organ, front three-quarter view, plain background, 4:3",
        },
        {
          name: "Maßgefertigtes Orchestrion",
          kind: "Bespoke",
          description: "Ein komplettes Orchestrion mit zwei Akkordeons, Pfeifen, Perkussion und Schlagzeug, entworfen für den Raum, in dem es spielt.",
          image_brief: "Existing 3D render of a bespoke Decap street organ, front three-quarter view, plain background, 4:3",
        },
      ],
    },
    {
      type: "site_faq",
      primary: {
        eyebrow: "Fragen",
        title: "Zum Organ Composer",
      },
      items: [
        {
          question: "Ist das Senden eines Entwurfs verbindlich?",
          answer: "Nein. Es ist eine Anfrage für eine Beratung, keine Bestellung. Nichts steht fest, bevor Sie eine Bestellung bei uns bestätigen.",
        },
        {
          question: "Was passiert, nachdem ich ihn gesendet habe?",
          answer:
            "Wir lesen Ihre Auswahl und antworten mit Fragen und einer ersten Idee. Dann besprechen wir Raum, Musik und Budget und arbeiten auf einen Entwurf und ein 3D-Rendering hin. [So bauen wir eine Orgel](/organs).",
        },
        {
          question: "Kann ich bei null anfangen?",
          answer:
            "Ja. Wählen Sie **Bei null anfangen** und beschreiben Sie, was Ihnen vorschwebt. Jede Option lässt sich später ändern, und eine komplett maßgefertigte Orgel ist immer möglich.",
        },
      ],
    },
  ],
};

/** Work case study (Prismic project "pat-metheny"), German. */
export default {
  type: "project",
  uid: "pat-metheny",
  lang: "de-de",
  title: "Pat Metheny",
  theme: "decap",
  meta_title: "Pat Metheny und Decap | Projekte | Decap Herentals",
  meta_description:
    "Decap Herentals baute ein Orchestrion für Jazzgitarrist Pat Metheny. Er tourte damit in vielen Produktionen um die Welt, bis zu seinem letzten Belgien-Konzert.",
  fields: {
    summary: "Ein Orchestrion aus Herentals, mit dem er in vielen seiner Produktionen um die Welt tourte.",
    client: "Pat Metheny",
    location: "Weltweit",
  },
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Projekte",
        title: "Ein Orchestrion für Pat Metheny",
        intro: "Wir haben ein Orchestrion für Pat Metheny gebaut. Er tourte damit in vielen seiner Produktionen um die Welt. Auch bei seinem letzten Konzert in Belgien, im BOZAR in Brüssel, war es dabei.",
        primary_cta_label: "Alle Projekte",
        primary_cta_link: "/work",
        image_brief: "Pat Metheny with the Decap instrument(s) on stage or in the studio, 4:3",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Das Projekt",
        title: "Gebaut für Welttourneen",
        body:
          "Ein Orchestrion ist eine Band aus akustischen Instrumenten, die von einer Maschine gespielt wird. Pat Metheny spielt auf der Bühne mit ihm zusammen: Die Instrumente folgen seinem Spiel und seinen Arrangements, Abend für Abend, jeden Abend in einem anderen Saal.\n\nDas verlangt viel von einem Instrument. Es muss reisen, Auf- und Abbau überstehen und mit dem Timing und der Dynamik eines Jazzmusikers spielen.\n\nDas Orchestrion begleitete ihn über viele Produktionen. Als er zuletzt in Belgien spielte, im BOZAR in Brüssel, stand es mit ihm auf der Bühne.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "The Decap-built instrument from this project in the Herentals workshop before shipping, 4:3",
      },
    },
    {
      type: "site_facts",
      primary: {
        eyebrow: "Auf einen Blick",
        title: "Projektdaten",
        layout: "Spec list",
      },
      items: [
        { label: "Künstler", value: "Pat Metheny" },
        { label: "Gebaut von Decap", value: "Ein Orchestrion" },
        { label: "Eingesetzt bei", value: "Welttourneen, vielen Produktionen" },
        { label: "In Belgien", value: "BOZAR, Brüssel" },
      ],
    },
    {
      type: "site_video",
      primary: {
        eyebrow: "Video",
        title: "Die Instrumente in Aktion",
        video_brief: "Video of Pat Metheny playing with the Decap instrument(s)",
      },
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "Ihr Projekt",
        title: "Sie brauchen ein akustisches Instrument, das über MIDI spielt?",
        body: "Sagen Sie uns, was es spielen soll und wo. Wir antworten mit Fragen und einer ersten Idee.",
        primary_cta_label: "Projekt beschreiben",
        primary_cta_link: "/contact",
        secondary_cta_label: "Selbstspielende Instrumente",
        secondary_cta_link: "/instruments",
        tone: "Dark band",
      },
    },
  ],
};

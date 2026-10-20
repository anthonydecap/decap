/** Work case study (Prismic project "yves-rechsteiner"), German. */
export default {
  type: "project",
  uid: "yves-rechsteiner",
  lang: "de-de",
  title: "Yves Rechsteiner: L'Explorateur",
  theme: "decap",
  meta_title: "L'Explorateur: mobile Konzertorgel | Decap Herentals",
  meta_description:
    "L'Explorateur, die mobile Konzertorgel von Yves Rechsteiner: eine transportable Pfeifenorgel mit SmartValve an jeder Pfeife, der erste Windsynthesizer. 2025.",
  fields: {
    summary: "Eine transportable Konzertorgel mit SmartValve an jeder Pfeife, für den Organisten Yves Rechsteiner.",
    client: "Yves Rechsteiner",
    year: "2025",
    location: "Toulouse, Frankreich",
  },
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Projekte · 2025",
        title: "L'Explorateur: eine mobile Konzertorgel mit SmartValve an jeder Pfeife",
        intro:
          "Der Schweizer Organist Yves Rechsteiner wollte eine Orgel, die er an Orte mitnehmen kann, an denen es keine gibt. Wir haben L'Explorateur gebaut: eine transportable Pfeifenorgel, in der jede Pfeife ihr eigenes SmartValve hat. Das Ergebnis ist der erste Windsynthesizer der Welt.",
        primary_cta_label: "Mehr über SmartValve",
        primary_cta_link: "/smartvalve",
        secondary_cta_label: "Alle Projekte",
        secondary_cta_link: "/work",
        image_brief: "L'Explorateur set up in a chapel, Yves Rechsteiner at the console, wide shot, 4:3",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Die Aufgabe",
        title: "Eine Orgel, die zum Publikum reist",
        body:
          "Viele Konzertsäle haben keine Pfeifenorgel, und eine Kirchenorgel kann ihre Kirche nicht verlassen. Yves Rechsteiner wünschte sich ein Instrument, das er transportieren, aufbauen und überall dort spielen kann, wo das Konzert stattfindet.\n\nWir haben L'Explorateur zuerst in 3D entworfen, so war jedes Detail von Gehäuse und Pfeifenanordnung abgestimmt, bevor die Produktion begann.\n\nDie Orgel ist modular und hat deshalb keine feste Pfeifenzahl: Sie wird für jedes Programm und jeden Ort neu zusammengestellt. Ihr Standort ist Toulouse.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "3D render of L'Explorateur next to a photo of the finished organ, 4:3",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Die Technik",
        title: "Jede Pfeife mit eigenem Ventil und Prozessor",
        body:
          "Ein klassisches Orgelventil ist offen oder geschlossen. In L'Explorateur hat jede Pfeife ihr eigenes SmartValve, das den Luftstrom mehr als 1.000-mal pro Sekunde regelt. So hat der Organist jede einzelne Note in der Hand:",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        cta_label: "So funktioniert SmartValve",
        cta_link: "/smartvalve",
        image_brief: "Close-up of the SmartValves under the pipes inside L'Explorateur, dark background, 4:3",
        tone: "Tinted",
      },
      items: [
        { point: "Winddruck von 0 bis 200 %, pro Pfeife gespeichert" },
        { point: "4 ms Ansprechzeit, mit PID-Regelung" },
        { point: "Vibrato, Slope, Decay und LFO-Effekte pro Note" },
        { point: "Optisches MIDI: 100-fache MIDI-Geschwindigkeit, über Kabel von 200 m und mehr" },
      ],
    },
    {
      type: "site_quote",
      primary: {
        quote:
          "„…eine modulare Orgel… entwickelt von Tony Decap“, deren Ventiltechnik „eine Pfeifenorgel im Grunde in einen physischen Synthesizer verwandelt“.",
        name: "Studio 31, Basel",
        role: "Über L'Explorateur",
      },
    },
    {
      type: "site_facts",
      primary: {
        eyebrow: "Auf einen Blick",
        title: "L'Explorateur",
        layout: "Spec list",
      },
      items: [
        { label: "Organist", value: "Yves Rechsteiner" },
        { label: "Fertiggestellt", value: "2025" },
        { label: "Typ", value: "Transportable, modulare Konzertorgel" },
        { label: "Standort", value: "Toulouse" },
        { label: "Pfeifensteuerung", value: "SmartValve an jeder Pfeife" },
        { label: "Ventilregelung", value: "Mehr als 1.000-mal pro Sekunde" },
        { label: "Druckbereich", value: "0–200 %, pro Pfeife" },
        { label: "Im Konzert", value: "Lyon, Chapelle de la Trinité, 14. November 2025" },
      ],
    },
    {
      type: "site_video",
      primary: {
        eyebrow: "Hören",
        title: "L'Explorateur im Konzert",
        video_brief:
          "Video of Yves Rechsteiner playing L'Explorateur in concert, e.g. Lyon, Chapelle de la Trinité",
      },
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "SmartValve für Ihre Orgel",
        title: "Geben Sie jeder Pfeife ihre eigene Dynamik",
        body: "SmartValve arbeitet in neuen Orgeln und in unseren Instrumenten. Erzählen Sie uns von Ihrer Orgel, und wir sagen Ihnen, was möglich ist.",
        primary_cta_label: "SmartValve entdecken",
        primary_cta_link: "/smartvalve",
        secondary_cta_label: "Beratung anfragen",
        secondary_cta_link: "/contact",
        tone: "Dark band",
      },
    },
  ],
};

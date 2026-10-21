/** Work case study (Prismic project "walter-hus-belem"), German. */
export default {
  type: "project",
  uid: "walter-hus-belem",
  lang: "de-de",
  title: "Walter Hus, BELEM und The Mekanics",
  theme: "decap",
  meta_title: "Walter Hus, BELEM & The Mekanics | Decap Herentals",
  meta_description:
    "Das mechanische Orchester von Walter Hus mit BELEM (Didier Laloy, Kathy Adam) in The Mekanics, und das Decap-Orchestrion im Flagey mit dem Zenne Quartet.",
  fields: {
    summary: "Decap-Instrumente im mechanischen Orchester von Walter Hus, für The Mekanics von BELEM und im Flagey.",
    client: "Walter Hus, BELEM",
    year: "Um 2017",
    location: "Brüssel, Belgien",
  },
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Projekte",
        title: "Ein Decap-Orchestrion mit Walter Hus und BELEM",
        intro:
          "Der Komponist Walter Hus spielt ein mechanisches Orchester aus Decap-Instrumenten: transportable Pfeifeneinheiten, eine Percussion Unit und ein Akkordeon, gebaut um 2017. Mit BELEM, dem Duo aus Akkordeonist Didier Laloy und Cellistin Kathy Adam, wurde daraus *The Mekanics*.",
        primary_cta_label: "Selbstspielende Instrumente",
        primary_cta_link: "/instruments",
        secondary_cta_label: "Alle Projekte",
        secondary_cta_link: "/work",
        image_brief: "Didier Laloy and Kathy Adam on stage in front of the mechanical orchestra, 4:3",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "The Mekanics",
        title: "Akkordeon, Cello und ein Orguedinateur",
        body:
          "BELEM, das sind Akkordeon und Cello. Für *The Mekanics* kam das mechanische Orchester von Walter Hus hinzu, das er *Orguedinateur* nennt: Orgel und Computer in einem Wort. Das Ergebnis ist ein Album, das von Filmmusik über Balkanrhythmen bis zu Barock und Jazz reicht.\n\nDie Pfeifeneinheiten sind für die Reise gebaut, so geht das Orchester mit den Musikern auf Tournee.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "The orguedinateur instruments close up, 4:3",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Im Konzert",
        title: "Das Decap-Orchestrion im Flagey",
        body:
          "Im Flagey in Brüssel gaben Walter Hus und das Zenne Quartet ein Konzert mit dem Titel *Decap orchestrion*: ein Konzert für Streichquartett und Orchestrion. [Das Konzert auf der Website von Flagey](https://www.flagey.be/en/activity/13535-decap-orchestrion-walter-hus-zenne-quartet-concerto-for-string-quartet-orchestrion).",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        image_brief: "The orchestrion on stage at Flagey with the Zenne Quartet, 4:3",
        tone: "Tinted",
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
        { label: "Komponist", value: "Walter Hus" },
        { label: "Mit", value: "BELEM: Didier Laloy (Akkordeon), Kathy Adam (Cello)" },
        { label: "Projekt", value: "The Mekanics" },
        { label: "Konzert", value: "Decap orchestrion, Flagey, Brüssel, mit dem Zenne Quartet" },
        { label: "Gebaut von Decap", value: "Transportable Pfeifeneinheiten, eine Percussion Unit und ein Akkordeon" },
        { label: "Gebaut", value: "Um 2017" },
      ],
    },
    {
      type: "site_video",
      primary: {
        eyebrow: "Video",
        title: "The Mekanics, live",
        video: "https://www.youtube.com/watch?v=uIrJGwcmgwY",
        video_brief: "Live clip of BELEM and Walter Hus with the mechanical orchestra",
      },
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "Für Komponisten",
        title: "Komponieren Sie für akustische Instrumente, die über MIDI spielen",
        body: "Sagen Sie uns, was Ihr Stück braucht. Wir antworten mit den passenden Instrumenten und wie Sie sie von Ihrem eigenen Setup aus ansteuern.",
        primary_cta_label: "Projekt beschreiben",
        primary_cta_link: "/contact",
        secondary_cta_label: "Instrumente ansehen",
        secondary_cta_link: "/instruments",
        tone: "Dark band",
      },
    },
  ],
};

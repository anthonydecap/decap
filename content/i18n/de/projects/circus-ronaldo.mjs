/** Work case study (Prismic project "circus-ronaldo"), German. */
export default {
  type: "project",
  uid: "circus-ronaldo",
  lang: "de-de",
  title: "Circus Ronaldo",
  theme: "decap",
  meta_title: "Circus Ronaldo und Decap-Orgeln | Decap Herentals",
  meta_description:
    "Maßgefertigte Instrumente von Decap Herentals in den Kulissen mehrerer Produktionen von Circus Ronaldo, dazu Brass Core für Blechbläser ohne Musiker.",
  fields: {
    summary: "Maßgefertigte Instrumente, eingebaut in die Kulissen mehrerer Produktionen, und Brass Core für live gespielte Blechbläser ohne Musiker.",
    client: "Circus Ronaldo",
    location: "Belgien",
  },
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Projekte",
        title: "Instrumente in der Kulisse für Circus Ronaldo",
        intro:
          "Für mehrere Produktionen von Circus Ronaldo haben wir vollständig maßgefertigte Instrumente gebaut, die in der Kulisse selbst sitzen. Die Truppe nutzt außerdem Brass Core, unseren robotischen Blechbläser.",
        primary_cta_label: "Mehr über Brass Core",
        primary_cta_link: "/brass-core",
        secondary_cta_label: "Alle Projekte",
        secondary_cta_link: "/work",
        image_brief: "The Decap organ in the Circus Ronaldo tent, performers in front, 4:3",
      },
    },
    {
      type: "site_video",
      primary: {
        eyebrow: "Video",
        title: "Circus Ronaldo mit einer Orgel von Tony Decap",
        video: "https://www.youtube.com/watch?v=XQf13I7nTdY",
        caption: "Circus Ronaldo mit einer Orgel von Tony Decap, YouTube.",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Brass Core",
        title: "Live-Blechbläser, gespielt von einem Audiosignal",
        body:
          "Brass Core bringt eine echte Trompete oder Posaune auf die Bühne und spielt sie mit Ihrem eigenen Audio- oder MIDI-Signal. Ein Schwingspulenmotor in einer Druckkammer ersetzt die Lippen des Musikers, und die Resonanz des Instruments formt den Klang. Kein Bohren, keine Änderungen am Instrument.\n\nCircus Ronaldo setzt es für seine automatisierte Bläsersektion ein.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        cta_label: "Brass Core — Orchestrionix",
        cta_link: "/brass-core",
        image_brief: "Brass Core mounted on a trumpet, against a dark backdrop, side view, 4:3",
        tone: "Tinted",
      },
    },
    {
      type: "site_quote",
      primary: {
        quote:
          "Brass Core ist das schlagende Herz unserer automatisierten Bläsersektion geworden. Wir wollten Blasmusik nicht einfach über die PA abspielen – das Publikum sollte sie spüren, als stünde eine echte Kapelle auf der Bühne.\n\nDie Leute fragen uns oft, wo sich die Blaskapelle versteckt – so überzeugend ist es. Es ist nicht nur Klang. Es ist Präsenz.",
        role: "Über Brass Core",
        name: "Circus Ronaldo",
      },
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "Theater und Zirkus",
        title: "Akustische Instrumente, die auf das Stichwort genau spielen",
        body: "Erzählen Sie uns von der Show und den Instrumenten, die Sie brauchen. Wir antworten, was passt und wie es sich mit Ihrem Mischpult verbindet.",
        primary_cta_label: "Show beschreiben",
        primary_cta_link: "/contact",
        secondary_cta_label: "Brass Core entdecken",
        secondary_cta_link: "/brass-core",
        tone: "Dark band",
      },
    },
  ],
};

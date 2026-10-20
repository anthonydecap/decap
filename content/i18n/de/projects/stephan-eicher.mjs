/** Work case study (Prismic project "stephan-eicher"), German. */
export default {
  type: "project",
  uid: "stephan-eicher",
  lang: "de-de",
  title: "Stephan Eicher und die Automaten",
  theme: "decap",
  meta_title: "Stephan Eicher und die Automaten | Decap Herentals",
  meta_description:
    "Automatisierte akustische Instrumente von Decap Herentals für Stephan Eicher und die Automaten und sein Album Ode. Über MIDI gespielt, mit Dynamik pro Note.",
  fields: {
    summary: "Mehrere selbstspielende Instrumente für verschiedene Produktionen von Stephan Eicher und die Automaten und sein Album Ode.",
    client: "Stephan Eicher",
    location: "Europa",
  },
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Projekte",
        title: "Selbstspielende Instrumente auf Tournee mit Stephan Eicher",
        intro:
          "Bei *Stephan Eicher und die Automaten* steht der Schweizer Liedermacher allein auf der Bühne, mit einer Band aus automatisierten akustischen Instrumenten. Wir haben mehrere dieser Instrumente und Orchestrion-Einheiten gebaut, für verschiedene Produktionen der Show.",
        primary_cta_label: "Selbstspielende Instrumente",
        primary_cta_link: "/instruments",
        secondary_cta_label: "Alle Projekte",
        secondary_cta_link: "/work",
        image_brief: "Stephan Eicher on stage surrounded by the automated instruments, wide shot, 4:3",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Die Aufgabe",
        title: "Instrumente, die dem Sänger folgen",
        body:
          "Die Lieder von Stephan Eicher brauchten Instrumente mit Dynamik. Instrumente, die Töne nur ein- und ausschalten, hätten ihm nicht folgen können. Unsere spielen jede Note mit ihrer eigenen Anschlagstärke, so folgt die automatisierte Band dem Lied.\n\nDie Show tourte weit, vom Bardentreffen in Nürnberg bis zur Rockhal in Esch-sur-Alzette, und die Instrumente reisten mit: aufgebaut, gespielt und wieder verpackt, jedes Mal an einem anderen Ort.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "The tour instruments lined up in the Herentals workshop before shipping, 4:3",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Auf Platte",
        title: "Zurück im Studio für Ode",
        body:
          "Stephan Eicher setzte die Instrumente auch im Studio ein, auf seinem Album *Ode*.",
        media_side: "Image left",
        aspect: "Square",
        image_brief: "Album cover of Ode next to one of the instruments, square",
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
        { label: "Künstler", value: "Stephan Eicher" },
        { label: "Show", value: "Stephan Eicher und die Automaten" },
        { label: "Album", value: "Ode" },
        { label: "Gebaut von Decap", value: "Mehrere Instrumente und Orchestrion-Einheiten, für verschiedene Produktionen" },
        { label: "Steuerung", value: "MIDI, mit Anschlagstärke pro Note" },
      ],
    },
    {
      type: "site_video",
      primary: {
        eyebrow: "Video",
        title: "Und die Automaten, live",
        video_brief: "Live clip of Stephan Eicher und die Automaten",
      },
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "Auf der Bühne",
        title: "Sie planen eine Show mit selbstspielenden Instrumenten?",
        body: "Nennen Sie uns die Lieder, die Bühne und die Tourdaten. Wir antworten mit den passenden Instrumenten und wie sie gesteuert werden.",
        primary_cta_label: "Show beschreiben",
        primary_cta_link: "/contact",
        secondary_cta_label: "Instrumente ansehen",
        secondary_cta_link: "/instruments",
        tone: "Dark band",
      },
    },
  ],
};

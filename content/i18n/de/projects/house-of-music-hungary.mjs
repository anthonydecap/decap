/** Work case study (Prismic project "house-of-music-hungary"), German. */
export default {
  type: "project",
  uid: "house-of-music-hungary",
  lang: "de-de",
  title: "House of Music Hungary: Creative Sound Space",
  theme: "decap",
  meta_title: "Roboterorchester, House of Music Hungary | Decap",
  meta_description:
    "Ein Roboterorchester von Decap Herentals für den Creative Sound Space im House of Music Hungary in Budapest. Zu hören bei den Robotorgona-Konzerten.",
  fields: {
    summary: "Automatisierte Instrumente für das Roboterorchester im Creative Sound Space, gemeinsam mit Medence Design.",
    client: "House of Music Hungary, mit Medence Design",
    year: "2022",
    location: "Budapest, Ungarn",
  },
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Projekte · Budapest",
        title: "Ein Roboterorchester für das House of Music Hungary",
        intro:
          "Der Creative Sound Space im House of Music Hungary in Budapest umfasst acht Installationen rund um den Klang, gestaltet von Medence Design. Eine davon ist ein Roboterorchester aus unseren automatisierten Instrumenten.",
        primary_cta_label: "Selbstspielende Instrumente",
        primary_cta_link: "/instruments",
        secondary_cta_label: "Alle Projekte",
        secondary_cta_link: "/work",
        note: "Fotos: Mohai Balázs, 2022",
        image_brief: "The robot orchestra in the Creative Sound Space, wide shot with visitors, 4:3 (photo Mohai Balázs)",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Das Projekt",
        title: "Acht Installationen, ein Roboterorchester",
        body:
          "Medence Design hat den Creative Sound Space als acht Installationen angelegt, in denen Besucher den Klang erkunden. Wir haben fast alle Instrumente des interaktiven Raums gebaut, einschließlich des Roboterorchesters. Die Steuerungssoftware des Raums stammt von anderen.\n\nDer Raum ist seit 2022 geöffnet.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "Close-up of the marimba and glockenspiel of the robot orchestra, 4:3 (photo Mohai Balázs)",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Im Konzert",
        title: "Robotorgona: Konzerte für das Roboterorchester",
        body:
          "Das House of Music Hungary veranstaltet im Creative Sound Space *Robotorgona*-Konzerte. Das Orchester wird vom Computer gesteuert und spielt:",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        image_brief: "Audience at a Robotorgona concert in front of the robot orchestra, 4:3 (photo Mohai Balázs)",
        tone: "Tinted",
      },
      items: [
        { point: "Marimba" },
        { point: "Akkordeon" },
        { point: "Pianino" },
        { point: "Glockenspiel" },
        { point: "Schlagzeug" },
        { point: "Eine Orgel mit fernsteuerbarem Winddruck" },
      ],
    },
    {
      type: "site_facts",
      primary: {
        eyebrow: "Auf einen Blick",
        title: "Projektdaten",
        layout: "Spec list",
      },
      items: [
        { label: "Ort", value: "House of Music Hungary, Budapest" },
        { label: "Ausstellungsgestaltung", value: "Medence Design" },
        { label: "Raum", value: "Creative Sound Space, acht Installationen" },
        { label: "Geöffnet seit", value: "2022" },
        { label: "Instrumente", value: "Marimba, Akkordeon, Pianino, Glockenspiel, Schlagzeug, Orgel" },
      ],
    },
    {
      type: "site_video",
      primary: {
        eyebrow: "Video",
        title: "Das Roboterorchester spielt",
        video_brief: "Clip of a Robotorgona concert in the Creative Sound Space",
      },
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "Museen und Ausstellungen",
        title: "Sie planen eine Installation mit selbstspielenden Instrumenten?",
        body: "Erzählen Sie uns vom Raum, den Besuchern und dem, was sie hören sollen. Wir antworten mit den passenden Instrumenten und wie sie gesteuert werden.",
        primary_cta_label: "Installation beschreiben",
        primary_cta_link: "/contact",
        secondary_cta_label: "Instrumente ansehen",
        secondary_cta_link: "/instruments",
        tone: "Dark band",
      },
    },
  ],
};

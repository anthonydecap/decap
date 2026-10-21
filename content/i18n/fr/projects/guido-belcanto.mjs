/** Work case study, French (Prismic project "guido-belcanto"): a Decap dance organ on stage in Balzaal der Gebroken Harten (2008). */
export default {
  type: "project",
  uid: "guido-belcanto",
  lang: "fr-fr",
  title: "Guido Belcanto : Balzaal der Gebroken Harten",
  theme: "decap",
  meta_title: "L'orgue de danse de Guido Belcanto sur scène | Decap",
  meta_description:
    "En 2008, Guido Belcanto part en tournée avec un orgue de danse Decap dans son spectacle Balzaal der Gebroken Harten, au volume et à la sensibilité réglables.",
  fields: {
    summary: "Un orgue Belcanto entièrement sur mesure, en tournée dans le spectacle de Guido Belcanto Balzaal der Gebroken Harten.",
    client: "Guido Belcanto",
    year: "2008",
    location: "Belgique",
  },
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Réalisations · 2008",
        title: "Un orgue de danse Decap en tournée avec Guido Belcanto",
        intro:
          "En 2008, le chanteur flamand Guido Belcanto emmène un orgue de danse Decap sur scène dans son spectacle *Balzaal der Gebroken Harten*. Nous l'avons construit pour lui de A à Z : l'orgue Belcanto. Il a tourné dans les plus grandes salles des centres culturels belges, aux côtés d'un chanteur.",
        primary_cta_label: "Nos orgues de danse",
        primary_cta_link: "/organs",
        secondary_cta_label: "Tous les projets",
        secondary_cta_link: "/work",
        image_brief: "Guido Belcanto on stage with the Decap dance organ behind him, 4:3",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Pourquoi ça a marché",
        title: "Sensibilité et volume sous contrôle",
        body:
          "Un orgue de danse est harmonisé pour remplir une salle de danse. Une scène de théâtre, avec un chanteur au micro, demande autre chose.\n\nSur un orgue Decap, la sensibilité et le volume sont réglables. Cela a permis de régler l'orgue pour chaque salle et de le faire jouer aux côtés d'un chanteur, soir après soir, dans les plus grands centres culturels de Belgique.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "Front of the Decap dance organ used in the show, front view, 4:3",
      },
    },
    {
      type: "site_card_grid",
      primary: {
        eyebrow: "Dans les coulisses",
        title: "Du camion à la scène, chaque soir",
        intro: "L’orgue Belcanto a tourné dans les plus grandes salles des centres culturels de Belgique. Chaque spectacle commençait par l’équipe DECAP qui déchargeait, montait et accordait l’orgue.",
        columns: "3",
        card_style: "Image cards",
      },
      items: [
        { title: "Déchargement", body: "Flight-cases et modules d’orgue passent du camion à la scène encore vide.", image_brief: "Backstage load-in with the DECAP crew, 4:3" },
        { title: "Montage de l’orgue", body: "L’orgue de scène modulaire est assemblé et câblé sur son châssis.", image_brief: "The modular stage organ being assembled, 4:3" },
        { title: "Prêt pour le spectacle", body: "Derniers réglages sous les projecteurs, quelques minutes avant l’entrée du public.", image_brief: "The organ backstage under an amber spotlight, crew at work, 4:3" },
      ],
    },
    {
      type: "site_facts",
      primary: {
        eyebrow: "En bref",
        title: "Le projet en chiffres",
        layout: "Spec list",
      },
      items: [
        { label: "Artiste", value: "Guido Belcanto" },
        { label: "Spectacle", value: "Balzaal der Gebroken Harten" },
        { label: "Année", value: "2008" },
        { label: "Sur scène", value: "Guido Belcanto, Lady Angelina, Vitalski et l'orgue Decap" },
        { label: "Instrument", value: "L'orgue Belcanto, un orgue de danse Decap entièrement sur mesure" },
        { label: "Tournée", value: "Les plus grandes salles des centres culturels belges" },
      ],
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "Orgues de danse",
        title: "Un orgue de danse adapté à votre salle",
        body: "Salle de danse, café ou théâtre : dites-nous où l'orgue jouera. Nous vous répondons avec des questions et une première idée de conception.",
        primary_cta_label: "Composer votre orgue",
        primary_cta_link: "/organ-composer",
        secondary_cta_label: "Demander une consultation",
        secondary_cta_link: "/contact",
        tone: "Dark band",
      },
    },
  ],
};

/** Work case study, French (Prismic project "house-of-music-hungary"): the robot orchestra in the Creative Sound Space, Budapest, with Medence Design. */
export default {
  type: "project",
  uid: "house-of-music-hungary",
  lang: "fr-fr",
  title: "House of Music Hungary : Creative Sound Space",
  theme: "decap",
  meta_title: "Orchestre robotisé, House of Music Hungary | Decap",
  meta_description:
    "Un orchestre robotisé de Decap Herentals pour le Creative Sound Space de la House of Music Hungary à Budapest, avec Medence Design, et les concerts Robotorgona.",
  fields: {
    summary: "Des instruments automatiques pour l'orchestre robotisé du Creative Sound Space, avec Medence Design.",
    client: "House of Music Hungary, avec Medence Design",
    year: "2022",
    location: "Budapest, Hongrie",
  },
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Réalisations · Budapest",
        title: "Un orchestre robotisé pour la House of Music Hungary",
        intro:
          "Le Creative Sound Space de la House of Music Hungary à Budapest compte huit installations consacrées au son, conçues par Medence Design. L'une d'elles est un orchestre robotisé composé de nos instruments automatiques.",
        primary_cta_label: "Instruments automatiques",
        primary_cta_link: "/instruments",
        secondary_cta_label: "Tous les projets",
        secondary_cta_link: "/work",
        note: "Photos : Mohai Balázs, 2022",
        image_brief: "The robot orchestra in the Creative Sound Space, wide shot with visitors, 4:3 (photo Mohai Balázs)",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Le projet",
        title: "Huit installations, un orchestre robotisé",
        body:
          "Medence Design a conçu le Creative Sound Space comme huit installations qui permettent aux visiteurs d'explorer le son. Nous avons construit presque tous les instruments de la salle interactive, orchestre robotisé compris. Le logiciel de commande de l'espace a été réalisé par d'autres.\n\nL'espace est ouvert depuis 2022.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "Close-up of the marimba and glockenspiel of the robot orchestra, 4:3 (photo Mohai Balázs)",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "En concert",
        title: "Robotorgona : des concerts pour l'orchestre robotisé",
        body:
          "La House of Music Hungary organise des concerts *Robotorgona* dans le Creative Sound Space. L'orchestre est commandé par ordinateur et joue :",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        image_brief: "Audience at a Robotorgona concert in front of the robot orchestra, 4:3 (photo Mohai Balázs)",
        tone: "Tinted",
      },
      items: [
        { point: "Marimba" },
        { point: "Accordéon" },
        { point: "Pianino" },
        { point: "Glockenspiel" },
        { point: "Batterie" },
        { point: "Un orgue avec commande de pression à distance" },
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
        { label: "Lieu", value: "House of Music Hungary, Budapest" },
        { label: "Scénographie", value: "Medence Design" },
        { label: "Espace", value: "Creative Sound Space, huit installations" },
        { label: "Ouvert depuis", value: "2022" },
        { label: "Instruments", value: "Marimba, accordéon, pianino, glockenspiel, batterie, orgue" },
      ],
    },
    {
      type: "site_video",
      primary: {
        eyebrow: "Regarder",
        title: "L'orchestre robotisé en action",
        video_brief: "Clip of a Robotorgona concert in the Creative Sound Space",
      },
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "Musées et expositions",
        title: "Vous préparez une installation avec des instruments automatiques ?",
        body: "Parlez-nous de l'espace, des visiteurs et de ce qu'ils doivent entendre. Nous vous répondons avec les instruments qui conviennent et leur mode de commande.",
        primary_cta_label: "Décrire votre installation",
        primary_cta_link: "/contact",
        secondary_cta_label: "Voir les instruments",
        secondary_cta_link: "/instruments",
        tone: "Dark band",
      },
    },
  ],
};

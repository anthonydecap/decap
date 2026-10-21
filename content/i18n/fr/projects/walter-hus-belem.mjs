/** Work case study, French (Prismic project "walter-hus-belem"): Walter Hus, BELEM and The Mekanics; the Decap orchestrion at Flagey. */
export default {
  type: "project",
  uid: "walter-hus-belem",
  lang: "fr-fr",
  title: "Walter Hus, BELEM et The Mekanics",
  theme: "decap",
  meta_title: "Walter Hus, BELEM et The Mekanics | Decap Herentals",
  meta_description:
    "L'orchestre mécanique de Walter Hus avec BELEM (Didier Laloy, Kathy Adam) dans The Mekanics, et l'orchestrion Decap en concert à Flagey avec le Zenne Quartet.",
  fields: {
    summary: "Des instruments Decap dans l'orchestre mécanique de Walter Hus, pour The Mekanics de BELEM et à Flagey.",
    client: "Walter Hus, BELEM",
    year: "Vers 2017",
    location: "Bruxelles, Belgique",
  },
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Réalisations",
        title: "Un orchestrion Decap avec Walter Hus et BELEM",
        intro:
          "Le compositeur Walter Hus joue avec un orchestre mécanique d'instruments Decap : des unités de tuyaux transportables, une unité de percussion et un accordéon, construits vers 2017. Avec BELEM, le duo de l'accordéoniste Didier Laloy et de la violoncelliste Kathy Adam, il est devenu *The Mekanics*.",
        primary_cta_label: "Instruments automatiques",
        primary_cta_link: "/instruments",
        secondary_cta_label: "Tous les projets",
        secondary_cta_link: "/work",
        image_brief: "Didier Laloy and Kathy Adam on stage in front of the mechanical orchestra, 4:3",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "The Mekanics",
        title: "Accordéon, violoncelle et orguedinateur",
        body:
          "BELEM, c'est un accordéon et un violoncelle. Pour *The Mekanics*, Walter Hus a ajouté son orchestre mécanique, qu'il appelle l'*orguedinateur* : un orgue et un ordinateur en un seul mot. Le résultat est un album qui passe de la musique de film aux rythmes des Balkans, au baroque et au jazz.\n\nLes unités de tuyaux sont conçues pour voyager : l'orchestre part en tournée avec les musiciens.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "The orguedinateur instruments close up, 4:3",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "En concert",
        title: "L'orchestrion Decap à Flagey",
        body:
          "À Flagey, à Bruxelles, Walter Hus et le Zenne Quartet ont donné un concert intitulé *Decap orchestrion* : un concerto pour quatuor à cordes et orchestrion. [Voir le concert sur le site de Flagey](https://www.flagey.be/en/activity/13535-decap-orchestrion-walter-hus-zenne-quartet-concerto-for-string-quartet-orchestrion).",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        image_brief: "The orchestrion on stage at Flagey with the Zenne Quartet, 4:3",
        tone: "Tinted",
      },
    },
    {
      type: "site_facts",
      primary: {
        eyebrow: "En bref",
        title: "Le projet en chiffres",
        layout: "Spec list",
      },
      items: [
        { label: "Compositeur", value: "Walter Hus" },
        { label: "Avec", value: "BELEM : Didier Laloy (accordéon), Kathy Adam (violoncelle)" },
        { label: "Projet", value: "The Mekanics" },
        { label: "Concert", value: "Decap orchestrion, Flagey, Bruxelles, avec le Zenne Quartet" },
        { label: "Construit par Decap", value: "Des unités de tuyaux transportables, une unité de percussion et un accordéon" },
        { label: "Construction", value: "Vers 2017" },
      ],
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "À voir",
        title: "The Mekanics, en live",
        body: "BELEM et Walter Hus avec l’orchestre mécanique. La vidéo s’ouvre sur YouTube.",
        primary_cta_label: "Voir sur YouTube",
        primary_cta_link: "https://www.youtube.com/watch?v=uIrJGwcmgwY",
        tone: "Tinted",
      },
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "Pour les compositeurs",
        title: "Écrivez pour des instruments acoustiques qui jouent en MIDI",
        body: "Dites-nous ce dont votre œuvre a besoin. Nous vous répondons avec les instruments qui conviennent et la façon de les piloter depuis votre propre installation.",
        primary_cta_label: "Décrire votre projet",
        primary_cta_link: "/contact",
        secondary_cta_label: "Voir les instruments",
        secondary_cta_link: "/instruments",
        tone: "Dark band",
      },
    },
  ],
};

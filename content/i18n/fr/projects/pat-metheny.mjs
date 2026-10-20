/** Work case study, French (Prismic project "pat-metheny"): the orchestrion Decap built, which Pat Metheny toured the world with. */
export default {
  type: "project",
  uid: "pat-metheny",
  lang: "fr-fr",
  title: "Pat Metheny",
  theme: "decap",
  meta_title: "Pat Metheny et Decap | Réalisations | Decap Herentals",
  meta_description:
    "Decap Herentals a construit un orchestrion pour le guitariste de jazz Pat Metheny, qui l'a emmené en tournée mondiale dans de nombreuses productions.",
  fields: {
    summary: "Un orchestrion construit à Herentals, emmené en tournée dans le monde entier dans nombre de ses productions.",
    client: "Pat Metheny",
    location: "Monde entier",
  },
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Réalisations",
        title: "Un orchestrion pour Pat Metheny",
        intro: "Nous avons construit un orchestrion pour Pat Metheny. Il l'a emmené en tournée dans le monde entier dans nombre de ses productions. Son dernier concert en Belgique, à BOZAR à Bruxelles, le mettait aussi en scène.",
        primary_cta_label: "Tous les projets",
        primary_cta_link: "/work",
        image_brief: "Pat Metheny with the Decap instrument(s) on stage or in the studio, 4:3",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Le projet",
        title: "Construit pour faire le tour du monde",
        body:
          "Un orchestrion est un orchestre d'instruments acoustiques joués par une machine. Pat Metheny joue à ses côtés sur scène : les instruments répondent à son jeu et à ses arrangements, soir après soir, dans une salle différente chaque fois.\n\nC'est beaucoup demander à un instrument. Il doit voyager, résister au montage et au démontage, et jouer avec le timing et la dynamique d'un musicien de jazz.\n\nL'orchestrion l'a accompagné pendant de nombreuses productions. Lors de son dernier concert en Belgique, à BOZAR à Bruxelles, il était sur scène avec lui.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "The Decap-built instrument from this project in the Herentals workshop before shipping, 4:3",
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
        { label: "Artiste", value: "Pat Metheny" },
        { label: "Construit par Decap", value: "Un orchestrion" },
        { label: "Utilisé lors de", value: "Tournées mondiales, nombreuses productions" },
        { label: "En Belgique", value: "BOZAR, Bruxelles" },
      ],
    },
    {
      type: "site_video",
      primary: {
        eyebrow: "Regarder",
        title: "Les instruments en action",
        video_brief: "Video of Pat Metheny playing with the Decap instrument(s)",
      },
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "Votre projet",
        title: "Besoin d'un instrument acoustique qui joue en MIDI ?",
        body: "Dites-nous ce qu'il doit jouer et où. Nous vous répondons avec des questions et une première idée.",
        primary_cta_label: "Décrire votre projet",
        primary_cta_link: "/contact",
        secondary_cta_label: "Instruments automatiques",
        secondary_cta_link: "/instruments",
        tone: "Dark band",
      },
    },
  ],
};

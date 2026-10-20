/** Organ Composer page, French (Prismic page "organ-composer"): pick a starting design and send it as a consultation request. */
export default {
  type: "page",
  uid: "organ-composer",
  lang: "fr-fr",
  title: "Organ Composer",
  theme: "decap",
  meta_title: "Organ Composer : concevez votre orgue de danse | Decap",
  meta_description:
    "Choisissez un modèle de départ, la taille, le son, les jeux et les instruments de façade, puis envoyez-le à Decap. Nous répondons avec une première idée.",
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Centered",
        eyebrow: "Organ Composer",
        title: "Composez votre orgue de danse",
        intro:
          "Choisissez un modèle de départ et répondez à quelques questions sur la salle, le son et les instruments de façade. Cela prend quelques minutes et nous donne un point de départ clair pour la première conversation.",
        note: "Ce n'est ni un calculateur de prix ni une commande. Chaque orgue est confirmé après une consultation.",
      },
    },
    {
      type: "organ_composer",
      primary: {
        eyebrow: "Étape 1",
        title: "Choisissez un modèle de départ",
        intro:
          "Partez de l'un de nos orgues modulaires ou d'un modèle sur mesure que nous avons déjà construit. Choisissez ensuite où il jouera, la taille, tuyaux ou numérique, les jeux et ce qui joue en façade.",
        bespoke_note:
          "Vous voulez quelque chose qu'aucun de ces modèles ne montre ? Choisissez **Partir de zéro** et décrivez votre idée dans le message. Les orgues sur mesure commencent par une consultation et un rendu 3D : rien n'est fixé avant que vous l'ayez vu.",
        success_title: "Votre point de départ est en route",
        success_body:
          "Merci. Vos choix sont bien arrivés chez nous à Herentals. Nous vous répondons avec des questions et une première idée.",
      },
      items: [
        {
          name: "Orgue de danse modulaire, 105 touches",
          kind: "Modular",
          description: "Construit à partir de modules éprouvés sur notre échelle standard de 105 touches. Joue la musique 121 touches grâce au lecteur Virtual Orchestrion.",
          image_brief: "Existing 3D render of the modular 105-key dance organ, front view, plain background, 4:3",
        },
        {
          name: "Orgue de danse modulaire, 121 touches",
          kind: "Modular",
          description: "Construit à partir de modules éprouvés sur notre échelle standard de 121 touches, pour plus de notes et plus de jeux.",
          image_brief: "Existing 3D render of the modular 121-key dance organ, front view, plain background, 4:3",
        },
        {
          name: "Orgue sur mesure dans son propre style",
          kind: "Bespoke",
          description: "Un buffet, des couleurs et un nom conçus pour un seul propriétaire, comme l'Isabella aux formes arrondies de style années 70. Tuyaux, accordéons et batterie en façade.",
          image_brief: "Existing 3D render of a bespoke Decap concert organ, front three-quarter view, plain background, 4:3",
        },
        {
          name: "Orchestrion sur mesure",
          kind: "Bespoke",
          description: "Un orchestrion complet avec deux accordéons, des tuyaux, des percussions et une batterie, conçu autour de la salle où il joue.",
          image_brief: "Existing 3D render of a bespoke Decap street organ, front three-quarter view, plain background, 4:3",
        },
      ],
    },
    {
      type: "site_faq",
      primary: {
        eyebrow: "Questions",
        title: "À propos de l'Organ Composer",
      },
      items: [
        {
          question: "L'envoi d'un modèle m'engage-t-il ?",
          answer: "Non. C'est une demande de consultation, pas une commande. Rien n'est fixé tant que vous ne nous avez pas confirmé une commande.",
        },
        {
          question: "Que se passe-t-il après l'envoi ?",
          answer:
            "Nous lisons vos choix et vous répondons avec des questions et une première idée. Ensuite, nous parlons de la salle, de la musique et du budget, et nous avançons vers une conception et un rendu 3D. [Voir comment nous construisons un orgue](/organs).",
        },
        {
          question: "Puis-je partir de zéro ?",
          answer:
            "Oui. Choisissez **Partir de zéro** et décrivez ce que vous avez en tête. Chaque option peut être modifiée par la suite, et un orgue entièrement sur mesure est toujours possible.",
        },
      ],
    },
  ],
};

/** Work case study, French (Prismic project "stephan-eicher"): automated instruments for "Stephan Eicher und die Automaten" and the album Ode. */
export default {
  type: "project",
  uid: "stephan-eicher",
  lang: "fr-fr",
  title: "Stephan Eicher und die Automaten",
  theme: "decap",
  meta_title: "Stephan Eicher und die Automaten | Decap Herentals",
  meta_description:
    "Des instruments acoustiques automatiques de Decap Herentals pour Stephan Eicher und die Automaten et l'album Ode. Joués en MIDI, avec des nuances.",
  fields: {
    summary: "Plusieurs instruments automatiques pour différentes productions de Stephan Eicher und die Automaten, et son album Ode.",
    client: "Stephan Eicher",
    location: "Europe",
  },
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Réalisations",
        title: "Des instruments automatiques en tournée avec Stephan Eicher",
        intro:
          "Dans *Stephan Eicher und die Automaten*, l'auteur-compositeur-interprète suisse est seul en scène avec un orchestre d'instruments acoustiques automatiques. Nous avons construit plusieurs de ces instruments et unités d'orchestrion, pour différentes productions du spectacle.",
        primary_cta_label: "Instruments automatiques",
        primary_cta_link: "/instruments",
        secondary_cta_label: "Tous les projets",
        secondary_cta_link: "/work",
        image_brief: "Stephan Eicher on stage surrounded by the automated instruments, wide shot, 4:3",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "La demande",
        title: "Des instruments qui suivent le chanteur",
        body:
          "Les chansons de Stephan Eicher demandaient des instruments capables de nuances. Des instruments qui se contentent d'allumer et d'éteindre des notes ne pouvaient pas le suivre. Les nôtres jouent chaque note avec sa propre vélocité : l'orchestre automatique suit la chanson.\n\nLe spectacle a beaucoup tourné, du festival Bardentreffen à Nuremberg à la Rockhal d'Esch-sur-Alzette, et les instruments ont voyagé avec lui : montés, joués et remballés dans une salle différente à chaque fois.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "The tour instruments lined up in the Herentals workshop before shipping, 4:3",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "En studio",
        title: "De retour en studio pour Ode",
        body:
          "Stephan Eicher a aussi utilisé les instruments en studio, sur son album *Ode*.",
        media_side: "Image left",
        aspect: "Square",
        image_brief: "Album cover of Ode next to one of the instruments, square",
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
        { label: "Artiste", value: "Stephan Eicher" },
        { label: "Spectacle", value: "Stephan Eicher und die Automaten" },
        { label: "Album", value: "Ode" },
        { label: "Construit par Decap", value: "Plusieurs instruments et unités d'orchestrion, pour différentes productions" },
        { label: "Commande", value: "MIDI, avec vélocité note par note" },
      ],
    },
    {
      type: "site_video",
      primary: {
        eyebrow: "Regarder",
        title: "Und die Automaten, en concert",
        video_brief: "Live clip of Stephan Eicher und die Automaten",
      },
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "Sur scène",
        title: "Vous préparez un spectacle avec des instruments automatiques ?",
        body: "Indiquez-nous les chansons, la scène et les dates de tournée. Nous vous répondons avec les instruments qui conviennent et leur mode de commande.",
        primary_cta_label: "Décrire votre spectacle",
        primary_cta_link: "/contact",
        secondary_cta_label: "Voir les instruments",
        secondary_cta_link: "/instruments",
        tone: "Dark band",
      },
    },
  ],
};

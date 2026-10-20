/** Work case study, French (Prismic project "yves-rechsteiner"): L'Explorateur, the mobile concert organ with SmartValve on every pipe. */
export default {
  type: "project",
  uid: "yves-rechsteiner",
  lang: "fr-fr",
  title: "Yves Rechsteiner : L'Explorateur",
  theme: "decap",
  meta_title: "L'Explorateur, orgue de concert mobile | Decap Herentals",
  meta_description:
    "L'Explorateur, orgue de concert mobile d'Yves Rechsteiner : un orgue à tuyaux transportable avec SmartValve sur chaque tuyau, le premier synthétiseur à vent.",
  fields: {
    summary: "Un orgue de concert transportable avec SmartValve sur chaque tuyau, pour l'organiste Yves Rechsteiner.",
    client: "Yves Rechsteiner",
    year: "2025",
    location: "Toulouse, France",
  },
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Réalisations · 2025",
        title: "L'Explorateur : un orgue de concert mobile avec SmartValve sur chaque tuyau",
        intro:
          "L'organiste suisse Yves Rechsteiner voulait un orgue qu'il puisse emmener dans les lieux qui n'en ont pas. Nous avons construit L'Explorateur : un orgue à tuyaux transportable dans lequel chaque tuyau a sa propre SmartValve. Le résultat est le premier synthétiseur à vent au monde.",
        primary_cta_label: "À propos de SmartValve",
        primary_cta_link: "/smartvalve",
        secondary_cta_label: "Tous les projets",
        secondary_cta_link: "/work",
        image_brief: "L'Explorateur set up in a chapel, Yves Rechsteiner at the console, wide shot, 4:3",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "La demande",
        title: "Un orgue qui va vers le public",
        body:
          "Beaucoup de salles de concert n'ont pas d'orgue à tuyaux, et un orgue d'église ne peut pas quitter son église. Yves Rechsteiner a demandé un instrument qu'il puisse transporter, installer et jouer partout où a lieu le concert.\n\nNous avons d'abord conçu L'Explorateur en 3D : chaque détail du buffet et de la disposition des tuyaux était convenu avant le début de la production.\n\nL'orgue est modulaire et n'a donc pas de nombre fixe de tuyaux : il est assemblé selon chaque programme et chaque lieu. Son port d'attache est Toulouse.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "3D render of L'Explorateur next to a photo of the finished organ, 4:3",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "La technologie",
        title: "Chaque tuyau avec sa propre soupape et son propre processeur",
        body:
          "Une soupape d'orgue traditionnelle est ouverte ou fermée. Dans L'Explorateur, chaque tuyau a sa propre SmartValve, qui régule le flux d'air plus de 1 000 fois par seconde. L'organiste contrôle ainsi chaque note individuellement :",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        cta_label: "Comment fonctionne SmartValve",
        cta_link: "/smartvalve",
        image_brief: "Close-up of the SmartValves under the pipes inside L'Explorateur, dark background, 4:3",
        tone: "Tinted",
      },
      items: [
        { point: "Pression de 0 à 200 %, mémorisée par tuyau" },
        { point: "Temps de réponse de 4 ms, avec régulation PID" },
        { point: "Vibrato, pente (slope), extinction (decay) et effets LFO note par note" },
        { point: "MIDI optique : 100 fois la vitesse du MIDI, sur des câbles de 200 m et plus" },
      ],
    },
    {
      type: "site_quote",
      primary: {
        quote:
          "« …un orgue modulaire… développé par Tony Decap », dont la technologie de soupapes « transforme en substance un orgue à tuyaux en synthétiseur physique ».",
        name: "Studio 31, Basel",
        role: "À propos de L'Explorateur",
      },
    },
    {
      type: "site_facts",
      primary: {
        eyebrow: "En bref",
        title: "L'Explorateur",
        layout: "Spec list",
      },
      items: [
        { label: "Organiste", value: "Yves Rechsteiner" },
        { label: "Achevé", value: "2025" },
        { label: "Type", value: "Orgue de concert transportable et modulaire" },
        { label: "Port d'attache", value: "Toulouse" },
        { label: "Commande des tuyaux", value: "SmartValve sur chaque tuyau" },
        { label: "Régulation des soupapes", value: "Plus de 1 000 fois par seconde" },
        { label: "Plage de pression", value: "0–200 %, par tuyau" },
        { label: "En concert", value: "Lyon, Chapelle de la Trinité, 14 novembre 2025" },
      ],
    },
    {
      type: "site_video",
      primary: {
        eyebrow: "Écouter",
        title: "L'Explorateur en concert",
        video_brief:
          "Video of Yves Rechsteiner playing L'Explorateur in concert, e.g. Lyon, Chapelle de la Trinité",
      },
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "SmartValve pour votre orgue",
        title: "Donnez à chaque tuyau sa propre dynamique",
        body: "SmartValve fonctionne dans les orgues neufs et dans nos instruments. Parlez-nous de votre orgue et nous vous dirons ce qui est possible.",
        primary_cta_label: "Découvrir SmartValve",
        primary_cta_link: "/smartvalve",
        secondary_cta_label: "Demander une consultation",
        secondary_cta_link: "/contact",
        tone: "Dark band",
      },
    },
  ],
};

/** Work case study, French (Prismic project "circus-ronaldo"): a Decap organ in Circus Ronaldo's shows, and Brass Core. */
export default {
  type: "project",
  uid: "circus-ronaldo",
  lang: "fr-fr",
  title: "Circus Ronaldo",
  theme: "decap",
  meta_title: "Circus Ronaldo et les orgues Decap | Decap Herentals",
  meta_description:
    "Des instruments sur mesure de Decap Herentals intégrés aux décors de plusieurs productions du Circus Ronaldo, et Brass Core pour des cuivres sans musicien.",
  fields: {
    summary: "Des instruments sur mesure intégrés aux décors de plusieurs productions, et Brass Core pour des cuivres en direct sans musicien.",
    client: "Circus Ronaldo",
    location: "Belgique",
  },
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Réalisations",
        title: "Des instruments intégrés au décor pour le Circus Ronaldo",
        intro:
          "Pour plusieurs productions du Circus Ronaldo, nous avons construit des instruments entièrement sur mesure, conçus pour s'intégrer au décor lui-même. La compagnie utilise aussi Brass Core, notre joueur de cuivres robotisé.",
        primary_cta_label: "À propos de Brass Core",
        primary_cta_link: "/brass-core",
        secondary_cta_label: "Tous les projets",
        secondary_cta_link: "/work",
        image_brief: "The Decap organ in the Circus Ronaldo tent, performers in front, 4:3",
      },
    },
    {
      type: "site_video",
      primary: {
        eyebrow: "Regarder",
        title: "Le Circus Ronaldo avec un orgue Tony Decap",
        video: "https://www.youtube.com/watch?v=XQf13I7nTdY",
        caption: "Le Circus Ronaldo avec un orgue Tony Decap, YouTube.",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Brass Core",
        title: "Des cuivres en direct, joués à partir d'un signal audio",
        body:
          "Brass Core met une vraie trompette ou un vrai trombone sur scène et le fait jouer à partir de votre propre audio ou MIDI. Un moteur à bobine mobile dans une chambre de pression remplace les lèvres du musicien, et la résonance propre de l'instrument façonne le timbre. Sans perçage, sans modification de l'instrument.\n\nLe Circus Ronaldo l'utilise pour sa section de cuivres automatisée.",
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
          "Le Brass Core est devenu le cœur battant de notre section de cuivres automatisée. Nous ne voulions pas simplement diffuser de la musique de cuivres par la sono : nous voulions que le public la ressente, comme si une vraie fanfare était là, sur scène.\n\nOn nous demande souvent où se cache la fanfare : c'est dire à quel point c'est convaincant. Ce n'est pas seulement du son. C'est une présence.",
        role: "À propos de Brass Core",
        name: "Circus Ronaldo",
      },
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "Théâtre et cirque",
        title: "Des instruments acoustiques qui jouent pile au bon moment",
        body: "Parlez-nous du spectacle et des instruments dont vous avez besoin. Nous vous répondons avec ce qui convient et la façon de le raccorder à votre table de mixage.",
        primary_cta_label: "Décrire votre spectacle",
        primary_cta_link: "/contact",
        secondary_cta_label: "Découvrir Brass Core",
        secondary_cta_link: "/brass-core",
        tone: "Dark band",
      },
    },
  ],
};

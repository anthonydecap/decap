/** Orchestrionix landing page, French (Prismic page "orchestrionix"): receives all orchestrionix.com visitors. */
export default {
  type: "page",
  uid: "orchestrionix",
  lang: "fr-fr",
  title: "Orchestrionix",
  theme: "orchestrionix",
  meta_title: "Orchestrionix, instruments robotisés | Decap Herentals",
  meta_description:
    "Orchestrionix, la gamme d'instruments robotisés de Decap pour musiciens. Sans bibliothèque musicale : vous les jouez avec votre audio. Aujourd'hui : Brass Core.",
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Orchestrionix by Decap",
        title: "Orchestrionix : instruments robotisés pour musiciens",
        intro:
          "Orchestrionix est la gamme d'instruments robotisés de Decap pour les musiciens, fabriqués dans notre atelier de Herentals. Elle avait autrefois son propre site ; decap.be accueille désormais les deux. Aujourd'hui, la gamme, c'est **Brass Core** : le vrai son d'une trompette ou d'un trombone, piloté par votre propre audio.",
        primary_cta_label: "Découvrir Brass Core",
        primary_cta_link: "/brass-core",
        secondary_cta_label: "Instruments automatiques",
        secondary_cta_link: "/instruments",
        image_brief: "Brass Core clamped to a trumpet on a stand, dark backdrop, low side light catching the brass, portrait 4:5",
        tone: "Dark band",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Ce qui le distingue",
        title: "Pas de bibliothèque musicale. C'est vous qui jouez.",
        body:
          "Nos instruments automatiques sont livrés avec un lecteur et de la musique. Les instruments Orchestrionix, non. Ce sont des outils pour les musiciens, les concepteurs sonores et les salles qui veulent piloter un vrai instrument acoustique avec leur propre matériel.\n\nBrass Core reçoit un signal audio de niveau ligne, issu d'un enregistrement ou du MIDI via l'échantillonneur ou le synthé de votre choix. Un moteur à bobine mobile transforme ce signal en vibrations d'air à l'embouchure, et l'instrument en cuivre façonne lui-même le timbre. Sans perçage, sans modification de l'instrument.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        cta_label: "Caractéristiques de Brass Core",
        cta_link: "/brass-core",
        image_brief: "Close-up of Brass Core on a trombone mouthpiece with its audio cable plugged in, dark backdrop, 4:3",
      },
    },
    {
      type: "site_card_grid",
      primary: {
        eyebrow: "Vous venez d'orchestrionix.com ?",
        title: "Où trouver les choses désormais",
        intro: "Tout ce qui se trouvait sur l'ancien site Orchestrionix est maintenant sur decap.be.",
        columns: "2",
        card_style: "Text cards",
      },
      items: [
        {
          title: "SmartValve",
          body: "SmartValve est un produit Decap : une soupape et un processeur pour chaque tuyau d'orgue.",
          link_label: "SmartValve",
          link: "/smartvalve",
        },
        {
          title: "Instruments automatiques",
          body: "L'Accordion Pedestal et le Cube, les Pipes, la Percussion Unit, la Mallet Percussion et le Bellow Organ.",
          link_label: "Instruments",
          link: "/instruments",
        },
      ],
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "Orchestrionix Brass Core",
        title: "Entendez une vraie trompette jouer votre audio",
        body: "Découvrez comment fonctionne Brass Core, à quoi il se connecte et ce qu'en font les théâtres, les studios et les musées.",
        price: "2 599 €",
        price_note: "Expédié immédiatement s'il est en stock",
        primary_cta_label: "Découvrir Brass Core",
        primary_cta_link: "/brass-core",
        secondary_cta_label: "Poser une question",
        secondary_cta_link: "/contact",
        tone: "Dark band",
      },
    },
  ],
};

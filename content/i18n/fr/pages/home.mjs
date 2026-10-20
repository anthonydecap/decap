/** Home page, French (Prismic page "home"). */
export default {
  type: "page",
  uid: "home",
  lang: "fr-fr",
  title: "Decap Herentals",
  theme: "decap",
  meta_title: "Orgues de danse et instruments automatiques | Decap",
  meta_description:
    "Facteurs d'orgues depuis 1895. Decap Herentals construit orgues de danse, de foire et de rue, accordéons automatiques et la technologie MIDI qui les pilote.",
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Facteurs d'orgues depuis 1895",
        title: "Orgues de danse et instruments automatiques, fabriqués à Herentals",
        intro:
          "Des orgues et des instruments automatiques pour la maison, les cafés, les bars et les salles de danse, construits par quatre générations de la famille Decap dans un même atelier à Herentals, en Belgique.",
        primary_cta_label: "Découvrir nos orgues",
        primary_cta_link: "/organs",
        secondary_cta_label: "Instruments automatiques",
        secondary_cta_link: "/instruments",
        image_brief: "Tony Decap in the Herentals workshop next to a finished organ façade, portrait 4:5",
      },
    },
    {
      type: "site_card_grid",
      primary: {
        eyebrow: "Où ils jouent",
        title: "Au salon, au café et dans les salles de danse",
        intro: "La plupart des orgues et instruments Decap appartiennent à des particuliers. Ils jouent à la maison, dans un café ou un bar, dans une salle de danse, partout dans le monde.",
        columns: "4",
        card_style: "Image cards",
      },
      items: [
        { title: "À la maison", body: "Un Accordion Pedestal au salon, ou un orchestrion complet dans la pièce de collection.", image_brief: "Accordion Pedestal in a living room at a customer's home, warm evening light, 4:3" },
        { title: "Bars et cafés", body: "Un orgue de danse ou un orchestrion qui attire les gens et joue toute la soirée, tout seul.", image_brief: "Decap organ in a café or bar with guests, 4:3" },
        { title: "Salles de danse et événements", body: "Des orgues au volume réglable, adaptés à la salle, de la petite salle au festival.", image_brief: "Dance organ in a dance hall during an evening, 4:3" },
        { title: "Musées et scènes", body: "Collections, expositions et artistes en tournée : découvrez nos [réalisations](/work).", image_brief: "Decap orchestrion in a museum or on a stage, 4:3" },
      ],
    },
    {
      type: "site_card_grid",
      primary: {
        eyebrow: "Ce que nous fabriquons",
        title: "De l'orgue de danse complet à un seul jeu de tuyaux",
        columns: "2",
        card_style: "Image cards",
      },
      items: [
        {
          title: "Orgues neufs",
          body: "Orgues de danse, de foire, de rue et de concert. Partez de nos modules éprouvés ou faites concevoir chaque détail pour vous.",
          link_label: "Orgues",
          link: "/organs",
          image_brief: "A finished Decap dance organ façade, front view, 4:3",
        },
        {
          title: "Instruments automatiques",
          body: "Un vrai accordéon, des tuyaux, une batterie et des xylophones, joués par MIDI. Bibliothèque musicale incluse, prêts à jouer.",
          link_label: "Instruments",
          link: "/instruments",
          image_brief: "Accordion Pedestal and Percussion Unit side by side, black backdrop, 4:3",
        },
        {
          title: "SmartValve",
          body: "Une soupape et un processeur pour chaque tuyau. Chaque note reçoit sa propre pression, sa dynamique et son vibrato.",
          link_label: "SmartValve",
          link: "/smartvalve",
          image_brief: "Close-up of a row of SmartValves on a wind chest, dark background, 4:3",
        },
        {
          title: "Restauration et conversion MIDI",
          body: "Des orgues historiques restaurés par l'Atelier Frank Decap, avec nos modules de conversion MIDI si vous voulez à la fois le carton et le MIDI.",
          link_label: "Atelier Frank Decap",
          link: "/frank-decap",
          image_brief: "Hands repairing the bellows of a historic organ, warm light, 4:3",
        },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Tuyaux d'orgue",
        title: "Presque tous les tuyaux en bois, prêts à expédier en une semaine",
        body:
          "Nous sommes la seule entreprise au monde à avoir développé en interne la fabrication de tuyaux d'orgue sur CNC. Nos diapasons standard ou vos propres mesures, dessinés en 3D et fraisés sur notre propre CNC.\n\nPour une construction personnelle, un jeu supplémentaire pour votre orgue, ou un ensemble complet de tuyaux et de sommiers.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        cta_label: "Commander des tuyaux d'orgue",
        cta_link: "/organ-pipes",
        image_brief: "Looping clip (mp4, 10–15 s): the CNC milling a pipe, then a row of finished pipes. Until then a photo of new pipes on the workbench, 4:3.",
        tone: "Dark band",
      },
      items: [
        { point: "Prêts en quelques jours à une semaine, selon les jeux" },
        { point: "Diapasons standard ou vos propres dimensions" },
        { point: "Harmonisés, ou prêts à être harmonisés par vous" },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Le nombre de touches n'est pas une limite",
        title: "Un orgue 105 touches qui joue la musique 121 touches",
        body:
          "Chaque nouvel orgue Decap est livré avec notre lecteur Virtual Orchestrion. Quand un arrangement demande des jeux que votre orgue n'a pas, le lecteur les ajoute virtuellement, avec des échantillons enregistrés dans notre propre atelier.\n\nVous choisissez donc l'orgue qui convient à votre salle et à votre budget, et non celui qui convient à votre répertoire.",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        cta_label: "À propos de Virtual Orchestrion",
        cta_link: "/virtual-orchestrion",
        image_brief: "Virtual Orchestrion on a touchscreen next to an organ, showing the animated book view, 4:3",
        tone: "Tinted",
      },
    },
    {
      type: "site_timeline",
      primary: {
        eyebrow: "Depuis 1895",
        title: "Chaque génération a réinventé l'orgue",
        intro:
          "Aloïs Decap a commencé avec quelques orgues en location. Son fils Frans a fondé Decap Herentals. François est passé au numérique, Tony a apporté le MIDI et SmartValve. [Lire toute l'histoire](/about).",
      },
      items: [
        { year: "1895", title: "Aloïs Decap se lance dans les orgues", body: "Il loue et vend de petits orgues dans la région d'Anvers, livrés en charrette à chien." },
        { year: "1933", title: "Frans Decap fonde Decap Herentals", body: "La même année, les premiers accordéons automatiques apparaissent sur les orgues Decap.", highlight: true },
        { year: "1977", title: "Le premier orgue de danse numérique", body: "François remplace les tuyaux par le son numérique : les cafés et salles de danse aux budgets plus modestes peuvent avoir un orgue." },
        { year: "2000", title: "Le MIDI arrive dans l'orgue de danse", body: "Tony Decap met toute une bibliothèque musicale sur une seule carte, à la place des rayonnages de cartons perforés." },
        { year: "2016", title: "Des tuyaux sortis de notre propre CNC", body: "Nous fraisons des tuyaux d'orgue sur une CNC 5 axes avec PipeCreator, un logiciel que nous avons écrit nous-mêmes." },
        { year: "2025", title: "Le premier synthétiseur à vent", body: "SmartValve dans un orgue d'église transportable : chaque tuyau commandé individuellement.", highlight: true },
      ],
    },
    {
      type: "home_artists",
      copyItemsFrom: { type: "page", uid: "home" },
      primary: {
        title: "Aussi sur scène",
        description: "Nos orgues et instruments jouent surtout à la maison, dans les bars et les salles de danse. Ces artistes les emmènent sur scène.",
      },
      items: [
        { artist_name: "Pat Metheny" },
        { artist_name: "Walter Hus" },
        { artist_name: "Circus Ronaldo" },
      ],
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "Un projet d'orgue ?",
        title: "Dites-nous où il jouera",
        body: "Choisissez un modèle de départ et quelques options dans l'Organ Composer. Nous vous répondons avec des questions et une première idée, sans engagement.",
        primary_cta_label: "Composer votre orgue",
        primary_cta_link: "/organ-composer",
        secondary_cta_label: "Contacter l'atelier",
        secondary_cta_link: "/contact",
        tone: "Dark band",
      },
    },
  ],
};

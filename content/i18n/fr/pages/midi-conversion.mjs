/** MIDI conversion page, French (Prismic page "midi-conversion"): the Decap double-valve MIDI unit for book and roll organs. */
export default {
  type: "page",
  uid: "midi-conversion",
  lang: "fr-fr",
  title: "Conversion MIDI",
  theme: "decap",
  meta_title: "Conversion MIDI pour orgues à cartons | Decap Herentals",
  meta_description:
    "Ajoutez le MIDI à votre orgue à cartons ou à rouleaux sans renoncer au carton. Le module Decap se place entre clavier de lecture et sommier : 16 soupapes.",
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Module MIDI Decap à double soupape",
        title: "Conversion MIDI pour orgues à cartons et orgues de foire",
        intro:
          "Jouez en MIDI sur votre orgue à cartons ou à rouleaux sans renoncer au carton. Notre module à double soupape se place entre le clavier de lecture et le sommier principal : le fonctionnement d'origine reste entièrement intact. Carton et MIDI peuvent même jouer en même temps.",
        primary_cta_label: "Demander un devis",
        primary_cta_link: "/contact",
        secondary_cta_label: "Installation par l'Atelier Frank Decap",
        secondary_cta_link: "/frank-decap",
        image_brief:
          "One Decap MIDI unit on a plain dark worktop, valves and tube connectors facing the camera, shot from slightly above; 4:3",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Pourquoi convertir",
        title: "Gardez le carton. Ajoutez la bibliothèque.",
        body:
          "Les systèmes à cartons et à rouleaux font de ces orgues des instruments historiques, et beaucoup de propriétaires hésitent à y toucher. À juste titre : si vous convertissez, l'orgue doit rester aussi intact que possible.\n\nNotre module ne remplace rien. Le carton ou le rouleau actionne toujours l'orgue exactement comme avant. Le MIDI vient s'y ajouter : vous pouvez jouer des arrangements qui n'ont jamais été perforés, jouer en direct depuis un clavier, ou faire jouer l'orgue avec d'autres instruments.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief:
          "A book organ playing with a cardboard music book running through the key frame, close-up of the book entering the key frame; 4:3",
      },
      items: [
        { point: "Le fonctionnement à cartons ou à rouleaux reste entièrement intact" },
        { point: "Carton et MIDI peuvent jouer en même temps" },
        { point: "Jouez des arrangements MIDI via Virtual Orchestrion, ou jouez en direct en MIDI" },
      ],
    },
    {
      type: "site_facts",
      primary: {
        eyebrow: "Le module",
        title: "Caractéristiques",
        intro: "Chaque module commande 16 notes. Les orgues plus grands utilisent plusieurs modules.",
        layout: "Spec list",
        tone: "Tinted",
      },
      items: [
        { label: "Soupapes", value: "16 soupapes à double commutation par module", note: "Des soupapes indépendantes : carton et MIDI peuvent jouer en même temps" },
        { label: "Position", value: "Entre le clavier de lecture et le sommier principal", note: "Le fonctionnement à cartons ou à rouleaux reste entièrement intact" },
        { label: "Taille", value: "Dimensions minimales", note: "Trouve sa place dans des orgues jamais conçus pour des pièces supplémentaires" },
        { label: "Montage", value: "Dans n'importe quelle position, même à l'envers", note: "Placez-le là où les tubulures sont les plus courtes" },
        { label: "Canal MIDI", value: "N'importe lequel des 16 canaux MIDI" },
        { label: "Attribution des notes", value: "Chaque soupape sur n'importe quelle note MIDI", note: "Réglage avec le logiciel fourni" },
        { label: "Durée de note", value: "Réglable de −64 à +64 ms", note: "Compense des tubulures longues ou une mécanique plus lente ou plus rapide" },
        { label: "Retard de note", value: "Jusqu'à 500 ms", note: "Pour jouer en synchronisation, par exemple avec des systèmes de piano qui demandent un pré-retard de 500 ms" },
      ],
    },
    {
      type: "site_steps",
      primary: {
        eyebrow: "Installation",
        title: "Des tubulures courtes, une installation simple",
        intro:
          "Comme chaque soupape peut être attribuée à n'importe quelle note MIDI, les tubulures n'ont pas à suivre l'échelle. Elles restent courtes et l'installation reste simple.",
      },
      items: [
        {
          title: "Monter les modules",
          body: "Montez les modules dans l'espace libre entre le clavier de lecture et le sommier principal, dans la position qui convient à l'orgue.",
          image_brief: "MIDI units mounted inside an open organ case near the key frame, taken with a phone torch for light; 4:3",
        },
        {
          title: "Raccorder les tubulures",
          body: "Tirez un tube du clavier de lecture vers la soupape la plus proche, et de cette soupape vers l'entrée de sommier la plus proche. Inutile de garder les notes dans l'ordre.",
          image_brief: "Close-up of tubes running from a key frame into a MIDI unit, hands holding a tube, 4:3",
        },
        {
          title: "Attribuer les notes",
          body: "Indiquez au logiciel fourni quelle note joue chaque soupape. Réglez le canal MIDI, et ajustez la durée et le retard des notes si l'orgue ou la combinaison avec d'autres instruments le demande.",
          image_brief: "A laptop next to the organ showing the note assignment software, screen readable, 4:3",
        },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Qui installe",
        title: "L'Atelier Frank Decap, ou votre propre facteur d'orgues",
        body:
          "Vous achetez les modules MIDI chez Decap Herentals. L'[Atelier Frank Decap](/frank-decap), dirigé par Frank, le frère de Tony, les installe, et restaure aussi les orgues historiques si le vôtre a besoin de plus que du MIDI. Vous pouvez aussi faire installer les modules par votre propre facteur d'orgues.",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        cta_label: "À propos de l'Atelier Frank Decap",
        cta_link: "/frank-decap",
        image_brief: "Frank Decap working inside an open book organ in his workshop, warm light, 4:3",
      },
    },
    {
      type: "site_downloads",
      primary: {
        eyebrow: "Téléchargements",
        title: "Documents techniques",
      },
      items: [
        {
          label: "Dimensions (PDF)",
          description: "Les mesures du module MIDI pour préparer l'installation. Bientôt disponible ; en attendant, demandez-nous le plan.",
          file_type: "PDF",
        },
      ],
    },
    {
      type: "site_faq",
      primary: {
        eyebrow: "Questions",
        title: "À propos de la conversion MIDI",
      },
      items: [
        {
          question: "Mon orgue jouera-t-il toujours ses cartons ?",
          answer: "Oui. Le module se place entre le clavier de lecture et le sommier principal et laisse le fonctionnement à cartons ou à rouleaux entièrement intact. Carton et MIDI peuvent jouer en même temps.",
        },
        {
          question: "De combien de modules mon orgue a-t-il besoin ?",
          answer: "Un module commande 16 notes. Comptez les touches de votre orgue et divisez par 16, ou envoyez-nous l'échelle et nous faisons le calcul pour vous.",
        },
        {
          question: "La conversion fonctionne-t-elle sur les orgues à rouleaux et les orchestrions ?",
          answer: "Le module est conçu pour les orgues et orchestrions actionnés par des cartons ou des rouleaux de piano. Chaque conversion est faite sur mesure pour l'orgue : nous examinons donc chaque orgue avant de confirmer qu'il convient. Envoyez-nous des photos du clavier de lecture et l'échelle.",
        },
        {
          question: "L'orgue peut-il jouer avec un piano automatique ?",
          answer: "Oui. Le retard de note jusqu'à 500 ms permet à l'orgue d'attendre les systèmes de piano qui demandent un pré-retard de 500 ms : les deux jouent en mesure.",
        },
        {
          question: "Qui installe les modules ?",
          answer: "L'[Atelier Frank Decap](/frank-decap) installe les modules MIDI Decap. Votre propre facteur d'orgues peut aussi les installer.",
        },
      ],
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "Vous voulez convertir un orgue ?",
        title: "Parlez-nous de votre orgue",
        body: "Envoyez-nous la marque, le nombre de touches et s'il joue des cartons ou des rouleaux. Nous vous répondons avec le nombre de modules nécessaires et un devis.",
        primary_cta_label: "Demander un devis",
        primary_cta_link: "/contact",
        secondary_cta_label: "Interroger Frank sur l'installation",
        secondary_cta_link: "/frank-decap",
        tone: "Dark band",
      },
    },
  ],
};

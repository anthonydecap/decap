/** smARTvalve for organ builders, French (Prismic page "smartvalve-for-organ-builders"): the B2B page. No prices, no competitor names. */
export default {
  type: "page",
  uid: "smartvalve-for-organ-builders",
  lang: "fr-fr",
  title: "smARTvalve pour facteurs d'orgues",
  theme: "smartvalve",
  meta_title: "Soupape proportionnelle pour tuyaux d'orgue | smARTvalve",
  meta_description:
    "smARTvalve : une soupape proportionnelle pour tuyaux d'orgue avec son propre processeur. Vent régulé par tuyau, jeux numériques, MIDI optique, orgues neufs.",
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "smARTvalve pour facteurs d'orgues",
        title: "Une soupape proportionnelle avec un processeur dans chaque soupape",
        intro:
          "smARTvalve règle le vent de chaque tuyau séparément, plus de 1 000 fois par seconde. Vos tuyaux gardent leur voix ; l'orgue gagne en dynamique, en expression, et en jeux définis dans le logiciel. Conçue et construite par Decap à Herentals, et éprouvée sur scène en concert.",
        primary_cta_label: "Demander la documentation technique",
        primary_cta_link: "#contact-form",
        secondary_cta_label: "Découvrir smARTvalve",
        secondary_cta_link: "/smartvalve",
        note: "Pour les orgues neufs, et pour les orgues existants en remplaçant les chapes. Prix sur demande.",
        image_brief: "A row of smARTvalves mounted under pipes on a wind chest, dark background, low side light, portrait 4:5",
      },
    },
    {
      type: "site_facts",
      primary: {
        layout: "Stats",
      },
      items: [
        { value: "1 000×", label: "par seconde, le vent de chaque tuyau est mesuré et corrigé" },
        { value: "0–200 %", label: "de pression de vent par tuyau, enregistrée dans la soupape" },
        { value: "4 ms", label: "de temps de réponse" },
        { value: "200 m+", label: "de MIDI optique, 100 fois plus rapide que le MIDI classique" },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Pourquoi chez Decap",
        title: "Quatre-vingt-dix ans de dynamique, désormais dans chaque tuyau",
        body:
          "Nous sommes d'abord des musiciens et, depuis 90 ans, nous travaillons à des orgues qui jouent avec plus de sentiment. Sur nos orgues de danse, les tambours jouent fort ou doucement, la pression du vent change d'un sommier à l'autre et des jeux jouent en vibrato. smARTvalve est l'aboutissement de cette expérience : la même maîtrise, pour chaque tuyau.\n\nPour nous, l'orgue d'église est l'un des instruments les plus beaux et les plus musicaux qui soient. Pendant que nous développions smARTvalve, nous ne pouvions que rêver de ce qu'elle lui apporterait : plus d'effets, plus de façons de jouer, plus de couleurs.\n\nNotre expérience de l'orgue de danse nous sert ici aussi. Les orgues de danse devaient être transportables et remontables : nous construisons donc chaque orgue en modules dans une façade. C'est pourquoi un orgue d'église transportable comme L'Explorateur convient si bien à notre atelier. Et nos sommiers sont construits pour des conditions difficiles, comme les variations de température, car les orgues de danse jouaient dans des Spiegeltents (tentes à miroirs) montées et démontées sans cesse.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "A Decap dance organ façade split into its modular units in the workshop, ready for transport, 4:3",
      },
      items: [
        { point: "Maîtrise dynamique des percussions et du vent depuis les années de l'orgue de danse" },
        { point: "Construction modulaire et transportable" },
        { point: "Des sommiers conçus pour les variations de température et les montages répétés" },
        { point: "Tous les logiciels développés en interne : programmes CNC, commande des soupapes et lecteur" },
      ],
    },
    {
      type: "site_card_grid",
      primary: {
        eyebrow: "Trois générations de soupapes",
        title: "De l'ouvert-fermé au contrôle de chaque tuyau",
        intro:
          "Les transmissions électriques ont longtemps traité la soupape de tuyau comme un interrupteur. Les soupapes plus récentes suivent la touche. smARTvalve va un pas plus loin : elle règle le vent lui-même.",
        columns: "3",
        card_style: "Text cards",
      },
      items: [
        {
          tag: "Génération 1",
          title: "Soupape tout ou rien",
          body: "Un électroaimant ouvre la soupape entièrement ou la ferme. Fiable et simple, mais chaque note parle de la même façon, quelle que soit la manière de jouer la touche.",
        },
        {
          tag: "Génération 2",
          title: "Soupape qui suit la position",
          body: "L'ouverture de la soupape suit la course de la touche : l'organiste façonne l'attaque. Une fois la touche enfoncée, le tuyau reste où il est.",
        },
        {
          tag: "smARTvalve",
          title: "Régulation du vent en boucle fermée",
          body: "Un processeur dans chaque soupape régule le vent de son tuyau, pendant l'attaque et pendant toute la durée de la note. Elle peut suivre la touche, ou tout ce que vous lui attribuez.",
        },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "À chaque tuyau son vent",
        title: "Mesuré et corrigé pendant que la note sonne",
        body:
          "smARTvalve est assez petite pour se placer sur la chape, à quelques millimètres du pied du tuyau. Son processeur mesure la chute de pression en entrée et ouvre davantage pour la compenser, plus de 1 000 fois par seconde. Quand de nombreux tuyaux parlent en même temps, chaque tuyau garde son vent. Dans L'Explorateur, les régulateurs de vent sont ainsi devenus inutiles : une soufflerie et une caisse de distribution suffisent.\n\nLa pression de base de chaque tuyau est enregistrée dans la soupape, de 0 à 200 %. Une partie du réglage qui se faisait autrefois au banc d'harmonisation peut ainsi se faire, et se refaire, dans le logiciel.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "Close-up of one smARTvalve with its electronics visible, dark background, 4:3",
      },
      items: [
        { point: "Régulé à quelques millimètres du pied du tuyau" },
        { point: "Une émission stable quand de nombreux tuyaux sonnent ensemble" },
        { point: "Pression de base par tuyau enregistrée dans la soupape" },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "La position de la touche, ou autre chose",
        title: "Attribuez n'importe quel MIDI à n'importe quel tuyau",
        body:
          "smARTvalve est entièrement numérique : c'est vous qui décidez de ce qui la commande. Associez la position de la touche à l'ouverture de la soupape, et elle se comporte exactement comme une soupape qui suit la position. Associez la vélocité, l'aftertouch, un contrôleur ou une courbe d'automation d'un séquenceur, et le même tuyau fait ce qu'aucune soupape mécanique ne peut faire.\n\n- Crescendo et decrescendo sur une note tenue\n- Vibrato et trémolo par tuyau, et non par sommier\n- Courbes de pression, attaque (slope) et extinction (decay) pour chaque note\n- Le comportement classique tout ou rien quand la musique le demande",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        image_brief: "Screen of the smARTvalve software with a pressure curve, next to an organ keyboard, 4:3",
        tone: "Tinted",
      },
    },
    {
      type: "site_video",
      primary: {
        eyebrow: "Recherche artistique",
        title: "Un tuyau, de nombreux sons",
        intro: "Avec smARTvalve, un tuyau n’est plus limité à un seul son caractéristique. Le contrôle en temps réel de la pression du vent ouvre une nouvelle palette de sons à partir de tuyaux d’orgue traditionnels. Ici, Mauricio Silva Orendain, chercheur en microtonalité, joue des tuyaux via smARTvalve avec une bague gestuelle MIDI.",
        video: "https://www.youtube.com/shorts/M4y9bnKHQeQ",
        caption: "Mauricio Silva Orendain pilote des tuyaux d’orgue via smARTvalve avec une bague gestuelle MIDI.",
        video_brief: "Mauricio Silva Orendain playing pipes through smARTvalve with a MIDI gesture ring",
      },
    },
    {
      type: "site_quote",
      primary: {
        quote: "smARTvalve crée des liens nouveaux et encore largement inexplorés entre les langages numériques et la physicalité du tuyau comme générateur sonore acoustique. Il ouvre l’instrument aux non-organistes, au théâtre, aux installations sonores et à la recherche artistique.",
        name: "Mauricio Silva Orendain",
        role: "Chercheur en microtonalité",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Jeux numériques",
        title: "Des jeux définis dans le logiciel, en toute combinaison",
        body:
          "Comme chaque tuyau a son propre processeur et sa propre adresse, un jeu n'est plus figé dans le sommier. Avec notre logiciel, vous attribuez n'importe quelle combinaison de tuyaux à un jeu, chaque tuyau avec ses propres réglages de pression. Dans un orgue entièrement construit sur smARTvalve, le nombre de combinaisons est pratiquement illimité ; quand smARTvalve complète un orgue existant, le système de commande d'origine peut imposer des limites, et nous l'examinons projet par projet.\n\nL'orgue n'est pas terminé le jour de la livraison : des jeux peuvent être ajoutés ou modifiés plus tard, sans toucher au sommier.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "Screenshot of the stop configuration in the smARTvalve software, pipes grouped into stops, 4:3",
      },
      items: [
        { point: "N'importe quelle combinaison de tuyaux forme un jeu" },
        { point: "Réglages de pression par tuyau, par jeu" },
        { point: "Les jeux restent modifiables après l'installation" },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "MIDI optique",
        title: "De la console au sommier par la lumière",
        body:
          "Les smARTvalves sont reliées par MIDI optique : plus de 100 fois la vitesse du MIDI classique, sur des distances de 200 m et plus. La lumière ne transporte aucune perturbation électrique : la console peut se placer là où l'orgue en a besoin. [En savoir plus sur smARTvalve](/smartvalve).",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        image_brief: "Optical MIDI cable plugged into a smARTvalve controller, glowing connector, dark background, 4:3",
      },
    },
    {
      type: "site_quote",
      primary: {
        quote: "Cette technologie transforme en substance un orgue à tuyaux en synthétiseur physique.",
        name: "Studio 31, Basel",
        role: "À propos de L'Explorateur, l'orgue de concert transportable équipé d'une smARTvalve sur chaque tuyau",
      },
    },
    {
      type: "site_steps",
      primary: {
        eyebrow: "Travailler avec nous",
        title: "De la première question à l'orgue qui joue",
      },
      items: [
        { title: "Présentez-nous le projet", body: "Un orgue neuf ou existant, les sommiers, le nombre de tuyaux et ce que l'instrument doit pouvoir faire." },
        { title: "Documentation technique", body: "Spécifications, dimensions et câblage pour votre projet, pour que votre équipe puisse juger de l'intégration." },
        { title: "Démonstration", body: "Écoutez smARTvalve sur de vrais tuyaux, dans notre atelier de Herentals ou en visioconférence." },
        { title: "Accompagnement à l'intégration", body: "Nous accompagnons votre équipe pour l'installation, la configuration des soupapes et les jeux numériques." },
      ],
    },
    {
      type: "site_faq",
      primary: {
        title: "Les questions des facteurs d'orgues",
      },
      items: [
        {
          question: "smARTvalve peut-elle se comporter comme une soupape classique ?",
          answer: "Oui. smARTvalve est entièrement numérique : elle peut fonctionner en tout ou rien, suivre la position de la touche, ou réagir à la vélocité, à l'aftertouch et à tout autre MIDI que vous lui attribuez. Vous choisissez par tuyau et par jeu.",
        },
        {
          question: "Peut-on l'installer dans un orgue existant ?",
          answer: "Oui. Les smARTvalves se montent sur une chape : un orgue existant peut donc être converti en remplaçant ses chapes. Dans un orgue entièrement équipé de smARTvalve, tout se règle dans le logiciel ; quand smARTvalve complète une installation existante, les limites de son système de commande d'origine s'appliquent. Nous étudions chaque projet au préalable.",
        },
        {
          question: "Quelles consoles et quels systèmes de commande fonctionnent avec smARTvalve ?",
          answer: "Tout ce qui parle MIDI : une console avec sortie MIDI, un séquenceur ou un ordinateur. Grâce au MIDI optique, la console peut se trouver à 200 m ou plus.",
        },
        {
          question: "Que sont les jeux numériques ?",
          answer: "Des jeux définis dans le logiciel plutôt que dans le sommier. Vous attribuez n'importe quelle combinaison de tuyaux à un jeu, avec ses propres réglages de pression, et vous pouvez modifier les jeux après l'installation.",
        },
        {
          question: "smARTvalve a-t-elle fait ses preuves ?",
          answer: "Oui. smARTvalve joue dans L'Explorateur, l'orgue de concert transportable d'Yves Rechsteiner équipé d'une smARTvalve sur chaque tuyau : plus de 30 concerts depuis 2023, et monté en moins de deux heures après l'arrivée du camion. [Lire l'étude de cas](/work/yves-rechsteiner).",
        },
        {
          question: "Combien cela coûte-t-il ?",
          answer: "Cela dépend du nombre de tuyaux et du projet. Présentez-nous votre orgue et nous vous envoyons une proposition.",
        },
      ],
    },
    {
      type: "contact_form",
      primary: {
        eyebrow: "Pour les facteurs d'orgues",
        title: "Demandez la documentation ou une démonstration",
        intro: "Parlez-nous de votre atelier et de votre projet. Nous vous répondons personnellement.",
        recipient: "decap",
        topics: "Documentation technique, Démonstration, Proposition pour un projet, Question d'intégration",
        default_topic: "Documentation technique",
        show_phone: true,
        show_location: false,
        message_placeholder: "Votre atelier, l'orgue (neuf ou existant), les sommiers, le nombre de tuyaux et ce que vous attendez de smARTvalve…",
        submit_label: "Envoyer la demande",
        success_title: "Merci",
        success_body: "Votre demande nous est bien parvenue. Nous vous répondons personnellement avec les informations demandées.",
        aside_title: "Decap Herentals",
        aside_body:
          "Langepad 51C, 2200 Herentals, Belgique\n\n+32 14 22 44 94\n\n[info@decap.be](mailto:info@decap.be)\n\nsmARTvalve est conçue, construite et programmée dans notre propre atelier.",
      },
    },
  ],
};

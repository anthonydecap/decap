/** Organ pipes page, French (Prismic page "organ-pipes"): wooden pipes from our own CNC, ready in days, not months. A headline product. */
export default {
  type: "page",
  uid: "organ-pipes",
  lang: "fr-fr",
  title: "Tuyaux d'orgue",
  theme: "decap",
  meta_title: "Tuyaux d'orgue en bois, prêts en une semaine | Decap",
  meta_description:
    "Presque tous les tuyaux d'orgue en bois, fraisés sur notre CNC et prêts à expédier en une semaine. Diapasons standard ou vos mesures, pour tous vos projets.",
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Le seul atelier au monde à le faire",
        title: "Tuyaux d'orgue en bois, prêts en quelques jours, pas en quelques mois",
        intro:
          "Nous sommes la seule entreprise au monde à avoir développé en interne la fabrication de tuyaux d'orgue sur CNC. Presque tous les tuyaux en bois, selon nos diapasons standard ou vos propres mesures, fraisés, assemblés et prêts à expédier en quelques jours.",
        primary_cta_label: "Commander des tuyaux",
        primary_cta_link: "#contact-form",
        secondary_cta_label: "Des tuyaux dans un orgue neuf",
        secondary_cta_link: "/organs",
        note: "Pour les constructions personnelles, votre propre orgue, les facteurs d'orgues et les restaurateurs.",
        image_brief:
          "A row of new wooden pipes of increasing size on a workbench, pale Ayous bodies and beech mouths visible, side light from a window; portrait 4:5",
      },
    },
    {
      type: "site_facts",
      primary: {
        layout: "Stats",
        tone: "Tinted",
      },
      items: [
        { value: "1 semaine", label: "ou moins de la commande à l'expédition, selon les jeux" },
        { value: "Toutes tailles", label: "nos diapasons standard ou vos propres mesures" },
        { value: "6 octaves", label: "étendue du Bourdon, MIDI 24 à 96" },
        { value: "2016", label: "nos premiers tuyaux sortis de notre propre CNC" },
      ],
    },
    {
      type: "site_video",
      primary: {
        eyebrow: "Du dessin au tuyau",
        title: "Regardez la fabrication d'un tuyau",
        intro: "Dessiné en 3D dans notre bureau, fraisé sur notre CNC, collé et harmonisé dans l'atelier d'à côté.",
        video_brief:
          "Film, 1–2 minutes, landscape 16:9: a pipe drawn in 3D in PipeCreator at the office → the G-code sent to the CNC → the CNC milling the parts → gluing → the finished pipe being blown for the first time. Upload to YouTube and paste the link here.",
      },
    },
    {
      type: "site_card_grid",
      primary: {
        eyebrow: "Qui commande nos tuyaux",
        title: "Un seul jeu ou une alimentation en vent complète",
        intro: "Achetez uniquement les jeux, ou les jeux et les sommiers pour les poser. Nous fabriquons les pièces dont vous avez besoin et vous laissons le reste.",
        columns: "4",
        card_style: "Text cards",
      },
      items: [
        {
          title: "Constructeurs amateurs",
          body: "Vous construisez votre propre orgue ou instrument ? Commandez les jeux dont vous avez besoin, harmonisés ou prêts à être harmonisés par vous.",
        },
        {
          title: "Votre propre orgue",
          body: "Un jeu supplémentaire ou un jeu de remplacement, fabriqué pour s'accorder à ce qui existe déjà.",
        },
        {
          title: "Facteurs d'orgues et restaurateurs",
          body: "Des tuyaux selon vos diapasons et vos mesures, sans attendre des mois un fournisseur.",
        },
        {
          title: "Tuyaux et sommiers",
          body: "Ajoutez nos sommiers, ou allez plus loin avec la [conversion MIDI](/midi-conversion) ou [SmartValve](/smartvalve) sur chaque tuyau.",
        },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Comment nous les fabriquons",
        title: "Un procédé que nous avons développé nous-mêmes",
        body:
          "Depuis 2016, nous fraisons nos tuyaux d'orgue sur une CNC 5 axes. Le code G provient de **PipeCreator**, un logiciel que nous avons écrit en interne. Aucune autre entreprise ne fabrique des tuyaux d'orgue de cette façon. La machine découpe chaque pièce aux dimensions et aux angles exacts : chaque tuyau d'un jeu correspond au suivant.\n\nAprès découpe et collage, le tuyau est prêt pour l'harmonisation et la finition. Nos harmonistes peuvent s'en charger pour vous, ou vous prenez le relais à l'étape de votre choix.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "Looping clip (mp4, 10–15 s, no sound needed): the 5-axis CNC milling a pipe part, shot beside the machine door. Upload it in the video field; until then a still photo, 4:3.",
      },
      items: [
        { point: "CNC 5 axes, code G issu de notre propre logiciel PipeCreator" },
        { point: "Prêts en quelques jours à une semaine, selon les jeux" },
        { point: "Harmonisés par nos harmonistes, ou livrés pour que vous les harmonisiez" },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Diapason standard ou sur mesure",
        title: "Changez une mesure, obtenez un nouveau tuyau",
        body:
          "Chaque famille de tuyaux a le même dessin de base, avec une marge de variation. Un peu plus large pour plus de fondamentale, un peu plus étroit pour plus d'harmoniques, une hauteur de bouche plus grande et une autre longueur pour une pression de vent plus élevée.\n\nDans PipeCreator, nous modifions en quelques minutes la largeur et la profondeur intérieures, l'épaisseur des planches et la longueur de nos modèles standard. Le code G part directement vers la CNC. Un tuyau à vos propres mesures prend donc à peu près autant de temps qu'un tuyau standard.",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        image_brief: "Looping clip (mp4, 10–15 s): a pipe model in PipeCreator at the office, a measurement being changed and the 3D pipe updating. Screen recording or filmed monitor, 4:3.",
        tone: "Tinted",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Le bois",
        title: "Corps en ayous, pieds et bouches en hêtre",
        body:
          "Une CNC ne voit pas la différence entre un grain fin et un nœud : nous avons donc choisi le bois pour la machine et pour le son. Le corps est en **ayous** (*Triplochiton scleroxylon*) : très stable, jaune pâle et pratiquement sans nœuds. Les pieds et les bouches sont en **hêtre sélectionné à la main**.",
        media_side: "Image right",
        aspect: "Square",
        image_brief: "Close-up of the mouth of a wooden pipe, pale Ayous body against the beech mouth, square 1:1",
      },
    },
    {
      type: "site_facts",
      primary: {
        eyebrow: "Gamme",
        title: "Notre gamme de tuyaux standard",
        intro: "Les étendues sont indiquées en numéros de note MIDI (60 = do central). Autres étendues et mesures sur demande.",
        layout: "Spec list",
      },
      items: [
        { label: "Bourdon", value: "MIDI 24–96", note: "6 octaves, bouché" },
        { label: "Flûte jazz", value: "MIDI 60–96", note: "3 octaves, bouché" },
        { label: "Vibraton", value: "MIDI 46–84", note: "3 octaves, bouché" },
        { label: "Double orgue de rue", value: "MIDI 60–96", note: "3 octaves, bouché" },
        { label: "Flûte (Flûte 8′ etc.)", value: "MIDI 60–96", note: "3 octaves, ouvert" },
        { label: "Violons (alto, violoncelle etc.)", value: "MIDI 48–96", note: "4 octaves, ouvert" },
        { label: "Baryton", value: "MIDI 48–84", note: "3 octaves, anche" },
        { label: "Trompette", value: "MIDI 60–96", note: "3 octaves, anche" },
      ],
    },
    {
      type: "site_faq",
      primary: {
        title: "Commander des tuyaux",
      },
      items: [
        {
          question: "En combien de temps pouvez-vous livrer ?",
          answer: "En quelques jours à une semaine, selon les jeux commandés. Nous confirmons la date avec le devis.",
        },
        {
          question: "Vendez-vous des tuyaux à l'unité ?",
          answer: "Non. Nous fabriquons les tuyaux par jeux complets : chaque tuyau du jeu est découpé, harmonisé et assorti au suivant.",
        },
        {
          question: "Puis-je envoyer mes propres mesures ?",
          answer: "Oui. Envoyez la largeur et la profondeur intérieures, la longueur, les dimensions de la bouche et la pression de vent, ou un dessin ou un tuyau modèle, et nous fabriquons le jeu en conséquence.",
        },
        {
          question: "Harmonisés ou non harmonisés ?",
          answer: "Les deux. Nos harmonistes peuvent harmoniser les tuyaux pour votre pression de vent, ou vous les recevez prêts à harmoniser vous-même.",
        },
        {
          question: "Pouvez-vous aussi fabriquer les sommiers ?",
          answer: "Oui. Commandez tuyaux et sommiers ensemble, et ajoutez la conversion MIDI ou SmartValve si vous voulez que l'orgue joue en MIDI.",
        },
        {
          question: "Expédiez-vous hors de Belgique ?",
          answer: "Oui, nous expédions dans le monde entier. Le transport fait partie de votre devis.",
        },
      ],
    },
    {
      type: "contact_form",
      primary: {
        eyebrow: "Commander des tuyaux",
        title: "Envoyez-nous votre liste de jeux",
        intro: "Dites-nous ce dont vous avez besoin. Nous vous répondons avec un devis et une date d'expédition.",
        recipient: "decap",
        topics: "Tuyaux d'orgue, Tuyaux et sommiers",
        default_topic: "Tuyaux d'orgue",
        show_phone: true,
        show_location: false,
        message_placeholder:
          "Quels jeux (par ex. Bourdon, Flûte), étendue de chaque jeu, pression de vent, diapason standard ou vos propres mesures, harmonisés ou non…",
        submit_label: "Demander un devis",
        success_title: "Votre liste de jeux est bien arrivée",
        success_body: "Nous vous répondrons avec un devis et une date d'expédition.",
        aside_title: "Bon à savoir",
        aside_body:
          "- Vendus par jeux complets\n- Diapasons standard ou vos propres mesures\n- Prêts en quelques jours à une semaine, selon les jeux\n- Harmonisés ou prêts à harmoniser\n- Sommiers, conversion MIDI et SmartValve sur demande\n- Expédiés dans le monde entier",
      },
    },
  ],
};

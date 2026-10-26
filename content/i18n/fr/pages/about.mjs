/** About page, French (Prismic page "about"): the Decap family story, two Decap workshops, the workshop today. */
export default {
  type: "page",
  uid: "about",
  lang: "fr-fr",
  title: "À propos de Decap Herentals",
  theme: "decap",
  meta_title: "Facteurs d'orgues depuis 1895 | Decap Herentals",
  meta_description:
    "Quatre générations Decap, musiciens avant tout. Frans fonde Decap Herentals en 1933 ; Tony construit aujourd'hui orgues de danse, orchestrions et smARTvalve.",
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Facteurs d'orgues depuis 1895. Decap Herentals depuis 1933.",
        title: "Quatre générations de facteurs d'orgues Decap à Herentals",
        intro:
          "En 1895, Aloïs Decap commence à louer des orgues dans la région d'Anvers. Son fils Frans fonde Decap Herentals en 1933. Aujourd'hui, Tony Decap, quatrième génération, construit dans la même ville des orgues de danse, des orchestrions, des instruments automatiques et la technologie qui les pilote.",
        primary_cta_label: "Nos orgues",
        primary_cta_link: "/organs",
        secondary_cta_label: "Contacter l'atelier",
        secondary_cta_link: "/contact",
        image_brief:
          "Tony Decap at the workbench in the Herentals workshop, an organ façade in progress behind him, natural light, portrait 4:5",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Decap Herentals",
        title: "Une famille, un métier, depuis 1895",
        body:
          "Decap Herentals est connu pour ses vrais orgues de danse : des orgues construits pour faire danser. Nous avons aussi construit des orgues de rue et des orgues de Barbarie, mais ce sont des orgues de danse que nous fabriquons d'habitude. L'atelier se trouve au Langepad à Herentals, en Belgique.\n\nLe métier s'est transmis de père en fils quatre fois. Chaque génération a gardé ce qui fonctionnait et changé ce qui ne fonctionnait plus : Frans a donné à l'entreprise son propre atelier, François a fait passer l'orgue de danse au numérique, et Tony a apporté le MIDI, puis smARTvalve.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "Scan of archive photo of the Decap workshop in Herentals, early years, landscape 4:3",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "D'abord des musiciens",
        title: "Nous avons appris le bois pour construire des orgues",
        body:
          "Au fond, nous sommes des musiciens, pas des menuisiers. Nous avons appris à travailler le bois pour pouvoir construire des orgues, mais la musique passe en premier. C'est ce qui distinguait Decap à l'époque, et c'est toujours le cas.\n\nEntre 1960 et 1980, l'âge d'or de l'orgue de danse, la Belgique comptait quelque 120 cafés dansants et salles de danse où l'on allait danser tous les jours, chacun avec son propre orgue de danse. Depuis les débuts de Decap Herentals, nous poursuivons un seul but : un orgue qui joue mieux. Plus de sentiment, plus de maîtrise du volume et de l'intensité, plus de dynamique, plus de musicalité.",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        image_brief: "Scan of archive photo of a full Belgian dance hall in the 1960s or 70s with a Decap dance organ on the stage, 4:3",
      },
      items: [
        { point: "Des percussions jouées fort ou doucement, avec un timing réglable" },
        { point: "Une pression de vent réglée par sommier, des jeux qui jouent en vibrato" },
        { point: "Des orgues et des orchestrions au volume réglable" },
        { point: "smARTvalve : la même idée pour chaque tuyau" },
      ],
    },
    {
      type: "site_timeline",
      primary: {
        eyebrow: "Notre histoire",
        title: "D'une charrette à chien à Anvers au premier synthétiseur à vent",
        intro:
          "Les étapes ci-dessous proviennent des archives familiales et de l'histoire de la famille Decap publiée par Mostmans dans *Carousel Organ* n° 4 (2000).",
        tone: "Tinted",
      },
      items: [
        {
          year: "1864",
          title: "Naissance d'Aloïs Decap",
          body: "Fils du fermier Livien Decap et de Sophie Mortier.",
          image_brief: "Scan of archive portrait of Aloïs Decap, portrait 4:5",
        },
        {
          year: "vers 1888",
          title: "Accordéoniste dans les foires et les cafés",
          body: "Aloïs s'installe à Ekeren, près d'Anvers, et joue de l'accordéon dans les foires et les cafés.",
          image_brief: "Scan of archive photo of Aloïs Decap with his accordion, 4:3",
        },
        {
          year: "vers 1895",
          title: "Les débuts du commerce d'orgues Decap",
          body: "Aloïs commence à louer et à vendre des orgues. Il les livre en charrette à chien, puis à dos de mulet. Son fils Frans naît la même année.",
          image_brief: "Scan of archive photo of an early rented organ or the dog cart used for deliveries, 4:3",
        },
        {
          year: "1902",
          title: "Le premier atelier Decap",
          body: "Aloïs et son fils Livien commencent à construire des orgues dans un atelier de l'Essenstraat, à Anvers.",
          image_brief: "Scan of archive photo of the Essenstraat workshop, Antwerp, 4:3",
        },
        {
          year: "Après 14-18",
          title: "Gebroeders Decap",
          body: "Les fils d'Aloïs, Livien, Frans, Léon et Camille, s'associent sous le nom Gebroeders Decap.",
          image_brief: "Scan of archive photo of the four Decap brothers, 4:3",
        },
        {
          year: "1933",
          title: "Frans Decap fonde Decap Herentals",
          body: "Frans ouvre son propre atelier d'orgues à Herentals. La même année, les premiers accordéons automatiques apparaissent sur les orgues Decap.",
          highlight: true,
          image_brief: "Scan of archive photo of Frans Decap or the first Herentals workshop, 4:3",
        },
        {
          year: "1972",
          title: "François reprend l'entreprise",
          body: "Au décès de Frans, son fils François poursuit l'activité sous le nom Orgelfabriek Decap Herentals.",
          image_brief: "Scan of archive photo of François Decap in the workshop, 4:3",
        },
        {
          year: "1977",
          title: "Le premier orgue de danse numérique",
          body: "François remplace les tuyaux par le son numérique. Les salles de danse et les cafés aux budgets bien plus modestes peuvent désormais avoir un orgue.",
          highlight: true,
          image_brief: "Scan of archive photo of an early digital Decap dance organ in a dance hall, 4:3",
        },
        {
          year: "2000",
          title: "Les premiers à apporter le MIDI à l'orgue",
          body: "Tony Decap introduit le MIDI dans l'orgue. Toute une bibliothèque musicale tient sur une seule carte numérique et remplace des rayonnages de cartons perforés. Dans les années qui suivent, Decap ne construit plus seulement des orgues de danse : orchestrions, buffets de tuyaux indépendants, batteries automatiques et autres instruments automatiques.",
          highlight: true,
          image_brief: "Photo of a stack of cardboard book music next to a single memory card, on a workbench, 4:3",
        },
        {
          year: "2004",
          title: "L'Accordion Pedestal",
          body: "Un vrai accordéon, joué par MIDI sur son propre socle. [Voir l'accordéon automatique](/accordion).",
          image_brief: "Early Accordion Pedestal photographed against a plain wall, 4:3",
        },
        {
          year: "2008",
          title: "Un orgue de danse Decap en tournée",
          body: "Guido Belcanto emmène un orgue de danse Decap sur scène dans son spectacle *Balzaal der Gebroken Harten*. La sensibilité et le volume réglables le rendent possible. [Lire l'histoire](/work/guido-belcanto).",
          image_brief: "Scan of a photo or poster of Balzaal der Gebroken Harten with the Decap organ on stage, 4:3",
        },
        {
          year: "2016",
          title: "Des tuyaux d'orgue sortis de notre propre CNC",
          body: "Nous fraisons les premiers tuyaux d'orgue sur CNC, avec un procédé entièrement développé en interne et notre propre logiciel PipeCreator. [Nos tuyaux d'orgue](/organ-pipes).",
          image_brief: "Wooden pipe being milled on the 5-axis CNC, close-up, 4:3",
        },
        {
          year: "2025",
          title: "Le premier synthétiseur à vent",
          body: "smARTvalve équipe le premier orgue d'église transportable, chaque tuyau étant commandé individuellement : L'Explorateur, de l'organiste suisse Yves Rechsteiner. [Lire l'étude de cas](/work/yves-rechsteiner).",
          highlight: true,
          image_brief: "L'Explorateur set up in a chapel, wide shot, 4:3",
        },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Quel Decap ?",
        title: "Deux ateliers Decap, un seul fondateur",
        body:
          "Deux entreprises d'orgues portent aujourd'hui le nom Decap, et toutes deux descendent d'Aloïs Decap.\n\n- **Gebroeders Decap Antwerpen** (Frères Decap, Anvers) prolonge l'association que les fils d'Aloïs ont formée à Anvers après la Première Guerre mondiale.\n- **Decap Herentals** remonte à 1933, quand Frans Decap a ouvert son propre atelier à Herentals. C'est le Decap dont il est question ici.\n\nLes deux entreprises sont indépendantes l'une de l'autre et entretiennent de bonnes relations. Si vous possédez un orgue Decap et ne savez pas quel atelier l'a construit, envoyez-nous une photo de la façade et de toute plaque signalétique. Nous vous dirons ce que nous savons.",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        cta_label: "Envoyez-nous une photo",
        cta_link: "/contact",
        image_brief: "Scan of archive photo of a historic Decap organ façade with the Decap name visible, 4:3",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Restauration",
        title: "Frank Decap et son Atelier",
        body:
          "Frank Decap est le frère de Tony. Il dirige sa propre entreprise, l'Atelier Frank Decap : un maître artisan qui se consacre à la restauration d'orgues, en travaillant comme le faisaient les générations précédentes de la famille.\n\nFrank installe aussi nos modules de conversion MIDI : un orgue à cartons restauré peut ainsi jouer à partir de cartons et en MIDI. Les demandes de restauration lui parviennent directement via sa page sur ce site.",
        media_side: "Image right",
        aspect: "Portrait 4:5",
        cta_label: "Atelier Frank Decap",
        cta_link: "/frank-decap",
        image_brief: "Frank Decap restoring the bellows of a historic organ in his atelier, warm light, portrait 4:5",
        tone: "Tinted",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "L'atelier aujourd'hui",
        title: "De la CNC au lecteur, tout est fait à Herentals",
        body:
          "Presque tout ce qui entre dans un orgue Decap est fabriqué sous notre propre toit. Tous nos logiciels sont les nôtres : les programmes CNC qui fraisent les tuyaux, le logiciel qui pilote les instruments et le lecteur qui les fait jouer.",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        image_brief: "Wide shot of the Herentals workshop: CNC machine on one side, an organ in assembly on the other, 4:3",
      },
      items: [
        { point: "Conception et rendu 3D de chaque orgue avant le début de la production" },
        { point: "Tuyaux d'orgue en bois fraisés sur notre CNC 5 axes, avec PipeCreator, un logiciel que nous avons écrit nous-mêmes" },
        { point: "Harmonisation par nos propres harmonistes" },
        { point: "smARTvalve, modules de conversion MIDI et électronique de commande de nos instruments" },
        { point: "Virtual Orchestrion et MIDIMapper, nos logiciels de lecture et d'arrangement" },
        { point: "Des orgues construits en modules dans une façade : transportables et remontables" },
        { point: "Instruments automatiques : accordéon, tuyaux, percussions et percussions à lames" },
      ],
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "Le prochain orgue Decap",
        title: "Dites-nous où votre orgue jouera",
        body: "Décrivez la salle, la musique et le budget. Nous vous répondons avec des questions et une première idée de conception.",
        primary_cta_label: "Voir nos orgues",
        primary_cta_link: "/organs",
        secondary_cta_label: "Demander une consultation",
        secondary_cta_link: "/contact",
        tone: "Dark band",
      },
    },
  ],
};

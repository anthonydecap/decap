/** Work case study, French (Prismic project "yves-rechsteiner"): L'Explorateur, the most complete case. Facts and quotes from Yves Rechsteiner's article "About the Explorateur". */
export default {
  type: "project",
  uid: "yves-rechsteiner",
  lang: "fr-fr",
  title: "Yves Rechsteiner : L'Explorateur",
  theme: "decap",
  meta_title: "L'Explorateur, orgue de concert transportable | Decap",
  meta_description:
    "L'Explorateur, l'orgue transportable d'Yves Rechsteiner avec SmartValve sur chaque tuyau : 12 modules, monté en moins de 2 h, plus de 30 concerts depuis 2023.",
  fields: {
    summary: "Un orgue de concert transportable avec contrôle du vent sur chaque tuyau : monté en moins de deux heures, plus de 30 concerts depuis 2023.",
    client: "Yves Rechsteiner, Toulouse les Orgues",
    year: "2021–2026",
    location: "Toulouse, France",
  },
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Réalisations · Yves Rechsteiner",
        title: "L'Explorateur : un orgue de concert transportable avec SmartValve sur chaque tuyau",
        intro:
          "L'organiste Yves Rechsteiner voulait un orgue à tuyaux capable de jouer partout où se trouve la musique, pas seulement dans les églises. Ensemble, nous avons construit L'Explorateur : douze modules qui voyagent dans une seule camionnette, montés en moins de deux heures, avec le vent de chaque tuyau sous contrôle. Rechsteiner appelle le résultat un synthétiseur physique.",
        primary_cta_label: "SmartValve pour facteurs d'orgues",
        primary_cta_link: "/smartvalve-for-organ-builders",
        secondary_cta_label: "À propos de SmartValve",
        secondary_cta_link: "/smartvalve",
        image_brief: "L'Explorateur on stage with dancers in front, wide shot, 4:3",
      },
    },
    {
      type: "site_facts",
      primary: {
        layout: "Stats",
        tone: "Tinted",
      },
      items: [
        { value: "< 2 h", label: "de l'arrivée du camion aux premières notes" },
        { value: "30+", label: "concerts depuis 2023" },
        { value: "12", label: "modules, dans une seule camionnette de 20 m³" },
        { value: "0", label: "régulateur de vent : une soufflerie et une caisse de distribution" },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "L'idée",
        title: "Un orgue pour toutes les scènes, pas seulement pour les églises",
        body:
          "En 2013, Yves Rechsteiner devient directeur artistique de Toulouse les Orgues. Son idée : un orgue à tuyaux qui puisse sortir de l'église. *« Le but était d'avoir un instrument qui joue hors des églises, pour tout projet musical avec orgue à tuyaux. »*\n\nEn 2017, le projet s'arrête pour des raisons financières. Deux ans plus tard, Rechsteiner voit la bande-annonce du spectacle *Die Automaten* de Stephan Eicher, construit avec des instruments Decap, et rencontre Tony Decap. Tony avait l'expérience des orgues à tuyaux déplaçables et avait déjà développé sa propre régulation du vent. Rechsteiner commande un instrument piloté en MIDI.",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        image_brief: "Dancers on stage in front of L'Explorateur, an organist at the console, 4:3",
      },
    },
    {
      type: "site_timeline",
      primary: {
        eyebrow: "Chronologie",
        title: "De l'idée au synthétiseur à vent",
      },
      items: [
        { year: "2013", title: "L'idée", body: "Yves Rechsteiner, nouveau directeur artistique de Toulouse les Orgues, veut un orgue capable de jouer hors des églises." },
        { year: "2017", title: "En suspens", body: "Le projet d'orgue transportable s'arrête pour des raisons financières." },
        { year: "2019", title: "La rencontre avec Tony Decap", body: "Grâce à la bande-annonce de *Die Automaten* de Stephan Eicher. Rechsteiner commande un instrument piloté en MIDI." },
        { year: "2021", title: "Début de la construction", body: "Pendant la construction, Decap propose une nouveauté : régler le vent non plus par sommier, mais par tuyau." },
        { year: "2023", title: "Premiers concerts", body: "Après deux ans de travail et de recherche, L'Explorateur joue avec la première génération de soupapes. Les concerts commencent." },
        { year: "2023–2025", title: "SmartValve", body: "Tony Decap conçoit la deuxième génération, SmartValve, et l'électronique des modules est reconstruite autour d'elle.", highlight: true },
        { year: "2025", title: "Le premier synthétiseur à vent", body: "SmartValve en concert : chaque tuyau d'un orgue d'église transportable commandé séparément. Parmi les concerts, un hommage à Moondog dans la Chapelle de la Trinité à Lyon.", highlight: true },
        { year: "2026", title: "Les prochaines étapes", body: "Nouvelles soupapes et nouveaux sommiers, logiciel de console, ajustement de l'harmonisation et un jeu à anches libres provenant d'un *orgue expressif* Muller de 1830." },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "La technologie",
        title: "Le vent réglé par tuyau, pas par sommier",
        body:
          "Dans un orgue classique, tous les tuyaux d'un sommier partagent le même vent. Dans L'Explorateur, chaque tuyau a sa propre SmartValve, à quelques millimètres du pied du tuyau. La soupape mesure la chute de pression en entrée et ouvre davantage pour la compenser : chaque tuyau garde son vent quand de nombreux tuyaux sonnent ensemble.\n\nLes premières soupapes étaient de petits haut-parleurs transformés en soupapes. SmartValve, la deuxième génération, a été conçue par Tony Decap et produite industriellement. Pour l'organiste, cela signifie le contrôle de chaque note : *« on peut définir la nature de l'attaque du son. »*",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        cta_label: "Comment fonctionne SmartValve",
        cta_link: "/smartvalve",
        image_brief: "Close-up of the SmartValves under the pipes inside L'Explorateur, dark background, 4:3",
      },
      items: [
        { point: "Une soupape et un processeur par tuyau" },
        { point: "Pression mesurée et corrigée au pied du tuyau" },
        { point: "Aucun régulateur de vent : une soufflerie et une caisse de distribution suffisent" },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Conçu pour voyager",
        title: "Une camionnette, douze modules, moins de deux heures",
        body:
          "Dès le départ, L'Explorateur avait deux limites : tenir dans une camionnette de 20 m³ et ne pas peser plus de 1 200 kg. Chaque choix technique en a découlé.\n\nL'orgue est divisé en modules que l'on porte, place et raccorde. Comme SmartValve rend les régulateurs de vent inutiles, l'alimentation en vent se résume à une soufflerie et une caisse de distribution. *« Pour L'Explorateur, cela signifie un montage facile de moins de 2 heures, de l'arrivée du camion aux premières notes. »*",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        image_brief: "L'Explorateur modules being unloaded from the van or set up in a hall, 4:3",
        tone: "Tinted",
      },
      items: [
        { point: "Tient dans une camionnette de 20 m³" },
        { point: "1 200 kg au maximum" },
        { point: "Modules reconstruits aux mêmes dimensions standard" },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Dans la salle",
        title: "L'emplacement fait partie du son",
        body:
          "Comme les modules sont séparés, ils peuvent se tenir ensemble comme un seul orgue, ou à distance comme des plans sonores indépendants autour du public. Chaque emplacement change la rencontre entre l'instrument et la salle. *« Le même module de Flûte sonne différemment selon qu'il est placé devant, sur le côté ou derrière un autre module. »*",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "L'Explorateur modules spread around a hall or chapel, audience in between, wide shot, 4:3",
      },
    },
    {
      type: "site_facts",
      primary: {
        eyebrow: "Composition",
        title: "La composition d'origine",
        intro: "Telle que prévue au départ. L'instrument continue d'évoluer : voir « La suite ».",
        layout: "Spec list",
      },
      items: [
        { label: "Bourdon", value: "16′ à 4′" },
        { label: "Principal", value: "8′ à 1′" },
        { label: "Flûte", value: "8′ à 1′", note: "tuyaux à partir de la deuxième octave" },
        { label: "Flûte traversière en bois", value: "8′", note: "tuyaux à partir de la deuxième octave" },
        { label: "Salicional", value: "8′" },
        { label: "Gambe", value: "8′ et 4′", note: "tuyaux à partir de la deuxième octave" },
        { label: "Nasard", value: "" },
        { label: "Tierce", value: "" },
        { label: "Trompette", value: "16′ à 4′", note: "nouvelles anches libres dans les deux premières octaves" },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "La tuyauterie",
        title: "De vieux tuyaux, une nouvelle vie",
        body:
          "La plus grande partie de la tuyauterie est de seconde main, de la fin du XIXe et du début du XXe siècle, et a été harmonisée par Jean Daldosso. De nouveaux tuyaux à anches libres ont été fabriqués par Orgelbau Orglez en Bretagne : les anches libres changent de dynamique sans changer de hauteur, ce qui convient parfaitement au contrôle du vent par tuyau.\n\nAvec SmartValve, un jeu peut faire bien plus que ce pour quoi il a été construit : cinquante tuyaux de Flûte donnent toute une palette de couleurs, par le seul vent.",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        image_brief: "Close-up of old wooden and metal pipes standing on a module of L'Explorateur, 4:3",
      },
    },
    {
      type: "site_card_grid",
      primary: {
        eyebrow: "Sur scène",
        title: "Du Requiem de Fauré aux résidences MIDI",
        intro: "Depuis 2023, L'Explorateur a donné plus de 30 concerts, dans des églises, des musées, des théâtres et des salles de concert.",
        columns: "3",
        card_style: "Text cards",
      },
      items: [
        {
          title: "Répertoire",
          body: "La *Messe solennelle* de Vierne, le *Requiem* de Fauré, de la musique vocale de Thierry Escaich et le *Concerto pour orgue* de Poulenc.",
        },
        {
          title: "Concerts",
          body: "Dans des églises, des musées, des théâtres et des auditoriums. En novembre 2025, un hommage à Moondog dans la Chapelle de la Trinité à Lyon.",
        },
        {
          title: "Résidences",
          body: "Pour Toulouse les Orgues, le duo berlinois Gamut et l'artiste torontois George Rahi ont travaillé avec L'Explorateur comme orgue piloté en MIDI.",
        },
      ],
    },
    {
      type: "site_quote",
      primary: {
        quote: "Tous reconnaissent le haut niveau de qualité, de performance et de réponse de la smART valve de Tony Decap.",
        name: "Yves Rechsteiner",
        role: "À propos des facteurs d'orgues qui ont vu L'Explorateur",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "La suite",
        title: "Un instrument qui continue de grandir",
        body:
          "L'Explorateur n'est pas terminé, et c'est bien là l'idée.\n\n- **Clavier Osmose :** la pression du vent suit la touche, et l'organiste joue avec une technique de piano ou de clavicorde.\n- **Logiciel de console :** un outil pour programmer l'attaque, le développement et le vibrato de chaque son, inspiré des enveloppes ADSR.\n- **Tuyaux polyphones** pour la basse du Principal et du Salicional : plusieurs notes avec un seul tuyau.\n- **Nouvelles boîtes expressives** conçues par Tony Decap, pour les nuances les plus douces.\n- **Un Ophicléide 16′ plus léger**, et un jeu à anches libres provenant d'un *orgue expressif* Muller de 1830.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "Yves Rechsteiner at the console of L'Explorateur with a laptop beside the keyboard, 4:3",
        tone: "Tinted",
      },
    },
    {
      type: "site_video",
      primary: {
        eyebrow: "À voir",
        title: "Gamut explore L’Explorateur",
        intro: "Le duo berlinois Gamut, en résidence pour Toulouse les Orgues, montre ce que le contrôle du vent tuyau par tuyau rend possible.",
        video: "https://www.youtube.com/watch?v=IvDFsVgjlno",
        video_brief: "Gamut playing L'Explorateur in residency",
      },
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "Pour les facteurs d'orgues et les organistes",
        title: "Donnez à chaque tuyau son propre vent",
        body: "SmartValve est disponible pour les orgues neufs et, en remplaçant les chapes, pour les orgues existants. Parlez-nous de votre projet.",
        primary_cta_label: "SmartValve pour facteurs d'orgues",
        primary_cta_link: "/smartvalve-for-organ-builders",
        secondary_cta_label: "Contacter Decap",
        secondary_cta_link: "/contact",
        tone: "Dark band",
      },
    },
  ],
};

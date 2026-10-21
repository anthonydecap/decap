/** Brass Core, French (Prismic page "brass-core"): Orchestrionix flagship page, counterpart of SmartValve. */
export default {
  type: "page",
  uid: "brass-core",
  lang: "fr-fr",
  title: "Brass Core",
  theme: "orchestrionix",
  meta_title: "Brass Core : la trompette jouée par le son | Orchestrionix",
  meta_description:
    "Brass Core fait jouer une vraie trompette ou un trombone à partir d'un signal audio : une embouchure à bobine mobile, sans modification. 2 599 €, en stock.",
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Centered",
        eyebrow: "Orchestrionix",
        title: "Brass Core",
        intro:
          "Une vraie trompette ou un vrai trombone, joués par le son. Brass Core transforme n'importe quel signal audio en vibrations semblables à celles des lèvres d'un musicien, et le cuivre de l'instrument fait le reste.",
        primary_cta_label: "Commander Brass Core",
        primary_cta_link: "#contact-form",
        secondary_cta_label: "À propos d'Orchestrionix",
        secondary_cta_link: "/orchestrionix",
        note: "2 599 € · expédié immédiatement s'il est en stock",
        image_brief: "Brass Core on a trombone, dark background, low side light catching the brass, 16:9",
      },
    },
    {
      type: "core_3_d",
      primary: {
        title: "Faites-le tourner",
        description: "Brass Core en 3D. Faites glisser pour le tourner, faites défiler pour zoomer.",
        background_type: "color",
        background_color: "#0c0a09",
        enable_dragging: true,
        enable_zoom: true,
        enable_rotation: true,
      },
    },
    {
      type: "site_facts",
      primary: {
        layout: "Stats",
      },
      items: [
        { value: "Tout audio", label: "le pilote : un enregistrement, un sampler, un mix en direct" },
        { value: "0", label: "trou percé dans votre instrument" },
        { value: "120 × 90 × 70", label: "millimètres, assez compact pour se fixer par serrage" },
        { value: "En stock", label: "expédié immédiatement" },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Comment ça marche",
        title: "Une embouchure faite d'une bobine mobile",
        body:
          "Un trompettiste façonne le son avec la pression de l'air et la vibration de ses lèvres. Brass Core fait de même dans une chambre de pression étanche : un moteur à bobine mobile, piloté par votre signal audio, module l'air à l'embouchure.\n\nL'instrument n'est pas un caisson de haut-parleur. La vibration excite la résonance naturelle du cuivre lui-même : le son vient de la trompette ou du trombone, avec sa propre couleur et sa propre projection.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "Close-up of Brass Core on a trumpet mouthpiece, dark background, 4:3",
      },
      items: [
        { point: "Moteur à bobine mobile dans une chambre de pression étanche" },
        { point: "Le corps en cuivre façonne le son" },
        { point: "Embouchures et tubulures standard" },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Expression",
        title: "Chaque nuance, exactement comme enregistrée",
        body:
          "Comme Brass Core travaille à partir de la forme d'onde audio elle-même, il suit le volume, l'articulation et l'expression de l'enregistrement note par note. Donnez-lui un bon enregistrement de trompette et le public entend un vrai instrument le jouer.\n\nC'est un instrument Orchestrionix : pas de bibliothèque musicale, pas de presets. C'est vous qui apportez l'interprétation.",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        image_brief: "Brass Core on a trumpet on a stand, side view, dark background, 4:3",
        tone: "Tinted",
      },
    },
    {
      type: "site_card_grid",
      primary: {
        eyebrow: "Conçu pour",
        title: "De vrais cuivres là où aucun musicien ne peut être",
        columns: "3",
        card_style: "Text cards",
      },
      items: [
        { title: "Théâtre et cirque", body: "Une section de cuivres qui joue chaque soir, au bon moment, dans le décor et sur scène." },
        { title: "Musées et installations", body: "De vrais instruments qui jouent seuls, toute la journée, devant les visiteurs." },
        { title: "Studios et collectionneurs", body: "Des cuivres acoustiques à partir d'un enregistrement ou d'un sampler, pour le sound design et pour la collection." },
      ],
    },
    {
      type: "core_demo_video",
      variation: "default-slice",
      primary: {
        title: "Écoutez-le. Ressentez-le.",
        background_type: "color",
        background_color: "#0c0a09",
        video_url: "/videos/WhatsApp Video 2025-07-09 at 21.38.23.mp4",
        autoplay: false,
        loop: false,
        show_controls: true,
      },
    },
    {
      type: "site_quote",
      primary: {
        quote:
          "Le Brass Core est devenu le cœur battant de notre section de cuivres automatisée. Nous ne voulions pas simplement diffuser de la musique de cuivres par la sono, nous voulions que le public la ressente, comme si une vraie fanfare était là, sur scène. On nous demande souvent où se cache la fanfare.",
        name: "Circus Ronaldo",
      },
    },
    {
      type: "site_facts",
      primary: {
        eyebrow: "Caractéristiques",
        title: "Brass Core",
        layout: "Spec list",
      },
      items: [
        { label: "Instruments", value: "Trompette, trombone et similaires", note: "embouchures et tubulures standard" },
        { label: "Entrée", value: "Audio niveau ligne" },
        { label: "Amplificateur", value: "Amplificateur externe nécessaire" },
        { label: "Alimentation", value: "12 V DC, 2 A" },
        { label: "Dimensions", value: "120 × 90 × 70 mm" },
        { label: "Fixation", value: "Par serrage", note: "colliers pour trompette et trombone disponibles" },
        { label: "Modifications de l'instrument", value: "Aucune" },
      ],
    },
    {
      type: "site_faq",
      primary: {
        title: "Questions sur Brass Core",
      },
      items: [
        {
          question: "Peut-il restituer les nuances et l'expression ?",
          answer: "Oui. Il travaille directement à partir de la forme d'onde audio : le volume, l'articulation et l'expression passent exactement comme dans l'enregistrement.",
        },
        {
          question: "Dois-je modifier mon instrument ?",
          answer: "Non. Brass Core est non invasif : pas de perçage, pas de découpe, rien de définitif.",
        },
        {
          question: "Puis-je l'utiliser en direct ?",
          answer: "Oui. Il sert dans des spectacles, des installations et des démonstrations, partout où il faut un vrai son de cuivre sans musicien.",
        },
        {
          question: "Comment se branche-t-il ?",
          answer: "Envoyez-lui un signal audio niveau ligne, idéalement un enregistrement de cuivres de haute qualité, via un amplificateur externe. Brass Core fait le reste.",
        },
        {
          question: "En combien de temps puis-je en avoir un ?",
          answer: "Brass Core est l'un de nos rares produits disponibles sur étagère : s'il est en stock, il est expédié immédiatement.",
        },
      ],
    },
    {
      type: "contact_form",
      primary: {
        eyebrow: "Orchestrionix",
        title: "Commander Brass Core",
        intro: "2 599 €. Dites-nous avec quel instrument vous l'utiliserez et où il doit être livré.",
        recipient: "decap",
        topics: "Commander Brass Core, Question sur Brass Core",
        default_topic: "Commander Brass Core",
        show_phone: true,
        show_location: true,
        message_placeholder: "Trompette ou trombone, l'usage prévu, l'adresse de livraison…",
        submit_label: "Envoyer la demande de commande",
        success_title: "Merci",
        success_body: "Votre demande nous est parvenue. Nous vous confirmons personnellement la disponibilité et la livraison.",
      },
    },
  ],
};

/** Software overview, French (Prismic page "software"): Virtual Orchestrion and MIDIMapper. */
export default {
  type: "page",
  uid: "software",
  lang: "fr-fr",
  title: "Logiciels",
  theme: "decap",
  meta_title: "Logiciels pour orgue et orchestrion | Decap Herentals",
  meta_description:
    "Virtual Orchestrion joue vos instruments Decap et pianos QRS. MIDIMapper fait entendre vos arrangements avec de vrais échantillons d'orgue. Essai gratuit.",
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Logiciels",
        title: "Logiciels pour orchestrions, orgues et arrangeurs",
        intro:
          "Tous nos logiciels sont développés en interne : des programmes CNC qui fraisent nos tuyaux au logiciel qui pilote nos instruments. Virtual Orchestrion les fait jouer. MIDIMapper aide les arrangeurs à entendre ce qu'ils écrivent avant que cela n'arrive à l'orgue.",
        primary_cta_label: "Virtual Orchestrion",
        primary_cta_link: "/virtual-orchestrion",
        secondary_cta_label: "MIDIMapper",
        secondary_cta_link: "/midimapper",
        image_brief: "Laptop on a workbench showing Virtual Orchestrion, an organ façade out of focus behind it, portrait 4:5",
      },
    },
    {
      type: "site_card_grid",
      primary: {
        eyebrow: "Deux programmes",
        title: "L'un pour jouer, l'autre pour arranger",
        columns: "2",
        card_style: "Image cards",
      },
      items: [
        {
          tag: "Lecteur",
          title: "Virtual Orchestrion",
          body: "Le lecteur des instruments Decap et des pianos QRS. Il ajoute virtuellement les jeux manquants : un orgue plus petit joue des échelles plus grandes. Accueille jusqu'à 8 instruments VSTi et 8 DXi. Disponible dans la boutique.",
          link_label: "Virtual Orchestrion",
          link: "/virtual-orchestrion",
          image_brief: "Screenshot of Virtual Orchestrion's animated orchestrion view, 4:3",
        },
        {
          tag: "Pour les arrangeurs",
          title: "MIDIMapper",
          body: "Envoie le MIDI de votre DAW vers de vrais échantillons d'orgue : vous entendez un arrangement en registrations, et non en sons General MIDI. Jusqu'à 12 couches par map, 64 canaux et export WAV.",
          price: "150 € HTVA",
          link_label: "MIDIMapper et version d'essai gratuite",
          link: "/midimapper",
          image_brief: "Screenshot of the MIDIMapper map editor on a laptop, 4:3",
        },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Boutique de musique",
        title: "Des arrangements pour le lecteur : bientôt disponibles",
        body:
          "Bientôt, notre boutique vendra aussi des arrangements pour instruments Decap, issus de notre propre bibliothèque et d'arrangeurs indépendants. Chaque fichier sera protégé contre la copie et formaté pour Virtual Orchestrion, pour jouer sur les instruments que vous avez connectés.\n\nVous arrangez pour des instruments Decap ? [Faites-vous connaître](/contact).",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        cta_label: "Visiter la boutique",
        cta_link: "/shop",
        image_brief: "Virtual Orchestrion playing an arrangement in book view, screen filling the frame, 4:3",
        tone: "Tinted",
      },
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "Vous arrangez pour orgue ?",
        title: "Essayez MIDIMapper gratuitement",
        body: "Téléchargez la version d'essai, connectez-la à votre DAW et écoutez votre arrangement avec de vrais échantillons d'orgue.",
        price: "150 €",
        price_note: "HTVA, licence complète",
        primary_cta_label: "Télécharger la version d'essai",
        primary_cta_link: "/software/midi-mapper",
        secondary_cta_label: "À propos de MIDIMapper",
        secondary_cta_link: "/midimapper",
        tone: "Dark band",
      },
    },
  ],
};

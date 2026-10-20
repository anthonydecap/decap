/** MIDIMapper product page, French (Prismic page "midimapper"): MIDI router and player with real organ samples, for arrangers. */
export default {
  type: "page",
  uid: "midimapper",
  lang: "fr-fr",
  title: "MIDIMapper",
  theme: "decap",
  meta_title: "MIDIMapper : logiciel d'arrangement pour orgue | Decap",
  meta_description:
    "MIDIMapper envoie le MIDI de votre DAW vers de vrais échantillons d'orgue : entendez votre arrangement tel qu'il sonnera. 150 € HTVA. Essai gratuit.",
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "MIDIMapper, pour les arrangeurs",
        title: "Écoutez votre arrangement pour orgue avec de vrais échantillons d'orgue",
        intro:
          "Arranger pour un orgue de rue ou un orgue à tuyaux, c'est souvent écrire à l'aveugle jusqu'à ce que la musique arrive sur l'instrument. MIDIMapper prend le MIDI de votre logiciel d'arrangement, l'achemine selon vos propres maps et le joue avec de vrais échantillons d'orgue. Ce que vous entendez en arrangeant est bien plus proche de ce que l'orgue jouera.",
        primary_cta_label: "Version d'essai gratuite dans la boutique",
        primary_cta_link: "/software/midi-mapper",
        secondary_cta_label: "Tous les logiciels Decap",
        secondary_cta_link: "/software",
        note: "Licence complète 150 € HTVA. Version d'essai gratuite et licence dans la boutique.",
        image_brief: "Laptop with the MIDIMapper map editor open next to a MIDI keyboard on a desk, portrait 4:5",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Ce qu'il fait",
        title: "Routage MIDI et lecture d'orgue dans un seul programme",
        body:
          "MIDIMapper lit une entrée MIDI et envoie chaque note vers une ou plusieurs sorties, selon des maps que vous définissez. Une map peut superposer jusqu'à 12 couches : vous entendez les registrations en contexte, une Jazz Flute avec et sans trémolo, ou un woodblock ajouté sur une note.\n\nComme le son vient de vrais échantillons d'orgue et non de sons General MIDI, vous jugez l'équilibre et la registration pendant que vous arrangez, et non après la perforation du carton.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "Screenshot of a MIDIMapper map with several layers visible, 4:3",
      },
    },
    {
      type: "site_steps",
      primary: {
        eyebrow: "Comment ça marche",
        title: "Configurez une fois, puis arrangez",
        tone: "Tinted",
      },
      items: [
        {
          title: "Connecter votre DAW",
          body: "Envoyez le MIDI de votre logiciel d'arrangement via un câble MIDI virtuel comme loopMIDI, et choisissez les sorties. MIDIMapper garde cette configuration pour la prochaine fois.",
        },
        {
          title: "Créer votre map",
          body: "Dans le MapCreator intégré, attribuez les notes entrantes aux canaux de sortie et aux registrations. Affinez la map au fur et à mesure.",
        },
        {
          title: "Écouter et ajuster",
          body: "Jouez l'arrangement avec les échantillons d'orgue. Corrigez la durée des notes en millisecondes pour correspondre au carton et à la réponse de l'orgue.",
        },
        {
          title: "Enregistrer et partager",
          body: "Enregistrez la sortie et exportez-la en fichier WAV pour la réécouter ou la partager.",
        },
      ],
    },
    {
      type: "site_facts",
      primary: {
        eyebrow: "Fonctions",
        title: "Ce que comprend MIDIMapper",
        layout: "Spec list",
      },
      items: [
        { label: "Son", value: "De vrais échantillons d'orgue à tuyaux ; échantillons personnalisés possibles" },
        { label: "MapCreator", value: "Éditeur intégré pour votre propre routage MIDI" },
        { label: "Couches", value: "Jusqu'à 12 par map, pour superposer les registrations" },
        { label: "Commutateurs", value: "Commutateurs de registration et commutateurs de notes" },
        { label: "Sorties", value: "2 vers les modules de son internes, 2 librement routables" },
        { label: "Canaux", value: "64 adressables (4 × 16)" },
        { label: "Répétition", value: "Effet mandoline avec vitesse et rapport cyclique réglables" },
        { label: "Timing", value: "Contrôle à la milliseconde ; retard de batterie activé (carton) ou désactivé (arrangement)" },
        { label: "Durée de note", value: "Réglage global en millisecondes" },
        { label: "Export", value: "Enregistrement direct en WAV" },
        { label: "Entrée", value: "Toute entrée MIDI, par exemple loopMIDI depuis votre DAW" },
        { label: "Usage", value: "Orgues de rue et orgues à tuyaux ; ajout d'échantillons de percussions ou de glockenspiel" },
      ],
    },
    {
      type: "site_faq",
      primary: {
        eyebrow: "Questions",
        title: "À propos de MIDIMapper",
      },
      items: [
        {
          question: "À qui s'adresse MIDIMapper ?",
          answer:
            "Aux arrangeurs qui écrivent pour orgues de rue ou orgues à tuyaux et veulent entendre les registrations pendant qu'ils travaillent.",
        },
        {
          question: "Fonctionne-t-il avec ma DAW ?",
          answer:
            "Il fonctionne avec tout logiciel qui envoie du MIDI. Acheminez le MIDI vers MIDIMapper via un câble MIDI virtuel comme loopMIDI.",
        },
        {
          question: "Puis-je utiliser mes propres échantillons ?",
          answer: "Oui. MIDIMapper accepte des échantillons personnalisés, par exemple des percussions ou un glockenspiel pour compléter le son d'un orgue.",
        },
        {
          question: "Pourquoi ajuster la durée des notes ?",
          answer:
            "Le timing du mapper, la durée des notes sur le carton et la réponse de l'orgue réel diffèrent. Une durée de note globale en millisecondes permet de compenser, et le commutateur de retard de batterie s'aligne sur le timing du carton ou de l'arrangement.",
        },
        {
          question: "Comment acheter la licence complète ?",
          answer:
            "Dans la [boutique](/software/midi-mapper) : 150 € HTVA. La version d'essai gratuite s'y trouve aussi : vous pouvez d'abord essayer MIDIMapper avec vos propres arrangements.",
        },
      ],
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "MIDIMapper",
        title: "Entendez votre prochain arrangement avant l'orgue",
        body: "Téléchargez la version d'essai gratuite dans la boutique et connectez-la à votre DAW. Quand vous êtes prêt, achetez la licence complète dans la boutique.",
        price: "150 €",
        price_note: "HTVA, licence complète",
        primary_cta_label: "Version d'essai gratuite dans la boutique",
        primary_cta_link: "/software/midi-mapper",
        secondary_cta_label: "Acheter dans la boutique",
        secondary_cta_link: "/software/midi-mapper",
        tone: "Dark band",
      },
    },
  ],
};

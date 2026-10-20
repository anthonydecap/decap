/** Contact page, French (Prismic page "contact"): enquiry form to the Herentals workshop, address and contact details. */
export default {
  type: "page",
  uid: "contact",
  lang: "fr-fr",
  title: "Contacter Decap Herentals",
  theme: "decap",
  meta_title: "Contacter l'atelier d'orgues | Decap Herentals",
  meta_description:
    "Une question sur un orgue neuf, un instrument automatique, une conversion MIDI ou un logiciel ? Decap Herentals, Langepad 51C, 2200 Herentals. +32 14 22 44 94.",
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Centered",
        eyebrow: "Contact",
        title: "Contacter l'atelier d'orgues Decap à Herentals",
        intro:
          "Dites-nous ce que vous avez en tête : un orgue neuf, un instrument, une conversion MIDI ou une question sur nos logiciels. Plus vous nous en dites sur la salle et la musique, plus notre première réponse sera utile.",
      },
    },
    {
      type: "contact_form",
      primary: {
        eyebrow: "Envoyer une demande",
        title: "Comment pouvons-nous vous aider ?",
        recipient: "decap",
        topics: "Question générale, Orgue neuf, Instruments, Conversion MIDI, Logiciels, Presse",
        default_topic: "Question générale",
        show_phone: true,
        show_location: true,
        message_placeholder:
          "Pour un orgue neuf : où jouera-t-il, quelle musique, et quelle taille ou quel budget approximatif ? Pour une conversion MIDI : quel orgue et combien de touches ?",
        submit_label: "Envoyer la demande",
        success_title: "Merci, votre demande est envoyée",
        success_body: "Nous lisons chaque message à l'atelier et répondons personnellement.",
        aside_title: "L'atelier",
        aside_body:
          "**Decap Herentals**, Langepad 51C, 2200 Herentals, Belgique\n\n**Téléphone :** +32 14 22 44 94\n\n**E-mail :** [info@decap.be](mailto:info@decap.be)\n\nDECAP TONY BV · BE 0450.352.984\n\nVous faites restaurer un orgue historique ? Contactez directement l'[Atelier Frank Decap](/frank-decap).",
      },
    },
    {
      type: "site_faq",
      primary: {
        eyebrow: "Avant d'écrire",
        title: "Bon à savoir",
        tone: "Tinted",
      },
      items: [
        {
          question: "Puis-je visiter l'atelier à Herentals ?",
          answer:
            "L'atelier n'est pas ouvert aux visites : c'est là que les orgues sont construits. De temps en temps, nous organisons des journées portes ouvertes. Si nous construisons un orgue pour vous, vous venez plusieurs fois à l'atelier pendant la construction pour voir comment il avance.",
        },
        {
          question: "Livrez-vous hors de Belgique ?",
          answer:
            "Oui, nous expédions dans le monde entier. Des orgues et instruments Decap jouent au Japon, aux États-Unis, en Australie, en Asie et dans toute l'Europe. Le transport et l'installation dépendent du projet et font partie de votre devis.",
        },
        {
          question: "Qui restaure les orgues historiques ?",
          answer:
            "La restauration est le travail de l'Atelier Frank Decap, l'entreprise distincte de Frank, le frère de Tony. Utilisez le formulaire de [sa page](/frank-decap) pour que votre message lui parvienne directement.",
        },
      ],
    },
  ],
};

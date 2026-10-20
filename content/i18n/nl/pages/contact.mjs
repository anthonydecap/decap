/** Contact page (Prismic page "contact"), Dutch (nl-be). */
export default {
  type: "page",
  uid: "contact",
  lang: "nl-be",
  title: "Contact Decap Herentals",
  theme: "decap",
  meta_title: "Contact met de orgelwerkplaats | Decap Herentals",
  meta_description:
    "Vragen over een nieuw orgel, zelfspelende instrumenten, MIDI-ombouw of software? Decap Herentals, Langepad 51C, 2200 Herentals, België. +32 14 22 44 94.",
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Centered",
        eyebrow: "Contact",
        title: "Contacteer de Decap-orgelwerkplaats in Herentals",
        intro:
          "Vertel ons wat u in gedachten hebt: een nieuw orgel, een instrument, een MIDI-ombouw of een vraag over onze software. Hoe meer u ons vertelt over de ruimte en de muziek, hoe nuttiger ons eerste antwoord.",
      },
    },
    {
      type: "contact_form",
      primary: {
        eyebrow: "Stuur uw vraag",
        title: "Waarmee kunnen we u helpen?",
        recipient: "decap",
        topics: "Algemene vraag, Nieuw orgel, Instrumenten, MIDI-ombouw, Software, Pers",
        default_topic: "Algemene vraag",
        show_phone: true,
        show_location: true,
        message_placeholder:
          "Voor een nieuw orgel: waar zal het spelen, welke muziek, en ongeveer welke grootte of welk budget? Voor MIDI-ombouw: welk orgel en hoeveel toetsen?",
        submit_label: "Verstuur uw vraag",
        success_title: "Dank u, uw vraag is onderweg",
        success_body: "We lezen elk bericht in de werkplaats en antwoorden persoonlijk.",
        aside_title: "De werkplaats",
        aside_body:
          "**Decap Herentals**, Langepad 51C, 2200 Herentals, België\n\n**Telefoon:** +32 14 22 44 94\n\n**E-mail:** [info@decap.be](mailto:info@decap.be)\n\nDECAP TONY BV · BE 0450.352.984\n\nRestaureert u een historisch orgel? Contacteer [Atelier Frank Decap](/frank-decap) rechtstreeks.",
      },
    },
    {
      type: "site_faq",
      primary: {
        eyebrow: "Voordat u schrijft",
        title: "Goed om te weten",
        tone: "Tinted",
      },
      items: [
        {
          question: "Kan ik de werkplaats in Herentals bezoeken?",
          answer:
            "De werkplaats is niet open voor bezichtigingen: hier worden de orgels gebouwd. Af en toe houden we opendeurdagen. Bouwen we een orgel voor u, dan komt u tijdens de bouw meermaals naar de werkplaats om te zien hoe het vordert.",
        },
        {
          question: "Leveren jullie buiten België?",
          answer:
            "Ja, we verzenden wereldwijd. Decap-orgels en -instrumenten spelen in Japan, de VS, Australië, Azië en overal in Europa. Verzending en installatie hangen af van het project en maken deel uit van uw offerte.",
        },
        {
          question: "Wie restaureert historische orgels?",
          answer:
            "Restauratie is het werk van Atelier Frank Decap, de aparte zaak van Tony's broer Frank. Gebruik het formulier op [zijn pagina](/frank-decap), zodat uw bericht hem rechtstreeks bereikt.",
        },
      ],
    },
  ],
};

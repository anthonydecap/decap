/** Atelier Frank Decap page, French (Prismic page "frank-decap"): Frank's independent organ restoration workshop, with a contact form that reaches him. */
export default {
  type: "page",
  uid: "frank-decap",
  lang: "fr-fr",
  title: "Atelier Frank Decap",
  theme: "atelier",
  meta_title: "Restauration d'orgues | Atelier Frank Decap",
  meta_description:
    "L'Atelier Frank Decap restaure orgues à cartons, orgues de danse, de foire et de rue, fabrique des tuyaux à la main et installe les modules MIDI Decap.",
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Atelier Frank Decap",
        title: "Restauration d'orgues par Frank Decap",
        intro:
          "Frank Decap est un maître artisan qui a consacré son atelier à une seule chose : restaurer les orgues historiques tels qu'ils ont été construits. Il est le frère de Tony Decap et dirige son propre atelier indépendant. Écrivez-lui au sujet de votre orgue ; cette page lui parvient directement.",
        primary_cta_label: "Posez votre question à Frank",
        primary_cta_link: "#contact-form",
        image_brief:
          "Frank Decap at his workbench with an organ part in his hands, looking at the work rather than the camera, warm window light; portrait 4:5",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Qui restaure votre orgue",
        title: "Une famille, deux ateliers",
        body:
          "La famille Decap travaille avec les orgues depuis 1895. Tony Decap construit des orgues neufs et développe la technologie à Herentals. Son frère Frank a choisi l'autre versant du métier : faire jouer les orgues historiques comme leurs facteurs l'avaient voulu.\n\nL'Atelier Frank Decap est l'entreprise de Frank, distincte de Decap Herentals. Quand vous lui écrivez, vous traitez avec la personne qui fera le travail.\n\nL'atelier se trouve sur le même site que Decap Herentals, la fabrique d'orgues Decap au Langepad à Herentals.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "Wide shot of Frank's atelier: workbench, hand tools on the wall, an organ case opened up in the background; 4:3",
      },
    },
    {
      type: "site_card_grid",
      primary: {
        eyebrow: "Ce que Frank restaure",
        title: "Des soufflets à la façade",
        intro: "Les travaux courants de l'atelier.",
        columns: "3",
        card_style: "Text cards",
      },
      items: [
        { title: "Orgues à cartons et à rouleaux", body: "Claviers de lecture, mécanismes à cartons et à rouleaux, et tout ce qu'ils actionnent." },
        { title: "Orgues de danse, de foire et de rue", body: "Les orgues que la famille Decap construit et fait jouer depuis des générations, et ceux d'autres facteurs." },
        { title: "Mécaniques pneumatiques", body: "Soufflets de membranes, soupapes et tubulures, pour que chaque note parle à nouveau." },
        { title: "Soufflets et alimentation en vent", body: "Soufflets et réservoirs rendus étanches, pour que l'orgue garde un vent stable." },
        { title: "Harmonisation", body: "Des tuyaux harmonisés et accordés pour retrouver le caractère d'origine de l'orgue." },
        { title: "Buffets", body: "Le buffet et la façade qui rendent un orgue reconnaissable." },
        { title: "Facture traditionnelle de tuyaux", body: "Des tuyaux neufs faits à la main, de manière traditionnelle, assortis à la tuyauterie d'origine de l'orgue." },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Conversion MIDI",
        title: "Carton et MIDI dans un même orgue",
        body:
          "Frank installe les [modules de conversion MIDI Decap](/midi-conversion) fabriqués à Herentals. Les modules se placent entre le clavier de lecture et le sommier principal : le carton ou le rouleau continue de fonctionner comme avant, et carton et MIDI peuvent même jouer en même temps.\n\nVous achetez les modules chez Decap Herentals ; Frank les monte, seuls ou dans le cadre d'une restauration.",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        cta_label: "À propos des modules MIDI",
        cta_link: "/midi-conversion",
        image_brief: "Decap MIDI units fitted inside a historic organ, tubing to the key frame visible, lit with a work lamp; 4:3",
        tone: "Tinted",
      },
    },
    {
      type: "site_steps",
      primary: {
        eyebrow: "Comment Frank travaille",
        title: "De la première photo au premier air",
        intro: "Chaque orgue est différent : chaque restauration commence donc par un examen avant le devis.",
      },
      items: [
        {
          title: "Photos et premier regard",
          body: "Envoyez quelques lignes sur votre orgue via le formulaire ci-dessous. Quand Frank vous répond, vous pouvez lui envoyer des photos du buffet, de la façade, du clavier de lecture et de tout ce qui ne fonctionne plus. Elles lui en apprennent beaucoup avant qu'il ne voie l'orgue.",
        },
        {
          title: "Inspection",
          body: "Frank examine l'orgue lui-même pour voir ce dont il a besoin et ce qui est encore d'origine. Chaque orgue est différent : Frank décide au cas par cas s'il vient chez vous ou si l'orgue vient à l'atelier.",
        },
        {
          title: "Proposition écrite",
          body: "Vous recevez une proposition écrite décrivant les travaux que Frank recommande : vous savez ce qui sera fait avant que quoi que ce soit ne commence. Son contenu dépend de l'orgue et des travaux nécessaires.",
        },
        {
          title: "Restauration",
          body: "Le travail se fait à la main à l'atelier, pièce par pièce, dans le respect de ce que le facteur d'origine a réalisé.",
        },
        {
          title: "Harmonisation et livraison",
          body: "Frank harmonise et accorde l'orgue, et vous le rend en état de jouer. L'installation sur place se convient pour chaque orgue.",
        },
      ],
    },
    {
      type: "site_card_grid",
      primary: {
        eyebrow: "Avant et après",
        title: "Depuis l'atelier",
        columns: "3",
        card_style: "Image cards",
      },
      items: [
        {
          title: "Avant",
          body: "Un orgue tel qu'il est arrivé à l'atelier.",
          image_brief: "An organ as it arrived in the atelier, front view, same position and angle as the 'after' photo; 4:3",
        },
        {
          title: "Après",
          body: "Le même orgue, restauré et qui joue à nouveau.",
          image_brief: "The same organ after restoration, shot from the exact same spot and height as the 'before' photo; 4:3",
        },
        {
          title: "À l'atelier",
          body: "Restauration en cours, pièce par pièce, à la main.",
          image_brief: "Close-up of restoration in progress, e.g. new leather on a pneumatic pouch board or a bellows being re-covered, warm light; 4:3",
        },
      ],
    },
    {
      type: "contact_form",
      primary: {
        eyebrow: "Écrire à Frank",
        title: "Parlez à Frank de votre orgue",
        intro:
          "Ce formulaire parvient directement à Frank Decap. Quelques détails sur l'orgue l'aident à vous donner une première réponse utile.",
        recipient: "frank",
        topics: "Restauration, Installation MIDI, Réparation, Autre",
        default_topic: "Restauration",
        show_phone: true,
        show_location: true,
        message_placeholder:
          "Marque ou facteur de l'orgue, nombre de touches, carton ou rouleau, et son état. Les photos aident : vous pourrez les envoyer quand Frank vous répondra.",
        submit_label: "Envoyer à Frank",
        success_title: "Merci",
        success_body: "Votre message est arrivé chez Frank. Il répond personnellement ; préparez vos photos de l'orgue.",
        aside_title: "Joindre Frank",
        aside_body:
          "L'Atelier Frank Decap est indépendant de Decap Herentals. Le plus simple pour joindre Frank est ce formulaire.\n\n**Téléphone :** [TO CHECK: Frank's phone number]\n\n**Atelier :** Langepad 51C, 2200 Herentals, Belgique, sur le même site que Decap Herentals.\n\nPour un orgue neuf, des tuyaux ou des modules MIDI, contactez [Decap Herentals](/contact).",
      },
    },
  ],
};

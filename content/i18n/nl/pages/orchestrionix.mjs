/** Orchestrionix landing page (Prismic page "orchestrionix"), Dutch (nl-be). */
export default {
  type: "page",
  uid: "orchestrionix",
  lang: "nl-be",
  title: "Orchestrionix",
  theme: "orchestrionix",
  meta_title: "Orchestrionix robotinstrumenten | Decap Herentals",
  meta_description:
    "Orchestrionix is de lijn robotinstrumenten van Decap voor muzikanten. Geen muziekbibliotheek: u bespeelt ze met uw eigen audio. Vandaag is dat Brass Core.",
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Orchestrionix by Decap",
        title: "Orchestrionix: robotinstrumenten voor muzikanten",
        intro:
          "Orchestrionix is de lijn robotinstrumenten van Decap voor muzikanten, gemaakt in onze werkplaats in Herentals. Vroeger had de lijn een eigen website; nu is decap.be de thuisbasis van beide. Vandaag bestaat de lijn uit **Brass Core**: echte trompet- of tromboneklank, aangestuurd door uw eigen audio.",
        primary_cta_label: "Ontdek Brass Core",
        primary_cta_link: "/brass-core",
        secondary_cta_label: "Zelfspelende instrumenten",
        secondary_cta_link: "/instruments",
        image_brief: "Brass Core clamped to a trumpet on a stand, dark backdrop, low side light catching the brass, portrait 4:5",
        tone: "Dark band",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Wat het anders maakt",
        title: "Geen muziekbibliotheek. U levert de uitvoering.",
        body:
          "Onze zelfspelende instrumenten worden geleverd met een speler en muziek. Orchestrionix-instrumenten niet. Het zijn werktuigen voor muzikanten, sounddesigners en zalen die een echt akoestisch instrument met hun eigen materiaal willen aansturen.\n\nBrass Core neemt een audiosignaal op lijnniveau, van een opname of van MIDI via de sampler of synth van uw keuze. Een voice-coilmotor zet dat signaal om in luchttrillingen aan het mondstuk, en het koperinstrument zelf vormt de klank. Geen boorwerk, geen aanpassingen aan het instrument.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        cta_label: "Specificaties van Brass Core",
        cta_link: "/brass-core",
        image_brief: "Close-up of Brass Core on a trombone mouthpiece with its audio cable plugged in, dark backdrop, 4:3",
      },
    },
    {
      type: "site_card_grid",
      primary: {
        eyebrow: "Komt u van orchestrionix.com?",
        title: "Waar u alles nu vindt",
        intro: "Alles van de oude Orchestrionix-site staat nu op decap.be.",
        columns: "2",
        card_style: "Text cards",
      },
      items: [
        {
          title: "SmartValve",
          body: "SmartValve is een Decap-product: één ventiel en één processor voor elke orgelpijp.",
          link_label: "SmartValve",
          link: "/smartvalve",
        },
        {
          title: "Zelfspelende instrumenten",
          body: "De Accordion Pedestal en Cube, pijpen, Percussion Unit, Mallet Percussion en Bellow Organ.",
          link_label: "Instrumenten",
          link: "/instruments",
        },
      ],
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "Orchestrionix Brass Core",
        title: "Hoor een echte trompet spelen vanuit uw audio",
        body: "Bekijk hoe Brass Core werkt, waarop u het aansluit en waarvoor theaters, studio's en musea het gebruiken.",
        price: "€ 2.599",
        price_note: "Meteen verzonden als het op voorraad is",
        primary_cta_label: "Ontdek Brass Core",
        primary_cta_link: "/brass-core",
        secondary_cta_label: "Stel een vraag",
        secondary_cta_link: "/contact",
        tone: "Dark band",
      },
    },
  ],
};

/** Organ Composer page (Prismic page "organ-composer"), Dutch (nl-be). */
export default {
  type: "page",
  uid: "organ-composer",
  lang: "nl-be",
  title: "Organ Composer",
  theme: "decap",
  meta_title: "Organ Composer: ontwerp uw dansorgel | Decap",
  meta_description:
    "Kies een basisontwerp, grootte, klank, registers en frontinstrumenten, en stuur het naar Decap Herentals. We antwoorden met vragen en een eerste idee.",
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Centered",
        eyebrow: "Organ Composer",
        title: "Stel uw orgel samen",
        intro:
          "Kies een basisontwerp en beantwoord enkele vragen over de ruimte, de klank en de frontinstrumenten. Het duurt enkele minuten en geeft ons een duidelijk vertrekpunt voor het eerste gesprek.",
        note: "Geen prijscalculator en geen bestelling. Elk orgel wordt bevestigd na een adviesgesprek.",
      },
    },
    {
      type: "organ_composer",
      primary: {
        eyebrow: "Stap 1",
        title: "Kies een basisontwerp",
        intro:
          "Vertrek van een van onze modulaire orgels of van een ontwerp op maat dat we eerder bouwden. Kies daarna waar het zal spelen, de grootte, pijpen of digitaal, de registers en wat er vooraan speelt.",
        bespoke_note:
          "Wilt u iets dat in geen van deze ontwerpen te zien is? Kies **Van nul beginnen** en beschrijf uw idee in het bericht. Orgels op maat beginnen met een adviesgesprek en een 3D-render, dus niets ligt vast tot u het gezien hebt.",
        success_title: "Uw vertrekpunt is onderweg",
        success_body:
          "Dank u. Uw keuzes zijn bij ons in Herentals aangekomen. We antwoorden met vragen en een eerste idee.",
      },
      items: [
        {
          name: "Modulair dansorgel, 105 toetsen",
          kind: "Modular",
          description: "Opgebouwd uit beproefde modules op onze standaardschaal van 105 toetsen. Speelt muziek voor 121 toetsen via de Virtual Orchestrion-speler.",
          image_brief: "Existing 3D render of the modular 105-key dance organ, front view, plain background, 4:3",
        },
        {
          name: "Modulair dansorgel, 121 toetsen",
          kind: "Modular",
          description: "Opgebouwd uit beproefde modules op onze standaardschaal van 121 toetsen, voor meer noten en meer registers.",
          image_brief: "Existing 3D render of the modular 121-key dance organ, front view, plain background, 4:3",
        },
        {
          name: "Orgel op maat in een eigen stijl",
          kind: "Bespoke",
          description: "Een kast, kleuren en naam ontworpen voor één eigenaar, zoals de afgeronde Isabella in jaren 70-stijl. Pijpen, accordeons en drums vooraan.",
          image_brief: "Existing 3D render of a bespoke Decap concert organ, front three-quarter view, plain background, 4:3",
        },
        {
          name: "Orchestrion op maat",
          kind: "Bespoke",
          description: "Een volledig orchestrion met twee accordeons, pijpen, slagwerk en drums, ontworpen rond de ruimte waarin het speelt.",
          image_brief: "Existing 3D render of a bespoke Decap street organ, front three-quarter view, plain background, 4:3",
        },
      ],
    },
    {
      type: "site_faq",
      primary: {
        eyebrow: "Vragen",
        title: "Over de Organ Composer",
      },
      items: [
        {
          question: "Is een ontwerp versturen bindend?",
          answer: "Nee. Het is een aanvraag voor een adviesgesprek, geen bestelling. Niets ligt vast tot u een bestelling bij ons bevestigt.",
        },
        {
          question: "Wat gebeurt er nadat ik het verstuur?",
          answer:
            "We lezen uw keuzes en antwoorden met vragen en een eerste idee. Daarna bespreken we de ruimte, de muziek en het budget, en werken we toe naar een ontwerp en een 3D-render. [Bekijk hoe we een orgel bouwen](/organs).",
        },
        {
          question: "Kan ik van nul beginnen?",
          answer:
            "Ja. Kies **Van nul beginnen** en beschrijf wat u in gedachten hebt. Elke optie kan later nog veranderen, en een volledig op maat gemaakt orgel is altijd mogelijk.",
        },
      ],
    },
  ],
};

/** SmartValve for organ builders (Prismic page "smartvalve-for-organ-builders"), Dutch (nl-be): the B2B page. No prices, no competitor names. */
export default {
  type: "page",
  uid: "smartvalve-for-organ-builders",
  lang: "nl-be",
  title: "SmartValve voor orgelbouwers",
  theme: "smartvalve",
  meta_title: "Proportioneel pijpventiel voor orgelbouwers | SmartValve",
  meta_description:
    "SmartValve: proportioneel pijpventiel voor orgels, met eigen processor. Wind per pijp geregeld, digitale registers en optische MIDI, ook voor bestaande orgels.",
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "SmartValve voor orgelbouwers",
        title: "Een proportioneel pijpventiel met een processor in elk ventiel",
        intro:
          "SmartValve regelt de wind naar elke pijp afzonderlijk, meer dan 1.000 keer per seconde. Uw pijpen behouden hun stem; het orgel krijgt er dynamiek, expressie en registers bij die in software worden ingesteld. Ontworpen en gebouwd door Decap in Herentals, en bewezen op het concertpodium.",
        primary_cta_label: "Technische documentatie aanvragen",
        primary_cta_link: "#contact-form",
        secondary_cta_label: "Ontdek SmartValve",
        secondary_cta_link: "/smartvalve",
        note: "Voor nieuwe orgels, en voor bestaande door de pijpenstokken te vervangen. Prijzen op aanvraag.",
        image_brief: "A row of SmartValves mounted under pipes on a wind chest, dark background, low side light, portrait 4:5",
      },
    },
    {
      type: "site_facts",
      primary: {
        layout: "Stats",
      },
      items: [
        { value: "1.000×", label: "per seconde wordt de wind naar elke pijp gemeten en bijgestuurd" },
        { value: "0–200%", label: "winddruk per pijp, opgeslagen in het ventiel" },
        { value: "4 ms", label: "reactietijd" },
        { value: "200 m+", label: "optische MIDI, 100 keer sneller dan klassieke MIDI" },
      ],
    },
    {
      type: "site_card_grid",
      primary: {
        eyebrow: "Drie generaties pijpventielen",
        title: "Van open-of-dicht naar elke pijp onder controle",
        intro:
          "Elektrische tracturen behandelden een pijpventiel lang als een schakelaar. Nieuwere ventielen volgen de toets. SmartValve gaat een stap verder: het regelt de wind zelf.",
        columns: "3",
        card_style: "Text cards",
      },
      items: [
        {
          tag: "Generatie 1",
          title: "Aan/uit-ventiel",
          body: "Een magneet opent het ventiel volledig of sluit het. Betrouwbaar en eenvoudig, maar elke noot spreekt op dezelfde manier aan, hoe de toets ook bespeeld wordt.",
        },
        {
          tag: "Generatie 2",
          title: "Positievolgend ventiel",
          body: "De opening van het ventiel volgt de toetsgang, zodat de organist de aanzet vormgeeft. Zodra de toets is ingedrukt, blijft de pijp waar ze is.",
        },
        {
          tag: "SmartValve",
          title: "Windregeling in gesloten lus",
          body: "Een processor in elk ventiel regelt de wind naar zijn pijp, tijdens de aanzet en zolang de noot klinkt. Het kan de toets volgen, of alles wat u eraan koppelt.",
        },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Elke pijp haar eigen wind",
        title: "Gemeten en bijgestuurd terwijl de noot klinkt",
        body:
          "SmartValve is klein genoeg om op de pijpenstok te zitten, enkele millimeters van de pijpvoet. De processor meet de drukval aan de ingang en opent verder om die te compenseren, meer dan 1.000 keer per seconde. Als veel pijpen tegelijk spreken, houdt elke pijp haar wind. In L'Explorateur maakte dat windregelaars overbodig: een blaasmachine en een verdeelkast volstaan.\n\nDe basisdruk van elke pijp wordt opgeslagen in het ventiel, van 0 tot 200%. Zo kan een deel van de regeling die vroeger aan de intonatiebank gebeurde, in software gebeuren, en opnieuw gebeuren.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "Close-up of one SmartValve with its electronics visible, dark background, 4:3",
      },
      items: [
        { point: "Geregeld op enkele millimeters van de pijpvoet" },
        { point: "Stabiele aanspraak als veel pijpen tegelijk klinken" },
        { point: "Basisdruk per pijp opgeslagen in het ventiel" },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Toetspositie, of iets anders",
        title: "Koppel elke MIDI aan elke pijp",
        body:
          "SmartValve is volledig digitaal, dus u bepaalt wat het aanstuurt. Koppel de toetspositie aan de ventielopening en het gedraagt zich precies als een positievolgend ventiel. Koppel velocity, aftertouch, een controller of een automatiecurve uit een sequencer, en dezelfde pijp doet wat geen mechanisch ventiel kan.\n\n- Crescendo en decrescendo op een aangehouden noot\n- Vibrato en tremolo per pijp, niet per windlade\n- Drukcurves, slope en decay voor elke noot\n- Klassiek aan/uit-gedrag waar de muziek erom vraagt",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        image_brief: "Screen of the SmartValve software with a pressure curve, next to an organ keyboard, 4:3",
        tone: "Tinted",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Digitale registers",
        title: "Registers ingesteld in software, in elke combinatie",
        body:
          "Omdat elke pijp een eigen processor en adres heeft, ligt een register niet langer vast in de windlade. Met onze software wijst u elke combinatie van pijpen toe aan een register, elke pijp met haar eigen drukinstellingen. In een orgel dat volledig op SmartValve gebouwd is, is het aantal combinaties praktisch onbeperkt; als SmartValve een bestaand orgel uitbreidt, kan de oorspronkelijke sturing grenzen opleggen, en dat bekijken we per project.\n\nHet orgel is niet af op de dag van de levering: registers kunnen later worden toegevoegd of gewijzigd, zonder aan de windlade te komen.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "Screenshot of the stop configuration in the SmartValve software, pipes grouped into stops, 4:3",
      },
      items: [
        { point: "Elke combinatie van pijpen als register" },
        { point: "Drukinstellingen per pijp, per register" },
        { point: "Registers aanpasbaar na de installatie" },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Optische MIDI",
        title: "Van speeltafel naar windlade via licht",
        body:
          "SmartValves worden verbonden via Optische MIDI: meer dan 100 keer de snelheid van klassieke MIDI, over afstanden van 200 m en meer. Licht draagt geen elektrische storingen, dus de speeltafel kan staan waar het orgel hem nodig heeft. [Lees meer over SmartValve](/smartvalve).",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        image_brief: "Optical MIDI cable plugged into a SmartValve controller, glowing connector, dark background, 4:3",
      },
    },
    {
      type: "site_quote",
      primary: {
        quote: "Deze technologie maakt van een pijporgel in wezen een fysieke synthesizer.",
        name: "Studio 31, Basel",
        role: "Over L'Explorateur, het verplaatsbare concertorgel met SmartValve op elke pijp",
      },
    },
    {
      type: "site_steps",
      primary: {
        eyebrow: "Samenwerken met ons",
        title: "Van eerste vraag tot spelend orgel",
      },
      items: [
        { title: "Vertel ons over het project", body: "Een nieuw of een bestaand orgel, de windladen, het aantal pijpen en wat het instrument moet kunnen." },
        { title: "Technische documentatie", body: "Specificaties, afmetingen en bekabeling voor uw project, zodat uw team de integratie kan beoordelen." },
        { title: "Demonstratie", body: "Hoor SmartValve op echte pijpen, in onze werkplaats in Herentals of via videogesprek." },
        { title: "Ondersteuning bij de integratie", body: "We ondersteunen uw team bij de installatie, de configuratie van de ventielen en de digitale registers." },
      ],
    },
    {
      type: "site_faq",
      primary: {
        title: "Vragen van orgelbouwers",
      },
      items: [
        {
          question: "Kan SmartValve zich gedragen als een klassiek ventiel?",
          answer: "Ja. SmartValve is volledig digitaal: het kan werken als aan/uit-ventiel, de toetspositie volgen, of reageren op velocity, aftertouch en elke andere MIDI die u eraan koppelt. U kiest per pijp en per register.",
        },
        {
          question: "Kan het in een bestaand orgel?",
          answer: "Ja. SmartValves worden op een pijpenstok gemonteerd, dus een bestaand orgel kan worden omgebouwd door de pijpenstokken te vervangen. In een volledig SmartValve-orgel wordt alles in software ingesteld; als SmartValve een bestaande installatie uitbreidt, gelden de grenzen van de oorspronkelijke sturing. We bekijken elk project eerst.",
        },
        {
          question: "Welke speeltafels en sturingen werken met SmartValve?",
          answer: "Alles wat MIDI spreekt: een speeltafel met MIDI-uitgang, een sequencer of een computer. Via Optische MIDI kan de speeltafel 200 m of meer verwijderd zijn.",
        },
        {
          question: "Wat zijn digitale registers?",
          answer: "Registers die in software worden vastgelegd in plaats van in de windlade. U wijst elke combinatie van pijpen toe aan een register, met eigen drukinstellingen, en u kunt registers na de installatie nog wijzigen.",
        },
        {
          question: "Is SmartValve bewezen in de praktijk?",
          answer: "Ja. SmartValve speelt in L'Explorateur, het verplaatsbare concertorgel van Yves Rechsteiner met SmartValve op elke pijp: meer dan 30 voorstellingen sinds 2023, en opgesteld in minder dan twee uur nadat de vrachtwagen aankomt. [Lees de case study](/work/yves-rechsteiner).",
        },
        {
          question: "Wat kost het?",
          answer: "Dat hangt af van het aantal pijpen en van het project. Vertel ons over uw orgel en we sturen u een voorstel.",
        },
      ],
    },
    {
      type: "contact_form",
      primary: {
        eyebrow: "Voor orgelbouwers",
        title: "Vraag documentatie of een demonstratie aan",
        intro: "Vertel ons over uw werkplaats en uw project. We antwoorden persoonlijk.",
        recipient: "decap",
        topics: "Technische documentatie, Demonstratie, Voorstel voor een project, Vraag over integratie",
        default_topic: "Technische documentatie",
        show_phone: true,
        show_location: false,
        message_placeholder: "Uw werkplaats, het orgel (nieuw of bestaand), de windladen, het aantal pijpen en wat u met SmartValve wilt doen…",
        submit_label: "Aanvraag versturen",
        success_title: "Dank u",
        success_body: "Uw aanvraag is goed aangekomen. We antwoorden persoonlijk met de informatie die u vroeg.",
        aside_title: "Decap Herentals",
        aside_body:
          "Langepad 51C, 2200 Herentals, België\n\n+32 14 22 44 94\n\n[info@decap.be](mailto:info@decap.be)\n\nSmartValve wordt ontworpen, gebouwd en geprogrammeerd in onze eigen werkplaats.",
      },
    },
  ],
};

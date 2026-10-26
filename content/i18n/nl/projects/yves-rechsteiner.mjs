/** Work case study (Prismic project "yves-rechsteiner"), Dutch (nl-be): L'Explorateur, the most complete case. Facts and quotes from Yves Rechsteiner's article "About the Explorateur". */
export default {
  type: "project",
  uid: "yves-rechsteiner",
  lang: "nl-be",
  title: "Yves Rechsteiner: L'Explorateur",
  theme: "decap",
  meta_title: "L'Explorateur: verplaatsbaar concertorgel | Decap",
  meta_description:
    "L'Explorateur, het mobiele pijporgel van Yves Rechsteiner met smARTvalve op elke pijp: 12 modules, opgesteld in minder dan 2 uur, 30+ concerten sinds 2023.",
  fields: {
    summary: "Een verplaatsbaar concertorgel met windregeling op elke pijp: opgesteld in minder dan twee uur, meer dan 30 optredens sinds 2023.",
    client: "Yves Rechsteiner, Toulouse les Orgues",
    year: "2021–2026",
    location: "Toulouse, Frankrijk",
  },
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Realisaties · Yves Rechsteiner",
        title: "L'Explorateur: een verplaatsbaar concertorgel met smARTvalve op elke pijp",
        intro:
          "Organist Yves Rechsteiner wilde een pijporgel dat overal kan spelen waar de muziek is, niet alleen in kerken. Samen bouwden we L'Explorateur: twaalf modules die in één bestelwagen reizen, opgesteld in minder dan twee uur, met de wind van elke pijp onder controle. Rechsteiner noemt het resultaat een fysieke synthesizer.",
        primary_cta_label: "smARTvalve voor orgelbouwers",
        primary_cta_link: "/smartvalve-for-organ-builders",
        secondary_cta_label: "Over smARTvalve",
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
        { value: "< 2 u", label: "van de aankomst van de vrachtwagen tot de eerste noot" },
        { value: "30+", label: "optredens sinds 2023" },
        { value: "12", label: "modules, in één bestelwagen van 20 m³" },
        { value: "0", label: "windregelaars: één blaasmachine en een verdeelkast" },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Het idee",
        title: "Een orgel voor elk podium, niet alleen voor kerken",
        body:
          "In 2013 werd Yves Rechsteiner artistiek directeur van Toulouse les Orgues. Zijn idee: een pijporgel dat de kerk uit kan. *“Het doel was een instrument dat buiten kerken optreedt, voor elk muzikaal project met pijporgel.”*\n\nIn 2017 stopte het project om financiële redenen. Twee jaar later zag Rechsteiner een teaser van Stephan Eichers show *Die Automaten*, gebouwd met instrumenten van Decap, en ontmoette hij Tony Decap. Tony had ervaring met verplaatsbare pijporgels en had al een eigen windregeling ontwikkeld. Rechsteiner bestelde een MIDI-gestuurd instrument.",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        image_brief: "Dancers on stage in front of L'Explorateur, an organist at the console, 4:3",
      },
    },
    {
      type: "site_timeline",
      primary: {
        eyebrow: "Tijdlijn",
        title: "Van idee tot windsynthesizer",
      },
      items: [
        { year: "2013", title: "Het idee", body: "Yves Rechsteiner, nieuw artistiek directeur van Toulouse les Orgues, wil een orgel dat buiten kerken kan optreden." },
        { year: "2017", title: "On hold", body: "Het project voor een verplaatsbaar orgel stopt om financiële redenen." },
        { year: "2019", title: "Kennismaking met Tony Decap", body: "Via een teaser van Stephan Eichers *Die Automaten*. Rechsteiner bestelt een MIDI-gestuurd instrument." },
        { year: "2021", title: "Start van de bouw", body: "Tijdens de bouw stelt Decap iets nieuws voor: de wind niet per windlade regelen, maar per pijp." },
        { year: "2023", title: "Eerste optredens", body: "Na twee jaar werk en onderzoek speelt L'Explorateur met de eerste generatie ventielen. De optredens beginnen." },
        { year: "2023–2025", title: "smARTvalve", body: "Tony Decap ontwerpt de tweede generatie, smARTvalve, en de elektronica van de modules wordt eromheen opnieuw opgebouwd.", highlight: true },
        { year: "2025", title: "De eerste windsynthesizer", body: "smARTvalve in concert: elke pijp van een verplaatsbaar kerkorgel afzonderlijk gestuurd. Een van de concerten: een eerbetoon aan Moondog in de Chapelle de la Trinité in Lyon.", highlight: true },
        { year: "2026", title: "Volgende stappen", body: "Nieuwe ventielen en windladen, software voor de speeltafel, bijstelling van de intonatie en een register met vrije tongen uit een Muller-*orgue expressif* uit 1830." },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "De technologie",
        title: "Windregeling per pijp, niet per windlade",
        body:
          "In een klassiek orgel delen alle pijpen op een windlade dezelfde wind. In L'Explorateur heeft elke pijp een eigen smARTvalve, enkele millimeters van de pijpvoet. Het ventiel meet de drukval aan de ingang en opent verder om die te compenseren, zodat elke pijp haar wind houdt als veel pijpen tegelijk klinken.\n\nDe eerste ventielen waren kleine luidsprekers die tot ventiel waren omgebouwd. smARTvalve, de tweede generatie, werd ontworpen door Tony Decap en industrieel geproduceerd. Voor de organist betekent het controle over elke noot: *“je kunt de aard van de aanzet van de klank bepalen.”*",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        cta_label: "Hoe smARTvalve werkt",
        cta_link: "/smartvalve",
        image_brief: "Close-up of the smARTvalves under the pipes inside L'Explorateur, dark background, 4:3",
      },
      items: [
        { point: "Eén ventiel en één processor per pijp" },
        { point: "Druk gemeten en bijgestuurd aan de pijpvoet" },
        { point: "Geen windregelaars: een blaasmachine en een verdeelkast volstaan" },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Gebouwd om te reizen",
        title: "Eén bestelwagen, twaalf modules, minder dan twee uur",
        body:
          "Van bij het begin had L'Explorateur twee grenzen: het moest in een bestelwagen van 20 m³ passen en mocht niet meer dan 1.200 kg wegen. Elke technische keuze volgde daaruit.\n\nHet orgel is verdeeld in modules die worden binnengedragen, geplaatst en aangesloten. Omdat smARTvalve windregelaars overbodig maakt, bestaat het windsysteem alleen uit een blaasmachine en een verdeelkast. *“Voor L'Explorateur betekent het een eenvoudige opbouw van minder dan 2 uur, van de aankomst van de vrachtwagen tot het spelen.”*",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        image_brief: "L'Explorateur modules being unloaded from the van or set up in a hall, 4:3",
        tone: "Tinted",
      },
      items: [
        { point: "Past in een bestelwagen van 20 m³" },
        { point: "Maximaal 1.200 kg" },
        { point: "Modules herbouwd tot identieke standaardafmetingen" },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "In de zaal",
        title: "De opstelling wordt deel van de klank",
        body:
          "Omdat de modules los van elkaar staan, kunnen ze samen staan als één orgel, of apart als zelfstandige werken rond het publiek. Elke opstelling verandert hoe het instrument de ruimte ontmoet. *“Dezelfde Fluit-module klinkt anders als ze vooraan, opzij of achter een andere module staat.”*",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "L'Explorateur modules spread around a hall or chapel, audience in between, wide shot, 4:3",
      },
    },
    {
      type: "site_facts",
      primary: {
        eyebrow: "Dispositie",
        title: "De oorspronkelijke dispositie",
        intro: "Zoals bij de start gepland. Het instrument blijft evolueren: zie “Wat volgt”.",
        layout: "Spec list",
      },
      items: [
        { label: "Bourdon", value: "16′ tot 4′" },
        { label: "Principal", value: "8′ tot 1′" },
        { label: "Fluit", value: "8′ tot 1′", note: "pijpen vanaf het tweede octaaf" },
        { label: "Houten traversfluit", value: "8′", note: "pijpen vanaf het tweede octaaf" },
        { label: "Salicionaal", value: "8′" },
        { label: "Gamba", value: "8′ en 4′", note: "pijpen vanaf het tweede octaaf" },
        { label: "Nasard", value: "" },
        { label: "Terts", value: "" },
        { label: "Trompet", value: "16′ tot 4′", note: "nieuwe vrije tongen in de eerste twee octaven" },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Het pijpwerk",
        title: "Oude pijpen, een nieuw leven",
        body:
          "Het meeste pijpwerk is tweedehands, van eind 19e en begin 20e eeuw, en werd geïntoneerd door Jean Daldosso. Nieuwe pijpen met vrije tongen werden gemaakt door Orgelbau Orglez in Bretagne: vrije tongen veranderen van sterkte zonder van toonhoogte te veranderen, perfect voor windregeling per pijp.\n\nMet smARTvalve kan één register veel meer dan waarvoor het gebouwd werd: vijftig Fluit-pijpen geven een hele waaier aan kleuren, alleen door de wind.",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        image_brief: "Close-up of old wooden and metal pipes standing on a module of L'Explorateur, 4:3",
      },
    },
    {
      type: "site_card_grid",
      primary: {
        eyebrow: "Op het podium",
        title: "Van Faurés Requiem tot MIDI-residenties",
        intro: "Sinds 2023 speelde L'Explorateur meer dan 30 optredens, in kerken, musea, theaters en concertzalen.",
        columns: "3",
        card_style: "Text cards",
      },
      items: [
        {
          title: "Repertoire",
          body: "Viernes *Messe solennelle*, Faurés *Requiem*, vocale muziek van Thierry Escaich en Poulencs *Orgelconcert*.",
        },
        {
          title: "Concerten",
          body: "In kerken, musea, theaters en auditoria. In november 2025 een eerbetoon aan Moondog in de Chapelle de la Trinité in Lyon.",
        },
        {
          title: "Residenties",
          body: "Voor Toulouse les Orgues werkten het Berlijnse duo Gamut en de Torontese kunstenaar George Rahi met L'Explorateur als MIDI-gestuurd orgel.",
        },
      ],
    },
    {
      type: "site_quote",
      primary: {
        quote: "Ze erkennen allemaal het hoge niveau van kwaliteit, prestaties en respons van Tony Decaps smART valve.",
        name: "Yves Rechsteiner",
        role: "Over de orgelbouwers die L'Explorateur gezien hebben",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Wat volgt",
        title: "Een instrument dat blijft groeien",
        body:
          "L'Explorateur is niet af, en daar gaat het net om.\n\n- **Osmose-klavier:** de winddruk volgt de toets, zodat de organist speelt met een piano- of clavichordtechniek.\n- **Software voor de speeltafel:** een hulpmiddel om aanzet, verloop en vibrato per klank te programmeren, geïnspireerd op ADSR-envelopes.\n- **Polyfone pijpen** voor de bas van de Principal en de Salicionaal: meerdere noten uit één pijp.\n- **Nieuwe zwelkasten** ontworpen door Tony Decap, voor de zachtste nuances.\n- **Een lichtere Ophicléide 16′**, en een register met vrije tongen uit een Muller-*orgue expressif* uit 1830.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "Yves Rechsteiner at the console of L'Explorateur with a laptop beside the keyboard, 4:3",
        tone: "Tinted",
      },
    },
    {
      type: "site_video",
      primary: {
        eyebrow: "Bekijk",
        title: "Gamut verkent L’Explorateur",
        intro: "Het Berlijnse duo Gamut, in residentie voor Toulouse les Orgues, toont wat windregeling per pijp mogelijk maakt.",
        video: "https://www.youtube.com/watch?v=IvDFsVgjlno",
        video_brief: "Gamut playing L'Explorateur in residency",
      },
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "Voor orgelbouwers en organisten",
        title: "Geef elke pijp haar eigen wind",
        body: "smARTvalve is beschikbaar voor nieuwe orgels en, door de pijpenstokken te vervangen, voor bestaande orgels. Vertel ons over uw project.",
        primary_cta_label: "smARTvalve voor orgelbouwers",
        primary_cta_link: "/smartvalve-for-organ-builders",
        secondary_cta_label: "Contacteer Decap",
        secondary_cta_link: "/contact",
        tone: "Dark band",
      },
    },
  ],
};

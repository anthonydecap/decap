/** Organ pipes page (Prismic page "organ-pipes"), Dutch (nl-be). */
export default {
  type: "page",
  uid: "organ-pipes",
  lang: "nl-be",
  title: "Orgelpijpen",
  theme: "decap",
  meta_title: "Houten orgelpijpen, klaar binnen een week | Decap",
  meta_description:
    "Bijna elke houten orgelpijp, gefreesd op onze eigen CNC en verzendklaar binnen een week. Standaardmensuren of uw eigen maten, voor zelfbouw en orgels.",
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "De enige werkplaats ter wereld die dit doet",
        title: "Houten orgelpijpen, klaar in dagen, niet in maanden",
        intro:
          "Wij zijn het enige bedrijf ter wereld dat de CNC-productie van orgelpijpen zelf heeft ontwikkeld. Bijna elke houten pijp, in onze standaardmensuren of naar uw eigen maten, gefreesd, gemonteerd en binnen enkele dagen verzendklaar.",
        primary_cta_label: "Pijpen bestellen",
        primary_cta_link: "#contact-form",
        secondary_cta_label: "Pijpen in een nieuw orgel",
        secondary_cta_link: "/organs",
        note: "Voor zelfbouwers, uw eigen orgel, orgelbouwers en restaurateurs.",
        image_brief:
          "A row of new wooden pipes of increasing size on a workbench, pale Ayous bodies and beech mouths visible, side light from a window; portrait 4:5",
      },
    },
    {
      type: "site_facts",
      primary: {
        layout: "Stats",
        tone: "Tinted",
      },
      items: [
        { value: "1 week", label: "of minder van bestelling tot verzending, afhankelijk van de registers" },
        { value: "Elke maat", label: "onze standaardmensuren of uw eigen maten" },
        { value: "6 octaven", label: "bereik van de Bourdon, MIDI 24 tot 96" },
        { value: "2016", label: "onze eerste pijpen van onze eigen CNC" },
      ],
    },
    {
      type: "site_video",
      primary: {
        eyebrow: "Van tekening tot pijp",
        title: "Bekijk hoe een pijp gemaakt wordt",
        intro: "In 3D getekend op ons kantoor, gefreesd op onze CNC, gelijmd en geïntoneerd in de werkplaats ernaast.",
        video_brief:
          "Film, 1–2 minutes, landscape 16:9: a pipe drawn in 3D in PipeCreator at the office → the G-code sent to the CNC → the CNC milling the parts → gluing → the finished pipe being blown for the first time. Upload to YouTube and paste the link here.",
      },
    },
    {
      type: "site_card_grid",
      primary: {
        eyebrow: "Wie onze pijpen bestelt",
        title: "Eén register of een volledig windsysteem",
        intro: "Koop alleen de registers, of de registers en de windladen om ze op te zetten. We maken de onderdelen die u nodig hebt en laten de rest aan u.",
        columns: "4",
        card_style: "Text cards",
      },
      items: [
        {
          title: "Zelfbouwers",
          body: "Bouwt u uw eigen orgel of instrument? Bestel de registers die u nodig hebt, geïntoneerd of klaar om zelf te intoneren.",
        },
        {
          title: "Uw eigen orgel",
          body: "Een extra register of een vervangend register, gemaakt om aan te sluiten bij wat er al is.",
        },
        {
          title: "Orgelbouwers en restaurateurs",
          body: "Pijpen naar uw mensuren en uw maten, zonder maandenlang op een leverancier te wachten.",
        },
        {
          title: "Pijpen en windladen",
          body: "Neem er windladen bij van ons, of ga verder met [MIDI-ombouw](/midi-conversion) of [SmartValve](/smartvalve) op elke pijp.",
        },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Hoe we ze maken",
        title: "Een proces dat we zelf hebben ontwikkeld",
        body:
          "Sinds 2016 frezen we onze orgelpijpen op een 5-assige CNC. De G-code komt uit **PipeCreator**, software die we in eigen huis hebben geschreven. Geen ander bedrijf maakt orgelpijpen op deze manier. De machine snijdt elk onderdeel op exacte maten en hoeken, zodat elke pijp in een register aansluit op de volgende.\n\nNa het frezen en lijmen is de pijp klaar voor intonatie en afwerking. Onze intoneurs kunnen dat voor u doen, of u neemt het over in het stadium dat u verkiest.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "Looping clip (mp4, 10–15 s, no sound needed): the 5-axis CNC milling a pipe part, shot beside the machine door. Upload it in the video field; until then a still photo, 4:3.",
      },
      items: [
        { point: "5-assige CNC, G-code uit onze eigen PipeCreator-software" },
        { point: "Klaar in enkele dagen tot een week, afhankelijk van de registers" },
        { point: "Geïntoneerd door onze intoneurs, of geleverd om zelf te intoneren" },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Standaard of uw eigen maten",
        title: "Verander een maat, krijg een nieuwe pijp",
        body:
          "Elke pijpfamilie heeft hetzelfde basisontwerp, met ruimte om te variëren. Iets wijder voor meer grondtoon, iets nauwer voor meer boventonen, een hogere opsnede en een andere lengte voor een hogere winddruk.\n\nIn PipeCreator veranderen we de binnenbreedte en -diepte, de plankdikte en de lengte van onze standaardmodellen in enkele minuten. De G-code gaat rechtstreeks naar de CNC. Een pijp naar uw eigen maten duurt dus ongeveer even lang als een standaardpijp.",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        image_brief: "Looping clip (mp4, 10–15 s): a pipe model in PipeCreator at the office, a measurement being changed and the 3D pipe updating. Screen recording or filmed monitor, 4:3.",
        tone: "Tinted",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Hout",
        title: "Lichamen in ayous, voeten en monden in beuk",
        body:
          "Een CNC ziet het verschil niet tussen fijne nerf en een kwast, dus we kozen het hout voor de machine en voor de klank. Het lichaam is van **ayous** (*Triplochiton scleroxylon*): zeer stabiel, lichtgeel en vrijwel kwastvrij. Voeten en monden zijn gemaakt van **met de hand geselecteerd beukenhout**.",
        media_side: "Image right",
        aspect: "Square",
        image_brief: "Close-up of the mouth of a wooden pipe, pale Ayous body against the beech mouth, square 1:1",
      },
    },
    {
      type: "site_facts",
      primary: {
        eyebrow: "Bereik",
        title: "Ons standaardgamma orgelpijpen",
        intro: "Het bereik staat aangegeven in MIDI-nootnummers (60 = centrale C). Andere bereiken en maten op aanvraag.",
        layout: "Spec list",
      },
      items: [
        { label: "Bourdon", value: "MIDI 24–96", note: "6 octaven, gedekt" },
        { label: "Jazzfluit", value: "MIDI 60–96", note: "3 octaven, gedekt" },
        { label: "Vibraton", value: "MIDI 46–84", note: "3 octaven, gedekt" },
        { label: "Double Street Organ", value: "MIDI 60–96", note: "3 octaven, gedekt" },
        { label: "Fluit (Fluit 8′ enz.)", value: "MIDI 60–96", note: "3 octaven, open" },
        { label: "Violen (alt, cello enz.)", value: "MIDI 48–96", note: "4 octaven, open" },
        { label: "Bariton", value: "MIDI 48–84", note: "3 octaven, tong" },
        { label: "Trompet", value: "MIDI 60–96", note: "3 octaven, tong" },
      ],
    },
    {
      type: "site_faq",
      primary: {
        title: "Pijpen bestellen",
      },
      items: [
        {
          question: "Hoe snel kunt u leveren?",
          answer: "Binnen enkele dagen tot een week, afhankelijk van de registers die u bestelt. We bevestigen de datum samen met de offerte.",
        },
        {
          question: "Verkoopt u losse pijpen?",
          answer: "Nee. We maken pijpen als volledige registers, zodat elke pijp in het register gefreesd, geïntoneerd en afgestemd is op de volgende.",
        },
        {
          question: "Kan ik mijn eigen maten doorsturen?",
          answer: "Ja. Stuur binnenbreedte en -diepte, lengte, mondmaten en winddruk, of een tekening of een voorbeeldpijp, en we maken het register op maat.",
        },
        {
          question: "Geïntoneerd of niet geïntoneerd?",
          answer: "Allebei. Onze intoneurs kunnen de pijpen op uw winddruk intoneren, of u ontvangt ze klaar om zelf te intoneren.",
        },
        {
          question: "Kunt u ook de windladen maken?",
          answer: "Ja. Bestel pijpen en windladen samen, en voeg MIDI-ombouw of SmartValve toe als u wilt dat het orgel via MIDI speelt.",
        },
        {
          question: "Verzendt u buiten België?",
          answer: "Ja, we verzenden wereldwijd. Verzending maakt deel uit van uw offerte.",
        },
      ],
    },
    {
      type: "contact_form",
      primary: {
        eyebrow: "Pijpen bestellen",
        title: "Stuur ons uw lijst met registers",
        intro: "Laat ons weten wat u nodig hebt. We antwoorden met een offerte en een verzenddatum.",
        recipient: "decap",
        topics: "Orgelpijpen, Pijpen en windladen",
        default_topic: "Orgelpijpen",
        show_phone: true,
        show_location: false,
        message_placeholder:
          "Welke registers (bv. Bourdon, Fluit), het bereik van elk register, winddruk, standaardmensuur of uw eigen maten, geïntoneerd of niet…",
        submit_label: "Vraag een offerte aan",
        success_title: "Uw lijst met registers is aangekomen",
        success_body: "We antwoorden met een offerte en een verzenddatum.",
        aside_title: "Goed om te weten",
        aside_body:
          "- Verkocht als volledige registers\n- Standaardmensuren of uw eigen maten\n- Klaar in enkele dagen tot een week, afhankelijk van de registers\n- Geïntoneerd of klaar om te intoneren\n- Windladen, MIDI-ombouw en SmartValve op aanvraag\n- Wereldwijde verzending",
      },
    },
  ],
};

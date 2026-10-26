/** Software overview (Prismic page "software"), Dutch (nl-be). */
export default {
  type: "page",
  uid: "software",
  lang: "nl-be",
  title: "Software",
  theme: "decap",
  meta_title: "Software voor orgels en orchestrions | Decap Herentals",
  meta_description:
    "Virtual Orchestrion speelt uw Decap-instrumenten en QRS-piano's. Met MIDIMapper horen arrangeurs orgelarrangementen met echte orgelsamples. Gratis proefversie.",
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Software",
        title: "Software voor orchestrions, orgels en arrangeurs",
        intro:
          "Al onze software ontwikkelen we in eigen huis: van de CNC-programma's die onze pijpen frezen tot de software die onze instrumenten aanstuurt. Virtual Orchestrion bespeelt ze. MIDIMapper laat arrangeurs horen wat ze schrijven voordat het bij het orgel komt.",
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
        eyebrow: "Twee programma's",
        title: "Eén om te spelen, één om te arrangeren",
        columns: "2",
        card_style: "Image cards",
      },
      items: [
        {
          tag: "Speler",
          title: "Virtual Orchestrion",
          body: "De speler voor Decap-instrumenten en QRS-piano's. Voegt ontbrekende registers virtueel toe, zodat een kleiner orgel grotere schalen speelt. Laadt tot 8 VSTi- en 8 DXi-instrumenten. Verkrijgbaar in de shop.",
          link_label: "Virtual Orchestrion",
          link: "/virtual-orchestrion",
          image_brief: "Screenshot of Virtual Orchestrion's animated orchestrion view, 4:3",
        },
        {
          tag: "Voor arrangeurs",
          title: "MIDIMapper",
          body: "Stuurt MIDI uit uw DAW naar echte orgelsamples, zodat u een arrangement hoort als registraties, niet als General MIDI-klanken. Tot 12 lagen per map, 64 kanalen en WAV-export.",
          price: "€ 150 excl. btw",
          link_label: "MIDIMapper en gratis proefversie",
          link: "/midimapper",
          image_brief: "Screenshot of the MIDIMapper map editor on a laptop, 4:3",
        },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Muziekshop",
        title: "Arrangementen voor de speler: binnenkort",
        body:
          "Binnenkort verkoopt onze shop ook arrangementen voor Decap-instrumenten, uit onze eigen bibliotheek en van onafhankelijke arrangeurs. Elk bestand wordt kopieerbeveiligd en opgemaakt voor Virtual Orchestrion, zodat het speelt op de instrumenten die u hebt aangesloten.\n\nArrangeert u voor Decap-instrumenten? [Laat uw interesse weten](/contact).",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        cta_label: "Bezoek de shop",
        cta_link: "/shop",
        image_brief: "Virtual Orchestrion playing an arrangement in book view, screen filling the frame, 4:3",
        tone: "Tinted",
      },
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "Arrangeert u voor orgel?",
        title: "Probeer MIDIMapper gratis",
        body: "Download de proefversie, verbind ze met uw DAW en hoor uw arrangement met echte orgelsamples.",
        price: "€ 150",
        price_note: "excl. btw, volledige licentie",
        primary_cta_label: "Download de gratis proefversie",
        primary_cta_link: "/software/midi-mapper",
        secondary_cta_label: "Over MIDIMapper",
        secondary_cta_link: "/midimapper",
        tone: "Dark band",
      },
    },
  ],
};

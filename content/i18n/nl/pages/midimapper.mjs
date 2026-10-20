/** MIDIMapper product page (Prismic page "midimapper"), Dutch (nl-be). */
export default {
  type: "page",
  uid: "midimapper",
  lang: "nl-be",
  title: "MIDIMapper",
  theme: "decap",
  meta_title: "MIDIMapper: software voor orgelarrangeurs | Decap",
  meta_description:
    "MIDIMapper stuurt MIDI uit uw DAW naar echte orgelsamples, zodat u een orgelarrangement hoort zoals het zal klinken. € 150 excl. btw. Gratis proefversie.",
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "MIDIMapper, voor arrangeurs",
        title: "Hoor uw orgelarrangement met echte orgelsamples",
        intro:
          "Arrangeren voor een straatorgel of pijporgel betekent meestal blind schrijven tot de muziek bij het instrument komt. MIDIMapper neemt de MIDI uit uw arrangeersoftware, stuurt die door uw eigen maps en speelt ze af met echte orgelsamples. Wat u tijdens het arrangeren hoort, ligt veel dichter bij wat het orgel zal spelen.",
        primary_cta_label: "Gratis proefversie in de shop",
        primary_cta_link: "/software/midi-mapper",
        secondary_cta_label: "Alle Decap-software",
        secondary_cta_link: "/software",
        note: "Volledige licentie € 150 excl. btw. Gratis proefversie en licentie in de shop.",
        image_brief: "Laptop with the MIDIMapper map editor open next to a MIDI keyboard on a desk, portrait 4:5",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Wat het doet",
        title: "MIDI-routing en orgelweergave in één programma",
        body:
          "MIDIMapper leest een MIDI-ingang en stuurt elke noot naar een of meer uitgangen, volgens maps die u zelf bepaalt. Een map kan tot 12 lagen stapelen, zodat u registraties in hun context hoort: een jazzfluit met en zonder tremolo, of een woodblock dat bij een noot komt.\n\nOmdat de klank van echte orgelsamples komt in plaats van General MIDI-klanken, beoordeelt u balans en registratie tijdens het arrangeren, niet nadat het boek geponst is.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "Screenshot of a MIDIMapper map with several layers visible, 4:3",
      },
    },
    {
      type: "site_steps",
      primary: {
        eyebrow: "Hoe het werkt",
        title: "Eén keer instellen, dan arrangeren",
        tone: "Tinted",
      },
      items: [
        {
          title: "Verbind uw DAW",
          body: "Stuur MIDI uit uw arrangeersoftware via een virtuele MIDI-kabel zoals loopMIDI, en kies de uitgangen. MIDIMapper bewaart deze instelling voor de volgende keer.",
        },
        {
          title: "Bouw uw map",
          body: "Wijs in de ingebouwde MapCreator inkomende noten toe aan uitgangskanalen en registraties. Verfijn de map gaandeweg.",
        },
        {
          title: "Luister en stel bij",
          body: "Speel het arrangement af via de orgelsamples. Corrigeer nootlengtes in milliseconden zodat ze passen bij het boek en de reactie van het orgel.",
        },
        {
          title: "Opnemen en delen",
          body: "Neem de uitvoer op en exporteer die als WAV-bestand om te beluisteren of te delen.",
        },
      ],
    },
    {
      type: "site_facts",
      primary: {
        eyebrow: "Functies",
        title: "Wat MIDIMapper bevat",
        layout: "Spec list",
      },
      items: [
        { label: "Klank", value: "Echte pijporgelsamples; eigen samples mogelijk" },
        { label: "MapCreator", value: "Ingebouwde editor voor uw eigen MIDI-routing" },
        { label: "Lagen", value: "Tot 12 per map, om registraties te stapelen" },
        { label: "Schakelaars", value: "Schakelaars voor registratiepatches en nootschakelaars" },
        { label: "Uitgangen", value: "2 naar de interne klankmodules, 2 vrij te routeren" },
        { label: "Kanalen", value: "64 adresseerbaar (4 × 16)" },
        { label: "Herhaling", value: "Mandoline-effect met instelbare snelheid en duty cycle" },
        { label: "Timing", value: "Sturing tot op de milliseconde; drumvertraging aan (boek) of uit (arrangement)" },
        { label: "Nootlengte", value: "Globale aanpassing in milliseconden" },
        { label: "Export", value: "Rechtstreeks opnemen naar WAV" },
        { label: "Ingang", value: "Elke MIDI-ingang, bv. loopMIDI vanuit uw DAW" },
        { label: "Gebruik", value: "Straatorgels en pijporgels; voeg samples van slagwerk of klokkenspel toe" },
      ],
    },
    {
      type: "site_faq",
      primary: {
        eyebrow: "Vragen",
        title: "Over MIDIMapper",
      },
      items: [
        {
          question: "Voor wie is MIDIMapper bedoeld?",
          answer:
            "Voor arrangeurs die voor straatorgels of pijporgels schrijven en registraties willen horen terwijl ze werken.",
        },
        {
          question: "Werkt het met mijn DAW?",
          answer:
            "Het werkt met alle software die MIDI verstuurt. Stuur de MIDI naar MIDIMapper via een virtuele MIDI-kabel zoals loopMIDI.",
        },
        {
          question: "Kan ik mijn eigen samples gebruiken?",
          answer: "Ja. MIDIMapper ondersteunt eigen samples, bijvoorbeeld slagwerk of klokkenspel om de klank van een orgel te vervolledigen.",
        },
        {
          question: "Waarom nootlengtes aanpassen?",
          answer:
            "De timing van de mapper, de nootlengtes in het boek en de reactie van het echte orgel verschillen. Met een globale nootlengte in milliseconden compenseert u dat, en de schakelaar voor drumvertraging stemt af op de timing van het boek of van het arrangement.",
        },
        {
          question: "Hoe koop ik de volledige licentie?",
          answer:
            "In de [shop](/software/midi-mapper): € 150 excl. btw. De gratis proefversie staat er ook, zodat u MIDIMapper eerst met uw eigen arrangementen kunt uitproberen.",
        },
      ],
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "MIDIMapper",
        title: "Hoor uw volgende arrangement voordat het orgel het speelt",
        body: "Download de gratis proefversie in de shop en verbind ze met uw DAW. Bent u klaar, koop dan de volledige licentie in de shop.",
        price: "€ 150",
        price_note: "excl. btw, volledige licentie",
        primary_cta_label: "Gratis proefversie in de shop",
        primary_cta_link: "/software/midi-mapper",
        secondary_cta_label: "Kopen in de shop",
        secondary_cta_link: "/software/midi-mapper",
        tone: "Dark band",
      },
    },
  ],
};

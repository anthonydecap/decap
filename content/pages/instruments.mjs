/** Instruments overview (Prismic page "instruments"): self-playing instruments and Brass Core. */
export default {
  type: "page",
  uid: "instruments",
  title: "Self-playing instruments",
  theme: "decap",
  meta_title: "Self-Playing Instruments | Decap Herentals",
  meta_description:
    "Self-playing accordion, pipes, drums, xylophone and a hand-turned organ, all driven by MIDI and built in Herentals. Use one alone or play them together.",
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Instruments",
        title: "Self-playing instruments, built around real acoustic sound",
        intro:
          "A real accordion, real pipes, real drums and real wooden bars, played by MIDI. We have put self-playing accordions on our organs since 1933. Today we build these automatic instruments as stand-alone pieces you can use on their own or combine into one ensemble.",
        primary_cta_label: "Ask which instrument fits",
        primary_cta_link: "/contact",
        secondary_cta_label: "Virtual Orchestrion player",
        secondary_cta_link: "/virtual-orchestrion",
        image_brief:
          "Accordion Pedestal, Pipe Cube and Percussion Unit lined up in the workshop, plain dark wall behind, camera at chest height, portrait 4:5",
      },
    },
    {
      type: "site_card_grid",
      primary: {
        eyebrow: "Two families",
        title: "Music included, or played by you",
        intro:
          "Most of our instruments come with a player and music: switch them on and they play. **Brass Core** belongs to Orchestrionix, our line for musicians. It has no music library: you drive it with your own audio, and it is one of the few products we ship straight from stock.",
        columns: "3",
        card_style: "Image cards",
      },
      items: [
        {
          tag: "Music included",
          title: "Accordion Pedestal & Cube",
          body: "A real Italian accordion with electronic key action and regulated airflow. Touchscreen player, accompaniment speakers and MIDI in, out and thru. Freestanding Pedestal or compact Cube.",
          link_label: "Self-playing accordion",
          link: "/accordion",
          image_brief: "Accordion Pedestal, three-quarter front view, plain light backdrop, 4:3",
        },
        {
          tag: "Music included",
          title: "Pipes",
          body: "Up to seven ranks of wooden or metal pipes with a built-in silent blower. Pressure effects over MIDI, with an upgrade to SmartValve control per pipe.",
          link_label: "Pipe Cube and Pedestal",
          link: "/pipes",
          image_brief: "Pipe Cube with front panel off so the pipes show, plain backdrop, 4:3",
        },
        {
          tag: "Music included",
          title: "Percussion Unit",
          body: "Drum kit plus tambourine, claves, woodblock, cowbell and shaker egg. Full velocity range and up to 14 hits per second. Plays standard General MIDI drum tracks.",
          link_label: "Percussion Unit",
          link: "/percussion-unit",
          image_brief: "Percussion Unit front view with stick-tip LEDs lit, dark backdrop, 4:3",
        },
        {
          tag: "Music included",
          title: "Mallet Percussion",
          body: "Xylophone or metallophone with one spring-loaded hammer per bar. MIDI velocity sets the force of each strike, with a latency of a few milliseconds.",
          link_label: "Mallet Percussion",
          link: "/mallet-percussion",
          image_brief: "Xylophone with its row of hammers, shot from above at an angle, plain backdrop, 4:3",
        },
        {
          tag: "Music included",
          title: "Bellow Organ",
          body: "A hand-turned organ that keeps every note of the scale. Aluminium frame, swappable panels, built-in Virtual Orchestrion player. As a kit or ready to play.",
          link_label: "Hand-turned organ",
          link: "/bellow-organ",
          image_brief: "Bellow Organ with veneer panels, three-quarter view showing the crank, plain backdrop, 4:3",
        },
        {
          tag: "Orchestrionix",
          title: "Brass Core",
          body: "Makes a real trumpet or trombone sound from an audio signal. No music library: you supply the performance. No drilling or changes to the instrument.",
          price: "€ 799 [TO CHECK: current price] · ships from stock",
          link_label: "Brass Core",
          link: "/brass-core",
          image_brief: "Brass Core clamped to a trumpet, side view on a dark backdrop, 4:3",
        },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Built to your choice",
        title: "Why you will not find a price list here",
        body:
          "Each self-playing instrument is built around the instrument you choose, so the price follows your choices. Automating a Chinese accordion costs far less than an Italian one. For a pipe instrument you can have us make the pipes, or deliver your own. The same goes for drums, bars and cases.\n\nTell us what you have in mind and we send you a quote for exactly that instrument.",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        cta_label: "Request a quote",
        cta_link: "/contact",
        image_brief: "Two accordions side by side on the workbench, one being fitted with the key action, 4:3",
      },
      items: [
        { point: "The instrument of your choice: budget or top quality" },
        { point: "Our pipes or your own" },
        { point: "Brass Core: fixed price, shipped from stock" },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "One ensemble",
        title: "Every self-playing instrument speaks MIDI",
        body:
          "Each instrument works on its own. Connect them and they play as one band: an accordion, a percussion unit and a xylophone can follow the same arrangement, each taking its own part.\n\nThe Accordion Pedestal and Cube have MIDI in, out and thru. The Bellow Organ can lead the others as MIDI master or follow them as slave. The same instruments can be built into the façade of a new organ.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        cta_label: "New organs",
        cta_link: "/organs",
        image_brief: "Three instruments side by side with their MIDI cables visible between them, workshop floor, 4:3",
        tone: "Tinted",
      },
      items: [
        { point: "Use one instrument alone or several together" },
        { point: "Standard MIDI: General MIDI drum notes on the percussion" },
        { point: "Play live from a keyboard, sequencer or DAW" },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Player and music",
        title: "One player and a shop full of arrangements",
        body:
          "Virtual Orchestrion is the player for the whole Decap ensemble. It sends each instrument its part and shows the music as an animated orchestrion or as a book. When an arrangement calls for ranks your instrument does not have, the player adds them with samples we recorded in our own workshop.\n\nArrangers sell arrangements for Decap instruments in our [music shop](/shop), copy-protected and ready for the player.",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        cta_label: "Virtual Orchestrion",
        cta_link: "/virtual-orchestrion",
        image_brief: "Laptop running Virtual Orchestrion in front of an Accordion Pedestal, screen readable, 4:3",
      },
    },
    {
      type: "site_faq",
      primary: {
        eyebrow: "Questions",
        title: "Choosing a self-playing instrument",
      },
      items: [
        {
          question: "Which instrument suits which use?",
          answer:
            "- **Café, shop window or home:** the Accordion Pedestal or Cube, with accompaniment from its own speakers.\n- **Events and touring:** the Cube formats are compact and transport-friendly.\n- **Street and outdoor play:** the hand-turned [Bellow Organ](/bellow-organ).\n- **Your own performances or installations:** [Brass Core](/brass-core) plays the brass part you feed it.\n\nNot sure? Tell us where it will play and we suggest a set-up.",
        },
        {
          question: "Can the instruments play together?",
          answer:
            "Yes. They all use standard MIDI, so one arrangement can drive several instruments at once, each playing its own part. [Virtual Orchestrion](/virtual-orchestrion) is built to do exactly that.",
        },
        {
          question: "Can I play them live?",
          answer:
            "Yes. Connect a MIDI keyboard, controller, sequencer or DAW and the instruments respond in real time. The accordion's MIDI thru passes your playing on to the next instrument.",
        },
        {
          question: "What is the difference between the self-playing instruments and Brass Core?",
          answer:
            "The self-playing instruments come with a player and music, ready to play. Brass Core, part of our [Orchestrionix](/orchestrionix) line, has no music library: it turns your own audio into real brass sound.",
        },
        {
          question: "Do you deliver outside Belgium?",
          answer: "[TO CHECK: countries we ship to, delivery times, packaging and whether we install on site]",
        },
      ],
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "Choosing an instrument?",
        title: "Tell us where it will play",
        body: "A café, a stage, a museum or the street: describe the place and the music. We reply with the instrument or combination we would choose, and a quote.",
        primary_cta_label: "Request a quote",
        primary_cta_link: "/contact",
        secondary_cta_label: "Browse the music shop",
        secondary_cta_link: "/shop",
        tone: "Dark band",
      },
    },
  ],
};

/** Organs page (Prismic page "organs"): the core business, new dance, fair, street and concert organs. */
export default {
  type: "page",
  uid: "organs",
  title: "Organs",
  theme: "decap",
  meta_title: "Dance Organs Built to Order | Decap Herentals",
  meta_description:
    "Real dance organs from Decap Herentals, with dynamic percussion, wind pressure per chest and volume control. Modular or bespoke, pipes, digital or both.",
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Organ builders since 1895",
        title: "Real dance organs, built in Herentals",
        intro:
          "Decap Herentals builds dance organs: organs made for people to dance to, with dynamics and volume control no mechanical organ has. Start from our proven modules or have every detail made for you. Pipes, digital sound or both, with the front instruments Decap organs have carried since 1933. Decap organs play all over the world, from Japan to the US and Australia.",
        primary_cta_label: "Compose your organ",
        primary_cta_link: "/organ-composer",
        secondary_cta_label: "Request a consultation",
        secondary_cta_link: "/contact",
        note: "Decap Herentals since 1933. Fourth generation, one workshop, organs all over the world.",
        image_brief:
          "A finished Decap dance organ façade, shot straight on from chest height with the whole front in frame, lights on, room lights dimmed; portrait 4:5",
      },
    },
    {
      type: "site_card_grid",
      primary: {
        eyebrow: "Three ways to your organ",
        title: "Choose how much you want to design",
        intro:
          "Most organs start in one of three places. Not sure which is yours? Describe the room and the music, and we suggest a route.",
        columns: "3",
        card_style: "Image cards",
      },
      items: [
        {
          tag: "Modular",
          title: "Built from our modules",
          body: "Pick from proven modules: scale, ranks, front instruments and façade. You get a well-tested design and a clear picture of the result before production starts.",
          link_label: "Start in the Organ Composer",
          link: "/organ-composer",
          image_brief: "Existing 3D render of a modular Decap dance organ, front three-quarter view, plain background, 4:3",
        },
        {
          tag: "Bespoke",
          title: "Fully bespoke",
          body: "Every detail designed for your room, your music and your budget: case, scale, voices, front instruments and controls. We draw it, render it in 3D and build it.",
          link_label: "Request a consultation",
          link: "/contact",
          image_brief: "Existing 3D render of a bespoke Decap concert or street organ, front view, plain background, 4:3",
        },
        {
          tag: "Restore or upgrade",
          title: "Your existing organ",
          body: "Historic book and roll organs are restored by Atelier Frank Decap, Tony's brother. Our MIDI conversion units add MIDI while the book or roll keeps working.",
          link_label: "Atelier Frank Decap",
          link: "/frank-decap",
          image_brief: "An open historic book organ in the workshop, key frame and tubing visible, warm side light, 4:3",
        },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "What we build",
        title: "Dance organs first",
        body:
          "### Dance organs\nWhat we normally build. Between 1960 and 1980 some 120 dance cafés and dance halls across Belgium each had a dance organ, and people came to dance every day. Today Decap dance organs play in living rooms, cafés and dance halls, and on stage: their sensitivity and volume are controllable, so they fit the room instead of filling it. That is why Guido Belcanto could tour one in his theatre show *Balzaal der Gebroken Harten* in 2008.\n\n### Street and fair organs\nWe have built them, and we can build one for you, but they are the exception in our workshop.\n\n### Church and concert organs\nIn 2025 we built smARTvalve into the first transportable church organ, with every pipe controlled on its own. That organ is [L'Explorateur](/work/yves-rechsteiner), the mobile concert organ of Swiss organist Yves Rechsteiner.",
        media_side: "Image right",
        aspect: "Portrait 4:5",
        image_brief:
          "A Decap dance organ in use in a café or dance hall, people in soft focus in front, taken from the side of the room; portrait 4:5",
      },
      items: [
        { point: "Modular or fully bespoke, built as units in a façade: transportable and rebuildable" },
        { point: "Standard scales of 105 and 121 keys, other sizes possible" },
        { point: "Pipes, digital sound, or both combined" },
        { point: "Playing all over the world: Japan, the US, Australia, Asia and Europe" },
      ],
    },
    {
      type: "site_card_grid",
      primary: {
        eyebrow: "Why a Decap plays differently",
        title: "Built by musicians, for more feeling",
        intro:
          "We learned woodworking to build organs, but we are musicians first. Since 1933 we have worked on one thing: an organ that plays with more dynamics, more control and more musicality. All of this was developed in Herentals.",
        columns: "2",
        card_style: "Text cards",
      },
      items: [
        {
          tag: "Percussion",
          title: "A drum that plays hard or soft",
          body: "On a traditional organ the drumstick runs on air pressure and always hits with the same force. A Decap drum is controlled dynamically: the stick hits hard or soft, and the timing can be adjusted.",
        },
        {
          tag: "Wind chests",
          title: "Pressure per wind chest",
          body: "Traditional wind chests use standard valves: a pipe is on or off. On a Decap organ the pressure can be set per wind chest for different intensities, and ranks can play effects such as vibrato.",
        },
        {
          tag: "Volume",
          title: "Volume you control",
          body: "Decap organs and orchestrions are volume-controllable. The same organ can play softly in a living room and fill a theatre, or join a DJ set.",
        },
        {
          tag: "smARTvalve",
          title: "Every pipe its own wind",
          body: "Our newest development takes the pressure control of the wind chest down to every individual pipe. [How smARTvalve works](/smartvalve).",
        },
      ],
    },
    {
      type: "site_card_grid",
      primary: {
        eyebrow: "Sound",
        title: "Pipes, digital, or both",
        intro:
          "In 1977 François Decap built the first digital dance organ, so dance halls and cafés with much smaller budgets could have an organ. Today you choose the mix.",
        columns: "3",
        card_style: "Text cards",
      },
      items: [
        {
          title: "Pipes",
          body: "Wooden pipes milled on our own 5-axis CNC: bourdons, flutes, violins, jazz flutes, vibratons, baritons and trumpets. [See our organ pipes](/organ-pipes).",
        },
        {
          title: "Digital",
          body: "Digital sound in place of pipes: less space and a smaller budget. The route that brought organs to cafés and dance halls in 1977.",
        },
        {
          title: "Pipes and digital combined",
          body: "Real pipes and digital sound in one organ. We advise which voices are worth building in wood for your room and budget.",
        },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Front instruments",
        title: "Accordions on Decap organs since 1933",
        body:
          "The year Frans Decap founded Decap Herentals, the first self-playing accordions appeared on Decap organs. They still do. A Decap organ front can carry:\n\n- a real accordion, played by the organ\n- a drum kit\n- percussion such as woodblock, tambourine and cowbell\n- animated figures\n\nWe make these instruments as stand-alone self-playing instruments too, so every one is proven on its own before it goes into an organ. [See our instruments](/instruments).",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        cta_label: "Self-playing accordion",
        cta_link: "/accordion",
        image_brief:
          "Close-up of the accordion and drums in the front of a Decap organ, taken at eye level from slightly to one side, background out of focus; 4:3",
        tone: "Tinted",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Keys are no limit",
        title: "A 105-key organ that also plays 121-key music",
        body:
          "Our standard scales are 105 and 121 keys, but the scale does not have to limit your repertoire. Every new Decap organ comes with our Virtual Orchestrion player. When an arrangement calls for ranks your organ does not have, the player adds them virtually, with samples we recorded in our own workshop and VST instruments.\n\nSince 2000 a Decap organ plays its music from one digital card instead of racks of cardboard books. If you miss the book, the player projects it on screen while the organ plays. Choose the organ that fits your room and budget, not the one that fits your music.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        cta_label: "About Virtual Orchestrion",
        cta_link: "/virtual-orchestrion",
        image_brief:
          "Virtual Orchestrion running on a touchscreen beside an organ, the animated book view visible on screen; 4:3",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "smARTvalve",
        title: "Expression on every pipe",
        body:
          "We have set the wind pressure per wind chest for years. smARTvalve does it per pipe: one valve and one processor for every pipe. Each pipe gets its own stored pressure, from 0 to 200%, with a 4 ms response. That allows dynamics, vibrato, slope and decay per note, played over MIDI.\n\nIt is the technology in the 2025 transportable church organ, the first organ we call a wind synthesizer.",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        cta_label: "How smARTvalve works",
        cta_link: "/smartvalve",
        image_brief: "Close-up of a row of smARTvalves on a wind chest, dark background, low side light; 4:3",
        tone: "Dark band",
      },
    },
    {
      type: "site_steps",
      primary: {
        eyebrow: "How it works",
        title: "From first conversation to first dance",
        intro: "Five steps, and you see your organ before we build it.",
      },
      items: [
        {
          title: "Consultation",
          body: "Tell us where the organ will play, who will listen and what music you love. We ask about the room, transport and budget, and suggest a route: modular, bespoke or a mix. The [Organ Composer](/organ-composer) is a quick way to send us a starting point.",
          image_brief: "Tony Decap at a workbench talking with a visitor, organ parts in the background, 4:3",
        },
        {
          title: "Design and 3D render",
          body: "We draw the organ and render it in 3D: case, façade, front instruments and the scale. You see how it will look before anything is made, and we adjust the design with you.",
          image_brief: "A 3D render of an organ on a computer screen in the workshop office, screen filling most of the frame, 4:3",
        },
        {
          title: "Production",
          body: "We build the organ in our workshop in Herentals: case, wind system, pipes from our own CNC, front instruments and electronics. During the build you visit the workshop several times to see the status of your organ.",
          image_brief: "An organ case under construction in the Herentals workshop, tools and timber around it, wide shot, 4:3",
        },
        {
          title: "Voicing",
          body: "Each pipe and each voice is voiced and tuned so the organ sounds right as a whole, at the volume your room needs.",
          image_brief: "Hands voicing a wooden pipe on the voicing bench, close-up, warm light, 4:3",
        },
        {
          title: "Delivery",
          body: "We deliver the organ ready to play, with the Virtual Orchestrion player and your music on card. Warranty is always included. Shipping and installation depend on the project, in Belgium or abroad.",
          image_brief: "A finished organ being wheeled out of the workshop doors or loaded into a van, 4:3",
        },
      ],
    },
    {
      type: "site_faq",
      primary: {
        eyebrow: "Questions",
        title: "Before you order an organ",
      },
      items: [
        {
          question: "What does a new organ cost?",
          answer:
            "Every organ is quoted on its own, because the price follows your choices: the size, pipes or digital sound, the front instruments, the façade. A digital or modular organ costs less than a bespoke pipe organ, and you can reuse pipes or instruments you already have. Send us your starting point and we reply with a first idea and a quote.",
        },
        {
          question: "Do you also build street organs and fair organs?",
          answer:
            "Yes, we have built them and can build one for you. But what we normally build are real dance organs, with the dynamic percussion, wind control and volume control that make them play in living rooms and on stage as well as in dance halls.",
        },
        {
          question: "What is the difference between 105 and 121 keys?",
          answer:
            "The number of keys sets how many notes and ranks the organ has, and so which music it plays as written. With our Virtual Orchestrion player a 105-key organ also plays 121-key music: missing ranks are added virtually.",
        },
        {
          question: "Should I choose pipes or digital sound?",
          answer:
            "Pipes give the real sound of wind in wood. Digital sound needs less space and a smaller budget. Pipes and digital combined sit in between. Tell us about the room and the music, and we advise.",
        },
        {
          question: "Where does the music come from?",
          answer:
            "From a digital card in the Virtual Orchestrion player: a whole music library instead of racks of books. Copy-protected arrangements in our shop are coming soon. You can also play the organ live over MIDI.",
        },
        {
          question: "Do you deliver organs outside Belgium?",
          answer:
            "Yes. Decap organs play all over the world: in Japan, the US, Australia, Asia and across Europe. Shipping and installation are part of the quote and depend on the project. Warranty is always included.",
        },
        {
          question: "Can you restore my old organ or add MIDI to it?",
          answer:
            "Restoration is done by [Atelier Frank Decap](/frank-decap), Tony's brother. Our [MIDI conversion units](/midi-conversion) add MIDI to book and roll organs while the book or roll keeps working.",
        },
        {
          question: "Are you the same company as Gebroeders Decap in Antwerp?",
          answer:
            "No. Both descend from the same founder, Aloïs Decap. Decap Herentals was founded by his son Frans in 1933 and is run today by Tony Decap. The two companies are independent and on friendly terms.",
        },
      ],
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "Planning an organ?",
        title: "Start with a design and a few choices",
        body: "Pick a starting design in the Organ Composer and tell us where the organ will play. We reply with questions and a first idea, without obligation.",
        primary_cta_label: "Compose your organ",
        primary_cta_link: "/organ-composer",
        secondary_cta_label: "Contact the workshop",
        secondary_cta_link: "/contact",
        tone: "Dark band",
      },
    },
  ],
};

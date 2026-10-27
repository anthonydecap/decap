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
      type: "site_statement",
      primary: {
        eyebrow: "Why a Decap plays differently",
        statement: "The first orchestrions were built to sound like a real orchestra. In the golden age of the dance organ, everyone stopped trying. *We never did.*",
        caption:
          "In the 19th century makers such as Limonaire and Wurlitzer worked to bring their mechanical orchestras closer to real musicians, who play with feeling and nuance. When people came to love the mechanical sound itself, that work stopped. We are musicians first, so for the last 50 years we kept going: organs that play with feeling and nuance, from the living room to the stage.",
      },
    },
    {
      type: "site_orchestra",
      primary: {
        eyebrow: "MIDI, used to the full",
        title: "Every instrument its own part",
        intro:
          "We were the first to put an organ on MIDI. Most organs now use MIDI to replace the book, and nothing more. A Decap organ uses all of it: every instrument group gets its own part, with soft and hard notes.",
        book_label: "Book or simple MIDI",
        decap_label: "Decap organ",
        book_caption:
          "The book decides. Instruments coupled to the same track follow the same line, and every note sounds at the same strength.",
        decap_caption:
          "Every instrument group has its own MIDI address and its own part: the saxophone plays the melody, the violins a counter-melody, the piano soft and hard.",
        note: "Example arrangement. Note height and brightness show how hard each note is played.",
        tone: "Dark band",
      },
      items: [
        { instrument: "Saxophone", address: "Port 3 · Ch 1", role: "Melody" },
        { instrument: "Flute 8′", address: "Port 6 · Ch 2", role: "Ornaments" },
        { instrument: "Violins", address: "Port 7 · Ch 12", role: "Counter-melody" },
        { instrument: "Piano", address: "Port 1 · Ch 1", role: "Accompaniment" },
        { instrument: "Percussion", address: "Port 9 · Ch 10", role: "Accents" },
      ],
    },
    {
      type: "site_bento",
      primary: {
        eyebrow: "Inside a Decap organ",
        title: "No mechanism. Everything digital.",
        intro:
          "Processors and chips control every part of a Decap organ. That is what lets it play soft and hard, change its wind and fit any room.",
      },
      items: [
        {
          size: "Large",
          style: "Dark",
          visual: "Ports",
          value: "16",
          value_label: "MIDI ports as standard",
          title: "256 separate addresses",
          body: "16 ports of 16 channels each. Every instrument group gets its own address, so an arranger can write a real part for each one.",
        },
        {
          size: "Small",
          style: "Light",
          visual: "Velocity",
          value: "1–127",
          value_label: "note strengths",
          title: "Soft or hard, per note",
          body: "On a traditional organ the drumstick always hits with the same force. On a Decap organ it hits soft or hard, with adjustable timing.",
        },
        {
          size: "Small",
          style: "Light",
          visual: "Wind",
          title: "Wind pressure per chest",
          body: "Different intensities per wind chest, and ranks that play vibrato.",
        },
        {
          size: "Wide",
          style: "Accent",
          visual: "Chip",
          title: "A processor behind every part",
          body: "No air-driven mechanism: every drum, valve and register is controlled digitally. That is what makes soft and hard notes, wind control and volume control possible.",
        },
        {
          size: "Small",
          style: "Light",
          title: "Volume you control",
          body: "Soft in a living room, full in a theatre, loud enough for a DJ set.",
        },
        {
          size: "Small",
          style: "Dark",
          visual: "Pipe",
          title: "smARTvalve: every pipe its own wind",
          body: "Our newest development takes wind control down to every single pipe.",
          link_label: "How smARTvalve works",
          link: "/smartvalve",
        },
        {
          size: "Wide",
          style: "Light",
          title: "All software, our own",
          body: "The CNC programs that mill our pipes, the software that drives the organ and the Virtual Orchestrion player: all developed in Herentals.",
          link_label: "Our software",
          link: "/software",
        },
      ],
    },
    {
      type: "site_compare",
      primary: {
        eyebrow: "Compare",
        title: "Book organ, simple MIDI or a Decap organ",
        col1: "Book organ",
        col1_note: "Plays from a cardboard book",
        col2: "Simple MIDI conversion",
        col2_note: "MIDI replaces the book",
        col3: "Decap organ",
        col3_note: "MIDI used to the full",
        highlight: "3",
        highlight_label: "Decap",
        tone: "Tinted",
      },
      items: [
        { feature: "Control", col1: "Mechanical and pneumatic", col2: "Mechanical, with an electronic reader", col3: "Fully digital: processors and chips" },
        { feature: "MIDI ports", col1: "no", col2: "Usually 1", col3: "16 as standard" },
        { feature: "Own part per instrument group", col1: "no", col2: "no", col3: "yes" },
        { feature: "Soft and hard notes", col1: "no", col2: "no", col3: "yes" },
        { feature: "Wind pressure and vibrato under control", col1: "no", col2: "no", col3: "Per wind chest, per pipe with smARTvalve" },
        { feature: "Volume control", col1: "no", col2: "no", col3: "yes" },
        { feature: "Repertoire", col1: "Books punched for this organ", col2: "MIDI files, within the book layout", col3: "Arrangements for the full organ; missing ranks added virtually" },
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

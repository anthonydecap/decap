/** Virtual Orchestrion product page (Prismic page "virtual-orchestrion"): Decap's player software and music shop. */
export default {
  type: "page",
  uid: "virtual-orchestrion",
  title: "Virtual Orchestrion",
  theme: "decap",
  meta_title: "Virtual Orchestrion Player Software | Decap Herentals",
  meta_description:
    "One player for your whole Decap ensemble and QRS pianos. Animated orchestrion and book views, missing ranks added virtually. Available in the Decap shop.",
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Virtual Orchestrion",
        title: "Virtual Orchestrion: one player for your whole orchestrion",
        intro:
          "Virtual Orchestrion plays MIDI, audio and video and sends every instrument its part: Decap organs and self-playing instruments, and QRS pianos. On screen you follow the music as an animated orchestrion or as a scrolling book.",
        primary_cta_label: "Get it in the shop",
        primary_cta_link: "/software/virtual-orchestrion",
        secondary_cta_label: "Self-playing instruments",
        secondary_cta_link: "/instruments",
        note: "Included with every new Decap organ.",
        image_brief: "Laptop showing the animated orchestrion view, next to an Accordion Pedestal, plain backdrop, portrait 4:5",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "One ensemble",
        title: "Every instrument plays its own part",
        body:
          "Connect an [Accordion Pedestal](/accordion), a [Percussion Unit](/percussion-unit), [Pipes](/pipes) or a complete organ, and Virtual Orchestrion drives them together from one arrangement. It also drives QRS pianos, so a player piano can join the band.\n\nWhatever you have not connected can still sound: the player hosts up to 8 VSTi and 8 DXi virtual instruments for the remaining parts.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "Several Decap instruments in a row with a laptop running Virtual Orchestrion in front, workshop, 4:3",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Keys are no limit",
        title: "A smaller organ that plays larger scales",
        body:
          "When an arrangement calls for ranks your organ does not have, Virtual Orchestrion adds them virtually, with samples we recorded in our own workshop. A 105-key organ plays 121-key music.\n\nSo you choose the instrument that fits your room and budget, and still play the full repertoire.",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        cta_label: "New organs",
        cta_link: "/organs",
        image_brief: "Screenshot of the book view with real and virtual ranks shown in different colours, 4:3",
        tone: "Tinted",
      },
    },
    {
      type: "site_steps",
      primary: {
        eyebrow: "How it works",
        title: "From arrangement to sound in four steps",
      },
      items: [
        {
          title: "Install the player",
          body: "Buy Virtual Orchestrion in the [shop](/software/virtual-orchestrion), download it and install it on your computer.",
        },
        {
          title: "Connect your instruments",
          body: "Connect your Decap instruments or QRS piano over MIDI. Parts without an instrument go to the virtual instruments you load.",
        },
        {
          title: "Choose your music",
          body: "Play your own MIDI, audio and video files. Copy-protected arrangements in our shop are coming soon.",
        },
        {
          title: "Press play",
          body: "Every instrument plays its part. Follow along in the animated orchestrion view or the book view.",
        },
      ],
    },
    {
      type: "site_facts",
      primary: {
        eyebrow: "At a glance",
        title: "What Virtual Orchestrion does",
        layout: "Spec list",
      },
      items: [
        { label: "Plays", value: "MIDI, audio and video" },
        { label: "Drives", value: "Decap organs and self-playing instruments, QRS pianos" },
        { label: "Views", value: "Animated orchestrion and book view", note: "The book view projects the music book fully digitally, also for organs converted to MIDI" },
        { label: "Virtual instruments", value: "Up to 8 VSTi and 8 DXi" },
        { label: "Missing ranks", value: "Added virtually with samples recorded in our workshop" },
        { label: "Music", value: "Your own MIDI, audio and video files; shop arrangements coming soon" },
        { label: "Where to buy", value: "In the Decap shop" },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "For arrangers",
        title: "Selling your arrangements: coming soon",
        body:
          "A marketplace where arrangers sell their work to Decap owners is coming soon. Each arrangement will be copy-protected and formatted to use everything the player can do, on real instruments as well as virtual ones.\n\nArranging for orchestrions or organs? Register your interest and we let you know when it opens.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        cta_label: "Register your interest",
        cta_link: "/contact",
        image_brief: "Arranger at a desk with a DAW on screen and a MIDI keyboard, 4:3",
      },
    },
    {
      type: "site_faq",
      primary: {
        eyebrow: "Questions",
        title: "About Virtual Orchestrion",
      },
      items: [
        {
          question: "Do I need a Decap instrument to use it?",
          answer:
            "No. With virtual instruments loaded, Virtual Orchestrion plays orchestrion music on your computer. Connect real instruments and they take over their parts.",
        },
        {
          question: "Which instruments can it drive?",
          answer:
            "All Decap organs and self-playing instruments, and QRS pianos. See the [instruments](/instruments).",
        },
        {
          question: "How does it add ranks my organ does not have?",
          answer:
            "When an arrangement uses a rank that is not in your organ, the player plays it with samples we recorded in our workshop. Your organ plays its own pipes; the missing ranks sound through speakers.",
        },
        {
          question: "Is it included with a new organ?",
          answer: "Yes. Every new Decap organ comes with the Virtual Orchestrion player, and the [Bellow Organ](/bellow-organ) has it built in.",
        },
        {
          question: "Where do I buy it?",
          answer: "In the [Decap shop](/software/virtual-orchestrion), where you buy and download it. With a new Decap organ it is included.",
        },
      ],
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "Ready to play?",
        title: "Get Virtual Orchestrion",
        body: "Buy and download Virtual Orchestrion in the shop, connect your instruments and press play.",
        primary_cta_label: "Get it in the shop",
        primary_cta_link: "/software/virtual-orchestrion",
        secondary_cta_label: "Visit the shop",
        secondary_cta_link: "/shop",
        tone: "Dark band",
      },
    },
  ],
};

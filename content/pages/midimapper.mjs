/** MIDIMapper product page (Prismic page "midimapper"): MIDI router and player with real organ samples, for arrangers. */
export default {
  type: "page",
  uid: "midimapper",
  title: "MIDIMapper",
  theme: "decap",
  meta_title: "MIDIMapper: Organ Arranging Software | Decap Herentals",
  meta_description:
    "MIDIMapper routes MIDI from your DAW to real organ samples, so you hear an organ arrangement as it will sound. € 150 excl. VAT. Download the free trial.",
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "MIDIMapper, for arrangers",
        title: "Hear your organ arrangement with real organ samples",
        intro:
          "Arranging for a street organ or pipe organ usually means writing blind until the music reaches the instrument. MIDIMapper takes the MIDI from your arranging software, routes it through your own maps and plays it with real organ samples. What you hear while arranging is much closer to what the organ will play.",
        primary_cta_label: "Download the free trial",
        primary_cta_link: "/contact",
        secondary_cta_label: "All Decap software",
        secondary_cta_link: "/software",
        note: "Full licence € 150 excl. VAT. [TO CHECK: trial download URL]",
        image_brief: "Laptop with the MIDIMapper map editor open next to a MIDI keyboard on a desk, portrait 4:5",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "What it does",
        title: "MIDI routing and organ playback in one program",
        body:
          "MIDIMapper reads a MIDI input and sends each note to one or more outputs, following maps you define. A map can stack up to 12 layers, so you hear registrations in context: a Jazz Flute with and without tremolo, or a woodblock added on a note.\n\nBecause the sound comes from real organ samples instead of General MIDI sounds, you judge balance and registration while you arrange, not after the book is cut.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "Screenshot of a MIDIMapper map with several layers visible, 4:3",
      },
    },
    {
      type: "site_steps",
      primary: {
        eyebrow: "How it works",
        title: "Set up once, then arrange",
        tone: "Tinted",
      },
      items: [
        {
          title: "Connect your DAW",
          body: "Send MIDI from your arranging software through a virtual MIDI cable such as loopMIDI, and pick the outputs. MIDIMapper stores this set-up for next time.",
        },
        {
          title: "Build your map",
          body: "In the built-in MapCreator, assign incoming notes to output channels and registrations. Refine the map as you go.",
        },
        {
          title: "Listen and adjust",
          body: "Play the arrangement through the organ samples. Correct note lengths in milliseconds to match the book and the organ's response.",
        },
        {
          title: "Record and share",
          body: "Record the output and export it as a WAV file to review or share.",
        },
      ],
    },
    {
      type: "site_facts",
      primary: {
        eyebrow: "Features",
        title: "What MIDIMapper includes",
        layout: "Spec list",
      },
      items: [
        { label: "Sound", value: "Real pipe organ samples; custom samples supported" },
        { label: "MapCreator", value: "Built-in editor for your own MIDI routing" },
        { label: "Layers", value: "Up to 12 per map, to stack registrations" },
        { label: "Switches", value: "Registration patch switches and note switches" },
        { label: "Outputs", value: "2 to the internal sound modules, 2 freely routable" },
        { label: "Channels", value: "64 addressable (4 × 16)" },
        { label: "Repeat", value: "Mandoline effect with adjustable speed and duty cycle" },
        { label: "Timing", value: "Millisecond control; drum delay on (book) or off (arrangement)" },
        { label: "Note length", value: "Global adjustment in milliseconds" },
        { label: "Export", value: "Direct recording to WAV" },
        { label: "Input", value: "Any MIDI input, e.g. loopMIDI from your DAW" },
        { label: "Use", value: "Street organs and pipe organs; add percussion or glockenspiel samples" },
      ],
    },
    {
      type: "site_downloads",
      primary: {
        eyebrow: "Download",
        title: "Try MIDIMapper for free",
        intro: "The trial download is about 86 MB. [TO CHECK: trial limitations and system requirements]",
      },
      items: [
        {
          label: "MIDIMapper free trial",
          description: "Installer, about 86 MB",
          file_type: "[TO CHECK: file type]",
        },
      ],
    },
    {
      type: "site_faq",
      primary: {
        eyebrow: "Questions",
        title: "About MIDIMapper",
      },
      items: [
        {
          question: "Who is MIDIMapper for?",
          answer:
            "Arrangers who write for street organs or pipe organs and want to hear registrations while they work.",
        },
        {
          question: "Does it work with my DAW?",
          answer:
            "It works with any software that sends MIDI. Route the MIDI to MIDIMapper through a virtual MIDI cable such as loopMIDI.",
        },
        {
          question: "Can I use my own samples?",
          answer: "Yes. MIDIMapper supports custom samples, for example percussion or glockenspiel to complete an organ's sound.",
        },
        {
          question: "Why adjust note lengths?",
          answer:
            "Mapper timing, book note lengths and the real organ's response differ. A global note length in milliseconds lets you compensate, and the drum delay switch matches book or arrangement timing.",
        },
        {
          question: "How do I buy the full licence?",
          answer:
            "Install the free trial and follow its steps to get your registration code. Send the code to us and we send you the licence details. [TO CHECK: buy via shop?]",
        },
        {
          question: "What does the trial include?",
          answer: "[TO CHECK: trial limitations and duration]",
        },
      ],
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "MIDIMapper",
        title: "Hear your next arrangement before the organ does",
        body: "Download the free trial and connect it to your DAW. When you are ready, buy the full licence with the registration code from the trial. [TO CHECK: trial download URL and buying flow]",
        price: "€ 150",
        price_note: "excl. VAT, full licence",
        primary_cta_label: "Download the free trial",
        primary_cta_link: "/contact",
        secondary_cta_label: "Send your registration code",
        secondary_cta_link: "/contact",
        tone: "Dark band",
      },
    },
  ],
};

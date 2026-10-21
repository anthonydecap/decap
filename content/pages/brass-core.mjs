/** Brass Core (Prismic page "brass-core"): Orchestrionix flagship page, counterpart of SmartValve. */
export default {
  type: "page",
  uid: "brass-core",
  title: "Brass Core",
  theme: "orchestrionix",
  meta_title: "Brass Core: a Real Trumpet, Played by Sound | Orchestrionix",
  meta_description:
    "Brass Core makes a real trumpet or trombone play from an audio signal: a voice-coil embouchure, no changes to the instrument. € 2,599, ships from stock.",
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Centered",
        eyebrow: "Orchestrionix",
        title: "Brass Core",
        intro:
          "A real trumpet or trombone, played by sound. Brass Core turns any audio signal into the vibrations a player's lips would make, and the instrument's own brass does the rest.",
        primary_cta_label: "Order Brass Core",
        primary_cta_link: "#contact-form",
        secondary_cta_label: "About Orchestrionix",
        secondary_cta_link: "/orchestrionix",
        note: "€ 2,599 · ships straight away when in stock",
        image_brief: "Brass Core on a trombone, dark background, low side light catching the brass, 16:9",
      },
    },
    {
      type: "core_3_d",
      primary: {
        title: "Turn it around",
        description: "Brass Core in 3D. Drag to rotate, scroll to zoom.",
        background_type: "color",
        background_color: "#0c0a09",
        enable_dragging: true,
        enable_zoom: true,
        enable_rotation: true,
      },
    },
    {
      type: "site_facts",
      primary: {
        layout: "Stats",
      },
      items: [
        { value: "Any audio", label: "drives it: a recording, a sampler, a live mix" },
        { value: "0", label: "holes drilled in your instrument" },
        { value: "120 × 90 × 70", label: "millimetres, small enough to clamp on" },
        { value: "From stock", label: "shipped straight away" },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "How it works",
        title: "An embouchure made of a voice coil",
        body:
          "A trumpet player shapes the sound with air pressure and the vibration of the lips. Brass Core does the same in a sealed pressure chamber: a voice-coil motor, driven by your audio signal, modulates the air at the mouthpiece.\n\nThe instrument is not a loudspeaker housing. The vibration excites the natural resonance of the brass itself, so the tone comes from the trumpet or trombone, with its own colour and projection.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "Close-up of Brass Core on a trumpet mouthpiece, dark background, 4:3",
      },
      items: [
        { point: "Voice-coil motor in a sealed pressure chamber" },
        { point: "The brass body shapes the tone" },
        { point: "Standard mouthpieces and tubing" },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Expression",
        title: "Every dynamic, exactly as recorded",
        body:
          "Because Brass Core works from the audio waveform itself, it follows the volume, articulation and expression of the recording note for note. Feed it a good trumpet recording and the audience hears a real instrument play it.\n\nIt is an Orchestrionix instrument: no music library, no presets. You bring the performance.",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        image_brief: "Brass Core on a trumpet on a stand, side view, dark background, 4:3",
        tone: "Tinted",
      },
    },
    {
      type: "site_card_grid",
      primary: {
        eyebrow: "Made for",
        title: "Real brass where no player can be",
        columns: "3",
        card_style: "Text cards",
      },
      items: [
        { title: "Theatre and circus", body: "A brass section that plays every night, on cue, in the set and on the stage." },
        { title: "Museums and installations", body: "Real instruments that play on their own, all day, in front of visitors." },
        { title: "Studios and collectors", body: "Acoustic brass from a recording or a sampler, for sound design and for the collection." },
      ],
    },
    {
      type: "core_demo_video",
      variation: "default-slice",
      primary: {
        title: "Hear it. Feel it.",
        background_type: "color",
        background_color: "#0c0a09",
        video_url: "/videos/WhatsApp Video 2025-07-09 at 21.38.23.mp4",
        autoplay: false,
        loop: false,
        show_controls: true,
      },
    },
    {
      type: "site_quote",
      primary: {
        quote:
          "The Brass Core has become the beating heart of our automated brass section. We didn't want to just play brass music through the PA, we wanted the audience to feel it, like a real band was right there on stage. People often ask us where the brass band is hiding.",
        name: "Circus Ronaldo",
      },
    },
    {
      type: "site_facts",
      primary: {
        eyebrow: "Specifications",
        title: "Brass Core",
        layout: "Spec list",
      },
      items: [
        { label: "Instruments", value: "Trumpet, trombone and similar", note: "standard mouthpieces and tubing" },
        { label: "Input", value: "Line-level audio" },
        { label: "Amplifier", value: "External amplifier required" },
        { label: "Power", value: "12 V DC, 2 A" },
        { label: "Dimensions", value: "120 × 90 × 70 mm" },
        { label: "Mounting", value: "Clamp", note: "trumpet and trombone clamps available" },
        { label: "Changes to the instrument", value: "None" },
      ],
    },
    {
      type: "site_faq",
      primary: {
        title: "Questions about Brass Core",
      },
      items: [
        {
          question: "Can it recreate dynamics and expression?",
          answer: "Yes. It works directly from the audio waveform, so volume, articulation and expression come through exactly as they are in the recording.",
        },
        {
          question: "Do I need to modify my instrument?",
          answer: "No. Brass Core is non-invasive: no drilling, no cutting, nothing permanent.",
        },
        {
          question: "Can I use it live?",
          answer: "Yes. It is used in shows, installations and demonstrations wherever a real brass sound is needed without a player.",
        },
        {
          question: "How does it connect?",
          answer: "Feed it a line-level audio signal, ideally a high-quality brass recording, through an external amplifier. Brass Core does the rest.",
        },
        {
          question: "How fast can I have one?",
          answer: "Brass Core is one of our few off-the-shelf products: when it is in stock, it ships straight away.",
        },
      ],
    },
    {
      type: "contact_form",
      primary: {
        eyebrow: "Orchestrionix",
        title: "Order Brass Core",
        intro: "€ 2,599. Tell us which instrument you will use it with and where it should be delivered.",
        recipient: "decap",
        topics: "Order Brass Core, Question about Brass Core",
        default_topic: "Order Brass Core",
        show_phone: true,
        show_location: true,
        message_placeholder: "Trumpet or trombone, how you will use it, delivery address…",
        submit_label: "Send order request",
        success_title: "Thank you",
        success_body: "Your request is with us. We confirm availability and delivery personally.",
      },
    },
  ],
};

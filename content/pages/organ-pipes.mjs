/** Organ pipes page (Prismic page "organ-pipes"): wooden pipes from our own CNC, ready in days, not months. A headline product. */
export default {
  type: "page",
  uid: "organ-pipes",
  title: "Organ pipes",
  theme: "decap",
  meta_title: "Wooden Organ Pipes, Ready Within a Week | Decap",
  meta_description:
    "Almost any wooden organ pipe, milled on our own CNC and ready to ship within a week. Standard scales or your own measurements, for DIY builds and organs.",
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "The only workshop in the world that does this",
        title: "Wooden organ pipes, ready in days, not months",
        intro:
          "We are the only company in the world that developed CNC manufacturing of organ pipes in-house. Almost any wooden pipe, in our standard scales or to your own measurements, milled, assembled and ready to ship within days.",
        primary_cta_label: "Order pipes",
        primary_cta_link: "#contact-form",
        secondary_cta_label: "Pipes in a new organ",
        secondary_cta_link: "/organs",
        note: "For DIY builds, your own organ, organ builders and restorers.",
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
        { value: "1 week", label: "or less from order to shipping, depending on the ranks" },
        { value: "Any size", label: "our standard scales or your own measurements" },
        { value: "6 octaves", label: "Bourdon range, MIDI 24 to 96" },
        { value: "2016", label: "our first pipes from our own CNC" },
      ],
    },
    {
      type: "site_video",
      primary: {
        eyebrow: "From drawing to pipe",
        title: "Watch a pipe being made",
        intro: "Drawn in 3D in our office, milled on our CNC, glued and voiced in the workshop next door.",
        video_brief:
          "Film, 1–2 minutes, landscape 16:9: a pipe drawn in 3D in PipeCreator at the office → the G-code sent to the CNC → the CNC milling the parts → gluing → the finished pipe being blown for the first time. Upload to YouTube and paste the link here.",
      },
    },
    {
      type: "site_card_grid",
      primary: {
        eyebrow: "Who orders our pipes",
        title: "One rank or a complete wind system",
        intro: "Buy only the ranks, or the ranks and the chests to put them on. We make the parts you need and leave the rest to you.",
        columns: "4",
        card_style: "Text cards",
      },
      items: [
        {
          title: "DIY builders",
          body: "Building your own organ or instrument? Order the ranks you need, voiced or ready for you to voice.",
        },
        {
          title: "Your own organ",
          body: "An extra rank or a replacement rank, made to match what is already there.",
        },
        {
          title: "Organ builders and restorers",
          body: "Pipes to your scales and your measurements, without waiting months for a supplier.",
        },
        {
          title: "Pipes and chests",
          body: "Add wind chests from us, or go further with [MIDI conversion](/midi-conversion) or [SmartValve](/smartvalve) on every pipe.",
        },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "How we make them",
        title: "A process we developed ourselves",
        body:
          "Since 2016 we mill our organ pipes on a 5-axis CNC. The G-code comes from **PipeCreator**, software we wrote in-house. No other company makes organ pipes this way. The machine cuts each part to exact dimensions and angles, so every pipe in a rank matches the next.\n\nAfter cutting and gluing, the pipe is ready for voicing and finishing. Our voicers can do that for you, or you take over at the stage you prefer.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "Looping clip (mp4, 10–15 s, no sound needed): the 5-axis CNC milling a pipe part, shot beside the machine door. Upload it in the video field; until then a still photo, 4:3.",
      },
      items: [
        { point: "5-axis CNC, G-code from our own PipeCreator software" },
        { point: "Ready in a few days to a week, depending on the ranks" },
        { point: "Voiced by our voicers, or delivered for you to voice" },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Standard or your own sizing",
        title: "Change a measurement, get a new pipe",
        body:
          "Every pipe family has the same basic design, with room to vary. A little wider for more ground tone, a little narrower for more harmonics, a higher cut-up and a different length for higher wind pressure.\n\nIn PipeCreator we change the inside width and depth, panel thickness and length of our standard models in minutes. The G-code goes straight to the CNC. So a pipe to your own measurements takes about as long as a standard one.",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        image_brief: "Looping clip (mp4, 10–15 s): a pipe model in PipeCreator at the office, a measurement being changed and the 3D pipe updating. Screen recording or filmed monitor, 4:3.",
        tone: "Tinted",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Wood",
        title: "Ayous bodies, beech feet and mouths",
        body:
          "A CNC does not see the difference between fine grain and a knot, so we chose the wood for the machine and for the sound. The body is **Ayous** (*Triplochiton scleroxylon*): very stable, pale yellow and virtually free of knots. Feet and mouths are made of **hand-selected beech**.",
        media_side: "Image right",
        aspect: "Square",
        image_brief: "Close-up of the mouth of a wooden pipe, pale Ayous body against the beech mouth, square 1:1",
      },
    },
    {
      type: "site_facts",
      primary: {
        eyebrow: "Range",
        title: "Our standard pipe range",
        intro: "Ranges are given as MIDI note numbers (60 = middle C). Other ranges and measurements on request.",
        layout: "Spec list",
      },
      items: [
        { label: "Bourdon", value: "MIDI 24–96", note: "6 octaves, stopped" },
        { label: "Jazz Flute", value: "MIDI 60–96", note: "3 octaves, stopped" },
        { label: "Vibraton", value: "MIDI 46–84", note: "3 octaves, stopped" },
        { label: "Double Street Organ", value: "MIDI 60–96", note: "3 octaves, stopped" },
        { label: "Flute (Flute 8′ etc.)", value: "MIDI 60–96", note: "3 octaves, open" },
        { label: "Violins (alto, cello etc.)", value: "MIDI 48–96", note: "4 octaves, open" },
        { label: "Bariton", value: "MIDI 48–84", note: "3 octaves, reed" },
        { label: "Trumpet", value: "MIDI 60–96", note: "3 octaves, reed" },
      ],
    },
    {
      type: "site_faq",
      primary: {
        title: "Ordering pipes",
      },
      items: [
        {
          question: "How fast can you deliver?",
          answer: "Within a few days to a week, depending on the ranks you order. We confirm the date with the quote.",
        },
        {
          question: "Do you sell single pipes?",
          answer: "No. We make pipes as complete ranks, so every pipe in the rank is cut, voiced and matched with the next.",
        },
        {
          question: "Can I send my own measurements?",
          answer: "Yes. Send inside width and depth, length, mouth dimensions and wind pressure, or a drawing or sample pipe, and we make the rank to match.",
        },
        {
          question: "Voiced or unvoiced?",
          answer: "Both. Our voicers can voice the pipes to your wind pressure, or you receive them ready to voice yourself.",
        },
        {
          question: "Can you also make the wind chests?",
          answer: "Yes. Order pipes and chests together, and add MIDI conversion or SmartValve if you want the organ to play from MIDI.",
        },
        {
          question: "Do you ship outside Belgium?",
          answer: "Yes, we ship worldwide. Shipping is part of your quote.",
        },
      ],
    },
    {
      type: "contact_form",
      primary: {
        eyebrow: "Order pipes",
        title: "Send us your list of ranks",
        intro: "Tell us what you need. We reply with a quote and a shipping date.",
        recipient: "decap",
        topics: "Organ pipes, Pipes and wind chests",
        default_topic: "Organ pipes",
        show_phone: true,
        show_location: false,
        message_placeholder:
          "Which ranks (e.g. Bourdon, Flute), note range of each rank, wind pressure, standard scale or your own measurements, voiced or unvoiced…",
        submit_label: "Request a quote",
        success_title: "Your list of ranks has arrived",
        success_body: "We will reply with a quote and a shipping date.",
        aside_title: "Good to know",
        aside_body:
          "- Sold as complete ranks\n- Standard scales or your own measurements\n- Ready in a few days to a week, depending on the ranks\n- Voiced or ready to voice\n- Chests, MIDI conversion and SmartValve on request\n- Shipped worldwide",
      },
    },
  ],
};

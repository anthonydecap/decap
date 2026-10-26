/** smARTvalve for organ builders (Prismic page "smartvalve-for-organ-builders"): the B2B page. No prices, no competitor names. */
export default {
  type: "page",
  uid: "smartvalve-for-organ-builders",
  title: "smARTvalve for organ builders",
  theme: "smartvalve",
  meta_title: "Proportional Pipe Valves for Organ Builders | smARTvalve",
  meta_description:
    "smARTvalve: a proportional organ pipe valve with its own processor. Closed-loop wind control per pipe, digital stops and optical MIDI, for new organs and retrofits.",
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "smARTvalve for organ builders",
        title: "A proportional pipe valve with a processor in every valve",
        intro:
          "smARTvalve controls the wind to each pipe on its own, more than 1,000 times a second. Your pipes keep their voice; the organ gains dynamics, expression and stops that are set in software. Designed and built by Decap in Herentals, and proven on the concert stage.",
        primary_cta_label: "Request technical documentation",
        primary_cta_link: "#contact-form",
        secondary_cta_label: "Discover smARTvalve",
        secondary_cta_link: "/smartvalve",
        note: "For new organs, and for existing ones by replacing the pipe panels. Prices on request.",
        image_brief: "A row of smARTvalves mounted under pipes on a wind chest, dark background, low side light, portrait 4:5",
      },
    },
    {
      type: "site_facts",
      primary: {
        layout: "Stats",
      },
      items: [
        { value: "1,000×", label: "per second, the wind to every pipe is measured and corrected" },
        { value: "0–200%", label: "wind pressure per pipe, stored in the valve" },
        { value: "4 ms", label: "response time" },
        { value: "200 m+", label: "optical MIDI, 100 times faster than classic MIDI" },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Why from Decap",
        title: "Ninety years of dynamics, now in every pipe",
        body:
          "We are musicians first, and for 90 years we have worked on organs that play with more feeling. On our dance organs the drums play hard or soft, the wind pressure changes per wind chest and ranks play vibrato. smARTvalve is where that experience led: the same control, for every single pipe.\n\nFor us the church organ is one of the most beautiful and most musical instruments there is. While we developed smARTvalve, we could only dream of what it would do for one: more effects, more ways of playing, more colours.\n\nOur dance organ experience helps here too. Dance organs had to be transportable and rebuildable, so we build every organ as modular units in a façade. That is why a transportable church organ like L'Explorateur fits our workshop so well. And our wind chests are built for hard conditions, such as changes in temperature, because dance organs played in spiegeltents that were put up and taken down again and again.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "A Decap dance organ façade split into its modular units in the workshop, ready for transport, 4:3",
      },
      items: [
        { point: "Dynamic control of percussion and wind since the dance organ years" },
        { point: "Modular, transportable construction" },
        { point: "Wind chests built for changing temperatures and repeated set-ups" },
        { point: "All software in-house: CNC programs, valve control and player" },
      ],
    },
    {
      type: "site_card_grid",
      primary: {
        eyebrow: "Three generations of pipe valves",
        title: "From open-or-closed to every pipe under control",
        intro:
          "Electric actions have long treated a pipe valve as a switch. Newer valves follow the key. smARTvalve goes one step further: it controls the wind itself.",
        columns: "3",
        card_style: "Text cards",
      },
      items: [
        {
          tag: "Generation 1",
          title: "On/off valve",
          body: "A magnet opens the valve fully or closes it. Reliable and simple, but every note speaks the same way, however the key is played.",
        },
        {
          tag: "Generation 2",
          title: "Position-following valve",
          body: "The valve opening follows the key travel, so the organist shapes the attack. Once the key is down, the pipe stays where it is.",
        },
        {
          tag: "smARTvalve",
          title: "Closed-loop wind control",
          body: "A processor in every valve regulates the wind to its pipe, during the attack and while the note sounds. It can follow the key, or anything else you map to it.",
        },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Every pipe, its own wind",
        title: "Measured and corrected while the note sounds",
        body:
          "smARTvalve is small enough to sit on the pipe panel, a few millimetres from the pipe foot. Its processor measures the pressure drop on the input side and opens further to compensate, more than 1,000 times a second. When many pipes speak at once, every pipe keeps its wind. In L'Explorateur that made wind regulators unnecessary: a blower and a distribution box are enough.\n\nThe base pressure of each pipe is stored in the valve, from 0 to 200%. So part of the regulation that used to happen at the voicing bench can be done, and redone, in software.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "Close-up of one smARTvalve with its electronics visible, dark background, 4:3",
      },
      items: [
        { point: "Regulated a few millimetres from the pipe foot" },
        { point: "Stable speech when many pipes sound at once" },
        { point: "Base pressure per pipe stored in the valve" },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Key position, or anything else",
        title: "Map any MIDI to any pipe",
        body:
          "smARTvalve is fully digital, so you decide what drives it. Map the key position to the valve opening and it behaves exactly like a position-following valve. Map velocity, aftertouch, a controller or an automation curve from a sequencer, and the same pipe does what no mechanical valve can.\n\n- Crescendo and decrescendo on a held note\n- Vibrato and tremolo per pipe, not per wind chest\n- Pressure curves, slope and decay for every note\n- Classic on/off behaviour where the music asks for it",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        image_brief: "Screen of the smARTvalve software with a pressure curve, next to an organ keyboard, 4:3",
        tone: "Tinted",
      },
    },
    {
      type: "site_video",
      primary: {
        eyebrow: "Artistic research",
        title: "One pipe, many sounds",
        intro: "With smARTvalve a single pipe is no longer limited to one characteristic sound. Real-time control of the wind pressure opens a new palette of sounds from traditional organ pipes. Here Mauricio Silva Orendain, who researches microtonality, plays pipes through smARTvalve with a MIDI gesture ring.",
        video: "https://www.youtube.com/shorts/M4y9bnKHQeQ",
        caption: "Mauricio Silva Orendain controls organ pipes through smARTvalve with a MIDI gesture ring.",
        video_brief: "Mauricio Silva Orendain playing pipes through smARTvalve with a MIDI gesture ring",
      },
    },
    {
      type: "site_quote",
      primary: {
        quote: "smARTvalve creates new and largely unexplored connections between digital languages and the physicality of the pipe as an acoustic sound generator. It opens the instrument to non-organists, and to theatre, sound installations and artistic research.",
        name: "Mauricio Silva Orendain",
        role: "Researcher in microtonality",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Digital stops",
        title: "Stops set in software, in any combination",
        body:
          "Because every pipe has its own processor and address, a stop is no longer fixed in the wind chest. With our software you assign any combination of pipes to a stop, each pipe with its own pressure settings. In an organ built fully on smARTvalve, the number of combinations is practically unlimited; when smARTvalve extends an existing organ, the original control system can set limits, and we look at that per project.\n\nThe organ is not finished on delivery day: stops can be added or changed later, without touching the chest.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "Screenshot of the stop configuration in the smARTvalve software, pipes grouped into stops, 4:3",
      },
      items: [
        { point: "Any combination of pipes as a stop" },
        { point: "Pressure settings per pipe, per stop" },
        { point: "Stops can be changed after installation" },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Optical MIDI",
        title: "From the console to the chest over light",
        body:
          "smARTvalves are connected over Optical MIDI: more than 100 times the speed of classic MIDI, over distances of 200 m and more. Light carries no electrical interference, so the console can stand wherever the organ needs it. [Read more about smARTvalve](/smartvalve).",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        image_brief: "Optical MIDI cable plugged into a smARTvalve controller, glowing connector, dark background, 4:3",
      },
    },
    {
      type: "site_quote",
      primary: {
        quote: "This technology essentially turns a pipe organ into a physical synthesizer.",
        name: "Studio 31, Basel",
        role: "On L'Explorateur, the transportable concert organ with smARTvalve on every pipe",
      },
    },
    {
      type: "site_steps",
      primary: {
        eyebrow: "Working with us",
        title: "From first question to a playing organ",
      },
      items: [
        { title: "Tell us about the project", body: "A new organ or an existing one, the wind chests, the number of pipes and what you want the instrument to do." },
        { title: "Technical documentation", body: "Specifications, dimensions and wiring for your project, so your team can judge the integration." },
        { title: "Demonstration", body: "Hear smARTvalve on real pipes, in our Herentals workshop or by video call." },
        { title: "Integration support", body: "We support your team with the installation, the configuration of the valves and the digital stops." },
      ],
    },
    {
      type: "site_faq",
      primary: {
        title: "Questions from organ builders",
      },
      items: [
        {
          question: "Can smARTvalve behave like a classic valve?",
          answer: "Yes. smARTvalve is fully digital: it can work as an on/off valve, follow the key position, or respond to velocity, aftertouch and any other MIDI you map to it. You choose per pipe and per stop.",
        },
        {
          question: "Can it go into an existing organ?",
          answer: "Yes. smARTvalves are mounted on a pipe panel, so an existing organ can be converted by replacing its pipe panels. In a full smARTvalve organ everything is set in software; when smARTvalve extends an existing installation, the limits of its original control system apply. We look at every project first.",
        },
        {
          question: "Which consoles and control systems work with smARTvalve?",
          answer: "Anything that speaks MIDI: a console with MIDI output, a sequencer or a computer. Over Optical MIDI the console can be 200 m or more away.",
        },
        {
          question: "What are digital stops?",
          answer: "Stops defined in software instead of in the wind chest. You assign any combination of pipes to a stop, with its own pressure settings, and you can change stops after installation.",
        },
        {
          question: "Is smARTvalve proven in practice?",
          answer: "Yes. smARTvalve plays in L'Explorateur, Yves Rechsteiner's transportable concert organ with smARTvalve on every pipe: more than 30 performances since 2023, and set up in under two hours from the truck arriving. [Read the case study](/work/yves-rechsteiner).",
        },
        {
          question: "What does it cost?",
          answer: "That depends on the number of pipes and the project. Tell us about your organ and we send you a proposal.",
        },
      ],
    },
    {
      type: "contact_form",
      primary: {
        eyebrow: "For organ builders",
        title: "Request documentation or a demonstration",
        intro: "Tell us about your workshop and your project. We reply personally.",
        recipient: "decap",
        topics: "Technical documentation, Demonstration, Proposal for a project, Integration question",
        default_topic: "Technical documentation",
        show_phone: true,
        show_location: false,
        message_placeholder: "Your workshop, the organ (new or existing), the wind chests, the number of pipes and what you would like smARTvalve to do…",
        submit_label: "Send request",
        success_title: "Thank you",
        success_body: "Your request is with us. We reply personally with the information you asked for.",
        aside_title: "Decap Herentals",
        aside_body:
          "Langepad 51C, 2200 Herentals, Belgium\n\n+32 14 22 44 94\n\n[info@decap.be](mailto:info@decap.be)\n\nsmARTvalve is designed, built and programmed in our own workshop.",
      },
    },
  ],
};

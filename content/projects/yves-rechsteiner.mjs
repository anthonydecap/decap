/** Work case study (Prismic project "yves-rechsteiner"): L'Explorateur, the most complete case. Facts and quotes from Yves Rechsteiner's article "About the Explorateur". */
export default {
  type: "project",
  uid: "yves-rechsteiner",
  title: "Yves Rechsteiner: L'Explorateur",
  theme: "decap",
  meta_title: "L'Explorateur: Transportable Concert Organ | Decap",
  meta_description:
    "L'Explorateur, Yves Rechsteiner's transportable pipe organ with SmartValve on every pipe: 12 modules, set up in under two hours, over 30 performances since 2023.",
  fields: {
    summary: "A transportable concert organ with wind control on every pipe: set up in under two hours, more than 30 performances since 2023.",
    client: "Yves Rechsteiner, Toulouse les Orgues",
    year: "2021–2026",
    location: "Toulouse, France",
  },
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Work · Yves Rechsteiner",
        title: "L'Explorateur: a transportable concert organ with SmartValve on every pipe",
        intro:
          "Organist Yves Rechsteiner wanted a pipe organ that could play wherever the music is, not only in churches. Together we built L'Explorateur: twelve modules that travel in one van, set up in under two hours, with the wind of every pipe under control. Rechsteiner calls the result a physical synthesizer.",
        primary_cta_label: "SmartValve for organ builders",
        primary_cta_link: "/smartvalve-for-organ-builders",
        secondary_cta_label: "About SmartValve",
        secondary_cta_link: "/smartvalve",
        image_brief: "L'Explorateur on stage with dancers in front, wide shot, 4:3",
      },
    },
    {
      type: "site_facts",
      primary: {
        layout: "Stats",
        tone: "Tinted",
      },
      items: [
        { value: "< 2 h", label: "from the truck arriving to playing" },
        { value: "30+", label: "performances since 2023" },
        { value: "12", label: "modules, in one 20 m³ van" },
        { value: "0", label: "wind regulators: one blower and a distribution box" },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "The idea",
        title: "An organ for every stage, not only for churches",
        body:
          "In 2013 Yves Rechsteiner became artistic director of Toulouse les Orgues. His idea: a pipe organ that could leave the church. *“The aim was to have an instrument performing out of churches for any musical project with pipe organ.”*\n\nIn 2017 the project stopped for financial reasons. Two years later Rechsteiner saw a teaser of Stephan Eicher's show *Die Automaten*, built with Decap instruments, and met Tony Decap. Tony had experience with movable pipe organs and had already developed his own wind control. Rechsteiner ordered a MIDI-controlled instrument.",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        image_brief: "Dancers on stage in front of L'Explorateur, an organist at the console, 4:3",
      },
    },
    {
      type: "site_timeline",
      primary: {
        eyebrow: "Timeline",
        title: "From idea to wind synthesizer",
      },
      items: [
        { year: "2013", title: "The idea", body: "Yves Rechsteiner, new artistic director of Toulouse les Orgues, wants an organ that can perform outside churches." },
        { year: "2017", title: "On hold", body: "The transportable organ project stops for financial reasons." },
        { year: "2019", title: "Meeting Tony Decap", body: "Through a teaser of Stephan Eicher's *Die Automaten*. Rechsteiner orders a MIDI-controlled instrument." },
        { year: "2021", title: "Construction starts", body: "During the build, Decap proposes something new: control the wind not per wind chest, but per pipe." },
        { year: "2023", title: "First performances", body: "After two years of work and research, L'Explorateur plays with the first generation of valves. The performances begin." },
        { year: "2023–2025", title: "SmartValve", body: "Tony Decap designs the second generation, SmartValve, and the module electronics are rebuilt around it.", highlight: true },
        { year: "2025", title: "The first wind synthesizer", body: "SmartValve in concert: every pipe of a transportable church organ controlled on its own. Among the concerts, a Moondog tribute in Lyon's Chapelle de la Trinité.", highlight: true },
        { year: "2026", title: "Next steps", body: "New valves and wind chests, console software, tonal adjustment and a free-reed rank from an 1830 Muller *orgue expressif*." },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "The technology",
        title: "Wind control per pipe, not per wind chest",
        body:
          "In a classic organ, all pipes on a wind chest share the same wind. In L'Explorateur every pipe has its own SmartValve, a few millimetres from the pipe foot. The valve measures the pressure drop on its input side and opens further to compensate, so every pipe keeps its wind when many pipes sound at once.\n\nThe first valves were small loudspeakers converted into valves. SmartValve, the second generation, was designed by Tony Decap and produced industrially. For the organist it means control over each note: *“you can define the nature of the attack of the sound.”*",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        cta_label: "How SmartValve works",
        cta_link: "/smartvalve",
        image_brief: "Close-up of the SmartValves under the pipes inside L'Explorateur, dark background, 4:3",
      },
      items: [
        { point: "One valve and one processor per pipe" },
        { point: "Pressure measured and corrected at the pipe foot" },
        { point: "No wind regulators: a blower and a distribution box are enough" },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Built to travel",
        title: "One van, twelve modules, under two hours",
        body:
          "From the start, L'Explorateur had two limits: it had to fit in a 20 m³ van and weigh no more than 1,200 kg. Every technical choice followed from that.\n\nThe organ is divided into modules that are carried in, placed and connected. Because SmartValve makes wind regulators unnecessary, the wind system is only a blower and a distribution box. *“For L'Explorateur it means an easy setup of less than 2 hours from the truck arriving to playing.”*",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        image_brief: "L'Explorateur modules being unloaded from the van or set up in a hall, 4:3",
        tone: "Tinted",
      },
      items: [
        { point: "Fits in a 20 m³ van" },
        { point: "Maximum 1,200 kg" },
        { point: "Modules rebuilt to identical standard dimensions" },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "In the room",
        title: "The placement becomes part of the sound",
        body:
          "Because the modules are separate, they can stand together like one organ, or apart as independent divisions around the audience. Each placement changes how the instrument meets the room. *“The same Flute module has a different sound when placed in the front, on the side or behind another module.”*",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "L'Explorateur modules spread around a hall or chapel, audience in between, wide shot, 4:3",
      },
    },
    {
      type: "site_facts",
      primary: {
        eyebrow: "Stop list",
        title: "The original disposition",
        intro: "As planned at the start. The instrument keeps evolving: see “What comes next”.",
        layout: "Spec list",
      },
      items: [
        { label: "Bourdon", value: "16′ to 4′" },
        { label: "Principal", value: "8′ to 1′" },
        { label: "Flute", value: "8′ to 1′", note: "pipes from the second octave" },
        { label: "Wooden Traverse Flute", value: "8′", note: "pipes from the second octave" },
        { label: "Salicional", value: "8′" },
        { label: "Gamba", value: "8′ and 4′", note: "pipes from the second octave" },
        { label: "Nasard", value: "" },
        { label: "Tierce", value: "" },
        { label: "Trompette", value: "16′ to 4′", note: "new free reeds in the first two octaves" },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "The pipework",
        title: "Old pipes, a new life",
        body:
          "Most of the pipework is second-hand, from the late 19th and early 20th century, and was voiced by Jean Daldosso. New free-reed pipes were made by Orgelbau Orglez in Brittany: free reeds change their dynamics without changing pitch, a perfect match for wind control per pipe.\n\nWith SmartValve, one rank can do far more than it was built for: fifty Flute pipes give a whole range of colours through the wind alone.",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        image_brief: "Close-up of old wooden and metal pipes standing on a module of L'Explorateur, 4:3",
      },
    },
    {
      type: "site_card_grid",
      primary: {
        eyebrow: "On stage",
        title: "From Fauré's Requiem to MIDI residencies",
        intro: "Since 2023 L'Explorateur has played more than 30 performances, in churches, museums, theatres and concert halls.",
        columns: "3",
        card_style: "Text cards",
      },
      items: [
        {
          title: "Repertoire",
          body: "Vierne's *Messe solennelle*, Fauré's *Requiem*, vocal music by Thierry Escaich and Poulenc's *Organ Concerto*.",
        },
        {
          title: "Concerts",
          body: "In churches, museums, theatres and auditoriums. In November 2025, a Moondog tribute in the Chapelle de la Trinité in Lyon.",
        },
        {
          title: "Residencies",
          body: "For Toulouse les Orgues, the Berlin duo Gamut and Toronto artist George Rahi worked with L'Explorateur as a MIDI-controlled organ.",
        },
      ],
    },
    {
      type: "site_quote",
      primary: {
        quote: "All of them acknowledge the high level of quality, performance and response of Tony Decap's smART valve.",
        name: "Yves Rechsteiner",
        role: "On the organ builders who have seen L'Explorateur",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "What comes next",
        title: "An instrument that keeps growing",
        body:
          "L'Explorateur is not finished, and that is the point.\n\n- **Osmose keyboard:** the wind pressure follows the key, so the organist plays with a piano or clavichord technique.\n- **Console software:** a tool to programme attack, development and vibrato per sound, inspired by ADSR envelopes.\n- **Polyphone pipes** for the bass of the Principal and Salicional: several notes from one pipe.\n- **New swell boxes** designed by Tony Decap, for the softest dynamics.\n- **A lighter 16′ Ophicléide**, and a free-reed rank from an 1830 Muller *orgue expressif*.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "Yves Rechsteiner at the console of L'Explorateur with a laptop beside the keyboard, 4:3",
        tone: "Tinted",
      },
    },
    {
      type: "site_video",
      primary: {
        eyebrow: "Watch",
        title: "L'Explorateur in concert",
        video_brief: "Video of Yves Rechsteiner playing L'Explorateur in concert, e.g. Lyon, Chapelle de la Trinité",
      },
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "For organ builders and organists",
        title: "Give every pipe its own wind",
        body: "SmartValve is available for new organs and, by replacing the pipe panels, for existing ones. Tell us about your project.",
        primary_cta_label: "SmartValve for organ builders",
        primary_cta_link: "/smartvalve-for-organ-builders",
        secondary_cta_label: "Contact Decap",
        secondary_cta_link: "/contact",
        tone: "Dark band",
      },
    },
  ],
};

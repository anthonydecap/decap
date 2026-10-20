/** About page (Prismic page "about"): the Decap family story, two Decap workshops, the workshop today. */
export default {
  type: "page",
  uid: "about",
  title: "About Decap Herentals",
  theme: "decap",
  meta_title: "About Us: Organ Builders Since 1895 | Decap Herentals",
  meta_description:
    "Four generations of Decap organ builders. Aloïs Decap started in 1895, Frans founded Decap Herentals in 1933. Today Tony Decap builds organs and SmartValve.",
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Organ builders since 1895. Decap Herentals since 1933.",
        title: "Four generations of Decap organ builders in Herentals",
        intro:
          "Aloïs Decap started renting out organs around Antwerp in 1895. His son Frans founded Decap Herentals in 1933. Today Tony Decap, the fourth generation, builds organs, self-playing instruments and the electronics that drive them in the same town.",
        primary_cta_label: "Our organs",
        primary_cta_link: "/organs",
        secondary_cta_label: "Contact the workshop",
        secondary_cta_link: "/contact",
        image_brief:
          "Tony Decap at the workbench in the Herentals workshop, an organ façade in progress behind him, natural light, portrait 4:5",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Decap Herentals",
        title: "One family, one trade, since 1895",
        body:
          "Decap Herentals builds dance organs, fair organs, street organs and concert organs, and the self-playing instruments and MIDI technology that go with them. The workshop is on the Langepad in Herentals, Belgium.\n\nThe trade has passed from father to son four times. Each generation kept what worked and changed what no longer did: Frans gave the business its own workshop, François took the dance organ digital, and Tony brought MIDI and then SmartValve.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "Scan of archive photo of the Decap workshop in Herentals, early years, landscape 4:3",
      },
    },
    {
      type: "site_timeline",
      primary: {
        eyebrow: "Our history",
        title: "From a dog cart in Antwerp to the first wind synthesizer",
        intro:
          "The milestones below come from family records and from the history of the Decap family published by Mostmans in *Carousel Organ* no. 4 (2000).",
        tone: "Tinted",
      },
      items: [
        {
          year: "1864",
          title: "Aloïs Decap is born",
          body: "The son of farmer Livien Decap and Sophie Mortier.",
          image_brief: "Scan of archive portrait of Aloïs Decap, portrait 4:5",
        },
        {
          year: "c. 1888",
          title: "Accordion player at fairs and in cafés",
          body: "Aloïs settles in Ekeren, near Antwerp, and plays the accordion at fairs and in cafés.",
          image_brief: "Scan of archive photo of Aloïs Decap with his accordion, 4:3",
        },
        {
          year: "c. 1895",
          title: "The start of the Decap organ business",
          body: "Aloïs begins renting out and dealing in organs. He delivers them by dog cart, later by mule. His son Frans is born the same year.",
          image_brief: "Scan of archive photo of an early rented organ or the dog cart used for deliveries, 4:3",
        },
        {
          year: "1902",
          title: "The first Decap workshop",
          body: "Aloïs and his son Livien start building organs in a workshop on the Essenstraat in Antwerp.",
          image_brief: "Scan of archive photo of the Essenstraat workshop, Antwerp, 4:3",
        },
        {
          year: "After WWI",
          title: "Gebroeders Decap",
          body: "Aloïs's sons Livien, Frans, Léon and Camille form the partnership Gebroeders Decap.",
          image_brief: "Scan of archive photo of the four Decap brothers, 4:3",
        },
        {
          year: "1933",
          title: "Frans Decap founds Decap Herentals",
          body: "Frans sets up his own organ workshop in Herentals. The same year, the first self-playing accordions appear on Decap organs.",
          highlight: true,
          image_brief: "Scan of archive photo of Frans Decap or the first Herentals workshop, 4:3",
        },
        {
          year: "1972",
          title: "François takes over",
          body: "After Frans dies, his son François continues the business as Orgelfabriek Decap Herentals.",
          image_brief: "Scan of archive photo of François Decap in the workshop, 4:3",
        },
        {
          year: "1977",
          title: "The first digital dance organ",
          body: "François replaces the pipes with digital sound. Dance halls and cafés with much smaller budgets can now have an organ.",
          highlight: true,
          image_brief: "Scan of archive photo of an early digital Decap dance organ in a dance hall, 4:3",
        },
        {
          year: "2000",
          title: "MIDI comes to the dance organ",
          body: "Tony Decap brings MIDI to the dance organ. A whole music library fits on one digital card and replaces racks of cardboard music books.",
          highlight: true,
          image_brief: "Photo of a stack of cardboard book music next to a single memory card, on a workbench, 4:3",
        },
        {
          year: "2004",
          title: "The Accordion Pedestal",
          body: "A real accordion, played by MIDI on its own stand. [See the self-playing accordion](/accordion).",
          image_brief: "Early Accordion Pedestal photographed against a plain wall, 4:3",
        },
        {
          year: "2008",
          title: "A Decap dance organ on tour",
          body: "Guido Belcanto takes a Decap dance organ on stage in his theatre show *Balzaal der Gebroken Harten*. Controllable sensitivity and volume make it possible. [Read the story](/work/guido-belcanto).",
          image_brief: "Scan of a photo or poster of Balzaal der Gebroken Harten with the Decap organ on stage, 4:3",
        },
        {
          year: "2016",
          title: "Organ pipes from our own CNC",
          body: "We mill the first organ pipes on CNC, with a process developed entirely in-house and our own PipeCreator software. [About our organ pipes](/organ-pipes).",
          image_brief: "Wooden pipe being milled on the 5-axis CNC, close-up, 4:3",
        },
        {
          year: "2025",
          title: "The first wind synthesizer",
          body: "SmartValve goes into the first transportable church organ, with every pipe controlled on its own: L'Explorateur for Swiss organist Yves Rechsteiner. [Read the case study](/work/yves-rechsteiner).",
          highlight: true,
          image_brief: "L'Explorateur set up in a chapel, wide shot, 4:3",
        },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Which Decap?",
        title: "Two Decap workshops, one founder",
        body:
          "Two organ businesses carry the Decap name today, and both descend from Aloïs Decap.\n\n- **Gebroeders Decap Antwerpen** (Decap Brothers, Antwerp) continues from the partnership Aloïs's sons formed in Antwerp after the First World War.\n- **Decap Herentals** goes back to 1933, when Frans Decap set up his own workshop in Herentals. This is the Decap you are reading about.\n\nThe two companies are independent of each other and on friendly terms. If you have a Decap organ and are not sure which workshop built it, send us a photo of the façade and any nameplate. We will tell you what we can.",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        cta_label: "Send us a photo",
        cta_link: "/contact",
        image_brief: "Scan of archive photo of a historic Decap organ façade with the Decap name visible, 4:3",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Restoration",
        title: "Frank Decap and his Atelier",
        body:
          "Frank Decap is Tony's brother. He runs his own business, Atelier Frank Decap, as a master craftsman dedicated to organ restoration, working the way earlier generations of the family did.\n\nFrank also installs our MIDI conversion units, so a restored book organ can play from books and from MIDI. Restoration enquiries go straight to him through his page on this site.",
        media_side: "Image right",
        aspect: "Portrait 4:5",
        cta_label: "Atelier Frank Decap",
        cta_link: "/frank-decap",
        image_brief: "Frank Decap restoring the bellows of a historic organ in his atelier, warm light, portrait 4:5",
        tone: "Tinted",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "The workshop today",
        title: "Pipes, electronics and software, made in Herentals",
        body:
          "Almost everything that goes into a Decap organ is made under our own roof.",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        image_brief: "Wide shot of the Herentals workshop: CNC machine on one side, an organ in assembly on the other, 4:3",
      },
      items: [
        { point: "Design and 3D render of every organ before production starts" },
        { point: "Wooden organ pipes milled on our 5-axis CNC, with PipeCreator software we wrote ourselves" },
        { point: "Voicing by our own voicers" },
        { point: "SmartValve, MIDI conversion units and the control electronics for our instruments" },
        { point: "Virtual Orchestrion and MIDIMapper software, written in-house" },
        { point: "Self-playing instruments: accordion, pipes, percussion and mallet percussion" },
      ],
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "The next Decap organ",
        title: "Tell us where your organ will play",
        body: "Describe the room, the music and the budget. We reply with questions and a first design idea.",
        primary_cta_label: "See our organs",
        primary_cta_link: "/organs",
        secondary_cta_label: "Request a consultation",
        secondary_cta_link: "/contact",
        tone: "Dark band",
      },
    },
  ],
};

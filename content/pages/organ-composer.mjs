/** Organ Composer page (Prismic page "organ-composer"): pick a starting design and send it as a consultation request. */
export default {
  type: "page",
  uid: "organ-composer",
  title: "Organ Composer",
  theme: "decap",
  meta_title: "Organ Composer: design your dance organ | Decap",
  meta_description:
    "Pick a starting design, choose size, sound, voices and front instruments, and send it to Decap Herentals. We reply with questions and a first idea.",
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Centered",
        eyebrow: "Organ Composer",
        title: "Compose your organ",
        intro:
          "Choose a starting design and answer a few questions about the room, the sound and the front instruments. It takes a few minutes and gives us a clear starting point for the first conversation.",
        note: "Not a price calculator and not an order. Every organ is confirmed after a consultation.",
      },
    },
    {
      type: "organ_composer",
      primary: {
        eyebrow: "Step 1",
        title: "Pick a starting design",
        intro:
          "Start from one of our modular organs or from a bespoke design we built before. Then choose where it will play, the size, pipes or digital, the voices and what plays in the front.",
        bespoke_note:
          "Want something none of these designs show? Choose **Start from scratch** and describe your idea in the message. Bespoke organs start with a consultation and a 3D render, so nothing is fixed until you have seen it.",
        success_title: "Your starting point is on its way",
        success_body:
          "Thank you. Your choices are with us in Herentals. We reply with questions and a first idea. [TO CHECK: typical reply time]",
      },
      items: [
        {
          name: "Modular dance organ, 105 keys",
          kind: "Modular",
          description: "Built from proven modules on our standard 105-key scale. Plays 121-key music through the Virtual Orchestrion player.",
          image_brief: "Existing 3D render of the modular 105-key dance organ, front view, plain background, 4:3",
        },
        {
          name: "Modular dance organ, 121 keys",
          kind: "Modular",
          description: "Built from proven modules on our standard 121-key scale, for more notes and more ranks.",
          image_brief: "Existing 3D render of the modular 121-key dance organ, front view, plain background, 4:3",
        },
        {
          name: "Bespoke concert organ",
          kind: "Bespoke",
          description: "A concert or church organ designed for one venue or one musician. SmartValve per-pipe control possible.",
          image_brief: "Existing 3D render of a bespoke Decap concert organ, front three-quarter view, plain background, 4:3",
        },
        {
          name: "Bespoke street organ",
          kind: "Bespoke",
          description: "A street organ with its own case, façade and front instruments, made to travel.",
          image_brief: "Existing 3D render of a bespoke Decap street organ, front three-quarter view, plain background, 4:3",
        },
      ],
    },
    {
      type: "site_faq",
      primary: {
        eyebrow: "Questions",
        title: "About the Organ Composer",
      },
      items: [
        {
          question: "Is sending a design binding?",
          answer: "No. It is a request for a consultation, not an order. Nothing is fixed until you confirm an order with us.",
        },
        {
          question: "What happens after I send it?",
          answer:
            "We read your choices and reply with questions and a first idea. Then we talk through the room, the music and the budget, and work towards a design and a 3D render. [See how we build an organ](/organs).",
        },
        {
          question: "Can I start from scratch?",
          answer:
            "Yes. Choose **Start from scratch** and describe what you have in mind. Every option can be changed later, and a fully bespoke organ is always possible.",
        },
      ],
    },
  ],
};

/** Atelier Frank Decap page (Prismic page "frank-decap"): Frank's independent organ restoration workshop, with a contact form that reaches him. */
export default {
  type: "page",
  uid: "frank-decap",
  title: "Atelier Frank Decap",
  theme: "atelier",
  meta_title: "Organ Restoration | Atelier Frank Decap",
  meta_description:
    "Atelier Frank Decap restores historic book and roll organs, dance, fair and street organs, builds pipes by hand and installs Decap MIDI units. Write to Frank.",
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Atelier Frank Decap",
        title: "Organ restoration by Frank Decap",
        intro:
          "Frank Decap is a master craftsman who has given his workshop to one thing: restoring historic organs the way they were built. He is Tony Decap's brother and runs his own independent atelier. Write to him about your organ; this page reaches him directly.",
        primary_cta_label: "Send Frank your question",
        primary_cta_link: "#contact-form",
        image_brief:
          "Frank Decap at his workbench with an organ part in his hands, looking at the work rather than the camera, warm window light; portrait 4:5",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Who restores your organ",
        title: "One family, two workshops",
        body:
          "The Decap family has worked with organs since 1895. Tony Decap builds new organs and develops the technology in Herentals. His brother Frank chose the other side of the craft: keeping historic organs playing as their builders intended.\n\nAtelier Frank Decap is Frank's own business, separate from Decap Herentals. When you write to him, you deal with the person who will do the work.\n\nThe atelier is on the same site as Decap Herentals, the Decap organ factory on the Langepad in Herentals.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "Wide shot of Frank's atelier: workbench, hand tools on the wall, an organ case opened up in the background; 4:3",
      },
    },
    {
      type: "site_card_grid",
      primary: {
        eyebrow: "What Frank restores",
        title: "From the bellows to the façade",
        intro: "Typical work in the atelier.",
        columns: "3",
        card_style: "Text cards",
      },
      items: [
        { title: "Book and roll organs", body: "Key frames, book and roll mechanisms, and everything they drive." },
        { title: "Dance, fair and street organs", body: "The organs the Decap family has built and played for generations, and those of other builders." },
        { title: "Pneumatic actions", body: "Pouches, valves and tubing, so every note speaks again." },
        { title: "Bellows and wind", body: "Bellows and reservoirs made airtight, so the organ holds steady wind." },
        { title: "Voicing", body: "Pipes voiced and tuned back to the organ's original character." },
        { title: "Cases", body: "The case and the façade that make an organ recognisable." },
        { title: "Traditional pipe building", body: "New pipes made by hand, the traditional way, to match an organ's original pipework." },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "MIDI conversion",
        title: "Book and MIDI in one organ",
        body:
          "Frank installs the [Decap MIDI conversion units](/midi-conversion) made in Herentals. The units sit between the key frame and the main chest, so the book or roll keeps working as before, and book and MIDI can even play at the same time.\n\nYou buy the units from Decap Herentals; Frank fits them, alone or as part of a restoration.",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        cta_label: "About the MIDI units",
        cta_link: "/midi-conversion",
        image_brief: "Decap MIDI units fitted inside a historic organ, tubing to the key frame visible, lit with a work lamp; 4:3",
        tone: "Tinted",
      },
    },
    {
      type: "site_steps",
      primary: {
        eyebrow: "How Frank works",
        title: "From the first photo to the first tune",
        intro: "Every organ is different, so every restoration starts with looking before quoting.",
      },
      items: [
        {
          title: "Photos and a first look",
          body: "Send a few lines about your organ through the form below. When Frank replies, you can send him photos of the case, the façade, the key frame and anything that no longer works. They tell him a lot before he sees the organ.",
        },
        {
          title: "Inspection",
          body: "Frank looks at the organ itself to see what it needs and what is still original. Every organ is different, so Frank decides case by case whether he comes to you or the organ comes to the atelier.",
        },
        {
          title: "Written proposal",
          body: "You receive a written proposal describing the work Frank recommends, so you know what will be done before anything starts. What it covers depends on the organ and the work it needs.",
        },
        {
          title: "Restoration",
          body: "The work is done by hand in the atelier, part by part, with respect for what the original builder made.",
        },
        {
          title: "Voicing and delivery",
          body: "Frank voices and tunes the organ and returns it to you playing. Whether he sets it up on site is agreed for each organ.",
        },
      ],
    },
    {
      type: "site_card_grid",
      primary: {
        eyebrow: "Before and after",
        title: "From the atelier",
        columns: "3",
        card_style: "Image cards",
      },
      items: [
        {
          title: "Before",
          body: "An organ as it arrived in the atelier.",
          image_brief: "An organ as it arrived in the atelier, front view, same position and angle as the 'after' photo; 4:3",
        },
        {
          title: "After",
          body: "The same organ, restored and playing again.",
          image_brief: "The same organ after restoration, shot from the exact same spot and height as the 'before' photo; 4:3",
        },
        {
          title: "In the atelier",
          body: "Restoration in progress, part by part, by hand.",
          image_brief: "Close-up of restoration in progress, e.g. new leather on a pneumatic pouch board or a bellows being re-covered, warm light; 4:3",
        },
      ],
    },
    {
      type: "contact_form",
      primary: {
        eyebrow: "Write to Frank",
        title: "Tell Frank about your organ",
        intro:
          "This form goes straight to Frank Decap. A few details about the organ help him give you a useful first answer.",
        recipient: "frank",
        topics: "Restoration, MIDI installation, Repair, Other",
        default_topic: "Restoration",
        show_phone: true,
        show_location: true,
        message_placeholder:
          "Make or builder of the organ, number of keys, book or roll, and its condition. Photos help: you can send them when Frank replies.",
        submit_label: "Send to Frank",
        success_title: "Thank you",
        success_body: "Your message is with Frank. He replies personally; have your photos of the organ ready.",
        aside_title: "Reaching Frank",
        aside_body:
          "Atelier Frank Decap is independent from Decap Herentals. The easiest way to reach Frank is this form.\n\n**Phone:** [TO CHECK: Frank's phone number]\n\n**Atelier:** Langepad 51C, 2200 Herentals, Belgium, on the same site as Decap Herentals.\n\nFor a new organ, pipes or MIDI units, contact [Decap Herentals](/contact).",
      },
    },
  ],
};

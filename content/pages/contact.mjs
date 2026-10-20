/** Contact page (Prismic page "contact"): enquiry form to the Herentals workshop, address and visiting details. */
export default {
  type: "page",
  uid: "contact",
  title: "Contact Decap Herentals",
  theme: "decap",
  meta_title: "Contact the Organ Workshop | Decap Herentals",
  meta_description:
    "Ask about a new organ, self-playing instruments, MIDI conversion or software. Decap Herentals, Langepad 51C, 2200 Herentals, Belgium. +32 14 22 44 94.",
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Centered",
        eyebrow: "Contact",
        title: "Contact the Decap organ workshop in Herentals",
        intro:
          "Tell us what you have in mind: a new organ, an instrument, a MIDI conversion or a question about our software. The more you tell us about the room and the music, the more useful our first answer.",
      },
    },
    {
      type: "contact_form",
      primary: {
        eyebrow: "Send an enquiry",
        title: "What can we help you with?",
        recipient: "decap",
        topics: "General question, New organ, Instruments, MIDI conversion, Software, Press",
        default_topic: "General question",
        show_phone: true,
        show_location: true,
        message_placeholder:
          "For a new organ: where will it play, what music, and roughly what size or budget? For MIDI conversion: which organ and how many keys?",
        submit_label: "Send enquiry",
        success_title: "Thank you, your enquiry is on its way",
        success_body: "We read every message in the workshop and reply personally. [TO CHECK: typical response time]",
        aside_title: "Visit the workshop",
        aside_body:
          "**Decap Herentals**, Langepad 51C, 2200 Herentals, Belgium\n\n**Phone:** +32 14 22 44 94\n\n**Email:** [info@decap.be](mailto:info@decap.be)\n\nVisits by appointment. [TO CHECK: confirm visits by appointment only, and opening hours]\n\nDECAP TONY BV · BE 0450.352.984\n\nRestoring a historic organ? Contact [Atelier Frank Decap](/frank-decap) directly.",
      },
    },
    {
      type: "site_faq",
      primary: {
        eyebrow: "Before you write",
        title: "Good to know",
        tone: "Tinted",
      },
      items: [
        {
          question: "How soon will I hear back?",
          answer: "[TO CHECK: typical response time, e.g. within two working days]",
        },
        {
          question: "Can I visit the workshop in Herentals?",
          answer:
            "Yes, by appointment. Send us a message or call +32 14 22 44 94 to agree a day. In the workshop you can see organs in progress, hear our self-playing instruments and talk through your plans face to face. [TO CHECK: confirm what visitors can see and hear]",
        },
        {
          question: "Do you deliver outside Belgium?",
          answer:
            "Our instruments play with artists and in venues across Europe. [TO CHECK: installation outside Belgium, shipping countries and how costs are quoted]",
        },
        {
          question: "Who restores historic organs?",
          answer:
            "Restoration is the work of Atelier Frank Decap, the separate business of Tony's brother Frank. Use the form on [his page](/frank-decap) so your message reaches him directly.",
        },
      ],
    },
  ],
};

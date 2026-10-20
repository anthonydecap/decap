/** Privacy notice (Prismic page "privacy-policy"): sections as an accordion. */
export default {
  type: "page",
  uid: "privacy-policy",
  title: "Privacy policy",
  theme: "decap",
  meta_title: "Privacy Policy | Decap Herentals",
  meta_description:
    "How DECAP TONY BV handles the personal data you send through decap.be: what we collect, why, how long we keep it and how to use your rights under the GDPR.",
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Centered",
        eyebrow: "Privacy",
        title: "Privacy policy for decap.be",
        intro:
          "This notice explains what personal data we process when you use this website, why, and what rights you have. We keep it short and only collect what we need to answer you.",
        note: "Last updated: October 2026",
      },
    },
    {
      type: "site_faq",
      primary: {
        title: "How we handle your data",
      },
      items: [
        {
          question: "Who is responsible for your data",
          answer:
            "The controller is **DECAP TONY BV**, Langepad 51C, 2200 Herentals, Belgium, company number BE 0450.352.984, trading as Decap Herentals.\n\nFor any privacy question, write to [info@decap.be](mailto:info@decap.be) or call +32 14 22 44 94.",
        },
        {
          question: "What we collect through the enquiry form",
          answer:
            "When you send an enquiry, we receive:\n\n- your name\n- your email address\n- your phone number, if you give it\n- your location, if you give it\n- the topic and your message\n\nThe form is sent to us by email through Resend, an email service provider that processes the message on our behalf. Resend may process data outside the European Union, such as in the United States; such transfers rely on the safeguards the GDPR requires.\n\nMessages for Atelier Frank Decap, sent from the [Frank Decap page](/frank-decap), go to Frank Decap, who runs a separate business and handles those messages himself.",
        },
        {
          question: "Why we use it, and on what legal basis",
          answer:
            "We use your details only to answer your enquiry and, if you ask us to, to prepare a quotation or an order. The legal basis is the steps you ask us to take before a possible contract and our legitimate interest in answering messages sent to us (GDPR article 6(1)(b) and (f)).\n\nWe do not sell your data. We do not send newsletters and do not keep a mailing list.",
        },
        {
          question: "How long we keep it",
          answer:
            "We keep your enquiry as long as we need it to answer you and to follow up on it. After that we delete it. If an order follows, we keep the data linked to the order for as long as accounting law requires.",
        },
        {
          question: "Shop accounts and orders",
          answer:
            "If you create an account or order in our shop, we process the data needed for the order, payment and delivery. Payments are handled by Stripe. Orders and payments are described in the terms of our [shop](/shop).",
        },
        {
          question: "Cookies and analytics",
          answer:
            "We use Google Analytics, provided by Google Ireland Ltd., to see how visitors use the site. It only runs if you accept it in the cookie banner. If you decline, no analytics cookies are set. Google may process data outside the European Union, such as in the United States.\n\nThe site also stores your cookie choice, so the banner does not appear on every page.",
        },
        {
          question: "Your rights",
          answer:
            "Under the GDPR you can ask us to:\n\n- show you the personal data we hold about you\n- correct it\n- delete it\n- limit how we use it\n- give it to you in a portable format\n\nYou can also object to processing based on our legitimate interest. Send your request to [info@decap.be](mailto:info@decap.be). We answer within one month.",
        },
        {
          question: "Complaints",
          answer:
            "If you think we handle your data incorrectly, tell us first so we can put it right. You may also lodge a complaint with the Belgian Data Protection Authority (Gegevensbeschermingsautoriteit / Autorité de protection des données), Drukpersstraat 35, 1000 Brussels, [www.dataprotectionauthority.be](https://www.dataprotectionauthority.be).",
        },
      ],
    },
  ],
};

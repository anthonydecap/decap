/** Software overview (Prismic page "software"): Virtual Orchestrion and MIDIMapper. German. */
export default {
  type: "page",
  uid: "software",
  lang: "de-de",
  title: "Software",
  theme: "decap",
  meta_title: "Software für Orgel und Orchestrion | Decap Herentals",
  meta_description:
    "Virtual Orchestrion spielt Ihre Decap-Instrumente und QRS-Klaviere. Mit MIDIMapper hören Arrangeure Orgel-Arrangements mit echten Samples. Gratis testen.",
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Software",
        title: "Software für Orchestrien, Orgeln und Arrangeure",
        intro:
          "Die Software, die unsere Instrumente steuert, schreiben wir selbst. Virtual Orchestrion spielt sie. MIDIMapper lässt Arrangeure hören, was sie schreiben, bevor es die Orgel erreicht.",
        primary_cta_label: "Virtual Orchestrion",
        primary_cta_link: "/virtual-orchestrion",
        secondary_cta_label: "MIDIMapper",
        secondary_cta_link: "/midimapper",
        image_brief: "Laptop on a workbench showing Virtual Orchestrion, an organ façade out of focus behind it, portrait 4:5",
      },
    },
    {
      type: "site_card_grid",
      primary: {
        eyebrow: "Zwei Programme",
        title: "Eines zum Spielen, eines zum Arrangieren",
        columns: "2",
        card_style: "Image cards",
      },
      items: [
        {
          tag: "Player",
          title: "Virtual Orchestrion",
          body: "Der Player für Decap-Instrumente und QRS-Klaviere. Ergänzt fehlende Register virtuell, sodass eine kleinere Orgel größere Skalen spielt. Bindet bis zu 8 VSTi- und 8 DXi-Instrumente ein. Erhältlich im Shop.",
          link_label: "Virtual Orchestrion",
          link: "/virtual-orchestrion",
          image_brief: "Screenshot of Virtual Orchestrion's animated orchestrion view, 4:3",
        },
        {
          tag: "Für Arrangeure",
          title: "MIDIMapper",
          body: "Leitet MIDI aus Ihrer DAW auf echte Orgel-Samples. So hören Sie ein Arrangement mit Registrierungen statt mit General-MIDI-Klängen. Bis zu 12 Ebenen pro Map, 64 Kanäle und WAV-Export.",
          price: "150 € zzgl. MwSt.",
          link_label: "MIDIMapper und kostenlose Testversion",
          link: "/midimapper",
          image_brief: "Screenshot of the MIDIMapper map editor on a laptop, 4:3",
        },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Musik-Shop",
        title: "Arrangements für den Player: in Kürze",
        body:
          "Bald verkauft unser Shop auch Arrangements für Decap-Instrumente, aus unserer eigenen Bibliothek und von unabhängigen Arrangeuren. Jede Datei wird kopiergeschützt und für Virtual Orchestrion aufbereitet, damit sie auf den angeschlossenen Instrumenten spielt.\n\nSie arrangieren für Decap-Instrumente? [Melden Sie Ihr Interesse an](/contact).",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        cta_label: "Zum Shop",
        cta_link: "/shop",
        image_brief: "Virtual Orchestrion playing an arrangement in book view, screen filling the frame, 4:3",
        tone: "Tinted",
      },
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "Sie arrangieren für Orgel?",
        title: "Testen Sie MIDIMapper kostenlos",
        body: "Laden Sie die Testversion herunter, verbinden Sie sie mit Ihrer DAW und hören Sie Ihr Arrangement mit echten Orgel-Samples.",
        price: "150 €",
        price_note: "zzgl. MwSt., Vollversion",
        primary_cta_label: "Kostenlose Testversion laden",
        primary_cta_link: "/software/midi-mapper",
        secondary_cta_label: "Über MIDIMapper",
        secondary_cta_link: "/midimapper",
        tone: "Dark band",
      },
    },
  ],
};

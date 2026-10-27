/** Organs page (Prismic page "organs"): the core business, new dance, fair, street and concert organs. German. */
export default {
  type: "page",
  uid: "organs",
  lang: "de-de",
  title: "Orgeln",
  theme: "decap",
  meta_title: "Echte Tanzorgeln nach Maß | Decap Herentals",
  meta_description:
    "Echte Tanzorgeln von Decap Herentals: dynamisches Schlagzeug, Winddruck je Windlade, Lautstärkeregelung. Modular oder nach Maß, Pfeifen, digital oder beides.",
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Orgelbauer seit 1895",
        title: "Echte Tanzorgeln, gebaut in Herentals",
        intro:
          "Decap Herentals baut Tanzorgeln: Orgeln, zu denen Menschen tanzen, mit einer Dynamik und Lautstärkeregelung, die keine mechanische Orgel hat. Sie starten mit unseren bewährten Modulen oder lassen jedes Detail nach Maß fertigen. Pfeifen, digitaler Klang oder beides, mit den Frontinstrumenten, die Decap-Orgeln seit 1933 tragen. Decap-Orgeln spielen auf der ganzen Welt, von Japan bis in die USA und nach Australien.",
        primary_cta_label: "Orgel zusammenstellen",
        primary_cta_link: "/organ-composer",
        secondary_cta_label: "Beratung anfragen",
        secondary_cta_link: "/contact",
        note: "Decap Herentals seit 1933. Vierte Generation, eine Werkstatt, Orgeln auf der ganzen Welt.",
        image_brief:
          "A finished Decap dance organ façade, shot straight on from chest height with the whole front in frame, lights on, room lights dimmed; portrait 4:5",
      },
    },
    {
      type: "site_card_grid",
      primary: {
        eyebrow: "Drei Wege zu Ihrer Orgel",
        title: "Sie bestimmen, wie viel Sie selbst entwerfen",
        intro:
          "Die meisten Orgeln beginnen an einem von drei Punkten. Sie wissen nicht, welcher zu Ihnen passt? Beschreiben Sie den Raum und die Musik, und wir schlagen einen Weg vor.",
        columns: "3",
        card_style: "Image cards",
      },
      items: [
        {
          tag: "Modular",
          title: "Aus unseren Modulen gebaut",
          body: "Sie wählen aus bewährten Modulen: Skala, Register, Frontinstrumente und Fassade. Sie erhalten einen gut erprobten Entwurf und sehen das Ergebnis, bevor die Produktion beginnt.",
          link_label: "Im Organ Composer starten",
          link: "/organ-composer",
          image_brief: "Existing 3D render of a modular Decap dance organ, front three-quarter view, plain background, 4:3",
        },
        {
          tag: "Maßgefertigt",
          title: "Komplett maßgefertigt",
          body: "Jedes Detail für Ihren Raum, Ihre Musik und Ihr Budget entworfen: Gehäuse, Skala, Stimmen, Frontinstrumente und Steuerung. Wir zeichnen die Orgel, erstellen ein 3D-Rendering und bauen sie.",
          link_label: "Beratung anfragen",
          link: "/contact",
          image_brief: "Existing 3D render of a bespoke Decap concert or street organ, front view, plain background, 4:3",
        },
        {
          tag: "Restaurieren oder nachrüsten",
          title: "Ihre vorhandene Orgel",
          body: "Historische Orgeln mit Notenbuch oder Notenrolle restauriert Atelier Frank Decap, das Atelier von Tonys Bruder. Unsere MIDI-Umbaueinheiten ergänzen MIDI, während Notenbuch oder Notenrolle weiter funktionieren.",
          link_label: "Atelier Frank Decap",
          link: "/frank-decap",
          image_brief: "An open historic book organ in the workshop, key frame and tubing visible, warm side light, 4:3",
        },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Was wir bauen",
        title: "Zuerst Tanzorgeln",
        body:
          "### Tanzorgeln\nDas, was wir normalerweise bauen. Zwischen 1960 und 1980 hatten rund 120 Tanzcafés und Tanzsäle in Belgien jeweils eine Tanzorgel, und die Menschen kamen jeden Tag zum Tanzen. Heute spielen Decap-Tanzorgeln in Wohnzimmern, Cafés und Tanzsälen und auf der Bühne: Anschlagempfindlichkeit und Lautstärke lassen sich regeln, so passen sie in den Raum, statt ihn zu übertönen. Deshalb konnte Guido Belcanto 2008 mit einer davon in seiner Theatershow *Balzaal der Gebroken Harten* auf Tournee gehen.\n\n### Straßen- und Jahrmarktorgeln\nWir haben sie gebaut, und wir können auch für Sie eine bauen, aber in unserer Werkstatt sind sie die Ausnahme.\n\n### Kirchen- und Konzertorgeln\n2025 haben wir smARTvalve in die erste transportable Kirchenorgel eingebaut, mit einzeln gesteuerten Pfeifen. Diese Orgel ist [L'Explorateur](/work/yves-rechsteiner), die mobile Konzertorgel des Schweizer Organisten Yves Rechsteiner.",
        media_side: "Image right",
        aspect: "Portrait 4:5",
        image_brief:
          "A Decap dance organ in use in a café or dance hall, people in soft focus in front, taken from the side of the room; portrait 4:5",
      },
      items: [
        { point: "Modular oder komplett maßgefertigt, als Einheiten in einer Fassade gebaut: transportabel und wieder aufbaubar" },
        { point: "Standardskalen mit 105 und 121 Tasten, andere Größen möglich" },
        { point: "Pfeifen, digitaler Klang oder beides kombiniert" },
        { point: "Im Einsatz auf der ganzen Welt: Japan, USA, Australien, Asien und Europa" },
      ],
    },
    {
      type: "site_statement",
      primary: {
        eyebrow: "Warum eine Decap anders spielt",
        statement: "Die ersten Orchestrien wurden gebaut, um wie ein echtes Orchester zu klingen. In der Blütezeit der Tanzorgel gaben alle diesen Anspruch auf. *Wir nie.*",
        caption:
          "Im 19. Jahrhundert arbeiteten Hersteller wie Limonaire und Wurlitzer daran, ihre mechanischen Orchester näher an echte Musiker heranzubringen, die mit Gefühl und Nuancen spielen. Als die Menschen den mechanischen Klang selbst lieben lernten, endete diese Arbeit. Wir sind zuerst Musiker, deshalb haben wir in den letzten 50 Jahren weitergemacht: Orgeln, die mit Gefühl und Nuancen spielen, vom Wohnzimmer bis zur Bühne.",
      },
    },
    {
      type: "site_orchestra",
      primary: {
        eyebrow: "MIDI, voll ausgenutzt",
        title: "Jedes Instrument seine eigene Stimme",
        intro:
          "Wir haben als Erste eine Orgel auf MIDI gebracht. Die meisten Orgeln nutzen MIDI heute nur als Ersatz für das Notenbuch, mehr nicht. Eine Decap-Orgel nutzt alles: Jede Instrumentengruppe bekommt ihre eigene Stimme, mit weichen und harten Tönen.",
        book_label: "Notenbuch oder einfaches MIDI",
        decap_label: "Decap-Orgel",
        book_caption:
          "Das Notenbuch entscheidet. Instrumente auf derselben Spur folgen derselben Linie, und jeder Ton klingt gleich stark.",
        decap_caption:
          "Jede Instrumentengruppe hat ihre eigene MIDI-Adresse und ihre eigene Stimme: Das Saxophon spielt die Melodie, die Violinen eine Gegenmelodie, das Klavier weich und hart.",
        note: "Beispielarrangement. Höhe und Helligkeit der Noten zeigen, wie stark jeder Ton gespielt wird.",
        tone: "Dark band",
      },
      items: [
        { instrument: "Saxophon", address: "Port 3 · Kan. 1", role: "Melodie" },
        { instrument: "Flöte 8′", address: "Port 6 · Kan. 2", role: "Verzierungen" },
        { instrument: "Violinen", address: "Port 7 · Kan. 12", role: "Gegenmelodie" },
        { instrument: "Klavier", address: "Port 1 · Kan. 1", role: "Begleitung" },
        { instrument: "Schlagwerk", address: "Port 9 · Kan. 10", role: "Akzente" },
      ],
    },
    {
      type: "site_bento",
      primary: {
        eyebrow: "Im Inneren einer Decap-Orgel",
        title: "Keine Mechanik. Alles digital.",
        intro:
          "Prozessoren und Chips steuern jeden Teil einer Decap-Orgel. Deshalb kann sie weich und hart spielen, ihren Wind verändern und in jeden Raum passen.",
      },
      items: [
        {
          size: "Large",
          style: "Dark",
          visual: "Ports",
          value: "16",
          value_label: "MIDI-Ports serienmäßig",
          title: "256 eigene Adressen",
          body: "16 Ports mit je 16 Kanälen. Jede Instrumentengruppe bekommt ihre eigene Adresse, so kann ein Arrangeur für jede eine echte Stimme schreiben.",
        },
        {
          size: "Small",
          style: "Light",
          visual: "Velocity",
          value: "1–127",
          value_label: "Anschlagstärken",
          title: "Weich oder hart, je Ton",
          body: "Bei einer traditionellen Orgel schlägt der Trommelstock immer mit derselben Kraft. Bei einer Decap-Orgel schlägt er weich oder hart, mit einstellbarem Timing.",
        },
        {
          size: "Small",
          style: "Light",
          visual: "Wind",
          title: "Winddruck je Windlade",
          body: "Unterschiedliche Intensitäten je Windlade, und Register, die Vibrato spielen.",
        },
        {
          size: "Wide",
          style: "Accent",
          visual: "Chip",
          title: "Hinter jedem Teil ein Prozessor",
          body: "Keine luftbetriebene Mechanik: Jede Trommel, jedes Ventil und jedes Register wird digital gesteuert. Erst das macht weiche und harte Töne, Windregelung und Lautstärkeregelung möglich.",
        },
        {
          size: "Small",
          style: "Light",
          title: "Lautstärke, die Sie regeln",
          body: "Leise im Wohnzimmer, voll im Theater, laut genug für ein DJ-Set.",
        },
        {
          size: "Small",
          style: "Dark",
          visual: "Pipe",
          title: "smARTvalve: Jede Pfeife ihr eigener Wind",
          body: "Unsere neueste Entwicklung bringt die Windregelung bis zu jeder einzelnen Pfeife.",
          link_label: "So funktioniert smARTvalve",
          link: "/smartvalve",
        },
        {
          size: "Wide",
          style: "Light",
          title: "Alle Software aus eigener Hand",
          body: "Die CNC-Programme, mit denen wir unsere Pfeifen fräsen, die Software, die die Orgel steuert, und der Virtual Orchestrion Player: alles in Herentals entwickelt.",
          link_label: "Unsere Software",
          link: "/software",
        },
      ],
    },
    {
      type: "site_compare",
      primary: {
        eyebrow: "Vergleich",
        title: "Notenbuchorgel, einfaches MIDI oder eine Decap-Orgel",
        col1: "Notenbuchorgel",
        col1_note: "Spielt von einem Notenbuch aus Karton",
        col2: "Einfache MIDI-Umrüstung",
        col2_note: "MIDI ersetzt das Notenbuch",
        col3: "Decap-Orgel",
        col3_note: "MIDI voll ausgenutzt",
        highlight: "3",
        highlight_label: "Decap",
        tone: "Tinted",
      },
      items: [
        { feature: "Steuerung", col1: "Mechanisch und pneumatisch", col2: "Mechanisch, mit elektronischem Leser", col3: "Volldigital: Prozessoren und Chips" },
        { feature: "MIDI-Ports", col1: "nein", col2: "Meist 1", col3: "16 serienmäßig" },
        { feature: "Eigene Stimme je Instrumentengruppe", col1: "nein", col2: "nein", col3: "ja" },
        { feature: "Weiche und harte Töne", col1: "nein", col2: "nein", col3: "ja" },
        { feature: "Winddruck und Vibrato regelbar", col1: "nein", col2: "nein", col3: "Je Windlade, mit smARTvalve je Pfeife" },
        { feature: "Lautstärkeregelung", col1: "nein", col2: "nein", col3: "ja" },
        { feature: "Repertoire", col1: "Für diese Orgel gestanzte Notenbücher", col2: "MIDI-Dateien, im Rahmen der Notenbuchskala", col3: "Arrangements für die ganze Orgel; fehlende Register virtuell ergänzt" },
      ],
    },
    {
      type: "site_card_grid",
      primary: {
        eyebrow: "Klang",
        title: "Pfeifen, digital oder beides",
        intro:
          "1977 baute François Decap die erste digitale Tanzorgel. So konnten sich auch Tanzsäle und Cafés mit viel kleinerem Budget eine Orgel leisten. Heute wählen Sie die Mischung.",
        columns: "3",
        card_style: "Text cards",
      },
      items: [
        {
          title: "Pfeifen",
          body: "Holzpfeifen, gefräst auf unserer eigenen 5-Achs-CNC: Bourdons, Flöten, Violinen, Jazzflöten, Vibratons, Baritons und Trompeten. [Zu unseren Orgelpfeifen](/organ-pipes).",
        },
        {
          title: "Digital",
          body: "Digitaler Klang statt Pfeifen: weniger Platz und ein kleineres Budget. Der Weg, der Orgeln 1977 in Cafés und Tanzsäle brachte.",
        },
        {
          title: "Pfeifen und digital kombiniert",
          body: "Echte Pfeifen und digitaler Klang in einer Orgel. Wir beraten Sie, welche Stimmen sich für Ihren Raum und Ihr Budget in Holz lohnen.",
        },
      ],
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Frontinstrumente",
        title: "Akkordeons auf Decap-Orgeln seit 1933",
        body:
          "Im Jahr, in dem Frans Decap Decap Herentals gründete, erschienen die ersten selbstspielenden Akkordeons auf Decap-Orgeln. Das ist bis heute so. Die Front einer Decap-Orgel kann tragen:\n\n- ein echtes Akkordeon, gespielt von der Orgel\n- ein Schlagzeug\n- Perkussion wie Woodblock, Tamburin und Kuhglocke\n- bewegliche Figuren\n\nDiese Instrumente bauen wir auch als eigenständige selbstspielende Musikinstrumente. So ist jedes für sich erprobt, bevor es in eine Orgel kommt. [Zu unseren Instrumenten](/instruments).",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        cta_label: "Selbstspielendes Akkordeon",
        cta_link: "/accordion",
        image_brief:
          "Close-up of the accordion and drums in the front of a Decap organ, taken at eye level from slightly to one side, background out of focus; 4:3",
        tone: "Tinted",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "Tasten sind keine Grenze",
        title: "Eine Orgel mit 105 Tasten, die auch Musik für 121 Tasten spielt",
        body:
          "Unsere Standardskalen haben 105 und 121 Tasten, doch die Skala muss Ihr Repertoire nicht begrenzen. Jede neue Decap-Orgel wird mit unserem Virtual-Orchestrion-Player geliefert. Verlangt ein Arrangement Register, die Ihre Orgel nicht hat, ergänzt der Player sie virtuell, mit Samples, die wir in unserer eigenen Werkstatt aufgenommen haben, und mit VST-Instrumenten.\n\nSeit 2000 spielt eine Decap-Orgel ihre Musik von einer einzigen digitalen Karte statt aus Regalen voller Kartonnoten. Wenn Sie das Notenbuch vermissen, zeigt der Player es auf dem Bildschirm, während die Orgel spielt. Wählen Sie die Orgel, die zu Ihrem Raum und Budget passt, nicht die, die zu Ihrer Musik passt.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        cta_label: "Mehr über Virtual Orchestrion",
        cta_link: "/virtual-orchestrion",
        image_brief:
          "Virtual Orchestrion running on a touchscreen beside an organ, the animated book view visible on screen; 4:3",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "smARTvalve",
        title: "Ausdruck auf jeder Pfeife",
        body:
          "Den Winddruck je Windlade stellen wir seit Jahren ein. smARTvalve macht das je Pfeife: ein Ventil und ein Prozessor für jede Pfeife. Jede Pfeife erhält ihren eigenen gespeicherten Winddruck, von 0 bis 200 %, mit 4 ms Reaktionszeit. Das ermöglicht Dynamik, Vibrato, Slope und Decay pro Ton, gespielt über MIDI.\n\nDiese Technik steckt in der transportablen Kirchenorgel von 2025, der ersten Orgel, die wir Windsynthesizer nennen.",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        cta_label: "So funktioniert smARTvalve",
        cta_link: "/smartvalve",
        image_brief: "Close-up of a row of smARTvalves on a wind chest, dark background, low side light; 4:3",
        tone: "Dark band",
      },
    },
    {
      type: "site_steps",
      primary: {
        eyebrow: "So läuft es ab",
        title: "Vom ersten Gespräch bis zum ersten Tanz",
        intro: "Fünf Schritte, und Sie sehen Ihre Orgel, bevor wir sie bauen.",
      },
      items: [
        {
          title: "Beratung",
          body: "Erzählen Sie uns, wo die Orgel spielen wird, wer zuhört und welche Musik Sie lieben. Wir fragen nach Raum, Transport und Budget und schlagen einen Weg vor: modular, maßgefertigt oder eine Mischung. Mit dem [Organ Composer](/organ-composer) schicken Sie uns schnell einen Ausgangspunkt.",
          image_brief: "Tony Decap at a workbench talking with a visitor, organ parts in the background, 4:3",
        },
        {
          title: "Entwurf und 3D-Rendering",
          body: "Wir zeichnen die Orgel und erstellen ein 3D-Rendering: Gehäuse, Fassade, Frontinstrumente und Skala. Sie sehen, wie sie aussehen wird, bevor etwas gefertigt wird, und wir passen den Entwurf gemeinsam mit Ihnen an.",
          image_brief: "A 3D render of an organ on a computer screen in the workshop office, screen filling most of the frame, 4:3",
        },
        {
          title: "Produktion",
          body: "Wir bauen die Orgel in unserer Werkstatt in Herentals: Gehäuse, Windsystem, Pfeifen von unserer eigenen CNC, Frontinstrumente und Elektronik. Während des Baus besuchen Sie die Werkstatt mehrmals und sehen den Stand Ihrer Orgel.",
          image_brief: "An organ case under construction in the Herentals workshop, tools and timber around it, wide shot, 4:3",
        },
        {
          title: "Intonation",
          body: "Jede Pfeife und jede Stimme wird intoniert und gestimmt, damit die Orgel als Ganzes stimmig klingt, in der Lautstärke, die Ihr Raum braucht.",
          image_brief: "Hands voicing a wooden pipe on the voicing bench, close-up, warm light, 4:3",
        },
        {
          title: "Lieferung",
          body: "Wir liefern die Orgel spielbereit, mit dem Virtual-Orchestrion-Player und Ihrer Musik auf Karte. Eine Garantie ist immer inbegriffen. Versand und Installation hängen vom Projekt ab, in Belgien oder im Ausland.",
          image_brief: "A finished organ being wheeled out of the workshop doors or loaded into a van, 4:3",
        },
      ],
    },
    {
      type: "site_faq",
      primary: {
        eyebrow: "Fragen",
        title: "Bevor Sie eine Orgel bestellen",
      },
      items: [
        {
          question: "Was kostet eine neue Orgel?",
          answer:
            "Jede Orgel erhält ein eigenes Angebot, denn der Preis folgt Ihren Entscheidungen: Größe, Pfeifen oder digitaler Klang, Frontinstrumente, Fassade. Eine digitale oder modulare Orgel kostet weniger als eine maßgefertigte Pfeifenorgel, und Sie können vorhandene Pfeifen oder Instrumente weiterverwenden. Schicken Sie uns Ihren Ausgangspunkt, und wir antworten mit einer ersten Idee und einem Angebot.",
        },
        {
          question: "Bauen Sie auch Straßenorgeln und Jahrmarktorgeln?",
          answer:
            "Ja, wir haben sie gebaut und können auch für Sie eine bauen. Normalerweise bauen wir aber echte Tanzorgeln, mit dem dynamischen Schlagzeug, der Windregelung und der Lautstärkeregelung, durch die sie in Wohnzimmern und auf der Bühne ebenso spielen wie in Tanzsälen.",
        },
        {
          question: "Was ist der Unterschied zwischen 105 und 121 Tasten?",
          answer:
            "Die Zahl der Tasten bestimmt, wie viele Töne und Register die Orgel hat und welche Musik sie so spielt, wie sie geschrieben ist. Mit unserem Virtual-Orchestrion-Player spielt eine Orgel mit 105 Tasten auch Musik für 121 Tasten: Fehlende Register werden virtuell ergänzt.",
        },
        {
          question: "Soll ich Pfeifen oder digitalen Klang wählen?",
          answer:
            "Pfeifen bringen den echten Klang von Wind in Holz. Digitaler Klang braucht weniger Platz und ein kleineres Budget. Pfeifen und digital kombiniert liegen dazwischen. Erzählen Sie uns von Raum und Musik, und wir beraten Sie.",
        },
        {
          question: "Woher kommt die Musik?",
          answer:
            "Von einer digitalen Karte im Virtual-Orchestrion-Player: eine ganze Musikbibliothek statt Regalen voller Notenbücher. Kopiergeschützte Arrangements in unserem Shop folgen in Kürze. Sie können die Orgel auch live über MIDI spielen.",
        },
        {
          question: "Liefern Sie Orgeln auch außerhalb Belgiens?",
          answer:
            "Ja. Decap-Orgeln spielen auf der ganzen Welt: in Japan, den USA, Australien, Asien und in ganz Europa. Versand und Installation sind Teil des Angebots und hängen vom Projekt ab. Eine Garantie ist immer inbegriffen.",
        },
        {
          question: "Können Sie meine alte Orgel restaurieren oder mit MIDI nachrüsten?",
          answer:
            "Die Restaurierung übernimmt [Atelier Frank Decap](/frank-decap), das Atelier von Tonys Bruder. Unsere [MIDI-Umbaueinheiten](/midi-conversion) rüsten Orgeln mit Notenbuch oder Notenrolle mit MIDI nach, während Notenbuch oder Notenrolle weiter funktionieren.",
        },
        {
          question: "Sind Sie dasselbe Unternehmen wie Gebroeders Decap in Antwerpen?",
          answer:
            "Nein. Beide gehen auf denselben Gründer zurück, Aloïs Decap. Decap Herentals wurde 1933 von seinem Sohn Frans gegründet und wird heute von Tony Decap geführt. Die beiden Unternehmen sind unabhängig und einander freundschaftlich verbunden.",
        },
      ],
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "Sie planen eine Orgel?",
        title: "Beginnen Sie mit einem Entwurf und ein paar Entscheidungen",
        body: "Wählen Sie im Organ Composer einen Ausgangsentwurf und sagen Sie uns, wo die Orgel spielen wird. Wir antworten mit Fragen und einer ersten Idee, unverbindlich.",
        primary_cta_label: "Orgel zusammenstellen",
        primary_cta_link: "/organ-composer",
        secondary_cta_label: "Werkstatt kontaktieren",
        secondary_cta_link: "/contact",
        tone: "Dark band",
      },
    },
  ],
};

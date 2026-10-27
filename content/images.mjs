/**
 * Images placed in the pages (old WordPress images, Decap photos, artist portraits). Keys: page uid → slot.
 * Slot "3" = slices[3].primary.image, "1.2" = slices[1].items[2].image.
 * { url, alt } uploads an image from a URL, { file, alt } a local photo from content/media (not
 * committed; uploaded once, then reused by filename); { artist, alt } reuses that artist's portrait from
 * the artist slider on the home page. Used by scripts/content/migrate.mjs.
 */
export default {
  "home": {
    "0": {
      "file": "content/media/decap-balzaal-der-gebroken-harten-organ.jpg",
      "alt": "The Belcanto dance organ by Decap on stage in a Belgian cultural centre"
    },
    "1.0": {
      "file": "content/media/decap-tony-decap-and-francois-decap-belcanto-orgel-without-facade.jpg",
      "alt": "Tony and François Decap with a dance organ in the Herentals workshop"
    },
    "1.1": {
      "file": "content/media/decap-concert-pianist-and-red-accordion.jpg",
      "alt": "A self-playing red accordion on a pedestal, on stage with a pianist"
    },
    "1.2": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/20221008_mohaibalazs_074-3-2.png",
      "alt": "Rows of wooden organ pipe parts from the CNC"
    },
    "1.3": {
      "file": "content/media/decap-smartvalve-samples.jpg",
      "alt": "smARTvalves with their electronics"
    },
    "1.4": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/10/TROMBONE-Samenstelling_01_2023-Oct-16_10-42-03PM-000_CustomizedView21586800008.png",
      "alt": "Brass Core on a trombone"
    },
    "1.5": {
      "file": "content/media/decap-frank-decap-organ-restoration-workshop-in-warm-light.jpg",
      "alt": "Restoration in progress in Atelier Frank Decap"
    },
    "1.6": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/Virtual-Organ-5-1.png",
      "alt": "Virtual Orchestrion on two screens"
    },
    "2.0": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/Products-AccordionPedestal-05.jpg",
      "alt": "Accordion Pedestal with a real accordion"
    },
    "2.1": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/11/Products-Orchestrion-Complete-Notenkraker-01-1.jpg",
      "alt": "Pearl-white Decap orchestrion with accordion and drums"
    },
    "2.2": {
      "file": "content/media/decap-beat-machine-dance-organ.jpg",
      "alt": "A Decap dance organ with drums, accordions and pipes on a lit stage"
    },
    "2.3": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/20221008_mohaibalazs_074-1-1.jpeg",
      "alt": "The orchestrion room at the House of Music Hungary, Budapest"
    }
  },
  "instruments": {
    "0": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/11/Products-Orchestrion-Complete-Two-Acc-01.jpg",
      "alt": "Decap orchestrion with two accordions, drums and pipes"
    },
    "2": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/Products-AccordionPedestal-01a-1-1.png",
      "alt": "Render of the Accordion Cube"
    },
    "3": {
      "file": "content/media/decap-concert-pianist-and-red-accordion.jpg",
      "alt": "A pianist and a self-playing accordion performing together"
    },
    "4": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/VirtualPlayerLaptop1-1.png",
      "alt": "Virtual Orchestrion on a laptop"
    },
    "1.0": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/Products-AccordionPedestal-01a-2.png",
      "alt": "Render of the Accordion Pedestal"
    },
    "1.1": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/Products-AccordionPedestal-01a-2-1.png",
      "alt": "Render of the Pipe Cube"
    },
    "1.2": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/Products-AccordionPedestal-03-1-3.png",
      "alt": "Render of the Percussion Unit"
    },
    "1.3": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/Products-AccordionPedestal-02-1-3.png",
      "alt": "Render of the automated xylophone"
    },
    "1.4": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/09/52-Key_Chromatic_V01_2023-Sep-02_09-57-35PM-000_Customiz23edView816123377037.png",
      "alt": "Render of the hand-turned Bellow Organ"
    }
  },
  "bellow-organ": {
    "0": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/10/45-Key_Chromatic_V01_v14_2023-Oct-16_10-02-07PM-000_CustomizedView3947186824.png",
      "alt": "Render of the Bellow Organ with its crank"
    },
    "1": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/09/52-Key_Chromatic_V01_2023-Sep-02_09-57-35PM-000_Customiz23edView816123377037.png",
      "alt": "Render of the Bellow Organ, front view"
    },
    "2": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/10/45-Key_Chromatic_V01_v14_2023-Oct-16_10-02-58PM-000_CustomizedView42092905668.png",
      "alt": "Render of the Bellow Organ frame and panels"
    },
    "3": {
      "file": "content/media/decap-smartvalves-in-their-windchest.jpg",
      "alt": "smARTvalves mounted in a wind chest"
    }
  },
  "midi-conversion": {
    "0": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/09/Products-Switching-Valve-01-Hersteld.png",
      "alt": "Decap double-valve MIDI unit"
    }
  },
  "midimapper": {
    "0": {
      "url": "https://orchestrionix.com/wp-content/uploads/2026/04/midimapper-desktop.png",
      "alt": "MIDIMapper on a laptop and a desktop screen"
    },
    "1": {
      "url": "https://orchestrionix.com/wp-content/uploads/2026/04/MidiMapperLaptop1-1.png",
      "alt": "MIDIMapper map editor"
    }
  },
  "software": {
    "0": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/Virtual-Organ-5-1.png",
      "alt": "Virtual Orchestrion on two screens"
    },
    "2": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/VirtualPlayerLaptop1-1.png",
      "alt": "Virtual Orchestrion book view on a laptop"
    },
    "1.0": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/Group-77.png",
      "alt": "Virtual Orchestrion orchestrion and book view"
    },
    "1.1": {
      "url": "https://orchestrionix.com/wp-content/uploads/2026/04/MidiMapperLaptop1-1.png",
      "alt": "MIDIMapper map editor"
    }
  },
  "virtual-orchestrion": {
    "0": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/decap-home-img3.png",
      "alt": "Virtual Orchestrion: orchestrion view and book view"
    },
    "1": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/VirtualPlayerLaptop1-1.png",
      "alt": "Virtual Orchestrion on a laptop"
    },
    "2": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/Virtual-Organ-5-1.png",
      "alt": "Virtual Orchestrion on two screens"
    }
  },
  "orchestrionix": {
    "0": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/10/TROMBONE-Samenstelling_01_2023-Oct-16_10-42-03PM-000_CustomizedView21586800008.png",
      "alt": "Brass Core on a trombone"
    },
    "1": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/Rectangle-62-1-3.png",
      "alt": "Close-up of Brass Core on a trumpet"
    }
  },
  "organ-composer": {
    "1.0": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/10/Model_V02_2023-Oct-16_11-15-28PM-000_CustomizedView27364077015.png",
      "alt": "Render of a modular Decap dance organ"
    },
    "1.1": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/10/ST.ORG_._SAMENBOUW_INSTRUMENTEN-001_OrigineelSteven_2023-Aug-16_09-45-31PM-000_CustomizedView4140936227.png",
      "alt": "Render of a modular Decap dance organ with a name panel"
    },
    "1.2": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/10/cb0efde8-a27a-48f1-afd3-afb5a1fb60d2.png",
      "alt": "Render of the bespoke organ Isabella"
    },
    "1.3": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/10/Trailer_2023-Oct-07_10-13-09PM-000_CustomizedView1077535285-1.png",
      "alt": "Render of a bespoke Decap orchestrion"
    }
  },
  "organ-pipes": {
    "0": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/20221008_mohaibalazs_074-3-2.png",
      "alt": "Rows of wooden organ pipe parts from the CNC"
    },
    "4": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/20221008_mohaibalazs_074-2-1.png",
      "alt": "Wooden pipe parts milled on the CNC"
    }
  },
  "organs": {
    "0": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/10/ST.ORG_._SAMENBOUW_INSTRUMENTEN-001_OrigineelSteven_2023-Aug-16_09-45-31PM-000_CustomizedView4140936227.png",
      "alt": "Render of a Decap dance organ"
    },
    "2": {
      "file": "content/media/decap-balzaal-der-gebroken-harten-organ.jpg",
      "alt": "A Decap dance organ on stage"
    },
    "8": {
      "file": "content/media/decap-beat-machine-dance-organ.jpg",
      "alt": "Drums, accordions and pipes in the front of a Decap dance organ"
    },
    "9": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/decap-home-img3.png",
      "alt": "Virtual Orchestrion screens"
    },
    "10": {
      "file": "content/media/decap-smartvalves-in-their-windchest.jpg",
      "alt": "smARTvalves mounted in their wind chest"
    },
    "1.0": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/10/Model_V02_2023-Oct-16_11-15-28PM-000_CustomizedView27364077015.png",
      "alt": "Render of a modular Decap organ"
    },
    "1.1": {
      "file": "content/media/decap-stained-glass-facade-panel-dancers.jpg",
      "alt": "Lit stained-glass façade panel with a line of dancers, made for a bespoke Decap organ"
    },
    "1.2": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/20221008_mohaibalazs_074-2.jpeg",
      "alt": "Historic Decap orchestrion façade"
    },
    "11.1": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/10/Trailer_2023-Oct-07_10-13-09PM-000_CustomizedView1077535285-1.png",
      "alt": "3D render of a Decap orchestrion"
    },
    "11.0": {
      "file": "content/media/decap-tony-decap-and-francois-decap-belcanto-orgel-without-facade.jpg",
      "alt": "Tony Decap discussing an organ in the workshop"
    },
    "11.2": {
      "file": "content/media/decap-topside-of-a-valve-panel.jpg",
      "alt": "A valve panel in production in the Herentals workshop"
    },
    "11.4": {
      "file": "content/media/decap-frank-decap-antique-organ-loaded-into-van.jpg",
      "alt": "An organ being loaded into a van for delivery"
    }
  },
  "about": {
    "0": {
      "file": "content/media/decap-tony-decap-and-francois-decap-belcanto-orgel-without-facade.jpg",
      "alt": "Tony Decap and François Decap in the Herentals workshop in front of an organ without its façade"
    },
    "1": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/image-6-1.png",
      "alt": "Archive photos: an early Decap delivery truck, a Monte Carlo organ and a family portrait"
    },
    "4": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/20221008_mohaibalazs_074-2.jpeg",
      "alt": "Historic Decap orchestrion façade with the Decap name"
    },
    "5": {
      "file": "content/media/decap-tony-decap-and-frank-decap-brothers.jpg",
      "alt": "Tony Decap and Frank Decap, brothers, in DECAP jackets"
    },
    "6": {
      "file": "content/media/decap-topside-of-a-valve-panel.jpg",
      "alt": "A CNC-milled valve panel in the Herentals workshop"
    },
    "3.9": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/Products-AccordionPedestal-05.jpg",
      "alt": "Accordion Pedestal"
    },
    "3.11": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/20221008_mohaibalazs_074-2-1.png",
      "alt": "Organ pipe parts from the CNC"
    },
    "3.12": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/20221008_mohaibalazs_074-2-2.jpeg",
      "alt": "A stage production with L'Explorateur"
    },
    "3.6": {
      "file": "content/media/decap-old-retro-of-francois-decap-and-the-delivery-of-a-new-organ.jpg",
      "alt": "Archive photo: François Decap at the delivery of a new organ"
    },
    "3.10": {
      "file": "content/media/decap-guido-belcanto-balzaal-der-gebroken-harten-poster.jpg",
      "alt": "Poster of Balzaal der Gebroken Harten: Guido Belcanto dancing in front of the Decap organ"
    }
  },
  "work": {
    "1.0": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/Rectangle-68.png",
      "alt": "The Accordion castle"
    },
    "1.1": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/11/Products-AccordionPedestal-06.jpg",
      "alt": "Pearl-white Accordion Pedestal"
    },
    "1.2": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/11/Products-Orchestrion-Complete-Notenkraker-01-1.jpg",
      "alt": "Pearl-white orchestrion"
    },
    "1.3": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/11/Products-Orchestrion-Complete-Two-Acc-01.jpg",
      "alt": "Orchestrion with two accordions"
    },
    "1.4": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/10/cb0efde8-a27a-48f1-afd3-afb5a1fb60d2.png",
      "alt": "Orchestrion Isabella, rounded 70's design"
    },
    "1.5": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/10/Trailer_2023-Oct-07_10-13-09PM-000_CustomizedView1077535285-1.png",
      "alt": "Orchestrion, trailer design"
    },
    "1.6": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/09/PIJPUNIT_2023-Sep-10_01-34-16PM-000_CustomizedView4543563871_small.png",
      "alt": "Render of a Pipe Cube"
    },
    "1.7": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/decap-protfolio-img2.png",
      "alt": "Decap organ with lit façade"
    },
    "3.0": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/image-6-1.jpeg",
      "alt": "A stage production with L'Explorateur"
    },
    "3.1": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/20221008_mohaibalazs_074-2-1.jpeg",
      "alt": "Stephan Eicher und die Automaten on stage"
    },
    "3.2": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/20221008_mohaibalazs_074-1-1.jpeg",
      "alt": "The orchestrion room at the House of Music Hungary"
    },
    "3.3": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/20221008_mohaibalazs_074-1-2.jpeg",
      "alt": "BELEM: Didier Laloy and Kathy Adam with Walter Hus"
    },
    "3.4": {
      "file": "content/media/decap-balzaal-der-gebroken-harten-organ.jpg",
      "alt": "The Belcanto organ on stage"
    },
    "3.6": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/Untitled-1-41.png",
      "alt": "Pat Metheny with his orchestrion"
    },
    "3.5": {
      "file": "content/media/decap-circus-ronaldo-la-cucina-dell-arte-orchestrion-cart.jpg",
      "alt": "Circus Ronaldo with the Decap orchestrion cart"
    }
  },
  "circus-ronaldo": {
    "0": {
      "file": "content/media/decap-circus-ronaldo-la-cucina-dell-arte-orchestrion-cart.jpg",
      "alt": "Circus Ronaldo in La Cucina dell’Arte, with the Decap orchestrion cart on stage"
    },
    "2": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/s.png",
      "alt": "Brass Core on a trumpet"
    }
  },
  "guido-belcanto": {
    "0": {
      "file": "content/media/decap-balzaal-der-gebroken-harten-organ.jpg",
      "alt": "The Belcanto organ on stage in Balzaal der Gebroken Harten"
    },
    "1": {
      "file": "content/media/decap-tony-decap-and-francois-decap-belcanto-orgel-without-facade.jpg",
      "alt": "Tony and François Decap with the Belcanto organ before its façade was fitted"
    },
    "2.0": {
      "file": "content/media/decap-balzaal-der-gebroken-harten-backstage-load-in-decap-crew-at-work.jpg",
      "alt": "Load-in: the DECAP crew carrying organ parts onto the stage"
    },
    "2.1": {
      "file": "content/media/decap-balzaal-der-gebroken-harten-modular-stage-organ-installation.jpg",
      "alt": "The modular stage organ being assembled and cabled"
    },
    "2.2": {
      "file": "content/media/decap-balzaal-der-gebroken-harten-backstage-organ-and-amber-spotlight-crew.jpg",
      "alt": "The organ backstage under an amber spotlight"
    }
  },
  "house-of-music-hungary": {
    "0": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/20221008_mohaibalazs_074-1-1.jpeg",
      "alt": "The orchestrion room at the House of Music Hungary"
    },
    "1": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/20221008_mohaibalazs_074-3-2-1.png",
      "alt": "Visitors playing the instruments from a touchscreen"
    },
    "2": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/image-6-2.jpeg",
      "alt": "Visitors in the Creative Sound Space"
    }
  },
  "pat-metheny": {
    "0": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/Untitled-1-41.png",
      "alt": "Pat Metheny with his orchestrion"
    }
  },
  "stephan-eicher": {
    "0": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/20221008_mohaibalazs_074-2-1.jpeg",
      "alt": "Stephan Eicher und die Automaten on stage"
    },
    "1": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/20221008_mohaibalazs_074-3-1.jpeg",
      "alt": "The automated instruments on stage in concert light"
    },
    "2": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/20221008_mohaibalazs_074-1.jpeg",
      "alt": "Stephan Eicher singing in front of the instruments"
    }
  },
  "walter-hus-belem": {
    "0": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/20221008_mohaibalazs_074-1-2.jpeg",
      "alt": "BELEM with Walter Hus"
    },
    "1": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/20221008_mohaibalazs_074-1-2.png",
      "alt": "Accordion, cello and pipes of the mechanical orchestra"
    },
    "2": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/20221008_mohaibalazs_074-3-2.jpeg",
      "alt": "Walter Hus in front of the pipes"
    }
  },
  "yves-rechsteiner": {
    "0": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/20221008_mohaibalazs_074-2-2.jpeg",
      "alt": "A stage production with L'Explorateur: four dancers in front of the organ"
    },
    "2": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/20221008_mohaibalazs_074-3-3.jpeg",
      "alt": "Dancers on stage in front of L'Explorateur, an organist at the console"
    },
    "4": {
      "file": "content/media/decap-smartvalve-samples.jpg",
      "alt": "smARTvalves with their electronics"
    },
    "5": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/20221008_mohaibalazs_074-1-2-1.png",
      "alt": "Render of L'Explorateur's transportable modules"
    },
    "6": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/image-6-1.jpeg",
      "alt": "L'Explorateur's modules on stage, with dancers and smoke"
    },
    "8": {
      "url": "https://orchestrionix.com/wp-content/uploads/2023/08/20221008_mohaibalazs_074-3-1-1.png",
      "alt": "Render of L'Explorateur's modules and pipework"
    }
  },
  "frank-decap": {
    "0": {
      "file": "content/media/decap-frank-decap-piano-restoration-in-a-busy-workshop.jpg",
      "alt": "Frank Decap at work in his restoration workshop"
    },
    "1": {
      "file": "content/media/decap-frank-decap-historic-concert-hall-organ-workshop.jpg",
      "alt": "Frank Decap working among historic organs"
    },
    "5.0": {
      "file": "content/media/decap-frank-decap-antique-organ-restoration-workshop.jpg",
      "alt": "A historic organ dismantled for restoration in the atelier"
    },
    "5.1": {
      "file": "content/media/decap-frank-decap-antique-organ-loaded-into-van.jpg",
      "alt": "A restored historic organ being loaded into a van for delivery"
    },
    "5.2": {
      "file": "content/media/decap-frank-decap-organ-restoration-workshop-in-warm-light.jpg",
      "alt": "Restoration in progress: organ parts on the workbench in warm light"
    }
  },
  "smartvalve-for-organ-builders": {
    "0": {
      "file": "content/media/decap-smartvalves-in-their-windchest.jpg",
      "alt": "smARTvalves mounted in their wind chest"
    },
    "4": {
      "file": "content/media/decap-smartvalve-samples.jpg",
      "alt": "smARTvalves with their electronics"
    }
  }
};

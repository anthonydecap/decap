/** Work case study (Prismic project "house-of-music-hungary"): the robot orchestra in the Creative Sound Space, Budapest, with Medence Design. */
export default {
  type: "project",
  uid: "house-of-music-hungary",
  title: "House of Music Hungary: Creative Sound Space",
  theme: "decap",
  meta_title: "Robot Orchestra, House of Music Hungary | Decap",
  meta_description:
    "A robot orchestra by Decap Herentals for the Creative Sound Space at the House of Music Hungary in Budapest, with Medence Design. Heard in Robotorgona concerts.",
  fields: {
    summary: "Automated instruments for the robot orchestra in the Creative Sound Space, with Medence Design.",
    client: "House of Music Hungary, with Medence Design",
    year: "2022",
    location: "Budapest, Hungary",
  },
  slices: [
    {
      type: "site_hero",
      primary: {
        layout: "Split",
        eyebrow: "Work · Budapest",
        title: "A robot orchestra for the House of Music Hungary",
        intro:
          "The Creative Sound Space at the House of Music Hungary in Budapest has eight installations about sound, designed by Medence Design. One of them is a robot orchestra built from our automated instruments.",
        primary_cta_label: "Self-playing instruments",
        primary_cta_link: "/instruments",
        secondary_cta_label: "All projects",
        secondary_cta_link: "/work",
        note: "Photos: Mohai Balázs, 2022",
        image_brief: "The robot orchestra in the Creative Sound Space, wide shot with visitors, 4:3 (photo Mohai Balázs)",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "The project",
        title: "Eight installations, one robot orchestra",
        body:
          "Medence Design created the Creative Sound Space as eight installations that let visitors explore sound. We built almost all the instruments of the interactive room, the robot orchestra included. The control software that runs the space was made by others.\n\nThe space has been open since 2022.",
        media_side: "Image right",
        aspect: "Landscape 4:3",
        image_brief: "Close-up of the marimba and glockenspiel of the robot orchestra, 4:3 (photo Mohai Balázs)",
      },
    },
    {
      type: "site_text_media",
      primary: {
        eyebrow: "In concert",
        title: "Robotorgona: concerts for the robot orchestra",
        body:
          "The House of Music Hungary holds *Robotorgona* concerts in the Creative Sound Space. The orchestra is computer-controlled and plays:",
        media_side: "Image left",
        aspect: "Landscape 4:3",
        image_brief: "Audience at a Robotorgona concert in front of the robot orchestra, 4:3 (photo Mohai Balázs)",
        tone: "Tinted",
      },
      items: [
        { point: "Marimba" },
        { point: "Accordion" },
        { point: "Pianino" },
        { point: "Glockenspiel" },
        { point: "Drums" },
        { point: "An organ with remote pressure control" },
      ],
    },
    {
      type: "site_facts",
      primary: {
        eyebrow: "At a glance",
        title: "Project facts",
        layout: "Spec list",
      },
      items: [
        { label: "Venue", value: "House of Music Hungary, Budapest" },
        { label: "Exhibition design", value: "Medence Design" },
        { label: "Space", value: "Creative Sound Space, eight installations" },
        { label: "Open since", value: "2022" },
        { label: "Instruments", value: "Marimba, accordion, pianino, glockenspiel, drums, organ" },
      ],
    },
    {
      type: "site_video",
      primary: {
        eyebrow: "Watch",
        title: "The robot orchestra playing",
        video_brief: "Clip of a Robotorgona concert in the Creative Sound Space",
      },
    },
    {
      type: "site_cta",
      primary: {
        eyebrow: "Museums and exhibitions",
        title: "Planning an installation with self-playing instruments?",
        body: "Tell us about the space, the visitors and what they should hear. We reply with the instruments that fit and how they are controlled.",
        primary_cta_label: "Describe your installation",
        primary_cta_link: "/contact",
        secondary_cta_label: "See the instruments",
        secondary_cta_link: "/instruments",
        tone: "Dark band",
      },
    },
  ],
};

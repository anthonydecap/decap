# Quick Start Guide

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up Prismic

1. Create a Prismic repository at [prismic.io](https://prismic.io)
2. Copy your repository endpoint to your environment variables
3. Run the Slice Machine:

```bash
npm run slicemachine
```

## 3. Configure Slices and Settings in Prismic

1. Go to your Prismic dashboard
2. Navigate to "Custom Types"
3. Create a new Custom Type (e.g., "Page")
4. Add a "Slice Zone" field
5. Add the following slices to your Slice Zone:
   - Hero
   - SectionIntro
   - Testimonial
   - GridList
   - ContactSection
   - Stats

6. **Configure Site Settings**:
   - The "Settings" custom type should already be available
   - Create a new "Settings" document to configure:
     - Site navigation menu
     - Footer sections and links
     - Contact button text and link
     - Newsletter section
     - Copyright text

## 4. Start Development

```bash
npm run dev
```

## 5. Create Your First Page

1. In Prismic, create a new "Page" document
2. Add slices to build your page:
   - Start with a **Hero** slice for the header
   - Add a **SectionIntro** slice for sections
   - Use **GridList** for services/features
   - Add **Testimonial** for social proof
   - Include **Stats** for metrics
   - End with **ContactSection** for contact info

## Available Components

All components are responsive and include:
- Smooth animations
- Accessibility features
- SEO optimization
- Dark/light theme support

## Next Steps

- Read the full documentation in `PRISMIC_SLICES_README.md`
- Configure your site settings in `PRISMIC_SETTINGS_README.md`
- Customize the styling in the component files
- Add more slices as needed for your project

## Support

For questions or issues, refer to the main documentation or the Prismic support resources. 
# Prismic Slices Documentation

This document provides instructions on how to set up and use the custom slices in your Prismic repository.

## Available Slices

1. **Hero** - Page hero section with eyebrow, title, and description
2. **SectionIntro** - Section introduction with eyebrow, title, and description  
3. **Testimonial** - Customer testimonial with quote and client info
4. **GridList** - Grid layout for displaying list items
5. **ContactSection** - Contact section with title, description, and contact info
6. **Stats** - Statistics section with title and stats

## Slice Setup Instructions

### 1. Hero Slice

**Fields to configure in Prismic:**
- **Eyebrow** (Text) - Small text above the title (e.g., "Company Name")
- **Title** (Text) - Main hero title
- **Description** (Rich Text) - Hero description with formatting support
- **Centered** (Boolean) - Center align the content (default: false)

**Usage:** Perfect for landing pages, about pages, or any page that needs a prominent header.

### 2. SectionIntro Slice

**Fields to configure in Prismic:**
- **Eyebrow** (Text) - Small text above the title (e.g., "Our Services")
- **Title** (Text) - Section title
- **Description** (Rich Text) - Section description with formatting support
- **Smaller** (Boolean) - Use smaller title size (default: false)
- **Invert** (Boolean) - Use light text for dark backgrounds (default: false)

**Usage:** Use to introduce new sections on your pages.

### 3. Testimonial Slice

**Fields to configure in Prismic:**
- **Quote** (Rich Text) - The testimonial quote
- **Client Name** (Text) - Name of the client or company
- **Client Logo** (Image) - Client's logo (recommended size: 200x100px)

**Usage:** Add social proof to your pages with customer testimonials.

### 4. GridList Slice

**Fields to configure in Prismic:**

**Primary Fields:**
- **Title** (Text) - Section title (optional)
- **Invert** (Boolean) - Use light text for dark backgrounds (default: false)

**Repeatable Items:**
- **Item Title** (Text) - Title for each grid item
- **Item Description** (Rich Text) - Description for each grid item

**Usage:** Perfect for services, features, or any content that works well in a grid layout.

### 5. ContactSection Slice

**Fields to configure in Prismic:**
- **Title** (Text) - Contact section title (e.g., "Contact Us")
- **Description** (Rich Text) - Contact section description
- **Email** (Text) - Contact email address
- **Phone** (Text) - Contact phone number

**Usage:** Add contact information to your pages with a styled dark theme section.

### 6. Stats Slice

**Fields to configure in Prismic:**

**Primary Fields:**
- **Title** (Text) - Section title (e.g., "Our Impact")

**Repeatable Items:**
- **Label** (Text) - Stat description (e.g., "Projects completed")
- **Value** (Text) - Stat value (e.g., "150+")

**Usage:** Showcase your company's achievements and metrics.

## Setting Up Slices in Prismic

### Step 1: Create Custom Types

1. Go to your Prismic dashboard
2. Navigate to "Custom Types"
3. Create a new Custom Type (e.g., "Page")
4. Add a "Slice Zone" field to your Custom Type
5. Configure the Slice Zone to use the available slices

### Step 2: Configure Slices

1. In your Slice Zone configuration, add the slices you want to use
2. For each slice, configure the fields as described above
3. Set appropriate placeholders and help text for content editors

### Step 3: Create Content

1. Create a new document using your Custom Type
2. Add slices to your Slice Zone
3. Fill in the content for each slice
4. Publish your document

## Design System

The slices use a consistent design system based on:

- **Typography:** Custom display font for headings, system fonts for body text
- **Colors:** Neutral color palette with dark (neutral-950) and light (neutral-50) themes
- **Spacing:** Consistent spacing scale with responsive breakpoints
- **Animations:** Subtle fade-in animations using Framer Motion

## Technical Notes

- All slices are built with Next.js 15 and React 19
- Uses Tailwind CSS 4.x for styling
- Includes TypeScript support
- Responsive design for mobile, tablet, and desktop
- Accessibility features included (ARIA labels, semantic HTML)
- SEO optimized with proper heading hierarchy

## Customization

You can customize the slices by:

1. **Styling:** Modify the Tailwind classes in the component files
2. **Fields:** Add new fields to the model.json files
3. **Layout:** Adjust the component structure in the index.tsx files
4. **Animation:** Modify the Framer Motion animations in the FadeIn components

## Support

For technical support or questions about implementation, refer to:
- [Prismic Documentation](https://prismic.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Version Information

- Next.js: 15.x
- React: 19.x
- Prismic: Latest
- Tailwind CSS: 4.x
- Framer Motion: 11.x 
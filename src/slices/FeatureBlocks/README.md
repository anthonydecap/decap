# FeatureBlocks Slice

A split layout section with a background image on the left and feature blocks on the right, styled to match the SplitFeature slice design.

## Features

- **Split Layout**: Two-column design with image on left, content on right
- **Background Image**: Customizable background image with fallback
- **Feature Blocks**: Interactive feature cards with icons, titles, and descriptions
- **Consistent Styling**: Matches the SplitFeature slice design aesthetic
- **Responsive Design**: Adapts to all screen sizes
- **Smooth Animations**: Fade-in animations for enhanced UX

## Configuration

### Primary Fields

- **Title**: Main heading with rich text support
- **Subtitle**: Description text with formatting
- **Background Image**: Custom image for the left side (optional, has fallback)

### Feature Items

Each feature block can have:
- **Feature Title**: Heading for the feature
- **Feature Description**: Rich text description with formatting
- **Feature Icon**: Icon symbol or emoji for visual appeal

## Usage

1. Add the FeatureBlocks slice to your page in Prismic
2. Configure the title and subtitle
3. Upload a background image (optional - will use fallback if not provided)
4. Add feature blocks by clicking "Add Item"
5. For each feature block:
   - Add a feature title
   - Add a feature description with optional formatting
   - Add an icon (emoji or symbol)
6. The features will display as interactive cards with hover effects

## Styling

- **Dark Theme**: Neutral-950 background with white text
- **Card Design**: Rounded corners with subtle borders and shadows
- **Hover Effects**: Cards lift and change border color on hover
- **Icon Styling**: Circular background with hover color transitions
- **Typography**: Consistent with the site's design system
- **Spacing**: Generous padding and margins for readability

## Differences from SplitFeature

- **No ADSR Curve**: Removed the interactive ADSR curve controls
- **Simplified Layout**: Focused purely on feature presentation
- **Custom Background**: Added support for custom background images
- **Cleaner Code**: Removed complex animation and state management

## Accessibility

- Semantic HTML structure
- Proper heading hierarchy
- Keyboard navigation support
- Screen reader friendly
- High contrast text and backgrounds

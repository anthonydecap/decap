# VideoHero Slice

A hero section with a looping video background, large title, subtitle, and centered call-to-action button.

## Features

- **Video Background**: Full-screen looping video that plays automatically (muted)
- **Large Typography**: Big, bold title with responsive sizing
- **Rich Subtitle**: Structured text support with formatting and links
- **Centered Button**: Prominent call-to-action button
- **Overlay Control**: Configurable overlay opacity for text readability
- **Responsive Design**: Adapts to all screen sizes
- **Autoplay**: Video starts automatically and loops continuously

## Configuration

### Primary Fields

- **Main Title**: Large, bold heading text
- **Subtitle**: Rich text description with formatting support
- **Button Text**: Text displayed on the call-to-action button
- **Button Link**: Where the button should navigate to
- **Background Video**: Video file to use as background (MP4 recommended)
- **Overlay Opacity**: Choose between light, medium, or dark overlay

## Usage

1. Add the VideoHero slice to your page in Prismic
2. Upload a video file for the background (MP4 format recommended)
3. Add your main title text
4. Add subtitle/description with optional formatting
5. Configure button text and link
6. Choose overlay opacity for optimal text readability
7. The video will automatically loop and play muted

## Video Requirements

- **Format**: MP4 recommended for best compatibility
- **Size**: Optimize for web (compress to reduce file size)
- **Duration**: 10-30 seconds recommended for looping
- **Aspect Ratio**: 16:9 or similar widescreen format works best
- **Content**: Should be subtle enough not to interfere with text readability

## Styling

- Full-screen height (`min-h-screen`)
- Centered content layout
- Responsive typography scaling
- White text with configurable overlay
- Smooth transitions and hover effects
- Mobile-optimized video playback

## Accessibility

- Video is muted by default (required for autoplay)
- Fallback text for unsupported browsers
- High contrast text overlay
- Keyboard navigation support
- Screen reader friendly structure

# SmartValveStory Slice

## Purpose
The SmartValveStory slice is a scroll-based storytelling component that explains "How It Works" through four immersive steps. It's designed to replace the old mental model with a new understanding: SmartValve doesn't just open/close — it sculpts airflow with precision.

## Features
- **Scroll-triggered animations**: Steps fade in/out based on scroll position
- **Video/Image support**: Each step can have a video (auto-plays when active) or static image
- **Consistent aspect ratio**: 4:3 aspect ratio for all media to ensure visual consistency
- **Auto-play videos**: Videos automatically play/pause based on which step is active
- **Custom background color**: Set any hex color code using Prismic's color picker
- **Generous spacing**: Steps have ample breathing room (80-128px between steps)
- **Mobile responsive**: One step per screen on mobile, smooth scrolling
- **Reduced motion support**: Respects `prefers-reduced-motion` for accessibility

## Usage

1. Add the SmartValveStory slice to your page in Prismic
2. Configure section title and subtitle
3. Add steps with headlines, sublines, and media (video or image)
4. Set background color as desired

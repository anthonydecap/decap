# SmartValveStory Slice

## Purpose
The SmartValveStory slice is a scroll-based storytelling component that explains "How It Works" through four immersive steps. It's designed to replace the old mental model with a new understanding: SmartValve doesn't just open/close — it sculpts airflow with precision.

## Features
- **Horizontal player**: one wide media stage on top, the steps in a row underneath
- **Auto-advance**: each step's rule fills while its video plays, then the next step starts; image-only steps hold for 6 seconds
- **Click to jump**: every step is a button; a play/pause control sits on the stage
- **Unframed media**: no border or background, so black video blends into the section (on dark sections the media uses `mix-blend-mode: lighten`, so pure-black video takes on the section colour)
- **Lazy video**: a step's video only loads the first time it becomes active; playback pauses when the section scrolls out of view (HLS via hls.js)
- **Mobile**: the step row becomes a swipeable strip that follows the active step
- **Reduced motion**: starts paused and crossfades are instant under `prefers-reduced-motion`

## Usage

1. Add the SmartValveStory slice to your page in Prismic
2. Configure section title and subtitle
3. Add steps with headlines, sublines, and media (video or image)
4. Set background color as desired

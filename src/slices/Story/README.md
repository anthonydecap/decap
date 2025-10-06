# Story Slice

## Purpose
The Story slice is a scroll-based storytelling component that explains "How It Works" through four immersive steps. It's designed to replace the old mental model with a new understanding: SmartValve doesn't just open/close — it sculpts airflow with precision.

## Features
- **Scroll-triggered animations**: Steps fade in/out based on scroll position
- **Video/Image support**: Each step can have a video (auto-plays when active) or static image
- **Consistent aspect ratio**: 4:3 aspect ratio for all media to ensure visual consistency
- **Auto-play videos**: Videos automatically play/pause based on which step is active
- **Custom background color**: Set any hex color code using Prismic's color picker
- **Generous spacing**: Steps have ample breathing room (80-128px between steps)
- **Mobile responsive**: One step per screen on mobile, smooth scrolling
- **Reduced motion support**: Respects `prefers-reduced-motion` for accessibility

## The Four Steps

### Step 1: INPUT
**Content**: MIDI command → target pressure  
**Goal**: Establish that SmartValve starts from pressure intent, not position  
**Media**: Upload video or image showing MIDI to pressure curve transformation

### Step 2: PRECISION MOTION
**Content**: Voice-coil motor → ultra-fast control  
**Goal**: Show there's a finesse actuator, not a clunky solenoid  
**Media**: Upload video or image showing voice-coil motor in action

### Step 3: FEEDBACK
**Content**: Pressure sensor → real-time regulation  
**Goal**: Make closed-loop control obvious (measure → compare → correct)  
**Media**: Upload video or image showing feedback loop with 9,000×/s sensing

### Step 4: RESULT
**Content**: Real wind control → living sound  
**Goal**: Land the benefit: pressure control = musical airflow  
**Media**: Upload video or image showing airflow creating sound

## Design Language
- **Custom background color**: Set any hex color code (e.g., `#0a0a0a`, `#1a1a1a`, `#000000`)
  - Default: `#0a0a0a` (very dark gray)
  - Use Prismic's color picker or enter hex codes directly
  - Text is always white for contrast
- **Typography**: Clean, large headlines with comfortable spacing (matches Possibilities slice)
- **Motion**: Slow, confident, with subtle easing
- **Media alignment**: Right-aligned to touch container edge

## Content Guidelines
- One headline per step (≤7 words)
- One subline per step (≤18 words)
- Include "not an on/off" in Step 1 to dismantle old model
- Include 9,000×/s and 2,000×/s numbers only in Step 3
- No repetition of technical specs outside their context

## Accessibility
- All animations respect `prefers-reduced-motion`
- Text remains readable without media
- Videos include poster images as fallbacks
- Images include alt text for screen readers
- Videos are muted and set to autoplay only when step is active

## Media Guidelines
- **Preferred format**: MP4 video (H.264 codec) for best compatibility
- **Aspect ratio**: 4:3 (e.g., 1200×900px or 1600×1200px)
- **Fallback**: Always provide a step_image as fallback if video fails to load
- **File size**: Keep videos under 5MB for optimal loading
- **Loop**: Videos will automatically loop when active


# YouTubeVideo Slice

A slice that displays a YouTube video with a title and description in a split layout.

## Features

- **YouTube Video Embed**: Automatically embeds YouTube videos from URLs
- **Split Layout**: Video and content side by side
- **Flexible Positioning**: Video can be on left or right side
- **Configurable Size**: Three video size options (small, medium, large)
- **Rich Content**: Title and description with formatting support
- **Responsive Design**: Adapts to all screen sizes
- **Smooth Animations**: Fade-in effects for enhanced UX

## Configuration

### Primary Fields

- **Title**: Rich text heading with formatting support
- **Description**: Rich text description with formatting
- **YouTube URL**: Full YouTube video URL (watch or share link)
- **Video Position**: Choose left or right side for video
- **Video Size**: Select small, medium, or large video size

## Usage

1. Add the YouTubeVideo slice to your page in Prismic
2. Paste a YouTube URL (supports various formats):
   - `https://www.youtube.com/watch?v=VIDEO_ID`
   - `https://youtu.be/VIDEO_ID`
   - `https://www.youtube.com/embed/VIDEO_ID`
3. Add a title and description
4. Choose video position (left or right)
5. Select video size (small, medium, large)
6. The video will automatically embed and display

## Supported YouTube URL Formats

The slice automatically extracts the video ID from these URL formats:
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`
- `https://www.youtube.com/v/VIDEO_ID`

## Video Sizes

- **Small**: `max-w-md` (448px max width)
- **Medium**: `max-w-lg` (512px max width) - default
- **Large**: `max-w-xl` (576px max width)

## Styling

- **Clean Layout**: Two-column grid with generous spacing
- **Rounded Video**: Video player with rounded corners and shadow
- **Typography**: Large, bold title with readable description
- **Responsive**: Stacks vertically on mobile devices
- **Animations**: Smooth fade-in effects for both video and content

## Accessibility

- Proper iframe title for screen readers
- Semantic HTML structure
- Keyboard navigation support
- High contrast text and backgrounds
- Responsive design for all devices

## Error Handling

- Displays helpful message if YouTube URL is invalid
- Graceful fallback when video ID cannot be extracted
- Maintains layout even when video fails to load

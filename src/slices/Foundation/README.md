# Foundation Slice

The Foundation slice recreates the "Built on a foundation of fast, production-grade tooling" section from the Next.js website. It features animated gradient lines connecting to a central CPU visualization with the "Powered By" text.

## Features

- **Animated gradient lines**: Multiple colored gradient lines that flow and animate
- **CPU visualization**: Central processing unit representation with connection points
- **Grid background**: Subtle grid pattern for technical aesthetics
- **Responsive design**: Adapts to different screen sizes
- **Configurable content**: Title, subtitle, and animation toggle through Prismic CMS

## Configuration

### Primary Fields

- **Title**: Rich text field for the main heading (supports formatting and links)
- **Subtitle**: Rich text field for the description text
- **Show Animation**: Boolean toggle to enable/disable the animated visualization

### Design Elements

- **Background**: Dark theme (neutral-950) for contrast
- **Gradient colors**: 
  - Pink to blue (#FF4A81 → #DF6CF7 → #0196FF)
  - Orange to yellow (#FF7432 → #F7CC4B)
  - Cyan to blue (#2EB9DF → #61DAFB)
- **CPU**: 3x3 grid with highlighted center, surrounded by connection points
- **Animation**: Smooth gradient flows with staggered timing

## Usage

Add the Foundation slice to any page in Prismic CMS. The slice will render with:

1. Centered title and subtitle
2. Animated line visualization (if enabled)
3. Central CPU component with "Powered By" text
4. Responsive layout that works on all screen sizes

## Technical Details

- Uses SVG for scalable graphics
- CSS animations for smooth gradient transitions
- Tailwind CSS for styling
- Backdrop blur effects for modern appearance
- Grid patterns for technical aesthetic

## Inspiration

This slice is inspired by the Next.js website's foundation section, featuring animated connecting lines that converge into a CPU-like structure, representing the underlying technology stack.
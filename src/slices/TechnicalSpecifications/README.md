# Technical Specifications Slice

A modern, Apple-inspired technical specifications slice for displaying product specifications with elegant design and smooth animations.

## Features
- **Apple-Style Design**: Clean, modern interface with subtle shadows, rounded corners, and smooth transitions
- **Multiple Layout Options**: Grid, List, and Cards layouts to suit different content needs
- **Responsive Design**: Adapts beautifully across all device sizes
- **Icon Support**: Built-in icons for common specification types (power, dimensions, weight, etc.)
- **Category Grouping**: Automatically groups specifications by category for better organization
- **Highlight Feature**: Option to highlight important specifications
- **Dark/Light Theme Support**: Seamless color inversion for different backgrounds
- **Smooth Animations**: Fade-in animations with staggered timing for elegant presentation

## Configuration Options

### Primary Fields

- **Title**: Main section title
- **Eyebrow**: Small text above the title (e.g., "Product Details")
- **Description**: Rich text description of the specifications
- **Invert Colors**: Toggle between light and dark theme
- **Layout**: Choose between "grid", "list", or "cards"
- **Columns**: Set number of columns (1, 2, or 3)

### Item Fields

- **Specification Category**: Group specifications (e.g., "Power & Electrical")
- **Specification Title**: Name of the specification (e.g., "Power Input")
- **Specification Value**: The actual value (e.g., "100-240V AC, 50-60Hz")
- **Specification Description**: Optional detailed description
- **Specification Icon**: Choose from predefined icons or none
- **Highlight**: Mark important specifications for emphasis

## Available Icons

- `power` - Power and electrical specifications
- `dimensions` - Physical dimensions and measurements
- `weight` - Weight specifications
- `frequency` - Frequency and audio specifications
- `temperature` - Temperature ranges
- `humidity` - Humidity specifications
- `material` - Material and construction details
- `connector` - Connection and interface specifications
- `battery` - Battery and power specifications
- `certification` - Safety and compliance certifications
- `none` - No icon

## Layout Options

### Grid Layout
- Clean card-based layout with specifications displayed in a responsive grid
- Perfect for showcasing multiple specifications with equal visual weight
- Supports 1, 2, or 3 columns

### List Layout
- Compact list format ideal for dense information
- Specifications grouped by category with clear visual hierarchy
- Great for detailed technical documentation

### Cards Layout
- Category-based organization with specifications grouped under headers
- Each category gets its own section with a grid of specification cards
- Best for organizing large numbers of specifications by type

## Usage Examples

### Basic Power Specifications
```json
{
  "spec_category": "Power & Electrical",
  "spec_title": "Power Input",
  "spec_value": "100-240V AC, 50-60Hz",
  "spec_description": "Universal power input with automatic voltage detection",
  "spec_icon": "power",
  "highlight": true
}
```

### Physical Dimensions
```json
{
  "spec_category": "Physical Dimensions",
  "spec_title": "Dimensions",
  "spec_value": "320 × 180 × 85 mm",
  "spec_description": "Compact design for professional studio environments",
  "spec_icon": "dimensions",
  "highlight": false
}
```

## Design Philosophy

This slice follows Apple's design principles:

- **Clarity**: Clean typography and clear visual hierarchy
- **Deference**: Content-focused design that doesn't compete with the information
- **Depth**: Subtle shadows and layering for visual interest
- **Smooth Interactions**: Gentle hover effects and smooth transitions
- **Accessibility**: High contrast ratios and readable typography

## Technical Implementation

- Built with TypeScript for type safety
- Uses Tailwind CSS for styling
- Integrates with Prismic's rich text system
- Supports all Prismic field types
- Fully responsive with mobile-first design
- Optimized for performance with lazy loading

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Graceful degradation for older browsers 
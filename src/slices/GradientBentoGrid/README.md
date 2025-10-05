# GradientBentoGrid

A simple and beautiful bento grid component with gradient functionalities, inspired by Apple's design. This component allows you to create stunning grid layouts with gradient accents, supporting icons, images, or text-only items.

## Features

- **Gradient Accents**: Beautiful gradient color schemes with neon glow effects
- **Flexible Content**: Support for icons, images, or text-only items
- **Apple-Style Bento Layout**: True bento grid organization with 6-column system
- **Simple Configuration**: Minimal properties for easy setup
- **Responsive Design**: Fully responsive across all device sizes
- **No Links**: Clean design without learn more links

## Configuration

### Primary Fields

- **Section Title**: Main heading for the section
- **Section Subtitle**: Optional subtitle or description
- **Background Color**: Select from `white`, `light`, or `dark`

### Item Fields

- **Item Title**: Title for each bento item
- **Item Description**: Rich text description
- **Icon**: Emoji or symbol (e.g., 🚀, ⚡, 💡)
- **Item Image**: Optional image for the item
- **Accent Color**: Gradient color scheme (blue, green, purple, orange, red, yellow)
- **Item Size**: Simple size options (small, medium, large, wide, tall, big)

## Item Sizes

The component uses a 6-column grid system with these size options:

- **Small**: 1 column × 1 row (compact)
- **Medium**: 2 columns × 1 row (standard)
- **Large**: 2 columns × 2 rows (featured)
- **Wide**: 3 columns × 1 row (horizontal)
- **Tall**: 1 column × 2 rows (vertical)
- **Big**: 3 columns × 2 rows (hero)

## Usage Examples

### Icon Item
```json
{
  "item_title": "Lightning Fast",
  "item_description": "Experience blazing fast performance",
  "icon": "⚡",
  "accent_color": "yellow",
  "item_size": "small"
}
```

### Image Item
```json
{
  "item_title": "Creative Design",
  "item_description": "Beautiful and modern design",
  "item_image": "image_field",
  "accent_color": "purple",
  "item_size": "large"
}
```

### Text-Only Item
```json
{
  "item_title": "Smart Technology",
  "item_description": "Advanced AI-powered features",
  "accent_color": "blue",
  "item_size": "wide"
}
```

## Gradient Color Schemes

- **Blue**: Cyan to Blue to Indigo
- **Green**: Emerald to Green to Teal
- **Purple**: Violet to Purple to Indigo
- **Orange**: Orange to Red to Pink
- **Red**: Red to Pink to Purple
- **Yellow**: Yellow to Orange to Red

## Layout System

The component uses a responsive grid system:
- **Mobile**: 1 column
- **Tablet**: 4 columns
- **Desktop**: 6 columns

Items automatically flow into available spaces, creating a natural bento layout.

## Benefits

- **Simple Setup**: Only 6 properties per item
- **Visual Impact**: Gradient accents create stunning visual effects
- **Flexible**: Mix icons, images, and text as needed
- **Responsive**: Works perfectly on all devices
- **Fast**: Optimized for performance

## Technical Details

- Built with TypeScript and React
- Uses Tailwind CSS for styling
- Integrates with Prismic CMS
- Includes fade-in animations
- Fully accessible with proper semantic markup

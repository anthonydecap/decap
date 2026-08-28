# ModalBlocks Slice

A slice that displays blocks with background images and titles. When clicked, each block opens a modal with detailed information.

## Features

- **Header Section**: Optional title, eyebrow, and description for the entire slice
- **Interactive Blocks**: Each block has a background image, title, and subtitle
- **Modal Popups**: Clicking on a block opens a modal with detailed content
- **Responsive Design**: Blocks adapt to different screen sizes
- **Configurable Height**: Each block can have small, medium, large, or xlarge height
- **Equal Width Layout**: All blocks are displayed with equal width in responsive rows
- **Rich Content**: Modals support rich text, images, and structured content

## Configuration

### Primary Fields (Slice Header)

- **Title**: Main heading for the slice
- **Eyebrow**: Small text above the title
- **Description**: Rich text description below the title

### Block Items

Each block can have the following fields:

- **Block Title**: Main title displayed on the block
- **Block Subtitle**: Subtitle displayed on the block
- **Background Image**: Full background image for the block
- **Block Size**: Choose between small, medium, or large (for future use)
- **Block Height**: Choose between small, medium, large, or xlarge
- **Modal Title**: Title displayed in the modal (optional, falls back to block title)
- **Modal Description**: Rich text content displayed in the modal
- **Modal Image**: Optional image displayed in the modal

## Usage

1. Add the ModalBlocks slice to your page in Prismic
2. Configure the header section with title, eyebrow, and description
3. Add blocks by clicking "Add Item"
4. For each block:
   - Upload a background image
   - Add a title and subtitle
   - Choose the block height
   - Add modal content (title, description, and optional image)
5. The blocks will display in a responsive grid
6. Users can click any block to open a modal with detailed information

## Styling

The slice uses Tailwind CSS classes and includes:
- Hover effects on blocks
- Smooth transitions
- Responsive grid layout
- Modal overlay with backdrop blur
- Accessible close buttons

## Accessibility

- Modal can be closed by clicking the backdrop or close button
- Proper ARIA labels for screen readers
- Keyboard navigation support
- Focus management for modals

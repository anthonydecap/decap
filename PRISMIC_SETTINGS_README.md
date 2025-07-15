# Prismic Settings Configuration

This document explains how to configure your site's navigation and footer through Prismic CMS.

## Settings Custom Type

The `Settings` custom type allows you to configure global site settings including navigation, footer, and other site-wide content.

### Setting Up the Settings Document

1. **Create the Settings Custom Type** (if not already created):
   - Go to your Prismic dashboard
   - Navigate to "Custom Types"
   - The "Settings" custom type should already be configured with the following fields

2. **Create a Settings Document**:
   - Go to "Documents" in your Prismic dashboard
   - Create a new document using the "Settings" custom type
   - Fill in the configuration fields (see below)

## Configuration Fields

### Main Section

#### Site Name
- **Field**: `site_name`
- **Type**: Text
- **Purpose**: The name of your site (used in the logo area)
- **Example**: "Studio"

#### Logo
- **Field**: `logo`
- **Type**: Image
- **Purpose**: Upload your site logo
- **Recommended size**: 400x200px max

#### Contact Button
- **Field**: `contact_button_text`
- **Type**: Text
- **Purpose**: Text for the contact button in the header
- **Example**: "Contact us"

- **Field**: `contact_button_link`
- **Type**: Link
- **Purpose**: URL for the contact button
- **Example**: "/contact"

### Navigation Section

#### Navigation Items
- **Field**: `navigation`
- **Type**: Group (Repeatable)
- **Purpose**: Configure the main navigation menu

For each navigation item, configure:
- **Label**: The text displayed in the menu
- **Link**: The URL or page the menu item links to

**Example navigation items**:
- Label: "Work", Link: "/work"
- Label: "About", Link: "/about"
- Label: "Services", Link: "/services"
- Label: "Contact", Link: "/contact"

### Footer Section

#### Footer Sections
- **Field**: `footer_sections`
- **Type**: Group (Repeatable)
- **Purpose**: Configure footer navigation sections

For each footer section:
- **Section Title**: The heading for this section (e.g., "Work", "Company")
- **Section Links**: Repeatable group of links within this section
  - **Link Text**: The text for the link
  - **Link URL**: The URL for the link

**Example footer sections**:

**Work Section**:
- Section Title: "Work"
- Links:
  - "Our Work" → "/work"
  - "Case Studies" → "/case-studies"
  - "Process" → "/process"

**Company Section**:
- Section Title: "Company"
- Links:
  - "About" → "/about"
  - "Blog" → "/blog"
  - "Contact us" → "/contact"

**Connect Section**:
- Section Title: "Connect"
- Links:
  - "Facebook" → "https://facebook.com/yourcompany"
  - "Instagram" → "https://instagram.com/yourcompany"
  - "Twitter" → "https://twitter.com/yourcompany"

#### Newsletter Section
- **Field**: `newsletter_title`
- **Type**: Text
- **Purpose**: Title for the newsletter signup section
- **Example**: "Newsletter"

- **Field**: `newsletter_description`
- **Type**: Text
- **Purpose**: Description text for the newsletter signup
- **Example**: "Subscribe to get the latest design news, articles, resources and inspiration."

#### Copyright
- **Field**: `copyright_text`
- **Type**: Text
- **Purpose**: Copyright text in the footer
- **Example**: "© Studio Agency Inc."

## Default Values

If no Settings document is created, the site will use these default values:

```javascript
{
  site_name: "Studio",
  contact_button_text: "Contact us",
  contact_button_link: "/contact",
  navigation: [
    { label: "Work", link: "/work" },
    { label: "About", link: "/about" },
    { label: "Services", link: "/services" },
    { label: "Contact", link: "/contact" }
  ],
  footer_sections: [
    {
      section_title: "Work",
      section_links: [
        { link_text: "Our Work", link_url: "/work" },
        { link_text: "Case Studies", link_url: "/case-studies" },
        { link_text: "Process", link_url: "/process" }
      ]
    },
    {
      section_title: "Company", 
      section_links: [
        { link_text: "About", link_url: "/about" },
        { link_text: "Blog", link_url: "/blog" },
        { link_text: "Contact us", link_url: "/contact" }
      ]
    },
    {
      section_title: "Connect",
      section_links: [
        { link_text: "Facebook", link_url: "#" },
        { link_text: "Instagram", link_url: "#" },
        { link_text: "Twitter", link_url: "#" }
      ]
    }
  ],
  newsletter_title: "Newsletter",
  newsletter_description: "Subscribe to get the latest design news, articles, resources and inspiration.",
  copyright_text: "© Studio Agency Inc."
}
```

## Publishing Changes

1. After configuring your settings in Prismic, click "Save"
2. Click "Publish" to make the changes live
3. Your site will automatically use the new configuration

## Notes

- The Settings custom type is set to "Not repeatable" since you only need one settings document
- Changes to the settings will be reflected across your entire site
- If you need to add more navigation items, simply add them to the Navigation group
- Footer sections can be reordered by dragging them in the Prismic editor 
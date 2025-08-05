# Accessories Slice

An Apple-style accessories section that displays product accessories in a beautiful full-width grid layout.

## ✨ Features

- **🎨 Custom Display Control**: Override title, price, image, description per accessory in Prismic
- **🛒 Consistent Cart Data**: Always uses database data for cart to ensure accuracy
- **📏 Full-Width Layout**: Always uses full container width regardless of item count
- **🔄 Auto-Detection**: Can automatically show compatible accessories for a main product
- **✋ Manual Selection**: Allows manual selection with custom overrides
- **🍎 Apple-Style Design**: Clean, modern design inspired by Apple's product pages
- **📱 Responsive Grid**: Perfect spacing for 1-6+ accessories
- **✨ Hover Effects**: Smooth animations and interactions

## 🎯 How It Works

### **Display vs Cart Logic**
- **For DISPLAY**: Uses your Prismic custom fields first, falls back to database
- **For CART**: Always uses database data for consistency

This gives you complete creative control while ensuring reliable checkout!

## 📋 Usage

### Auto-Detection Mode
Set a `main_product_id` and it automatically shows compatible accessories:

```json
{
  "section_title": "Complete Your Setup",
  "section_subtitle": "Perfect accessories for your Brass Core", 
  "main_product_id": "prod_Sl6YwTtMW5oaq7"
}
```

### Manual Selection with Custom Overrides
Override any field per accessory:

```json
{
  "section_title": "Recommended Accessories",
  "section_subtitle": "Hand-picked essentials",
  "items": [
    {
      "accessory_id": "trumpet-case-deluxe",
      "custom_title": "Limited Edition Case",
      "custom_price": 99.00,
      "custom_image": [your custom image],
      "custom_description": "Special promotion description"
    },
    {
      "accessory_id": "trumpet-mouthpiece-7c",
      "custom_title": "Pro Mouthpiece"
      // Uses database price, image, description
    },
    {
      "accessory_id": "trumpet-valve-oil"
      // Uses all database data
    }
  ]
}
```

## 🎨 Layout Features

### **Full-Width Grid System**
- **1 item**: Full width (1 column)
- **2 items**: Each takes 50% width (2 columns)  
- **3 items**: Each takes 33% width (3 columns)
- **4 items**: Each takes 25% width (4 columns)
- **5+ items**: Responsive 3-4 column grid

### **Apple-Style Cards**
- Rounded corners with subtle shadows
- Gradient backgrounds
- Hover scale effects
- Smooth transitions
- Clear pricing display

## 🔧 Prismic Fields

### Primary Fields
- `section_title`: Main heading
- `section_subtitle`: Descriptive text
- `main_product_id`: For auto-detection mode

### Item Fields (Repeatable)
- `accessory_id`: **Required** - Product ID from database
- `custom_title`: **Optional** - Override product name
- `custom_price`: **Optional** - Override product price  
- `custom_image`: **Optional** - Override product image
- `custom_description`: **Optional** - Override description

## 💡 Examples

### **Marketing Campaign**
```json
{
  "accessory_id": "trumpet-case-deluxe",
  "custom_title": "Black Friday Special - Premium Case",
  "custom_price": 99.00,
  "custom_description": "Limited time offer - save €50!"
}
```
- **Page shows**: "Black Friday Special - Premium Case" at €99
- **Cart gets**: "Deluxe Trumpet Case" at €149 (database price)

### **Different Context**
```json
{
  "accessory_id": "trumpet-case-deluxe", 
  "custom_title": "Professional Transport Case",
  "custom_image": [lifestyle photo]
}
```
- **Page shows**: Custom title with lifestyle photo
- **Cart gets**: Consistent database data

## 🎯 Perfect For
- Product pages with related accessories
- Landing pages with curated selections  
- Category pages with featured items
- Marketing campaigns with custom pricing
- A/B testing different presentations

The slice gives you ultimate flexibility while maintaining data integrity! 🚀
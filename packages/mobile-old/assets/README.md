# LifeX App Icons & Assets

## 🎨 Generated Icons

This directory contains the LifeX app icons and splash screens in various formats and sizes.

## 📁 File Structure

```
assets/
├── icon.svg                 # Original complex icon design
├── icon-simple.svg          # Simplified icon design
├── icon-modern.svg          # Modern, clean icon design (RECOMMENDED)
├── splash.svg               # Splash screen design
├── icon-preview.html        # Preview page for all icons
├── generated/               # Generated PNG files (after running script)
│   ├── ios-*.png           # iOS icon sizes
│   ├── android-*.png       # Android icon sizes
│   └── *-splash-*.png      # Splash screen sizes
└── README.md               # This file
```

## 🚀 Quick Start

### 1. Preview Icons
Open `icon-preview.html` in your browser to see all icon designs:
```bash
npm run preview-icons
```

### 2. Generate All Sizes
Install dependencies and generate all required icon sizes:
```bash
npm install sharp
npm run generate-icons
```

### 3. Use Generated Icons
Copy the generated PNG files from `generated/` folder to your app's asset directories.

## 🎯 Icon Designs

### Modern Design (Recommended)
- **File**: `icon-modern.svg`
- **Style**: Clean, modern LX letters
- **Colors**: Purple gradient (#a855f7 to #7c3aed)
- **Features**: Rounded corners, high contrast, scalable

### Simple Design
- **File**: `icon-simple.svg`
- **Style**: Minimalist LX letters
- **Colors**: Purple gradient
- **Features**: Simplified design, good for small sizes

### Original Design
- **File**: `icon.svg`
- **Style**: Complex LX letters with shadows
- **Colors**: Purple gradient
- **Features**: Detailed design, best for large sizes

## 📱 Generated Sizes

### iOS Icons
- **App Store**: 1024x1024px
- **iPhone**: 180x180px
- **iPad**: 167x167px
- **iPhone Spotlight**: 120x120px
- **iPhone Settings**: 87x87px
- **iPad Spotlight**: 152x152px
- **iPad Settings**: 76x76px

### Android Icons
- **Play Store**: 512x512px
- **Android**: 192x192px
- **Android 144**: 144x144px
- **Android 96**: 96x96px
- **Android 72**: 72x72px
- **Android 48**: 48x48px

### Splash Screens
- **iOS iPhone**: 750x1334px
- **iOS iPhone Plus**: 1242x2208px
- **iOS iPad**: 1536x2048px
- **Android Phone**: 1080x1920px
- **Android Tablet**: 1200x1920px

## 🛠️ Customization

### Colors
Edit the SVG files to change colors:
```svg
<stop offset="0%" style="stop-color:#a855f7;stop-opacity:1" />
<stop offset="100%" style="stop-color:#7c3aed;stop-opacity:1" />
```

### Size
The SVG files are scalable. The generation script will create all required sizes automatically.

### Design
Modify the SVG files to change the design:
- Adjust letter positioning
- Change corner radius
- Modify gradients
- Add/remove effects

## 📋 App Store Requirements

### iOS App Store
- **Format**: PNG
- **Size**: 1024x1024px (App Store), various device sizes
- **Background**: Can be transparent or solid
- **Design**: Must be original, not copied from other apps

### Google Play Store
- **Format**: PNG
- **Size**: 512x512px (Play Store), various device sizes
- **Background**: Can be transparent or solid
- **Design**: Must be original, not copied from other apps

## 🔧 Technical Details

### SVG Structure
- **ViewBox**: 1024x1024
- **Gradient**: Linear gradient from top-left to bottom-right
- **Letters**: L and X made with rounded rectangles
- **Background**: Rounded rectangle with gradient fill

### Generation Script
- **Tool**: Sharp (Node.js image processing)
- **Input**: SVG files
- **Output**: PNG files in various sizes
- **Quality**: High resolution, no compression artifacts

## 📞 Support

For icon-related questions:
- **Email**: dev@lifex.co.nz
- **Website**: https://www.lifex.co.nz

## 📝 License

These icons are proprietary to LifeX Limited. Do not use without permission.

## 🗓️ Last Updated

December 19, 2024


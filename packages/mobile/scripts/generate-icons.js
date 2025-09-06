#!/usr/bin/env node

/**
 * Icon Generation Script for LifeX App
 * Converts SVG icons to various PNG sizes required for iOS and Android
 * 
 * Requirements:
 * - Node.js
 * - npm install sharp
 * 
 * Usage: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Icon sizes for different platforms
const iconSizes = {
  ios: {
    'AppStore': 1024,
    'iPhone': 180,
    'iPad': 167,
    'iPhoneSpotlight': 120,
    'iPhoneSettings': 87,
    'iPadSpotlight': 152,
    'iPadSettings': 76
  },
  android: {
    'PlayStore': 512,
    'Android': 192,
    'Android144': 144,
    'Android96': 96,
    'Android72': 72,
    'Android48': 48
  }
};

// Splash screen sizes
const splashSizes = {
  ios: {
    'iPhone': { width: 750, height: 1334 },
    'iPhonePlus': { width: 1242, height: 2208 },
    'iPad': { width: 1536, height: 2048 }
  },
  android: {
    'Phone': { width: 1080, height: 1920 },
    'Tablet': { width: 1200, height: 1920 }
  }
};

async function generateIcons() {
  console.log('🎨 Generating LifeX app icons...');
  
  const assetsDir = path.join(__dirname, '..', 'assets');
  const outputDir = path.join(assetsDir, 'generated');
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Generate iOS icons
  console.log('📱 Generating iOS icons...');
  for (const [name, size] of Object.entries(iconSizes.ios)) {
    const inputPath = path.join(assetsDir, 'icon.svg');
    const outputPath = path.join(outputDir, `ios-${name}-${size}.png`);
    
    try {
      await sharp(inputPath)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      console.log(`✅ Generated: ${outputPath}`);
    } catch (error) {
      console.error(`❌ Error generating ${outputPath}:`, error.message);
    }
  }
  
  // Generate Android icons
  console.log('🤖 Generating Android icons...');
  for (const [name, size] of Object.entries(iconSizes.android)) {
    const inputPath = path.join(assetsDir, 'icon.svg');
    const outputPath = path.join(outputDir, `android-${name}-${size}.png`);
    
    try {
      await sharp(inputPath)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      console.log(`✅ Generated: ${outputPath}`);
    } catch (error) {
      console.error(`❌ Error generating ${outputPath}:`, error.message);
    }
  }
  
  // Generate splash screens
  console.log('🚀 Generating splash screens...');
  for (const [name, dimensions] of Object.entries(splashSizes.ios)) {
    const inputPath = path.join(assetsDir, 'splash.svg');
    const outputPath = path.join(outputDir, `ios-splash-${name}-${dimensions.width}x${dimensions.height}.png`);
    
    try {
      await sharp(inputPath)
        .resize(dimensions.width, dimensions.height)
        .png()
        .toFile(outputPath);
      console.log(`✅ Generated: ${outputPath}`);
    } catch (error) {
      console.error(`❌ Error generating ${outputPath}:`, error.message);
    }
  }
  
  for (const [name, dimensions] of Object.entries(splashSizes.android)) {
    const inputPath = path.join(assetsDir, 'splash.svg');
    const outputPath = path.join(outputDir, `android-splash-${name}-${dimensions.width}x${dimensions.height}.png`);
    
    try {
      await sharp(inputPath)
        .resize(dimensions.width, dimensions.height)
        .png()
        .toFile(outputPath);
      console.log(`✅ Generated: ${outputPath}`);
    } catch (error) {
      console.error(`❌ Error generating ${outputPath}:`, error.message);
    }
  }
  
  console.log('🎉 Icon generation complete!');
  console.log(`📁 Generated files are in: ${outputDir}`);
  
  // Generate summary
  const summary = {
    generated: new Date().toISOString(),
    icons: {
      ios: Object.keys(iconSizes.ios).length,
      android: Object.keys(iconSizes.android).length
    },
    splashScreens: {
      ios: Object.keys(splashSizes.ios).length,
      android: Object.keys(splashSizes.android).length
    }
  };
  
  fs.writeFileSync(
    path.join(outputDir, 'generation-summary.json'),
    JSON.stringify(summary, null, 2)
  );
  
  console.log('📋 Generation summary saved to generation-summary.json');
}

// Run the script
if (require.main === module) {
  generateIcons().catch(console.error);
}

module.exports = { generateIcons, iconSizes, splashSizes };


#!/usr/bin/env node

/**
 * Android Icon Generation Script for LifeX App
 * Generates Android launcher icons in all required sizes
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Android icon sizes
const androidSizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192
};

async function generateAndroidIcons() {
  console.log('🤖 Generating Android launcher icons...');
  
  const assetsDir = path.join(__dirname, '..', 'assets');
  const androidResDir = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');
  const inputPath = path.join(assetsDir, 'icon.svg');
  
  for (const [folder, size] of Object.entries(androidSizes)) {
    const outputDir = path.join(androidResDir, folder);
    
    // Ensure directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Generate regular launcher icon
    const regularPath = path.join(outputDir, 'ic_launcher.png');
    try {
      await sharp(inputPath)
        .resize(size, size)
        .png()
        .toFile(regularPath);
      console.log(`✅ Generated: ${regularPath}`);
    } catch (error) {
      console.error(`❌ Error generating ${regularPath}:`, error.message);
    }
    
    // Generate round launcher icon
    const roundPath = path.join(outputDir, 'ic_launcher_round.png');
    try {
      await sharp(inputPath)
        .resize(size, size)
        .png()
        .toFile(roundPath);
      console.log(`✅ Generated: ${roundPath}`);
    } catch (error) {
      console.error(`❌ Error generating ${roundPath}:`, error.message);
    }
  }
  
  console.log('🎉 Android icon generation complete!');
}

// Run the script
if (require.main === module) {
  generateAndroidIcons().catch(console.error);
}

module.exports = { generateAndroidIcons };

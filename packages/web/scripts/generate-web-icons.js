#!/usr/bin/env node

/**
 * Web Icon Generation Script for LifeX App
 * Generates web icons (favicon, PWA icons, etc.)
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Web icon sizes
const webIconSizes = {
  'favicon.ico': 32,
  'favicon-16x16.png': 16,
  'favicon-32x32.png': 32,
  'apple-touch-icon.png': 180,
  'android-chrome-192x192.png': 192,
  'android-chrome-512x512.png': 512,
  'icon-192x192.png': 192,
  'icon-512x512.png': 512
};

async function generateWebIcons() {
  console.log('🌐 Generating web icons...');
  
  const assetsDir = path.join(__dirname, '..', '..', 'mobile', 'assets');
  const publicDir = path.join(__dirname, '..', 'public');
  const inputPath = path.join(assetsDir, 'icon.svg');
  
  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  for (const [filename, size] of Object.entries(webIconSizes)) {
    const outputPath = path.join(publicDir, filename);
    
    try {
      if (filename === 'favicon.ico') {
        // Generate ICO file (multi-size)
        await sharp(inputPath)
          .resize(32, 32)
          .png()
          .toFile(outputPath.replace('.ico', '.png'));
        
        // For now, just copy the PNG as ICO (browsers will handle it)
        fs.copyFileSync(outputPath.replace('.ico', '.png'), outputPath);
        console.log(`✅ Generated: ${outputPath}`);
      } else {
        await sharp(inputPath)
          .resize(size, size)
          .png()
          .toFile(outputPath);
        console.log(`✅ Generated: ${outputPath}`);
      }
    } catch (error) {
      console.error(`❌ Error generating ${outputPath}:`, error.message);
    }
  }
  
  console.log('🎉 Web icon generation complete!');
}

// Run the script
if (require.main === module) {
  generateWebIcons().catch(console.error);
}

module.exports = { generateWebIcons };

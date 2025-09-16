# LifeX MVP Mobile Fix Script
Write-Host "Starting LifeX MVP mobile fix..." -ForegroundColor Green

# Step 1: Backup current config
Write-Host "Backing up current config..." -ForegroundColor Yellow
Copy-Item "package.json" "package.json.backup" -ErrorAction SilentlyContinue
Copy-Item "babel.config.js" "babel.config.js.backup" -ErrorAction SilentlyContinue
Copy-Item "metro.config.js" "metro.config.js.backup" -ErrorAction SilentlyContinue

# Step 2: Update package.json
Write-Host "Updating package.json..." -ForegroundColor Yellow
$packageJson = Get-Content "package.json" | ConvertFrom-Json

# Update key dependencies
$packageJson.dependencies."expo" = "~49.0.0"
$packageJson.dependencies."react-native" = "0.72.15"
$packageJson.dependencies."@expo/metro-runtime" = "~2.4.1"
$packageJson.dependencies."expo-camera" = "~13.4.4"
$packageJson.dependencies."expo-location" = "~16.1.0"
$packageJson.dependencies."expo-status-bar" = "~1.6.0"

# Update dev dependencies
$packageJson.devDependencies."@babel/core" = "^7.20.0"
$packageJson.devDependencies."@react-native/babel-preset" = "0.72.11"
$packageJson.devDependencies."@react-native/eslint-config" = "0.72.2"
$packageJson.devDependencies."@react-native/metro-config" = "0.72.11"
$packageJson.devDependencies."@react-native/typescript-config" = "0.72.2"

# Save updated package.json
$packageJson | ConvertTo-Json -Depth 10 | Set-Content "package.json"

# Step 3: Update Babel config
Write-Host "Updating Babel config..." -ForegroundColor Yellow
@"
module.exports = {
  presets: ['babel-preset-expo'],
};
"@ | Set-Content "babel.config.js"

# Step 4: Update Metro config
Write-Host "Updating Metro config..." -ForegroundColor Yellow
@"
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;
"@ | Set-Content "metro.config.js"

# Step 5: Clean and reinstall
Write-Host "Cleaning old dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
}
if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json"
}

Write-Host "Installing new dependencies..." -ForegroundColor Yellow
npm install

Write-Host "Fix completed! Now try starting Expo..." -ForegroundColor Green
Write-Host "Run: npx expo start --clear" -ForegroundColor Cyan

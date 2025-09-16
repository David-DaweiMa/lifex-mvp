# LifeX MVP 移动端修复脚本
# 解决版本兼容性和配置问题

Write-Host "🔧 开始修复LifeX MVP移动端配置..." -ForegroundColor Green

# 步骤1: 备份当前配置
Write-Host "📁 备份当前配置..." -ForegroundColor Yellow
Copy-Item "package.json" "package.json.backup"
Copy-Item "babel.config.js" "babel.config.js.backup"
Copy-Item "metro.config.js" "metro.config.js.backup"

# 步骤2: 更新package.json到稳定版本
Write-Host "📦 更新依赖版本..." -ForegroundColor Yellow
$packageJson = Get-Content "package.json" | ConvertFrom-Json

# 更新关键依赖版本
$packageJson.dependencies."expo" = "~49.0.0"
$packageJson.dependencies."react-native" = "0.72.15"
$packageJson.dependencies."@expo/metro-runtime" = "~2.4.1"
$packageJson.dependencies."expo-camera" = "~13.4.4"
$packageJson.dependencies."expo-location" = "~16.1.0"
$packageJson.dependencies."expo-status-bar" = "~1.6.0"

# 更新开发依赖
$packageJson.devDependencies."@babel/core" = "^7.20.0"
$packageJson.devDependencies."@react-native/babel-preset" = "0.72.11"
$packageJson.devDependencies."@react-native/eslint-config" = "0.72.2"
$packageJson.devDependencies."@react-native/metro-config" = "0.72.11"
$packageJson.devDependencies."@react-native/typescript-config" = "0.72.2"

# 保存更新后的package.json
$packageJson | ConvertTo-Json -Depth 10 | Set-Content "package.json"

# 步骤3: 更新Babel配置
Write-Host "⚙️ 更新Babel配置..." -ForegroundColor Yellow
@"
module.exports = {
  presets: ['babel-preset-expo'],
};
"@ | Set-Content "babel.config.js"

# 步骤4: 更新Metro配置
Write-Host "🚇 更新Metro配置..." -ForegroundColor Yellow
@"
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;
"@ | Set-Content "metro.config.js"

# 步骤5: 清理和重装
Write-Host "🧹 清理旧依赖..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
}
if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json"
}

Write-Host "📥 安装新依赖..." -ForegroundColor Yellow
npm install

Write-Host "✅ 修复完成！现在可以尝试启动Expo..." -ForegroundColor Green
Write-Host "Run: npx expo start --clear" -ForegroundColor Cyan

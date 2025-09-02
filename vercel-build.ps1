# Vercel专用构建脚本 (PowerShell版本)
Write-Host "🚀 开始Vercel构建..." -ForegroundColor Green

# 构建共享包
Write-Host "📦 构建共享包..." -ForegroundColor Yellow
Set-Location packages\shared
npm run build
Set-Location ..\..

# 构建Web包
Write-Host "🌐 构建Web包..." -ForegroundColor Yellow
Set-Location packages\web
npm run build
Set-Location ..\..

# 复制构建输出到根目录（Vercel期望的位置）
Write-Host "📋 复制构建输出..." -ForegroundColor Yellow
if (Test-Path "packages\web\.next") {
    Copy-Item -Path "packages\web\.next" -Destination "." -Recurse -Force
    Write-Host "✅ 构建输出复制完成" -ForegroundColor Green
} else {
    Write-Host "❌ 构建输出目录不存在" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Vercel构建完成！" -ForegroundColor Green

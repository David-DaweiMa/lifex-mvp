# LifeX MVP - Expo开发服务器启动脚本
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    LifeX MVP - Expo开发服务器启动" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查Node.js
Write-Host "检查Node.js版本..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js版本: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "错误: 未找到Node.js，请先安装Node.js" -ForegroundColor Red
    Read-Host "按Enter键退出"
    exit 1
}

# 检查npm
Write-Host ""
Write-Host "检查npm版本..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "npm版本: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "错误: 未找到npm" -ForegroundColor Red
    Read-Host "按Enter键退出"
    exit 1
}

# 安装依赖
Write-Host ""
Write-Host "安装依赖..." -ForegroundColor Yellow
npm install

# 启动Expo服务器
Write-Host ""
Write-Host "启动Expo开发服务器..." -ForegroundColor Yellow
Write-Host ""
Write-Host "请在iPhone上安装Expo Go应用，然后扫描二维码" -ForegroundColor Green
Write-Host "或者访问: http://localhost:8081" -ForegroundColor Green
Write-Host ""
Write-Host "按Ctrl+C停止服务器" -ForegroundColor Yellow
Write-Host ""

npm run expo

Read-Host "按Enter键退出"

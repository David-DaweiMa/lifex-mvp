@echo off
echo ========================================
echo    LifeX MVP - Expo开发服务器启动
echo ========================================
echo.

echo 检查Node.js版本...
node --version
if %errorlevel% neq 0 (
    echo 错误: 未找到Node.js，请先安装Node.js
    pause
    exit /b 1
)

echo.
echo 检查npm版本...
npm --version

echo.
echo 安装依赖...
npm install

echo.
echo 启动Expo开发服务器...
echo.
echo 请在iPhone上安装Expo Go应用，然后扫描二维码
echo 或者访问: http://localhost:8081
echo.
echo 按Ctrl+C停止服务器
echo.

npm run expo

pause

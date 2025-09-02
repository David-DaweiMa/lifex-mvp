#!/bin/bash

# Vercel专用构建脚本
echo "🚀 开始Vercel构建..."

# 构建共享包
echo "📦 构建共享包..."
cd packages/shared
npm run build
cd ../..

# 构建Web包
echo "🌐 构建Web包..."
cd packages/web
npm run build
cd ../..

# 复制构建输出到根目录（Vercel期望的位置）
echo "📋 复制构建输出..."
if [ -d "packages/web/.next" ]; then
    cp -r packages/web/.next ./
    echo "✅ 构建输出复制完成"
else
    echo "❌ 构建输出目录不存在"
    exit 1
fi

echo "🎉 Vercel构建完成！"

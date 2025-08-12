#!/bin/bash

# LifeX 部署脚本
echo "🚀 开始部署 LifeX..."

# 清理之前的构建
echo "🧹 清理之前的构建..."
rm -rf .next
rm -rf out

# 安装依赖
echo "📦 安装依赖..."
npm install

# 类型检查
echo "🔍 类型检查..."
npm run type-check

# 构建项目
echo "🏗️ 构建项目..."
npm run build

# 检查构建结果
if [ -d ".next" ]; then
    echo "✅ 构建成功！"
    echo "📁 构建文件位置: .next/"
    
    # 显示构建信息
    echo "📊 构建统计:"
    ls -la .next/
    
    echo "🎉 部署准备完成！"
    echo ""
    echo "下一步操作:"
    echo "1. 如果使用 Vercel: git push 到主分支"
    echo "2. 如果使用其他平台: 上传 .next 文件夹"
    echo "3. 确保环境变量已正确设置"
else
    echo "❌ 构建失败！"
    exit 1
fi

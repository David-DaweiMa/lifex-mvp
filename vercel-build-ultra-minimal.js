const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

async function vercelBuildUltraMinimal() {
  try {
    console.log('🚀 开始超最小化Vercel构建流程...');
    
    // 1. 构建共享包
    console.log('📦 构建共享包...');
    execSync('npm run build:shared', { stdio: 'inherit' });
    
    // 2. 切换到web目录
    const webDir = path.join(__dirname, 'packages', 'web');
    process.chdir(webDir);
    
    // 3. 使用Vercel配置构建
    console.log('🌐 使用Vercel配置构建web包...');
    const originalConfig = 'next.config.js';
    const vercelConfig = 'next.config.vercel.js';
    
    // 备份原配置
    if (fs.existsSync(originalConfig)) {
      await fs.copy(originalConfig, originalConfig + '.backup');
    }
    
    // 使用Vercel配置
    if (fs.existsSync(vercelConfig)) {
      await fs.copy(vercelConfig, originalConfig);
      console.log('✅ 已切换到Vercel配置');
    }
    
    // 4. 构建
    execSync('npm run build', { stdio: 'inherit' });
    
    // 5. 恢复原配置
    if (fs.existsSync(originalConfig + '.backup')) {
      await fs.copy(originalConfig + '.backup', originalConfig);
      await fs.remove(originalConfig + '.backup');
      console.log('✅ 已恢复原配置');
    }
    
    // 6. 回到根目录
    process.chdir(__dirname);
    
    // 7. 复制构建输出
    console.log('📋 复制构建输出...');
    const sourcePath = path.join(__dirname, 'packages', 'web', '.next');
    const targetPath = path.join(__dirname, '.next');
    
    // 删除目标目录（如果存在）
    if (fs.existsSync(targetPath)) {
      await fs.remove(targetPath);
      console.log('🗑️  已删除旧的目标目录');
    }
    
    // 复制文件
    await fs.copy(sourcePath, targetPath);
    console.log('✅ 构建输出复制完成！');
    
    // 8. 验证关键文件
    console.log('🔍 验证构建结果...');
    const criticalFiles = [
      'routes-manifest.json',
      'build-manifest.json',
      'prerender-manifest.json'
    ];
    
    for (const file of criticalFiles) {
      const filePath = path.join(targetPath, file);
      if (fs.existsSync(filePath)) {
        console.log(`✅ ${file} 存在`);
      } else {
        console.log(`⚠️  ${file} 缺失`);
      }
    }
    
    // 9. 最终检查
    const files = await fs.readdir(targetPath);
    console.log(`📁 目标目录包含 ${files.length} 个项目`);
    
    console.log('🎉 超最小化Vercel构建流程完成！');
    
  } catch (error) {
    console.error('❌ Vercel构建失败:', error);
    process.exit(1);
  }
}

vercelBuildUltraMinimal();

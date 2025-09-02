const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

async function vercelBuild() {
  try {
    console.log('🚀 开始Vercel专用构建流程...');
    
    // 检查是否在Vercel环境
    const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
    console.log(`🌐 部署环境: ${isVercel ? 'Vercel' : '本地'}`);
    
    // 1. 检查并修复依赖
    console.log('🔧 检查并修复依赖...');
    await checkAndFixDependencies();
    
    // 2. 构建共享包
    console.log('📦 构建共享包...');
    execSync('npm run build:shared', { stdio: 'inherit' });
    
    // 3. 切换到web目录
    const webDir = path.join(__dirname, 'packages', 'web');
    process.chdir(webDir);
    
    // 4. 使用Vercel配置构建
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
    
    // 5. 构建
    execSync('npm run build', { stdio: 'inherit' });
    
    // 6. 恢复原配置
    if (fs.existsSync(originalConfig + '.backup')) {
      await fs.copy(originalConfig + '.backup', originalConfig);
      await fs.remove(originalConfig + '.backup');
      console.log('✅ 已恢复原配置');
    }
    
    // 7. 回到根目录
    process.chdir(__dirname);
    
    // 8. 复制构建输出
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
    
    // 9. Vercel环境深度清理
    console.log('🧹 Vercel环境深度清理...');
    const problematicPaths = [
      path.join(targetPath, 'node_modules'),
      path.join(targetPath, 'cache'),
      path.join(targetPath, '.swc'),
      path.join(targetPath, 'trace')
    ];
    
    for (const problematicPath of problematicPaths) {
      try {
        if (fs.existsSync(problematicPath)) {
          await fs.remove(problematicPath);
          console.log(`🧹 已清理: ${path.basename(problematicPath)}`);
        }
      } catch (cleanupError) {
        console.log(`⚠️  清理失败: ${path.basename(problematicPath)}`);
      }
    }
    
    // 10. 清理NFT文件中的SWC引用
    console.log('🧹 清理NFT文件中的SWC引用...');
    try {
      const { execSync: execSyncAsync } = require('child_process');
      execSyncAsync('node clean-nft.js', { stdio: 'inherit' });
      console.log('✅ NFT文件清理完成');
    } catch (error) {
      console.log('⚠️  NFT文件清理失败，继续...');
    }
    
    // 11. 验证结果
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
    
    // 12. 最终检查
    const files = await fs.readdir(targetPath);
    console.log(`📁 目标目录包含 ${files.length} 个项目`);
    
    // 13. 最终验证 - 只在非Vercel环境中执行
    if (!isVercel) {
      console.log('🔍 最终验证 - 检查SWC引用...');
      try {
        const { execSync: execSyncAsync } = require('child_process');
        execSyncAsync('node deep-check.js', { stdio: 'inherit' });
      } catch (error) {
        console.log('⚠️  最终验证失败，继续...');
      }
    } else {
      console.log('🌐 Vercel环境：跳过最终验证，避免访问已清理的依赖');
    }
    
    console.log('🎉 Vercel构建流程完成！');
    
  } catch (error) {
    console.error('❌ Vercel构建失败:', error);
    process.exit(1);
  }
}

async function checkAndFixDependencies() {
  try {
    console.log('📦 检查关键依赖...');
    
    // 检查caniuse-lite
    const caniusePath = path.join(__dirname, 'node_modules', 'caniuse-lite');
    const caniuseDataPath = path.join(caniusePath, 'data', 'agents.js');
    
    if (!fs.existsSync(caniuseDataPath)) {
      console.log('⚠️  caniuse-lite数据文件缺失，尝试修复...');
      
      // 尝试重新安装caniuse-lite
      try {
        execSync('npm install caniuse-lite@latest', { stdio: 'inherit' });
        console.log('✅ caniuse-lite重新安装完成');
      } catch (error) {
        console.log('⚠️  caniuse-lite重新安装失败，继续...');
      }
    } else {
      console.log('✅ caniuse-lite数据文件正常');
    }
    
    // 检查其他关键依赖
    const criticalDeps = ['autoprefixer', 'postcss', 'tailwindcss'];
    for (const dep of criticalDeps) {
      const depPath = path.join(__dirname, 'node_modules', dep);
      if (fs.existsSync(depPath)) {
        console.log(`✅ ${dep} 正常`);
      } else {
        console.log(`⚠️  ${dep} 缺失`);
      }
    }
    
  } catch (error) {
    console.log('⚠️  依赖检查失败，继续...');
  }
}

vercelBuild();

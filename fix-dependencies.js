const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

async function fixDependencies() {
  try {
    console.log('🔧 开始检查和修复依赖问题...');
    
    // 1. 检查caniuse-lite是否存在
    console.log('📦 检查caniuse-lite依赖...');
    const caniusePath = path.join(__dirname, 'node_modules', 'caniuse-lite');
    
    if (fs.existsSync(caniusePath)) {
      console.log('✅ caniuse-lite已存在');
      
      // 检查数据文件
      const dataPath = path.join(caniusePath, 'data', 'agents.js');
      if (fs.existsSync(dataPath)) {
        console.log('✅ caniuse-lite数据文件存在');
      } else {
        console.log('⚠️  caniuse-lite数据文件缺失，尝试修复...');
        await fixCaniuseLite();
      }
    } else {
      console.log('⚠️  caniuse-lite不存在，尝试安装...');
      await installCaniuseLite();
    }
    
    // 2. 检查其他可能缺失的依赖
    console.log('🔍 检查其他依赖...');
    const criticalDeps = [
      'autoprefixer',
      'postcss',
      'tailwindcss'
    ];
    
    for (const dep of criticalDeps) {
      const depPath = path.join(__dirname, 'node_modules', dep);
      if (fs.existsSync(depPath)) {
        console.log(`✅ ${dep} 存在`);
      } else {
        console.log(`⚠️  ${dep} 缺失`);
      }
    }
    
    // 3. 尝试重新安装依赖
    console.log('🔄 尝试重新安装依赖...');
    try {
      execSync('npm install', { stdio: 'inherit' });
      console.log('✅ 依赖重新安装完成');
    } catch (error) {
      console.log('⚠️  依赖重新安装失败，尝试清理后重新安装...');
      
      // 清理node_modules
      if (fs.existsSync('node_modules')) {
        await fs.remove('node_modules');
        console.log('🗑️  已清理node_modules');
      }
      
      // 清理package-lock.json
      if (fs.existsSync('package-lock.json')) {
        await fs.remove('package-lock.json');
        console.log('🗑️  已清理package-lock.json');
      }
      
      // 重新安装
      execSync('npm install', { stdio: 'inherit' });
      console.log('✅ 依赖重新安装完成');
    }
    
    // 4. 最终验证
    console.log('🔍 最终验证...');
    await finalVerification();
    
  } catch (error) {
    console.error('❌ 依赖修复失败:', error);
  }
}

async function fixCaniuseLite() {
  try {
    console.log('🔧 修复caniuse-lite...');
    
    // 尝试重新安装caniuse-lite
    execSync('npm install caniuse-lite@latest', { stdio: 'inherit' });
    
    // 验证修复
    const dataPath = path.join(__dirname, 'node_modules', 'caniuse-lite', 'data', 'agents.js');
    if (fs.existsSync(dataPath)) {
      console.log('✅ caniuse-lite修复成功');
    } else {
      console.log('⚠️  caniuse-lite修复失败');
    }
  } catch (error) {
    console.log('⚠️  caniuse-lite修复失败:', error.message);
  }
}

async function installCaniuseLite() {
  try {
    console.log('📦 安装caniuse-lite...');
    execSync('npm install caniuse-lite@latest', { stdio: 'inherit' });
    console.log('✅ caniuse-lite安装完成');
  } catch (error) {
    console.log('⚠️  caniuse-lite安装失败:', error.message);
  }
}

async function finalVerification() {
  try {
    const caniusePath = path.join(__dirname, 'node_modules', 'caniuse-lite');
    const dataPath = path.join(caniusePath, 'data', 'agents.js');
    
    if (fs.existsSync(dataPath)) {
      console.log('✅ 最终验证: caniuse-lite数据文件存在');
      
      // 检查文件大小
      const stats = await fs.stat(dataPath);
      console.log(`📊 数据文件大小: ${(stats.size / 1024).toFixed(2)} KB`);
      
      return true;
    } else {
      console.log('❌ 最终验证失败: caniuse-lite数据文件仍然缺失');
      return false;
    }
  } catch (error) {
    console.log('⚠️  最终验证失败:', error.message);
    return false;
  }
}

fixDependencies();

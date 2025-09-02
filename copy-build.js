const fs = require('fs-extra');
const path = require('path');

async function copyBuildOutput() {
  try {
    const sourcePath = path.join(__dirname, 'packages', 'web', '.next');
    const targetPath = path.join(__dirname, '.next');
    
    console.log('📋 开始复制构建输出...');
    console.log(`源路径: ${sourcePath}`);
    console.log(`目标路径: ${targetPath}`);
    
    // 检查源目录是否存在
    if (!fs.existsSync(sourcePath)) {
      console.error('❌ 源目录不存在:', sourcePath);
      process.exit(1);
    }
    
    // 删除目标目录（如果存在）
    if (fs.existsSync(targetPath)) {
      await fs.remove(targetPath);
      console.log('🗑️  已删除旧的目标目录');
    }
    
    // 复制文件
    await fs.copy(sourcePath, targetPath);
    console.log('✅ 构建输出复制完成！');
    
    // 深度清理可能导致问题的文件和目录
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
    
    // 验证复制结果
    if (fs.existsSync(path.join(targetPath, 'routes-manifest.json'))) {
      console.log('✅ routes-manifest.json 文件已找到');
    } else {
      console.log('⚠️  routes-manifest.json 文件未找到');
    }
    
    // 列出目标目录内容
    const files = await fs.readdir(targetPath);
    console.log(`📁 目标目录包含 ${files.length} 个项目`);
    
    // 验证关键文件
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
    
    // 最终验证 - 确保没有node_modules
    const finalCheck = path.join(targetPath, 'node_modules');
    if (!fs.existsSync(finalCheck)) {
      console.log('✅ 确认没有node_modules目录');
    } else {
      console.log('⚠️  警告: node_modules目录仍然存在');
    }
    
  } catch (error) {
    console.error('❌ 复制失败:', error);
    process.exit(1);
  }
}

copyBuildOutput();

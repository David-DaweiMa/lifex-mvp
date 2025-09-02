const fs = require('fs-extra');
const path = require('path');

async function deepCheck() {
  try {
    console.log('🔍 开始深度检查构建输出...');
    
    const nextDir = path.join(__dirname, '.next');
    if (!fs.existsSync(nextDir)) {
      console.error('❌ .next目录不存在');
      return;
    }
    
    // 1. 检查所有文件中的SWC引用
    console.log('📋 检查所有文件中的SWC引用...');
    const allFiles = await getAllFiles(nextDir);
    const swcReferences = [];
    
    for (const file of allFiles) {
      if (file.endsWith('.js') || file.endsWith('.json')) {
        try {
          const content = await fs.readFile(file, 'utf8');
          if (content.includes('@swc') || content.includes('.swc') || content.includes('swc')) {
            swcReferences.push({
              file: path.relative(__dirname, file),
              content: content.substring(0, 200) + '...'
            });
          }
        } catch (error) {
          // 忽略读取错误
        }
      }
    }
    
    if (swcReferences.length > 0) {
      console.log(`⚠️  发现 ${swcReferences.length} 个文件包含SWC引用:`);
      swcReferences.forEach(ref => {
        console.log(`   📄 ${ref.file}`);
        console.log(`      ${ref.content}`);
      });
    } else {
      console.log('✅ 没有发现SWC引用');
    }
    
    // 2. 检查文件路径中的SWC
    console.log('🔍 检查文件路径中的SWC...');
    const swcFiles = allFiles.filter(file => 
      file.includes('@swc') || file.includes('.swc') || file.includes('swc')
    );
    
    if (swcFiles.length > 0) {
      console.log(`⚠️  发现 ${swcFiles.length} 个SWC相关文件:`);
      swcFiles.forEach(file => {
        console.log(`   📁 ${path.relative(__dirname, file)}`);
      });
    } else {
      console.log('✅ 没有发现SWC相关文件');
    }
    
    // 3. 检查特定目录结构
    console.log('📁 检查特定目录结构...');
    const specificPaths = [
      'node_modules',
      'cache',
      '.swc',
      'trace',
      'swc',
      '@swc'
    ];
    
    for (const specificPath of specificPaths) {
      const fullPath = path.join(nextDir, specificPath);
      if (fs.existsSync(fullPath)) {
        console.log(`⚠️  发现目录: ${specificPath}`);
        try {
          const stats = await fs.stat(fullPath);
          if (stats.isDirectory()) {
            const files = await fs.readdir(fullPath);
            console.log(`   包含 ${files.length} 个项目`);
          }
        } catch (error) {
          console.log(`   无法读取目录内容`);
        }
      } else {
        console.log(`✅ 目录不存在: ${specificPath}`);
      }
    }
    
    // 4. 检查package.json中的依赖
    console.log('📦 检查package.json中的依赖...');
    const packageJsonPath = path.join(nextDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
        if (packageJson.dependencies) {
          const swcDeps = Object.keys(packageJson.dependencies).filter(dep => 
            dep.includes('swc') || dep.includes('@swc')
          );
          if (swcDeps.length > 0) {
            console.log(`⚠️  package.json中包含SWC依赖: ${swcDeps.join(', ')}`);
          } else {
            console.log('✅ package.json中没有SWC依赖');
          }
        }
      } catch (error) {
        console.log('⚠️  无法读取package.json');
      }
    } else {
      console.log('✅ 没有package.json文件');
    }
    
    // 5. 递归检查所有子目录
    console.log('🔍 递归检查所有子目录...');
    await checkDirectoryRecursively(nextDir, '');
    
  } catch (error) {
    console.error('❌ 深度检查失败:', error);
  }
}

async function getAllFiles(dir) {
  const files = [];
  const items = await fs.readdir(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...await getAllFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  
  return files;
}

async function checkDirectoryRecursively(dir, prefix) {
  try {
    const items = await fs.readdir(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      const relativePath = path.relative(process.cwd(), fullPath);
      
      if (item.isDirectory()) {
        if (item.name.includes('swc') || item.name.includes('@swc')) {
          console.log(`⚠️  发现SWC目录: ${relativePath}`);
        }
        await checkDirectoryRecursively(fullPath, prefix + '  ');
      } else if (item.name.includes('swc') || item.name.includes('@swc')) {
        console.log(`⚠️  发现SWC文件: ${relativePath}`);
      }
    }
  } catch (error) {
    // 忽略读取错误
  }
}

deepCheck();

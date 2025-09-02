const fs = require('fs-extra');
const path = require('path');

async function cleanNFTFiles() {
  try {
    console.log('🧹 开始清理NFT文件中的SWC引用...');
    
    const nextDir = path.join(__dirname, '.next');
    if (!fs.existsSync(nextDir)) {
      console.error('❌ .next目录不存在');
      return;
    }
    
    // 查找所有.nft.json文件
    const nftFiles = await findNFTFiles(nextDir);
    console.log(`📋 发现 ${nftFiles.length} 个NFT文件`);
    
    let cleanedCount = 0;
    
    for (const nftFile of nftFiles) {
      try {
        const content = await fs.readFile(nftFile, 'utf8');
        const originalContent = content;
        
        // 清理SWC相关引用
        let cleanedContent = content;
        
        // 移除所有SWC helpers引用
        cleanedContent = cleanedContent.replace(
          /"\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/node_modules\/@swc\/helpers[^"]*"/g,
          '""'
        );
        
        cleanedContent = cleanedContent.replace(
          /"\.\.\/\.\.\/\.\.\/node_modules\/@swc\/helpers[^"]*"/g,
          '""'
        );
        
        // 移除SWC相关路径
        cleanedContent = cleanedContent.replace(
          /"\.\.\/\.\.\/\.\.\/\.\.\/node_modules\/@swc\/helpers[^"]*"/g,
          '""'
        );
        
        // 移除空字符串条目
        cleanedContent = cleanedContent.replace(/"",/g, '');
        cleanedContent = cleanedContent.replace(/,""/g, '');
        cleanedContent = cleanedContent.replace(/\[\s*,\s*\]/g, '[]');
        cleanedContent = cleanedContent.replace(/{\s*,\s*}/g, '{}');
        
        // 清理JSON数组中的空字符串
        cleanedContent = cleanedContent.replace(/\[\s*,\s*,\s*\]/g, '[]');
        cleanedContent = cleanedContent.replace(/\[\s*,\s*\]/g, '[]');
        
        // 如果内容有变化，写回文件
        if (cleanedContent !== originalContent) {
          await fs.writeFile(nftFile, cleanedContent, 'utf8');
          console.log(`✅ 已清理: ${path.relative(__dirname, nftFile)}`);
          cleanedCount++;
        }
        
      } catch (error) {
        console.log(`⚠️  处理文件失败: ${path.relative(__dirname, nftFile)}`);
      }
    }
    
    // 特殊处理required-server-files.json
    const requiredServerFilesPath = path.join(nextDir, 'required-server-files.json');
    if (fs.existsSync(requiredServerFilesPath)) {
      try {
        const content = await fs.readFile(requiredServerFilesPath, 'utf8');
        let cleanedContent = content;
        
        // 移除SWC相关配置
        cleanedContent = cleanedContent.replace(/"swcMinify":\s*false,?/g, '');
        cleanedContent = cleanedContent.replace(/"forceSwcTransforms":\s*false,?/g, '');
        cleanedContent = cleanedContent.replace(/"swcTraceProfiling":\s*false,?/g, '');
        
        // 清理多余的逗号
        cleanedContent = cleanedContent.replace(/,\s*}/g, '}');
        cleanedContent = cleanedContent.replace(/,\s*]/g, ']');
        
        if (cleanedContent !== content) {
          await fs.writeFile(requiredServerFilesPath, cleanedContent, 'utf8');
          console.log('✅ 已清理: required-server-files.json');
          cleanedCount++;
        }
      } catch (error) {
        console.log('⚠️  处理required-server-files.json失败');
      }
    }
    
    console.log(`🎉 清理完成！共清理了 ${cleanedCount} 个文件`);
    
    // 验证清理结果
    console.log('🔍 验证清理结果...');
    await verifyCleaning(nextDir);
    
  } catch (error) {
    console.error('❌ 清理失败:', error);
  }
}

async function findNFTFiles(dir) {
  const files = [];
  const items = await fs.readdir(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...await findNFTFiles(fullPath));
    } else if (item.name.endsWith('.nft.json')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

async function verifyCleaning(nextDir) {
  const nftFiles = await findNFTFiles(nextDir);
  let swcReferences = 0;
  
  for (const nftFile of nftFiles) {
    try {
      const content = await fs.readFile(nftFile, 'utf8');
      if (content.includes('@swc') || content.includes('.swc') || content.includes('swc')) {
        swcReferences++;
        console.log(`⚠️  仍然包含SWC引用: ${path.relative(__dirname, nftFile)}`);
        
        // 显示具体的SWC引用
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (line.includes('@swc') || line.includes('.swc') || line.includes('swc')) {
            console.log(`   行 ${index + 1}: ${line.trim()}`);
          }
        });
      }
    } catch (error) {
      // 忽略读取错误
    }
  }
  
  // 检查required-server-files.json
  const requiredServerFilesPath = path.join(nextDir, 'required-server-files.json');
  if (fs.existsSync(requiredServerFilesPath)) {
    try {
      const content = await fs.readFile(requiredServerFilesPath, 'utf8');
      if (content.includes('@swc') || content.includes('.swc') || content.includes('swc')) {
        swcReferences++;
        console.log(`⚠️  required-server-files.json仍然包含SWC引用`);
      }
    } catch (error) {
      // 忽略读取错误
    }
  }
  
  if (swcReferences === 0) {
    console.log('✅ 所有SWC引用已清理完成！');
  } else {
    console.log(`⚠️  仍有 ${swcReferences} 个文件包含SWC引用`);
  }
}

cleanNFTFiles();

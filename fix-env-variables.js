const fs = require('fs');
const path = require('path');

console.log('🔧 环境变量修复工具\n');

// 检查.env.local文件
const envPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), 'env.example');

function checkEnvFile() {
  console.log('1️⃣ 检查环境变量文件...');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env.local 文件不存在');
    console.log('📝 正在从 env.example 创建 .env.local...');
    
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ 已创建 .env.local 文件');
    } else {
      console.log('❌ env.example 文件不存在');
      return false;
    }
  } else {
    console.log('✅ .env.local 文件存在');
  }
  
  return true;
}

function checkRequiredVariables() {
  console.log('\n2️⃣ 检查必需的环境变量...');
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'RESEND_API_KEY',
    'RESEND_FROM_EMAIL'
  ];
  
  const missingVars = [];
  const existingVars = [];
  
  for (const varName of requiredVars) {
    const line = lines.find(line => line.startsWith(varName + '='));
    if (line && !line.includes('your_') && line.trim() !== varName + '=') {
      existingVars.push(varName);
    } else {
      missingVars.push(varName);
    }
  }
  
  console.log('✅ 已配置的变量:');
  existingVars.forEach(varName => {
    console.log(`   ${varName}`);
  });
  
  if (missingVars.length > 0) {
    console.log('\n❌ 缺失的变量:');
    missingVars.forEach(varName => {
      console.log(`   ${varName}`);
    });
    
    console.log('\n📋 需要配置的变量说明:');
    console.log('   NEXT_PUBLIC_SUPABASE_URL: Supabase项目URL');
    console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY: Supabase匿名密钥');
    console.log('   SUPABASE_SERVICE_ROLE_KEY: Supabase服务角色密钥（关键！）');
    console.log('   RESEND_API_KEY: Resend邮件服务API密钥');
    console.log('   RESEND_FROM_EMAIL: 发件人邮箱地址');
    
    return missingVars;
  } else {
    console.log('\n✅ 所有必需的环境变量都已配置');
    return [];
  }
}

function provideInstructions(missingVars) {
  if (missingVars.length === 0) return;
  
  console.log('\n📖 配置说明:');
  console.log('\n1. 获取Supabase密钥:');
  console.log('   - 访问 https://supabase.com/dashboard');
  console.log('   - 选择你的项目');
  console.log('   - 进入 Settings > API');
  console.log('   - 复制 Project URL 和 API keys');
  
  console.log('\n2. 获取Resend密钥:');
  console.log('   - 访问 https://resend.com');
  console.log('   - 注册账户并获取API密钥');
  console.log('   - 验证发件人域名');
  
  console.log('\n3. 编辑 .env.local 文件:');
  console.log('   - 打开 .env.local 文件');
  console.log('   - 替换所有 "your_xxx" 为实际值');
  console.log('   - 保存文件');
  
  console.log('\n4. 验证配置:');
  console.log('   - 运行: node test-token-save-simple.js');
  console.log('   - 检查是否还有错误');
}

function main() {
  try {
    // 检查环境文件
    if (!checkEnvFile()) {
      return;
    }
    
    // 检查必需变量
    const missingVars = checkRequiredVariables();
    
    // 提供配置说明
    provideInstructions(missingVars);
    
    console.log('\n🏁 环境变量检查完成');
    
    if (missingVars.length > 0) {
      console.log('\n⚠️ 请配置缺失的环境变量后重新运行此脚本');
    } else {
      console.log('\n✅ 环境变量配置正确，可以运行测试脚本验证功能');
    }
    
  } catch (error) {
    console.error('❌ 检查过程中发生错误:', error.message);
  }
}

// 运行主函数
main();

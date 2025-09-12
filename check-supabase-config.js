// 检查Supabase配置的脚本
const fs = require('fs');
const path = require('path');

console.log('🔍 检查Supabase配置...\n');

// 检查可能的配置文件位置
const configFiles = [
  '.env',
  '.env.local',
  '.env.development',
  'packages/web/.env',
  'packages/web/.env.local',
  'packages/web/.env.development'
];

let foundConfig = false;

for (const configFile of configFiles) {
  if (fs.existsSync(configFile)) {
    console.log(`✅ 找到配置文件: ${configFile}`);
    try {
      const content = fs.readFileSync(configFile, 'utf8');
      const lines = content.split('\n');
      
      let hasSupabaseUrl = false;
      let hasSupabaseKey = false;
      
      lines.forEach(line => {
        if (line.includes('NEXT_PUBLIC_SUPABASE_URL')) {
          hasSupabaseUrl = true;
          console.log(`  📡 Supabase URL: ${line.split('=')[1] || '未设置'}`);
        }
        if (line.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')) {
          hasSupabaseKey = true;
          const key = line.split('=')[1] || '未设置';
          console.log(`  🔑 Supabase Key: ${key.substring(0, 20)}...`);
        }
      });
      
      if (hasSupabaseUrl && hasSupabaseKey) {
        foundConfig = true;
        console.log(`  ✅ 配置完整`);
      } else {
        console.log(`  ⚠️ 配置不完整 - URL: ${hasSupabaseUrl}, Key: ${hasSupabaseKey}`);
      }
    } catch (error) {
      console.log(`  ❌ 读取失败: ${error.message}`);
    }
    console.log('');
  }
}

if (!foundConfig) {
  console.log('❌ 未找到有效的Supabase配置文件');
  console.log('\n📝 请创建 .env 文件并添加以下内容:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
  console.log('\n💡 您可以从以下位置获取这些值:');
  console.log('1. 登录 Supabase Dashboard');
  console.log('2. 选择您的项目');
  console.log('3. 进入 Settings > API');
  console.log('4. 复制 Project URL 和 anon public key');
}

// 检查package.json中的依赖
console.log('\n📦 检查Supabase依赖:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const webPackageJson = JSON.parse(fs.readFileSync('packages/web/package.json', 'utf8'));
  
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
    ...webPackageJson.dependencies,
    ...webPackageJson.devDependencies
  };
  
  if (allDeps['@supabase/supabase-js']) {
    console.log(`  ✅ @supabase/supabase-js: ${allDeps['@supabase/supabase-js']}`);
  } else {
    console.log('  ❌ @supabase/supabase-js: 未安装');
  }
  
  if (allDeps['dotenv']) {
    console.log(`  ✅ dotenv: ${allDeps['dotenv']}`);
  } else {
    console.log('  ❌ dotenv: 未安装');
  }
} catch (error) {
  console.log(`  ❌ 检查依赖失败: ${error.message}`);
}

console.log('\n✅ 配置检查完成！');

// 简单的数据库检查脚本 - 使用Supabase REST API
const https = require('https');

// 从环境变量获取配置
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少Supabase环境变量');
  console.log('请确保 .env 文件包含:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key');
  process.exit(1);
}

// 提取项目ID
const projectId = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
if (!projectId) {
  console.error('❌ 无法从URL中提取项目ID');
  process.exit(1);
}

console.log(`🔍 检查项目: ${projectId}`);
console.log(`📡 API URL: ${supabaseUrl}\n`);

// 简单的HTTP请求函数
function makeRequest(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const url = new URL(path, supabaseUrl);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ data: jsonData, status: res.statusCode });
        } catch (error) {
          resolve({ data: data, status: res.statusCode });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function checkDatabase() {
  try {
    console.log('📊 1. 检查现有数据统计:');
    
    // 检查各个表的数据
    const tables = ['businesses', 'specials', 'user_profiles', 'trending_posts', 'post_likes', 'post_shares'];
    
    for (const table of tables) {
      try {
        const result = await makeRequest(`/rest/v1/${table}?select=*&limit=1`);
        if (result.status === 200) {
          // 获取总数
          const countResult = await makeRequest(`/rest/v1/${table}?select=*&limit=0`);
          const count = countResult.data?.length || 0;
          console.log(`  ✅ ${table}: ${count} 条记录`);
        } else {
          console.log(`  ❌ ${table}: 表不存在或无法访问 (状态: ${result.status})`);
        }
      } catch (error) {
        console.log(`  ❌ ${table}: 检查失败 - ${error.message}`);
      }
    }

    console.log('\n📝 2. 获取示例数据:');
    
    // 获取businesses示例数据
    try {
      const result = await makeRequest('/rest/v1/businesses?select=id,name,business_type,verification_status&limit=3');
      if (result.status === 200 && result.data.length > 0) {
        console.log('  Businesses示例:');
        result.data.forEach(business => {
          console.log(`    - ${business.name} (${business.business_type}) - 验证状态: ${business.verification_status}`);
        });
      } else {
        console.log('  Businesses: 无数据');
      }
    } catch (error) {
      console.log(`  Businesses: 获取失败 - ${error.message}`);
    }

    // 获取specials示例数据
    try {
      const result = await makeRequest('/rest/v1/specials?select=id,title,category,is_verified,is_active&limit=3');
      if (result.status === 200 && result.data.length > 0) {
        console.log('  Specials示例:');
        result.data.forEach(special => {
          console.log(`    - ${special.title} (${special.category}) - 验证: ${special.is_verified}, 活跃: ${special.is_active}`);
        });
      } else {
        console.log('  Specials: 无数据');
      }
    } catch (error) {
      console.log(`  Specials: 获取失败 - ${error.message}`);
    }

    // 获取user_profiles示例数据
    try {
      const result = await makeRequest('/rest/v1/user_profiles?select=id,username,email&limit=3');
      if (result.status === 200 && result.data.length > 0) {
        console.log('  User Profiles示例:');
        result.data.forEach(user => {
          console.log(`    - ${user.username} (${user.email})`);
        });
      } else {
        console.log('  User Profiles: 无数据');
      }
    } catch (error) {
      console.log(`  User Profiles: 获取失败 - ${error.message}`);
    }

    console.log('\n🔗 3. 测试API连接:');
    
    // 测试API连接
    try {
      const result = await makeRequest('/rest/v1/');
      if (result.status === 200) {
        console.log('  ✅ Supabase API连接正常');
      } else {
        console.log(`  ⚠️ API响应状态: ${result.status}`);
      }
    } catch (error) {
      console.log(`  ❌ API连接失败: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ 检查数据库时发生错误:', error.message);
  }
}

// 运行检查
checkDatabase().then(() => {
  console.log('\n✅ 数据库检查完成！');
  process.exit(0);
}).catch(error => {
  console.error('❌ 脚本执行失败:', error.message);
  process.exit(1);
});

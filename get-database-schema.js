// 获取完整数据库架构的脚本
const https = require('https');

// 从环境变量获取配置
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少Supabase环境变量');
  process.exit(1);
}

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

async function getTableSchema(tableName) {
  try {
    // 获取表结构信息
    const result = await makeRequest(`/rest/v1/${tableName}?select=*&limit=1`);
    
    if (result.status === 200) {
      // 获取一条记录来了解字段结构
      const sampleResult = await makeRequest(`/rest/v1/${tableName}?select=*&limit=1`);
      
      if (sampleResult.data && sampleResult.data.length > 0) {
        const sampleRecord = sampleResult.data[0];
        console.log(`\n📋 ${tableName} 表结构:`);
        console.log('字段名 | 类型 | 示例值');
        console.log('------|------|--------');
        
        Object.keys(sampleRecord).forEach(key => {
          const value = sampleRecord[key];
          const type = typeof value;
          const example = value === null ? 'null' : 
                         type === 'string' ? `"${value.substring(0, 30)}${value.length > 30 ? '...' : ''}"` :
                         type === 'object' ? JSON.stringify(value).substring(0, 30) + '...' :
                         String(value);
          console.log(`${key} | ${type} | ${example}`);
        });
        
        return true;
      } else {
        console.log(`\n📋 ${tableName} 表: 存在但无数据`);
        return true;
      }
    } else {
      console.log(`\n❌ ${tableName} 表: 不存在或无法访问 (状态: ${result.status})`);
      return false;
    }
  } catch (error) {
    console.log(`\n❌ ${tableName} 表: 检查失败 - ${error.message}`);
    return false;
  }
}

async function getDatabaseSchema() {
  console.log('🔍 获取完整数据库架构...\n');
  console.log(`📡 项目: ${supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]}`);

  const tables = [
    'businesses',
    'specials', 
    'special_claims',
    'special_views',
    'user_profiles',
    'trending_posts',
    'post_likes',
    'post_shares',
    'post_comments'
  ];

  let existingTables = [];
  
  for (const table of tables) {
    const exists = await getTableSchema(table);
    if (exists) {
      existingTables.push(table);
    }
  }

  console.log('\n📊 数据统计:');
  for (const table of existingTables) {
    try {
      const result = await makeRequest(`/rest/v1/${table}?select=*&limit=0`);
      const count = result.data?.length || 0;
      console.log(`  - ${table}: ${count} 条记录`);
    } catch (error) {
      console.log(`  - ${table}: 统计失败`);
    }
  }

  console.log('\n✅ 数据库架构检查完成！');
  console.log(`\n📝 发现的表: ${existingTables.join(', ')}`);
}

// 运行检查
getDatabaseSchema().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('❌ 脚本执行失败:', error.message);
  process.exit(1);
});



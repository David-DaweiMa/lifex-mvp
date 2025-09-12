#!/usr/bin/env node
/**
 * 快速数据库检查工具
 * 快速获取数据库状态和关键信息
 */

const https = require('https');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少Supabase环境变量');
  process.exit(1);
}

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, supabaseUrl);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ data: JSON.parse(data), status: res.statusCode });
        } catch (error) {
          resolve({ data: data, status: res.statusCode });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function quickCheck() {
  console.log('⚡ 快速数据库检查');
  console.log(`📡 项目: ${supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]}`);
  console.log(`⏰ 时间: ${new Date().toLocaleString()}\n`);

  const tables = ['businesses', 'specials', 'user_profiles', 'trending_posts'];
  
  console.log('📊 数据统计:');
  for (const table of tables) {
    try {
      const result = await makeRequest(`/rest/v1/${table}?select=*&limit=0`);
      const count = result.data?.length || 0;
      console.log(`  ✅ ${table}: ${count} 条记录`);
    } catch (error) {
      console.log(`  ❌ ${table}: 检查失败`);
    }
  }

  console.log('\n🔍 关键字段检查:');
  
  // 检查businesses表的关键字段
  try {
    const result = await makeRequest('/rest/v1/businesses?select=id,name,verification_status,business_type&limit=1');
    if (result.data && result.data.length > 0) {
      const business = result.data[0];
      console.log('  Businesses表字段:');
      console.log(`    - verification_status: ${business.verification_status}`);
      console.log(`    - business_type: ${business.business_type || 'null'}`);
    }
  } catch (error) {
    console.log('  Businesses: 字段检查失败');
  }

  // 检查specials表的关键字段
  try {
    const result = await makeRequest('/rest/v1/specials?select=id,title,is_verified,is_active&limit=1');
    if (result.data && result.data.length > 0) {
      const special = result.data[0];
      console.log('  Specials表字段:');
      console.log(`    - is_verified: ${special.is_verified}`);
      console.log(`    - is_active: ${special.is_active}`);
    }
  } catch (error) {
    console.log('  Specials: 字段检查失败');
  }

  console.log('\n✅ 快速检查完成！');
}

quickCheck().catch(error => {
  console.error('❌ 检查失败:', error.message);
  process.exit(1);
});

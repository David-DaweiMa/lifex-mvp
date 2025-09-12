#!/usr/bin/env node
/**
 * 测试Specials API - 使用正确的service role key
 */

const https = require('https');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少Supabase环境变量');
  console.log('需要: NEXT_PUBLIC_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, supabaseUrl);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData);
          resolve({ data: jsonData, status: res.statusCode });
        } catch (error) {
          resolve({ data: responseData, status: res.statusCode });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testSpecialsAPI() {
  console.log('🧪 测试Specials API和数据库\n');

  // 1. 直接查询数据库
  console.log('📊 1. 直接查询数据库 (使用service role key):');
  try {
    const result = await makeRequest('/rest/v1/specials?select=*&limit=0');
    const count = result.data?.length || 0;
    console.log(`  Specials数量: ${count}`);
    
    if (count > 0) {
      console.log('  前3条数据:');
      const sampleResult = await makeRequest('/rest/v1/specials?select=*&limit=3');
      sampleResult.data.forEach((special, index) => {
        console.log(`    ${index + 1}. ${special.title} - ${special.category} - 活跃: ${special.is_active}`);
      });
    }
  } catch (error) {
    console.log(`  ❌ 查询失败: ${error.message}`);
  }

  // 2. 测试API端点
  console.log('\n🌐 2. 测试API端点:');
  try {
    const apiResult = await makeRequest('/api/specials');
    if (apiResult.status === 200) {
      const apiData = apiResult.data;
      console.log(`  API返回: ${apiData.success ? '成功' : '失败'}`);
      if (apiData.success) {
        console.log(`  Specials数量: ${apiData.data?.specials?.length || 0}`);
        console.log(`  总数: ${apiData.data?.total || 0}`);
      } else {
        console.log(`  错误: ${apiData.message}`);
      }
    } else {
      console.log(`  ❌ API请求失败: ${apiResult.status}`);
    }
  } catch (error) {
    console.log(`  ❌ API测试失败: ${error.message}`);
  }

  // 3. 检查businesses表
  console.log('\n🏢 3. 检查businesses表:');
  try {
    const result = await makeRequest('/rest/v1/businesses?select=id,name&limit=3');
    const count = result.data?.length || 0;
    console.log(`  Businesses数量: ${count}`);
    if (count > 0) {
      result.data.forEach((business, index) => {
        console.log(`    ${index + 1}. ${business.name} (${business.id})`);
      });
    }
  } catch (error) {
    console.log(`  ❌ 查询失败: ${error.message}`);
  }

  console.log('\n✅ 测试完成！');
}

testSpecialsAPI().catch(error => {
  console.error('❌ 测试失败:', error.message);
  process.exit(1);
});



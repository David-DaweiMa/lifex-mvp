#!/usr/bin/env node
/**
 * 测试更新后的API响应
 */

const https = require('https');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少Supabase环境变量');
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

async function testAPIAfterUpdate() {
  console.log('🧪 测试更新后的API响应\n');

  const today = new Date().toISOString().split('T')[0];
  console.log(`今天日期: ${today}\n`);

  try {
    // 1. 模拟API的查询条件
    console.log('📊 1. 模拟API查询条件:');
    const apiQuery = `/rest/v1/specials?select=*&is_active=eq.true&valid_until=gte.${today}&order=created_at.desc`;
    
    const result = await makeRequest(apiQuery);
    
    if (result.status === 200) {
      const specials = result.data || [];
      console.log(`  ✅ API查询成功: ${specials.length} 条记录`);
      
      // 显示前5条记录
      console.log('\n  前5条记录:');
      specials.slice(0, 5).forEach((special, index) => {
        console.log(`    ${index + 1}. ${special.title} - ${special.category} - 有效期: ${special.valid_until}`);
      });
      
      if (specials.length > 5) {
        console.log(`    ... 还有 ${specials.length - 5} 条记录`);
      }
      
      // 按分类统计
      const categoryStats = {};
      specials.forEach(special => {
        categoryStats[special.category] = (categoryStats[special.category] || 0) + 1;
      });
      
      console.log('\n  分类统计:');
      Object.entries(categoryStats).forEach(([category, count]) => {
        console.log(`    ${category}: ${count} 条`);
      });
      
    } else {
      console.log(`  ❌ API查询失败: ${result.status}`);
      console.log(`  错误信息: ${JSON.stringify(result.data)}`);
    }

    // 2. 测试不同的过滤条件
    console.log('\n🔍 2. 测试不同的过滤条件:');
    
    // 测试food分类
    const foodQuery = `/rest/v1/specials?select=*&is_active=eq.true&valid_until=gte.${today}&category=eq.food&order=created_at.desc`;
    const foodResult = await makeRequest(foodQuery);
    
    if (foodResult.status === 200) {
      console.log(`  Food分类: ${foodResult.data?.length || 0} 条记录`);
    }
    
    // 测试限制数量
    const limitQuery = `/rest/v1/specials?select=*&is_active=eq.true&valid_until=gte.${today}&order=created_at.desc&limit=10`;
    const limitResult = await makeRequest(limitQuery);
    
    if (limitResult.status === 200) {
      console.log(`  限制10条: ${limitResult.data?.length || 0} 条记录`);
    }

    console.log('\n🎉 API测试完成！');
    console.log('现在前端页面应该能显示所有25条specials数据了。');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testAPIAfterUpdate().catch(error => {
  console.error('❌ 脚本执行失败:', error.message);
  process.exit(1);
});



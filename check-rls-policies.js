#!/usr/bin/env node
/**
 * 检查RLS策略和权限
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

async function checkRLSPolicies() {
  console.log('🔐 检查RLS策略和权限\n');

  // 1. 尝试不同的查询方式
  console.log('📊 1. 尝试不同的查询方式:');
  
  // 方式1: 基本查询
  try {
    const result1 = await makeRequest('/rest/v1/specials?select=*');
    console.log(`  基本查询: ${result1.status} - ${result1.data?.length || 0} 条记录`);
  } catch (error) {
    console.log(`  基本查询失败: ${error.message}`);
  }

  // 方式2: 带limit的查询
  try {
    const result2 = await makeRequest('/rest/v1/specials?select=*&limit=10');
    console.log(`  带limit查询: ${result2.status} - ${result2.data?.length || 0} 条记录`);
  } catch (error) {
    console.log(`  带limit查询失败: ${error.message}`);
  }

  // 方式3: 只查询count
  try {
    const result3 = await makeRequest('/rest/v1/specials?select=count');
    console.log(`  计数查询: ${result3.status} - ${JSON.stringify(result3.data)}`);
  } catch (error) {
    console.log(`  计数查询失败: ${error.message}`);
  }

  // 2. 检查表是否存在
  console.log('\n📋 2. 检查表结构:');
  try {
    const result = await makeRequest('/rest/v1/specials?select=id&limit=1');
    console.log(`  表存在检查: ${result.status}`);
    if (result.status === 200) {
      console.log('  ✅ specials表存在且可访问');
    } else {
      console.log(`  ❌ 表访问问题: ${result.status}`);
    }
  } catch (error) {
    console.log(`  ❌ 表检查失败: ${error.message}`);
  }

  // 3. 尝试插入测试数据
  console.log('\n🧪 3. 尝试插入测试数据:');
  try {
    const businessResult = await makeRequest('/rest/v1/businesses?select=id&limit=1');
    const businessId = businessResult.data?.[0]?.id;
    
    if (businessId) {
      const testData = {
        business_id: businessId,
        title: 'RLS Test Special',
        description: 'Testing RLS policies',
        original_price: 10.00,
        discount_price: 8.00,
        discount_percent: 20,
        category: 'food',
        location: 'Test Location',
        distance: '1.0km',
        rating: 4.0,
        review_count: 10,
        image_url: 'https://example.com/image.jpg',
        valid_from: '2025-01-18',
        valid_until: '2025-01-25',
        is_verified: true,
        is_active: true,
        views: 0,
        claimed: 0,
        max_claims: 10,
        tags: ['test', 'rls'],
        terms_conditions: 'Test terms'
      };

      const insertResult = await makeRequest('/rest/v1/specials', 'POST', testData);
      console.log(`  插入测试: ${insertResult.status}`);
      if (insertResult.status === 201) {
        console.log('  ✅ 插入成功');
        // 立即删除测试数据
        const deleteResult = await makeRequest(`/rest/v1/specials?id=eq.${insertResult.data?.[0]?.id}`, 'DELETE');
        console.log(`  删除测试: ${deleteResult.status}`);
      } else {
        console.log(`  ❌ 插入失败: ${JSON.stringify(insertResult.data)}`);
      }
    } else {
      console.log('  ❌ 没有可用的business_id');
    }
  } catch (error) {
    console.log(`  ❌ 插入测试失败: ${error.message}`);
  }

  console.log('\n✅ RLS检查完成！');
}

checkRLSPolicies().catch(error => {
  console.error('❌ 检查失败:', error.message);
  process.exit(1);
});



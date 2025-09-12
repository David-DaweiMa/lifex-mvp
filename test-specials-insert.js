#!/usr/bin/env node
/**
 * 测试Specials数据插入脚本
 * 验证SQL脚本的字段映射是否正确
 */

const https = require('https');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
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
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
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

async function testSpecialsInsert() {
  console.log('🧪 测试Specials数据插入脚本\n');

  // 1. 检查现有数据
  console.log('📊 1. 检查现有数据:');
  try {
    const result = await makeRequest('/rest/v1/specials?select=*&limit=0');
    const currentCount = result.data?.length || 0;
    console.log(`  当前specials数量: ${currentCount}`);
  } catch (error) {
    console.log(`  ❌ 检查失败: ${error.message}`);
  }

  // 2. 检查businesses表
  console.log('\n🏢 2. 检查businesses表:');
  try {
    const result = await makeRequest('/rest/v1/businesses?select=id,name,verification_status&limit=3');
    if (result.data && result.data.length > 0) {
      console.log('  现有商家:');
      result.data.forEach(business => {
        console.log(`    - ${business.name} (${business.id}) - 验证状态: ${business.verification_status}`);
      });
    } else {
      console.log('  ⚠️ 没有找到商家数据');
    }
  } catch (error) {
    console.log(`  ❌ 检查失败: ${error.message}`);
  }

  // 3. 测试插入一条数据
  console.log('\n🧪 3. 测试插入一条数据:');
  try {
    // 获取一个business_id
    const businessResult = await makeRequest('/rest/v1/businesses?select=id&limit=1');
    const businessId = businessResult.data?.[0]?.id;
    
    if (!businessId) {
      console.log('  ❌ 没有可用的business_id');
      return;
    }

    const testData = {
      business_id: businessId,
      title: 'Test Special - ' + new Date().toISOString(),
      description: 'This is a test special for validation',
      original_price: 20.00,
      discount_price: 15.00,
      discount_percent: 25,
      category: 'food',
      location: 'Test Location',
      distance: '1.0km',
      rating: 4.5,
      review_count: 100,
      image_url: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400',
      valid_from: '2025-01-18',
      valid_until: '2025-01-25',
      is_verified: true,
      is_active: true,
      views: 0,
      claimed: 0,
      max_claims: 50,
      tags: ['test', 'validation'],
      terms_conditions: 'This is a test special for validation purposes only.'
    };

    const insertResult = await makeRequest('/rest/v1/specials', 'POST', testData);
    
    if (insertResult.status === 201) {
      console.log('  ✅ 测试插入成功');
      console.log(`  插入的数据ID: ${insertResult.data?.[0]?.id}`);
      
      // 验证插入的数据
      const verifyResult = await makeRequest(`/rest/v1/specials?id=eq.${insertResult.data?.[0]?.id}&select=*`);
      if (verifyResult.data && verifyResult.data.length > 0) {
        const insertedData = verifyResult.data[0];
        console.log('  验证插入的数据:');
        console.log(`    - 标题: ${insertedData.title}`);
        console.log(`    - 类别: ${insertedData.category}`);
        console.log(`    - 验证状态: ${insertedData.is_verified}`);
        console.log(`    - 活跃状态: ${insertedData.is_active}`);
        console.log(`    - 标签: ${JSON.stringify(insertedData.tags)}`);
      }
    } else {
      console.log(`  ❌ 插入失败: ${insertResult.status}`);
      console.log(`  错误信息: ${JSON.stringify(insertResult.data)}`);
    }
  } catch (error) {
    console.log(`  ❌ 测试失败: ${error.message}`);
  }

  // 4. 检查最终数据
  console.log('\n📊 4. 检查最终数据:');
  try {
    const result = await makeRequest('/rest/v1/specials?select=*&limit=0');
    const finalCount = result.data?.length || 0;
    console.log(`  最终specials数量: ${finalCount}`);
  } catch (error) {
    console.log(`  ❌ 检查失败: ${error.message}`);
  }

  console.log('\n✅ 测试完成！');
  console.log('\n💡 如果测试成功，您可以运行 add-specials-data-final.sql 来插入20条数据');
}

testSpecialsInsert().catch(error => {
  console.error('❌ 测试失败:', error.message);
  process.exit(1);
});



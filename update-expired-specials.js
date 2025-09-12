#!/usr/bin/env node
/**
 * 更新已过期的specials数据的valid_until日期到11月底
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

async function updateExpiredSpecials() {
  console.log('📅 更新已过期的specials数据到11月底\n');

  const today = new Date().toISOString().split('T')[0];
  const newValidUntil = '2025-11-30';
  
  console.log(`今天日期: ${today}`);
  console.log(`新有效期: ${newValidUntil}\n`);

  try {
    // 1. 查看当前过期数据
    console.log('📊 1. 查看当前过期数据:');
    const expiredResult = await makeRequest(`/rest/v1/specials?select=id,title,valid_until,is_active&valid_until=lt.${today}`);
    const expiredSpecials = expiredResult.data || [];
    
    console.log(`  找到 ${expiredSpecials.length} 条已过期的数据:`);
    expiredSpecials.slice(0, 5).forEach(special => {
      console.log(`    - ${special.title}: ${special.valid_until} (活跃: ${special.is_active})`);
    });
    if (expiredSpecials.length > 5) {
      console.log(`    ... 还有 ${expiredSpecials.length - 5} 条`);
    }

    if (expiredSpecials.length === 0) {
      console.log('  ✅ 没有过期的数据需要更新');
      return;
    }

    // 2. 更新过期数据
    console.log(`\n🔄 2. 更新 ${expiredSpecials.length} 条过期数据到 ${newValidUntil}:`);
    
    const updateData = {
      valid_until: newValidUntil,
      updated_at: new Date().toISOString()
    };

    const updateResult = await makeRequest(
      `/rest/v1/specials?valid_until=lt.${today}`, 
      'PATCH', 
      updateData
    );

    if (updateResult.status === 200) {
      console.log(`  ✅ 成功更新 ${updateResult.data?.length || expiredSpecials.length} 条数据`);
    } else {
      console.log(`  ❌ 更新失败: ${updateResult.status}`);
      console.log(`  错误信息: ${JSON.stringify(updateResult.data)}`);
      return;
    }

    // 3. 验证更新结果
    console.log('\n✅ 3. 验证更新结果:');
    
    // 检查更新后的数据
    const updatedResult = await makeRequest(`/rest/v1/specials?select=id,title,valid_until,is_active&valid_until=eq.${newValidUntil}`);
    const updatedSpecials = updatedResult.data || [];
    
    console.log(`  更新到 ${newValidUntil} 的数据: ${updatedSpecials.length} 条`);
    
    // 检查是否还有过期数据
    const stillExpiredResult = await makeRequest(`/rest/v1/specials?select=count&valid_until=lt.${today}`);
    const stillExpiredCount = stillExpiredResult.data?.[0]?.count || 0;
    
    if (stillExpiredCount === 0) {
      console.log('  ✅ 没有剩余过期数据');
    } else {
      console.log(`  ⚠️ 还有 ${stillExpiredCount} 条过期数据`);
    }

    // 4. 显示所有活跃数据的有效期分布
    console.log('\n📊 4. 所有活跃数据的有效期分布:');
    const allActiveResult = await makeRequest('/rest/v1/specials?select=valid_until,is_active&is_active=eq.true');
    const allActiveSpecials = allActiveResult.data || [];
    
    const distribution = {
      '已过期': 0,
      '今天到期': 0,
      '7天内到期': 0,
      '30天内到期': 0,
      '30天以上有效': 0
    };
    
    allActiveSpecials.forEach(special => {
      const validUntil = new Date(special.valid_until);
      const todayDate = new Date(today);
      const diffDays = Math.ceil((validUntil - todayDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        distribution['已过期']++;
      } else if (diffDays === 0) {
        distribution['今天到期']++;
      } else if (diffDays <= 7) {
        distribution['7天内到期']++;
      } else if (diffDays <= 30) {
        distribution['30天内到期']++;
      } else {
        distribution['30天以上有效']++;
      }
    });
    
    Object.entries(distribution).forEach(([period, count]) => {
      if (count > 0) {
        console.log(`  ${period}: ${count} 条`);
      }
    });

    console.log('\n🎉 更新完成！现在API应该会返回所有活跃的specials数据了。');

  } catch (error) {
    console.error('❌ 更新失败:', error.message);
  }
}

updateExpiredSpecials().catch(error => {
  console.error('❌ 脚本执行失败:', error.message);
  process.exit(1);
});



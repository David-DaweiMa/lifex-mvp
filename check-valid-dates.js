#!/usr/bin/env node
/**
 * 检查specials的valid_until日期
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

async function checkValidDates() {
  console.log('📅 检查specials的valid_until日期\n');

  const today = new Date().toISOString().split('T')[0];
  console.log(`今天日期: ${today}\n`);

  // 1. 获取所有specials的valid_until日期
  try {
    const result = await makeRequest('/rest/v1/specials?select=id,title,valid_until,is_active');
    const specials = result.data || [];
    
    console.log(`📊 总共有 ${specials.length} 条specials记录\n`);
    
    // 按valid_until分组
    const expired = [];
    const active = [];
    const future = [];
    
    specials.forEach(special => {
      const validUntil = special.valid_until;
      if (validUntil < today) {
        expired.push(special);
      } else if (validUntil === today) {
        active.push(special);
      } else {
        future.push(special);
      }
    });
    
    console.log(`🔴 已过期 (${expired.length}条):`);
    expired.slice(0, 5).forEach(special => {
      console.log(`  - ${special.title}: ${special.valid_until} (活跃: ${special.is_active})`);
    });
    if (expired.length > 5) {
      console.log(`  ... 还有 ${expired.length - 5} 条`);
    }
    
    console.log(`\n🟡 今天到期 (${active.length}条):`);
    active.forEach(special => {
      console.log(`  - ${special.title}: ${special.valid_until} (活跃: ${special.is_active})`);
    });
    
    console.log(`\n🟢 未来有效 (${future.length}条):`);
    future.slice(0, 5).forEach(special => {
      console.log(`  - ${special.title}: ${special.valid_until} (活跃: ${special.is_active})`);
    });
    if (future.length > 5) {
      console.log(`  ... 还有 ${future.length - 5} 条`);
    }
    
    // 2. 模拟API的过滤条件
    console.log(`\n🔍 模拟API过滤条件:`);
    const apiFiltered = specials.filter(special => 
      special.is_active === true && 
      special.valid_until >= today
    );
    
    console.log(`API会返回 ${apiFiltered.length} 条记录 (is_active=true 且 valid_until>=${today})`);
    
    if (apiFiltered.length > 0) {
      console.log(`\n前3条API会返回的记录:`);
      apiFiltered.slice(0, 3).forEach(special => {
        console.log(`  - ${special.title}: ${special.valid_until}`);
      });
    }
    
  } catch (error) {
    console.log(`❌ 检查失败: ${error.message}`);
  }

  console.log('\n✅ 日期检查完成！');
}

checkValidDates().catch(error => {
  console.error('❌ 检查失败:', error.message);
  process.exit(1);
});



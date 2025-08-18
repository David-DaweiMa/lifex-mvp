const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🔍 检查数据库不一致问题...\n');

// 创建客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDatabaseDiscrepancy() {
  try {
    console.log('1️⃣ 检查环境变量...');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '已设置' : '未设置');
    
    // 2. 检查数据库连接
    console.log('\n2️⃣ 检查数据库连接...');
    const { data: testData, error: testError } = await supabase
      .from('email_confirmations')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ 数据库连接失败:', testError);
      return;
    } else {
      console.log('✅ 数据库连接正常');
    }
    
    // 3. 查询所有email_confirmations记录
    console.log('\n3️⃣ 查询所有email_confirmations记录...');
    const { data: allRecords, error: allRecordsError } = await supabase
      .from('email_confirmations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (allRecordsError) {
      console.error('❌ 查询所有记录失败:', allRecordsError);
      return;
    }
    
    console.log(`✅ 查询成功，找到 ${allRecords.length} 条记录`);
    
    if (allRecords.length > 0) {
      console.log('所有记录详情:');
      allRecords.forEach((record, index) => {
        console.log(`\n记录 ${index + 1}:`);
        console.log(`  ID: ${record.id}`);
        console.log(`  用户ID: ${record.user_id}`);
        console.log(`  邮箱: ${record.email}`);
        console.log(`  Token: ${record.token}`);
        console.log(`  类型: ${record.token_type}`);
        console.log(`  创建时间: ${record.created_at}`);
        console.log(`  过期时间: ${record.expires_at}`);
        console.log(`  已使用: ${record.used_at ? '是' : '否'}`);
      });
    } else {
      console.log('⚠️ 没有找到任何记录');
    }
    
    // 4. 检查表结构
    console.log('\n4️⃣ 检查表结构...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('email_confirmations')
      .select('*')
      .limit(0);
    
    if (tableError) {
      console.error('❌ 查询表结构失败:', tableError);
    } else {
      console.log('✅ 表结构正常');
    }
    
    // 5. 检查RLS策略
    console.log('\n5️⃣ 检查RLS策略...');
    
    // 尝试使用不同的角色查询
    console.log('使用service role查询...');
    const { data: serviceRoleData, error: serviceRoleError } = await supabase
      .from('email_confirmations')
      .select('count')
      .limit(1);
    
    if (serviceRoleError) {
      console.error('❌ Service role查询失败:', serviceRoleError);
    } else {
      console.log('✅ Service role查询成功');
    }
    
    // 6. 检查是否有数据但被RLS隐藏
    console.log('\n6️⃣ 检查RLS隐藏的数据...');
    
    // 尝试直接查询，不使用RLS
    const { data: directData, error: directError } = await supabase
      .rpc('get_email_confirmations_count');
    
    if (directError) {
      console.log('⚠️ 无法直接查询（可能需要创建函数）');
    } else {
      console.log('直接查询结果:', directData);
    }
    
    // 7. 创建测试数据并立即查询
    console.log('\n7️⃣ 创建测试数据并立即查询...');
    
    const testUserId = '4c65f8bd-a3a1-460a-ae10-8a6f26bdd59d'; // 使用现有用户ID
    const testEmail = 'discrepancy-test-' + Date.now() + '@example.com';
    const testToken = 'discrepancy-test-token-' + Date.now();
    
    console.log('创建测试数据...');
    console.log('用户ID:', testUserId);
    console.log('邮箱:', testEmail);
    console.log('Token:', testToken);
    
    const { data: insertData, error: insertError } = await supabase
      .from('email_confirmations')
      .insert({
        user_id: testUserId,
        email: testEmail,
        token: testToken,
        token_type: 'email_verification',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString()
      })
      .select();
    
    if (insertError) {
      console.error('❌ 插入测试数据失败:', insertError);
    } else {
      console.log('✅ 插入测试数据成功');
      console.log('插入的数据:', insertData);
      
      // 立即查询刚插入的数据
      console.log('\n立即查询刚插入的数据...');
      const { data: queryData, error: queryError } = await supabase
        .from('email_confirmations')
        .select('*')
        .eq('token', testToken)
        .single();
      
      if (queryError) {
        console.error('❌ 查询刚插入的数据失败:', queryError);
      } else {
        console.log('✅ 查询刚插入的数据成功');
        console.log('查询结果:', queryData);
      }
      
      // 查询所有数据
      console.log('\n查询所有数据...');
      const { data: allData, error: allError } = await supabase
        .from('email_confirmations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (allError) {
        console.error('❌ 查询所有数据失败:', allError);
      } else {
        console.log(`✅ 查询所有数据成功，共 ${allData.length} 条记录`);
        allData.forEach((record, index) => {
          console.log(`  ${index + 1}. ${record.email} - ${record.token} - ${record.created_at}`);
        });
      }
    }
    
    // 8. 总结
    console.log('\n📋 总结...');
    console.log('如果脚本显示有数据，但Supabase界面显示空，可能原因:');
    console.log('1. 浏览器缓存问题 - 刷新页面');
    console.log('2. 权限问题 - 检查当前用户角色');
    console.log('3. 环境问题 - 确认连接的是正确的数据库');
    console.log('4. RLS策略问题 - 检查行级安全策略');
    
  } catch (error) {
    console.error('❌ 检查过程中发生错误:', error);
  }
}

// 运行检查
checkDatabaseDiscrepancy().then(() => {
  console.log('\n🏁 检查完成');
  process.exit(0);
}).catch(error => {
  console.error('❌ 检查失败:', error);
  process.exit(1);
});

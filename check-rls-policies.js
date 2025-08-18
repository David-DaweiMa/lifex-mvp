const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🔍 检查email_confirmations表的RLS策略...\n');

// 创建客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRLSPolicies() {
  try {
    console.log('1️⃣ 检查RLS是否启用...');
    
    // 查询表是否启用了RLS
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('check_table_rls', { table_name: 'email_confirmations' });
    
    if (rlsError) {
      console.log('⚠️ 无法通过RPC查询RLS状态，尝试其他方法...');
    } else {
      console.log('RLS状态:', rlsStatus);
    }
    
    // 2. 查询RLS策略
    console.log('\n2️⃣ 查询RLS策略...');
    
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('schemaname', 'public')
      .eq('tablename', 'email_confirmations');
    
    if (policiesError) {
      console.error('❌ 查询RLS策略失败:', policiesError);
      console.log('尝试使用SQL查询...');
      
      // 使用SQL查询
      const { data: sqlPolicies, error: sqlError } = await supabase
        .rpc('get_table_policies', { table_name: 'email_confirmations' });
      
      if (sqlError) {
        console.error('❌ SQL查询也失败:', sqlError);
      } else {
        console.log('SQL查询结果:', sqlPolicies);
      }
    } else {
      console.log(`✅ 找到 ${policies.length} 个RLS策略`);
      
      if (policies.length === 0) {
        console.log('⚠️ 没有找到RLS策略，这意味着：');
        console.log('   - 要么RLS没有启用');
        console.log('   - 要么没有定义策略');
      } else {
        console.log('RLS策略详情:');
        policies.forEach((policy, index) => {
          console.log(`\n策略 ${index + 1}:`);
          console.log(`  名称: ${policy.policyname}`);
          console.log(`  命令: ${policy.cmd}`);
          console.log(`  角色: ${policy.roles}`);
          console.log(`  条件: ${policy.qual || '无'}`);
          console.log(`  检查: ${policy.with_check || '无'}`);
        });
      }
    }
    
    // 3. 检查表权限
    console.log('\n3️⃣ 检查表权限...');
    
    const { data: permissions, error: permissionsError } = await supabase
      .rpc('get_table_permissions', { table_name: 'email_confirmations' });
    
    if (permissionsError) {
      console.log('⚠️ 无法查询表权限，尝试直接测试...');
    } else {
      console.log('表权限:', permissions);
    }
    
    // 4. 测试不同角色的访问权限
    console.log('\n4️⃣ 测试不同角色的访问权限...');
    
    // 测试Service Role权限
    console.log('测试Service Role权限...');
    const { data: serviceRoleTest, error: serviceRoleError } = await supabase
      .from('email_confirmations')
      .select('count')
      .limit(1);
    
    if (serviceRoleError) {
      console.error('❌ Service Role查询失败:', serviceRoleError);
    } else {
      console.log('✅ Service Role查询成功');
    }
    
    // 测试插入权限
    console.log('\n测试Service Role插入权限...');
    const testToken = 'rls-test-token-' + Date.now();
    const testUserId = '4c65f8bd-a3a1-460a-ae10-8a6f26bdd59d';
    
    const { data: insertTest, error: insertError } = await supabase
      .from('email_confirmations')
      .insert({
        user_id: testUserId,
        email: 'rls-test@example.com',
        token: testToken,
        token_type: 'email_verification',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString()
      })
      .select();
    
    if (insertError) {
      console.error('❌ Service Role插入失败:', insertError);
      console.error('错误详情:', JSON.stringify(insertError, null, 2));
    } else {
      console.log('✅ Service Role插入成功');
      console.log('插入的数据:', insertTest);
      
      // 清理测试数据
      const { error: deleteError } = await supabase
        .from('email_confirmations')
        .delete()
        .eq('token', testToken);
      
      if (deleteError) {
        console.error('❌ 清理测试数据失败:', deleteError);
      } else {
        console.log('✅ 测试数据已清理');
      }
    }
    
    // 5. 检查表结构
    console.log('\n5️⃣ 检查表结构...');
    
    const { data: tableInfo, error: tableError } = await supabase
      .from('email_confirmations')
      .select('*')
      .limit(0);
    
    if (tableError) {
      console.error('❌ 查询表结构失败:', tableError);
    } else {
      console.log('✅ 表结构正常');
    }
    
    // 6. 总结
    console.log('\n📋 RLS策略检查总结...');
    console.log('如果Service Role插入测试成功，说明：');
    console.log('✅ 表结构正确');
    console.log('✅ Service Role权限正确');
    console.log('✅ RLS策略允许Service Role操作');
    console.log('');
    console.log('如果插入失败，可能原因：');
    console.log('❌ RLS策略阻止了插入');
    console.log('❌ 表结构问题');
    console.log('❌ Service Role权限不足');
    
  } catch (error) {
    console.error('❌ 检查过程中发生错误:', error);
  }
}

// 运行检查
checkRLSPolicies().then(() => {
  console.log('\n🏁 RLS策略检查完成');
  process.exit(0);
}).catch(error => {
  console.error('❌ 检查失败:', error);
  process.exit(1);
});

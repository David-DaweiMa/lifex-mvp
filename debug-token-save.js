const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🔍 调试Token保存问题...\n');

// 创建客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugTokenSave() {
  try {
    console.log('1️⃣ 检查环境变量...');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 已设置' : '❌ 未设置');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ 已设置' : '❌ 未设置');
    console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ 已设置' : '❌ 未设置');
    console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL || '未设置');
    
    // 2. 测试数据库连接
    console.log('\n2️⃣ 测试数据库连接...');
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
    
    // 3. 检查email_confirmations表结构
    console.log('\n3️⃣ 检查email_confirmations表结构...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('email_confirmations')
      .select('*')
      .limit(0);
    
    if (tableError) {
      console.error('❌ 查询表结构失败:', tableError);
      return;
    } else {
      console.log('✅ email_confirmations表存在');
    }
    
    // 4. 模拟token保存过程
    console.log('\n4️⃣ 模拟token保存过程...');
    
    const testUserId = 'test-user-id-' + Date.now();
    const testEmail = 'test-email-' + Date.now() + '@example.com';
    const testToken = 'test-token-' + Date.now();
    
    console.log('测试用户ID:', testUserId);
    console.log('测试邮箱:', testEmail);
    console.log('测试Token:', testToken);
    
    // 尝试保存token
    const { data: saveData, error: saveError } = await supabase
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
    
    if (saveError) {
      console.error('❌ Token保存失败:', saveError);
      console.error('错误详情:', JSON.stringify(saveError, null, 2));
      
      // 分析错误类型
      if (saveError.code === '23505') {
        console.log('🔍 错误分析: 唯一约束冲突');
      } else if (saveError.code === '23503') {
        console.log('🔍 错误分析: 外键约束失败');
      } else if (saveError.code === '23502') {
        console.log('🔍 错误分析: 非空约束失败');
      } else if (saveError.code === '42501') {
        console.log('🔍 错误分析: 权限不足');
      } else {
        console.log('🔍 错误分析: 其他数据库错误');
      }
    } else {
      console.log('✅ Token保存成功');
      console.log('保存的数据:', saveData);
    }
    
    // 5. 检查RLS策略
    console.log('\n5️⃣ 检查RLS策略...');
    
    // 尝试查询刚保存的数据
    const { data: queryData, error: queryError } = await supabase
      .from('email_confirmations')
      .select('*')
      .eq('token', testToken)
      .single();
    
    if (queryError) {
      console.error('❌ 查询刚保存的数据失败:', queryError);
      console.log('这可能表明RLS策略阻止了查询');
    } else {
      console.log('✅ 查询成功，RLS策略正常');
      console.log('查询结果:', queryData);
    }
    
    // 6. 清理测试数据
    console.log('\n6️⃣ 清理测试数据...');
    const { error: deleteError } = await supabase
      .from('email_confirmations')
      .delete()
      .eq('token', testToken);
    
    if (deleteError) {
      console.error('❌ 清理测试数据失败:', deleteError);
    } else {
      console.log('✅ 测试数据已清理');
    }
    
    // 7. 检查现有数据
    console.log('\n7️⃣ 检查现有email_confirmations数据...');
    const { data: existingData, error: existingError } = await supabase
      .from('email_confirmations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (existingError) {
      console.error('❌ 查询现有数据失败:', existingError);
    } else {
      console.log(`✅ 找到 ${existingData.length} 条现有记录`);
      if (existingData.length > 0) {
        console.log('最近的记录:');
        existingData.forEach((record, index) => {
          console.log(`   ${index + 1}. ${record.email} - ${record.token_type} - ${record.created_at}`);
        });
      }
    }
    
    // 8. 检查用户数据
    console.log('\n8️⃣ 检查用户数据...');
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ 查询用户失败:', usersError);
    } else {
      console.log(`✅ 找到 ${users.users.length} 个用户`);
      const recentUsers = users.users
        .filter(user => new Date(user.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)) // 最近24小时
        .slice(0, 3);
      
      if (recentUsers.length > 0) {
        console.log('最近24小时注册的用户:');
        recentUsers.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.email} - ${user.created_at} - 邮箱确认: ${user.email_confirmed_at ? '是' : '否'}`);
        });
      }
    }
    
    // 9. 总结分析
    console.log('\n📋 问题分析总结...');
    
    if (saveError) {
      console.log('🔍 主要问题: Token保存失败');
      console.log('可能原因:');
      console.log('1. 数据库权限问题');
      console.log('2. RLS策略阻止写入');
      console.log('3. 表结构问题');
      console.log('4. 环境变量配置问题');
      
      console.log('\n🎯 建议解决方案:');
      console.log('1. 检查Supabase RLS策略');
      console.log('2. 确认SUPABASE_SERVICE_ROLE_KEY权限');
      console.log('3. 检查email_confirmations表结构');
      console.log('4. 验证环境变量配置');
    } else {
      console.log('✅ Token保存功能正常');
      console.log('问题可能在于:');
      console.log('1. 生产环境代码未更新');
      console.log('2. 邮件发送流程中的错误处理');
      console.log('3. 注册API中的调用问题');
    }
    
  } catch (error) {
    console.error('❌ 调试过程中发生错误:', error);
  }
}

// 运行调试
debugTokenSave().then(() => {
  console.log('\n🏁 调试完成');
  process.exit(0);
}).catch(error => {
  console.error('❌ 调试失败:', error);
  process.exit(1);
});

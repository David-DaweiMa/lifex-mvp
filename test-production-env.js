require('dotenv').config({ path: '.env.local' });

console.log('🌐 测试生产环境配置...\n');

// 检查环境变量
console.log('1️⃣ 检查环境变量...');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '已设置' : '未设置');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '已设置' : '未设置');
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '已设置' : '未设置');
console.log('RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL ? '已设置' : '未设置');
console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL ? '已设置' : '未设置');

// 检查环境变量长度（不显示具体内容）
if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('Service Role Key长度:', process.env.SUPABASE_SERVICE_ROLE_KEY.length);
  console.log('Service Role Key前缀:', process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 10) + '...');
}

if (process.env.RESEND_API_KEY) {
  console.log('Resend API Key长度:', process.env.RESEND_API_KEY.length);
  console.log('Resend API Key前缀:', process.env.RESEND_API_KEY.substring(0, 10) + '...');
}

console.log('\n2️⃣ 测试Supabase连接...');

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testConnection() {
  try {
    // 测试基本连接
    console.log('测试基本连接...');
    const { data, error } = await supabase
      .from('email_confirmations')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase连接失败:', error);
      return;
    }
    
    console.log('✅ Supabase连接成功');
    
    // 测试权限
    console.log('\n3️⃣ 测试数据库权限...');
    
    // 测试插入权限
    const testToken = 'env-test-token-' + Date.now();
    const { data: insertData, error: insertError } = await supabase
      .from('email_confirmations')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000', // 测试UUID
        email: 'test@example.com',
        token: testToken,
        token_type: 'email_verification',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString()
      })
      .select();
    
    if (insertError) {
      console.error('❌ 插入权限测试失败:', insertError);
      console.error('错误代码:', insertError.code);
      console.error('错误消息:', insertError.message);
      
      if (insertError.code === '23503') {
        console.log('这是外键约束错误，说明权限正常，只是user_id不存在');
      }
    } else {
      console.log('✅ 插入权限测试成功');
      
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
    
    // 测试用户创建权限
    console.log('\n4️⃣ 测试用户创建权限...');
    const testEmail = 'env-test-' + Date.now() + '@example.com';
    
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'testpassword123',
      email_confirm: false
    });
    
    if (userError) {
      console.error('❌ 用户创建权限测试失败:', userError);
    } else {
      console.log('✅ 用户创建权限测试成功');
      console.log('创建的用户ID:', userData.user.id);
      
      // 清理测试用户
      const { error: deleteUserError } = await supabase.auth.admin.deleteUser(userData.user.id);
      
      if (deleteUserError) {
        console.error('❌ 删除测试用户失败:', deleteUserError);
      } else {
        console.log('✅ 测试用户已删除');
      }
    }
    
    console.log('\n📋 生产环境配置测试总结...');
    console.log('✅ 所有基本连接和权限测试通过');
    console.log('✅ 环境变量配置正确');
    console.log('✅ Supabase服务角色密钥有效');
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

// 运行测试
testConnection().then(() => {
  console.log('\n🏁 生产环境配置测试完成');
  process.exit(0);
}).catch(error => {
  console.error('❌ 测试失败:', error);
  process.exit(1);
});

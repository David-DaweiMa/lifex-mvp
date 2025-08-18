const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🔍 诊断测试开始...\n');

// 检查环境变量
console.log('1️⃣ 环境变量检查:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 已设置' : '❌ 未设置');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ 已设置' : '❌ 未设置');
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ 已设置' : '❌ 未设置');
console.log('RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL ? '✅ 已设置' : '❌ 未设置');
console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL ? '✅ 已设置' : '❌ 未设置');

// 创建客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runDiagnostics() {
  try {
    console.log('\n2️⃣ 数据库连接测试:');
    
    // 测试基本连接
    const { data, error } = await supabase
      .from('email_confirmations')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ 数据库连接失败:', error);
      return;
    }
    
    console.log('✅ 数据库连接成功');
    
    console.log('\n3️⃣ 用户创建测试:');
    
    const testEmail = 'diagnostic-test-' + Date.now() + '@example.com';
    const testPassword = 'testpassword123';
    
    // 创建用户
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: false
    });
    
    if (authError) {
      console.error('❌ 用户创建失败:', authError);
      return;
    }
    
    console.log('✅ 用户创建成功, ID:', authData.user.id);
    
    console.log('\n4️⃣ 配置文件检查:');
    
    // 检查配置文件
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    if (profileError) {
      console.error('❌ 配置文件查询失败:', profileError);
    } else {
      console.log('✅ 配置文件存在:', profileData.id);
    }
    
    console.log('\n5️⃣ Token保存测试:');
    
    const testToken = 'diagnostic-token-' + Date.now();
    
    const { data: tokenData, error: tokenError } = await supabase
      .from('email_confirmations')
      .insert({
        user_id: authData.user.id,
        email: testEmail,
        token: testToken,
        token_type: 'email_verification',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString()
      })
      .select();
    
    if (tokenError) {
      console.error('❌ Token保存失败:', tokenError);
      console.error('错误代码:', tokenError.code);
      console.error('错误消息:', tokenError.message);
    } else {
      console.log('✅ Token保存成功:', tokenData[0].id);
    }
    
    console.log('\n6️⃣ 清理测试数据:');
    
    // 清理Token
    if (tokenData) {
      const { error: deleteTokenError } = await supabase
        .from('email_confirmations')
        .delete()
        .eq('token', testToken);
      
      if (deleteTokenError) {
        console.error('❌ 清理Token失败:', deleteTokenError);
      } else {
        console.log('✅ Token已清理');
      }
    }
    
    // 清理用户
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(authData.user.id);
    
    if (deleteUserError) {
      console.error('❌ 清理用户失败:', deleteUserError);
    } else {
      console.log('✅ 用户已清理');
    }
    
    console.log('\n📋 诊断总结:');
    console.log('如果所有测试都通过，说明本地环境正常');
    console.log('如果Token保存失败，请检查错误代码和消息');
    console.log('如果生产环境有问题，请检查环境变量和网络连接');
    
  } catch (error) {
    console.error('❌ 诊断过程中发生错误:', error);
  }
}

// 运行诊断
runDiagnostics().then(() => {
  console.log('\n🏁 诊断测试完成');
  process.exit(0);
}).catch(error => {
  console.error('❌ 诊断失败:', error);
  process.exit(1);
});


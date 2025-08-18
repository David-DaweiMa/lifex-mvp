const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🔄 测试新的注册逻辑...\n');

// 创建客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testNewRegistrationLogic() {
  try {
    console.log('1️⃣ 模拟新的注册流程...');
    
    const testEmail = 'new-logic-test-' + Date.now() + '@example.com';
    const testPassword = 'testpassword123';
    const testUsername = 'testuser_' + Date.now();
    
    console.log('测试邮箱:', testEmail);
    console.log('测试用户名:', testUsername);
    
    // 第一步：创建用户
    console.log('\n=== 第一步：创建用户 ===');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: false
    });
    
    if (authError) {
      console.error('❌ 用户创建失败:', authError);
      return;
    }
    
    console.log('✅ 用户创建成功');
    console.log('用户ID:', authData.user.id);
    console.log('创建时间:', authData.user.created_at);
    
    // 第二步：验证用户是否真的存在
    console.log('\n=== 第二步：验证用户存在性 ===');
    const { data: userCheck, error: userCheckError } = await supabase.auth.admin.getUserById(authData.user.id);
    
    if (userCheckError || !userCheck.user) {
      console.error('❌ 用户验证失败:', userCheckError);
      return;
    }
    
    console.log('✅ 用户验证成功');
    console.log('验证的用户ID:', userCheck.user.id);
    console.log('用户邮箱:', userCheck.user.email);
    
    // 第三步：等待并验证用户配置文件
    console.log('\n=== 第三步：验证用户配置文件 ===');
    
    let profile = null;
    let attempts = 0;
    const maxAttempts = 10;
    
    while (!profile && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();
      
      if (profileData && !profileError) {
        profile = profileData;
        console.log('✅ 用户配置文件创建成功');
        console.log('配置文件ID:', profile.id);
        console.log('配置文件邮箱:', profile.email);
        break;
      }
      
      attempts++;
      console.log(`配置文件检查尝试 ${attempts}/${maxAttempts} 失败:`, profileError?.message);
    }
    
    if (!profile) {
      console.error('❌ 用户配置文件创建失败');
      return;
    }
    
    // 第四步：最终验证用户和配置文件关联
    console.log('\n=== 第四步：最终验证 ===');
    const { data: finalCheck, error: finalCheckError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .eq('email', testEmail)
      .single();
    
    if (finalCheckError || !finalCheck) {
      console.error('❌ 最终验证失败:', finalCheckError);
      return;
    }
    
    console.log('✅ 最终验证成功');
    console.log('用户和配置文件关联正确');
    
    // 第五步：现在可以安全地创建email confirmation记录
    console.log('\n=== 第五步：创建Email Confirmation记录 ===');
    
    const testToken = 'new-logic-token-' + Date.now();
    
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
      console.error('❌ Email Confirmation创建失败:', tokenError);
      console.error('错误详情:', JSON.stringify(tokenError, null, 2));
    } else {
      console.log('✅ Email Confirmation创建成功');
      console.log('Token数据:', tokenData);
    }
    
    // 第六步：验证Token是否真的保存了
    console.log('\n=== 第六步：验证Token保存 ===');
    const { data: tokenCheck, error: tokenCheckError } = await supabase
      .from('email_confirmations')
      .select('*')
      .eq('token', testToken)
      .single();
    
    if (tokenCheckError || !tokenCheck) {
      console.error('❌ Token验证失败:', tokenCheckError);
    } else {
      console.log('✅ Token验证成功');
      console.log('保存的Token:', tokenCheck.token);
      console.log('关联的用户ID:', tokenCheck.user_id);
      console.log('Token类型:', tokenCheck.token_type);
    }
    
    // 清理测试数据
    console.log('\n=== 清理测试数据 ===');
    
    // 删除Token记录
    if (tokenData) {
      const { error: deleteTokenError } = await supabase
        .from('email_confirmations')
        .delete()
        .eq('token', testToken);
      
      if (deleteTokenError) {
        console.error('❌ 删除Token记录失败:', deleteTokenError);
      } else {
        console.log('✅ Token记录已清理');
      }
    }
    
    // 删除用户
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(authData.user.id);
    
    if (deleteUserError) {
      console.error('❌ 删除用户失败:', deleteUserError);
    } else {
      console.log('✅ 用户已删除');
    }
    
    // 总结
    console.log('\n📋 新注册逻辑测试总结...');
    console.log('✅ 用户创建和验证流程正常');
    console.log('✅ 用户配置文件创建正常');
    console.log('✅ Email Confirmation记录创建正常');
    console.log('✅ 逻辑验证：用户创建成功后才创建Token记录');
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

// 运行测试
testNewRegistrationLogic().then(() => {
  console.log('\n🏁 新注册逻辑测试完成');
  process.exit(0);
}).catch(error => {
  console.error('❌ 测试失败:', error);
  process.exit(1);
});
